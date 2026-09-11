import { Hono, type Context } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { jsonData, jsonError } from '../../lib/http'

const TEMPLATE_ID_RE = /^[A-Za-z0-9_-]{1,128}$/
const MAX_JSON_BODY_BYTES = 256 * 1024
const MAX_UPLOAD_BODY_BYTES = 8 * 1024 * 1024
const LOCAL_RENDERER_HOSTS = new Set(['localhost', '127.0.0.1'])

type RendererEnv = Env & {
  INVITATION_RENDERER_URL?: string
  INVITATION_RENDERER_TOKEN?: string
}

type RendererResult =
  | { kind: 'response'; response: Response }
  | { kind: 'not_configured' }
  | { kind: 'unavailable' }

function rendererEnvironment(env: Env): RendererEnv {
  return env as RendererEnv
}

function rendererOrigin(request: Request, env: Env): string | null {
  const configured = rendererEnvironment(env).INVITATION_RENDERER_URL?.trim()
  if (configured) {
    try {
      const url = new URL(configured)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
      return url.toString().replace(/\/+$/, '')
    } catch {
      return null
    }
  }

  // Local-only convenience. Production without explicit config must never use localhost.
  const requestHost = new URL(request.url).hostname
  return LOCAL_RENDERER_HOSTS.has(requestHost) ? 'http://127.0.0.1:8000' : null
}

function rendererUrl(request: Request, env: Env, path: string): string | null {
  const origin = rendererOrigin(request, env)
  if (!origin) return null
  return new URL(path, `${origin}/`).toString()
}

function rendererHeaders(env: Env, headers?: HeadersInit): Headers {
  const result = new Headers(headers)
  const token = rendererEnvironment(env).INVITATION_RENDERER_TOKEN?.trim()
  if (token) result.set('X-Invitation-Renderer-Token', token)
  return result
}

async function fetchRenderer(
  request: Request,
  env: Env,
  path: string,
  init: RequestInit = {},
): Promise<RendererResult> {
  const target = rendererUrl(request, env, path)
  if (!target) return { kind: 'not_configured' }

  try {
    const upstreamRequest = new Request(target, {
      ...init,
      headers: rendererHeaders(env, init.headers),
      redirect: 'manual',
      signal: request.signal,
    })
    return { kind: 'response', response: await fetch(upstreamRequest) }
  } catch (error) {
    console.error(JSON.stringify({
      message: 'invitation renderer request failed',
      path,
      error: error instanceof Error ? error.message : String(error),
    }))
    return { kind: 'unavailable' }
  }
}

function validTemplateId(value: string): string | null {
  return TEMPLATE_ID_RE.test(value) ? value : null
}

function bodyTooLarge(request: Request, limit: number): boolean {
  const contentLength = Number(request.headers.get('Content-Length'))
  return Number.isFinite(contentLength) && contentLength > limit
}

async function rendererError(c: Context, result: RendererResult): Promise<Response> {
  if (result.kind === 'not_configured') {
    return jsonError(c, 503, 'INVITATION_RENDERER_NOT_CONFIGURED', 'Template Studio chưa được cấu hình renderer.')
  }
  if (result.kind === 'unavailable') {
    return jsonError(c, 502, 'INVITATION_RENDERER_UNAVAILABLE', 'Không thể kết nối tới renderer template.')
  }
  if (result.response.status === 404) {
    return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy mẫu thiệp.')
  }
  if ([400, 415, 422].includes(result.response.status)) {
    return jsonError(c, 422, 'RENDERER_VALIDATION_ERROR', 'Dữ liệu preview không hợp lệ.')
  }
  return jsonError(c, 502, 'INVITATION_RENDERER_UNAVAILABLE', 'Renderer template không phản hồi hợp lệ.')
}

