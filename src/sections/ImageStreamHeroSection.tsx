import { useState, useEffect } from 'react'
import { ImageStreamHero } from '../components/ui/image-stream-hero'
import { ScrollReveal } from '../components'
import { Star, ChevronLeft, ChevronRight, Heart, Camera, CheckCircle2 } from 'lucide-react'

/**
 * Customer feedback photos — curated Unsplash portraits + wedding details.
 * These simulate real photos customers send after their events.
 * Each card overlays the customer's name and event type.
 */
const FEEDBACK_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop&q=80',
    alt: 'Thiệp cưới hoàn chỉnh trên bàn tiệc',
    customer: 'Minh & Quốc',
    event: 'Đám cưới · Đà Lạt',
    icon: Heart,
    tint: 'from-[#8d1216]/70',
  },
  {
    src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=900&auto=format&fit=crop&q=80',
    alt: 'Khách mời chụp ảnh cùng thiệp mời',
    customer: 'Lan & Đức',
    event: 'Khai trương · Hà Nội',
    icon: CheckCircle2,
    tint: 'from-[#0f766e]/70',
  },
  {
    src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&auto=format&fit=crop&q=80',
    alt: 'Bữa tiệc sinh nhật trang trí theo thiệp',
    customer: 'Gia Bảo',
    event: 'Sinh nhật 30 tuổi',
    icon: Camera,
    tint: 'from-[#7c3f06]/70',
  },
  {
    src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&auto=format&fit=crop&q=80',
    alt: 'Thiệp cưới đặt cạnh bánh cưới',
    customer: 'Hương & Minh',
    event: 'Đám cưới · Đà Nẵng',
    icon: Heart,
    tint: 'from-[#8d1216]/70',
  },
  {
    src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&auto=format&fit=crop&q=80',
    alt: 'Thiệp sinh nhật treo trang trí bàn tiệc',
    customer: 'Thanh Tùng',
    event: 'Sinh nhật công ty',
    icon: CheckCircle2,
    tint: 'from-[#0f766e]/70',
  },
  {
    src: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=900&auto=format&fit=crop&q=80',
    alt: 'Khung thiệp cưới trên kệ trưng bày',
    customer: 'Trang & Hoàng',
    event: 'Đám hỏi · Hải Phòng',
    icon: Heart,
    tint: 'from-[#8d1216]/70',
  },
]

