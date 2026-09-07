import { Hono } from 'hono'
import { requireAdmin, type AdminActor } from '../../middleware/admin'
import { jsonData, jsonError, parseJsonObject } from '../../lib/http'
import { auditStatement } from '../../lib/audit'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'
import {
  availableOrderTransitions,
  canTransitionOrder,
  isOrderStatus,
  isPaymentStatus,
  type OrderStatus,
  type PaymentStatus,
} from '../../lib/order-state'
import { enumValue, requiredString, boundedInteger } from '../../lib/validation'

interface OrderRow {
  id: string
  orderCode: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  templateId: string
  templateName: string | null
  status: OrderStatus
  paymentStatus: PaymentStatus
  eventDate: string | null
  requestedDeadline: string | null
  customerNote: string | null
  quotedAmount: number | null
  createdAt: number
  updatedAt: number
  assignedAdminId: string | null
  assignedAdminName: string | null
}

interface OrderDetail extends OrderRow {
  contactSnapshot: Record<string, unknown>
  templateSnapshot: Record<string, unknown>
  packageSnapshot: Record<string, unknown>
  formAnswers: Array<{ fieldKey: string; fieldLabel: string; value: unknown }>
  uploadGroups: Array<{
    id: string
    groupKey: string
    label: string
    minFiles: number
    maxFiles: number | null
    files: Array<{ id: string; mediaAssetId: string; filename: string | null; mimeType: string; sizeBytes: number; status: string; visibility: string; downloadPath: string }>
  }>
  notes: Array<{ id: string; authorName: string; visibility: 'customer' | 'internal'; body: string; createdAt: number }>
  assignments: Array<{ adminId: string; adminName: string; assignedAt: number; unassignedAt: number | null }>
  statusHistory: Array<{ id: string; fromStatus: string | null; toStatus: string; actorName: string; reason: string | null; createdAt: number }>
  availableTransitions: OrderStatus[]
  adminUsers: Array<{ id: string; name: string; email: string }>
}

const SORT_VALUES = ['newest', 'oldest', 'deadline'] as const
const PAYMENT_VALUES = ['unpaid', 'pending_verification', 'paid', 'refunded'] as const

function bodyTooLarge(request: Request, maxBytes = 128 * 1024) {
  const contentLength = Number(request.headers.get('Content-Length'))
  return Number.isFinite(contentLength) && contentLength > maxBytes
}

async function readJson<T>(request: Request): Promise<T | null> {
  if (bodyTooLarge(request)) return null
  try {
    return await request.json<T>()
  } catch {
    return null
  }
}

function escapeLike(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')
}

function mapOrderRow(row: Record<string, unknown>): OrderRow {
  return {
    id: String(row.id),
    orderCode: String(row.orderCode || ''),
    customerId: String(row.customerId || ''),
    customerName: String(row.customerName || 'Khách hàng'),
    customerEmail: String(row.customerEmail || ''),
    customerPhone: String(row.customerPhone || ''),
    templateId: String(row.templateId || ''),
    templateName: row.templateName ? String(row.templateName) : null,
    status: isOrderStatus(row.status) ? row.status : 'draft',
    paymentStatus: isPaymentStatus(row.paymentStatus) ? row.paymentStatus : 'unpaid',
    eventDate: row.eventDate ? String(row.eventDate) : null,
    requestedDeadline: row.requestedDeadline ? String(row.requestedDeadline) : null,
    customerNote: row.customerNote ? String(row.customerNote) : null,
    quotedAmount: row.quotedAmount === null || row.quotedAmount === undefined ? null : Number(row.quotedAmount),
    createdAt: Number(row.createdAt || 0),
    updatedAt: Number(row.updatedAt || 0),
    assignedAdminId: row.assignedAdminId ? String(row.assignedAdminId) : null,
    assignedAdminName: row.assignedAdminName ? String(row.assignedAdminName) : null,
  }
}

