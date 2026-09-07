import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'
import { enumValue, boundedInteger } from '../../lib/validation'

const STATUSES = ['pending', 'active', 'unsubscribed'] as const

export const adminNewsletterApi = new Hono<{ Bindings: Env }>()

adminNewsletterApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), STATUSES); const cursorValue = c.req.query('cursor'); const cursor = parseCursor(cursorValue); const limit = parseLimit(c.req.query('limit'))
  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')
  const where: string[] = []; const binds: Array<string | number> = []
  if (status) { where.push('status = ?'); binds.push(status) }
  if (cursor) { where.push('(created_at < ? OR (created_at = ? AND id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const result = await c.env.DB.prepare(`SELECT id, email, status, consent_at AS consentAt, unsubscribed_at AS unsubscribedAt, created_at AS createdAt, updated_at AS updatedAt FROM newsletter_subscribers ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC LIMIT ?`).bind(...binds, limit + 1).all<Record<string, unknown>>()
  const rows = result.results.map(row => ({ id: String(row.id), email: String(row.email), status: String(row.status), consentAt: Number(row.consentAt || 0), unsubscribedAt: row.unsubscribedAt ? Number(row.unsubscribedAt) : null, createdAt: Number(row.createdAt || 0), updatedAt: Number(row.updatedAt || 0) })); const hasMore = rows.length > limit; const items = hasMore ? rows.slice(0, limit) : rows; const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null })
})

adminNewsletterApi.patch('/:subscriberId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  let body: { status?: unknown; updatedAt?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu subscriber không hợp lệ.') }
  const status = enumValue(body.status, STATUSES); const updatedAt = boundedInteger(body.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (!status || updatedAt === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Trạng thái và phiên bản là bắt buộc.')
  const now = Date.now(); const update = c.env.DB.prepare('UPDATE newsletter_subscribers SET status = ?, unsubscribed_at = ?, updated_at = ? WHERE id = ? AND updated_at = ?').bind(status, status === 'unsubscribed' ? now : null, now, c.req.param('subscriberId'), updatedAt); const audit = auditStatement({ actorId: actor.id, action: 'newsletter.updated', entityType: 'newsletter_subscriber', entityId: c.req.param('subscriberId'), metadata: { status } }, now, c.env.DB); const result = await c.env.DB.batch([update, audit]); if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'NEWSLETTER_CONFLICT', 'Subscriber đã được cập nhật. Vui lòng tải lại.')
  return jsonData(c, { id: c.req.param('subscriberId'), status, updatedAt: now })
})
