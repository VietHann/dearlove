import type { Context } from 'hono'
import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError } from '../../lib/http'
import { sanitizeMarkdown } from '../../lib/markdown'
import { boundedInteger, enumValue, requiredString } from '../../lib/validation'

const STATUSES = ['draft', 'published', 'archived'] as const

function validSlug(value: unknown) {
  const slug = requiredString(value, 140)?.toLowerCase()
  return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null
}

function mapCategory(row: Record<string, unknown>) {
  return { id: String(row.id), slug: String(row.slug), name: String(row.name), createdAt: Number(row.createdAt || 0), updatedAt: Number(row.updatedAt || 0) }
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) as unknown } catch { return value }
}

function mapPost(row: Record<string, unknown>) {
  return {
    id: String(row.id), slug: String(row.slug), title: String(row.title), excerpt: row.excerpt ? String(row.excerpt) : null,
    content: sanitizeMarkdown(String(parseJsonValue(row.content) || '')), category: row.categoryId ? { id: String(row.categoryId), slug: String(row.categorySlug), name: String(row.categoryName) } : null,
    author: { id: String(row.authorId), name: String(row.authorName || 'Dearlove') }, coverUrl: row.coverAssetId ? `/api/v1/media/public/${String(row.coverAssetId)}` : null,
    status: String(row.status), publishedAt: row.publishedAt ? Number(row.publishedAt) : null, seoTitle: row.seoTitle ? String(row.seoTitle) : null,
    seoDescription: row.seoDescription ? String(row.seoDescription) : null, createdAt: Number(row.createdAt || 0), updatedAt: Number(row.updatedAt || 0),
  }
}

const POST_SELECT = `SELECT p.id, p.slug, p.title, p.excerpt, p.content_json AS content, p.category_id AS categoryId,
                           bc.slug AS categorySlug, bc.name AS categoryName, p.author_id AS authorId, u.name AS authorName,
                           p.cover_asset_id AS coverAssetId, p.status, p.published_at AS publishedAt,
                           p.seo_title AS seoTitle, p.seo_description AS seoDescription,
                           p.created_at AS createdAt, p.updated_at AS updatedAt
                    FROM blog_posts p
                    JOIN user u ON u.id = p.author_id
                    LEFT JOIN blog_categories bc ON bc.id = p.category_id`

export const adminBlogApi = new Hono<{ Bindings: Env }>()

adminBlogApi.get('/categories', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const result = await c.env.DB.prepare('SELECT id, slug, name, created_at AS createdAt, updated_at AS updatedAt FROM blog_categories ORDER BY name ASC LIMIT 100').all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapCategory) })
})

adminBlogApi.post('/categories', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: { slug?: unknown; name?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu chuyên mục không hợp lệ.') }
  const slug = validSlug(body.slug); const name = requiredString(body.name, 120)
  if (!slug || !name) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug và tên chuyên mục là bắt buộc.')
  const id = crypto.randomUUID(); const now = Date.now()
  try { await c.env.DB.batch([c.env.DB.prepare('INSERT INTO blog_categories (id, slug, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').bind(id, slug, name, now, now), auditStatement({ actorId: actor.id, action: 'blog.category_created', entityType: 'blog_category', entityId: id, metadata: {} }, now, c.env.DB)]) }
  catch (error) { if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug chuyên mục đã tồn tại.'); throw error }
  return jsonData(c, { id, slug, name }, 201)
})

adminBlogApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), STATUSES); const query = c.req.query('q')?.trim().slice(0, 120) || ''
  const where: string[] = []; const binds: string[] = []
  if (status) { where.push('p.status = ?'); binds.push(status) }
  if (query) { where.push('(p.title LIKE ? OR p.slug LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search) }
  const result = await c.env.DB.prepare(`${POST_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT 100`).bind(...binds).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapPost) })
})

