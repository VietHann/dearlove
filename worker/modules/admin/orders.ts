import { Hono } from 'hono'
import { getSession } from '../orders/orders'

export const adminOrdersApi = new Hono<{ Bindings: Env }>()

adminOrdersApi.get('/', async c => {
  const session = await getSession(c.req.raw, c.env)
  if (!session) return c.json({ error: { code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập.' } }, 401)
  if ((session.user as { role?: string }).role !== 'admin') {
    return c.json({ error: { code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập.' } }, 403)
  }

  const status = c.req.query('status')
  const query = status
    ? `SELECT id, order_code, customer_id, template_id, status, payment_status, event_date, created_at, updated_at
       FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT 100`
    : `SELECT id, order_code, customer_id, template_id, status, payment_status, event_date, created_at, updated_at
       FROM orders ORDER BY created_at DESC LIMIT 100`
  const result = status
    ? await c.env.DB.prepare(query).bind(status).all()
    : await c.env.DB.prepare(query).all()

  return c.json({ data: result.results })
})
