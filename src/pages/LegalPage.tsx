import { Link } from 'react-router-dom'

interface LegalPageProps {
  kind: 'terms' | 'privacy'
}

export function LegalPage({ kind }: LegalPageProps) {
  const isTerms = kind === 'terms'

  return (
    <main className="min-h-[70vh] bg-background px-5 py-16 sm:px-8 lg:px-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-[#d9a441]/20 bg-white p-6 shadow-soft sm:p-10">
        <p className="eyebrow">Dearlove</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-[#8d1216]">
          {isTerms ? 'Điều khoản sử dụng' : 'Chính sách bảo mật'}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#7c3f06]/70">
          Nội dung chính thức đang được hoàn thiện trước khi Dearlove mở các luồng đăng ký và đặt thiệp.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-[#7c3f06]">
          <section>
            <h2 className="font-heading text-xl font-semibold text-[#8d1216]">Phạm vi áp dụng</h2>
            <p className="mt-2">
              Trang này sẽ mô tả rõ quyền, trách nhiệm và cách Dearlove xử lý thông tin khi khách hàng sử dụng catalog, tài khoản và dịch vụ đặt thiệp.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-semibold text-[#8d1216]">Liên hệ</h2>
            <p className="mt-2">
              Nếu cần trao đổi trước khi nội dung được cập nhật đầy đủ, vui lòng gửi yêu cầu qua trang liên hệ của Dearlove.
            </p>
          </section>
        </div>
        <Link to="/contact" className="mt-8 inline-flex rounded-full bg-[#8d1216] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7c3f06]">
          Đến trang liên hệ
        </Link>
      </article>
    </main>
  )
}
