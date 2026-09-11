const MAX_LIMIT = 50

type CursorPayload = {
  createdAt: number
  id: string
}

function encode(value: CursorPayload): string {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decode(value: string): CursorPayload | null {
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4)
    const parsed: unknown = JSON.parse(atob(padded))
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Record<string, unknown>
    if (!Number.isSafeInteger(candidate.createdAt) || typeof candidate.id !== 'string' || candidate.id.length === 0 || candidate.id.length > 128) {
      return null
    }
    return { createdAt: candidate.createdAt as number, id: candidate.id }
  } catch {
    return null
  }
}

export function parseLimit(value: string | undefined, fallback = 25): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return Math.min(Math.max(fallback, 1), MAX_LIMIT)
  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_LIMIT)
}

export function parseCursor(value: string | undefined): CursorPayload | null {
  if (!value || value.length > 512) return null
  return decode(value)
}

export function createCursor(createdAt: number, id: string): string {
  return encode({ createdAt, id })
}

export const MAX_PAGE_LIMIT = MAX_LIMIT
