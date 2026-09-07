import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock3, FileText, Loader2, MessageSquare, RefreshCw, ShieldAlert, UserRound, WalletCards } from 'lucide-react'
import { AdminApiError, adminApi } from '../../lib/admin-api'
import {
  formatAdminDate,
  formatMoney,
  ORDER_STATUS_LABELS,
  paymentLabel,
  PAYMENT_STATUS_LABELS,
  statusLabel,
  STATUS_TONE_CLASSES,
} from './order-utils'

interface AdminOrderDetailData {
  id: string
  orderCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  templateId: string
  templateName: string | null
  status: string
  paymentStatus: string
  eventDate: string | null
  requestedDeadline: string | null
  customerNote: string | null
  quotedAmount: number | null
  createdAt: number
  updatedAt: number
  assignedAdminId: string | null
  assignedAdminName: string | null
  contactSnapshot: Record<string, unknown>
  templateSnapshot: Record<string, unknown>
  packageSnapshot: Record<string, unknown>
  formAnswers: Array<{ fieldKey: string; fieldLabel: string; value: unknown }>
  uploadGroups: Array<{ id: string; groupKey: string; label: string; minFiles: number; maxFiles: number | null; files: Array<{ id: string; mediaAssetId: string; filename: string | null; mimeType: string; sizeBytes: number; status: string; visibility: string; downloadPath: string }> }>
  notes: Array<{ id: string; authorName: string; visibility: 'customer' | 'internal'; body: string; createdAt: number }>
  assignments: Array<{ adminId: string; adminName: string; assignedAt: number; unassignedAt: number | null }>
  statusHistory: Array<{ id: string; fromStatus: string | null; toStatus: string; actorName: string; reason: string | null; createdAt: number }>
  availableTransitions: string[]
  adminUsers: Array<{ id: string; name: string; email: string }>
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`admin-status-badge ${STATUS_TONE_CLASSES[status] || 'admin-tone-neutral'}`}>{statusLabel(status)}</span>
}

function ScalarValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="admin-detail-muted">Chưa nhập</span>
  if (typeof value === 'object') return <pre className="admin-json-value">{JSON.stringify(value, null, 2)}</pre>
  return <span>{String(value)}</span>
}

function Section({ title, icon, children, className = '' }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`admin-detail-panel ${className}`}><div className="admin-detail-section-heading"><span className="admin-detail-section-icon">{icon}</span><h2>{title}</h2></div>{children}</section>
}

