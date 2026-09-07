import { Hono } from 'hono'
import { jsonData } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'

const PUBLIC_LIMIT = 50

function mapPublicTemplate(row: Record<string, unknown>) {
  const screenshots = typeof row.screenshotsJson === 'string' ? JSON.parse(row.screenshotsJson) as unknown : []
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: { id: String(row.categoryId), slug: String(row.categorySlug), name: String(row.categoryName) },
    description: row.description ? String(row.description) : null,
    accessTier: String(row.accessTier),
    priceLabel: row.priceLabel ? String(row.priceLabel) : null,
    featured: Boolean(row.featured),
    sortOrder: Number(row.sortOrder || 0),
    screenshots: Array.isArray(screenshots) ? screenshots : [],
  }
}

const PUBLIC_TEMPLATE_SELECT = `
  SELECT t.id, t.slug, t.name, t.description, t.access_tier AS accessTier,
         t.price_label AS priceLabel, t.featured, t.sort_order AS sortOrder,
         t.created_at AS createdAt,
         c.id AS categoryId, c.slug AS categorySlug, c.name AS categoryName,
         COALESCE((SELECT json_group_array(json_object(
           'id', ts.id,
           'variant', ts.variant,
           'position', ts.position,
           'url', '/api/v1/media/public/' || ma.id,
           'altText', COALESCE(ma.alt_text, t.name)
         ))
         FROM template_screenshots ts
         JOIN media_assets ma ON ma.id = ts.media_asset_id
         WHERE ts.template_id = t.id AND ma.bucket = 'public' AND ma.visibility = 'public' AND ma.status = 'ready'), '[]') AS screenshotsJson
  FROM templates t
  JOIN template_categories c ON c.id = t.category_id AND c.status = 'published'
`

export const publicCatalogApi = new Hono<{ Bindings: Env }>()

publicCatalogApi.get('/', async c => {
  const category = c.req.query('category')?.trim().slice(0, 120)
  const tier = c.req.query('tier')?.trim()
  const featured = c.req.query('featured')
  const query = c.req.query('q')?.trim().slice(0, 120)
  const cursorValue = c.req.query('cursor')
  const cursor = parseCursor(cursorValue)
  const limit = Math.min(parseLimit(c.req.query('limit')), PUBLIC_LIMIT)
  const where = ["t.status = 'published'", "EXISTS (SELECT 1 FROM template_screenshots ready_ts JOIN media_assets ready_ma ON ready_ma.id = ready_ts.media_asset_id WHERE ready_ts.template_id = t.id AND ready_ma.bucket = 'public' AND ready_ma.visibility = 'public' AND ready_ma.status = 'ready')"]
  const binds: Array<string | number> = []
  if (category) { where.push('c.slug = ?'); binds.push(category) }
  if (tier === 'free' || tier === 'premium') { where.push('t.access_tier = ?'); binds.push(tier) }
  if (featured === 'true') where.push('t.featured = 1')
  if (query) { where.push('(t.name LIKE ? OR t.description LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search) }
  if (cursor) { where.push('(t.created_at < ? OR (t.created_at = ? AND t.id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const result = await c.env.DB.prepare(`${PUBLIC_TEMPLATE_SELECT} WHERE ${where.join(' AND ')} ORDER BY t.sort_order ASC, t.created_at DESC, t.id DESC LIMIT ?`).bind(...binds, limit + 1).all<Record<string, unknown>>()
  const rows = result.results.map(mapPublicTemplate)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(Number((result.results[items.length - 1] as Record<string, unknown>).createdAt || 0), String(last.id)) : null }, 200, 'public, max-age=60, s-maxage=300')
})

publicCatalogApi.get('/:slug', async c => {
  const row = await c.env.DB.prepare(`${PUBLIC_TEMPLATE_SELECT} WHERE t.slug = ? AND t.status = 'published' AND EXISTS (SELECT 1 FROM template_screenshots ready_ts JOIN media_assets ready_ma ON ready_ma.id = ready_ts.media_asset_id WHERE ready_ts.template_id = t.id AND ready_ma.bucket = 'public' AND ready_ma.visibility = 'public' AND ready_ma.status = 'ready') LIMIT 1`).bind(c.req.param('slug')).first<Record<string, unknown>>()
  if (!row) return c.json({ error: { code: 'TEMPLATE_NOT_FOUND', message: 'Không tìm thấy mẫu thiệp.' } }, 404)
  return jsonData(c, mapPublicTemplate(row), 200, 'public, max-age=60, s-maxage=300')
})
