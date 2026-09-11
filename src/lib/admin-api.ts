export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
  }
  requestId?: string
}

export class AdminApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (typeof init.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  })

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const errorBody = (body && typeof body === 'object' ? body : {}) as ApiErrorBody
    throw new AdminApiError(
      response.status,
      errorBody.error?.code || 'REQUEST_FAILED',
      errorBody.error?.message || 'Không thể hoàn tất yêu cầu.',
      errorBody.requestId,
    )
  }

  return body as T
}

export function adminReturnTo(pathname: string, search = ''): string {
  const path = `${pathname}${search}`
  const safePath = path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') ? path : '/admin'
  return `/auth?mode=login&returnTo=${encodeURIComponent(safePath)}`
}
