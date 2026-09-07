import { Hono } from 'hono'
import { createAuth } from '../auth/auth'
import { parseJsonObject, jsonData, jsonError } from '../../lib/http'
import { orderRequestStatement, auditStatement } from '../../lib/audit'
import { isOrderStatus } from '../../lib/order-state'
import { boundedInteger, normalizeEmail, optionalString, requiredString } from '../../lib/validation'

interface OrderPayload {
  templateId?: unknown
  fullName?: unknown
  email?: unknown
  phone?: unknown
  eventDate?: unknown
  requestedDeadline?: unknown
  eventType?: unknown
  note?: unknown
}

export async function getSession(request: Request, env: Env) {
  return createAuth(env).api.getSession({ headers: request.headers })
}

function createOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `DL-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function validDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function parseValue(value: string | null | undefined): unknown {
  if (!value) return null
  try { return JSON.parse(value) as unknown } catch { return value }
}

async function customerOrder(db: D1Database, orderId: string, customerId: string) {
  return db.prepare(
    `SELECT o.id, o.order_code AS orderCode, o.customer_id AS customerId, o.template_id AS templateId,
            o.template_snapshot_json AS templateSnapshotJson, o.package_snapshot_json AS packageSnapshotJson,
            o.status, o.payment_status AS paymentStatus, o.event_date AS eventDate,
            o.requested_deadline AS requestedDeadline, o.contact_snapshot_json AS contactSnapshotJson,
            o.quoted_amount AS quotedAmount, o.customer_note AS customerNote,
            o.created_at AS createdAt, o.updated_at AS updatedAt,
            t.name AS templateName
     FROM orders o LEFT JOIN templates t ON t.id = o.template_id
     WHERE o.id = ? AND o.customer_id = ? LIMIT 1`,
  ).bind(orderId, customerId).first<Record<string, unknown>>()
}

async function customerOrderDetail(db: D1Database, orderId: string, customerId: string) {
  const order = await customerOrder(db, orderId, customerId)
  if (!order) return null
  const [answers, groups, files, notes, history] = await db.batch([
    db.prepare('SELECT field_key AS fieldKey, field_label_snapshot AS fieldLabel, value_json AS valueJson FROM order_form_answers WHERE order_id = ? ORDER BY created_at ASC LIMIT 100').bind(orderId),
    db.prepare('SELECT id, group_key AS groupKey, label, min_files AS minFiles, max_files AS maxFiles FROM order_upload_groups WHERE order_id = ? ORDER BY created_at ASC LIMIT 20').bind(orderId),
    db.prepare(`SELECT f.id, f.group_id AS groupId, f.media_asset_id AS mediaAssetId, m.original_filename AS filename, m.mime_type AS mimeType, m.size_bytes AS sizeBytes, m.status, m.visibility FROM order_files f JOIN media_assets m ON m.id = f.media_asset_id WHERE f.order_id = ? ORDER BY f.group_id, f.position LIMIT 200`).bind(orderId),
    db.prepare(`SELECT n.id, u.name AS authorName, n.body, n.created_at AS createdAt FROM order_notes n JOIN user u ON u.id = n.author_id WHERE n.order_id = ? AND n.visibility = 'customer' ORDER BY n.created_at DESC LIMIT 100`).bind(orderId),
    db.prepare(`SELECT h.id, h.from_status AS fromStatus, h.to_status AS toStatus, u.name AS actorName, h.reason, h.created_at AS createdAt FROM order_status_history h JOIN user u ON u.id = h.actor_id WHERE h.order_id = ? ORDER BY h.created_at DESC LIMIT 100`).bind(orderId),
  ])
  const groupRows = (groups.results as Array<Record<string, unknown>>).map(group => ({ id: String(group.id), groupKey: String(group.groupKey), label: String(group.label), minFiles: Number(group.minFiles || 0), maxFiles: group.maxFiles === null || group.maxFiles === undefined ? null : Number(group.maxFiles), files: [] as Array<Record<string, unknown>> }))
  const groupMap = new Map(groupRows.map(group => [group.id, group]))
  for (const file of files.results as Array<Record<string, unknown>>) groupMap.get(String(file.groupId))?.files.push({ id: String(file.id), mediaAssetId: String(file.mediaAssetId), filename: file.filename ? String(file.filename) : null, mimeType: String(file.mimeType), sizeBytes: Number(file.sizeBytes || 0), status: String(file.status || 'pending'), visibility: String(file.visibility || 'private') })
  const status = isOrderStatus(order.status) ? order.status : 'draft'
  return {
    id: String(order.id), orderCode: String(order.orderCode), templateId: String(order.templateId), templateName: order.templateName ? String(order.templateName) : null, status, paymentStatus: String(order.paymentStatus), eventDate: order.eventDate ? String(order.eventDate) : null, requestedDeadline: order.requestedDeadline ? String(order.requestedDeadline) : null, quotedAmount: order.quotedAmount === null || order.quotedAmount === undefined ? null : Number(order.quotedAmount), customerNote: order.customerNote ? String(order.customerNote) : null, createdAt: Number(order.createdAt || 0), updatedAt: Number(order.updatedAt || 0), contactSnapshot: parseJsonObject(order.contactSnapshotJson as string | null), templateSnapshot: parseJsonObject(order.templateSnapshotJson as string | null), packageSnapshot: parseJsonObject(order.packageSnapshotJson as string | null), formAnswers: (answers.results as Array<Record<string, unknown>>).map(answer => ({ fieldKey: String(answer.fieldKey), fieldLabel: String(answer.fieldLabel), value: parseValue(answer.valueJson as string | null) })), uploadGroups: groupRows, notes: (notes.results as Array<Record<string, unknown>>).map(note => ({ id: String(note.id), authorName: String(note.authorName || 'Dearlove'), body: String(note.body || ''), createdAt: Number(note.createdAt || 0) })), statusHistory: (history.results as Array<Record<string, unknown>>).map(event => ({ id: String(event.id), fromStatus: event.fromStatus ? String(event.fromStatus) : null, toStatus: String(event.toStatus), actorName: String(event.actorName || 'Dearlove'), reason: event.reason ? String(event.reason) : null, createdAt: Number(event.createdAt || 0) })),
  }
}

export const ordersApi = new Hono<{ Bindings: Env }>()

ordersApi.post('/', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return jsonError(c, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  let payload: OrderPayload
  try { payload = await c.req.json<OrderPayload>() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu gửi lên không hợp lệ.') }
  const templateId = requiredString(payload.templateId, 128)
  const fullName = requiredString(payload.fullName, 160)
  const email = normalizeEmail(payload.email)
  const phone = requiredString(payload.phone, 40)
  const eventDate = validDate(payload.eventDate)
  const requestedDeadline = validDate(payload.requestedDeadline)
  const eventType = optionalString(payload.eventType, 80) || ''
  const note = optionalString(payload.note, 4000)
  if (!templateId || !fullName || !email || !phone || (payload.eventDate && !eventDate) || (payload.requestedDeadline && !requestedDeadline)) return jsonError(c, 422, 'VALIDATION_ERROR', 'Vui lòng điền mẫu thiệp, thông tin liên hệ và ngày hợp lệ.')

  const template = await c.env.DB.prepare(
    `SELECT t.id, t.slug, t.name, t.description, t.access_tier AS accessTier, t.price_label AS priceLabel,
            c.id AS categoryId, c.slug AS categorySlug, c.name AS categoryName
     FROM templates t JOIN template_categories c ON c.id = t.category_id
     WHERE t.id = ? AND t.status = 'published' AND c.status = 'published' LIMIT 1`,
  ).bind(templateId).first<Record<string, unknown>>()
  if (!template) return jsonError(c, 422, 'TEMPLATE_UNAVAILABLE', 'Mẫu thiệp không còn khả dụng.')

  const now = Date.now(); const orderId = crypto.randomUUID(); const orderCode = createOrderCode()
  const templateSnapshot = JSON.stringify({ id: template.id, slug: template.slug, name: template.name, description: template.description || null, accessTier: template.accessTier, priceLabel: template.priceLabel || null, category: { id: template.categoryId, slug: template.categorySlug, name: template.categoryName } })
  const contactSnapshot = JSON.stringify({ fullName, email, phone })
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(`INSERT INTO orders (id, order_code, customer_id, template_id, template_snapshot_json, package_snapshot_json, status, payment_status, event_date, requested_deadline, contact_snapshot_json, customer_note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, 'draft', 'unpaid', ?, ?, ?, ?, ?, ?)`).bind(orderId, orderCode, String(session.user.id), template.id, templateSnapshot, eventDate, requestedDeadline, contactSnapshot, note, now, now),
      c.env.DB.prepare(`INSERT INTO order_form_answers (id, order_id, field_key, field_label_snapshot, value_json, created_at, updated_at) VALUES (?, ?, 'event_type', 'Loại sự kiện', ?, ?, ?)`).bind(crypto.randomUUID(), orderId, JSON.stringify(eventType), now, now),
      c.env.DB.prepare(`INSERT INTO order_upload_groups (id, order_id, group_key, label, min_files, max_files, created_at, updated_at) VALUES (?, ?, 'photos', 'Ảnh cần gửi', 0, NULL, ?, ?)`).bind(crypto.randomUUID(), orderId, now, now),
      c.env.DB.prepare(`INSERT INTO order_status_history (id, order_id, from_status, to_status, actor_id, reason, created_at, updated_at) VALUES (?, ?, NULL, 'draft', ?, 'Tạo đơn nháp', ?, ?)`).bind(crypto.randomUUID(), orderId, String(session.user.id), now, now),
    ])
  } catch (error) {
    console.error(JSON.stringify({ message: 'order creation failed', error: error instanceof Error ? error.message : String(error) }))
    return jsonError(c, 500, 'ORDER_CREATE_FAILED', 'Không thể tạo đơn lúc này.')
  }
  return jsonData(c, { id: orderId, orderCode, status: 'draft', templateId: String(template.id), updatedAt: now }, 201)
})

ordersApi.get('/', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return jsonError(c, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  const result = await c.env.DB.prepare(`SELECT o.id, o.order_code AS orderCode, o.template_id AS templateId, t.name AS templateName, o.status, o.payment_status AS paymentStatus, o.event_date AS eventDate, o.requested_deadline AS requestedDeadline, o.created_at AS createdAt, o.updated_at AS updatedAt FROM orders o LEFT JOIN templates t ON t.id = o.template_id WHERE o.customer_id = ? ORDER BY o.created_at DESC LIMIT 50`).bind(String(session.user.id)).all<Record<string, unknown>>()
  return jsonData(c, { items: result.results })
})

ordersApi.get('/:orderId', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return jsonError(c, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  const detail = await customerOrderDetail(c.env.DB, c.req.param('orderId'), String(session.user.id))
  if (!detail) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  return jsonData(c, detail)
})

ordersApi.patch('/:orderId', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return jsonError(c, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  let payload: OrderPayload & { updatedAt?: unknown }
  try { payload = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu gửi lên không hợp lệ.') }
  const fullName = requiredString(payload.fullName, 160); const email = normalizeEmail(payload.email); const phone = requiredString(payload.phone, 40); const eventDate = validDate(payload.eventDate); const requestedDeadline = validDate(payload.requestedDeadline); const eventType = optionalString(payload.eventType, 80) || ''; const note = optionalString(payload.note, 4000); const updatedAt = boundedInteger(payload.updatedAt, 0, Number.MAX_SAFE_INTEGER)
  if (!fullName || !email || !phone || updatedAt === null || (payload.eventDate && !eventDate) || (payload.requestedDeadline && !requestedDeadline)) return jsonError(c, 422, 'VALIDATION_ERROR', 'Thông tin form hoặc phiên bản đơn không hợp lệ.')
  const current = await customerOrder(c.env.DB, c.req.param('orderId'), String(session.user.id))
  if (!current) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  if (current.status !== 'draft') return jsonError(c, 409, 'ORDER_NOT_EDITABLE', 'Đơn hàng đã gửi không còn ở trạng thái nháp.')
  const now = Date.now(); const contactSnapshot = JSON.stringify({ fullName, email, phone })
  const update = c.env.DB.prepare(`UPDATE orders SET contact_snapshot_json = ?, event_date = ?, requested_deadline = ?, customer_note = ?, updated_at = ? WHERE id = ? AND customer_id = ? AND status = 'draft' AND updated_at = ?`).bind(contactSnapshot, eventDate, requestedDeadline, note, now, current.id, String(session.user.id), updatedAt)
  const answer = c.env.DB.prepare(`INSERT INTO order_form_answers (id, order_id, field_key, field_label_snapshot, value_json, created_at, updated_at) SELECT ?, ?, 'event_type', 'Loại sự kiện', ?, ?, ? WHERE changes() > 0 ON CONFLICT(order_id, field_key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`).bind(crypto.randomUUID(), current.id, JSON.stringify(eventType), now, now)
  const result = await c.env.DB.batch([update, answer])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'ORDER_CONFLICT', 'Đơn hàng đã được cập nhật. Vui lòng tải lại.')
  return jsonData(c, await customerOrderDetail(c.env.DB, String(current.id), String(session.user.id)))
})

ordersApi.post('/:orderId/submit', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return jsonError(c, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  const key = c.req.header('Idempotency-Key')?.trim()
  if (!key || key.length < 16 || key.length > 128 || /[^\x21-\x7e]/.test(key)) return jsonError(c, 422, 'IDEMPOTENCY_KEY_REQUIRED', 'Thiếu mã idempotency hợp lệ.')
  const orderId = c.req.param('orderId')
  const current = await customerOrder(c.env.DB, orderId, String(session.user.id))
  if (!current) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  const previous = await c.env.DB.prepare('SELECT order_id AS orderId FROM order_requests WHERE customer_id = ? AND idempotency_key = ? LIMIT 1').bind(String(session.user.id), key).first<{ orderId: string }>()
  if (previous) return jsonData(c, await customerOrderDetail(c.env.DB, previous.orderId, String(session.user.id)))
  if (current.status !== 'draft') return jsonError(c, 409, 'ORDER_ALREADY_SUBMITTED', 'Đơn hàng đã được gửi trước đó.')
  const now = Date.now()
  const requestInsert = orderRequestStatement(c.env.DB, { id: crypto.randomUUID(), idempotencyKey: key, customerId: String(session.user.id), orderId, now })
  const update = c.env.DB.prepare("UPDATE orders SET status = 'submitted', updated_at = ? WHERE id = ? AND customer_id = ? AND status = 'draft' AND updated_at = ?").bind(now, orderId, String(session.user.id), current.updatedAt)
  const history = c.env.DB.prepare("INSERT INTO order_status_history (id, order_id, from_status, to_status, actor_id, reason, created_at, updated_at) SELECT ?, ?, 'draft', 'submitted', ?, 'Khách gửi yêu cầu', ?, ? WHERE changes() > 0").bind(crypto.randomUUID(), orderId, String(session.user.id), now, now)
  const audit = auditStatement({ actorId: String(session.user.id), action: 'order.submitted', entityType: 'order', entityId: orderId, metadata: {} }, now, c.env.DB)
  const result = await c.env.DB.batch([requestInsert, update, history, audit])
  if (Number(result[1]?.meta?.changes || 0) !== 1) {
    await c.env.DB.prepare('DELETE FROM order_requests WHERE customer_id = ? AND idempotency_key = ? AND order_id = ?').bind(String(session.user.id), key, orderId).run()
    return jsonError(c, 409, 'ORDER_CONFLICT', 'Đơn hàng đã được cập nhật. Vui lòng tải lại.')
  }
  return jsonData(c, await customerOrderDetail(c.env.DB, orderId, String(session.user.id)))
})

ordersApi.post('/:orderId/messages', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return jsonError(c, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')
  let body: { body?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu tin nhắn không hợp lệ.') }
  const message = requiredString(body.body, 4000)
  if (!message) return jsonError(c, 422, 'VALIDATION_ERROR', 'Nội dung tin nhắn là bắt buộc.')
  const order = await customerOrder(c.env.DB, c.req.param('orderId'), String(session.user.id))
  if (!order) return jsonError(c, 404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng.')
  if (['completed', 'cancelled'].includes(String(order.status))) return jsonError(c, 409, 'ORDER_CLOSED', 'Đơn hàng đã đóng.')
  const now = Date.now()
  await c.env.DB.prepare('INSERT INTO order_notes (id, order_id, author_id, visibility, body, created_at, updated_at) VALUES (?, ?, ?, \'customer\', ?, ?, ?)').bind(crypto.randomUUID(), order.id, String(session.user.id), message, now, now).run()
  return jsonData(c, await customerOrderDetail(c.env.DB, String(order.id), String(session.user.id)), 201)
})

export type { OrderPayload }
