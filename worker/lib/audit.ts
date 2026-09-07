const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'verification',
  'privatekey',
  'objectkey',
  'body',
  'email',
  'phone',
])

type AuditValue = string | number | boolean | null

function cleanMetadata(metadata: Record<string, AuditValue> | undefined): Record<string, AuditValue> | undefined {
  if (!metadata) return undefined
  const clean: Record<string, AuditValue> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) continue
    if (typeof value === 'string' && value.length > 240) {
      clean[key] = `${value.slice(0, 237)}...`
    } else {
      clean[key] = value
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined
}

export function auditStatement(
  input: {
    actorId: string
    action: string
    entityType: string
    entityId: string
    metadata?: Record<string, AuditValue>
  },
  now: number,
  db: D1Database,
): D1PreparedStatement {
  const metadata = cleanMetadata(input.metadata)
  return db.prepare(
    `INSERT INTO audit_logs
       (id, actor_id, action, entity_type, entity_id, metadata_json, created_at, updated_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?
     WHERE changes() > 0`,
  ).bind(
    crypto.randomUUID(),
    input.actorId,
    input.action,
    input.entityType,
    input.entityId,
    metadata ? JSON.stringify(metadata) : null,
    now,
    now,
  )
}

export function orderRequestStatement(
  db: D1Database,
  input: { id: string; idempotencyKey: string; customerId: string; orderId: string; now: number },
): D1PreparedStatement {
  return db.prepare(
    `INSERT INTO order_requests (id, idempotency_key, customer_id, order_id, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(input.id, input.idempotencyKey, input.customerId, input.orderId, input.now)
}

export function maskedEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  return `${local.slice(0, 1)}***@${domain}`
}
