import { useEffect, useState } from 'react'
import { getPublicPricing, toPricingPlan } from '../../lib/marketing-api'
import { PricingHero } from './PricingHero'
import { PricingCards } from './PricingCards'
import { PricingTable } from './PricingTable'
import { PricingFAQ } from './PricingFAQ'
import { PricingReasons } from './PricingReasons'
import { FloatingSupport } from './FloatingSupport'

import './pricing.css'

/**
 * Pricing — the /pricing route.
 *
 * Uses the shared Dearlove <Header /> from the global Layout (see App.tsx)
 * so the nav is consistent across the marketing site.
 *
 * Layout (top → bottom):
 *   1. Shared Dearlove header (sticky, scroll-aware pill) — rendered by Layout
 *   2. Hero with breadcrumb + signature title + promo banner
 *   3. Three plan cards
 *   4. Detailed comparison table + retention note
 *   5. FAQ accordion
 *   6. "Vì sao nên dùng gói trả phí?" reasons + gradient CTA
 *   7. Footer — rendered by Layout
 *   8. Floating support bubble (fixed bottom-right)
 */
export default function Pricing() {
  const [plans, setPlans] = useState<import('./pricingData').PricingPlan[] | null>(null)

  useEffect(() => {
    getPublicPricing().then(response => {
      if (response.data.items.length > 0) setPlans(response.data.items.map(toPricingPlan))
    }).catch(() => setPlans(null))
  }, [])

  return (
    <div className="bg-background text-foreground">
      <main className="relative">
        <PricingHero />

        <div className="m-auto max-w-7xl px-2.5 md:px-4">
          <div className="space-y-8">
            <PricingCards plans={plans ?? undefined} />
            <PricingTable />
            <PricingFAQ />
            <PricingReasons />
          </div>
        </div>
      </main>

      <FloatingSupport />
    </div>
  )
}
