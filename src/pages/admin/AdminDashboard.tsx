import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, ClipboardList, Clock3, Inbox, RefreshCw, WalletCards } from 'lucide-react'
import { adminApi, AdminApiError, adminReturnTo } from '../../lib/admin-api'

interface DashboardData {
  orderCounts: Record<string, number>
  paymentCounts: Record<string, number>
  openContacts: number
  overdueOrders: Array<{ id: string; orderCode: string; requestedDeadline: string; status: string }>
  recentOrders: Array<{ id: string; orderCode: string; customerName: string; templateName: string | null; status: string; paymentStatus: string; requestedDeadline: string | null; createdAt: number }>
  recentAuditEvents: Array<{ id: string; action: string; entityType: string; entityId: string; createdAt: number; actorName: string }>
  generatedAt: number
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  submitted: 'Mới gửi',
  reviewing: 'Đang xem',
  awaiting_customer: 'Chờ khách',
  confirmed: 'Đã xác nhận',
  in_production: 'Đang làm',
  ready: 'Sẵn sàng',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

const STATUS_TONES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  submitted: 'bg-amber-100 text-amber-800',
  reviewing: 'bg-blue-100 text-blue-800',
  awaiting_customer: 'bg-orange-100 text-orange-800',
  confirmed: 'bg-violet-100 text-violet-800',
  in_production: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-emerald-100 text-emerald-800',
  delivered: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

function formatDate(value: number | string | null | undefined) {
  if (!value) return '—'
  const date = typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-status-badge ${STATUS_TONES[status] || 'bg-slate-100 text-slate-700'}`}>{STATUS_LABELS[status] || status}</span>
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi<{ data: DashboardData }>('/api/v1/admin/dashboard')
      setData(response.data)
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 401) {
        navigate(adminReturnTo('/admin'), { replace: true })
        return
      }
      setError(cause instanceof Error ? cause.message : 'Không thể tải tổng quan.')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => { void loadDashboard() }, [loadDashboard])

  const activeOrders = data ? Object.entries(data.orderCounts).filter(([status]) => !['draft', 'completed', 'cancelled'].includes(status)).reduce((sum, [, count]) => sum + count, 0) : 0
  const submittedOrders = data?.orderCounts.submitted || 0
  const paidOrders = data?.paymentCounts.paid || 0

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Dearlove operations</p>
          <h1 className="admin-page-title">Tổng quan</h1>
          <p className="admin-page-description">Theo dõi các đơn hàng và hoạt động mới nhất của studio.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={() => void loadDashboard()} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          Làm mới
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error" role="alert"><strong>Không tải được dữ liệu.</strong><span>{error}</span><button type="button" onClick={() => void loadDashboard()}>Thử lại</button></div>}

      <div className="admin-stat-grid">
        <Link to="/admin/orders?status=submitted" className="admin-stat-card admin-stat-card-accent">
          <div className="admin-stat-icon"><Inbox size={19} aria-hidden="true" /></div>
          <div className="admin-stat-label">Đơn mới cần xem</div>
          <div className="admin-stat-value">{isLoading ? '—' : submittedOrders}</div>
          <span className="admin-stat-link">Mở hàng chờ <ArrowUpRight size={14} aria-hidden="true" /></span>
        </Link>
        <Link to="/admin/orders" className="admin-stat-card">
          <div className="admin-stat-icon is-warm"><ClipboardList size={19} aria-hidden="true" /></div>
          <div className="admin-stat-label">Đơn đang xử lý</div>
          <div className="admin-stat-value">{isLoading ? '—' : activeOrders}</div>
          <span className="admin-stat-link">Xem tất cả <ArrowUpRight size={14} aria-hidden="true" /></span>
        </Link>
        <Link to="/admin/orders?paymentStatus=paid" className="admin-stat-card">
          <div className="admin-stat-icon is-green"><WalletCards size={19} aria-hidden="true" /></div>
          <div className="admin-stat-label">Đơn đã thanh toán</div>
          <div className="admin-stat-value">{isLoading ? '—' : paidOrders}</div>
          <span className="admin-stat-link">Kiểm tra thanh toán <ArrowUpRight size={14} aria-hidden="true" /></span>
        </Link>
        <Link to="/admin/contacts?status=new" className="admin-stat-card">
          <div className="admin-stat-icon is-purple"><Inbox size={19} aria-hidden="true" /></div>
          <div className="admin-stat-label">Liên hệ chưa xử lý</div>
          <div className="admin-stat-value">{isLoading ? '—' : data?.openContacts || 0}</div>
          <span className="admin-stat-link">Mở inbox <ArrowUpRight size={14} aria-hidden="true" /></span>
        </Link>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-panel-kicker">Workflow</p><h2>Phân bổ đơn hàng</h2></div><Link to="/admin/orders" className="admin-text-link">Chi tiết <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
          <div className="admin-status-grid">
            {Object.entries(data?.orderCounts || {}).map(([status, count]) => <Link key={status} to={`/admin/orders?status=${status}`} className="admin-status-row"><span><StatusBadge status={status} /></span><strong>{count}</strong></Link>)}
            {!data && <p className="admin-muted-copy">Đang tải trạng thái...</p>}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-panel-kicker">Attention</p><h2>Đơn quá hạn</h2></div><Clock3 size={18} className="text-[#8d1216]" aria-hidden="true" /></div>
          <div className="admin-compact-list">
            {data?.overdueOrders.map(order => <Link key={order.id} to={`/admin/orders/${order.id}`} className="admin-compact-item"><div><strong>{order.orderCode}</strong><span>Hạn {formatDate(order.requestedDeadline)}</span></div><StatusBadge status={order.status} /></Link>)}
            {data && data.overdueOrders.length === 0 && <p className="admin-muted-copy">Không có đơn quá hạn.</p>}
            {!data && <p className="admin-muted-copy">Đang tải dữ liệu...</p>}
          </div>
        </section>
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid-wide">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-panel-kicker">Latest orders</p><h2>Đơn hàng mới nhất</h2></div><Link to="/admin/orders" className="admin-text-link">Mở queue <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
          <div className="admin-dashboard-orders">
            {data?.recentOrders.map(order => <Link key={order.id} to={`/admin/orders/${order.id}`} className="admin-dashboard-order-row"><div><strong>{order.orderCode}</strong><span>{order.customerName} · {order.templateName || 'Chưa có tên mẫu'}</span></div><div className="admin-dashboard-order-meta"><StatusBadge status={order.status} /><span>{formatDate(order.createdAt)}</span></div></Link>)}
            {data && data.recentOrders.length === 0 && <p className="admin-muted-copy">Chưa có đơn hàng.</p>}
            {!data && <p className="admin-muted-copy">Đang tải dữ liệu...</p>}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-panel-kicker">Audit trail</p><h2>Hoạt động gần đây</h2></div><Link to="/admin/audit-log" className="admin-text-link">Xem log <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
          <div className="admin-activity-list">
            {data?.recentAuditEvents.map(event => <div key={event.id} className="admin-activity-item"><span className="admin-activity-dot" aria-hidden="true" /><div><strong>{event.action}</strong><span>{event.actorName} · {event.entityType}/{event.entityId.slice(0, 8)}</span></div><time dateTime={new Date(event.createdAt).toISOString()}>{formatDate(event.createdAt)}</time></div>)}
            {data && data.recentAuditEvents.length === 0 && <p className="admin-muted-copy">Chưa có hoạt động được ghi.</p>}
            {!data && <p className="admin-muted-copy">Đang tải dữ liệu...</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
