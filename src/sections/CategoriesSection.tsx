import { useState, type CSSProperties } from 'react'
import { ScrollReveal, StaggerContainer } from '../components'
import { CATEGORIES } from '../lib/constants'

/**
 * CategoriesSection — occasion picker.
 *
 * 8 colorful category tiles in a responsive grid (2 → 4 → 8 columns).
 * Active category state is local to this section.
 */
export function CategoriesSection() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <section className="relative z-10 overflow-hidden bg-white px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-20">
      <span aria-hidden className="pointer-events-none absolute -top-10 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(247,201,72,0.18),transparent_70%)] blur-2xl" />
      <ScrollReveal>
        <div className="relative mx-auto max-w-[1320px]">
          <div className="mb-6 flex flex-col items-center text-center sm:mb-14">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#d9a441]/60 sm:w-14" />
              <p className="eyebrow">Khám phá theo dịp</p>
              <span className="h-px w-10 bg-[#d9a441]/60 sm:w-14" />
            </div>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-[1.05] tracking-[-.045em] text-[#8d1216] sm:text-4xl lg:text-5xl">
              Chọn <span className="highlight-gradient font-display italic">danh mục</span> thiệp bạn yêu thích
            </h2>
          </div>
          <StaggerContainer staggerDelay={0.06} direction="scale" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(activeCategory === c.id ? 'all' : c.id)}
                aria-pressed={activeCategory === c.id}
                className={`cat-card group ${activeCategory === c.id ? 'cat-card--active' : ''}`}
                style={{
                  '--cat-from': c.from,
                  '--cat-to': c.to,
                  '--cat-shadow': c.shadow,
                } as CSSProperties}
              >
                <span aria-hidden className="cat-card__pattern" />
                <span aria-hidden className="cat-card__shine" />
                <span className="cat-card__icon">
                  <c.icon strokeWidth={1.6} />
                </span>
                <span className="cat-card__label">{c.name}</span>
              </button>
            ))}
          </StaggerContainer>
        </div>
      </ScrollReveal>
    </section>
  )
}