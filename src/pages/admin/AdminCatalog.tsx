import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Archive, Boxes, CheckCircle2, Edit3, FolderKanban, Plus, RefreshCw } from 'lucide-react'
import { adminApi, AdminApiError } from '../../lib/admin-api'
import { getAdminCategories, getAdminTemplates, type CatalogCategory, type CatalogTemplate } from '../../lib/catalog-api'
import { formatAdminDate } from './order-utils'
import AdminCategoryEditor from './AdminCategoryEditor'
import AdminTemplateEditor from './AdminTemplateEditor'

const STATUS_LABELS: Record<string, string> = { draft: 'Nháp', published: 'Đã publish', archived: 'Đã archive' }
const STATUS_TONES: Record<string, string> = { draft: 'admin-tone-neutral', published: 'admin-tone-success', archived: 'admin-tone-danger' }

function CatalogStatus({ status }: { status: string }) {
  return <span className={`admin-status-badge ${STATUS_TONES[status] || 'admin-tone-neutral'}`}>{STATUS_LABELS[status] || status}</span>
}

export default function AdminCatalog() {
  const location = useLocation()
  const showCategories = location.pathname.endsWith('/categories')
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [templates, setTemplates] = useState<CatalogTemplate[]>([])
  const [templateStatus, setTemplateStatus] = useState('')
  const [categoryStatus, setCategoryStatus] = useState('')
  const [templateQuery, setTemplateQuery] = useState('')
  const [categoryQuery, setCategoryQuery] = useState('')
  const [editingTemplate, setEditingTemplate] = useState<CatalogTemplate | null | undefined>(undefined)
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const templateParams = new URLSearchParams({ limit: '50' })
      if (templateStatus) templateParams.set('status', templateStatus)
      if (templateQuery.trim()) templateParams.set('q', templateQuery.trim())
      const categoryParams = new URLSearchParams()
      if (categoryStatus) categoryParams.set('status', categoryStatus)
      if (categoryQuery.trim()) categoryParams.set('q', categoryQuery.trim())
      const [categoryResponse, templateResponse] = await Promise.all([getAdminCategories(categoryParams.toString() ? `?${categoryParams}` : ''), getAdminTemplates(`?${templateParams}`)])
      setCategories(categoryResponse.data.items)
      setTemplates(templateResponse.data.items)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải catalog.') }
    finally { setIsLoading(false) }
  }, [categoryQuery, categoryStatus, templateQuery, templateStatus])

  useEffect(() => { void load() }, [load])

  const publish = async (template: CatalogTemplate) => {
    try { await adminApi(`/api/v1/admin/catalog/templates/${template.id}/publish`, { method: 'POST' }); await load() }
    catch (cause) { setError(cause instanceof AdminApiError ? cause.message : 'Không thể publish template.') }
  }

  const archive = async (template: CatalogTemplate) => {
    if (!window.confirm(`Archive template “${template.name}”?`)) return
    try { await adminApi(`/api/v1/admin/catalog/templates/${template.id}/archive`, { method: 'POST' }); await load() }
    catch (cause) { setError(cause instanceof AdminApiError ? cause.message : 'Không thể archive template.') }
  }

  return <div className="admin-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">Content / Catalog</p><h1 className="admin-page-title">Catalog</h1><p className="admin-page-description">Quản lý danh mục và mẫu thiệp hiển thị cho khách hàng.</p></div><button type="button" className="admin-secondary-button" onClick={() => void load()} disabled={isLoading}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Làm mới</button></div>

    <div className="admin-tabs" role="tablist"><Link role="tab" aria-selected={!showCategories} className={!showCategories ? 'is-active' : ''} to="/admin/catalog"> <Boxes size={16} aria-hidden="true" /> Templates</Link><Link role="tab" aria-selected={showCategories} className={showCategories ? 'is-active' : ''} to="/admin/catalog/categories"><FolderKanban size={16} aria-hidden="true" /> Categories</Link></div>

    {error && <div className="admin-alert admin-alert-error" role="alert"><strong>Catalog có lỗi.</strong><span>{error}</span><button type="button" onClick={() => void load()}>Thử lại</button></div>}

    {showCategories ? <section className="admin-list-panel"><div className="admin-list-header"><div className="admin-list-title"><FolderKanban size={18} aria-hidden="true" /><h2>Danh mục ({categories.length})</h2></div><button type="button" className="admin-primary-button" onClick={() => setEditingCategory(null)}><Plus size={15} aria-hidden="true" /> Thêm danh mục</button></div><div className="admin-toolbar admin-catalog-toolbar"><label className="admin-search-field"><span className="sr-only">Tìm danh mục</span><input value={categoryQuery} onChange={event => setCategoryQuery(event.target.value)} placeholder="Tìm tên hoặc slug..." /></label><label className="admin-field admin-toolbar-field"><span className="sr-only">Trạng thái</span><select value={categoryStatus} onChange={event => setCategoryStatus(event.target.value)}><option value="">Tất cả trạng thái</option><option value="draft">Nháp</option><option value="published">Đã publish</option><option value="archived">Đã archive</option></select></label></div>{editingCategory !== undefined && <AdminCategoryEditor category={editingCategory} onSaved={() => { setEditingCategory(undefined); void load() }} onCancel={() => setEditingCategory(undefined)} />}<div className="admin-catalog-list">{isLoading ? <p className="admin-muted-copy">Đang tải danh mục...</p> : categories.map(category => <div className="admin-catalog-row" key={category.id}><div className="admin-catalog-row-main"><strong>{category.name}</strong><span>/{category.slug} · {category.templateCount} template · cập nhật {formatAdminDate(category.updatedAt, true)}</span></div><CatalogStatus status={category.status} /><button type="button" className="admin-row-edit" onClick={() => setEditingCategory(category)} aria-label={`Sửa danh mục ${category.name}`}><Edit3 size={16} aria-hidden="true" /></button></div>)}{!isLoading && categories.length === 0 && <div className="admin-empty-state"><FolderKanban size={24} aria-hidden="true" /><strong>Chưa có danh mục</strong><p>Tạo danh mục trước khi thêm template.</p></div>}</div></section> : <section className="admin-list-panel"><div className="admin-list-header"><div className="admin-list-title"><Boxes size={18} aria-hidden="true" /><h2>Templates ({templates.length})</h2></div><button type="button" className="admin-primary-button" onClick={() => setEditingTemplate(null)} disabled={!categories.length}><Plus size={15} aria-hidden="true" /> Thêm template</button></div><div className="admin-toolbar admin-catalog-toolbar"><label className="admin-search-field"><span className="sr-only">Tìm template</span><input value={templateQuery} onChange={event => setTemplateQuery(event.target.value)} placeholder="Tìm tên hoặc slug..." /></label><label className="admin-field admin-toolbar-field"><span className="sr-only">Trạng thái</span><select value={templateStatus} onChange={event => setTemplateStatus(event.target.value)}><option value="">Tất cả trạng thái</option><option value="draft">Nháp</option><option value="published">Đã publish</option><option value="archived">Đã archive</option></select></label></div>{!categories.length && !isLoading && <div className="admin-alert admin-alert-info" role="status">Cần tạo ít nhất một category trước khi thêm template. <Link to="/admin/catalog/categories">Mở categories</Link></div>}{editingTemplate !== undefined && <AdminTemplateEditor template={editingTemplate} categories={categories} onSaved={() => { setEditingTemplate(undefined); void load() }} onCancel={() => setEditingTemplate(undefined)} />}<div className="admin-catalog-list">{isLoading ? <p className="admin-muted-copy">Đang tải templates...</p> : templates.map(template => <div className="admin-catalog-row" key={template.id}><div className="admin-catalog-row-main"><strong>{template.name}</strong><span>/{template.slug} · {template.categoryName || 'Chưa có category'} · {template.screenshotCount} screenshot ({template.readyScreenshotCount} ready)</span></div><CatalogStatus status={template.status} /><span className="admin-catalog-meta">{template.accessTier === 'premium' ? template.priceLabel || 'Premium' : 'Miễn phí'}</span><button type="button" className="admin-row-edit" onClick={() => setEditingTemplate(template)} aria-label={`Sửa template ${template.name}`}><Edit3 size={16} aria-hidden="true" /></button>{template.status !== 'published' && <button type="button" className="admin-row-action" onClick={() => void publish(template)} aria-label={`Publish ${template.name}`} title="Publish"><CheckCircle2 size={16} aria-hidden="true" /></button>}{template.status !== 'archived' && <button type="button" className="admin-row-action is-danger" onClick={() => void archive(template)} aria-label={`Archive ${template.name}`} title="Archive"><Archive size={16} aria-hidden="true" /></button>}</div>)}{!isLoading && templates.length === 0 && <div className="admin-empty-state"><Boxes size={24} aria-hidden="true" /><strong>Chưa có template</strong><p>Tạo template draft đầu tiên cho catalog.</p></div>}</div></section>}
  </div>
}
