import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { authClient } from '../../lib/auth-client'

export default function Account() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session) {
      navigate('/auth?mode=login&returnTo=/account', { replace: true })
    }
  }, [isPending, navigate, session])

  if (isPending || !session) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-background px-5 py-16">
        <p className="text-sm text-[#7c3f06]/70">Đang tải tài khoản...</p>
      </main>
    )
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/auth?mode=login', { replace: true })
  }

  return (
    <main className="min-h-[70vh] bg-background px-5 py-16 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-4xl rounded-3xl border border-[#d9a441]/20 bg-white p-6 shadow-soft sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Tài khoản Dearlove</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-[#8d1216]">
              Xin chào, {session.user.name}
            </h1>
            <p className="mt-2 text-sm text-[#7c3f06]/70">{session.user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#8d1216]/20 px-4 py-2 text-sm font-semibold text-[#8d1216] transition hover:bg-[#fdf2e3]"
          >
            <LogOut size={16} aria-hidden="true" />
            Đăng xuất
          </button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link to="/templates" className="rounded-2xl border border-[#d9a441]/20 bg-[#fdf2e3]/60 p-5 transition hover:border-[#d9a441]">
            <UserRound size={22} className="text-[#8d1216]" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-xl font-semibold text-[#8d1216]">Chọn mẫu thiệp</h2>
            <p className="mt-2 text-sm leading-6 text-[#7c3f06]/70">Khám phá các mẫu đang được Dearlove giới thiệu.</p>
          </Link>
          <div className="rounded-2xl border border-dashed border-[#d9a441]/30 p-5">
            <h2 className="font-heading text-xl font-semibold text-[#8d1216]">Đơn hàng của bạn</h2>
            <p className="mt-2 text-sm leading-6 text-[#7c3f06]/70">Khu vực theo dõi đơn và gửi ảnh sẽ được nối ở bước Order API tiếp theo.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
