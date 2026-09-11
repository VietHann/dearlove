import { Hono } from 'hono'
import { jsonData, jsonError, parseJsonObject } from '../../lib/http'
import { normalizeEmail, optionalString, requiredString } from '../../lib/validation'

const TOPICS = ['order', 'catalog', 'partnership', 'support', 'other'] as const

export const publicContactApi = new Hono<{ Bindings: Env }>()

publicContactApi.post('/', async c => {
  let body: { name?: unknown; email?: unknown; phone?: unknown; topic?: unknown; message?: unknown; website?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu liên hệ không hợp lệ.') }
  if (typeof body.website === 'string' && body.website.trim()) return jsonData(c, { received: true })
  const name = requiredString(body.name, 160)
  const email = normalizeEmail(body.email)
  const phone = optionalString(body.phone, 40)
  const topic = typeof body.topic === 'string' && TOPICS.includes(body.topic as typeof TOPICS[number]) ? body.topic : null
  const message = requiredString(body.message, 5000)
  if (!name || !email || !topic || !message) return jsonError(c, 422, 'VALIDATION_ERROR', 'Vui lòng kiểm tra họ tên, email, chủ đề và nội dung.')

  const requestKey = c.req.header('Idempotency-Key')?.trim().slice(0, 128) || crypto.randomUUID()
  const existing = await c.env.DB.prepare('SELECT response_json AS responseJson FROM request_deduplication WHERE scope = ? AND request_key = ? LIMIT 1').bind('contact', requestKey).first<{ responseJson: string }>()
  if (existing) return jsonData(c, parseJsonObject(existing.responseJson))

  const dedupId = crypto.randomUUID()
  const now = Date.now()
  const dedup = await c.env.DB.prepare('INSERT OR IGNORE INTO request_deduplication (id, scope, request_key, response_json, created_at) VALUES (?, ?, ?, ?, ?)').bind(dedupId, 'contact', requestKey, JSON.stringify({ received: true }), now).run()
  if (Number(dedup.meta.changes || 0) !== 1) {
    const concurrent = await c.env.DB.prepare('SELECT response_json AS responseJson FROM request_deduplication WHERE scope = ? AND request_key = ? LIMIT 1').bind('contact', requestKey).first<{ responseJson: string }>()
    return jsonData(c, concurrent ? parseJsonObject(concurrent.responseJson) : { received: true })
  }

  const submissionId = crypto.randomUUID()
  try {
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO contact_submissions (id, name, email, phone, topic, message, status, assigned_to, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, \'new\', NULL, ?, ?)').bind(submissionId, name, email, phone, topic, message, now, now),
      c.env.DB.prepare('UPDATE request_deduplication SET response_json = ? WHERE id = ?').bind(JSON.stringify({ received: true }), dedupId),
    ])
  } catch (error) {
    console.error(JSON.stringify({ message: 'contact submission failed', error: error instanceof Error ? error.message : String(error) }))
    return jsonError(c, 500, 'CONTACT_CREATE_FAILED', 'Không thể gửi liên hệ lúc này.')
  }
  return jsonData(c, { received: true }, 201)
})
