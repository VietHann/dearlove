import { Hono } from 'hono'
import { createAuth } from '../auth/auth'

interface OrderPayload {
  templateId?: string
  templateName?: string
  templateCategory?: string
  fullName?: string
  email?: string
  phone?: string
  eventDate?: string
  eventType?: string
  note?: string
}

function requiredText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null
}

export async function getSession(request: Request, env: Env) {
  return createAuth(env).api.getSession({ headers: request.headers })
}

function createOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `DL-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export const ordersApi = new Hono<{ Bindings: Env }>()

ordersApi.post('/', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập.' } }, 401)

  let payload: OrderPayload
  try {
    payload = await c.req.json<OrderPayload>()
  } catch {
    return c.json({ error: { code: 'INVALID_JSON', message: 'Dữ liệu gửi lên không hợp lệ.' } }, 400)
  }

  const templateId = requiredText(payload.templateId, 128)
  const templateName = requiredText(payload.templateName, 160)
  const fullName = requiredText(payload.fullName, 160)
  const email = requiredText(payload.email, 320)
  const phone = requiredText(payload.phone, 40)

  if (!templateId || !templateName || !fullName || !email || !phone) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Vui lòng điền mẫu thiệp, họ tên, email và số điện thoại.',
      },
    }, 422)
  }

  const now = Date.now()
  const categoryId = `legacy-${payload.templateCategory || 'general'}`
  const orderId = crypto.randomUUID()
  const orderCode = createOrderCode()
  const templateSnapshot = JSON.stringify({
    id: templateId,
    name: templateName,
    category: payload.templateCategory || 'general',
  })
  const contactSnapshot = JSON.stringify({ fullName, email, phone })

  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        `INSERT OR IGNORE INTO template_categories (id, slug, name, position, status, created_at, updated_at)
         VALUES (?, ?, ?, 0, 'published', ?, ?)`,
      ).bind(categoryId, payload.templateCategory || 'general', payload.templateCategory || 'Khác', now, now),
      c.env.DB.prepare(
        `INSERT OR IGNORE INTO templates (id, slug, name, category_id, description, access_tier, status, featured, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, NULL, 'free', 'published', 0, 0, ?, ?)`,
      ).bind(templateId, templateId, templateName, categoryId, now, now),
      c.env.DB.prepare(
        `INSERT INTO orders
          (id, order_code, customer_id, template_id, template_snapshot_json, status, payment_status,
           event_date, contact_snapshot_json, customer_note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'draft', 'unpaid', ?, ?, ?, ?, ?)`,
      ).bind(orderId, orderCode, session.user.id, templateId, templateSnapshot, payload.eventDate || null, contactSnapshot, payload.note || null, now, now),
      c.env.DB.prepare(
        `INSERT INTO order_form_answers
          (id, order_id, field_key, field_label_snapshot, value_json, created_at, updated_at)
         VALUES (?, ?, 'event_type', 'Loại sự kiện', ?, ?, ?)`,
      ).bind(crypto.randomUUID(), orderId, JSON.stringify(payload.eventType || ''), now, now),
      c.env.DB.prepare(
        `INSERT INTO order_upload_groups
          (id, order_id, group_key, label, min_files, max_files, created_at, updated_at)
         VALUES (?, ?, 'photos', 'Ảnh cần gửi', 0, NULL, ?, ?)`,
      ).bind(crypto.randomUUID(), orderId, now, now),
    ])
  } catch (error) {
    console.error(JSON.stringify({
      message: 'order creation failed',
      error: error instanceof Error ? error.message : String(error),
    }))
    return c.json({ error: { code: 'ORDER_CREATE_FAILED', message: 'Không thể tạo đơn lúc này.' } }, 500)
  }

  return c.json({
    data: {
      id: orderId,
      orderCode,
      status: 'draft',
      templateId,
    },
  }, 201)
})

ordersApi.get('/', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập.' } }, 401)

  const result = await c.env.DB.prepare(
    `SELECT id, order_code, template_id, status, payment_status, event_date, created_at, updated_at
     FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50`,
  ).bind(session.user.id).all()

  return c.json({ data: result.results })
})