async function readJsonResponse(response: Response): Promise<unknown | null> {
  try {
    return await response.json() as unknown
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export const adminInvitationTemplatesApi = new Hono<{ Bindings: Env }>()

adminInvitationTemplatesApi.get('/status', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const origin = rendererOrigin(c.req.raw, c.env)
  if (!origin) return jsonData(c, { configured: false, available: false })
  const result = await fetchRenderer(c.req.raw, c.env, '/health', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (result.kind !== 'response') return jsonData(c, { configured: true, available: false })
  return jsonData(c, { configured: true, available: result.response.ok })
})

adminInvitationTemplatesApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const result = await fetchRenderer(c.req.raw, c.env, '/api/templates', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (result.kind !== 'response' || !result.response.ok) return rendererError(c, result)
  const payload = await readJsonResponse(result.response)
  if (!Array.isArray(payload)) return jsonError(c, 502, 'INVITATION_RENDERER_INVALID_RESPONSE', 'Renderer trả dữ liệu danh sách không hợp lệ.')

  const items = payload.filter(isRecord).map(item => ({
    id: typeof item.id === 'string' ? item.id : '',
    name: typeof item.name === 'string' ? item.name : 'Mẫu thiệp',
    text_fields: typeof item.text_fields === 'number' ? item.text_fields : 0,
    image_fields: typeof item.image_fields === 'number' ? item.image_fields : 0,
    ready: item.ready !== false,
  })).filter(item => validTemplateId(item.id) !== null)
  return jsonData(c, { items })
})

adminInvitationTemplatesApi.get('/:templateId/schema', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const id = validTemplateId(c.req.param('templateId'))
  if (!id) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy mẫu thiệp.')
  const result = await fetchRenderer(c.req.raw, c.env, `/api/templates/${encodeURIComponent(id)}/schema`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (result.kind !== 'response' || !result.response.ok) return rendererError(c, result)
  const payload = await readJsonResponse(result.response)
  if (!isRecord(payload)) return jsonError(c, 502, 'INVITATION_RENDERER_INVALID_RESPONSE', 'Renderer trả manifest không hợp lệ.')
  return jsonData(c, payload)
})

adminInvitationTemplatesApi.post('/:templateId/preview', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const id = validTemplateId(c.req.param('templateId'))
  if (!id) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy mẫu thiệp.')
  if (bodyTooLarge(c.req.raw, MAX_JSON_BODY_BYTES)) return jsonError(c, 413, 'BODY_TOO_LARGE', 'Dữ liệu preview vượt quá giới hạn.')

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu preview không hợp lệ.')
  }
  if (!isRecord(body)) return jsonError(c, 422, 'VALIDATION_ERROR', 'Dữ liệu preview không hợp lệ.')
  const fields = isRecord(body.fields) ? body.fields : {}
  const images = isRecord(body.images) ? body.images : {}
  const result = await fetchRenderer(c.req.raw, c.env, '/api/render/data', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: id,
      fields,
      images,
      standalone: body.standalone === true,
      strip_editable_attributes: body.strip_editable_attributes === true,
      output_mode: 'html',
    }),
  })
  if (result.kind !== 'response' || !result.response.ok) return rendererError(c, result)
  const response = await readJsonResponse(result.response)
  if (!isRecord(response) || typeof response.html !== 'string') return jsonError(c, 502, 'INVITATION_RENDERER_INVALID_RESPONSE', 'Renderer không trả preview hợp lệ.')
  return jsonData(c, {
    templateId: id,
    html: response.html,
    warnings: Array.isArray(response.warnings) ? response.warnings.filter(item => typeof item === 'string').slice(0, 20) : [],
  })
})

adminInvitationTemplatesApi.post('/:templateId/preview/upload', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const id = validTemplateId(c.req.param('templateId'))
  if (!id) return jsonError(c, 404, 'TEMPLATE_NOT_FOUND', 'Không tìm thấy mẫu thiệp.')
  if (!/^multipart\/form-data(?:;|$)/i.test(c.req.header('Content-Type') || '')) return jsonError(c, 415, 'MULTIPART_REQUIRED', 'Preview ảnh cần dữ liệu multipart.')
  if (bodyTooLarge(c.req.raw, MAX_UPLOAD_BODY_BYTES)) return jsonError(c, 413, 'BODY_TOO_LARGE', 'Tổng dung lượng ảnh preview vượt quá 8 MB.')
  if (!c.req.raw.body) return jsonError(c, 400, 'EMPTY_UPLOAD', 'Không có dữ liệu ảnh preview.')

  const contentType = c.req.header('Content-Type') as string
  const result = await fetchRenderer(c.req.raw, c.env, '/api/render/upload', {
    method: 'POST',
    headers: { Accept: 'text/html', 'Content-Type': contentType },
    body: c.req.raw.body,
  })
  if (result.kind !== 'response' || !result.response.ok) return rendererError(c, result)
  const html = await result.response.text()
  if (html.length > 16 * 1024 * 1024) return jsonError(c, 413, 'PREVIEW_TOO_LARGE', 'HTML preview sau khi nhúng ảnh quá lớn.')
  const warningCount = Number(result.response.headers.get('X-Render-Warnings') || 0)
  return jsonData(c, {
    templateId: id,
    html,
    warnings: Number.isSafeInteger(warningCount) && warningCount > 0 ? [`Renderer báo ${warningCount} cảnh báo.`] : [],
  })
})
