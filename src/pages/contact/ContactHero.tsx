import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

/**
 * ContactHero — top of the /contact page.
 *
 * Mirrors TemplatesHero + PricingHero structure so the contact page
 * feels native to the rest of the site:
 *   1. Eyebrow badge (kênh hỗ trợ)
 *   2. Breadcrumb (Trang chủ / Liên hệ)
 *   3. Big signature-style headline with highlight-gradient keyword
 *   4. Friendly Vietnamese description
 *   5. Floating sparkle + wave decorations
 */
export function ContactHero() {
  return (
    <div className="page-content-header bg-transparent">
      <div className="page-content-header-wrapper">
        {/* Eyebrow badge */}
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#d9a441]/30 bg-white py-1.5 pl-2 pr-4 text-xs font-semibold text-[#7c3f06] shadow-soft sm:text-sm">
          <span className="relative grid size-6 place-items-center rounded-full bg-[#d9a441] text-white">
            <Sparkles size={12} fill="currentColor" />
          </span>
          <span className="font-viet">Kênh hỗ trợ · Liên hệ trực tiếp</span>
        </div>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breacrumbs-wrapper mb-2">
          <ol className="flex items-center gap-2 text-sm font-viet">
            <li className="text-primary hover:text-primary/80 transition-colors">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-primary font-medium">Liên hệ</li>
          </ol>
        </nav>

        {/* Title */}
        <div className="header-info relative">
          <h1 className="page-title font-heading">
            <span className="font-display italic">Chúng tôi luôn sẵn sàng</span>
            <br />
            <span className="highlight-gradient font-display italic">lắng nghe bạn</span>
          </h1>

          {/* Description */}
          <p className="page-description font-viet">
            Đội ngũ Dearlove phản hồi trong vòng 30 phút qua Messenger và Zalo. Chọn kênh
            thuận tiện nhất bên dưới để được hỗ trợ nhanh chóng và tận tâm.
          </p>

          {/* Decorative Elements */}
          <div className="decorate-polish">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
                fill="#ffd700"
                stroke="#ffb700"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="decorate-wave">
            <svg
              width="120"
              height="24"
              viewBox="0 0 120 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 12C20 12 20 4 40 4C60 4 60 20 80 20C100 20 100 12 120 12"
                stroke="#ff4874"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
