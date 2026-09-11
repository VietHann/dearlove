import { Hono } from 'hono'
import { jsonData, jsonError } from '../../lib/http'
import { normalizeEmail } from '../../lib/validation'

export const publicNewsletterApi = new Hono<{ Bindings: Env }>()

publicNewsletterApi.post('/', async c => {
  let body: { email?: unknown; website?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu đăng ký không hợp lệ.') }
  if (typeof body.website === 'string' && body.website.trim()) return jsonData(c, { subscribed: true })
  const email = normalizeEmail(body.email)
  if (!email) return jsonError(c, 422, 'VALIDATION_ERROR', 'Email không hợp lệ.')
  const now = Date.now()
  try {
    await c.env.DB.prepare(
      `INSERT INTO newsletter_subscribers (id, email, status, consent_at, unsubscribed_at, created_at, updated_at)
       VALUES (?, ?, 'active', ?, NULL, ?, ?)
       ON CONFLICT(email) DO UPDATE SET status = 'active', consent_at = excluded.consent_at, unsubscribed_at = NULL, updated_at = excluded.updated_at`,
    ).bind(crypto.randomUUID(), email, now, now, now).run()
  } catch (error) {
    console.error(JSON.stringify({ message: 'newsletter subscription failed', error: error instanceof Error ? error.message : String(error) }))
    return jsonError(c, 500, 'NEWSLETTER_CREATE_FAILED', 'Không thể đăng ký nhận tin lúc này.')
  }
  return jsonData(c, { subscribed: true }, 201)
})
