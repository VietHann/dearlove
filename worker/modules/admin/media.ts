import { Hono } from 'hono'
import { requireAdmin } from '../../middleware/admin'
import { auditStatement } from '../../lib/audit'
import { jsonData, jsonError } from '../../lib/http'
import { createCursor, parseCursor, parseLimit } from '../../lib/pagination'
import { enumValue, requiredString, boundedInteger } from '../../lib/validation'
import { mediaBucket, putMediaStream, type MediaBucketName } from '../media/storage'

const ADMIN_PURPOSES = ['catalog_thumbnail', 'catalog_fullpage', 'blog_cover', 'marketing_image', 'logo', 'private_upload', 'payment_proof'] as const
const PUBLIC_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
const PRIVATE_MIME_TYPES = [...PUBLIC_MIME_TYPES, 'application/pdf'] as const
const MAX_PUBLIC_BYTES = 20 * 1024 * 1024
const MAX_PRIVATE_BYTES = 25 * 1024 * 1024

type MediaPurpose = typeof ADMIN_PURPOSES[number]

function safeExtension(filename: string, contentType: string): string {
  const provided = filename.toLowerCase().split('.').pop()?.replace(/[^a-z0-9]/g, '') || ''
  if (provided && provided.length <= 8) return provided
  return contentType === 'application/pdf' ? 'pdf' : contentType.split('/')[1] || 'bin'
}

function isPublicPurpose(purpose: MediaPurpose): boolean {
  return ['catalog_thumbnail', 'catalog_fullpage', 'blog_cover', 'marketing_image', 'logo'].includes(purpose)
}

function mapAsset(row: Record<string, unknown>) {
  const bucket = row.bucket === 'private' ? 'private' : 'public'
  const status = String(row.status || 'pending')
  return {
    id: String(row.id),
    bucket,
    purpose: String(row.purpose),
    mimeType: String(row.mimeType || ''),
    sizeBytes: Number(row.sizeBytes || 0),
    width: row.width === null || row.width === undefined ? null : Number(row.width),
    height: row.height === null || row.height === undefined ? null : Number(row.height),
    checksum: row.checksum ? String(row.checksum) : null,
    originalFilename: row.originalFilename ? String(row.originalFilename) : null,
    altText: row.altText ? String(row.altText) : null,
    visibility: bucket,
    status,
    ownerId: row.ownerId ? String(row.ownerId) : null,
    createdAt: Number(row.createdAt || 0),
    updatedAt: Number(row.updatedAt || 0),
    publicUrl: bucket === 'public' && status === 'ready' ? `/api/v1/media/public/${String(row.id)}` : null,
  }
}

export const adminMediaApi = new Hono<{ Bindings: Env }>()

adminMediaApi.get('/', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const bucket = enumValue(c.req.query('bucket'), ['public', 'private'] as const)
  const purpose = enumValue(c.req.query('purpose'), ADMIN_PURPOSES)
  const status = enumValue(c.req.query('status'), ['pending', 'ready', 'deleted'] as const)
  const query = c.req.query('q')?.trim().slice(0, 120) || ''
  const cursorValue = c.req.query('cursor')
  const cursor = parseCursor(cursorValue)
  const limit = parseLimit(c.req.query('limit'))
  if (cursorValue && !cursor) return jsonError(c, 400, 'INVALID_CURSOR', 'Con trỏ phân trang không hợp lệ.')

  const where: string[] = []
  const binds: Array<string | number> = []
  if (bucket) { where.push('m.bucket = ?'); binds.push(bucket) }
  if (purpose) { where.push('m.purpose = ?'); binds.push(purpose) }
  if (status) { where.push('m.status = ?'); binds.push(status) }
  if (query) { where.push('(m.original_filename LIKE ? OR m.alt_text LIKE ? OR m.purpose LIKE ?)'); const search = `%${query.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`; binds.push(search, search, search) }
  if (cursor) { where.push('(m.created_at < ? OR (m.created_at = ? AND m.id < ?))'); binds.push(cursor.createdAt, cursor.createdAt, cursor.id) }
  const sql = `SELECT m.id, m.bucket, m.purpose, m.mime_type AS mimeType, m.size_bytes AS sizeBytes,
                      m.width, m.height, m.checksum, m.original_filename AS originalFilename,
                      m.alt_text AS altText, m.visibility, m.status, m.owner_id AS ownerId,
                      m.created_at AS createdAt, m.updated_at AS updatedAt
               FROM media_assets m
               ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY m.created_at DESC, m.id DESC
               LIMIT ?`
  binds.push(limit + 1)
  const result = await c.env.DB.prepare(sql).bind(...binds).all<Record<string, unknown>>()
  const rows = result.results.map(mapAsset)
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]
  return jsonData(c, { items, nextCursor: hasMore && last ? createCursor(last.createdAt, last.id) : null })
})

