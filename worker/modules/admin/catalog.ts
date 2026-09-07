import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'
import { boundedInteger, enumValue, requiredString } from '../../lib/validation'

const CATALOG_STATUSES = ['draft', 'published', 'archived'] as const
const ACCESS_TIERS = ['free', 'premium'] as const
const SCREENSHOT_VARIANTS = ['thumbnail', 'fullpage'] as const

function validSlug(value: unknown): string | null {
  const slug = requiredString(value, 120)?.toLowerCase()
  return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null
}

function parseJsonBody(request: Request) {
  const length = Number(request.headers.get('Content-Length'))
  if (Number.isFinite(length) && length > 128 * 1024) return null
  return request.json<Record<string, unknown>>().catch(() => null)
}

function mapCategory(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    position: Number(row.position || 0),
    status: String(row.status),
    templateCount: Number(row.templateCount || 0),
    createdAt: Number(row.createdAt || 0),
    updatedAt: Number(row.updatedAt || 0),
  }
}

function mapTemplate(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    categoryId: String(row.categoryId),
    categoryName: row.categoryName ? String(row.categoryName) : null,
    description: row.description ? String(row.description) : null,
    accessTier: String(row.accessTier),
    priceLabel: row.priceLabel ? String(row.priceLabel) : null,
    status: String(row.status),
    featured: Boolean(row.featured),
    sortOrder: Number(row.sortOrder || 0),
    screenshotCount: Number(row.screenshotCount || 0),
    readyScreenshotCount: Number(row.readyScreenshotCount || 0),
    createdAt: Number(row.createdAt || 0),
    updatedAt: Number(row.updatedAt || 0),
  }
}

const TEMPLATE_SELECT = `
  SELECT t.id, t.slug, t.name, t.category_id AS categoryId, c.name AS categoryName,
         t.description, t.access_tier AS accessTier, t.price_label AS priceLabel,
         t.status, t.featured, t.sort_order AS sortOrder,
         (SELECT COUNT(*) FROM template_screenshots ts WHERE ts.template_id = t.id) AS screenshotCount,
         (SELECT COUNT(*) FROM template_screenshots ts
          JOIN media_assets ma ON ma.id = ts.media_asset_id
          WHERE ts.template_id = t.id AND ma.status = 'ready' AND ma.bucket = 'public' AND ma.visibility = 'public') AS readyScreenshotCount,
         t.created_at AS createdAt, t.updated_at AS updatedAt
  FROM templates t
  LEFT JOIN template_categories c ON c.id = t.category_id
`

export const adminCatalogApi = new Hono<{ Bindings: Env }>()

adminCatalogApi.get('/categories', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), CATALOG_STATUSES)
  const query = c.req.query('q')?.trim().slice(0, 120) || ''
  const where: string[] = []
  const binds: string[] = []
  if (status) { where.push('c.status = ?'); binds.push(status) }
  if (query) { where.push('(c.name LIKE ? OR c.slug LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search) }
  const result = await c.env.DB.prepare(
    `SELECT c.id, c.slug, c.name, c.description, c.position, c.status,
            c.created_at AS createdAt, c.updated_at AS updatedAt,
            COUNT(t.id) AS templateCount
     FROM template_categories c
     LEFT JOIN templates t ON t.category_id = c.id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     GROUP BY c.id
     ORDER BY c.position ASC, c.created_at DESC
     LIMIT 100`,
  ).bind(...binds).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapCategory) })
})

