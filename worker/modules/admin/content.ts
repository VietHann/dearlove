import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError, parseJsonObject } from '../../lib/http'
import { enumValue, requiredString, boundedInteger } from '../../lib/validation'
import { DEFAULT_HOME_SNAPSHOT, validateSnapshot, type ContentSnapshot } from '../../lib/content-schema'

interface PageDefinition {
  key: string
  slug: string
  title: string
  snapshot: ContentSnapshot
}

const PAGE_DEFINITIONS: PageDefinition[] = [
  { key: 'home', slug: '/', title: 'Trang chủ', snapshot: DEFAULT_HOME_SNAPSHOT },
  { key: 'pricing', slug: '/pricing', title: 'Bảng giá', snapshot: { sections: [] } },
  { key: 'templates', slug: '/templates', title: 'Catalog mẫu thiệp', snapshot: { sections: [] } },
  { key: 'blog', slug: '/blog', title: 'Blog', snapshot: { sections: [] } },
  { key: 'contact', slug: '/contact', title: 'Liên hệ', snapshot: { sections: [] } },
]

const SETTING_KEYS = ['brand_name', 'hotline', 'email', 'domain', 'default_seo_title', 'default_seo_description', 'social_links', 'logo_asset_id'] as const

function pageDefinition(key: string): PageDefinition {
  return PAGE_DEFINITIONS.find(page => page.key === key) || { key, slug: `/${key}`, title: key, snapshot: { sections: [] } }
}

