import { auditStatement } from './audit'

export const ORDER_STATUSES = [
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

export type OrderStatus = typeof ORDER_STATUSES[number]

export const PAYMENT_STATUSES = ['unpaid', 'pending_verification', 'paid', 'refunded'] as const
export type PaymentStatus = typeof PAYMENT_STATUSES[number]

const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  draft: ['submitted'],
  submitted: ['reviewing', 'cancelled'],
  reviewing: ['awaiting_customer', 'confirmed', 'cancelled'],
  awaiting_customer: ['reviewing', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && ORDER_STATUSES.includes(value as OrderStatus)
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === 'string' && PAYMENT_STATUSES.includes(value as PaymentStatus)
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to)
}

export function availableOrderTransitions(status: OrderStatus): OrderStatus[] {
  return [...ORDER_TRANSITIONS[status]]
}

export async function transitionOrder(
  db: D1Database,
  input: {
    orderId: string
    fromStatus: OrderStatus
    toStatus: OrderStatus
    actorId: string
    reason: string
    expectedUpdatedAt: number
    now: number
  },
): Promise<'updated' | 'conflict' | 'not_found'> {
  const current = await db.prepare('SELECT status, updated_at AS updatedAt FROM orders WHERE id = ? LIMIT 1').bind(input.orderId).first<{ status: string; updatedAt: number }>()
  if (!current) return 'not_found'
  if (current.status !== input.fromStatus || Number(current.updatedAt) !== input.expectedUpdatedAt) return 'conflict'

  const update = db.prepare(
    `UPDATE orders
     SET status = ?, updated_at = ?
     WHERE id = ? AND status = ? AND updated_at = ?`,
  ).bind(input.toStatus, input.now, input.orderId, input.fromStatus, input.expectedUpdatedAt)
  const history = db.prepare(
    `INSERT INTO order_status_history
       (id, order_id, from_status, to_status, actor_id, reason, created_at, updated_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?
     WHERE changes() > 0`,
  ).bind(crypto.randomUUID(), input.orderId, input.fromStatus, input.toStatus, input.actorId, input.reason, input.now, input.now)
  const audit = auditStatement({
    actorId: input.actorId,
    action: 'order.status_changed',
    entityType: 'order',
    entityId: input.orderId,
    metadata: { fromStatus: input.fromStatus, toStatus: input.toStatus },
  }, input.now, db)

  const result = await db.batch([update, history, audit])
  return Number(result[0]?.meta?.changes || 0) === 1 ? 'updated' : 'conflict'
}