const BASE_ORDER_SELECT = `
  SELECT o.id,
         o.order_code AS orderCode,
         o.customer_id AS customerId,
         COALESCE(json_extract(o.contact_snapshot_json, '$.fullName'), u.name) AS customerName,
         COALESCE(json_extract(o.contact_snapshot_json, '$.email'), u.email) AS customerEmail,
         COALESCE(json_extract(o.contact_snapshot_json, '$.phone'), u.phone, '') AS customerPhone,
         o.template_id AS templateId,
         t.name AS templateName,
         o.status,
         o.payment_status AS paymentStatus,
         o.event_date AS eventDate,
         o.requested_deadline AS requestedDeadline,
         o.customer_note AS customerNote,
         o.quoted_amount AS quotedAmount,
         o.created_at AS createdAt,
         o.updated_at AS updatedAt,
         active_assignment.admin_id AS assignedAdminId,
         active_assignment.admin_name AS assignedAdminName
  FROM orders o
  JOIN user u ON u.id = o.customer_id
  LEFT JOIN templates t ON t.id = o.template_id
  LEFT JOIN (
    SELECT oa.order_id, oa.admin_id, au.name AS admin_name
    FROM order_assignments oa
    JOIN user au ON au.id = oa.admin_id
    WHERE oa.unassigned_at IS NULL
  ) active_assignment ON active_assignment.order_id = o.id
`

async function findOrder(db: D1Database, orderId: string): Promise<OrderRow | null> {
  const row = await db.prepare(`${BASE_ORDER_SELECT} WHERE o.id = ? LIMIT 1`).bind(orderId).first<Record<string, unknown>>()
  return row ? mapOrderRow(row) : null
}

