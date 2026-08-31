import { ArrowRight, Wand2, LayoutTemplate, Camera, CheckCircle2, Sparkles, Heart } from 'lucide-react'
import { ScrollReveal, StaggerContainer, AnimatedCounter } from '../components'
import { DarkButton } from '../components/ui/DarkButton'
import { GradientButton } from '../components/ui/GradientButton'
import { IMAGES } from '../lib/constants'

const FEATURES: Array<[typeof Wand2, string]> = [
  [Wand2,           'Trình chỉnh sửa kéo thả - không cần kỹ năng'],
  [LayoutTemplate,  'Hàng trăm mẫu thiệp chuyên nghiệp'],
  [Camera,          'Thư viện ảnh, nhạc nền phong phú'],
  [CheckCircle2,    'Gửi thiệp trong 60 giây qua nhiều kênh'],
]

/**
 * FeaturesSection — "Cách dễ nhất để gửi lời chúc ý nghĩa".
 *
 * Two-column split: copy + checklist on the left, illustrative
 * portrait + floating accent chips on the right.
 */
export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 bg-[#fcfbf8] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-2 lg:gap-24">
        <ScrollReveal direction="left">
          <p className="eyebrow">Vì sao chọn chúng tôi</p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#8d1216] sm:text-5xl lg:text-6xl">
            Cách dễ nhất để<br /> gửi lời chúc{' '}
            <span className="highlight-gradient font-display italic">ý nghĩa</span>.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#7c3f06]/70">
            Không cần phải là designer, không cần cài phần mềm phức tạp. Chỉ cần vài phút, bạn đã có một chiếc thiệp đẹp và đầy cảm xúc.
          </p>
          <StaggerContainer staggerDelay={0.08} className="my-9 grid gap-5">
            {FEATURES.map(([Icon, t]) => (
              <div className="group flex items-center gap-4 font-medium text-[#7c3f06] transition-transform hover:translate-x-1" key={t}>
                <span className="grid size-11 place-items-center rounded-full bg-white text-[#d9a441] shadow-sm transition-all group-hover:bg-[#d9a441] group-hover:text-white group-hover:shadow-md">
                  <Icon size={20}/>
                </span>
                {t}
              </div>
            ))}
          </StaggerContainer>
          <div className="flex flex-wrap gap-3">
            <DarkButton>Dùng thử miễn phí <ArrowRight size={16}/></DarkButton>
            <GradientButton>Xem video hướng dẫn</GradientButton>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right" distance={40}>
          <div className="relative">
            <img className="aspect-[4/5] w-full rounded-[2rem] border-2 border-[#d9a441]/20 object-cover shadow-soft" src={IMAGES.wedding} alt="Tạo thiệp dễ dàng"/>
            <div className="absolute bottom-5 left-5 rounded-2xl border border-[#d9a441]/20 bg-white/95 p-4 shadow-soft backdrop-blur">
              <span className="flex items-center gap-3 text-sm font-medium text-[#8d1216]">
                <span className="grid size-10 place-items-center rounded-full bg-[#f7c948] text-white">
                  <CheckCircle2 size={18}/>
                </span>
                Đã gửi <AnimatedCounter to={50000} suffix="+" /> thiệp
              </span>
            </div>
            <div className="absolute right-5 top-5 grid size-20 place-items-center rounded-full bg-[#d9a441] text-white shadow-lg spin-slow">
              <div className="text-center">
                <div className="text-xl font-bold">4.9</div>
                <div className="text-[10px] uppercase">★★★★★</div>
              </div>
            </div>
            <div className="absolute -left-6 top-12 hidden float-slow lg:block">
              <div className="grid size-16 place-items-center rounded-2xl bg-white shadow-xl">
                <Sparkles className="size-7 fill-[#d9a441] text-[#d9a441]" />
              </div>
            </div>
            <div className="absolute -right-4 bottom-16 hidden float lg:block" style={{ animationDelay: '1s' }}>
              <div className="grid size-14 place-items-center rounded-2xl bg-[#8d1216] shadow-xl">
                <Heart className="size-6 fill-[#f7c948] text-[#f7c948]" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
