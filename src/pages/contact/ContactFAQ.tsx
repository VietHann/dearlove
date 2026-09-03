import { useState } from 'react'
import { CONTACT_FAQS } from './contactData'

/**
 * ContactFAQ — accordion of the most-asked contact questions.
 *
 * Single-open accordion mirroring PricingFAQ for visual consistency.
 * Initial open index = 0 so the user immediately sees an answer.
 */
export function ContactFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section
      aria-labelledby="contact-faq-title"
      className="px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <p className="m-0 inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
            FAQ về liên hệ
          </p>
          <h2
            id="contact-faq-title"
            className="mt-3 font-heading text-2xl text-gray-900 md:text-3xl"
          >
            Câu hỏi thường gặp
          </h2>
          <p className="mt-2 text-sm text-gray-500 md:text-base">
            Những câu hỏi phổ biến nhất về cách liên hệ và hỗ trợ từ Dearlove.
          </p>
        </header>

        <div className="space-y-3 md:space-y-4">
          {CONTACT_FAQS.map((faq, idx) => {
            const open = openIdx === idx
            return (
              <div
                key={faq.q}
                data-open={open}
                className={`faq-item overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
                  open ? 'border-pink-100' : 'border-gray-100 hover:border-pink-100'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left md:px-5 md:py-4"
                >
                  <h3 className="font-heading text-sm text-gray-900 md:text-base">{faq.q}</h3>
                  <span aria-hidden="true" className="faq-arrow">
                    ▶
                  </span>
                </button>
                <div className="faq-body text-sm text-gray-600 md:px-5">
                  <p className="leading-relaxed md:text-[15px]">{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
