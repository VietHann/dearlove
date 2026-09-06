import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ScrollReveal, StaggerContainer } from '../components'
import { DarkButton } from '../components/ui/DarkButton'
import { GradientButton } from '../components/ui/GradientButton'
import { Heading } from '../components/ui/Heading'
import { BLOG_POSTS } from '../lib/constants'

/**
 * BlogSection — "Cẩm nang thiệp" article grid.
 *
 * Heading with eyebrow + decorative dividers, two CTAs, and a
 * 4-column responsive grid of article cards with hover-lift.
 */
export function BlogSection() {
  return (
    <section className="relative z-10 bg-[#fcfbf8] px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
      <ScrollReveal>
        <div className="mx-auto max-w-[1320px]">
          <Heading eyebrow="Cẩm nang thiệp">Mẹo hay & cảm hứng thiết kế.</Heading>
          <div className="mt-8 flex justify-center gap-3">
            <DarkButton href="/blog">Xem tất cả bài viết</DarkButton>
            <GradientButton href="/blog#newsletter">Đăng ký nhận tin</GradientButton>
          </div>
          <StaggerContainer staggerDelay={0.1} direction="up" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BLOG_POSTS.map(([cat, title, desc, image]) => (
              <article className="group card-lift overflow-hidden rounded-3xl border border-[#d9a441]/20 bg-white shadow-soft" key={title}>
                <div className="relative h-52 overflow-hidden">
                  <img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={image} alt=""/>
                  <span className="absolute inset-0 bg-gradient-to-t from-[#8d1216]/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="flex min-h-60 flex-col p-6">
                  <p className="text-lg font-semibold leading-6 text-[#8d1216] transition-colors group-hover:text-[#d9a441]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#7c3f06]/70">{desc}</p>
                  <Link to="/blog" className="mt-auto flex w-fit items-center gap-2 rounded-full border-2 border-[#d9a441]/30 px-4 py-2 text-xs font-semibold text-[#7c3f06] transition hover:border-[#d9a441] hover:bg-[#d9a441] hover:text-white">
                    {cat}
                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-1"/>
                  </Link>
                </div>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </ScrollReveal>
    </section>
  )
}