/**
 * 3D corridor backdrop — uses the same pool of wedding imagery
 * as the feedback carousel, so the corridor visually "mirrors"
 * the foreground cards as they rotate.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&auto=format&fit=crop&q=80`
const CORRIDOR_IMAGES = [
  { src: UNSPLASH('1519741497674-611481863552'), alt: '' },
  { src: UNSPLASH('1465495976277-4387d4b0b4c6'), alt: '' },
  { src: UNSPLASH('1511285560929-80b4fe73ea56'), alt: '' },
  { src: UNSPLASH('1583939003579-730e3918a45a'), alt: '' },
  { src: UNSPLASH('1606216794074-735e91aa2c92'), alt: '' },
  { src: UNSPLASH('1591604466107-ec97de577aff'), alt: '' },
  { src: UNSPLASH('1469371670807-013ccf25f16a'), alt: '' },
  { src: UNSPLASH('1525772764200-be829a350797'), alt: '' },
  { src: UNSPLASH('1502635385003-ee1e6a1a742d'), alt: '' },
  { src: UNSPLASH('1519225421980-715cb0215aed'), alt: '' },
  { src: UNSPLASH('1530023367847-a683933f4172'), alt: '' },
  { src: UNSPLASH('1525258946800-693c5d2d9a4f'), alt: '' },
]

export default function ImageStreamHeroSection() {
  const [active, setActive] = useState(0)
  const total = FEEDBACK_PHOTOS.length

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % total)
    }, 5000)
    return () => window.clearInterval(id)
  }, [total])

  const go = (delta: number) => setActive((i) => (i + delta + total) % total)
  const current = FEEDBACK_PHOTOS[active]

  return (
    <section
      id="feedback"
      className="relative z-10 overflow-hidden bg-[#fcfbf8] px-5 py-12 sm:px-8 lg:px-12 lg:py-16"
    >
      {/* Ambient glows */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(247,201,72,0.18),transparent_70%)] blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/4 size-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(141,18,22,0.10),transparent_70%)] blur-2xl"
      />

      <div className="relative mx-auto max-w-[1320px]">
        {/* ── Heading pushed to top ─────────────────────────────── */}
        <ScrollReveal>
          <div className="mb-10 text-center lg:mb-14">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-[#d9a441]/60 sm:w-14" />
              <p className="eyebrow">Từ khách hàng thật</p>
              <span className="h-px w-10 bg-[#d9a441]/60 sm:w-14" />
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-.045em] text-[#8d1216] sm:text-4xl lg:text-5xl">
              Những khoảnh khắc{' '}
              <span className="highlight-gradient font-display italic">đáng nhớ</span>{' '}
              được chia sẻ.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#7c3f06]/70 sm:text-lg">
              Hàng nghìn khách hàng đã gửi ảnh thực tế sau khi sử dụng
              thiệp Dearlove cho ngày đặc biệt của họ.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Photo carousel with corridor behind ───────────────── */}
        <ScrollReveal delay={0.1} distance={40}>
          <div className="relative overflow-hidden rounded-3xl border border-[#d9a441]/25 bg-[#fdf2e3] shadow-soft">
            {/* 3D corridor behind the carousel */}
            <div className="absolute inset-0 opacity-80">
              <ImageStreamHero
                images={CORRIDOR_IMAGES}
                cards={9}
                speed={26}
                axis={55}
                className="h-full w-full"
              />
            </div>

            {/* Top / bottom edge fade for readability */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#fdf2e3] via-[#fdf2e3]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#fdf2e3] via-[#fdf2e3]/60 to-transparent" />

            {/* Foreground photo stage */}
            <div className="relative z-20 flex min-h-[540px] flex-col items-center justify-center px-6 py-10 sm:px-12 lg:px-20">
              {/* Main photo card */}
              <div
                key={active}
                className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-xl sm:max-w-md lg:max-w-lg"
                style={{ animation: 'photoReveal 500ms ease both' }}
              >
                <img
                  src={current.src}
                  alt={current.alt}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient + info */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${current.tint} to-transparent`}
                />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/25 p-1 backdrop-blur">
                      <current.icon size={14} />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      {current.event}
                    </p>
                  </div>
                  <p className="mt-1 text-xl font-semibold leading-tight">
                    {current.customer}
                  </p>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="mt-8 flex items-center gap-5">
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  onClick={() => go(-1)}
                  className="grid size-11 place-items-center rounded-full border border-[#d9a441]/40 bg-[#fcfbf8]/90 text-[#8d1216] shadow-sm backdrop-blur transition hover:border-[#d9a441] hover:bg-white"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                  {FEEDBACK_PHOTOS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Xem ảnh ${i + 1}`}
                      onClick={() => setActive(i)}
                      className={`rounded-full transition-all ${
                        i === active
                          ? 'size-2.5 bg-[#8d1216]'
                          : 'size-2 bg-[#8d1216]/30 hover:bg-[#8d1216]/60'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Ảnh tiếp"
                  onClick={() => go(1)}
                  className="grid size-11 place-items-center rounded-full border border-[#d9a441]/40 bg-[#fcfbf8]/90 text-[#8d1216] shadow-sm backdrop-blur transition hover:border-[#d9a441] hover:bg-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Counter */}
              <p className="mt-3 text-xs font-medium text-[#7c3f06]/60">
                {active + 1} / {total}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Aggregate stats strip ─────────────────────────────── */}
        <ScrollReveal delay={0.2}>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {[
              { value: '4.9★', label: 'Đánh giá trung bình', icon: Star },
              { value: '50K+', label: 'Khách hàng tin dùng', icon: Heart },
              { value: '60s', label: 'Gửi thiệp nhanh', icon: Camera },
              { value: '99%', label: 'Hài lòng khi nhận', icon: CheckCircle2 },
            ].map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-[#d9a441]/20 bg-white px-4 py-4 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-[#d9a441]/50"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Icon size={16} className="text-[#d9a441]" />
                  <div className="text-xl font-semibold text-[#8d1216] sm:text-2xl">
                    {value}
                  </div>
                </div>
                <div className="mt-1 text-xs font-medium text-[#7c3a06]/70">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes photoReveal {
          0%   { opacity: 0; transform: scale(0.96) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </section>
  )
}