async function loadOrderDetail(db: D1Database, orderId: string): Promise<OrderDetail | null> {
  const order = await db.prepare(
    `SELECT o.id, o.order_code AS orderCode, o.customer_id AS customerId,
            COALESCE(json_extract(o.contact_snapshot_json, '$.fullName'), u.name) AS customerName,
            COALESCE(json_extract(o.contact_snapshot_json, '$.email'), u.email) AS customerEmail,
            COALESCE(json_extract(o.contact_snapshot_json, '$.phone'), u.phone, '') AS customerPhone,
            o.template_id AS templateId, t.name AS templateName, o.status,
            o.payment_status AS paymentStatus, o.event_date AS eventDate,
            o.requested_deadline AS requestedDeadline, o.customer_note AS customerNote,
            o.quoted_amount AS quotedAmount, o.created_at AS createdAt, o.updated_at AS updatedAt,
            o.contact_snapshot_json AS contactSnapshotJson,
            o.template_snapshot_json AS templateSnapshotJson,
            o.package_snapshot_json AS packageSnapshotJson,
            active_assignment.admin_id AS assignedAdminId,
            active_assignment.admin_name AS assignedAdminName
     FROM orders o
     JOIN user u ON u.id = o.customer_id
     LEFT JOIN templates t ON t.id = o.template_id
     LEFT JOIN (
       SELECT oa.order_id, oa.admin_id, au.name AS admin_name
       FROM order_assignments oa
       JOIN user au ON au.id = oa.admin_id
       WHERE oa.unassigned_at IS NULL
     ) active_assignment ON active_assignment.order_id = o.id
     WHERE o.id = ?
     LIMIT 1`,
  ).bind(orderId).first<Record<string, unknown>>()
  if (!order) return null

  const [answersResult, groupsResult, filesResult, notesResult, historyResult, assignmentsResult, adminsResult] = await db.batch([
    db.prepare(
      `SELECT field_key AS fieldKey, field_label_snapshot AS fieldLabel, value_json AS valueJson
       FROM order_form_answers WHERE order_id = ? ORDER BY created_at ASC LIMIT 100`,
    ).bind(orderId),
    db.prepare(
      `SELECT id, group_key AS groupKey, label, min_files AS minFiles, max_files AS maxFiles
       FROM order_upload_groups WHERE order_id = ? ORDER BY created_at ASC LIMIT 20`,
    ).bind(orderId),
    db.prepare(
      `SELECT f.id, f.group_id AS groupId, f.media_asset_id AS mediaAssetId,
              m.original_filename AS filename, m.mime_type AS mimeType,
              m.size_bytes AS sizeBytes, m.status, m.visibility
       FROM order_files f
       JOIN media_assets m ON m.id = f.media_asset_id
       WHERE f.order_id = ? ORDER BY f.group_id, f.position, f.created_at LIMIT 200`,
    ).bind(orderId),
    db.prepare(
      `SELECT n.id, u.name AS authorName, n.visibility, n.body, n.created_at AS createdAt
       FROM order_notes n JOIN user u ON u.id = n.author_id
       WHERE n.order_id = ? ORDER BY n.created_at DESC LIMIT 100`,
    ).bind(orderId),
    db.prepare(
      `SELECT h.id, h.from_status AS fromStatus, h.to_status AS toStatus,
              u.name AS actorName, h.reason, h.created_at AS createdAt
       FROM order_status_history h JOIN user u ON u.id = h.actor_id
       WHERE h.order_id = ? ORDER BY h.created_at DESC LIMIT 100`,
    ).bind(orderId),
    db.prepare(
      `SELECT a.admin_id AS adminId, u.name AS adminName,
              a.assigned_at AS assignedAt, a.unassigned_at AS unassignedAt
       FROM order_assignments a JOIN user u ON u.id = a.admin_id
       WHERE a.order_id = ? ORDER BY a.assigned_at DESC LIMIT 100`,
    ).bind(orderId),
    db.prepare("SELECT id, name, email FROM user WHERE role = 'admin' AND status = 'active' ORDER BY name ASC LIMIT 100"),
  ])

  const groups = (groupsResult.results as Array<Record<string, unknown>>).map(group => ({
    id: String(group.id),
    groupKey: String(group.groupKey),
    label: String(group.label),
    minFiles: Number(group.minFiles || 0),
    maxFiles: group.maxFiles === null || group.maxFiles === undefined ? null : Number(group.maxFiles),
    files: [] as OrderDetail['uploadGroups'][number]['files'],
  }))
  const groupMap = new Map(groups.map(group => [group.id, group]))
  for (const file of filesResult.results as Array<Record<string, unknown>>) {
    const group = groupMap.get(String(file.groupId))
    if (!group) continue
    group.files.push({
      id: String(file.id),
      mediaAssetId: String(file.mediaAssetId),
      filename: file.filename ? String(file.filename) : null,
      mimeType: String(file.mimeType || 'application/octet-stream'),
      sizeBytes: Number(file.sizeBytes || 0),
      status: String(file.status || 'pending'),
      visibility: String(file.visibility || 'private'),
      downloadPath: `/api/v1/admin/orders/${orderId}/files/${String(file.id)}`,
    })
  }

  const parsedAnswers = (answersResult.results as Array<Record<string, unknown>>).map(answer => ({
    fieldKey: String(answer.fieldKey),
    fieldLabel: String(answer.fieldLabel),
    value: parseJsonObject(answer.valueJson as string | null),
  }))
  const status = isOrderStatus(order.status) ? order.status : 'draft'

  return {
    ...mapOrderRow(order),
    contactSnapshot: parseJsonObject(order.contactSnapshotJson as string | null),
    templateSnapshot: parseJsonObject(order.templateSnapshotJson as string | null),
    packageSnapshot: parseJsonObject(order.packageSnapshotJson as string | null),
    formAnswers: parsedAnswers,
    uploadGroups: groups,
    notes: (notesResult.results as Array<Record<string, unknown>>).map(note => ({
      id: String(note.id),
      authorName: String(note.authorName || 'Admin'),
      visibility: note.visibility === 'customer' ? 'customer' : 'internal',
      body: String(note.body || ''),
      createdAt: Number(note.createdAt || 0),
    })),
    assignments: (assignmentsResult.results as Array<Record<string, unknown>>).map(assignment => ({
      adminId: String(assignment.adminId),
      adminName: String(assignment.adminName || 'Admin'),
      assignedAt: Number(assignment.assignedAt || 0),
      unassignedAt: assignment.unassignedAt === null || assignment.unassignedAt === undefined ? null : Number(assignment.unassignedAt),
    })),
    statusHistory: (historyResult.results as Array<Record<string, unknown>>).map(history => ({
      id: String(history.id),
      fromStatus: history.fromStatus ? String(history.fromStatus) : null,
      toStatus: String(history.toStatus),
      actorName: String(history.actorName || 'Admin'),
      reason: history.reason ? String(history.reason) : null,
      createdAt: Number(history.createdAt || 0),
    })),
    availableTransitions: availableOrderTransitions(status),
    adminUsers: (adminsResult.results as Array<Record<string, unknown>>).map(admin => ({ id: String(admin.id), name: String(admin.name), email: String(admin.email) })),
  }
}

