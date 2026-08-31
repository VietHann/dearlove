import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Accordion from '@radix-ui/react-accordion'
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Facebook, Instagram, Linkedin, Menu, Send, Sparkles, UserRound, X, Youtube,
  Gift, Camera, Music, Heart, PartyPopper, Cake, GraduationCap, Baby, Briefcase,
  MessageCircleHeart, Mail, Bell, Wand2, LayoutTemplate, Clock, MessageCircle, Users,
} from 'lucide-react'
import TemplatesSection from './sections/TemplatesSection'
import WhyChooseSection from './sections/WhyChooseSection'
import ImageStreamHeroSection from './sections/ImageStreamHeroSection'
import { ParallaxPetals, ScrollReveal, StaggerContainer, AnimatedCounter } from './components'

const IMAGES = {
  wedding: '/images/lifestyle.png',
  birthday: '/images/editorial.png',
  congrats: '/images/clinical-product.png',
  festival: '/images/supplements.png',
  gift1: '/images/lifestyle.png',
  gift2: '/images/editorial.png',
  gift3: '/images/clinical-product.png',
  gift4: '/images/supplements.png',
  logo: '/logo.png',
  // Hero wedding gallery
  hero1: '/images/wedding-1.jpg',
  hero2: '/images/wedding-2.jpg',
  hero3: '/images/wedding-3.jpg',
  hero4: '/images/wedding-4.jpg',
  hero5: '/images/wedding-5.jpg',
  hero6: '/images/wedding-6.jpg',
}

const CATEGORIES: Array<{
  id: string
  name: string
  icon: typeof Heart
  from: string
  to: string
  shadow: string
}> = [
  { id: 'wedding',   name: 'Thiệp Cưới',   icon: Heart,             from: '#be123c', to: '#e0a422', shadow: 'rgba(190, 18, 60, 0.45)'  },
  { id: 'birthday',  name: 'Sinh Nhật',    icon: Cake,              from: '#f59e0b', to: '#ea580c', shadow: 'rgba(234, 88, 12, 0.45)'  },
  { id: 'congrats',  name: 'Chúc Mừng',    icon: PartyPopper,       from: '#a855f7', to: '#db2777', shadow: 'rgba(219, 39, 119, 0.45)' },
  { id: 'festival',  name: 'Lễ Tết',       icon: Sparkles,          from: '#dc2626', to: '#f59e0b', shadow: 'rgba(220, 38, 38, 0.45)'  },
  { id: 'graduate',  name: 'Tốt Nghiệp',   icon: GraduationCap,     from: '#4f46e5', to: '#7c3aed', shadow: 'rgba(124, 58, 237, 0.45)' },
  { id: 'baby',      name: 'Thai Sản',     icon: Baby,              from: '#f472b6', to: '#ec4899', shadow: 'rgba(236, 72, 153, 0.45)' },
  { id: 'career',    name: 'Thăng Tiến',   icon: Briefcase,         from: '#10b981', to: '#047857', shadow: 'rgba(4, 120, 87, 0.45)'   },
  { id: 'love',      name: 'Tình Yêu',     icon: MessageCircleHeart,from: '#ec4899', to: '#be185d', shadow: 'rgba(190, 24, 93, 0.45)'  },
]

const FEATURED = [
  { eyebrow: 'Mới ra mắt', title: 'Bộ sưu tập Tết 2026.', price: '199k', image: IMAGES.festival },
  { eyebrow: 'Được yêu thích', title: 'Thiệp cưới hoàng gia.', price: '299k', image: IMAGES.wedding },
  { eyebrow: 'Độc quyền', title: 'Sinh nhật cá nhân hóa.', price: '149k', image: IMAGES.birthday },
]