adminMediaApi.post('/prepare', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const contentLength = Number(c.req.header('Content-Length'))
  if (Number.isFinite(contentLength) && contentLength > 64 * 1024) return jsonError(c, 413, 'BODY_TOO_LARGE', 'Thông tin upload vượt quá giới hạn.')
  let body: { bucket?: unknown; purpose?: unknown; filename?: unknown; contentType?: unknown; sizeBytes?: unknown; altText?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu upload không hợp lệ.') }
  const purpose = enumValue(body.purpose, ADMIN_PURPOSES)
  const filename = requiredString(body.filename, 180)
  const contentType = requiredString(body.contentType, 100)
  const sizeBytes = boundedInteger(body.sizeBytes, 1, MAX_PRIVATE_BYTES)
  const bucket = enumValue(body.bucket, ['public', 'private'] as const)
  const altText = body.altText === null || body.altText === undefined ? null : requiredString(body.altText, 300)
  if (!purpose || !filename || !contentType || sizeBytes === null || !bucket) return jsonError(c, 422, 'VALIDATION_ERROR', 'Tên file, loại file, kích thước và mục đích là bắt buộc.')
  if (bucket === 'public' && (!isPublicPurpose(purpose) || !(PUBLIC_MIME_TYPES as readonly string[]).includes(contentType) || sizeBytes > MAX_PUBLIC_BYTES)) return jsonError(c, 422, 'MEDIA_NOT_ALLOWED', 'Media public không đáp ứng định dạng hoặc kích thước cho phép.')
  if (bucket === 'private' && (!(PRIVATE_MIME_TYPES as readonly string[]).includes(contentType) || (purpose === 'payment_proof' && contentType !== 'application/pdf' && !contentType.startsWith('image/')))) return jsonError(c, 422, 'MEDIA_NOT_ALLOWED', 'Media private không đáp ứng định dạng cho phép.')

  const assetId = crypto.randomUUID()
  const now = Date.now()
  const objectKey = `admin/${actor.id}/${assetId}.${safeExtension(filename, contentType)}`
  const insert = c.env.DB.prepare(
    `INSERT INTO media_assets
       (id, bucket, object_key, purpose, owner_id, mime_type, size_bytes, original_filename, alt_text, visibility, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
  ).bind(assetId, bucket, objectKey, purpose, actor.id, contentType, sizeBytes, filename, altText, bucket, now, now)
  const audit = auditStatement({ actorId: actor.id, action: 'media.prepare', entityType: 'media_asset', entityId: assetId, metadata: { bucket, purpose, sizeBytes } }, now, c.env.DB)
  await c.env.DB.batch([insert, audit])
  return jsonData(c, { assetId, uploadPath: `/api/v1/admin/media/upload/${assetId}`, expiresAt: now + 10 * 60 * 1000 }, 201)
})

adminMediaApi.put('/upload/:assetId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const asset = await c.env.DB.prepare(
    `SELECT id, bucket, object_key AS objectKey, mime_type AS mimeType, size_bytes AS sizeBytes,
            original_filename AS originalFilename, status, owner_id AS ownerId, created_at AS createdAt
     FROM media_assets WHERE id = ? LIMIT 1`,
  ).bind(c.req.param('assetId')).first<Record<string, unknown>>()
  if (!asset || asset.ownerId !== actor.id || asset.status !== 'pending') return jsonError(c, 404, 'MEDIA_NOT_FOUND', 'Không tìm thấy phiên upload.')
  if (Date.now() - Number(asset.createdAt) > 10 * 60 * 1000) return jsonError(c, 410, 'UPLOAD_EXPIRED', 'Phiên upload đã hết hạn.')
  const contentLength = Number(c.req.header('Content-Length'))
  if (!Number.isSafeInteger(contentLength) || contentLength !== Number(asset.sizeBytes)) return jsonError(c, 422, 'MEDIA_SIZE_MISMATCH', 'Kích thước file không khớp metadata đã đăng ký.')
  if (c.req.header('Content-Type') !== asset.mimeType) return jsonError(c, 422, 'MEDIA_TYPE_MISMATCH', 'Định dạng file không khớp metadata đã đăng ký.')
  if (!c.req.raw.body) return jsonError(c, 400, 'EMPTY_UPLOAD', 'File upload đang trống.')

  await putMediaStream(mediaBucket(c.env, asset.bucket === 'private' ? 'private' : 'public'), String(asset.objectKey), c.req.raw.body, String(asset.mimeType), String(asset.originalFilename || 'file'))
  return jsonData(c, { assetId: String(asset.id), status: 'uploaded' })
})

adminMediaApi.post('/:assetId/complete', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const asset = await c.env.DB.prepare(
    `SELECT id, bucket, object_key AS objectKey, mime_type AS mimeType, size_bytes AS sizeBytes,
            status, owner_id AS ownerId
     FROM media_assets WHERE id = ? LIMIT 1`,
  ).bind(c.req.param('assetId')).first<Record<string, unknown>>()
  if (!asset || asset.ownerId !== actor.id || asset.status !== 'pending') return jsonError(c, 404, 'MEDIA_NOT_FOUND', 'Không tìm thấy media đang chờ.')
  const object = await mediaBucket(c.env, asset.bucket === 'private' ? 'private' : 'public').head(String(asset.objectKey))
  if (!object) return jsonError(c, 422, 'MEDIA_NOT_UPLOADED', 'File chưa được upload đầy đủ.')
  if (object.size !== Number(asset.sizeBytes) || object.httpMetadata?.contentType !== String(asset.mimeType)) return jsonError(c, 422, 'MEDIA_METADATA_MISMATCH', 'Metadata file không khớp.')
  const now = Date.now()
  const update = c.env.DB.prepare("UPDATE media_assets SET status = 'ready', updated_at = ? WHERE id = ? AND owner_id = ? AND status = 'pending'").bind(now, String(asset.id), actor.id)
  const audit = auditStatement({ actorId: actor.id, action: 'media.completed', entityType: 'media_asset', entityId: String(asset.id), metadata: { bucket: String(asset.bucket) } }, now, c.env.DB)
  const result = await c.env.DB.batch([update, audit])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 409, 'MEDIA_CONFLICT', 'Media đã được cập nhật. Vui lòng tải lại.')
  const ready = await c.env.DB.prepare(
    `SELECT id, bucket, purpose, mime_type AS mimeType, size_bytes AS sizeBytes, width, height,
            checksum, original_filename AS originalFilename, alt_text AS altText, visibility, status,
            owner_id AS ownerId, created_at AS createdAt, updated_at AS updatedAt
     FROM media_assets WHERE id = ? LIMIT 1`,
  ).bind(String(asset.id)).first<Record<string, unknown>>()
  return jsonData(c, ready ? mapAsset(ready) : null)
})

adminMediaApi.patch('/:assetId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  let body: { altText?: unknown }
  try { body = await c.req.json() } catch { return jsonError(c, 400, 'INVALID_JSON', 'Dữ liệu không hợp lệ.') }
  const altText = body.altText === null || body.altText === undefined || body.altText === '' ? null : requiredString(body.altText, 300)
  if (body.altText !== null && body.altText !== undefined && body.altText !== '' && !altText) return jsonError(c, 422, 'VALIDATION_ERROR', 'Alt text không hợp lệ.')
  const now = Date.now()
  const update = c.env.DB.prepare('UPDATE media_assets SET alt_text = ?, updated_at = ? WHERE id = ?').bind(altText, now, c.req.param('assetId'))
  const audit = auditStatement({ actorId: actor.id, action: 'media.updated', entityType: 'media_asset', entityId: c.req.param('assetId'), metadata: { hasAltText: Boolean(altText) } }, now, c.env.DB)
  const result = await c.env.DB.batch([update, audit])
  if (Number(result[0]?.meta?.changes || 0) !== 1) return jsonError(c, 404, 'MEDIA_NOT_FOUND', 'Không tìm thấy media.')
  return jsonData(c, { id: c.req.param('assetId'), altText })
})

adminMediaApi.delete('/:assetId', async c => {
  const actor = await requireAdmin(c.req.raw, c.env)
  if (actor instanceof Response) return actor
  const asset = await c.env.DB.prepare('SELECT id, bucket, object_key AS objectKey, status FROM media_assets WHERE id = ? LIMIT 1').bind(c.req.param('assetId')).first<Record<string, unknown>>()
  if (!asset) return jsonError(c, 404, 'MEDIA_NOT_FOUND', 'Không tìm thấy media.')
  const reference = await c.env.DB.prepare(
    `SELECT 1 FROM template_screenshots WHERE media_asset_id = ?
     UNION ALL SELECT 1 FROM pages WHERE seo_image_asset_id = ? LIMIT 1`,
  ).bind(asset.id, asset.id).first()
  if (reference) return jsonError(c, 409, 'MEDIA_IN_USE', 'Media đang được nội dung hoặc catalog sử dụng.')
  await mediaBucket(c.env, asset.bucket === 'private' ? 'private' : 'public').delete(String(asset.objectKey))
  const now = Date.now()
  const update = c.env.DB.prepare("UPDATE media_assets SET status = 'deleted', updated_at = ? WHERE id = ?").bind(now, asset.id)
  const audit = auditStatement({ actorId: actor.id, action: 'media.deleted', entityType: 'media_asset', entityId: String(asset.id), metadata: { bucket: String(asset.bucket) } }, now, c.env.DB)
  await c.env.DB.batch([update, audit])
  return jsonData(c, { id: asset.id, status: 'deleted' })
})

export const publicMediaApi = new Hono<{ Bindings: Env }>()

publicMediaApi.get('/:assetId', async c => {
  const asset = await c.env.DB.prepare(
    `SELECT object_key AS objectKey, mime_type AS mimeType, status, visibility
     FROM media_assets WHERE id = ? AND bucket = 'public' AND visibility = 'public' AND status = 'ready' LIMIT 1`,
  ).bind(c.req.param('assetId')).first<{ objectKey: string; mimeType: string; status: string; visibility: string }>()
  if (!asset) return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } })
  const object = await mediaBucket(c.env, 'public').get(asset.objectKey)
  if (!object || !('body' in object)) return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } })
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=86400, immutable')
  headers.set('Content-Length', String(object.size))
  return new Response(object.body, { headers })
})

export type { MediaBucketName, MediaPurpose }