export const adminOrdersApi = new Hono<{ Bindings: Env }>()

adminOrdersApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor

  const status = c.req.query('status')
  const paymentStatus = c.req.query('paymentStatus')
  const assignedTo = c.req.query('assignedTo')
  const query = c.req.query('q')?.trim().slice(0, 120) || ''
  const from = c.req.query('from')?.trim()
  const to = c.req.query('to')?.trim()
  const sort = enumValue(c.req.query('sort') || 'newest', SORT_VALUES) || 'newest'
  const limit = parseLimit(c.req.query('limit'))
  const cursorValue = c.req.query('cursor')
  const cursor = parseCursor(cursorValue)

  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')
  if (status && !isOrderStatus(status)) return jsonError(c, 422, 'INVALID_STATUS', 'Trạng thái đơn không hợp lệ.')
  if (paymentStatus && !isPaymentStatus(paymentStatus)) return jsonError(c, 422, 'INVALID_PAYMENT_STATUS', 'Trạng thái thanh toán không hợp lệ.')
  if (assignedTo && assignedTo.length > 128) return jsonError(c, 422, 'INVALID_ASSIGNEE', 'Admin phụ trách không hợp lệ.')
  if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) return jsonError(c, 422, 'INVALID_DATE', 'Ngày bắt đầu không hợp lệ.')
  if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) return jsonError(c, 422, 'INVALID_DATE', 'Ngày kết thúc không hợp lệ.')

  const where: string[] = []
  const binds: Array<string | number> = []
  if (status) { where.push('o.status = ?'); binds.push(status) }
  if (paymentStatus) { where.push('o.payment_status = ?'); binds.push(paymentStatus) }
  if (assignedTo) { where.push('EXISTS (SELECT 1 FROM order_assignments filter_assignment WHERE filter_assignment.order_id = o.id AND filter_assignment.admin_id = ? AND filter_assignment.unassigned_at IS NULL)'); binds.push(assignedTo) }
  if (query) {
    const search = `%${escapeLike(query)}%`
    where.push("(o.order_code LIKE ? ESCAPE '\\' OR json_extract(o.contact_snapshot_json, '$.email') LIKE ? ESCAPE '\\' OR json_extract(o.contact_snapshot_json, '$.phone') LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\')")
    binds.push(search, search, search, search)
  }
  if (from) { where.push('date(datetime(o.created_at / 1000, \'unixepoch\')) >= date(?)'); binds.push(from) }
  if (to) { where.push('date(datetime(o.created_at / 1000, \'unixepoch\')) <= date(?)'); binds.push(to) }
  if (cursor) {
    if (sort === 'oldest') {
      where.push('(o.created_at > ? OR (o.created_at = ? AND o.id > ?))')
    } else {
      where.push('(o.created_at < ? OR (o.created_at = ? AND o.id < ?))')
    }
    binds.push(cursor.createdAt, cursor.createdAt, cursor.id)
  }

  const orderBy = sort === 'oldest' ? 'o.created_at ASC, o.id ASC' : 'o.created_at DESC, o.id DESC'
  const sql = `${BASE_ORDER_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${orderBy} LIMIT ?`
  binds.push(limit + 1)
  const result = await c.env.DB.prepare(sql).bind(...binds).all<Record<string, unknown>>()
  const rows = result.results.map(mapOrderRow)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]

  return jsonData(c, {
    items,
    nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null,
    filters: { status: status || null, paymentStatus: paymentStatus || null, assignedTo: assignedTo || null, q: query, from: from || null, to: to || null, sort },
  })
})

