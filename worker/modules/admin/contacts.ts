import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'
import { enumValue, requiredString, boundedInteger } from '../../lib/validation'

const STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const

function mapContact(row: Record<string, unknown>) {
  return { id: String(row.id), name: String(row.name), email: String(row.email), phone: row.phone ? String(row.phone) : null, topic: String(row.topic), message: String(row.message), status: String(row.status), assignedTo: row.assignedTo ? String(row.assignedTo) : null, assignedName: row.assignedName ? String(row.assignedName) : null, createdAt: Number(row.createdAt || 0), updatedAt: Number(row.updatedAt || 0) }
}

export const adminContactsApi = new Hono<{ Bindings: Env }>()

adminContactsApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), STATUSES); const assignedTo = c.req.query('assignedTo')?.trim(); const query = c.req.query('q')?.trim().slice(0, 120) || ''; const cursorValue = c.req.query('cursor'); const cursor = parseCursor(cursorValue); const limit = parseLimit(c.req.query('limit'))
  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')
  const where: string[] = []; const binds: Array<string | number> = []
  if (status) { where.push('c.status = ?'); binds.push(status) }
  if (assignedTo) { where.push('c.assigned_to = ?'); binds.push(assignedTo) }
  if (query) { where.push('(c.name LIKE ? OR c.email LIKE ? OR c.topic LIKE ? OR c.message LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search, search, search) }
  if (cursor) { where.push('(c.created_at < ? OR (c.created_at = ? AND c.id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const result = await c.env.DB.prepare(`SELECT c.id, c.name, c.email, c.phone, c.topic, c.message, c.status, c.assigned_to AS assignedTo, u.name AS assignedName, c.created_at AS createdAt, c.updated_at AS updatedAt FROM contact_submissions c LEFT JOIN user u ON u.id = c.assigned_to ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.created_at DESC, c.id DESC LIMIT ?`).bind(...binds, limit + 1).all<Record<string, unknown>>()
  const rows = result.results.map(mapContact); const hasMore = rows.length > limit; const items = hasMore ? rows.slice(0, limit) : rows; const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null })
})

adminContactsApi.patch('/:contactId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  let body: { status?: unknown; assignedTo?: unknown; updatedAt?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu contact không hợp lệ.') }
  const status = enumValue(body.status, STATUSES); const assignedTo = body.assignedTo === null || body.assignedTo === '' || body.assignedTo === undefined ? null : requiredString(body.assignedTo, 128); const expectedUpdatedAt = body.updatedAt === undefined ? null : boundedInteger(body.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (!status || (body.assignedTo !== null && body.assignedTo !== undefined && body.assignedTo !== '' && !assignedTo) || (body.updatedAt !== undefined && expectedUpdatedAt === null)) return jsonError(c, 422, 'VALIDATION_ERROR', 'Trạng thái hoặc admin phụ trách không hợp lệ.')
  if (assignedTo && !await c.env.DB.prepare("SELECT id FROM user WHERE id = ? AND role = 'admin' AND status = 'active' LIMIT 1").bind(assignedTo).first()) return jsonError(c, 422, 'INVALID_ASSIGNEE', 'Admin phụ trách không tồn tại hoặc đã bị khóa.')
  const current = await c.env.DB.prepare('SELECT id, updated_at AS updatedAt FROM contact_submissions WHERE id = ? LIMIT 1').bind(c.req.param('contactId')).first<{ id: string; updatedAt: number }>()
  if (!current) return jsonError(c, 404, 'CONTACT_NOT_FOUND', 'Không tìm thấy contact.')
  const now = Date.now(); const updateSql = expectedUpdatedAt === null ? 'UPDATE contact_submissions SET status = ?, assigned_to = ?, updated_at = ? WHERE id = ?' : 'UPDATE contact_submissions SET status = ?, assigned_to = ?, updated_at = ? WHERE id = ? AND updated_at = ?'; const update = expectedUpdatedAt === null ? c.env.DB.prepare(updateSql).bind(status, assignedTo, now, current.id) : c.env.DB.prepare(updateSql).bind(status, assignedTo, now, current.id, expectedUpdatedAt)
  const audit = auditStatement({ actorId: actor.id, action: 'contact.updated', entityType: 'contact_submission', entityId: current.id, metadata: { status, hasAssignee: Boolean(assignedTo) } }, now, c.env.DB)
  const result = await c.env.DB.batch([update, audit]); if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'CONTACT_CONFLICT', 'Contact đã được cập nhật. Vui lòng tải lại.')
  return jsonData(c, { id: current.id, status, assignedTo, updatedAt: now })
})
