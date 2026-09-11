import { useCallback, useEffect, useState } from 'react'
import { Activity, Loader2, RefreshCw, Search } from 'lucide-react'
import { adminApi } from '../../lib/admin-api'
import { formatAdminDate } from './order-utils'

interface AuditRow { id: string; action: string; entityType: string; entityId: string; actorName: string; metadata: Record<string, unknown>; createdAt: number }
export default function AdminAuditLog() {
  const [items, setItems] = useState<AuditRow[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => { setIsLoading(true); setError(''); try { const params = new URLSearchParams({ limit: '80' }); if (query.trim()) params.set('q', query.trim()); const response = await adminApi<{ data: { items: AuditRow[] } }>(`/api/v1/admin/audit-log?${params}`); setItems(response.data.items) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải audit log.') } finally { setIsLoading(false) } }, [query])
  useEffect(() => { void load() }, [load])
  return <div className="admin-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">System / Audit</p><h1 className="admin-page-title">Audit log</h1><p className="admin-page-description">Lịch sử thao tác quản trị, chỉ đọc và không chứa secret hoặc dữ liệu nhạy cảm.</p></div><button type="button" className="admin-secondary-button" onClick={() => void load()} disabled={isLoading}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Làm mới</button></div><div className="admin-toolbar"><label className="admin-search-field"><span className="sr-only">Tìm audit log</span><Search size={16} aria-hidden="true" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm action, entity hoặc ID..." /></label></div>{error && <div className="admin-alert admin-alert-error" role="alert"><span>{error}</span><button type="button" onClick={() => void load()}>Thử lại</button></div>}<section className="admin-list-panel" aria-live="polite">{isLoading ? <div className="admin-media-empty"><Loader2 size={22} className="animate-spin" aria-hidden="true" /><span>Đang tải audit log...</span></div> : items.length === 0 ? <div className="admin-empty-state"><Activity size={24} aria-hidden="true" /><strong>Chưa có hoạt động</strong><p>Audit log sẽ xuất hiện sau các thao tác admin.</p></div> : <div className="admin-audit-list">{items.map(item => <article className="admin-audit-row" key={item.id}><span className="admin-audit-dot" aria-hidden="true" /><div className="admin-audit-main"><strong>{item.action}</strong><span>{item.entityType} / {item.entityId}</span></div><div className="admin-audit-actor"><strong>{item.actorName}</strong><time>{formatAdminDate(item.createdAt, true)}</time></div></article>)}</div>}</section></div>
}