adminCatalogApi.post('/categories', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await parseJsonBody(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu danh mục không hợp lệ.')
  const slug = validSlug(body.slug)
  const name = requiredString(body.name, 120)
  const description = body.description === null || body.description === undefined || body.description === '' ? null : requiredString(body.description, 1000)
  const position = boundedInteger(body.position ?? 0, 0, 10000)
  const status = enumValue(body.status || 'draft', CATALOG_STATUSES)
  if (!slug || !name || position === null || !status) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tên và trạng thái danh mục là bắt buộc.')
  const id = crypto.randomUUID()
  const now = Date.now()
  try {
    const create = c.env.DB.prepare(
      `INSERT INTO template_categories (id, slug, name, description, position, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, slug, name, description, position, status, now, now)
    const audit = auditStatement({ actorId: actor.id, action: 'catalog.category_created', entityType: 'template_category', entityId: id, metadata: { status } }, now, c.env.DB)
    await c.env.DB.batch([create, audit])
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug danh mục đã tồn tại.')
    throw error
  }
  return jsonData(c, { id, slug, name, description, position, status }, 201)
})

adminCatalogApi.patch('/categories/:categoryId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await parseJsonBody(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu danh mục không hợp lệ.')
  const categoryId = c.req.param('categoryId')
  const existing = await c.env.DB.prepare('SELECT id FROM template_categories WHERE id = ? LIMIT 1').bind(categoryId).first<{ id: string }>()
  if (!existing) return jsonError(c, 404, 'CATEGORY_NOT_FOUND', 'Không tìm thấy danh mục.')
  const slug = validSlug(body.slug)
  const name = requiredString(body.name, 120)
  const description = body.description === null || body.description === undefined || body.description === '' ? null : requiredString(body.description, 1000)
  const position = boundedInteger(body.position ?? 0, 0, 10000)
  const status = enumValue(body.status, CATALOG_STATUSES)
  if (!slug || !name || position === null || !status) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tên và trạng thái danh mục là bắt buộc.')
  const now = Date.now()
  try {
    const update = c.env.DB.prepare(
      `UPDATE template_categories SET slug = ?, name = ?, description = ?, position = ?, status = ?, updated_at = ? WHERE id = ?`,
    ).bind(slug, name, description, position, status, now, categoryId)
    const audit = auditStatement({ actorId: actor.id, action: 'catalog.category_updated', entityType: 'template_category', entityId: categoryId, metadata: { status } }, now, c.env.DB)
    await c.env.DB.batch([update, audit])
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug danh mục đã tồn tại.')
    throw error
  }
  return jsonData(c, { id: categoryId, slug, name, description, position, status })
})

adminCatalogApi.get('/templates', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), CATALOG_STATUSES)
  const categoryId = c.req.query('categoryId')?.trim()
  const query = c.req.query('q')?.trim().slice(0, 120) || ''
  const cursorValue = c.req.query('cursor')
  const cursor = parseCursor(cursorValue)
  const limit = parseLimit(c.req.query('limit'))
  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')
  const where: string[] = []
  const binds: Array<string | number> = []
  if (status) { where.push('t.status = ?'); binds.push(status) }
  if (categoryId) { where.push('t.category_id = ?'); binds.push(categoryId) }
  if (query) { where.push('(t.name LIKE ? OR t.slug LIKE ? OR t.description LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search, search) }
  if (cursor) { where.push('(t.created_at < ? OR (t.created_at = ? AND t.id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const result = await c.env.DB.prepare(`${TEMPLATE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY t.created_at DESC, t.id DESC LIMIT ?`).bind(...binds, limit + 1).all<Record<string, unknown>>()
  const rows = result.results.map(mapTemplate)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null })
})

adminCatalogApi.post('/templates', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await parseJsonBody(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu template không hợp lệ.')
  const slug = validSlug(body.slug)
  const name = requiredString(body.name, 160)
  const categoryId = requiredString(body.categoryId, 128)
  const description = body.description === null || body.description === undefined || body.description === '' ? null : requiredString(body.description, 2000)
  const accessTier = enumValue(body.accessTier || 'free', ACCESS_TIERS)
  const priceLabel = body.priceLabel === null || body.priceLabel === undefined || body.priceLabel === '' ? null : requiredString(body.priceLabel, 120)
  const status = enumValue(body.status || 'draft', CATALOG_STATUSES)
  const featured = Boolean(body.featured)
  const sortOrder = boundedInteger(body.sortOrder ?? 0, 0, 100000)
  if (!slug || !name || !categoryId || !accessTier || !status || sortOrder === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tên, danh mục và trạng thái template là bắt buộc.')
  const category = await c.env.DB.prepare('SELECT id FROM template_categories WHERE id = ? LIMIT 1').bind(categoryId).first<{ id: string }>()
  if (!category) return jsonError(c, 422, 'CATEGORY_NOT_FOUND', 'Danh mục không tồn tại.')
  const id = crypto.randomUUID()
  const now = Date.now()
  try {
    const create = c.env.DB.prepare(
      `INSERT INTO templates (id, slug, name, category_id, description, access_tier, price_label, status, featured, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(id, slug, name, categoryId, description, accessTier, priceLabel, status, featured ? 1 : 0, sortOrder, now, now)
    const audit = auditStatement({ actorId: actor.id, action: 'catalog.template_created', entityType: 'template', entityId: id, metadata: { status, accessTier, featured } }, now, c.env.DB)
    await c.env.DB.batch([create, audit])
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug template đã tồn tại.')
    throw error
  }
  return jsonData(c, { id, slug, name, categoryId, description, accessTier, priceLabel, status, featured, sortOrder }, 201)
})

adminCatalogApi.patch('/templates/:templateId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await parseJsonBody(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu template không hợp lệ.')
  const templateId = c.req.param('templateId')
  const existing = await c.env.DB.prepare('SELECT id FROM templates WHERE id = ? LIMIT 1').bind(templateId).first<{ id: string }>()
  if (!existing) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy template.')
  const slug = validSlug(body.slug)
  const name = requiredString(body.name, 160)
  const categoryId = requiredString(body.categoryId, 128)
  const description = body.description === null || body.description === undefined || body.description === '' ? null : requiredString(body.description, 2000)
  const accessTier = enumValue(body.accessTier || 'free', ACCESS_TIERS)
  const priceLabel = body.priceLabel === null || body.priceLabel === undefined || body.priceLabel === '' ? null : requiredString(body.priceLabel, 120)
  const status = enumValue(body.status || 'draft', CATALOG_STATUSES)
  const featured = Boolean(body.featured)
  const sortOrder = boundedInteger(body.sortOrder ?? 0, 0, 100000)
  if (!slug || !name || !categoryId || !accessTier || !status || sortOrder === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tên, danh mục và trạng thái template là bắt buộc.')
  const category = await c.env.DB.prepare('SELECT id FROM template_categories WHERE id = ? LIMIT 1').bind(categoryId).first<{ id: string }>()
  if (!category) return jsonError(c, 422, 'CATEGORY_NOT_FOUND', 'Danh mục không tồn tại.')
  const now = Date.now()
  try {
    const update = c.env.DB.prepare(
      `UPDATE templates SET slug = ?, name = ?, category_id = ?, description = ?, access_tier = ?, price_label = ?, status = ?, featured = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
    ).bind(slug, name, categoryId, description, accessTier, priceLabel, status, featured ? 1 : 0, sortOrder, now, templateId)
    const audit = auditStatement({ actorId: actor.id, action: 'catalog.template_updated', entityType: 'template', entityId: templateId, metadata: { status, accessTier, featured } }, now, c.env.DB)
    await c.env.DB.batch([update, audit])
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug template đã tồn tại.')
    throw error
  }
  return jsonData(c, { id: templateId, slug, name, categoryId, description, accessTier, priceLabel, status, featured, sortOrder })
})

adminCatalogApi.post('/templates/:templateId/screenshots', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await parseJsonBody(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu screenshot không hợp lệ.')
  const templateId = c.req.param('templateId')
  const mediaAssetId = requiredString(body.mediaAssetId, 128)
  const variant = enumValue(body.variant, SCREENSHOT_VARIANTS)
  const position = boundedInteger(body.position ?? 0, 0, 1000)
  if (!mediaAssetId || !variant || position === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Media, variant và thứ tự là bắt buộc.')
  const template = await c.env.DB.prepare('SELECT id FROM templates WHERE id = ? LIMIT 1').bind(templateId).first()
  const media = await c.env.DB.prepare("SELECT id FROM media_assets WHERE id = ? AND bucket = 'public' AND visibility = 'public' AND status = 'ready' LIMIT 1").bind(mediaAssetId).first()
  if (!template) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy template.')
  if (!media) return jsonError(c, 422, 'MEDIA_NOT_READY', 'Screenshot phải là media public đã sẵn sàng.')
  const screenshotId = crypto.randomUUID()
  const now = Date.now()
  try {
    const create = c.env.DB.prepare(
      `INSERT INTO template_screenshots (id, template_id, media_asset_id, variant, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).bind(screenshotId, templateId, mediaAssetId, variant, position, now, now)
    const audit = auditStatement({ actorId: actor.id, action: 'catalog.screenshot_attached', entityType: 'template', entityId: templateId, metadata: { variant, position } }, now, c.env.DB)
    await c.env.DB.batch([create, audit])
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SCREENSHOT_EXISTS', 'Screenshot đã được gắn vào template.')
    throw error
  }
  return jsonData(c, { id: screenshotId, templateId, mediaAssetId, variant, position }, 201)
})

adminCatalogApi.delete('/templates/:templateId/screenshots/:screenshotId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const templateId = c.req.param('templateId')
  const screenshotId = c.req.param('screenshotId')
  const existing = await c.env.DB.prepare('SELECT id FROM template_screenshots WHERE id = ? AND template_id = ? LIMIT 1').bind(screenshotId, templateId).first()
  if (!existing) return jsonError(c, 404, 'SCREENSHOT_NOT_FOUND', 'Không tìm thấy screenshot.')
  const now = Date.now()
  const remove = c.env.DB.prepare('DELETE FROM template_screenshots WHERE id = ? AND template_id = ?').bind(screenshotId, templateId)
  const audit = auditStatement({ actorId: actor.id, action: 'catalog.screenshot_detached', entityType: 'template', entityId: templateId, metadata: {} }, now, c.env.DB)
  await c.env.DB.batch([remove, audit])
  return jsonData(c, { id: screenshotId, status: 'deleted' })
})

adminCatalogApi.post('/templates/:templateId/publish', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const templateId = c.req.param('templateId')
  const ready = await c.env.DB.prepare(
    `SELECT t.id, t.category_id AS categoryId, c.status AS categoryStatus,
            COUNT(ts.id) AS readyScreenshots
     FROM templates t
     LEFT JOIN template_categories c ON c.id = t.category_id
     LEFT JOIN template_screenshots ts ON ts.template_id = t.id
     LEFT JOIN media_assets ma ON ma.id = ts.media_asset_id AND ma.bucket = 'public' AND ma.visibility = 'public' AND ma.status = 'ready'
     WHERE t.id = ?
     GROUP BY t.id LIMIT 1`,
  ).bind(templateId).first<{ id: string; categoryId: string; categoryStatus: string | null; readyScreenshots: number }>()
  if (!ready) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy template.')
  if (ready.categoryStatus !== 'published') return jsonError(c, 422, 'CATEGORY_NOT_PUBLISHED', 'Danh mục phải được publish trước.')
  if (Number(ready.readyScreenshots || 0) < 1) return jsonError(c, 422, 'SCREENSHOT_REQUIRED', 'Template cần ít nhất một screenshot public sẵn sàng.')
  const now = Date.now()
  const update = c.env.DB.prepare("UPDATE templates SET status = 'published', updated_at = ? WHERE id = ?").bind(now, templateId)
  const audit = auditStatement({ actorId: actor.id, action: 'catalog.template_published', entityType: 'template', entityId: templateId, metadata: {} }, now, c.env.DB)
  await c.env.DB.batch([update, audit])
  return jsonData(c, { id: templateId, status: 'published' })
})

adminCatalogApi.post('/templates/:templateId/archive', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const templateId = c.req.param('templateId')
  const existing = await c.env.DB.prepare('SELECT id FROM templates WHERE id = ? LIMIT 1').bind(templateId).first()
  if (!existing) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy template.')
  const now = Date.now()
  const update = c.env.DB.prepare("UPDATE templates SET status = 'archived', updated_at = ? WHERE id = ?").bind(now, templateId)
  const audit = auditStatement({ actorId: actor.id, action: 'catalog.template_archived', entityType: 'template', entityId: templateId, metadata: {} }, now, c.env.DB)
  await c.env.DB.batch([update, audit])
  return jsonData(c, { id: templateId, status: 'archived' })
})
