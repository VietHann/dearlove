import { ArrowUpRight } from 'lucide-react'
import { CONTACT_SUPPORT_TOPICS } from './contactData'

/**
 * ContactSupport — the four support topic cards (help, business, press,
 * safety). Mirrors PricingReasons' 4-up grid layout but with a slightly
 * different visual treatment (icon-on-top + soft cream gradient bg) so
 * the two pages stay distinct.
 */
export function ContactSupport() {
  return (
    <section
      aria-labelledby="contact-support-title"
      className="px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 via-white to-[#fdf2e3] p-8 shadow-soft sm:p-10 md:p-12">
          <header className="mb-8 text-center">
            <p className="m-0 inline-flex items-center rounded-full border border-[#d9a441]/25 bg-[#fdf2e3] px-3 py-1 text-xs font-medium text-[#7c3f06]">
              Các hình thức hỗ trợ
            </p>
            <h2
              id="contact-support-title"
              className="mt-3 font-heading text-2xl text-gray-900 md:text-3xl"
            >
              Bạn cần hỗ trợ về vấn đề gì?
            </h2>
            <p className="mt-2 text-sm text-gray-500 md:text-base">
              Chọn đúng chủ đề để được chuyển đến bộ phận phụ trách nhanh nhất.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_SUPPORT_TOPICS.map(topic => {
              const { Icon } = topic
              return (
                <a
                  key={topic.id}
                  href={`mailto:hello@dearlove.vn?subject=${encodeURIComponent(topic.title)}`}
                  className="contact-topic group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d9a441]/40 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fdf2e3] to-[#fcfbf8] text-[#b91c1c] transition-colors duration-300 group-hover:from-[#d9a441] group-hover:to-[#b91c1c] group-hover:text-white">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="flex items-center justify-between gap-2 font-heading text-base text-gray-800">
                    <span>{topic.title}</span>
                    <ArrowUpRight
                      size={16}
                      className="text-gray-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b91c1c]"
                    />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{topic.body}</p>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
