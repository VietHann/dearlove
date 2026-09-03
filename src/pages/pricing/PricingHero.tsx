import { Link } from 'react-router-dom'
import { Gift, Sparkles } from 'lucide-react'

/**
 * PricingHero — top of the /pricing page.
 *
 * Structure:
 *   1. Breadcrumb (Trang chủ / Bảng giá)
 *   2. Hero title with signature "gói dịch vụ" word
 *   3. Promotional banner with discount countdown
 */
export function PricingHero() {
  return (
    <div className="page-content-header bg-transparent">
      <div className="page-content-header-wrapper">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="breacrumbs-wrapper mb-0">
          <ol className="flex items-center gap-2 text-sm font-viet">
            <li className="text-primary hover:text-primary/80 transition-colors">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="text-gray-400">&gt;</li>
            <li aria-current="page" className="font-medium text-gray-900 font-viet">
              Gói dịch vụ
            </li>
          </ol>
        </nav>

        {/* Hero title */}
        <div className="pricing-hero-inner relative mx-auto max-w-3xl text-center">
          {/* Decorative squiggle (top-left) */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 hidden opacity-50 md:block"
            width="68"
            height="12"
            viewBox="0 0 68 12"
            fill="none"
          >
            <path
              d="M2.267 7.66c1.73.586 3.641.772 5.46.639 3.815-.28 9.064-2.132 11.847-5.407.66-.777 2.661-.736 3.224.112.65.98 1.499 1.915 2.625 2.786 5.99 4.635 13.017 2.99 16.257-3.007.415-.768 1.6-.86 2.081-.133 1.244 1.881 2.764 3.564 4.768 4.946 6.454 4.449 13.742.612 17.59-5.17"
              stroke="#7569BB"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeMiterlimit="1.5"
              strokeWidth="3"
            />
          </svg>

          {/* Decorative sparkle (bottom-right) */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 hidden opacity-50 md:block"
            width="29"
            height="30"
            viewBox="0 0 29 30"
            fill="none"
          >
            <path
              d="M14.543 30c-1.131.029-2.054-.658-2.173-1.523-.09-.687-.09-1.388-.075-2.075.09-3-1.414-5.328-3.14-7.537-.76-.97-1.906-1.418-3.156-1.448-1.087-.03-2.188-.015-3.275-.03-.49-.015-.997-.015-1.473-.119-.64-.134-1.236-.88-1.25-1.508-.015-.656.327-1.194.893-1.417 1.473-.568 2.947-1.18 4.48-1.523 3.185-.716 4.837-2.925 5.865-5.76.223-.598.089-1.344.074-2.016-.03-1.283-.149-2.567-.104-3.85.015-.627.476-1.09 1.146-1.18.67-.089 1.19.24 1.429.821.387 1 .803 2.03.997 3.09.997 5.268 5.79 9.03 11.149 8.686.49-.03.982-.149 1.473-.119.61.03 1.176.298 1.43.91.297.702.208 1.418-.343 1.926a3.738 3.738 0 0 1-1.518.85c-4.079 1.075-6.803 3.94-9.318 7.03-.64.791-.79 2-1.131 3.03-.298.94-.447 1.94-.864 2.82-.193.448-.833.717-1.116.941Zm5.7-14.434c-1.339-.88-2.53-1.552-3.601-2.373-1.057-.82-2.01-1.79-3.052-2.746L9.81 14.85c1.89 1.18 2.962 2.836 3.989 4.537.283.463.7.836 1.146 1.358.967-1 1.786-1.85 2.634-2.686.849-.82 1.712-1.597 2.665-2.493Z"
              fill="#FFAD4C"
            />
          </svg>

          <h1 className="page-title font-heading">
            <span className="font-display italic">Bảng giá</span>
            <br />
            <span className="highlight-gradient font-display italic">gói dịch vụ</span>
          </h1>
          <p className="page-description font-viet">
            Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn để tạo ra những website cưới, thiệp mời tuyệt đẹp và ấn tượng
          </p>

          {/* Promotional banner */}
          <div className="mx-auto mt-2 max-w-2xl">
            <PromoBanner />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Promo banner — discount percentage + countdown + CTA. */
function PromoBanner() {
  return (
    <section className="group relative w-full overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-white via-stone-50/60 to-rose-50/30 px-5 py-2.5 transition-all duration-300">
      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none promo-watermark transition-all duration-500 group-hover:scale-105">
        46%
      </div>

      <div className="relative z-10 flex flex-row items-center justify-between gap-2 text-center sm:gap-4 md:flex-col md:items-center">
        <div className="flex min-w-0 items-center gap-2 text-sm font-light text-stone-600 md:text-base">
          <div className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-zen-primary md:flex">
            <Gift size={12} />
          </div>
          <span className="truncate">Đồng hành dài lâu, nhận ngay mức ưu đãi lên đến 46%</span>
        </div>
        <Link
          to="/templates"
          className="bg-zen-primary hover:bg-zen-primary-hover inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg md:text-sm"
        >
          <Sparkles size={12} className="hidden md:inline" />
          Khám phá ngay
        </Link>
      </div>
    </section>
  )
}
