import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, ClipboardList, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react'
import { adminApi, AdminApiError } from '../../lib/admin-api'
import {
  formatAdminDate,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  paymentLabel,
  statusLabel,
  STATUS_TONE_CLASSES,
} from './order-utils'

interface AdminOrder {
  id: string
  orderCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  templateName: string | null
  status: string
  paymentStatus: string
  eventDate: string | null
  requestedDeadline: string | null
  createdAt: number
  updatedAt: number
  assignedAdminName: string | null
}

interface AdminOrderResponse {
  data: {
    items: AdminOrder[]
    nextCursor: string | null
  }
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-status-badge ${STATUS_TONE_CLASSES[status] || 'admin-tone-neutral'}`}>{statusLabel(status)}</span>
}

function PaymentBadge({ status }: { status: string }) {
  return <span className="admin-payment-badge"><span aria-hidden="true" />{paymentLabel(status)}</span>
}

const ORDER_FILTERS = Object.entries(ORDER_STATUS_LABELS)
const PAYMENT_FILTERS = Object.entries(PAYMENT_STATUS_LABELS)

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  const filterKey = searchParams.toString()

  const currentFilters = useMemo(() => ({
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    sort: searchParams.get('sort') || 'newest',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
  }), [searchParams])

  const loadOrders = useCallback(async (cursor?: string, append = false) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    if (append) setIsLoadingMore(true)
    else setIsLoading(true)
    setError('')

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(currentFilters)) if (value) params.set(key, value)
    params.set('limit', '25')
    if (cursor) params.set('cursor', cursor)

    try {
      const response = await adminApi<AdminOrderResponse>(`/api/v1/admin/orders?${params.toString()}`, { signal: controller.signal })
      setOrders(current => append ? [...current, ...response.data.items] : response.data.items)
      setNextCursor(response.data.nextCursor)
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') return
      if (cause instanceof AdminApiError && cause.status === 401) return
      setError(cause instanceof Error ? cause.message : 'Không thể tải hàng chờ đơn hàng.')
      if (!append) setOrders([])
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }, [currentFilters])

  useEffect(() => {
    void loadOrders()
    return () => requestRef.current?.abort()
  }, [filterKey, loadOrders])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      const value = searchInput.trim()
      if (value) next.set('q', value)
      else next.delete('q')
      if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput, searchParams, setSearchParams])

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({}, { replace: true })
  }

  const activeFilterCount = [currentFilters.status, currentFilters.paymentStatus, currentFilters.from, currentFilters.to].filter(Boolean).length

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Workflow / Orders</p>
          <h1 className="admin-page-title">Đơn hàng</h1>
          <p className="admin-page-description">Xem, phân loại và xử lý từng yêu cầu thiệp từ một hàng chờ duy nhất.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={() => void loadOrders()} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          Làm mới
        </button>
      </div>

      <section className="admin-toolbar" aria-label="Bộ lọc đơn hàng">
        <label className="admin-search-field">
          <span className="sr-only">Tìm đơn hàng</span>
          <Search size={17} aria-hidden="true" />
          <input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Tìm mã đơn, tên hoặc email..." />
          {searchInput && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setSearchInput('')}><X size={15} aria-hidden="true" /></button>}
        </label>
        <button type="button" className={`admin-filter-button ${showFilters || activeFilterCount ? 'is-active' : ''}`} onClick={() => setShowFilters(value => !value)} aria-expanded={showFilters}>
          <SlidersHorizontal size={16} aria-hidden="true" /> Bộ lọc {activeFilterCount > 0 && <span>{activeFilterCount}</span>} <ChevronDown size={14} aria-hidden="true" />
        </button>
        {(currentFilters.q || activeFilterCount > 0) && <button type="button" className="admin-clear-button" onClick={clearFilters}>Xóa bộ lọc</button>}
      </section>

      {showFilters && <section className="admin-filter-panel">
        <label className="admin-field"><span>Trạng thái đơn</span><select value={currentFilters.status} onChange={event => updateFilter('status', event.target.value)}><option value="">Tất cả trạng thái</option>{ORDER_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="admin-field"><span>Thanh toán</span><select value={currentFilters.paymentStatus} onChange={event => updateFilter('paymentStatus', event.target.value)}><option value="">Tất cả</option>{PAYMENT_FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="admin-field"><span>Sắp xếp</span><select value={currentFilters.sort} onChange={event => updateFilter('sort', event.target.value)}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="deadline">Deadline gần nhất</option></select></label>
        <label className="admin-field"><span>Từ ngày</span><input type="date" value={currentFilters.from} onChange={event => updateFilter('from', event.target.value)} /></label>
        <label className="admin-field"><span>Đến ngày</span><input type="date" value={currentFilters.to} onChange={event => updateFilter('to', event.target.value)} /></label>
      </section>}

      {error && <div className="admin-alert admin-alert-error" role="alert"><strong>Không tải được đơn hàng.</strong><span>{error}</span><button type="button" onClick={() => void loadOrders()}>Thử lại</button></div>}

      <section className="admin-list-panel" aria-live="polite">
        <div className="admin-list-header"><div className="admin-list-title"><ClipboardList size={18} aria-hidden="true" /><h2>{isLoading ? 'Đang tải hàng chờ...' : `${orders.length}${nextCursor ? '+' : ''} đơn hàng`}</h2></div><span className="admin-list-meta">Cập nhật theo thời gian thực khi làm mới</span></div>
        {isLoading ? <div className="admin-table-skeleton" aria-label="Đang tải"><span /><span /><span /><span /><span /><span /></div> : orders.length === 0 && !error ? <div className="admin-empty-state"><ClipboardList size={25} aria-hidden="true" /><strong>Chưa có đơn phù hợp</strong><p>Thử đổi bộ lọc hoặc kiểm tra lại từ khóa tìm kiếm.</p><button type="button" className="admin-secondary-button" onClick={clearFilters}>Xem tất cả đơn</button></div> : <>
          <div className="admin-table-scroll">
            <table className="admin-data-table"><caption className="sr-only">Danh sách đơn hàng Dearlove</caption><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Mẫu thiệp</th><th>Trạng thái</th><th>Thanh toán</th><th>Deadline</th><th>Tạo lúc</th><th><span className="sr-only">Mở</span></th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><Link className="admin-order-code" to={`/admin/orders/${order.id}`}>{order.orderCode}</Link></td><td><div className="admin-table-primary">{order.customerName}</div><div className="admin-table-secondary">{order.customerEmail || order.customerPhone || 'Chưa có liên hệ'}</div></td><td><span className="admin-table-primary">{order.templateName || 'Mẫu chưa lưu'}</span><span className="admin-table-secondary">{order.assignedAdminName ? `Phụ trách: ${order.assignedAdminName}` : 'Chưa phân công'}</span></td><td><StatusBadge status={order.status} /></td><td><PaymentBadge status={order.paymentStatus} /></td><td><span className={order.requestedDeadline && new Date(`${order.requestedDeadline}T00:00:00`).getTime() < Date.now() && !['completed', 'cancelled', 'delivered'].includes(order.status) ? 'admin-overdue' : 'admin-table-secondary'}>{formatAdminDate(order.requestedDeadline)}</span></td><td><span className="admin-table-secondary">{formatAdminDate(order.createdAt, true)}</span></td><td><Link className="admin-row-action" to={`/admin/orders/${order.id}`} aria-label={`Mở đơn ${order.orderCode}`}><ArrowUpRight size={17} aria-hidden="true" /></Link></td></tr>)}</tbody></table>
          </div>
          <div className="admin-mobile-order-list">{orders.map(order => <Link key={order.id} className="admin-mobile-order-card" to={`/admin/orders/${order.id}`}><div className="admin-mobile-order-top"><strong>{order.orderCode}</strong><StatusBadge status={order.status} /></div><div className="admin-table-primary">{order.customerName}</div><div className="admin-table-secondary">{order.templateName || 'Mẫu chưa lưu'}</div><div className="admin-mobile-order-bottom"><PaymentBadge status={order.paymentStatus} /><span>{formatAdminDate(order.createdAt, true)}</span><ArrowUpRight size={16} aria-hidden="true" /></div></Link>)}</div>
          {nextCursor && <div className="admin-list-footer"><button type="button" className="admin-secondary-button" onClick={() => void loadOrders(nextCursor, true)} disabled={isLoadingMore}>{isLoadingMore ? 'Đang tải thêm...' : 'Tải thêm đơn hàng'}</button></div>}
        </>}
      </section>
    </div>
  )
}
