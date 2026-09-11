import type { Context } from 'hono'

export function getRequestId(c: Context): string {
  const existing = c.req.header('X-Request-ID')?.trim()
  return existing && existing.length <= 128 ? existing : crypto.randomUUID()
}

function jsonResponse(c: Context, body: unknown, status: number, cacheControl = 'no-store') {
  const requestId = getRequestId(c)
  const headers = new Headers({
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': cacheControl,
    'X-Request-ID': requestId,
  })

  return new Response(JSON.stringify({ ...body as object, requestId }), { status, headers })
}

export function jsonData(c: Context, data: unknown, status = 200, cacheControl = 'no-store') {
  return jsonResponse(c, { data }, status, cacheControl)
}

export function jsonError(c: Context, status: number, code: string, message: string) {
  return jsonResponse(c, { error: { code, message } }, status)
}

export function responseError(request: Request, status: number, code: string, message: string) {
  const requestId = request.headers.get('X-Request-ID')?.trim() || crypto.randomUUID()
  return new Response(JSON.stringify({
    error: { code, message },
    requestId,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-store',
      'X-Request-ID': requestId,
    },
  })
}

export function parseJsonObject<T = Record<string, unknown>>(value: string | null | undefined): T {
  if (!value) return {} as T
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as T : {} as T
  } catch {
    return {} as T
  }
}