async function ensurePage(db: D1Database, key: string, authorId: string) {
  const existing = await db.prepare('SELECT id, key, slug, title, seo_title AS seoTitle, seo_description AS seoDescription, status, published_revision_id AS publishedRevisionId, created_at AS createdAt, updated_at AS updatedAt FROM pages WHERE key = ? LIMIT 1').bind(key).first<Record<string, unknown>>()
  if (existing) return existing
  const definition = pageDefinition(key)
  const now = Date.now()
  const pageId = crypto.randomUUID()
  const revisionId = crypto.randomUUID()
  const snapshot = definition.snapshot as ContentSnapshot
  const statements: D1PreparedStatement[] = [
    db.prepare(
      `INSERT INTO pages (id, key, slug, title, status, published_revision_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'draft', NULL, ?, ?)`,
    ).bind(pageId, definition.key, definition.slug, definition.title, now, now),
    db.prepare(
      `INSERT INTO content_revisions (id, page_id, version, snapshot_json, author_id, publish_note, published_at, created_at, updated_at)
       VALUES (?, ?, 1, ?, ?, NULL, NULL, ?, ?)`,
    ).bind(revisionId, pageId, JSON.stringify(snapshot), authorId, now, now),
  ]
  for (const section of snapshot.sections) {
    statements.push(db.prepare(
      `INSERT INTO page_sections (id, revision_id, stable_key, block_type, position, visible, payload_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), revisionId, String(section.stableKey), String(section.blockType), Number(section.position), section.visible ? 1 : 0, JSON.stringify(section.payload), now, now))
  }
  await db.batch(statements)
  return {
    id: pageId,
    key: definition.key,
    slug: definition.slug,
    title: definition.title,
    seoTitle: null,
    seoDescription: null,
    status: 'draft',
    publishedRevisionId: null,
    createdAt: now,
    updatedAt: now,
  }
}

function mapPage(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    key: String(row.key),
    slug: String(row.slug),
    title: String(row.title),
    seoTitle: row.seoTitle ? String(row.seoTitle) : null,
    seoDescription: row.seoDescription ? String(row.seoDescription) : null,
    status: String(row.status),
    publishedRevisionId: row.publishedRevisionId ? String(row.publishedRevisionId) : null,
    createdAt: Number(row.createdAt || 0),
    updatedAt: Number(row.updatedAt || 0),
  }
}

async function loadDocument(db: D1Database, key: string, actorId: string) {
  const pageRow = await ensurePage(db, key, actorId)
  const page = mapPage(pageRow)
  const revisions = await db.prepare(
    `SELECT r.id, r.version, r.snapshot_json AS snapshotJson, r.author_id AS authorId,
            u.name AS authorName, r.publish_note AS publishNote, r.published_at AS publishedAt,
            r.created_at AS createdAt, r.updated_at AS updatedAt
     FROM content_revisions r JOIN user u ON u.id = r.author_id
     WHERE r.page_id = ? ORDER BY r.version DESC LIMIT 20`,
  ).bind(String(page.id)).all<Record<string, unknown>>()
  const mappedRevisions = revisions.results.map(revision => ({
    id: String(revision.id),
    version: Number(revision.version),
    snapshot: parseJsonObject<ContentSnapshot>(revision.snapshotJson as string | null),
    authorId: String(revision.authorId),
    authorName: String(revision.authorName || 'Admin'),
    publishNote: revision.publishNote ? String(revision.publishNote) : null,
    publishedAt: revision.publishedAt === null || revision.publishedAt === undefined ? null : Number(revision.publishedAt),
    createdAt: Number(revision.createdAt || 0),
    updatedAt: Number(revision.updatedAt || 0),
  }))
  return { page, revisions: mappedRevisions, draft: mappedRevisions[0] || null, published: mappedRevisions.find(revision => revision.id === page.publishedRevisionId) || null }
}

function parseJsonValue(value: string | null | undefined): unknown {
  if (!value) return null
  try { return JSON.parse(value) as unknown } catch { return null }
}

function validateSettings(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const settings = value as Record<string, unknown>
  const clean: Record<string, unknown> = {}
  for (const [key, settingValue] of Object.entries(settings)) {
    if (!SETTING_KEYS.includes(key as typeof SETTING_KEYS[number])) return null
    if (key === 'social_links') {
      if (!settingValue || typeof settingValue !== 'object' || Array.isArray(settingValue)) return null
      const social = settingValue as Record<string, unknown>
      const cleanSocial: Record<string, string> = {}
      for (const [socialKey, socialValue] of Object.entries(social)) {
        if (!/^[a-z0-9_-]{1,30}$/.test(socialKey) || typeof socialValue !== 'string' || socialValue.length > 300 || !/^https:\/\//i.test(socialValue)) return null
        cleanSocial[socialKey] = socialValue
      }
      clean[key] = cleanSocial
    } else if (key === 'logo_asset_id') {
      if (settingValue !== null && (typeof settingValue !== 'string' || !/^[a-zA-Z0-9_-]{10,128}$/.test(settingValue))) return null
      clean[key] = settingValue
    } else if (typeof settingValue !== 'string' || settingValue.length > (key.includes('description') ? 1000 : 320)) {
      return null
    } else {
      clean[key] = settingValue.trim()
    }
  }
  return clean
}

export const adminContentApi = new Hono<{ Bindings: Env }>()

adminContentApi.get('/pages', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  for (const definition of PAGE_DEFINITIONS) await ensurePage(c.env.DB, definition.key, actor.id)
  const result = await c.env.DB.prepare(
    `SELECT id, key, slug, title, seo_title AS seoTitle, seo_description AS seoDescription,
            status, published_revision_id AS publishedRevisionId, created_at AS createdAt, updated_at AS updatedAt
     FROM pages ORDER BY key ASC LIMIT 100`,
  ).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapPage) })
})

adminContentApi.get('/pages/:pageKey', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  return jsonData(c, await loadDocument(c.env.DB, c.req.param('pageKey'), actor.id))
})

adminContentApi.put('/pages/:pageKey/draft', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const contentLength = Number(c.req.header('Content-Length'))
  if (Number.isFinite(contentLength) && contentLength > 256 * 1024) return jsonError(c, 413, 'BODY_TOO_LARGE', 'Nội dung trang vượt quá giới hạn.')
  let body: { title?: unknown; seoTitle?: unknown; seoDescription?: unknown; sections?: unknown; expectedVersion?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu trang không hợp lệ.') }
  const title = requiredString(body.title, 160)
  const seoTitle = body.seoTitle === null || body.seoTitle === undefined || body.seoTitle === '' ? null : requiredString(body.seoTitle, 160)
  const seoDescription = body.seoDescription === null || body.seoDescription === undefined || body.seoDescription === '' ? null : requiredString(body.seoDescription, 320)
  const expectedVersion = boundedInteger(body.expectedVersion, 1, 1000000)
  const validated = validateSnapshot({ sections: body.sections })
  if (!title || expectedVersion === null || (body.seoTitle && !seoTitle) || (body.seoDescription && !seoDescription)) return jsonError(c, 422, 'VALIDATION_ERROR', 'Tiêu đề hoặc phiên bản không hợp lệ.')
  if ('message' in validated) return jsonError(c, 422, 'VALIDATION_ERROR', validated.message)

  const page = await ensurePage(c.env.DB, c.req.param('pageKey'), actor.id)
  const latest = await c.env.DB.prepare('SELECT id, version FROM content_revisions WHERE page_id = ? ORDER BY version DESC LIMIT 1').bind(String(page.id)).first<{ id: string; version: number }>()
  if (!latest || latest.version !== expectedVersion) return jsonError(c, 409, 'CONTENT_CONFLICT', 'Nội dung đã được admin khác cập nhật. Vui lòng tải lại.')
  const now = Date.now()
  const revisionId = crypto.randomUUID()
  const snapshot = validated.snapshot
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare('UPDATE pages SET title = ?, seo_title = ?, seo_description = ?, status = \'draft\', updated_at = ? WHERE id = ?').bind(title, seoTitle, seoDescription, now, String(page.id)),
    c.env.DB.prepare(
      `INSERT INTO content_revisions (id, page_id, version, snapshot_json, author_id, publish_note, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
    ).bind(revisionId, String(page.id), expectedVersion + 1, JSON.stringify(snapshot), actor.id, now, now),
  ]
  for (const section of snapshot.sections) statements.push(c.env.DB.prepare(
    `INSERT INTO page_sections (id, revision_id, stable_key, block_type, position, visible, payload_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), revisionId, String(section.stableKey), String(section.blockType), Number(section.position), section.visible ? 1 : 0, JSON.stringify(section.payload), now, now))
  statements.push(auditStatement({ actorId: actor.id, action: 'content.draft_saved', entityType: 'page', entityId: String(page.id), metadata: { version: expectedVersion + 1 } }, now, c.env.DB))
  await c.env.DB.batch(statements)
  return jsonData(c, await loadDocument(c.env.DB, c.req.param('pageKey'), actor.id))
})

adminContentApi.post('/pages/:pageKey/publish', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: { expectedVersion?: unknown; publishNote?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu publish không hợp lệ.') }
  const expectedVersion = boundedInteger(body.expectedVersion, 1, 1000000)
  const publishNote = body.publishNote === null || body.publishNote === undefined || body.publishNote === '' ? null : requiredString(body.publishNote, 500)
  if (expectedVersion === null || (body.publishNote && !publishNote)) return jsonError(c, 422, 'VALIDATION_ERROR', 'Phiên bản publish không hợp lệ.')
  const page = await ensurePage(c.env.DB, c.req.param('pageKey'), actor.id)
  const revision = await c.env.DB.prepare('SELECT id, snapshot_json AS snapshotJson, version FROM content_revisions WHERE page_id = ? AND version = ? LIMIT 1').bind(String(page.id), expectedVersion).first<{ id: string; snapshotJson: string; version: number }>()
  if (!revision) return jsonError(c, 409, 'CONTENT_CONFLICT', 'Phiên bản nội dung không còn tồn tại. Vui lòng tải lại.')
  const validated = validateSnapshot(parseJsonObject(revision.snapshotJson))
  if ('message' in validated) return jsonError(c, 422, 'VALIDATION_ERROR', validated.message)
  const now = Date.now()
  const markRevision = c.env.DB.prepare('UPDATE content_revisions SET publish_note = ?, published_at = ?, updated_at = ? WHERE id = ?').bind(publishNote, now, now, revision.id)
  const markPage = c.env.DB.prepare("UPDATE pages SET status = 'published', published_revision_id = ?, updated_at = ? WHERE id = ?").bind(revision.id, now, String(page.id))
  const audit = auditStatement({ actorId: actor.id, action: 'content.published', entityType: 'page', entityId: String(page.id), metadata: { version: expectedVersion } }, now, c.env.DB)
  await c.env.DB.batch([markRevision, markPage, audit])
  return jsonData(c, await loadDocument(c.env.DB, c.req.param('pageKey'), actor.id))
})

adminContentApi.post('/pages/:pageKey/rollback', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: { revisionId?: unknown; publishNote?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu rollback không hợp lệ.') }
  const revisionId = requiredString(body.revisionId, 128)
  const publishNote = body.publishNote === null || body.publishNote === undefined || body.publishNote === '' ? 'Rollback nội dung' : requiredString(body.publishNote, 500)
  if (!revisionId || !publishNote) return jsonError(c, 422, 'VALIDATION_ERROR', 'Revision và ghi chú rollback là bắt buộc.')
  const page = await ensurePage(c.env.DB, c.req.param('pageKey'), actor.id)
  const selected = await c.env.DB.prepare('SELECT id, snapshot_json AS snapshotJson FROM content_revisions WHERE id = ? AND page_id = ? LIMIT 1').bind(revisionId, String(page.id)).first<{ id: string; snapshotJson: string }>()
  const latest = await c.env.DB.prepare('SELECT version FROM content_revisions WHERE page_id = ? ORDER BY version DESC LIMIT 1').bind(String(page.id)).first<{ version: number }>()
  if (!selected || !latest) return jsonError(c, 404, 'REVISION_NOT_FOUND', 'Không tìm thấy revision.')
  const validated = validateSnapshot(parseJsonObject(selected.snapshotJson))
  if ('message' in validated) return jsonError(c, 422, 'VALIDATION_ERROR', validated.message)
  const now = Date.now()
  const newRevisionId = crypto.randomUUID()
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare('INSERT INTO content_revisions (id, page_id, version, snapshot_json, author_id, publish_note, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(newRevisionId, String(page.id), Number(latest.version) + 1, JSON.stringify(validated.snapshot), actor.id, publishNote, now, now, now),
  ]
  for (const section of validated.snapshot.sections) statements.push(c.env.DB.prepare(
    `INSERT INTO page_sections (id, revision_id, stable_key, block_type, position, visible, payload_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), newRevisionId, section.stableKey, section.blockType, section.position, section.visible ? 1 : 0, JSON.stringify(section.payload), now, now))
  statements.push(c.env.DB.prepare("UPDATE pages SET status = 'published', published_revision_id = ?, updated_at = ? WHERE id = ?").bind(newRevisionId, now, String(page.id)))
  statements.push(auditStatement({ actorId: actor.id, action: 'content.rollback', entityType: 'page', entityId: String(page.id), metadata: { revisionVersion: Number(latest.version) + 1 } }, now, c.env.DB))
  await c.env.DB.batch(statements)
  return jsonData(c, await loadDocument(c.env.DB, c.req.param('pageKey'), actor.id))
})

adminContentApi.get('/settings', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const result = await c.env.DB.prepare('SELECT key, value_json AS valueJson, updated_at AS updatedAt FROM site_settings ORDER BY key ASC LIMIT 100').all<Record<string, unknown>>()
  const settings: Record<string, unknown> = {}
  for (const row of result.results) settings[String(row.key)] = parseJsonValue(row.valueJson as string | null)
  return jsonData(c, { settings, updatedAt: Math.max(0, ...result.results.map(row => Number(row.updatedAt || 0))) })
})

adminContentApi.put('/settings', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: { settings?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu settings không hợp lệ.') }
  const settings = validateSettings(body.settings)
  if (!settings) return jsonError(c, 422, 'VALIDATION_ERROR', 'Settings chứa key hoặc giá trị không hợp lệ.')
  const now = Date.now()
  const statements: D1PreparedStatement[] = []
  for (const [key, value] of Object.entries(settings)) statements.push(c.env.DB.prepare(
    `INSERT INTO site_settings (id, key, value_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`,
  ).bind(crypto.randomUUID(), key, JSON.stringify(value), now, now))
  statements.push(auditStatement({ actorId: actor.id, action: 'content.settings_updated', entityType: 'site_settings', entityId: 'global', metadata: { count: Object.keys(settings).length } }, now, c.env.DB))
  await c.env.DB.batch(statements)
  return jsonData(c, { settings, updatedAt: now })
})
