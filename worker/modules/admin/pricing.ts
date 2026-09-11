import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError, parseJsonObject } from '../../lib/http'
import { boundedInteger, enumValue, requiredString } from '../../lib/validation'

const STATUSES = ['draft', 'published', 'archived'] as const

function validSlug(value: unknown) {
  const slug = requiredString(value, 120)?.toLowerCase()
  return slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null
}

function mapPlan(row: Record<string, unknown>) {
  return {
    id: String(row.id), slug: String(row.slug), name: String(row.name), priceLabel: String(row.priceLabel),
    originalPriceLabel: row.originalPriceLabel ? String(row.originalPriceLabel) : null,
    description: row.description ? String(row.description) : null,
    payload: parseJsonObject(row.payloadJson as string | null), position: Number(row.position || 0), status: String(row.status),
    createdAt: Number(row.createdAt || 0), updatedAt: Number(row.updatedAt || 0),
  }
}

const SELECT = `SELECT id, slug, name, price_label AS priceLabel, original_price_label AS originalPriceLabel,
                       description, payload_json AS payloadJson, position, status,
                       created_at AS createdAt, updated_at AS updatedAt FROM pricing_plans`

export const adminPricingApi = new Hono<{ Bindings: Env }>()

adminPricingApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), STATUSES)
  const where = status ? ' WHERE status = ?' : ''
  const result = status ? await c.env.DB.prepare(`${SELECT}${where} ORDER BY position ASC, created_at DESC LIMIT 100`).bind(status).all<Record<string, unknown>>() : await c.env.DB.prepare(`${SELECT}${where} ORDER BY position ASC, created_at DESC LIMIT 100`).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapPlan) })
})

adminPricingApi.post('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: Record<string, unknown>
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu bảng giá không hợp lệ.') }
  const slug = validSlug(body.slug)
  const name = requiredString(body.name, 160)
  const priceLabel = requiredString(body.priceLabel, 120)
  const originalPriceLabel = body.originalPriceLabel ? requiredString(body.originalPriceLabel, 120) : null
  const description = body.description ? requiredString(body.description, 1000) : null
  const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {}
  const position = boundedInteger(body.position ?? 0, 0, 10000)
  const status = enumValue(body.status || 'draft', STATUSES)
  if (!slug || !name || !priceLabel || position === null || !status) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tên, giá và trạng thái là bắt buộc.')
  const id = crypto.randomUUID(); const now = Date.now()
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(`INSERT INTO pricing_plans (id, slug, name, price_label, original_price_label, description, payload_json, position, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, slug, name, priceLabel, originalPriceLabel, description, JSON.stringify(payload), position, status, now, now),
      auditStatement({ actorId: actor.id, action: 'pricing.created', entityType: 'pricing_plan', entityId: id, metadata: { status } }, now, c.env.DB),
    ])
  } catch (error) { if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug bảng giá đã tồn tại.'); throw error }
  return jsonData(c, { id, slug, name, priceLabel, status }, 201)
})

adminPricingApi.patch('/:planId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: Record<string, unknown>
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu bảng giá không hợp lệ.') }
  const id = c.req.param('planId')
  if (!await c.env.DB.prepare('SELECT id FROM pricing_plans WHERE id = ? LIMIT 1').bind(id).first()) return jsonError(c, 404, 'PLAN_NOT_FOUND', 'Không tìm thấy gói giá.')
  const slug = validSlug(body.slug); const name = requiredString(body.name, 160); const priceLabel = requiredString(body.priceLabel, 120)
  const originalPriceLabel = body.originalPriceLabel ? requiredString(body.originalPriceLabel, 120) : null
  const description = body.description ? requiredString(body.description, 1000) : null
  const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {}
  const position = boundedInteger(body.position ?? 0, 0, 10000); const status = enumValue(body.status, STATUSES)
  if (!slug || !name || !priceLabel || position === null || !status) return jsonError(c, 422, 'VALIDATION_ERROR', 'Slug, tên, giá và trạng thái là bắt buộc.')
  const now = Date.now()
  try {
    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE pricing_plans SET slug = ?, name = ?, price_label = ?, original_price_label = ?, description = ?, payload_json = ?, position = ?, status = ?, updated_at = ? WHERE id = ?').bind(slug, name, priceLabel, originalPriceLabel, description, JSON.stringify(payload), position, status, now, id),
      auditStatement({ actorId: actor.id, action: 'pricing.updated', entityType: 'pricing_plan', entityId: id, metadata: { status } }, now, c.env.DB),
    ])
  } catch (error) { if (String(error).toLowerCase().includes('unique')) return jsonError(c, 409, 'SLUG_EXISTS', 'Slug bảng giá đã tồn tại.'); throw error }
  return jsonData(c, { id, slug, name, priceLabel, status })
})

for (const [path, status, action] of [['/:planId/publish', 'published', 'pricing.published'], ['/:planId/archive', 'archived', 'pricing.archived'] as const]) {
  adminPricingApi.post(path, async c => {
    const actor = await requireAdmin(c.req.raw, c.env)
    if (actor instanceof Response) return actor
    const id = c.req.param('planId'); const existing = await c.env.DB.prepare('SELECT id FROM pricing_plans WHERE id = ? LIMIT 1').bind(id).first()
    if (!existing) return jsonError(c, 404, 'PLAN_NOT_FOUND', 'Không tìm thấy gói giá.')
    const now = Date.now()
    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE pricing_plans SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, id),
      auditStatement({ actorId: actor.id, action, entityType: 'pricing_plan', entityId: id, metadata: {} }, now, c.env.DB),
    ])
    return jsonData(c, { id, status })
  })
}

export const publicPricingApi = new Hono<{ Bindings: Env }>()
publicPricingApi.get('/', async c => {
  const result = await c.env.DB.prepare(`${SELECT} WHERE status = 'published' ORDER BY position ASC, created_at DESC LIMIT 20`).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results.map(mapPlan) }, 200, 'public, max-age=60, s-maxage=300')
})
