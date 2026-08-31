/**
 * WhyChooseSection — "Vì sao chọn thiệp cưới online ZenLove"
 *
 * Bố cục zigzag editorial: 4 tính năng xếp thành các row full-width,
 * mỗi row đảo bên visual/text để tạo nhịp đọc như một bài feature
 * trên tạp chí. Trên mobile các row xếp dọc, visual ở trên, text ở dưới.
 *
 * Typography lấy theo các section khác trên site: heading/body dùng
 * sans-serif (Be Vietnam Pro) để nhất quán nhịp đọc. Chỉ giữ lại
 * font-display (Playfair Display) ở những từ "đặc biệt" như brand
 * "ZenLove" và số thứ tự 01-04 để tạo điểm nhấn editorial.
 *
 * Mỗi row gồm:
 *   - Phía visual: card gradient lớn với icon nổi bật, khung vàng
 *     bên trong, huy hiệu số thứ tự nổi ở góc và các chi tiết trang trí.
 *   - Phía text:   chip "Tính năng 0X", tiêu đề lớn, mô tả,
 *     và micro-stat có AnimatedCounter ở cuối.
 *
 * Nền section: gradient cream → blush dọc với đường cong vàng SVG
 * ở mép trên và 3 cánh hoa nền tạo chiều sâu.
 */

import { ScrollReveal, AnimatedCounter } from '../components'
import {
  MousePointerClick,
  UsersRound,
  Palette,
  Share2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  stat: { value: number; suffix: string; label: string }
}

const FEATURES: Feature[] = [
  {
    icon: MousePointerClick,
    title: 'Thiết kế kéo thả nhanh chóng',
    description:
      'Chỉ vài thao tác đơn giản, dễ dàng chỉnh sửa thông tin — tạo và gửi thiệp cưới ngay tức thì mà không cần chờ in ấn.',
    stat: { value: 5, suffix: ' phút', label: 'thời gian tạo' },
  },
  {
    icon: UsersRound,
    title: 'Quản lý danh sách khách mời',
    description:
      'Sau khi chia sẻ thiệp online, mọi lời xác nhận tham dự và lời chúc mừng đều được ghi nhận gọn gàng trong một danh sách duy nhất.',
    stat: { value: 10, suffix: 'K+', label: 'khách đã quản lý' },
  },
  {
    icon: Palette,
    title: 'Đa dạng mẫu thiệp online',
    description:
      'Mẫu thiệp được cập nhật liên tục với nhiều phong cách và lựa chọn màu sắc phong phú, phù hợp mọi chủ đề đám cưới.',
    stat: { value: 500, suffix: '+', label: 'mẫu thiết kế' },
  },
  {
    icon: Share2,
    title: 'Chia sẻ online dễ dàng',
    description:
      'Gửi thiệp mời đến từng khách không giới hạn thời gian và địa lý, chỉ với một đường link duy nhất.',
    stat: { value: 1, suffix: ' link', label: 'chia sẻ mọi nơi' },
  },
]

function FeatureVisual({ Icon, ordinal }: { Icon: LucideIcon; ordinal: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px]">
      {/* Floating ordinal circle — overlaps the top-left of the card.
          Keep font-display here because the number is a "special" word
          meant to stand out as an editorial mark. */}
      <div
        className="absolute -left-2 -top-2 z-10 grid size-14 place-items-center rounded-full border border-[#d9a441]/50 bg-white shadow-soft sm:-left-4 sm:-top-4 sm:size-20"
        aria-hidden
      >
        <span className="font-display text-lg italic text-[#d9a441] sm:text-2xl">
          {ordinal}
        </span>
      </div>

      {/* Main gradient card */}
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl border border-[#e8d9b8] bg-gradient-to-br from-[#fdf2e3] via-white to-[#f7c948]/30 shadow-soft transition-transform duration-500 hover:-rotate-2"
      >
        {/* Inner gold frame */}
        <div
          className="pointer-events-none absolute inset-3 rounded-xl border border-[#d9a441]/35 sm:inset-4"
          aria-hidden
        />

        {/* Soft radial glow behind the icon */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7c948]/40 blur-3xl"
          aria-hidden
        />

        {/* Centered icon — large editorial mark */}
        <div className="absolute inset-0 grid place-items-center text-[#8d1216] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <Icon size={96} strokeWidth={1.25} className="sm:!size-[120px] lg:!size-[140px]" />
        </div>

        {/* Decorative sparkles / dots */}
        <Sparkles
          className="absolute right-6 top-6 size-5 text-[#d9a441] opacity-80"
          aria-hidden
        />
        <div
          className="absolute left-6 bottom-6 size-2 rounded-full bg-[#d9a441]/60"
          aria-hidden
        />
        <div
          className="absolute right-10 bottom-10 size-1.5 rounded-full bg-[#8d1216]/40"
          aria-hidden
        />
        <div
          className="absolute left-10 top-10 size-1.5 rounded-full bg-[#d9a441]/70"
          aria-hidden
        />
      </div>
    </div>
  )
}

