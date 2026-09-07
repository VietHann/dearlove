import { FormEvent, useEffect, useState } from 'react'
import { ImagePlus, Loader2, Save, X } from 'lucide-react'
import { adminApi, AdminApiError } from '../../lib/admin-api'
import type { CatalogCategory, CatalogTemplate } from '../../lib/catalog-api'

interface Props {
  template?: CatalogTemplate | null
  categories: CatalogCategory[]
  onSaved: () => void
  onCancel: () => void
}

export default function AdminTemplateEditor({ template, categories, onSaved, onCancel }: Props) {
  const [slug, setSlug] = useState(template?.slug || '')
  const [name, setName] = useState(template?.name || '')
  const [categoryId, setCategoryId] = useState(template?.categoryId || categories[0]?.id || '')
  const [description, setDescription] = useState(template?.description || '')
  const [accessTier, setAccessTier] = useState(template?.accessTier || 'free')
  const [priceLabel, setPriceLabel] = useState(template?.priceLabel || '')
  const [status, setStatus] = useState(template?.status || 'draft')
  const [featured, setFeatured] = useState(template?.featured || false)
  const [sortOrder, setSortOrder] = useState(String(template?.sortOrder || 0))
  const [mediaAssetId, setMediaAssetId] = useState('')
  const [variant, setVariant] = useState('thumbnail')
  const [position, setPosition] = useState('0')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSlug(template?.slug || '')
    setName(template?.name || '')
    setCategoryId(template?.categoryId || categories[0]?.id || '')
    setDescription(template?.description || '')
    setAccessTier(template?.accessTier || 'free')
    setPriceLabel(template?.priceLabel || '')
    setStatus(template?.status || 'draft')
    setFeatured(template?.featured || false)
    setSortOrder(String(template?.sortOrder || 0))
    setMediaAssetId('')
  }, [categories, template])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      const body = JSON.stringify({ slug, name, categoryId, description: description || null, accessTier, priceLabel: priceLabel || null, status, featured, sortOrder: Number(sortOrder) })
      let templateId = template?.id
      if (templateId) await adminApi(`/api/v1/admin/catalog/templates/${templateId}`, { method: 'PATCH', body })
      else {
        const response = await adminApi<{ data: { id: string } }>('/api/v1/admin/catalog/templates', { method: 'POST', body })
        templateId = response.data.id
      }
      if (mediaAssetId.trim() && templateId) {
        await adminApi(`/api/v1/admin/catalog/templates/${templateId}/screenshots`, { method: 'POST', body: JSON.stringify({ mediaAssetId: mediaAssetId.trim(), variant, position: Number(position) }) })
      }
      onSaved()
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : cause instanceof Error ? cause.message : 'Không thể lưu template.')
    } finally { setIsSaving(false) }
  }

  return <form className="admin-editor-panel" onSubmit={save}><div className="admin-editor-heading"><div><p className="admin-panel-kicker">{template ? 'Chỉnh sửa' : 'Template mới'}</p><h2>{template ? template.name : 'Tạo template'}</h2></div><button type="button" className="admin-icon-button" aria-label="Đóng form template" onClick={onCancel}><X size={17} aria-hidden="true" /></button></div><div className="admin-editor-grid"><label className="admin-field"><span>Tên template</span><input value={name} onChange={event => setName(event.target.value)} required maxLength={160} /></label><label className="admin-field"><span>Slug</span><input value={slug} onChange={event => setSlug(event.target.value)} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} /></label><label className="admin-field"><span>Danh mục</span><select value={categoryId} onChange={event => setCategoryId(event.target.value)} required><option value="">Chọn danh mục</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="admin-field"><span>Loại giá</span><select value={accessTier} onChange={event => setAccessTier(event.target.value)}><option value="free">Miễn phí</option><option value="premium">Premium</option></select></label><label className="admin-field"><span>Nhãn giá</span><input value={priceLabel} onChange={event => setPriceLabel(event.target.value)} maxLength={120} placeholder="Ví dụ: Từ 199.000đ" /></label><label className="admin-field"><span>Thứ tự</span><input type="number" min={0} max={100000} value={sortOrder} onChange={event => setSortOrder(event.target.value)} /></label><label className="admin-field"><span>Trạng thái</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="draft">Nháp</option><option value="published">Đã publish</option><option value="archived">Đã archive</option></select></label><label className="admin-field admin-checkbox-field"><input type="checkbox" checked={featured} onChange={event => setFeatured(event.target.checked)} /><span>Nổi bật trên catalog</span></label><label className="admin-field admin-field-full"><span>Mô tả</span><textarea rows={4} maxLength={2000} value={description} onChange={event => setDescription(event.target.value)} /></label></div><div className="admin-editor-subsection"><div className="admin-editor-subtitle"><ImagePlus size={16} aria-hidden="true" /><strong>Gắn screenshot public đã upload</strong></div><p>Nhập ID media từ thư viện ảnh. Template publish cần ít nhất một screenshot ready.</p><div className="admin-editor-grid"><label className="admin-field"><span>Media asset ID</span><input value={mediaAssetId} onChange={event => setMediaAssetId(event.target.value)} placeholder="UUID media" /></label><label className="admin-field"><span>Variant</span><select value={variant} onChange={event => setVariant(event.target.value)}><option value="thumbnail">Thumbnail</option><option value="fullpage">Full-page</option></select></label><label className="admin-field"><span>Thứ tự screenshot</span><input type="number" min={0} max={1000} value={position} onChange={event => setPosition(event.target.value)} /></label></div></div>{error && <p className="admin-inline-error" role="alert">{error}</p>}<div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={onCancel}>Hủy</button><button type="submit" className="admin-primary-button" disabled={isSaving || !categories.length}>{isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Lưu template</button></div></form>
}
