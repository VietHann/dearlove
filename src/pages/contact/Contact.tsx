import { ContactHero } from './ContactHero'
import { ContactChannels } from './ContactChannels'
import { ContactFAQ } from './ContactFAQ'
import { ContactSupport } from './ContactSupport'
import { ContactMap } from './ContactMap'
import ContactForm from './ContactForm'

import './contact.css'

/**
 * Contact — the /contact route.
 *
 * Uses the shared Dearlove <Header /> + <Footer /> from the global Layout
 * (see App.tsx) so the nav stays consistent across the marketing site.
 *
 * Layout (top → bottom):
 *   1. Shared Dearlove header (sticky, scroll-aware pill) — rendered by Layout
 *   2. ContactHero (breadcrumb + eyebrow + signature title + description)
 *   3. ContactChannels (4 kênh liên hệ chính: Messenger, Zalo, Email, Hotline)
 *   4. ContactFAQ (câu hỏi thường gặp về liên hệ)
 *   5. ContactSupport (4 hình thức hỗ trợ theo chủ đề)
 *   6. ContactMap (3 văn phòng + bản đồ SVG)
 *   7. Footer — rendered by Layout
 */
export default function Contact() {
  return (
    <div className="bg-background text-foreground">
      <main className="relative">
        <ContactHero />

        <div className="mx-auto max-w-7xl space-y-4 px-2.5 md:px-4">
          <ContactChannels />
          <ContactForm />
          <ContactFAQ />
          <ContactSupport />
          <ContactMap />
        </div>
      </main>
    </div>
  )
}
