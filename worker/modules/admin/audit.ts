import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { jsonData, jsonError } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'

export const adminAuditApi = new Hono<{ Bindings: Env }>()

adminAuditApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const query = c.req.query('q')?.trim().slice(0, 120) || ''; const action = c.req.query('action')?.trim().slice(0, 120) || ''; const entityType = c.req.query('entityType')?.trim().slice(0, 80) || ''; const actorId = c.req.query('actorId')?.trim().slice(0, 128) || ''; const cursorValue = c.req.query('cursor'); const cursor = parseCursor(cursorValue); const limit = parseLimit(c.req.query('limit'))
  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')
  const where: string[] = []; const binds: Array<string | number> = []
  if (query) { where.push('(a.action LIKE ? OR a.entity_type LIKE ? OR a.entity_id LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search, search) }
  if (action) { where.push('a.action = ?'); binds.push(action) }
  if (entityType) { where.push('a.entity_type = ?'); binds.push(entityType) }
  if (actorId) { where.push('a.actor_id = ?'); binds.push(actorId) }
  if (cursor) { where.push('(a.created_at < ? OR (a.created_at = ? AND a.id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const result = await c.env.DB.prepare(`SELECT a.id, a.action, a.entity_type AS entityType, a.entity_id AS entityId, a.metadata_json AS metadataJson, a.actor_id AS actorId, u.name AS actorName, a.created_at AS createdAt FROM audit_logs a JOIN user u ON u.id = a.actor_id ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY a.created_at DESC, a.id DESC LIMIT ?`).bind(...binds, limit + 1).all<Record<string, unknown>>()
  const rows = result.results.map(row => ({ id: String(row.id), action: String(row.action), entityType: String(row.entityType), entityId: String(row.entityId), actorId: String(row.actorId), actorName: String(row.actorName), metadata: sanitizeMetadata(row.metadataJson), createdAt: Number(row.createdAt || 0) })); const hasMore = rows.length > limit; const items = hasMore ? rows.slice(0, limit) : rows; const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null })
})

function sanitizeMetadata(value: unknown): Record<string, string | number | boolean | null> {
  if (typeof value !== 'string') return {}
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const allowed: Record<string, string | number | boolean | null> = {}
    for (const [key, item] of Object.entries(parsed)) {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null) allowed[key] = typeof item === 'string' ? item.slice(0, 240) : item
    }
    return allowed
  } catch { return {} }
}
