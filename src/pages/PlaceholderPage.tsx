import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Construction, Sparkles } from 'lucide-react'
import { NAV_LINKS, ROUTE_BY_LABEL } from '../lib/constants'

/**
 * Routes the site knows about — anything not in this set is treated as
 * a catch-all "page not found" by the placeholder.
 */
const KNOWN_ROUTES = new Set<string>([
  '/',
  '/pricing',
  '/contact',
  ...Object.values(ROUTE_BY_LABEL),
])

/**
 * Map a URL path → Vietnamese page title.
 * Falls back to the path itself for unknown routes so the catch-all
 * still gives the user useful feedback.
 */
function pathToTitle(pathname: string): string {
  const slug = pathname.replace(/^\//, '').split('/')[0]
  if (!slug) return 'Trang chủ'

  const labelBySlug: Record<string, string> = {
    templates: 'Mẫu Thiệp',
    categories: 'Danh Mục',
    about: 'Câu Chuyện',
    blog: 'Blog',
    support: 'Hỗ Trợ',
    contact: 'Liên Hệ',
    pricing: 'Giá Cả',
  }

  if (labelBySlug[slug]) return labelBySlug[slug]

  // Match against the canonical NAV_LINKS so the title stays consistent
  const match = NAV_LINKS.find(label => {
    const normalized = label.toLowerCase().replace(/\s+/g, '')
    return slug.toLowerCase() === normalized || `/${normalized}` === pathname
  })
  return match ?? decodeURIComponent(slug)
}

/**
 * PlaceholderPage — temporary page shown for routes that don't have
 * real content yet. Keeps the shared Header/Footer chrome so navigation
 * stays consistent across the site.
 */
export default function PlaceholderPage() {
  const location = useLocation()
  const title = pathToTitle(location.pathname)
  const isUnknown = !KNOWN_ROUTES.has(location.pathname)

  // Scroll to top whenever we land on a placeholder, so the user always
  // sees the "coming soon" message instead of landing mid-page.
  useEffect(() => {
    const lenis = (window as any).__lenis as
      | { scrollTo: (target: number | string, opts?: object) => void }
      | undefined
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [location.pathname])

  return (
    <main className="relative">
      <section className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#f7c948]/20 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-[#e54153]/15 blur-3xl" />
        </div>

        <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-[#fdf2e3] to-[#fcfbf8] shadow-lg shadow-[#8d1216]/10">
          {isUnknown ? (
            <Sparkles size={36} className="text-[#d9a441]" />
          ) : (
            <Construction size={36} className="text-[#d9a441]" />
          )}
        </div>

        <p className="eyebrow mt-6">{isUnknown ? 'Trang chưa tồn tại' : 'Đang phát triển'}</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-[#8d1216] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#7c3f06]/80 sm:text-lg">
          {isUnknown
            ? 'Đường dẫn bạn truy cập không tồn tại. Hãy quay lại trang chủ hoặc chọn một mục trong menu.'
            : 'Nội dung cho trang này đang được hoàn thiện. Vui lòng quay lại sau — Dearlove sẽ sớm cập nhật nhé!'}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#8d1216] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#a4161a]"
          >
            <ArrowLeft size={16} />
            Về trang chủ
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-[#d9a441]/40 bg-white px-5 py-3 text-sm font-semibold text-[#7c3f06] transition hover:border-[#d9a441] hover:text-[#8d1216]"
          >
            Xem bảng giá
          </Link>
        </div>
      </section>
    </main>
  )
}
