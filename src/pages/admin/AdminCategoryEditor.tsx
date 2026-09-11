import { FormEvent, useEffect, useState } from 'react'
import { Loader2, Save, X } from 'lucide-react'
import { adminApi, AdminApiError } from '../../lib/admin-api'
import type { CatalogCategory } from '../../lib/catalog-api'

interface Props {
  category?: CatalogCategory | null
  onSaved: () => void
  onCancel: () => void
}

export default function AdminCategoryEditor({ category, onSaved, onCancel }: Props) {
  const [slug, setSlug] = useState(category?.slug || '')
  const [name, setName] = useState(category?.name || '')
  const [description, setDescription] = useState(category?.description || '')
  const [position, setPosition] = useState(String(category?.position || 0))
  const [status, setStatus] = useState(category?.status || 'draft')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSlug(category?.slug || '')
    setName(category?.name || '')
    setDescription(category?.description || '')
    setPosition(String(category?.position || 0))
    setStatus(category?.status || 'draft')
  }, [category])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      const body = JSON.stringify({ slug, name, description: description || null, position: Number(position), status })
      if (category) await adminApi(`/api/v1/admin/catalog/categories/${category.id}`, { method: 'PATCH', body })
      else await adminApi('/api/v1/admin/catalog/categories', { method: 'POST', body })
      onSaved()
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : cause instanceof Error ? cause.message : 'Không thể lưu danh mục.')
    } finally { setIsSaving(false) }
  }

  return <form className="admin-editor-panel" onSubmit={save}><div className="admin-editor-heading"><div><p className="admin-panel-kicker">{category ? 'Chỉnh sửa' : 'Danh mục mới'}</p><h2>{category ? category.name : 'Tạo danh mục'}</h2></div><button type="button" className="admin-icon-button" aria-label="Đóng form danh mục" onClick={onCancel}><X size={17} aria-hidden="true" /></button></div><div className="admin-editor-grid"><label className="admin-field"><span>Tên danh mục</span><input value={name} onChange={event => setName(event.target.value)} required maxLength={120} /></label><label className="admin-field"><span>Slug</span><input value={slug} onChange={event => setSlug(event.target.value)} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} /></label><label className="admin-field"><span>Thứ tự</span><input type="number" min={0} max={10000} value={position} onChange={event => setPosition(event.target.value)} required /></label><label className="admin-field"><span>Trạng thái</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="draft">Nháp</option><option value="published">Đã publish</option><option value="archived">Đã archive</option></select></label><label className="admin-field admin-field-full"><span>Mô tả</span><textarea rows={3} maxLength={1000} value={description} onChange={event => setDescription(event.target.value)} /></label></div>{error && <p className="admin-inline-error" role="alert">{error}</p>}<div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={onCancel}>Hủy</button><button type="submit" className="admin-primary-button" disabled={isSaving}>{isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Lưu danh mục</button></div></form>
}
