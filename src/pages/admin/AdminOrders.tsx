import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient } from '../../lib/auth-client'

interface AdminOrder {
  id: string
  order_code: string
  customer_id: string
  template_id: string
  status: string
  payment_status: string
  event_date: string | null
  created_at: number
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isPending && (!session || (session.user as { role?: string }).role !== 'admin')) {
      navigate('/auth?mode=login&returnTo=/admin/orders', { replace: true })
    }
  }, [isPending, navigate, session])

  useEffect(() => {
    if (!session || (session.user as { role?: string }).role !== 'admin') return
    const params = status ? `?status=${encodeURIComponent(status)}` : ''
    fetch(`/api/v1/admin/orders${params}`, { credentials: 'include' })
      .then(async response => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error?.message || 'Không thể tải đơn hàng.')
        return body
      })
      .then(body => setOrders(body.data ?? []))
      .catch(error => setError(error instanceof Error ? error.message : 'Không thể tải đơn hàng.'))
  }, [session, status])

  if (isPending || !session) {
    return <main className="grid min-h-[70vh] place-items-center bg-background"><p className="text-sm text-[#7c3f06]/70">Đang tải...</p></main>
  }

  return (
    <main className="min-h-[70vh] bg-background px-5 py-16 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-6xl rounded-3xl border border-[#d9a441]/20 bg-white p-6 shadow-soft sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Dearlove admin</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-[#8d1216]">Quản lý đơn hàng</h1>
          </div>
          <label className="grid gap-1 text-xs font-semibold text-[#7c3f06]">Lọc trạng thái<select value={status} onChange={event => setStatus(event.target.value)} className="min-h-10 rounded-xl border border-[#d9a441]/30 bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="reviewing">Reviewing</option><option value="awaiting_customer">Awaiting customer</option><option value="confirmed">Confirmed</option></select></label>
        </div>
        {error && <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead><tr className="border-b border-[#d9a441]/20 text-xs uppercase tracking-wide text-[#7c3f06]/60"><th className="px-3 py-3">Mã đơn</th><th className="px-3 py-3">Khách hàng</th><th className="px-3 py-3">Mẫu</th><th className="px-3 py-3">Trạng thái</th><th className="px-3 py-3">Thanh toán</th><th className="px-3 py-3">Ngày sự kiện</th></tr></thead>
            <tbody>
              {orders.map(order => <tr key={order.id} className="border-b border-[#d9a441]/10 text-[#7c3f06]"><td className="px-3 py-4 font-semibold text-[#8d1216]">{order.order_code}</td><td className="px-3 py-4 font-mono text-xs">{order.customer_id}</td><td className="px-3 py-4">{order.template_id}</td><td className="px-3 py-4">{order.status}</td><td className="px-3 py-4">{order.payment_status}</td><td className="px-3 py-4">{order.event_date || '—'}</td></tr>)}
            </tbody>
          </table>
          {orders.length === 0 && !error && <p className="py-10 text-center text-sm text-[#7c3f06]/60">Chưa có đơn hàng.</p>}
        </div>
      </section>
    </main>
  )
}
