const LOCAL_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173'])

export function requiredString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null
}

export function optionalString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === '') return null
  return requiredString(value, maxLength)
}

export function boundedInteger(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return null
  return parsed
}

export function enumValue<T extends string>(value: unknown, values: readonly T[]): T | null {
  return typeof value === 'string' && values.includes(value as T) ? value as T : null
}

export function isSameOriginMutation(request: Request, trustedOrigin: string): boolean {
  const origin = request.headers.get('Origin')
  if (!origin) return false
  return origin === trustedOrigin || LOCAL_ORIGINS.has(origin)
}

export function normalizeEmail(value: unknown): string | null {
  const email = requiredString(value, 320)?.toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export function safeReturnPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  return value
}