adminOrdersApi.get('/:orderId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const orderId = c.req.param('orderId')
  const detail = await loadOrderDetail(c.env.DB, orderId)
  if (!detail) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  return jsonData(c, detail)
})

adminOrdersApi.patch('/:orderId/status', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await readJson<{ toStatus?: unknown; reason?: unknown; updatedAt?: unknown }>(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu gửi lên không hợp lệ.')
  const toStatus = body.toStatus
  const reason = requiredString(body.reason, 500)
  const updatedAt = boundedInteger(body.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (!isOrderStatus(toStatus) || !reason || updatedAt === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Trạng thái, lý do và phiên bản đơn là bắt buộc.')

  const order = await findOrder(c.env.DB, c.req.param('orderId'))
  if (!order) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  if (!canTransitionOrder(order.status, toStatus)) return jsonError(c, 422, 'INVALID_ORDER_TRANSITION', `Không thể chuyển từ ${order.status} sang ${toStatus}.`)

  const update = c.env.DB.prepare(
    `UPDATE orders SET status = ?, updated_at = ?
     WHERE id = ? AND status = ? AND updated_at = ?`,
  ).bind(toStatus, Date.now(), order.id, order.status, updatedAt)
  const history = c.env.DB.prepare(
    `INSERT INTO order_status_history (id, order_id, from_status, to_status, actor_id, reason, created_at, updated_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() > 0`,
  ).bind(crypto.randomUUID(), order.id, order.status, toStatus, actor.id, reason, Date.now(), Date.now())
  const audit = auditStatement({ actorId: actor.id, action: 'order.status_changed', entityType: 'order', entityId: order.id, metadata: { fromStatus: order.status, toStatus } }, Date.now(), c.env.DB)
  const result = await c.env.DB.batch([update, history, audit])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'ORDER_CONFLICT', 'Đơn hàng đã được cập nhật. Vui lòng tải lại dữ liệu.')

  const detail = await loadOrderDetail(c.env.DB, order.id)
  return jsonData(c, detail)
})

adminOrdersApi.patch('/:orderId/payment', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await readJson<{ paymentStatus?: unknown; reason?: unknown; updatedAt?: unknown }>(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu gửi lên không hợp lệ.')
  const paymentStatus = body.paymentStatus
  const reason = requiredString(body.reason, 500)
  const updatedAt = boundedInteger(body.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (!isPaymentStatus(paymentStatus) || !reason || updatedAt === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Trạng thái thanh toán, lý do và phiên bản đơn là bắt buộc.')
  const order = await findOrder(c.env.DB, c.req.param('orderId'))
  if (!order) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  if (paymentStatus === 'refunded' && order.paymentStatus !== 'paid') return jsonError(c, 422, 'INVALID_PAYMENT_TRANSITION', 'Chỉ đơn đã thanh toán mới có thể hoàn tiền.')

  const now = Date.now()
  const update = c.env.DB.prepare(
    `UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ? AND updated_at = ?`,
  ).bind(paymentStatus, now, order.id, updatedAt)
  const audit = auditStatement({ actorId: actor.id, action: 'order.payment_changed', entityType: 'order', entityId: order.id, metadata: { fromPaymentStatus: order.paymentStatus, toPaymentStatus: paymentStatus } }, now, c.env.DB)
  const result = await c.env.DB.batch([update, audit])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'ORDER_CONFLICT', 'Đơn hàng đã được cập nhật. Vui lòng tải lại dữ liệu.')
  return jsonData(c, await loadOrderDetail(c.env.DB, order.id))
})

adminOrdersApi.put('/:orderId/assignment', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await readJson<{ adminId?: unknown; updatedAt?: unknown }>(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu gửi lên không hợp lệ.')
  const adminId = body.adminId === null || body.adminId === '' ? null : requiredString(body.adminId, 128)
  const updatedAt = boundedInteger(body.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (body.adminId !== null && body.adminId !== undefined && body.adminId !== '' && !adminId) return jsonError(c, 422, 'VALIDATION_ERROR', 'Admin phụ trách không hợp lệ.')
  if (updatedAt === null) return jsonError(c, 422, 'VALIDATION_ERROR', 'Phiên bản đơn là bắt buộc.')

  const order = await findOrder(c.env.DB, c.req.param('orderId'))
  if (!order) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  if (adminId) {
    const admin = await c.env.DB.prepare("SELECT id FROM user WHERE id = ? AND role = 'admin' AND status = 'active' LIMIT 1").bind(adminId).first<{ id: string }>()
    if (!admin) return jsonError(c, 422, 'INVALID_ASSIGNEE', 'Admin phụ trách không tồn tại hoặc đã bị khóa.')
  }

  const now = Date.now()
  const update = c.env.DB.prepare('UPDATE orders SET updated_at = ? WHERE id = ? AND updated_at = ?').bind(now, order.id, updatedAt)
  const close = c.env.DB.prepare('UPDATE order_assignments SET unassigned_at = ? WHERE order_id = ? AND unassigned_at IS NULL').bind(now, order.id)
  const insert = adminId
    ? c.env.DB.prepare('INSERT INTO order_assignments (order_id, admin_id, assigned_at, unassigned_at) VALUES (?, ?, ?, NULL)').bind(order.id, adminId, now)
    : c.env.DB.prepare('SELECT 1 WHERE 1 = 0')
  const audit = auditStatement({ actorId: actor.id, action: 'order.assignment_changed', entityType: 'order', entityId: order.id, metadata: { assignedAdminId: adminId } }, now, c.env.DB)
  const result = await c.env.DB.batch([update, close, insert, audit])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'ORDER_CONFLICT', 'Đơn hàng đã được cập nhật. Vui lòng tải lại dữ liệu.')
  return jsonData(c, await loadOrderDetail(c.env.DB, order.id))
})

adminOrdersApi.post('/:orderId/notes', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const body = await readJson<{ visibility?: unknown; body?: unknown }>(c.req.raw)
  if (!body) return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu gửi lên không hợp lệ.')
  const visibility = enumValue(body.visibility, ['customer', 'internal'] as const)
  const noteBody = requiredString(body.body, 4000)
  if (!visibility || !noteBody) return jsonError(c, 422, 'VALIDATION_ERROR', 'Loại ghi chú và nội dung là bắt buộc.')
  const order = await findOrder(c.env.DB, c.req.param('orderId'))
  if (!order) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  const now = Date.now()
  const note = c.env.DB.prepare(
    `INSERT INTO order_notes (id, order_id, author_id, visibility, body, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), order.id, actor.id, visibility, noteBody, now, now)
  const audit = auditStatement({ actorId: actor.id, action: 'order.note_created', entityType: 'order', entityId: order.id, metadata: { visibility } }, now, c.env.DB)
  const result = await c.env.DB.batch([note, audit])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 500, 'NOTE_CREATE_FAILED', 'Không thể lưu ghi chú lúc này.')
  return jsonData(c, await loadOrderDetail(c.env.DB, order.id))
})

export type { AdminActor, OrderDetail, OrderRow }
