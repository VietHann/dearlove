export type MediaBucketName = 'public' | 'private'

export function mediaBucket(env: Env, bucket: MediaBucketName): R2Bucket {
  return bucket === 'public' ? env.PUBLIC_MEDIA : env.PRIVATE_UPLOADS
}

export async function putMediaStream(
  bucket: R2Bucket,
  objectKey: string,
  body: ReadableStream<Uint8Array>,
  contentType: string,
  filename: string | null,
) {
  await bucket.put(objectKey, body, {
    httpMetadata: {
      contentType,
      contentDisposition: filename ? `inline; filename="${filename.replaceAll('"', '')}"` : undefined,
    },
  })
}

export async function getMediaResponse(
  bucket: R2Bucket,
  objectKey: string,
  cacheControl: string,
): Promise<Response | null> {
  const object = await bucket.get(objectKey)
  if (!object || !('body' in object)) return null

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', cacheControl)
  headers.set('Content-Length', String(object.size))
  return new Response(object.body, { status: 200, headers })
}
