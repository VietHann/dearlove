import { PRICING_REASONS } from './pricingData'

/**
 * PricingReasons — "Vì sao nên sử dụng gói trả phí?" three-card strip.
 * Followed by the gradient CTA banner.
 */
export function PricingReasons() {
  return (
    <>
      <div className="mt-12 rounded-2xl bg-gray-50 p-8">
        <h2 className="mb-8 text-center font-heading text-2xl text-gray-800">
          Vì sao nên sử dụng gói trả phí?
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRICING_REASONS.map(reason => (
            <div key={reason.title} className="reason-card">
              <span className="emoji" aria-hidden="true">{reason.emoji}</span>
              <h3 className="mb-3 font-heading text-lg text-gray-800">{reason.title}</h3>
              <p className="text-gray-600">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-strip mt-12">
        <h3 className="mb-2 font-heading text-2xl text-white">
          Sẵn sàng tạo thiệp online ấn tượng?
        </h3>
        <p className="mb-4 text-base opacity-90 sm:text-lg">
          Đăng ký ngay hôm nay và bắt đầu tạo website cưới, thiệp mời đặc biệt đẹp mắt cho ngày trọng đại của bạn
        </p>
        <a href="/templates">
          Khám phá mẫu thiệp ngay
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </a>
      </div>
    </>
  )
}