const faqs = [
  ['Tôi có thể tạo thiệp miễn phí không?', 'Có! Chúng tôi cung cấp hơn 100 mẫu thiệp miễn phí cho tất cả các dịp. Bạn chỉ cần đăng ký tài khoản và bắt đầu thiết kế ngay.'],
  ['Có thể tùy chỉnh nội dung thiệp không?', 'Hoàn toàn có thể. Bạn có thể thay đổi văn bản, hình ảnh, màu sắc, font chữ và thêm nhạc nền cho mỗi thiệp của mình.'],
  ['Làm sao để gửi thiệp cho bạn bè?', 'Sau khi hoàn tất thiết kế, bạn có thể gửi qua đường link, email, Zalo hoặc QR code. Thiệp sẽ được gửi đến người nhận trong vài giây.'],
  ['Có thể in thiệp ra giấy không?', 'Có. Chúng tôi hỗ trợ in thiệp chất lượng cao với nhiều kích thước và chất liệu giấy khác nhau, giao hàng tận nơi trong 2-3 ngày.'],
  ['Thiệp của tôi có được bảo mật không?', 'Mọi thiệp đều có mật khẩu riêng nếu bạn muốn. Chỉ những người bạn chia sẻ mới có thể xem được thiệp của bạn.'],
  ['Có chính sách hoàn tiền không?', 'Có. Nếu không hài lòng với mẫu thiệp, bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày.'],
]

const BLOG_POSTS: Array<[string, string, string, string]> = [
  ['Mẹo thiết kế', '10 mẹo tạo thiệp cưới đẹp và ấn tượng', 'Chọn tone màu, font chữ, bố cục và những chi tiết nhỏ giúp thiệp cưới của bạn thật sự nổi bật và giàu cảm xúc.', IMAGES.wedding],
  ['Xu hướng 2026', 'Những xu hướng thiệp mời hot nhất năm 2026', 'Cập nhật phong cách thiết kế, hiệu ứng động và chất liệu được yêu thích nhất trong năm nay.', IMAGES.birthday],
  ['Hướng dẫn', 'Cách tạo thiệp sinh nhật độc đáo trong 5 phút', 'Bốn bước đơn giản từ chọn mẫu, cá nhân hoá nội dung đến gửi thiệp đến bạn bè, người thân.', IMAGES.congrats],
  ['Cảm hứng', 'Ý tưởng thiệp Tết handmade đầy ý nghĩa', 'Gợi ý những ý tưởng làm thiệp Tết thủ công tinh tế, gửi gắm lời chúc ấm áp đến người thân yêu.', IMAGES.festival],
]

function GradientButton({ children, className = '', href = '#templates' }: { children: React.ReactNode; className?: string; href?: string }) {
  return (
    <a href={href} className={`gradient-frame group inline-flex rounded-full p-[2px] ${className}`}>
      <span className="flex h-full w-full items-center justify-center gap-2 rounded-full bg-[#fcfbf8] px-6 py-3 text-sm font-semibold text-[#8d1216] transition-colors group-hover:bg-white">
        {children}
      </span>
    </a>
  )
}
function DarkButton({ children, className = '', href = '#templates' }: { children: React.ReactNode; className?: string; href?: string }) {
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#8d1216] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#7c3f06] ${className}`}>
      {children}
    </a>
  )
}
function Heading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-[#d9a441]" />
        <p className="eyebrow">{eyebrow}</p>
        <span className="h-px w-12 bg-[#d9a441]" />
      </div>
      <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#8d1216] sm:text-5xl lg:text-6xl">{children}</h2>
    </div>
  )
}