function FeatureText({
  ordinal,
  title,
  description,
  stat,
}: {
  ordinal: string
  title: string
  description: string
  stat: { value: number; suffix: string; label: string }
}) {
  return (
    <div className="text-center md:text-left">
      <p className="eyebrow">Tính năng {ordinal}</p>
      {/* Feature title — match scale of the "Cách dễ nhất" feature list */}
      <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-.02em] text-[#7c3f06] sm:text-2xl lg:text-3xl">
        {title}
      </h3>
      <p className="mt-2 max-w-xl text-base leading-6 text-[#7c3f06]/80 text-balance sm:text-lg">
        {description}
      </p>
      <div className="mt-3 inline-flex items-baseline gap-2.5 border-t border-[#e8d9b8]/60 pt-2.5">
        <span className="text-2xl font-semibold text-[#8d1216] sm:text-3xl">
          <AnimatedCounter to={stat.value} suffix={stat.suffix} duration={1.6} />
        </span>
        <span className="text-sm font-semibold tracking-wider text-[#7c3f06]/60 sm:text-base">
          {stat.label}
        </span>
      </div>
    </div>
  )
}

function FeatureRow({
  feature,
  index,
}: {
  feature: Feature
  index: number
}) {
  const { icon: Icon, title, description, stat } = feature
  const ordinal = String(index + 1).padStart(2, '0')
  // Even rows (2nd, 4th) put the visual on the right and text on the left.
  const reversed = index % 2 === 1

  return (
    <ScrollReveal
      direction={reversed ? 'right' : 'left'}
      distance={48}
      duration={0.8}
    >
      <div className="grid items-center gap-4 md:grid-cols-2 md:gap-6 lg:gap-10">
        <div className={reversed ? 'md:order-2' : 'md:order-1'}>
          <FeatureVisual Icon={Icon} ordinal={ordinal} />
        </div>
        <div className={reversed ? 'md:order-1' : 'md:order-2'}>
          <FeatureText
            ordinal={ordinal}
            title={title}
            description={description}
            stat={stat}
          />
        </div>
      </div>
    </ScrollReveal>
  )
}

function SectionPetal({
  left,
  top,
  size,
  color,
  delayed = false,
}: {
  left: string
  top: string
  size: number
  color: string
  delayed?: boolean
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${
        delayed ? 'petal-section--delayed' : 'petal-section'
      }`}
      style={{
        left,
        top,
        width: size,
        height: size,
        background: color,
        borderRadius: '60% 40% 60% 40%',
        filter: 'blur(.3px)',
        opacity: 0.55,
      }}
    />
  )
}

export default function WhyChooseSection() {
  return (
    <section
      id="why-choose"
      className="relative z-10 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, var(--color-viet-cream) 0%, var(--color-viet-blush) 100%)',
      }}
    >
      {/* Curved gold SVG divider along the top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-12 text-[#d9a441]"
        aria-hidden
      >
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="block h-full w-full"
        >
          <path
            d="M0,10 C320,54 720,54 1440,10 L1440,0 L0,0 Z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M0,18 C320,62 720,62 1440,18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.45"
          />
        </svg>
      </div>

      {/* Background floating petals for depth */}
      <SectionPetal left="5%" top="14%" size={14} color="#d9a441" />
      <SectionPetal
        left="92%"
        top="78%"
        size={12}
        color="#f7c948"
        delayed
      />
      <SectionPetal
        left="14%"
        top="52%"
        size={10}
        color="#8d1216"
        delayed
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        {/* Section heading */}
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[#d9a441]" />
              <p className="eyebrow">Vì sao chọn chúng tôi</p>
              <span className="h-px w-12 bg-[#d9a441]" />
            </div>

            {/* Section title — match the scale of other section headings (4xl/5xl/6xl) */}
            <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-.045em] text-[#8d1216] text-balance sm:text-4xl lg:text-5xl">
              Vì sao nên chọn{' '}
              <span className="highlight-gradient font-display italic">Dearlove</span>
              <br className="hidden sm:block" /> thiệp cưới online?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#7c3f06]/70 text-balance sm:text-lg">
              Bốn lý do khiến các cặp đôi yêu thích thiệp cưới online của
              ZenLove — từ cú chạm đầu tiên đến lời xác nhận tham dự.
            </p>
          </div>
        </ScrollReveal>

        {/* Alternating feature rows */}
        <div className="mt-7 space-y-7 sm:mt-8 sm:space-y-9 lg:mt-10 lg:space-y-11">
          {FEATURES.map((feature, i) => (
            <FeatureRow key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
