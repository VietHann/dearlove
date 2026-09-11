import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileImage, ImagePlus, LockKeyhole, RefreshCw, Save, Trash2, UploadCloud } from 'lucide-react'
import { AdminApiError, adminApi } from '../../lib/admin-api'

interface MediaAsset {
  id: string
  bucket: 'public' | 'private'
  purpose: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  originalFilename: string | null
  altText: string | null
  status: string
  publicUrl: string | null
  createdAt: number
}

interface MediaResponse { data: { items: MediaAsset[]; nextCursor: string | null } }

const PURPOSES = [
  ['marketing_image', 'Ảnh marketing'],
  ['catalog_thumbnail', 'Thumbnail catalog'],
  ['catalog_fullpage', 'Ảnh full-page catalog'],
  ['blog_cover', 'Ảnh cover blog'],
  ['logo', 'Logo'],
  ['private_upload', 'Upload riêng tư'],
  ['payment_proof', 'Chứng từ thanh toán'],
] as const

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function uploadWithProgress(path: string, file: File, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', path)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.addEventListener('progress', event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })
    xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload thất bại.')))
    xhr.addEventListener('error', () => reject(new Error('Không thể kết nối tới bộ nhớ file.')))
    xhr.send(file)
  })
}

export default function AdminMedia() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [bucket, setBucket] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('')
  const [status, setStatus] = useState('ready')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadBucket, setUploadBucket] = useState<'public' | 'private'>('public')
  const [purpose, setPurpose] = useState('marketing_image')
  const [altText, setAltText] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [editingAlt, setEditingAlt] = useState<Record<string, string>>({})
  const [savingAssetId, setSavingAssetId] = useState('')

  const loadAssets = useCallback(async (cursor?: string, append = false) => {
    setIsLoading(!append)
    setError('')
    const params = new URLSearchParams({ limit: '24' })
    if (bucket) params.set('bucket', bucket)
    if (purposeFilter) params.set('purpose', purposeFilter)
    if (status) params.set('status', status)
    if (cursor) params.set('cursor', cursor)
    try {
      const response = await adminApi<MediaResponse>(`/api/v1/admin/media?${params.toString()}`)
      setAssets(current => append ? [...current, ...response.data.items] : response.data.items)
      setNextCursor(response.data.nextCursor)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải thư viện ảnh.')
      if (!append) setAssets([])
    } finally { setIsLoading(false) }
  }, [bucket, purposeFilter, status])

  useEffect(() => { void loadAssets() }, [loadAssets])

  const visiblePurposes = useMemo(() => PURPOSES.filter(([value]) => uploadBucket === 'public' ? !['private_upload', 'payment_proof'].includes(value) : true), [uploadBucket])
  useEffect(() => {
    if (!visiblePurposes.some(([value]) => value === purpose)) setPurpose(visiblePurposes[0]?.[0] || 'marketing_image')
  }, [purpose, visiblePurposes])

  const upload = async () => {
    if (!file) return
    setUploadError('')
    setUploadProgress(0)
    try {
      const prepared = await adminApi<{ data: { assetId: string; uploadPath: string } }>('/api/v1/admin/media/prepare', {
        method: 'POST',
        body: JSON.stringify({ bucket: uploadBucket, purpose, filename: file.name, contentType: file.type, sizeBytes: file.size, altText: altText.trim() || null }),
      })
      await uploadWithProgress(prepared.data.uploadPath, file, setUploadProgress)
      await adminApi(`/api/v1/admin/media/${prepared.data.assetId}/complete`, { method: 'POST' })
      setFile(null)
      setAltText('')
      setUploadProgress(null)
      const input = document.getElementById('admin-media-file') as HTMLInputElement | null
      if (input) input.value = ''
      await loadAssets()
    } catch (cause) {
      setUploadError(cause instanceof AdminApiError ? cause.message : cause instanceof Error ? cause.message : 'Upload thất bại.')
      setUploadProgress(null)
    }
  }

  const saveAltText = async (asset: MediaAsset) => {
    setSavingAssetId(asset.id)
    try {
      await adminApi(`/api/v1/admin/media/${asset.id}`, { method: 'PATCH', body: JSON.stringify({ altText: editingAlt[asset.id] ?? asset.altText ?? null }) })
      setAssets(current => current.map(item => item.id === asset.id ? { ...item, altText: editingAlt[asset.id] ?? null } : item))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu alt text.') }
    finally { setSavingAssetId('') }
  }

  const deleteAsset = async (asset: MediaAsset) => {
    if (!window.confirm(`Xóa media “${asset.originalFilename || asset.id}”?`)) return
    try {
      await adminApi(`/api/v1/admin/media/${asset.id}`, { method: 'DELETE' })
      setAssets(current => current.filter(item => item.id !== asset.id))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xóa media.') }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Content / Media</p><h1 className="admin-page-title">Thư viện ảnh</h1><p className="admin-page-description">Quản lý ảnh catalog, marketing và file riêng tư trong hai vùng lưu trữ tách biệt.</p></div><button type="button" className="admin-secondary-button" onClick={() => void loadAssets()} disabled={isLoading}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Làm mới</button></div>

      <section className="admin-media-upload-panel"><div className="admin-panel-heading"><div><p className="admin-panel-kicker">Upload mới</p><h2>Thêm media</h2></div><UploadCloud size={20} className="text-[#d9a441]" aria-hidden="true" /></div><div className="admin-media-upload-grid"><label className="admin-field"><span>Vùng lưu trữ</span><select value={uploadBucket} onChange={event => setUploadBucket(event.target.value as 'public' | 'private')}><option value="public">Public catalog/marketing</option><option value="private">Private uploads</option></select></label><label className="admin-field"><span>Mục đích</span><select value={purpose} onChange={event => setPurpose(event.target.value)}>{visiblePurposes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="admin-field admin-media-file-field"><span>File</span><input id="admin-media-file" type="file" accept={uploadBucket === 'private' ? 'image/*,.pdf' : 'image/*'} onChange={event => setFile(event.target.files?.[0] || null)} /></label><label className="admin-field"><span>Alt text</span><input value={altText} onChange={event => setAltText(event.target.value)} maxLength={300} placeholder="Mô tả ảnh cho accessibility" /></label></div><div className="admin-upload-actions">{file && <span className="admin-selected-file"><FileImage size={16} aria-hidden="true" /> {file.name} · {formatBytes(file.size)}</span>}<button type="button" className="admin-primary-button" onClick={() => void upload()} disabled={!file || uploadProgress !== null}>{uploadProgress !== null ? `Đang upload ${uploadProgress}%` : <><ImagePlus size={15} aria-hidden="true" /> Upload media</>}</button></div>{uploadProgress !== null && <div className="admin-progress" aria-label={`Upload ${uploadProgress}%`}><span style={{ width: `${uploadProgress}%` }} /></div>}{uploadError && <p className="admin-inline-error" role="alert">{uploadError}</p>}</section>

      <section className="admin-toolbar"><label className="admin-field admin-toolbar-field"><span className="sr-only">Bucket</span><select value={bucket} onChange={event => setBucket(event.target.value)}><option value="">Tất cả vùng</option><option value="public">Public</option><option value="private">Private</option></select></label><label className="admin-field admin-toolbar-field"><span className="sr-only">Mục đích</span><select value={purposeFilter} onChange={event => setPurposeFilter(event.target.value)}><option value="">Tất cả mục đích</option>{PURPOSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="admin-field admin-toolbar-field"><span className="sr-only">Trạng thái</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="ready">Sẵn sàng</option><option value="pending">Đang chờ</option><option value="deleted">Đã xóa</option><option value="">Tất cả trạng thái</option></select></label></section>

      {error && <div className="admin-alert admin-alert-error" role="alert"><strong>Media có lỗi.</strong><span>{error}</span><button type="button" onClick={() => void loadAssets()}>Thử lại</button></div>}
      <section className="admin-media-grid" aria-live="polite">{isLoading ? <div className="admin-media-empty"><RefreshCw size={22} className="animate-spin" aria-hidden="true" /><span>Đang tải thư viện ảnh...</span></div> : assets.length === 0 ? <div className="admin-media-empty"><ImagePlus size={24} aria-hidden="true" /><strong>Chưa có media phù hợp</strong><span>Upload ảnh đầu tiên ở khu vực phía trên.</span></div> : assets.map(asset => <article className="admin-media-card" key={asset.id}><div className="admin-media-preview">{asset.publicUrl && asset.mimeType.startsWith('image/') ? <img src={asset.publicUrl} alt={asset.altText || asset.originalFilename || 'Media Dearlove'} loading="lazy" /> : <div className="admin-media-private"><LockKeyhole size={24} aria-hidden="true" /><span>{asset.bucket === 'private' ? 'Private' : asset.status}</span></div>}<span className={`admin-media-status ${asset.status === 'ready' ? 'is-ready' : ''}`}>{asset.status}</span></div><div className="admin-media-card-body"><div className="admin-media-card-title"><strong title={asset.originalFilename || asset.id}>{asset.originalFilename || 'Không có tên file'}</strong><span>{asset.bucket} · {formatBytes(asset.sizeBytes)}</span></div><span className="admin-media-purpose">{PURPOSES.find(([value]) => value === asset.purpose)?.[1] || asset.purpose}</span><label className="admin-field"><span>Alt text</span><input value={editingAlt[asset.id] ?? asset.altText ?? ''} onChange={event => setEditingAlt(current => ({ ...current, [asset.id]: event.target.value }))} placeholder="Chưa có alt text" maxLength={300} /></label><div className="admin-media-card-actions"><button type="button" className="admin-secondary-button" onClick={() => void saveAltText(asset)} disabled={savingAssetId === asset.id}><Save size={14} aria-hidden="true" /> {savingAssetId === asset.id ? 'Đang lưu' : 'Lưu alt text'}</button><button type="button" className="admin-danger-button" onClick={() => void deleteAsset(asset)}><Trash2 size={14} aria-hidden="true" /> Xóa</button></div></div></article>)}</section>{nextCursor && <div className="admin-list-footer"><button type="button" className="admin-secondary-button" onClick={() => void loadAssets(nextCursor, true)} disabled={isLoading}>Tải thêm media</button></div>}
    </div>
  )
}
