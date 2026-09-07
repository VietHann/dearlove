import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FOOTER_SECTIONS, IMAGES } from '../lib/constants'
import { Send, Facebook, Instagram, Sparkles, Linkedin, Youtube } from 'lucide-react'

const SOCIAL_ICONS = [Facebook, Instagram, Sparkles, Linkedin, Youtube]
const TRUST_BADGES = ['✓ Hơn 500 mẫu thiệp', 'Tạo trong 60 giây']

const FOOTER_LINKS: Record<string, Record<string, string>> = {
  'Sản phẩm': {
    'Thiệp cưới': '/templates?category=wedding',
    'Thiệp sinh nhật': '/templates?category=birthday',
    'Thiệp chúc mừng': '/templates?category=congrats',
    'Thiệp lễ Tết': '/templates?category=festival',
  },
  'Công ty': {
    'Giới thiệu': '/about',
    'Tuyển dụng': '/contact',
    'Báo chí': '/contact',
    'Đối tác': '/contact',
  },
  'Hỗ trợ': {
    'Trung tâm hỗ trợ': '/support',
    'Điều khoản': '/terms',
    'Bảo mật': '/privacy',
    'Liên hệ': '/contact',
  },
}

/** Site footer with newsletter signup, navigation, and social row. */
export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const submitNewsletter = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterState('loading')
    try {
      const response = await fetch('/api/v1/newsletter-subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ email: newsletterEmail }) })
      if (!response.ok) throw new Error('newsletter error')
      setNewsletterState('success')
    } catch { setNewsletterState('error') }
  }

  return (
    <footer className="bg-[#8d1216] px-5 py-12 text-white sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Link to="/" className="flex items-center" aria-label="Dearlove - Trang chủ">
              <img src={IMAGES.logo} alt="Dearlove" style={{ height: '88px', width: 'auto' }} className="object-contain" />
            </Link>
            <p className="mt-6 max-w-md text-sm text-white/75">{newsletterState === 'success' ? 'Đã đăng ký nhận tin thành công.' : newsletterState === 'error' ? 'Không thể đăng ký lúc này, vui lòng thử lại.' : 'Nhận mẫu thiệp mới mỗi tuần.'}</p>
            <form className="mt-3 flex max-w-md rounded-full bg-white p-1.5" onSubmit={submitNewsletter} aria-busy={newsletterState === 'loading'}>
              <label className="sr-only" htmlFor="footer-newsletter-email">Email nhận tin</label>
              <input id="footer-newsletter-email" type="email" value={newsletterEmail} onChange={event => setNewsletterEmail(event.target.value)} required className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#7c3f06] outline-none placeholder:text-[#7c3f06]/40" placeholder="Email của bạn..." />
              <button type="submit" disabled={newsletterState === 'loading' || newsletterState === 'success'} className="grid size-11 place-items-center rounded-full bg-[#d9a441] text-white transition hover:bg-[#e0a422] disabled:cursor-wait disabled:opacity-60" aria-label="Đăng ký nhận tin">
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {FOOTER_SECTIONS.map(([title, ...links]) => (
              <div key={title}>
                <p className="mb-4 text-sm font-semibold text-[#f7c948]">{title}</p>
                <div className="grid gap-2.5">
                  {links.map(label => (
                    <Link className="text-sm text-white/65 transition hover:text-[#f7c948]" to={FOOTER_LINKS[title]?.[label] ?? '/contact'} key={label}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="my-8 border-t border-[#d9a441]/30" />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-2" aria-label="Mạng xã hội">
            {SOCIAL_ICONS.map((Icon, index) => (
              <span className="grid size-10 place-items-center rounded-full border border-[#d9a441]/40 text-white/75" key={index} title="Kênh social sẽ được cập nhật">
                <Icon size={17} aria-hidden="true" />
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            {TRUST_BADGES.map(badge => (
              <span className="rounded-xl border border-[#d9a441]/40 px-4 py-2 text-xs text-white/85" key={badge}>{badge}</span>
            ))}
          </div>
        </div>
        <p className="mt-8 text-[11px] leading-5 text-white/50">
          Dearlove - Nền tảng tạo thiệp trực tuyến cho mọi dịp. Hơn 500 mẫu thiệp đẹp, tùy chỉnh dễ dàng, gửi nhanh chóng. © 2026 Dearlove Inc.
        </p>
      </div>
    </footer>
  )
}
