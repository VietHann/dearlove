import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Archive, BarChart3, Edit3, Loader2, Plus, RefreshCw, Save, Send, X } from 'lucide-react'
import { adminApi, AdminApiError } from '../../lib/admin-api'
import { formatAdminDate } from './order-utils'

interface PricingPlan { id: string; slug: string; name: string; priceLabel: string; originalPriceLabel: string | null; description: string | null; payload: Record<string, unknown>; position: number; status: string; updatedAt: number }
interface ResponseBody { data: { items: PricingPlan[] } }

const emptyForm = { slug: '', name: '', priceLabel: '', originalPriceLabel: '', description: '', position: '0', status: 'draft', payload: '{}' }

export default function AdminPricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true); setError('')
    try { const response = await adminApi<ResponseBody>(`/api/v1/admin/pricing${status ? `?status=${status}` : ''}`); setPlans(response.data.items) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải bảng giá.') }
    finally { setIsLoading(false) }
  }, [status])
  useEffect(() => { void load() }, [load])

  const startEdit = (plan?: PricingPlan) => {
    setEditingId(plan?.id || null)
    setForm(plan ? { slug: plan.slug, name: plan.name, priceLabel: plan.priceLabel, originalPriceLabel: plan.originalPriceLabel || '', description: plan.description || '', position: String(plan.position), status: plan.status, payload: JSON.stringify(plan.payload, null, 2) } : emptyForm)
  }
  const save = async (event: FormEvent) => {
    event.preventDefault(); setIsSaving(true); setError('')
    let payload: unknown
    try { payload = JSON.parse(form.payload || '{}') } catch { setError('Payload phải là JSON hợp lệ.'); setIsSaving(false); return }
    const body = JSON.stringify({ ...form, position: Number(form.position), payload, originalPriceLabel: form.originalPriceLabel || null, description: form.description || null })
    try { if (editingId) await adminApi(`/api/v1/admin/pricing/${editingId}`, { method: 'PATCH', body }); else await adminApi('/api/v1/admin/pricing', { method: 'POST', body }); setEditingId(null); setForm(emptyForm); await load() }
    catch (cause) { setError(cause instanceof AdminApiError ? cause.message : 'Không thể lưu gói giá.') }
    finally { setIsSaving(false) }
  }
  const setPlanStatus = async (plan: PricingPlan, action: 'publish' | 'archive') => {
    try { await adminApi(`/api/v1/admin/pricing/${plan.id}/${action}`, { method: 'POST' }); await load() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật gói giá.') }
  }
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))

  return <div className="admin-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">Content / Pricing</p><h1 className="admin-page-title">Bảng giá</h1><p className="admin-page-description">Quản lý các gói hiển thị cho khách hàng. Đây là nội dung marketing, chưa phải hệ thống checkout.</p></div><button type="button" className="admin-secondary-button" onClick={() => void load()} disabled={isLoading}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Làm mới</button></div><div className="admin-toolbar"><label className="admin-field admin-toolbar-field"><span className="sr-only">Trạng thái</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="">Tất cả trạng thái</option><option value="draft">Nháp</option><option value="published">Đã publish</option><option value="archived">Đã archive</option></select></label><button type="button" className="admin-primary-button" onClick={() => startEdit()}><Plus size={15} aria-hidden="true" /> Thêm gói giá</button></div>{error && <div className="admin-alert admin-alert-error" role="alert"><span>{error}</span><button type="button" onClick={() => void load()}>Thử lại</button></div>}{editingId !== null || form !== emptyForm ? <form className="admin-editor-panel" onSubmit={save}><div className="admin-editor-heading"><div><p className="admin-panel-kicker">{editingId ? 'Chỉnh sửa' : 'Gói giá mới'}</p><h2>{editingId ? form.name : 'Tạo gói giá'}</h2></div><button type="button" className="admin-icon-button" aria-label="Đóng form giá" onClick={() => { setEditingId(null); setForm(emptyForm) }}><X size={17} aria-hidden="true" /></button></div><div className="admin-editor-grid"><label className="admin-field"><span>Tên gói</span><input value={form.name} onChange={event => update('name', event.target.value)} required maxLength={160} /></label><label className="admin-field"><span>Slug</span><input value={form.slug} onChange={event => update('slug', event.target.value)} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></label><label className="admin-field"><span>Giá hiển thị</span><input value={form.priceLabel} onChange={event => update('priceLabel', event.target.value)} required maxLength={120} /></label><label className="admin-field"><span>Giá gốc</span><input value={form.originalPriceLabel} onChange={event => update('originalPriceLabel', event.target.value)} maxLength={120} /></label><label className="admin-field"><span>Thứ tự</span><input type="number" min={0} value={form.position} onChange={event => update('position', event.target.value)} /></label><label className="admin-field"><span>Trạng thái</span><select value={form.status} onChange={event => update('status', event.target.value)}><option value="draft">Nháp</option><option value="published">Đã publish</option><option value="archived">Đã archive</option></select></label><label className="admin-field admin-field-full"><span>Mô tả</span><textarea rows={3} value={form.description} onChange={event => update('description', event.target.value)} maxLength={1000} /></label><label className="admin-field admin-field-full"><span>Payload JSON hiển thị</span><textarea rows={8} value={form.payload} onChange={event => update('payload', event.target.value)} spellCheck={false} /></label></div><div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Hủy</button><button type="submit" className="admin-primary-button" disabled={isSaving}>{isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />} Lưu gói giá</button></div></form> : null}<section className="admin-list-panel"><div className="admin-list-header"><div className="admin-list-title"><BarChart3 size={18} aria-hidden="true" /><h2>{isLoading ? 'Đang tải...' : `${plans.length} gói giá`}</h2></div></div><div className="admin-catalog-list">{plans.map(plan => <div className="admin-catalog-row" key={plan.id}><div className="admin-catalog-row-main"><strong>{plan.name}</strong><span>/{plan.slug} · {plan.priceLabel} · cập nhật {formatAdminDate(plan.updatedAt, true)}</span></div><span className={`admin-status-badge ${plan.status === 'published' ? 'admin-tone-success' : plan.status === 'archived' ? 'admin-tone-danger' : 'admin-tone-neutral'}`}>{plan.status}</span><button type="button" className="admin-row-edit" onClick={() => startEdit(plan)} aria-label={`Sửa ${plan.name}`}><Edit3 size={16} aria-hidden="true" /></button>{plan.status !== 'published' && <button type="button" className="admin-row-action" onClick={() => void setPlanStatus(plan, 'publish')} aria-label={`Publish ${plan.name}`}><Send size={16} aria-hidden="true" /></button>}{plan.status !== 'archived' && <button type="button" className="admin-row-action is-danger" onClick={() => void setPlanStatus(plan, 'archive')} aria-label={`Archive ${plan.name}`}><Archive size={16} aria-hidden="true" /></button>}</div>)}{!isLoading && plans.length === 0 && <div className="admin-empty-state"><BarChart3 size={24} aria-hidden="true" /><strong>Chưa có gói giá</strong><p>Tạo gói giá draft đầu tiên.</p></div>}</div></section></div>
}
