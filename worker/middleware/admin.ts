import { createAuth } from '../modules/auth/auth'
import { responseError } from '../lib/http'
import { isSameOriginMutation } from '../lib/validation'

export interface AdminActor {
  id: string
  name: string
  email: string
  role: 'admin'
  status: 'active'
}

export async function requireAdmin(request: Request, env: Env): Promise<AdminActor | Response> {
  let session: Awaited<ReturnType<ReturnType<typeof createAuth>['api']['getSession']>>
  try {
    session = await createAuth(env).api.getSession({ headers: request.headers })
  } catch (error) {
    console.error(JSON.stringify({
      message: 'admin session lookup failed',
      error: error instanceof Error ? error.message : String(error),
    }))
    return responseError(request, 503, 'AUTH_UNAVAILABLE', 'Không thể kiểm tra phiên đăng nhập lúc này.')
  }

  const sessionUserId = session?.user?.id
  if (!sessionUserId) return responseError(request, 401, 'UNAUTHORIZED', 'Bạn cần đăng nhập.')

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !isSameOriginMutation(request, env.BETTER_AUTH_URL)) {
    return responseError(request, 403, 'INVALID_ORIGIN', 'Nguồn yêu cầu không hợp lệ.')
  }

  const row = await env.DB.prepare(
    `SELECT id, name, email, role, status
     FROM user
     WHERE id = ?
     LIMIT 1`,
  ).bind(sessionUserId).first<{
    id: string
    name: string
    email: string
    role: string
    status: string
  }>()

  if (!row || row.role !== 'admin' || row.status !== 'active') {
    return responseError(request, 403, 'FORBIDDEN', 'Bạn không có quyền truy cập khu vực này.')
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: 'admin',
    status: 'active',
  }
}
