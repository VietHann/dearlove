import { Crown, Sparkles } from 'lucide-react'
import { PRICING_PLANS, type PricingPlan } from './pricingData'

/**
 * PricingCards — the three plan cards.
 *
 * Mirrors the zenlove source HTML:
 *   - Free Plan   | green price, dashed countdown, primary CTA
 *   - Basic Plan  | blue price, popular ribbon, countdown
 *   - Premium Plan| orange price, "Gói tốt nhất" badge (animated), gold ring
 *
 * On mobile (default) the cards stack vertically; on md+ they sit side-by-side.
 */
export function PricingCards() {
  return (
    <section className="m-auto max-w-7xl px-2.5 md:px-4">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {PRICING_PLANS.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
      <p className="!mt-2 text-center text-sm text-gray-500">
        Giá trên đã bao gồm thuế/phí theo quy định hiện hành.
      </p>
    </section>
  )
}

interface PlanCardProps {
  plan: PricingPlan
}

function PlanCard({ plan }: PlanCardProps) {
  const cardClasses = plan.featured
    ? 'plan-card plan-card--featured relative flex h-full flex-col p-6'
    : 'plan-card relative flex h-full flex-col p-6'

  return (
    <div className={cardClasses}>
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-zen-primary to-[#ff6b7a] px-3 py-1 text-xs font-semibold text-white shadow-md animate-phone-ring">
            <Crown size={12} />
            {plan.ribbon ?? 'Phổ biến'}
          </span>
        </div>
      )}

      {/* Header: name + featured badge */}
      <div className="mb-6 flex flex-col md:min-h-[230px]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-2xl text-gray-800">{plan.name}</h3>
            {plan.featured && (
              <Sparkles size={18} className="text-[#faad14]" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Price block */}
        <div className="mb-4 flex flex-col justify-start md:min-h-[112px]">
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-3">
              <div className={`text-4xl font-bold ${plan.priceColorClass}`}>
                {plan.priceLabel}
              </div>
              {plan.discountBadge && (
                <span className="rounded-full bg-zen-primary px-3 py-1 text-sm font-semibold text-white">
                  {plan.discountBadge}
                </span>
              )}
            </div>
            <div className={`text-base italic text-gray-500 line-through ${plan.originalPriceLabel ? '' : 'invisible'}`}>
              {plan.originalPriceLabel ?? '\u00a0'}
            </div>
            {plan.countdown && <div className="countdown">⏰ {plan.countdown}</div>}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <a href="/register" className="block">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-zen-primary px-4 py-2.5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-zen-primary-hover hover:shadow-lg">
              {plan.ctaLabel}
              <Sparkles size={16} />
            </button>
          </a>
        </div>
      </div>

      {/* Limits + features lists */}
      <div className="mb-6 space-y-6">
        <LimitSection plan={plan} />
        <FeatureSection plan={plan} />
      </div>
    </div>
  )
}

function LimitSection({ plan }: { plan: PricingPlan }) {
  return (
    <div>
      <h4 className="mb-3 font-heading text-base text-gray-800">
        <SectionIcon type="limit" /> Giới hạn gói
      </h4>
      <ul className="space-y-3">
        {plan.limits.map(limit => (
          <li key={limit.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <BulletIcon />
              <span className="text-gray-700">{limit.label}</span>
            </div>
            <span className="font-semibold text-gray-600">{limit.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeatureSection({ plan }: { plan: PricingPlan }) {
  return (
    <div>
      <h4 className="mb-3 font-heading text-base text-gray-800">
        <SectionIcon type="feature" /> Tính năng chính
      </h4>
      <ul className="space-y-3">
        {plan.features.map(feature => (
          <li key={feature.label} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-1">
              <BulletIcon />
              <span className="text-gray-700">{feature.label}</span>
            </div>
            {feature.included ? (
              <CheckIcon />
            ) : (
              <CrossIcon />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionIcon({ type }: { type: 'limit' | 'feature' }) {
  if (type === 'limit') {
    return (
      <svg
        aria-hidden="true"
        className="mr-1 inline-block"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        style={{ color: '#e54153' }}
      >
        <g fill="currentColor">
          <path
            clipRule="evenodd"
            d="M9.16312 3.77528C9.28724 4.17046 9.0675 4.59144 8.67232 4.71555C5.23899 5.7939 2.75 9.00185 2.75 12.7892C2.75 17.462 6.53805 21.25 11.2108 21.25C14.9982 21.25 18.2061 18.761 19.2845 15.3277C19.4086 14.9325 19.8296 14.7128 20.2247 14.8369C20.6199 14.961 20.8397 15.382 20.7155 15.7772C19.4465 19.8177 15.6721 22.75 11.2108 22.75C5.70962 22.75 1.25 18.2904 1.25 12.7892C1.25 8.32794 4.18231 4.55354 8.22285 3.28448C8.61803 3.16036 9.039 3.3801 9.16312 3.77528Z"
            fillRule="evenodd"
            opacity="0.5"
          />
          <path d="M21.9131 9.94727C20.8515 6.14438 17.8556 3.14845 14.0527 2.0869C12.4091 1.6281 11 3.05419 11 4.76062V11.4551C11 12.3083 11.6917 13 12.5449 13H19.2394C20.9458 13 22.3719 11.5909 21.9131 9.94727Z" />
        </g>
      </svg>
    )
  }
  return (
    <svg
      aria-hidden="true"
      className="mr-1 inline-block"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      style={{ color: '#e54153' }}
    >
      <g fill="currentColor">
        <path
          d="M21.8382 11.1263L21.609 13.5616C21.2313 17.5742 21.0425 19.5805 19.8599 20.7902C18.6773 22 16.9048 22 13.3599 22H10.6401C7.09517 22 5.32271 22 4.14009 20.7902C2.95748 19.5805 2.76865 17.5742 2.391 13.5616L2.16181 11.1263C1.9818 9.2137 1.8918 8.25739 2.21899 7.86207C2.39598 7.64823 2.63666 7.5172 2.89399 7.4946C3.36968 7.45282 3.96708 8.1329 5.16187 9.49307C5.77977 10.1965 6.08872 10.5482 6.43337 10.6027C6.62434 10.6328 6.81892 10.6018 6.99526 10.5131C7.31351 10.3529 7.5257 9.91812 7.95007 9.04852L10.1869 4.46486C10.9888 2.82162 11.3898 2 12 2C12.6102 2 13.0112 2.82162 13.8131 4.46485L16.0499 9.04851C16.4743 9.91812 16.6865 10.3529 17.0047 10.5131C17.1811 10.6018 17.3757 10.6328 17.5666 10.6027C17.9113 10.5482 18.2202 10.1965 18.8381 9.49307C20.0329 8.1329 20.6303 7.45282 21.106 7.4946C21.3633 7.5172 21.604 7.64823 21.781 7.86207C22.1082 8.25739 22.0182 9.2137 21.8382 11.1263Z"
          opacity="0.5"
        />
        <path d="M12.9524 12.6989L12.8541 12.5225C12.4741 11.8408 12.2841 11.5 12 11.5C11.7159 11.5 11.5259 11.8408 11.1459 12.5225L11.0476 12.6989C10.9397 12.8926 10.8857 12.9894 10.8015 13.0533C10.7173 13.1172 10.6125 13.141 10.4028 13.1884L10.2119 13.2316C9.47396 13.3986 9.10501 13.482 9.01723 13.7643C8.92945 14.0466 9.18097 14.3407 9.68403 14.929L9.81418 15.0812C9.95713 15.2483 10.0286 15.3319 10.0608 15.4353C10.0929 15.5387 10.0821 15.6502 10.0605 15.8733L10.0408 16.0763C9.96476 16.8612 9.92674 17.2536 10.1565 17.4281C10.3864 17.6025 10.7318 17.4435 11.4227 17.1254L11.4227 17.1253L11.6014 17.0431L11.6015 17.043C11.7978 16.9527 11.8959 16.9075 12 16.9075C12.1041 16.9075 12.2022 16.9527 12.3986 17.0431L12.3986 17.0431L12.5773 17.1254C13.2682 17.4435 13.6136 17.6025 13.8435 17.4281C14.0733 17.2536 14.0352 16.8612 13.9592 16.0763L13.9395 15.8733C13.9179 15.6502 13.9071 15.5387 13.9392 15.4353C13.9714 15.3319 14.0429 15.2483 14.1858 15.0812L14.316 14.929L14.316 14.929C14.819 14.3407 15.0706 14.0466 14.9828 13.7643C14.895 13.482 14.526 13.3986 13.7881 13.2316L13.5972 13.1884C13.3875 13.141 13.2827 13.1172 13.1985 13.0533C13.1143 12.9894 13.0603 12.8926 12.9524 12.6989Z" />
      </g>
    </svg>
  )
}

function BulletIcon() {
  return (
    <svg
      aria-hidden="true"
      className="inline-block"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ color: '#e54153' }}
    >
      <path d="M11.8114 6.7267C12.8247 4.9089 13.3314 4 14.0889 4C14.8464 4 15.353 4.9089 16.3663 6.7267L16.6285 7.19699C16.9164 7.71355 17.0604 7.97183 17.2849 8.14225C17.5094 8.31266 17.789 8.37592 18.3482 8.50244L18.8572 8.61762C20.825 9.06284 21.8089 9.28545 22.0429 10.0382C22.277 10.7909 21.6063 11.5753 20.2648 13.1439L19.9177 13.5498C19.5365 13.9955 19.3459 14.2184 19.2602 14.4942C19.1744 14.7699 19.2032 15.0673 19.2609 15.662L19.3134 16.2035C19.5162 18.2965 19.6176 19.343 19.0047 19.8082C18.3919 20.2734 17.4707 19.8492 15.6283 19.0009L15.1517 18.7815C14.6281 18.5404 14.3664 18.4199 14.0889 18.4199C13.8114 18.4199 13.5496 18.5404 13.0261 18.7815L12.5494 19.0009C10.707 19.8492 9.78581 20.2734 9.17299 19.8082C8.56016 19.343 8.66157 18.2965 8.86438 16.2035L8.91685 15.662C8.97449 15.0673 9.0033 14.7699 8.91756 14.4942C8.83181 14.2184 8.64121 13.9955 8.26 13.5498L7.91295 13.1439C6.57147 11.5753 5.90073 10.7909 6.1348 10.0382C6.36888 9.28545 7.35275 9.06284 9.3205 8.61762L9.82958 8.50244C10.3887 8.37592 10.6683 8.31266 10.8928 8.14225C11.1173 7.97183 11.2613 7.71355 11.5492 7.19699L11.8114 6.7267Z" />
      <path d="M2.08887 16C3.20445 15.121 4.68639 14.7971 6.08887 15.1257" opacity="0.5" strokeLinecap="round" />
      <path d="M2.08887 10.5C3.08887 10 3.37862 10.0605 4.08887 10" opacity="0.5" strokeLinecap="round" />
      <path d="M2 5.60867L2.20816 5.48676C4.41383 4.19506 6.75032 3.84687 8.95304 4.48161L9.16092 4.54152" opacity="0.5" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}

function CrossIcon() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-[#e54153]" aria-label="không bao gồm">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </span>
  )
}
