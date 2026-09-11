import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { jsonData } from '../../lib/http'

const ORDER_STATUSES = [
  'draft',
  'submitted',
  'reviewing',
  'awaiting_customer',
  'confirmed',
  'in_production',
  'ready',
  'delivered',
  'completed',
  'cancelled',
] as const

export const adminDashboardApi = new Hono<{ Bindings: Env }>()

adminDashboardApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor

  const [orderCountsResult, paymentCountsResult, openContactsResult, overdueResult, recentOrdersResult, recentAuditResult] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT status, COUNT(*) AS count FROM orders GROUP BY status'),
    c.env.DB.prepare('SELECT payment_status AS status, COUNT(*) AS count FROM orders GROUP BY payment_status'),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM contact_submissions WHERE status IN ('new', 'in_progress')"),
    c.env.DB.prepare(
      `SELECT id, order_code AS orderCode, requested_deadline AS requestedDeadline, status
       FROM orders
       WHERE requested_deadline IS NOT NULL
         AND requested_deadline < date('now')
         AND status NOT IN ('completed', 'cancelled', 'delivered')
       ORDER BY requested_deadline ASC
       LIMIT 8`,
    ),
    c.env.DB.prepare(
      `SELECT orders.id, orders.order_code AS orderCode, user.name AS customerName,
              templates.name AS templateName, orders.status, orders.payment_status AS paymentStatus,
              orders.requested_deadline AS requestedDeadline, orders.created_at AS createdAt
       FROM orders
       JOIN user ON user.id = orders.customer_id
       LEFT JOIN templates ON templates.id = orders.template_id
       ORDER BY orders.created_at DESC
       LIMIT 8`,
    ),
    c.env.DB.prepare(
      `SELECT audit_logs.id, audit_logs.action, audit_logs.entity_type AS entityType,
              audit_logs.entity_id AS entityId, audit_logs.created_at AS createdAt,
              user.name AS actorName
       FROM audit_logs
       JOIN user ON user.id = audit_logs.actor_id
       ORDER BY audit_logs.created_at DESC
       LIMIT 8`,
    ),
  ])

  const orderCounts = Object.fromEntries(ORDER_STATUSES.map(status => [status, 0])) as Record<typeof ORDER_STATUSES[number], number>
  for (const row of orderCountsResult.results as Array<{ status?: string; count?: number }>) {
    if (row.status && row.status in orderCounts) orderCounts[row.status as typeof ORDER_STATUSES[number]] = Number(row.count || 0)
  }

  const paymentCounts = Object.fromEntries(
    (paymentCountsResult.results as Array<{ status?: string; count?: number }>).map(row => [row.status || 'unknown', Number(row.count || 0)]),
  )
  const openContacts = Number((openContactsResult.results[0] as { count?: number } | undefined)?.count || 0)

  return jsonData(c, {
    actor: { id: actor.id, name: actor.name },
    orderCounts,
    paymentCounts,
    openContacts,
    overdueOrders: overdueResult.results,
    recentOrders: recentOrdersResult.results,
    recentAuditEvents: recentAuditResult.results,
    generatedAt: Date.now(),
  })
})
