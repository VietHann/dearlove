import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'
import { boundedInteger, enumValue } from '../../lib/validation'

const STATUSES = ['active', 'suspended'] as const
const ROLES = ['customer', 'admin'] as const

export const adminUsersApi = new Hono<{ Bindings: Env }>()

adminUsersApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const status = enumValue(c.req.query('status'), STATUSES); const role = enumValue(c.req.query('role'), ROLES); const query = c.req.query('q')?.trim().slice(0, 120) || ''; const cursorValue = c.req.query('cursor'); const cursor = parseCursor(cursorValue); const limit = parseLimit(c.req.query('limit'))
  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')
  const where: string[] = []; const binds: Array<string | number> = []
  if (status) { where.push('u.status = ?'); binds.push(status) }
  if (role) { where.push('u.role = ?'); binds.push(role) }
  if (query) { where.push('(u.name LIKE ? OR u.email LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search) }
  if (cursor) { where.push('(u.created_at < ? OR (u.created_at = ? AND u.id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const result = await c.env.DB.prepare(`SELECT u.id, u.name, u.email, u.email_verified AS emailVerified, u.role, u.status, u.phone, u.created_at AS createdAt, u.updated_at AS updatedAt, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = u.id) AS orderCount FROM user u ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY u.created_at DESC, u.id DESC LIMIT ?`).bind(...binds, limit + 1).all<Record<string, unknown>>()
  const rows = result.results.map(row => ({ id: String(row.id), name: String(row.name), email: String(row.email), emailVerified: Boolean(row.emailVerified), role: String(row.role), status: String(row.status), phone: row.phone ? String(row.phone) : null, orderCount: Number(row.orderCount || 0), createdAt: Number(row.createdAt || 0), updatedAt: Number(row.updatedAt || 0) })); const hasMore = rows.length > limit; const items = hasMore ? rows.slice(0, limit) : rows; const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null })
})

adminUsersApi.patch('/:userId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env); if (actor instanceof Response) return actor
  const targetId = c.req.param('userId')
  let body: { status?: unknown; role?: unknown; updatedAt?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu user không hợp lệ.') }
  const status = enumValue(body.status, STATUSES); const role = enumValue(body.role, ROLES); const updatedAt = boundedInteger(body.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (!status || !role || updatedAt === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Role, trạng thái và phiên bản là bắt buộc.')
  if (targetId === actor.id && (status === 'suspended' || role !== 'admin')) return jsonError(c, 422, 'SELF_LOCKOUT', 'Không thể tự khóa hoặc hạ quyền tài khoản đang đăng nhập.')
  const current = await c.env.DB.prepare('SELECT id, role, status FROM user WHERE id = ? LIMIT 1').bind(targetId).first<{ id: string; role: string; status: string }>()
  if (!current) return jsonError(c, 404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng.')
  const removingAdmin = current.role === 'admin' && (role !== 'admin' || status === 'suspended')
  if (removingAdmin) {
    const count = await c.env.DB.prepare("SELECT COUNT(*) AS count FROM user WHERE role = 'admin' AND status = 'active' AND id != ?").bind(targetId).first<{ count: number }>()
    if (Number(count?.count || 0) < 1) return jsonError(c, 409, 'LAST_ADMIN', 'Không thể khóa hoặc hạ quyền admin cuối cùng.')
  }
  const now = Date.now()
  const update = c.env.DB.prepare('UPDATE user SET role = ?, status = ?, updated_at = ? WHERE id = ? AND updated_at = ?').bind(role, status, now, targetId, updatedAt)
  const audit = auditStatement({ actorId: actor.id, action: 'user.updated', entityType: 'user', entityId: targetId, metadata: { role, status } }, now, c.env.DB)
  const statements: D1PreparedStatement[] = [update, audit]
  if (status === 'suspended') statements.push(c.env.DB.prepare('DELETE FROM session WHERE user_id = ?').bind(targetId))
  const result = await c.env.DB.batch(statements)
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'USER_CONFLICT', 'User đã được cập nhật. Vui lòng tải lại.')
  return jsonData(c, { id: targetId, role, status, updatedAt: now })
})