export default function AdminOrderDetail() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<AdminOrderDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isMutating, setIsMutating] = useState(false)
  const [transitionStatus, setTransitionStatus] = useState('')
  const [transitionReason, setTransitionReason] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [paymentReason, setPaymentReason] = useState('')
  const [assignment, setAssignment] = useState('')
  const [noteVisibility, setNoteVisibility] = useState<'internal' | 'customer'>('internal')
  const [noteBody, setNoteBody] = useState('')

  const loadOrder = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await adminApi<{ data: AdminOrderDetailData }>(`/api/v1/admin/orders/${encodeURIComponent(orderId)}`)
      setOrder(response.data)
      setPaymentStatus(response.data.paymentStatus)
      setAssignment(response.data.assignedAdminId || '')
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 404) setError('Đơn hàng không tồn tại hoặc đã bị xóa.')
      else setError(cause instanceof Error ? cause.message : 'Không thể tải chi tiết đơn hàng.')
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => { void loadOrder() }, [loadOrder])

  const applyDetail = (response: { data: AdminOrderDetailData }) => {
    setOrder(response.data)
    setPaymentStatus(response.data.paymentStatus)
    setAssignment(response.data.assignedAdminId || '')
    setActionError('')
  }

  const mutate = async (action: () => Promise<{ data: AdminOrderDetailData }>) => {
    setIsMutating(true)
    setActionError('')
    try { applyDetail(await action()) } catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 409) setActionError('Dữ liệu đã thay đổi bởi admin khác. Hãy tải lại trước khi thao tác tiếp.')
      else setActionError(cause instanceof Error ? cause.message : 'Không thể cập nhật đơn hàng.')
    } finally { setIsMutating(false) }
  }

  const submitStatus = async (event: FormEvent) => {
    event.preventDefault()
    if (!order || !transitionStatus || transitionReason.trim().length === 0) return
    await mutate(() => adminApi(`/api/v1/admin/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ toStatus: transitionStatus, reason: transitionReason.trim(), updatedAt: order.updatedAt }) }))
    setTransitionStatus('')
    setTransitionReason('')
  }

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault()
    if (!order || !paymentStatus || !paymentReason.trim()) return
    await mutate(() => adminApi(`/api/v1/admin/orders/${order.id}/payment`, { method: 'PATCH', body: JSON.stringify({ paymentStatus, reason: paymentReason.trim(), updatedAt: order.updatedAt }) }))
    setPaymentReason('')
  }

  const submitAssignment = async (event: FormEvent) => {
    event.preventDefault()
    if (!order) return
    await mutate(() => adminApi(`/api/v1/admin/orders/${order.id}/assignment`, { method: 'PUT', body: JSON.stringify({ adminId: assignment || null, updatedAt: order.updatedAt }) }))
  }

  const submitNote = async (event: FormEvent) => {
    event.preventDefault()
    if (!order || !noteBody.trim()) return
    await mutate(() => adminApi(`/api/v1/admin/orders/${order.id}/notes`, { method: 'POST', body: JSON.stringify({ visibility: noteVisibility, body: noteBody.trim() }) }))
    setNoteBody('')
  }

  if (isLoading) return <div className="admin-detail-loading"><Loader2 className="animate-spin" size={24} aria-hidden="true" /><span>Đang tải chi tiết đơn hàng...</span></div>
  if (error || !order) return <div className="admin-page"><div className="admin-alert admin-alert-error" role="alert"><strong>Không mở được đơn hàng.</strong><span>{error}</span><button type="button" onClick={() => void loadOrder()}>Thử lại</button></div><Link to="/admin/orders" className="admin-back-link"><ArrowLeft size={16} aria-hidden="true" /> Về danh sách đơn</Link></div>

  return (
    <div className="admin-page">
      <div className="admin-detail-topbar"><Link to="/admin/orders" className="admin-back-link"><ArrowLeft size={16} aria-hidden="true" /> Đơn hàng</Link><button type="button" className="admin-secondary-button" onClick={() => void loadOrder()} disabled={isLoading}><RefreshCw size={15} aria-hidden="true" /> Làm mới</button></div>
      <div className="admin-page-heading admin-detail-heading"><div><p className="admin-eyebrow">Order detail</p><h1 className="admin-page-title">{order.orderCode}</h1><p className="admin-page-description">Tạo {formatAdminDate(order.createdAt, true)} · Cập nhật {formatAdminDate(order.updatedAt, true)}</p></div><div className="admin-detail-heading-status"><StatusBadge status={order.status} /><span className="admin-detail-payment-label">{paymentLabel(order.paymentStatus)}</span></div></div>

      {actionError && <div className="admin-alert admin-alert-error" role="alert"><ShieldAlert size={16} aria-hidden="true" /><span>{actionError}</span><button type="button" onClick={() => void loadOrder()}>Tải lại dữ liệu</button></div>}

      <div className="admin-detail-layout">
        <div className="admin-detail-main-column">
          <Section title="Thông tin khách hàng" icon={<UserRound size={17} aria-hidden="true" />}>
            <div className="admin-detail-field-grid"><div><span className="admin-detail-label">Họ tên</span><strong>{order.customerName}</strong></div><div><span className="admin-detail-label">Email</span><strong>{order.customerEmail || 'Chưa có'}</strong></div><div><span className="admin-detail-label">Số điện thoại</span><strong>{order.customerPhone || 'Chưa có'}</strong></div><div><span className="admin-detail-label">Ngày sự kiện</span><strong>{formatAdminDate(order.eventDate)}</strong></div><div><span className="admin-detail-label">Deadline mong muốn</span><strong className={order.requestedDeadline && new Date(`${order.requestedDeadline}T00:00:00`).getTime() < Date.now() ? 'admin-overdue' : ''}>{formatAdminDate(order.requestedDeadline)}</strong></div><div><span className="admin-detail-label">Giá báo</span><strong>{formatMoney(order.quotedAmount)}</strong></div></div>
            {order.customerNote && <div className="admin-customer-note"><span className="admin-detail-label">Ghi chú của khách</span><p>{order.customerNote}</p></div>}
          </Section>

          <Section title="Mẫu và câu trả lời form" icon={<FileText size={17} aria-hidden="true" />}>
            <div className="admin-snapshot-card"><div><span className="admin-detail-label">Mẫu đã chọn</span><strong>{order.templateName || order.templateId}</strong></div><div><span className="admin-detail-label">Thông tin snapshot</span><ScalarValue value={order.templateSnapshot} /></div></div>
            {order.packageSnapshot && Object.keys(order.packageSnapshot).length > 0 && <div className="admin-snapshot-card"><div><span className="admin-detail-label">Gói dịch vụ</span><ScalarValue value={order.packageSnapshot} /></div></div>}
            <div className="admin-answer-list">{order.formAnswers.map(answer => <div key={answer.fieldKey} className="admin-answer-row"><span>{answer.fieldLabel}</span><ScalarValue value={answer.value} /></div>)}{order.formAnswers.length === 0 && <p className="admin-detail-muted">Chưa có câu trả lời bổ sung.</p>}</div>
          </Section>

          <Section title="File theo nhóm" icon={<FileText size={17} aria-hidden="true" />}>
            <div className="admin-upload-group-list">{order.uploadGroups.map(group => <div className="admin-upload-group" key={group.id}><div className="admin-upload-group-heading"><div><strong>{group.label}</strong><span>{group.minFiles > 0 ? `Tối thiểu ${group.minFiles} file` : 'Không bắt buộc'}{group.maxFiles ? ` · Tối đa ${group.maxFiles}` : ''}</span></div><span className="admin-upload-count">{group.files.length} file</span></div>{group.files.length > 0 ? <div className="admin-file-list">{group.files.map(file => <a key={file.id} className="admin-file-row" href={file.downloadPath} target="_blank" rel="noreferrer"><span><strong>{file.filename || file.mediaAssetId}</strong><small>{file.mimeType} · {Math.round(file.sizeBytes / 1024)} KB</small></span><ArrowLeft size={15} className="rotate-180" aria-hidden="true" /></a>)}</div> : <p className="admin-detail-muted">Chưa có file.</p>}</div>)}{order.uploadGroups.length === 0 && <p className="admin-detail-muted">Chưa tạo nhóm upload.</p>}</div>
          </Section>

          <Section title="Timeline trạng thái" icon={<Clock3 size={17} aria-hidden="true" />}>
            <div className="admin-timeline">{order.statusHistory.map(event => <div className="admin-timeline-item" key={event.id}><span className="admin-timeline-dot" aria-hidden="true" /><div><div className="admin-timeline-title"><strong>{event.fromStatus ? `${statusLabel(event.fromStatus)} → ` : ''}{statusLabel(event.toStatus)}</strong><time>{formatAdminDate(event.createdAt, true)}</time></div><span>{event.actorName}{event.reason ? ` · ${event.reason}` : ''}</span></div></div>)}{order.statusHistory.length === 0 && <p className="admin-detail-muted">Chưa có lịch sử chuyển trạng thái.</p>}</div>
            {order.availableTransitions.length > 0 && <form className="admin-action-form" onSubmit={submitStatus}><div className="admin-action-form-heading"><strong>Chuyển trạng thái</strong><span>Phiên bản hiện tại: {order.updatedAt}</span></div><div className="admin-action-grid"><label className="admin-field"><span>Trạng thái tiếp theo</span><select value={transitionStatus} onChange={event => setTransitionStatus(event.target.value)} required><option value="">Chọn trạng thái</option>{order.availableTransitions.map(status => <option key={status} value={status}>{ORDER_STATUS_LABELS[status] || status}</option>)}</select></label><label className="admin-field admin-field-wide"><span>Lý do / ghi chú</span><input value={transitionReason} onChange={event => setTransitionReason(event.target.value)} maxLength={500} placeholder="Ví dụ: Đã xác nhận đủ thông tin..." required /></label></div><button type="submit" className="admin-primary-button" disabled={isMutating || !transitionStatus}>{isMutating ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Check size={15} aria-hidden="true" />} Cập nhật trạng thái</button></form>}
          </Section>
        </div>

        <aside className="admin-detail-side-column">
          <Section title="Thanh toán" icon={<WalletCards size={17} aria-hidden="true" />}>
            <form className="admin-action-form is-compact" onSubmit={submitPayment}><label className="admin-field"><span>Trạng thái</span><select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value)}>{Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="admin-field"><span>Lý do thay đổi</span><textarea value={paymentReason} onChange={event => setPaymentReason(event.target.value)} rows={3} maxLength={500} placeholder="Ghi rõ nội dung đối soát..." required /></label><button type="submit" className="admin-primary-button" disabled={isMutating || paymentStatus === order.paymentStatus}><WalletCards size={15} aria-hidden="true" /> Lưu thanh toán</button></form>
          </Section>

          <Section title="Phân công" icon={<UserRound size={17} aria-hidden="true" />}>
            <form className="admin-action-form is-compact" onSubmit={submitAssignment}><label className="admin-field"><span>Admin phụ trách</span><select value={assignment} onChange={event => setAssignment(event.target.value)}><option value="">Chưa phân công</option>{order.adminUsers.map(admin => <option key={admin.id} value={admin.id}>{admin.name} · {admin.email}</option>)}</select></label><button type="submit" className="admin-secondary-button" disabled={isMutating || assignment === (order.assignedAdminId || '')}>Lưu phân công</button></form><div className="admin-assignment-history">{order.assignments.slice(0, 5).map(item => <div key={`${item.adminId}-${item.assignedAt}`}><strong>{item.adminName}</strong><span>{formatAdminDate(item.assignedAt, true)}{item.unassignedAt ? ` → ${formatAdminDate(item.unassignedAt, true)}` : ' · Đang phụ trách'}</span></div>)}</div>
          </Section>

          <Section title="Ghi chú" icon={<MessageSquare size={17} aria-hidden="true" />}>
            <form className="admin-action-form is-compact" onSubmit={submitNote}><label className="admin-field"><span>Hiển thị cho</span><select value={noteVisibility} onChange={event => setNoteVisibility(event.target.value as 'internal' | 'customer')}><option value="internal">Nội bộ</option><option value="customer">Khách hàng</option></select></label><label className="admin-field"><span>Nội dung</span><textarea value={noteBody} onChange={event => setNoteBody(event.target.value)} rows={4} maxLength={4000} placeholder="Ghi lại trao đổi hoặc việc cần làm..." required /></label><button type="submit" className="admin-primary-button" disabled={isMutating || !noteBody.trim()}><MessageSquare size={15} aria-hidden="true" /> Thêm ghi chú</button></form><div className="admin-note-list">{order.notes.map(note => <article key={note.id} className={`admin-note-card ${note.visibility === 'customer' ? 'is-customer' : ''}`}><div><strong>{note.visibility === 'customer' ? 'Khách hàng thấy' : 'Nội bộ'}</strong><time>{formatAdminDate(note.createdAt, true)}</time></div><p>{note.body}</p><span>{note.authorName}</span></article>)}{order.notes.length === 0 && <p className="admin-detail-muted">Chưa có ghi chú.</p>}</div>
          </Section>
        </aside>
      </div>
    </div>
  )
}
