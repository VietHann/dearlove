import { ArrowRight, ChevronDown } from 'lucide-react'
import { ScrollReveal } from '../components'
import { DarkButton } from '../components/ui/DarkButton'

/**
 * Full-bleed video hero for the Dearlove landing page.
 *
 * The video is decorative: it stays muted and loops behind the centered
 * message. Reduced-motion users receive a still image instead, and a video
 * loading error falls back to the same image without hiding the hero copy.
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[calc(100svh-88px)] items-center justify-center overflow-hidden bg-[#5d2417] px-5 py-24 sm:px-8 lg:px-12"
    >
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        src="/videos/backset.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onCanPlay={event => {
          void event.currentTarget.play()
        }}
      />

      {/* Warm cream tint plus dark edges keep the centered copy readable. */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(48,20,14,.42),rgba(76,37,24,.18)_42%,rgba(35,15,12,.72))]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[#fdf2e3]/10 mix-blend-soft-light"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl text-center text-white">
        <ScrollReveal direction="up" delay={0.1} distance={24}>
          <p className="mx-auto inline-flex items-center rounded-full border border-white/30 bg-[#fdf2e3]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[.2em] text-white/90 backdrop-blur-sm sm:text-sm">
            Thiệp online cho mọi khoảnh khắc
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2} distance={28}>
          <h1 className="mx-auto mt-7 max-w-4xl text-balance font-display text-[clamp(2.5rem,8vw,7.25rem)] font-bold leading-[.98] tracking-[-.055em] text-white">
            <span className="block">Tạo thiệp đẹp cho</span>
            <span className="block text-[#f7c948]">mọi dịp ý nghĩa</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3} distance={24}>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            Gửi lời chúc, lưu giữ kỷ niệm và tạo dấu ấn riêng bằng một tấm thiệp được thiết kế dành cho câu chuyện của bạn.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.4} distance={20}>
          <div className="mt-9 flex justify-center">
            <DarkButton href="#templatesSection">
              Khám phá mẫu thiệp <ArrowRight size={16} aria-hidden="true" />
            </DarkButton>
          </div>
        </ScrollReveal>
      </div>

      <a
        href="#problems"
        aria-label="Cuộn xuống phần tiếp theo"
        className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-1 text-white/80 transition-colors hover:text-white"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[.24em]">Cuộn xuống</span>
        <ChevronDown size={20} aria-hidden="true" className="motion-safe:animate-bounce" />
      </a>
    </section>
  )
}
