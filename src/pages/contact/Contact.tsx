import { useEffect, useState } from 'react'
import { ContactHero } from './ContactHero'
import { ContactChannels } from './ContactChannels'
import { ContactFAQ } from './ContactFAQ'
import { ContactSupport } from './ContactSupport'
import { ContactMap } from './ContactMap'
import ContactForm from './ContactForm'
import { getPublicBootstrap, type ContentSection } from '../../lib/content-api'
import { PublishedBlock } from '../content/PublishedContent'

import './contact.css'

export default function Contact() {
  const [publishedSections, setPublishedSections] = useState<ContentSection[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getPublicBootstrap(controller.signal)
      .then(response => setPublishedSections(response.data.pages.contact?.sections || null))
      .catch(() => setPublishedSections(null))
    return () => controller.abort()
  }, [])

  const hasCmsContent = Boolean(publishedSections && publishedSections.length > 0)
  return (
    <div className="bg-background text-foreground">
      <main className="relative">
        <ContactHero />
        {hasCmsContent ? (
          <div className="mx-auto max-w-7xl space-y-4 px-2.5 md:px-4">
            {publishedSections?.map(section => <PublishedBlock key={section.stableKey} section={section} />)}
            <ContactForm />
          </div>
        ) : (
          <div className="mx-auto max-w-7xl space-y-4 px-2.5 md:px-4">
            <ContactChannels />
            <ContactForm />
            <ContactFAQ />
            <ContactSupport />
            <ContactMap />
          </div>
        )}
      </main>
    </div>
  )
}
