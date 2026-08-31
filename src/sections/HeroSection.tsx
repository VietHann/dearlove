import { Heart, Sparkles, Wand2, LayoutTemplate, Bell } from 'lucide-react'
import { ScrollReveal } from '../components'
import { IMAGES } from '../lib/constants'

function Marquee({ images, reverse = false }: { images: string[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden">
      <div className={`grid gap-4 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {[...images, ...images].map((s, i) => (
          <img className="aspect-[3/4] w-full rounded-3xl border border-[#d9a441]/20 object-cover" src={s} alt="Card" key={`${s}${i}`}/>
        ))}
      </div>
    </div>
  )
}

/**
 * HeroSection — opening pitch + dual-column image gallery.
 *
 * Left column: eyebrow badge, big highlight-gradient headline,
 * body copy, and a 3-item feature checklist.
 * Right column: dual-column autoplay marquee of wedding photos
 * with a centered pulsing heart seal.
 */
export function HeroSection() {
  const checklist = [
    { icon: Wand2, text: 'Hơn 500 mẫu thiệp đẹp mắt cho mọi dịp' },
    { icon: LayoutTemplate, text: 'Tùy chỉnh dễ dàng — Không cần kỹ năng thiết kế' },
    { icon: Bell, text: 'Gửi thiệp qua link, email, Zalo trong 60 giây' },
  ]

  return (
    <section className="relative z-10 mx-auto grid min-h-[780px] max-w-[1440px] lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col justify-center px-5 pt-8 pb-20 sm:px-8 lg:px-14">
        <ScrollReveal direction="left" delay={0.05} className="mb-2 flex w-fit items-center gap-2 rounded-full border border-[#d9a441]/30 bg-white py-2 pl-2 pr-4 text-xs font-semibold text-[#7c3f06] shadow-soft sm:text-sm">
          <span className="relative grid size-7 place-items-center rounded-full bg-[#d9a441] text-white">
            <Sparkles size={14} fill="currentColor" />
            <span className="absolute inset-0 rounded-full bg-[#d9a441] pulse-soft" />
          </span>
          <span>Hơn 500+ mẫu thiệp đẹp mắt</span>
          <span className="text-[#d9a441]/60">•</span>
          <span className="text-[#7c3f06]/70">4.9 ★ từ 12.000+ khách hàng</span>
        </ScrollReveal>
        <ScrollReveal direction="left" delay={0.25} distance={28}>
          <h1 className="relative max-w-xl py-2 pb-3 text-[2.8rem] font-semibold leading-[1.5] tracking-[-.055em] text-balance text-[#8d1216] sm:text-6xl sm:leading-[1.45] lg:text-[3.85rem] lg:leading-[1.45]">
            <span className="font-display italic">Tạo thiệp</span>{' '}
            <span className="font-display italic">đẹp</span>{' '}
            <span className="font-display italic">cho</span>{' '}
            <span className="highlight-gradient font-display italic">mọi dịp</span>{' '}
            <span className="highlight-gradient font-display italic">ý nghĩa</span>
            <span className="sparkle absolute right-2 top-2 text-[#f7c948] sm:right-4 sm:top-3"><Sparkles size={22} fill="currentColor" /></span>
          </h1>
        </ScrollReveal>
        <ScrollReveal direction="left" delay={0.35} distance={28}>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#7c3f06]/80 text-balance">
            <span className="font-display italic text-[#8d1216]">Thiệp cưới</span>,{' '}
            <span className="font-display italic text-[#8d1216]">sinh nhật</span>,{' '}
            <span className="font-display italic text-[#8d1216]">chúc mừng</span>,{' '}
            <span className="font-display italic text-[#8d1216]">lễ Tết</span>
            {' '}— tùy chỉnh dễ dàng, gửi nhanh chóng, lưu giữ kỷ niệm trọn đời.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="left" delay={0.45} distance={28}>
          <div className="my-10 grid gap-5">
            {checklist.map(({ icon: Icon, text }, i) => (
              <div className="flex items-center gap-4 text-[15px] font-medium text-[#7c3f06]" key={text} style={{ transitionDelay: `${.4 + i * .1}s` }}>
                <span className="grid size-10 place-items-center rounded-full bg-[#fdf2e3] text-[#d9a441] transition-transform hover:scale-110 hover:bg-[#d9a441] hover:text-white">
                  <Icon size={19}/>
                </span>
                {text}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
      <div className="relative hidden h-[780px] gap-4 overflow-hidden bg-[#fdf2e3] p-4 lg:grid lg:grid-cols-2">
        <div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[#fdf2e3] to-transparent"/>
        <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#fdf2e3] to-transparent"/>
        <Marquee images={[IMAGES.hero1, IMAGES.hero2, IMAGES.hero3, IMAGES.hero4]}/>
        <Marquee images={[IMAGES.hero6, IMAGES.hero5, IMAGES.hero4, IMAGES.hero3]} reverse/>
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="relative grid size-28 place-items-center rounded-full bg-[#fcfbf8] shadow-2xl glow-gold">
            <Heart className="size-12 fill-[#d9a441] text-[#d9a441] pulse-soft" />
          </div>
        </div>
      </div>
    </section>
  )
}