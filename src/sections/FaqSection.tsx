import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { ScrollReveal, StaggerContainer } from '../components'
import { Heading } from '../components/ui/Heading'
import { FAQS } from '../lib/constants'

/**
 * FaqSection — frequently asked questions accordion.
 *
 * Single-collapsible Radix Accordion wrapped in a stagger-revealed list.
 * Each item is a card with chevron icon that rotates open.
 */
export function FaqSection() {
  return (
    <section id="faq" className="relative z-10 bg-[#fcfbf8] px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
      <ScrollReveal>
        <div className="mx-auto max-w-4xl">
          <Heading eyebrow="Câu hỏi thường gặp">Mọi thắc mắc sẽ được giải đáp.</Heading>
          <StaggerContainer staggerDelay={0.06} direction="scale" className="mt-14 space-y-4">
            <Accordion.Root type="single" collapsible className="contents">
              {FAQS.map(([q, a], i) => (
                <Accordion.Item
                  key={q}
                  value={`i${i}`}
                  className="group overflow-hidden rounded-3xl border border-[#d9a441]/20 bg-white px-6 shadow-soft transition-all hover:border-[#d9a441]/50 hover:shadow-xl sm:px-12"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="accordion-trigger flex w-full items-center py-7 text-left text-xl font-semibold text-[#8d1216] transition-colors group-hover:text-[#d9a441] sm:text-2xl">
                      {q}
                      <ChevronDown className="ml-auto text-[#d9a441]"/>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="accordion-content overflow-hidden">
                    <p className="pb-8 text-base leading-7 text-[#7c3f06]/80 sm:text-lg">{a}</p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </StaggerContainer>
        </div>
      </ScrollReveal>
    </section>
  )
}