function App() {
  const [menu, setMenu] = useState(false)
  const [slide, setSlide] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const [scrolled, setScrolled] = useState(false)
  const next = (n: number) => setSlide((s) => (s + n + FEATURED.length) % FEATURED.length)

  useEffect(() => {
    // Signal JS is ready so legacy CSS classes can hide elements
    document.documentElement.classList.add('js-ready')
    return () => document.documentElement.classList.remove('js-ready')
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      {/* HEADER */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-transparent'
            : 'border-b border-[#d9a441]/20 bg-[#fcfbf8]/90 backdrop-blur-xl'
        }`}
      >
        <motion.nav
          layout
          animate={{
            maxWidth: scrolled ? 1180 : 1440,
            height: scrolled ? 64 : 88,
            marginTop: scrolled ? 12 : 0,
            marginBottom: scrolled ? 12 : 0,
            borderRadius: scrolled ? 9999 : 0,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className={`pointer-events-auto mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 ${
            scrolled
              ? 'border border-[#d9a441]/25 bg-[#fcfbf8]/95 shadow-lg shadow-[#8d1216]/5 backdrop-blur-xl'
              : ''
          }`}
        >
          <a className="group flex items-center" href="#">
            <motion.img
              src={IMAGES.logo}
              alt="Dearlove - Digital Invites"
              animate={{ height: scrolled ? 44 : 64 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{ width: 'auto' }}
              className="object-contain"
            />
          </a>
          <div className="hidden items-center gap-7 lg:flex">
            {['Mẫu Thiệp','Danh Mục','Giá Cả','Câu Chuyện','Blog','Hỗ Trợ'].map(x => (
              <a className="text-sm font-medium text-[#7c3f06] transition-colors hover:text-[#d9a441] underline-grow" href="#templates" key={x}>{x}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <DarkButton className="hidden sm:inline-flex">Tạo thiệp <ArrowRight size={16}/></DarkButton>
            <GradientButton className="hidden sm:inline-flex"><UserRound size={16}/> Đăng nhập</GradientButton>
            <button aria-label="Toggle menu" className="grid size-11 place-items-center rounded-full border border-[#d9a441]/30 text-[#8d1216] lg:hidden" onClick={() => setMenu(!menu)}>
              {menu ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </motion.nav>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border-t border-[#d9a441]/20 bg-[#fcfbf8] px-5 py-5 lg:hidden"
            >
              <div className="grid gap-1">
                {['Mẫu Thiệp','Danh Mục','Giá Cả','Câu Chuyện','Blog','Hỗ Trợ'].map(x => (
                  <a className="rounded-xl px-3 py-3 font-medium text-[#7c3f06] transition-colors hover:bg-[#fdf2e3]" href="#templates" key={x}>{x}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative">
        {/* Parallax floating petals — driven by Framer Motion + Lenis */}
        <ParallaxPetals />

        {/* HERO */}
        <section className="relative z-10 mx-auto grid min-h-[780px] max-w-[1440px] lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col justify-center px-5 pt-8 pb-20 sm:px-8 lg:px-14">
            <ScrollReveal direction="left" delay={0.05} className="mb-8 flex w-fit items-center gap-2 rounded-full border border-[#d9a441]/30 bg-white py-2 pl-2 pr-4 text-xs font-semibold text-[#7c3f06] shadow-soft sm:text-sm">
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
                {[
                  {icon: Wand2, text: 'Hơn 500 mẫu thiệp đẹp mắt cho mọi dịp'},
                  {icon: LayoutTemplate, text: 'Tùy chỉnh dễ dàng — Không cần kỹ năng thiết kế'},
                  {icon: Bell, text: 'Gửi thiệp qua link, email, Zalo trong 60 giây'}
                ].map(({icon: Icon, text}, i) => (
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

        {/* PROBLEMS - Bạn đang có kế hoạch mời tiệc 100+ khách */}
        <ProblemsSection/>

        {/* DANH MỤC */}
        <section className="relative z-10 overflow-hidden bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <span aria-hidden className="pointer-events-none absolute -top-10 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(247,201,72,0.18),transparent_70%)] blur-2xl" />
          <ScrollReveal>
            <div className="relative mx-auto max-w-[1320px]">
              <div className="mb-10 flex flex-col items-center text-center sm:mb-14">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-10 bg-[#d9a441]/60 sm:w-14" />
                  <p className="eyebrow">Khám phá theo dịp</p>
                  <span className="h-px w-10 bg-[#d9a441]/60 sm:w-14" />
                </div>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-.045em] text-[#8d1216] sm:text-4xl lg:text-5xl">
                  Chọn <span className="highlight-gradient font-display italic">danh mục</span> thiệp bạn yêu thích
                </h2>
              </div>
              <StaggerContainer staggerDelay={0.06} direction="scale" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-8">
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
                    } as React.CSSProperties}
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

        {/* IMAGE STREAM HERO — 3D corridor of wedding photography */}
        <ImageStreamHeroSection />

        {/* TÍNH NĂNG NỔI BẬT */}
        <section className="relative z-10 bg-[#fcfbf8] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <ScrollReveal direction="left">
              <p className="eyebrow">Vì sao chọn chúng tôi</p>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#8d1216] sm:text-5xl lg:text-6xl">Cách dễ nhất để<br/> gửi lời chúc{' '}
                <span className="highlight-gradient font-display italic">ý nghĩa</span>.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#7c3f06]/70">Không cần phải là designer, không cần cài phần mềm phức tạp. Chỉ cần vài phút, bạn đã có một chiếc thiệp đẹp và đầy cảm xúc.</p>
              <StaggerContainer staggerDelay={0.08} className="my-9 grid gap-5">
                {[
                  [Wand2,'Trình chỉnh sửa kéo thả - không cần kỹ năng'],
                  [LayoutTemplate,'Hàng trăm mẫu thiệp chuyên nghiệp'],
                  [Camera,'Thư viện ảnh, nhạc nền phong phú'],
                  [CheckCircle2,'Gửi thiệp trong 60 giây qua nhiều kênh']
                ].map(([Icon,t]) => (
                  <div className="group flex items-center gap-4 font-medium text-[#7c3f06] transition-transform hover:translate-x-1" key={t as string}>
                    <span className="grid size-11 place-items-center rounded-full bg-white text-[#d9a441] shadow-sm transition-all group-hover:bg-[#d9a441] group-hover:text-white group-hover:shadow-md">
                      <Icon size={20}/>
                    </span>
                    {t as string}
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
                    <Check size={18}/>
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

        {/* TEMPLATES SECTION - Kho giao diện */}
        <TemplatesSection />

        {/* WHY CHOOSE ZENLOVE - đặt ngay sau Templates */}
        <WhyChooseSection />

        {/* BLOG - chuyển lên trước FAQ vì nổi bật hơn */}
        <section className="relative z-10 bg-[#fcfbf8] px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
          <ScrollReveal>
          <div className="mx-auto max-w-[1320px]">
            <Heading eyebrow="Cẩm nang thiệp">Mẹo hay & cảm hứng thiết kế.</Heading>
            <div className="mt-8 flex justify-center gap-3">
              <DarkButton>Xem tất cả bài viết</DarkButton>
              <GradientButton>Đăng ký nhận tin</GradientButton>
            </div>
            <StaggerContainer staggerDelay={0.1} direction="up" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BLOG_POSTS.map(([cat, title, desc, image]) => (
                <article className="group card-lift overflow-hidden rounded-3xl border border-[#d9a441]/20 bg-white shadow-soft" key={title as string}>
                  <div className="relative h-52 overflow-hidden">
                    <img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={image as string} alt=""/>
                    <span className="absolute inset-0 bg-gradient-to-t from-[#8d1216]/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="flex min-h-60 flex-col p-6">
                    <p className="text-lg font-semibold leading-6 text-[#8d1216] transition-colors group-hover:text-[#d9a441]">{title as string}</p>
                    <p className="mt-2 text-sm leading-6 text-[#7c3f06]/70">{desc as string}</p>
                    <a href="#" className="mt-auto flex w-fit items-center gap-2 rounded-full border-2 border-[#d9a441]/30 px-4 py-2 text-xs font-semibold text-[#7c3f06] transition hover:border-[#d9a441] hover:bg-[#d9a441] hover:text-white">
                      {cat as string}
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-1"/>
                    </a>
                  </div>
                </article>
              ))}
            </StaggerContainer>
          </div>
          </ScrollReveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative z-10 bg-[#fcfbf8] px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
          <ScrollReveal>
          <div className="mx-auto max-w-4xl">
            <Heading eyebrow="Câu hỏi thường gặp">Mọi thắc mắc sẽ được giải đáp.</Heading>
            <StaggerContainer staggerDelay={0.06} direction="scale" className="mt-14 space-y-4">
              <Accordion.Root type="single" collapsible className="contents">
              {faqs.map(([q,a],i) => (
                <Accordion.Item
                  key={q}
                  value={`i${i}`}
                  className="group overflow-hidden rounded-3xl border border-[#d9a441]/20 bg-white px-6 shadow-soft transition-all hover:border-[#d9a441]/50 hover:shadow-xl sm:px-12"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="accordion-trigger flex w-full items-center py-7 text-left text-xl font-semibold text-[#8d1216] transition-colors group-hover:text-[#d9a441] sm:text-2xl">
                      {q}
                      <ChevronDown className="ml-auto text-[#d9a441]"/>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="accordion-content overflow-hidden">
                    <p className="pb-8 text-base leading-7 text-[#7c3f06]/80 sm:text-lg">{a}</p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
              </Accordion.Root>
            </StaggerContainer>
          </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer/>
    </div>
  )
}

function Marquee({images,reverse=false}:{images:string[];reverse?:boolean}) {
  return (
    <div className="overflow-hidden">
      <div className={`grid gap-4 ${reverse?'animate-marquee-reverse':'animate-marquee'}`}>
        {[...images,...images].map((s,i)=>(
          <img className="aspect-[3/4] w-full rounded-3xl border border-[#d9a441]/20 object-cover" src={s} alt="Card" key={`${s}${i}`}/>
        ))}
      </div>
    </div>
  )
}

function Promo({item}:{item:{eyebrow:string;title:string;price:string;image:string}}) {
  return (
    <article className="group relative h-[34rem] overflow-hidden rounded-[2rem] shadow-soft sm:h-[42rem] lg:h-[48rem]">
      <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1" src={item.image} alt={item.title}/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#7c3f06]/85 via-[#8d1216]/30 to-transparent"/>
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 shimmer" />
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-7 text-white transition-transform duration-500 group-hover:translate-y-0 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#d9a441]/90 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] text-white backdrop-blur">
          <Sparkles size={12} fill="currentColor"/>
          {item.eyebrow}
        </div>
        <p className="mt-3 text-sm text-white/85">Chỉ từ</p>
        <p className="text-3xl font-semibold">{item.price}<span className="text-sm font-normal">/thiệp</span></p>
        <h3 className="my-5 text-3xl font-semibold leading-tight sm:text-4xl">{item.title}</h3>
        <GradientButton>
          <span className="text-[#8d1216]">Khám phá ngay</span>
          <ArrowRight className="text-[#8d1216] transition-transform group-hover:translate-x-1" size={16}/>
        </GradientButton>
      </div>
    </article>
  )
}

function Footer() {
  return (
    <footer className="bg-[#8d1216] px-5 py-12 text-white sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="flex items-center">
              <img src={IMAGES.logo} alt="Dearlove - Digital Invites" style={{height: '88px', width: 'auto'}} className="object-contain" />
            </p>
            <h3 className="mt-6 max-w-md text-2xl font-medium leading-tight">Nhận mẫu thiệp mới mỗi tuần.</h3>
            <form className="mt-5 flex max-w-md rounded-full bg-white p-1.5 shadow-md">
              <input className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#7c3f06] outline-none placeholder:text-[#7c3f06]/40" placeholder="Email của bạn..."/>
              <button className="grid size-11 place-items-center rounded-full bg-[#d9a441] text-white transition hover:bg-[#e0a422]">
                <Send size={17}/>
              </button>
            </form>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              ['Sản phẩm','Thiệp cưới','Thiệp sinh nhật','Thiệp chúc mừng','Thiệp lễ Tết'],
              ['Công ty','Giới thiệu','Tuyển dụng','Báo chí','Đối tác'],
              ['Hỗ trợ','Trung tâm hỗ trợ','Điều khoản','Bảo mật','Liên hệ']
            ].map(([t,...xs])=>(
              <div key={t}>
                <p className="mb-4 text-sm font-semibold text-[#f7c948]">{t}</p>
                <div className="grid gap-2.5">
                  {xs.map(x=><a className="text-sm text-white/65 transition hover:text-[#f7c948]" href="#" key={x}>{x}</a>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="my-8 border-t border-[#d9a441]/30"/>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-2">
            {[Facebook,Instagram,Sparkles,Linkedin,Youtube].map((I,i)=>(
              <a href="#" className="grid size-10 place-items-center rounded-full border border-[#d9a441]/40 text-white/75 transition hover:border-[#d9a441] hover:text-[#f7c948]" key={i}>
                <I size={17}/>
              </a>
            ))}
          </div>
          <div className="flex gap-3">
            <span className="rounded-xl border border-[#d9a441]/40 px-4 py-2 text-xs text-white/85">✓ Hơn 500 mẫu thiệp</span>
            <span className="rounded-xl border border-[#d9a441]/40 px-4 py-2 text-xs text-white/85">Tạo trong 60 giây</span>
          </div>
        </div>
        <p className="mt-8 text-[11px] leading-5 text-white/50">Dearlove - Nền tảng tạo thiệp trực tuyến cho mọi dịp. Hơn 500 mẫu thiệp đẹp, tùy chỉnh dễ dàng, gửi nhanh chóng. © 2026 Dearlove Inc.</p>
      </div>
    </footer>
  )
}

export default App

function ProblemsArrowIcon({ mobile = false }: { mobile?: boolean }) {
  return (
    <svg viewBox="0 0 220 185" fill="none" xmlns="http://www.w3.org/2000/svg" className={mobile ? 'problems-icon-mobile' : 'problems-icon'}>
      <g clipPath={`url(#problems_clip_${mobile ? 'mobile' : 'pc'})`}>
        <path d="M31.3241 62.7815C47.4635 55.8776 67.585 56.5652 83.0467 61.6266C97.8573 66.5229 115.035 77.868 113.291 94.3852C112.678 100.421 108.063 106.435 100.768 105.188C93.9868 104.054 90.938 97.9703 92.9528 91.9158C98.5647 75.6789 123.856 76.9771 136.611 81.4172C144.737 84.211 151.779 88.7664 157.359 94.7104C162.423 100.23 167.259 107.599 167.512 115.271C167.587 116.382 165.503 116.765 165.12 115.772C162.966 110.485 161.428 105.273 158.08 100.546C154.56 95.6785 149.88 91.4617 144.557 88.3198C133.877 81.9458 117.705 78.0889 104.705 83.6874C97.9159 86.8044 90.623 96.8478 98.5558 101.58C101.784 103.556 106.332 103.161 108.672 99.7793C110.876 96.6564 110.918 92.4965 110.248 89.2311C107.871 75.7418 93.2766 67.137 80.114 63.1637C72.6759 60.9353 64.7316 59.833 56.7603 59.8806C48.1051 59.9828 40.1454 61.8905 31.811 64.0454C30.9571 64.2687 30.5397 63.1854 31.3241 62.7815Z" fill="#E54153"/>
        <path d="M26.8188 64.5063C42.6587 53.4698 63.5876 51.9837 80.4944 58.3565C88.6223 61.4603 95.8017 66.0668 102.029 71.5558C108.325 77.2254 114.938 84.3276 117.145 92.4953C118.652 98.2374 117.039 108.385 108.353 109.017C100.728 109.658 92.7503 103.285 91.5465 96.805C90.2345 89.4343 96.83 82.7657 104.169 80.163C112.942 77.0116 123.043 78.2208 131.404 80.4064C149.772 85.0805 164.938 97.61 171.233 113.95C171.824 115.485 169.164 116.814 168.573 115.279C163.812 103.531 154.685 93.8695 142.809 87.7461C136.7 84.6981 129.981 82.5054 122.825 81.6192C114.676 80.5954 104.685 80.5871 98.1883 86.5965C91.0113 93.2806 94.5876 101.649 102.205 105.259C106.666 107.384 111.695 107.323 114.058 102.172C115.947 97.9262 114.823 93.1772 113.02 89.4128C107.06 77.2955 94.3353 66.8353 81.1978 61.4021C64.9034 54.4841 43.9338 54.9499 28.0244 65.8058C27.1048 66.4686 25.8316 65.2986 26.8188 64.5063Z" fill="#E54153"/>
        <path d="M153.739 106.663C157.135 108.159 160.329 110.044 163.488 111.839C164.998 112.711 166.577 113.454 168.088 114.325C168.808 114.671 172.211 117.098 173.03 116.784C173.439 116.628 173.549 112.338 173.58 111.808C173.775 110.18 173.936 108.461 174.131 106.832C174.521 103.575 174.291 99.6233 175.811 96.5551C176.317 95.429 177.959 95.4219 178.274 96.5444C178.835 98.6089 178.302 100.885 177.973 103.082C177.647 105.59 177.423 108.058 177.096 110.566C176.803 112.854 177.35 118.238 174.485 119.646C171.722 121.014 167.935 117.284 165.876 116.208C161.378 113.683 156.573 111.275 152.415 108.412C151.316 107.694 152.504 106.203 153.739 106.663Z" fill="#E54153"/>
        <path d="M154.556 106.039C157.752 108.234 160.269 111.414 163.124 113.947C166.496 116.903 169.97 119.821 173.749 122.31C172.862 122.753 171.975 123.196 171.088 123.639C171.61 119.503 172.029 115.406 172.174 111.207C172.286 107.228 171.3 102.84 172.131 98.8964C172.397 97.7584 174.445 96.9744 174.932 98.2383C176.289 101.759 175.804 106.296 175.725 110.055C175.582 114.564 175.199 119.061 174.475 123.586C174.278 124.905 172.503 125.481 171.471 124.633C168.134 121.766 164.628 119.069 161.461 116.034C158.536 113.321 155.199 110.454 153.296 107.039C152.951 106.447 153.903 105.564 154.556 106.039Z" fill="#E54153"/>
        <path d="M153.511 103.021C160.704 109.797 167.897 116.574 175.294 123.272C174.27 123.664 173.314 123.927 172.29 124.319C173.356 119.767 174.388 115.125 175.18 110.471C175.871 106.166 175.637 101.594 177.082 97.4151C177.519 96.1084 179.675 96.2153 179.922 97.4673C180.736 101.714 179.502 106.745 178.708 111.089C177.881 115.652 176.917 120.165 175.611 124.705C175.242 125.882 173.465 126.148 172.81 125.363C165.854 118.288 158.866 111.433 151.809 104.397C150.742 103.459 152.547 102.043 153.511 103.021Z" fill="#E54153"/>
      </g>
      <defs>
        <clipPath id={`problems_clip_${mobile ? 'mobile' : 'pc'}`}>
          <rect width="186.388" height="125.768" fill="white" transform="matrix(0.933901 -0.357532 0.359486 0.93315 0.45723 67.1399)"/>
        </clipPath>
      </defs>
    </svg>
  )
}

function ProblemCard({ Icon, title, desc }: { Icon: typeof Clock; title: string; desc: string }) {
  return (
    <div className="problem-card p-5 text-center flex flex-col items-center gap-3">
      <div className="problem-card__icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-sm font-heading text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  )
}

function ProblemsSection() {
  const problems = [
    {
      Icon: Clock,
      title: 'Mất nhiều thời gian',
      desc: 'để gửi tận tay tất cả thiệp mời',
    },
    {
      Icon: MessageCircle,
      title: 'Không đủ chia sẻ thành ý',
      desc: 'khi dùng tin nhắn và ảnh chụp thiệp',
    },
    {
      Icon: Users,
      title: 'Không biết số khách mời tham dự',
      desc: 'một cách chính xác',
    },
  ]

  return (
    <section id="problems" className="bg-white py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PC heading */}
        <div className="problems-heading-pc hidden md:block">
          <div className="relative flex items-center justify-center">
            <div className="flex items-start gap-4">
              <div className="text-right text-gray-900">
                <h3 className="text-3xl font-heading">BẠN ĐANG CÓ KẾ HOẠCH</h3>
                <div className="problems-invitation-line">
                  <div className="problems-icon-wrap">
                    <ProblemsArrowIcon />
                  </div>
                  <h3 className="text-3xl font-heading">MỜI TIỆC</h3>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-baseline">
                  <span
                    className="text-[#e54153] tracking-wide leading-none font-semibold italic font-signature"
                    style={{ fontSize: '5rem' }}
                  >
                    100
                    <span
                      className="text-[#e54153] leading-none align-super italic font-signature"
                      style={{ fontSize: '4rem', lineHeight: 0, marginLeft: '0.5rem' }}
                    >
                      +
                    </span>
                  </span>
                  <span className="sr-only">Hơn 100 khách mời</span>
                  <span className="text-3xl font-heading">KHÁCH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile heading */}
        <div className="problems-heading-mobile block md:hidden">
          <div className="relative flex items-center justify-center">
            <div className="flex flex-col items-center text-gray-900">
              <div className="text-center">
                <h3 className="text-2xl font-heading">BẠN ĐANG</h3>
                <h3 className="text-2xl font-heading">CÓ KẾ HOẠCH MỜI TIỆC</h3>
              </div>
              <div className="text-center flex items-baseline justify-center">
                <span
                  className="text-[#e54153] tracking-wide leading-none font-semibold italic font-signature"
                  style={{ fontSize: '5rem', lineHeight: 1.3 }}
                >
                  100
                  <span
                    className="text-[#e54153] leading-none align-super italic font-signature"
                    style={{ fontSize: '3rem', lineHeight: 0, marginLeft: '0.5rem' }}
                  >
                    +
                  </span>
                </span>
                <span className="sr-only">Hơn 100 khách mời</span>
                <span className="text-2xl font-heading">KHÁCH</span>
              </div>
              <ProblemsArrowIcon mobile />
            </div>
          </div>
        </div>

        <h2
          id="problems-heading"
          className="problems-heading-mobile text-center mt-0 md:hidden text-[#e54153] uppercase tracking-wide text-lg font-heading"
        >
          Nhưng có nhiều vấn đề phải bận tâm?
        </h2>

        {/* PC cards grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-2 md:mt-8 px-4 md:px-8">
          {problems.map(({ Icon, title, desc }, i) => (
            <div key={title} style={{ animationDelay: `${i * 0.1}s` }}>
              <ProblemCard Icon={Icon} title={title} desc={desc} />
            </div>
          ))}
        </div>

        {/* Mobile cards horizontal scroller */}
        <div className="block md:hidden">
          <div className="problems-cards-scroll">
            {problems.map(({ Icon, title, desc }) => (
              <ProblemCard key={title} Icon={Icon} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
