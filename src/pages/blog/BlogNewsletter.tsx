import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'

/**
 * BlogNewsletter — simple email subscription strip.
 */
export function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    await new Promise(resolve => setTimeout(resolve, 800))
    setSubmitted(true)
  }

  return (
    <section id="newsletter" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-[#d9a441]/25 bg-gradient-to-r from-[#8d1216] to-[#d9a441] px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Text */}
          <div className="text-center sm:text-left">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Nhận tin mới nhất
            </h2>
            <p className="mt-1 text-sm text-white/80">
              Đăng ký để cập nhật xu hướng và ưu đãi
            </p>
          </div>

          {/* Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex w-full gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3f06]/50" />
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-full border-0 bg-white pl-10 pr-4 text-sm text-[#7c3f06] placeholder-[#7c3f06]/40 focus:outline-none focus:ring-2 focus:ring-white/30 sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#d9a441] px-5 text-sm font-semibold text-white transition hover:bg-[#f7c948] hover:text-[#8d1216] sm:text-base"
              >
                <span>Đăng ký</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-white">Cảm ơn bạn đã đăng ký!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