async function postBody(c: Context<{ Bindings: Env }>) {
  let body: Record<string, unknown>
  try { body = await c.req.json() } catch { return { error: jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu bài viết không hợp lệ.') } }
  const slug = validSlug(body.slug); const title = requiredString(body.title, 220); const excerpt = body.excerpt ? requiredString(body.excerpt, 800) : null
  const content = requiredString(body.content, 30000); const categoryId = body.categoryId ? requiredString(body.categoryId, 128) : null; const coverAssetId = body.coverAssetId ? requiredString(body.coverAssetId, 128) : null
  const status = enumValue(body.status || 'draft', STATUSES); const seoTitle = body.seoTitle ? requiredString(body.seoTitle, 160) : null; const seoDescription = body.seoDescription ? requiredString(body.seoDescription, 320) : null; const publishedAt = body.publishedAt ? Date.parse(String(body.publishedAt)) : null
  if (!slug || !title || !content || !status || (body.excerpt && !excerpt) || (body.seoTitle && !seoTitle) || (body.seoDescription && !seoDescription) || (body.publishedAt && (!publishedAt || Number.isNaN(publishedAt)))) return { error: jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tiêu đề, nội dung và trạng thái là bắt buộc.') }
  if (categoryId && !await c.env.DB.prepare('SELECT id FROM blog_categories WHERE id = ? LIMIT 1').bind(categoryId).first()) return { error: jsonError(c, 422, 'CATEGORY_NOT_FOUND', 'Chuyên mục không tồn tại.') }
  if (coverAssetId && !await c.env.DB.prepare("SELECT id FROM media_assets WHERE id = ? AND bucket = 'public' AND visibility = 'public' AND status = 'ready' LIMIT 1").bind(coverAssetId).first()) return { error: jsonError(c, 422, 'COVER_NOT_READY', 'Ảnh cover phải là media public đã sẵn sàng.') }
  return { value: { slug, title, excerpt, content: sanitizeMarkdown(content), categoryId, coverAssetId, status, seoTitle, seoDescription, publishedAt: publishedAt ? new Date(publishedAt).getTime() : null } }
}

adminBlogApi.post('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const parsed = await postBody(c); if ('error' in parsed) return parsed.error
  const id = crypto.randomUUID(); const now = Date.now(); const value = parsed.value
  try { await c.env.DB.batch([c.env.DB.prepare('INSERT INTO blog_posts (id, slug, title, excerpt, content_json, category_id, author_id, cover_asset_id, status, published_at, seo_title, seo_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, value.slug, value.title, value.excerpt, JSON.stringify(value.content), value.categoryId, actor.id, value.coverAssetId, value.status, value.status === 'published' ? value.publishedAt || now : null, value.seoTitle, value.seoDescription, now, now), auditStatement({ actorId: actor.id, action: 'blog.created', entityType: 'blog_post', entityId: id, metadata: { status: value.status } }, now, c.env.DB)]) }
  catch (error) { if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug bài viết đã tồn tại.'); throw error }
  return jsonData(c, { id, slug: value.slug, title: value.title, status: value.status }, 201)
})

adminBlogApi.patch('/:postId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const id = c.req.param('postId'); if (!await c.env.DB.prepare('SELECT id FROM blog_posts WHERE id = ? LIMIT 1').bind(id).first()) return jsonError(c, 404, 'POST_NOT_FOUND', 'Không tìm thấy bài viết.')
  const parsed = await postBody(c); if ('error' in parsed) return parsed.error
  const value = parsed.value; const now = Date.now()
  try { await c.env.DB.batch([c.env.DB.prepare('UPDATE blog_posts SET slug = ?, title = ?, excerpt = ?, content_json = ?, category_id = ?, cover_asset_id = ?, status = ?, published_at = ?, seo_title = ?, seo_description = ?, updated_at = ? WHERE id = ?').bind(value.slug, value.title, value.excerpt, JSON.stringify(value.content), value.categoryId, value.coverAssetId, value.status, value.status === 'published' ? value.publishedAt || now : null, value.seoTitle, value.seoDescription, now, id), auditStatement({ actorId: actor.id, action: 'blog.updated', entityType: 'blog_post', entityId: id, metadata: { status: value.status } }, now, c.env.DB)]) }
  catch (error) { if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug bài viết đã tồn tại.'); throw error }
  return jsonData(c, { id, slug: value.slug, title: value.title, status: value.status })
})

for (const [path, status, action] of [['/:postId/publish', 'published', 'blog.published'] as const, ['/:postId/archive', 'archived', 'blog.archived'] as const]) {
  adminBlogApi.post(path, async c => {
    const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
    const id = c.req.param('postId'); if (!await c.env.DB.prepare('SELECT id FROM blog_posts WHERE id = ? LIMIT 1').bind(id).first()) return jsonError(c, 404, 'POST_NOT_FOUND', 'Không tìm thấy bài viết.')
    const now = Date.now(); await c.env.DB.batch([c.env.DB.prepare(`UPDATE blog_posts SET status = ?, published_at = ?, updated_at = ? WHERE id = ?`).bind(status, status === 'published' ? now : null, now, id), auditStatement({ actorId: actor.id, action, entityType: 'blog_post', entityId: id, metadata: {} }, now, c.env.DB)])
    return jsonData(c, { id, status })
  })
}

export const publicBlogApi = new Hono<{ Bindings: Env }>()
publicBlogApi.get('/', async c => {
  const result = await c.env.DB.prepare(`${POST_SELECT} WHERE p.status = 'published' ORDER BY p.published_at DESC, p.created_at DESC LIMIT 50`).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapPost) }, 200, 'public, max-age=60, s-maxage=300')
})
publicBlogApi.get('/:slug', async c => {
  const row = await c.env.DB.prepare(`${POST_SELECT} WHERE p.status = 'published' AND p.slug = ? LIMIT 1`).bind(c.req.param('slug')).first<Record<string, unknown>>()
  if (!row) return jsonError(c, 404, 'POST_NOT_FOUND', 'Không tìm thấy bài viết.')
  return jsonData(c, mapPost(row), 200, 'public, max-age=60, s-maxage=300')
})
