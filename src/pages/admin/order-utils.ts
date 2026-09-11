export const ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  submitted: 'Mới gửi',
  reviewing: 'Đang xem',
  awaiting_customer: 'Chờ khách',
  confirmed: 'Đã xác nhận',
  in_production: 'Đang thực hiện',
  ready: 'Sẵn sàng',
  delivered: 'Đã bàn giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Chưa thanh toán',
  pending_verification: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  refunded: 'Đã hoàn tiền',
}

export const STATUS_TONE_CLASSES: Record<string, string> = {
  draft: 'admin-tone-neutral',
  submitted: 'admin-tone-warning',
  reviewing: 'admin-tone-info',
  awaiting_customer: 'admin-tone-warning',
  confirmed: 'admin-tone-purple',
  in_production: 'admin-tone-info',
  ready: 'admin-tone-success',
  delivered: 'admin-tone-info',
  completed: 'admin-tone-success',
  cancelled: 'admin-tone-danger',
}

export function formatAdminDate(value: number | string | null | undefined, withTime = false): string {
  if (!value) return '—'
  const date = typeof value === 'number' ? new Date(value) : new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('vi-VN', withTime
    ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Chưa báo giá'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

export function statusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status
}

export function paymentLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] || status
}
