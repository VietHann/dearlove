import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Upload } from 'lucide-react'
import { authClient } from '../../lib/auth-client'

export default function OrderPage() {
  const { templateId = '' } = useParams()
  const navigate = useNavigate()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [templateName, setTemplateName] = useState(templateId)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'wedding',
    note: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')
  const [orderCode, setOrderCode] = useState('')

  useEffect(() => {
    if (!sessionPending && !session) {
      navigate(`/auth?mode=login&returnTo=${encodeURIComponent(`/order/${templateId}`)}`, { replace: true })
    }
  }, [navigate, session, sessionPending, templateId])

  useEffect(() => {
    const storedName = new URLSearchParams(window.location.search).get('templateName')
    if (storedName) setTemplateName(storedName)
    if (session?.user) {
      setForm(current => ({
        ...current,
        fullName: current.fullName || session.user.name,
        email: current.email || session.user.email,
      }))
    }
  }, [session])

  if (sessionPending || !session) {
    return <main className="grid min-h-[70vh] place-items-center bg-background"><p className="text-sm text-[#7c3f06]/70">Đang tải...</p></main>
  }

  const update = (key: keyof typeof form, value: string) => {
    setForm(current => ({ ...current, [key]: value }))
  }

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      const response = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, templateId, templateName }),
      })
      const body = await response.json() as { data?: { orderCode: string }; error?: { message?: string } }
      if (!response.ok || !body.data) {
        setStatus('error')
        setError(body.error?.message || 'Không thể tạo đơn. Vui lòng thử lại.')
        return
      }
      setOrderCode(body.data.orderCode)
      setStatus('idle')
    } catch {
      setStatus('error')
      setError('Không thể kết nối tới hệ thống. Vui lòng thử lại.')
    }
  }

  if (orderCode) {
    return (
      <main className="min-h-[70vh] bg-background px-5 py-16 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-2xl rounded-3xl border border-[#d9a441]/20 bg-white p-8 text-center shadow-soft sm:p-12">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#fdf2e3] text-[#8d1216]"><Upload size={26} aria-hidden="true" /></div>
          <p className="eyebrow mt-6">Đã nhận yêu cầu</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-[#8d1216]">Mã đơn {orderCode}</h1>
          <p className="mt-4 text-sm leading-6 text-[#7c3f06]/70">Đội ngũ Dearlove sẽ kiểm tra thông tin và liên hệ lại với bạn. Bước tải ảnh sẽ được mở trong màn theo dõi đơn.</p>
          <Link to="/account" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8d1216] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7c3f06]">Về tài khoản <ArrowRight size={16} /></Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-background px-5 py-16 sm:px-8 lg:px-12">
      <form onSubmit={submitOrder} className="mx-auto max-w-3xl rounded-3xl border border-[#d9a441]/20 bg-white p-6 shadow-soft sm:p-10">
        <p className="eyebrow">Đặt thiệp Dearlove</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-[#8d1216]">Bắt đầu với mẫu {templateName}</h1>
        <p className="mt-3 text-sm leading-6 text-[#7c3f06]/70">Điền thông tin cơ bản trước. Sau khi tạo đơn, bạn sẽ bổ sung ảnh và yêu cầu thiết kế.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#7c3f06]">Họ và tên<input required value={form.fullName} onChange={e => update('fullName', e.target.value)} className="min-h-11 rounded-xl border border-[#d9a441]/30 px-4 outline-none focus:border-[#8d1216]" /></label>
          <label className="grid gap-2 text-sm font-medium text-[#7c3f06]">Email<input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className="min-h-11 rounded-xl border border-[#d9a441]/30 px-4 outline-none focus:border-[#8d1216]" /></label>
          <label className="grid gap-2 text-sm font-medium text-[#7c3f06]">Số điện thoại<input required value={form.phone} onChange={e => update('phone', e.target.value)} className="min-h-11 rounded-xl border border-[#d9a441]/30 px-4 outline-none focus:border-[#8d1216]" /></label>
          <label className="grid gap-2 text-sm font-medium text-[#7c3f06]">Ngày sự kiện<input type="date" value={form.eventDate} onChange={e => update('eventDate', e.target.value)} className="min-h-11 rounded-xl border border-[#d9a441]/30 px-4 outline-none focus:border-[#8d1216]" /></label>
          <label className="grid gap-2 text-sm font-medium text-[#7c3f06] sm:col-span-2">Loại sự kiện<select value={form.eventType} onChange={e => update('eventType', e.target.value)} className="min-h-11 rounded-xl border border-[#d9a441]/30 px-4 outline-none focus:border-[#8d1216]"><option value="wedding">Thiệp cưới</option><option value="birthday">Sinh nhật</option><option value="event">Sự kiện</option><option value="other">Khác</option></select></label>
          <label className="grid gap-2 text-sm font-medium text-[#7c3f06] sm:col-span-2">Ghi chú thêm<textarea value={form.note} onChange={e => update('note', e.target.value)} rows={5} className="rounded-xl border border-[#d9a441]/30 px-4 py-3 outline-none focus:border-[#8d1216]" placeholder="Phong cách, thời hạn mong muốn, yêu cầu riêng..." /></label>
        </div>

        {status === 'error' && <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p>}
        <button type="submit" disabled={status === 'submitting'} className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8d1216] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7c3f06] disabled:cursor-wait disabled:opacity-60">
          {status === 'submitting' ? 'Đang tạo đơn...' : 'Tạo đơn nháp'}
          <ArrowRight size={16} />
        </button>
      </form>
    </main>
  )
}
