import { useEffect, useRef, useState, useCallback } from 'react'
import { StaggerContainer, ScrollReveal } from '../components'

const TEMPLATES = [
  // Truyền thống (5)
  { name: 'Thành Hỷ', category: 'traditional', catLabel: 'Truyền Thống', price: 'Miễn phí', badge: 'MỚI', img: 'screen-Co7xW3hO.png', url: 'dearlove.vn/thanh-hy' },
  { name: 'Song Hỷ', category: 'traditional', catLabel: 'Truyền Thống', price: '99,000đ', badge: null, img: 'screen-BePdfixw.png', url: 'dearlove.vn/song-hy' },
  { name: 'Lễ Vu Quy', category: 'traditional', catLabel: 'Truyền Thống', price: '149,000đ', badge: 'BÁN CHẠY', img: 'screen-BH9TbqLT.png', url: 'dearlove.vn/vu-quy' },
  { name: 'Hỷ Phát', category: 'traditional', catLabel: 'Truyền Thống', price: 'Miễn phí', badge: null, img: 'screen-DV6BzFar.png', url: 'dearlove.vn/hy-phat' },
  { name: 'Gia Tiên', category: 'traditional', catLabel: 'Truyền Thống', price: '199,000đ', badge: 'MỚI', img: 'screen-D5A5CUxl.png', url: 'dearlove.vn/gia-tien' },

  // Hiện đại (5)
  { name: 'Modern Love', category: 'modern', catLabel: 'Hiện Đại', price: 'Miễn phí', badge: 'MỚI', img: 'screen-E1F9MOF-.png', url: 'dearlove.vn/modern-love' },
  { name: 'Clean Type', category: 'modern', catLabel: 'Hiện Đại', price: '149,000đ', badge: null, img: 'screen-CSqla4Re.png', url: 'dearlove.vn/clean-type' },
  { name: 'Urban Romance', category: 'modern', catLabel: 'Hiện Đại', price: '199,000đ', badge: 'MỚI', img: 'screen-CgCCgAYu.png', url: 'dearlove.vn/urban-romance' },
  { name: 'Bold Mono', category: 'modern', catLabel: 'Hiện Đại', price: 'Miễn phí', badge: null, img: 'screen-COd9dlwS.png', url: 'dearlove.vn/bold-mono' },
  { name: 'Typographic', category: 'modern', catLabel: 'Hiện Đại', price: '249,000đ', badge: 'BÁN CHẠY', img: 'screen-C3MeFa6u.png', url: 'dearlove.vn/typographic' },

  // Tối giản (5)
  { name: 'Soft Beige', category: 'minimal', catLabel: 'Tối Giản', price: 'Miễn phí', badge: 'MỚI', img: 'screen-D4bCK53t.png', url: 'dearlove.vn/soft-beige' },
  { name: 'Mono Chic', category: 'minimal', catLabel: 'Tối Giản', price: '149,000đ', badge: null, img: 'screen-CHaUdNcQ.png', url: 'dearlove.vn/mono-chic' },
  { name: 'Pure White', category: 'minimal', catLabel: 'Tối Giản', price: 'Miễn phí', badge: null, img: 'screen-t1QviRV4.png', url: 'dearlove.vn/pure-white' },
  { name: 'Line Art', category: 'minimal', catLabel: 'Tối Giản', price: '199,000đ', badge: 'MỚI', img: 'screen-De9bFzaH.png', url: 'dearlove.vn/line-art' },
  { name: 'Ivory Quiet', category: 'minimal', catLabel: 'Tối Giản', price: '249,000đ', badge: null, img: 'screen-BpAogSip.png', url: 'dearlove.vn/ivory-quiet' },

  // Hoa lãng mạn (6)
  { name: 'Garden Bloom', category: 'floral', catLabel: 'Hoa Lãng Mạn', price: 'Miễn phí', badge: 'MỚI', img: 'screen-DZ-rpQ-Z.png', url: 'dearlove.vn/garden-bloom' },
  { name: 'Rose Whisper', category: 'floral', catLabel: 'Hoa Lãng Mạn', price: '149,000đ', badge: 'BÁN CHẠY', img: 'screen-bgCJtZ2a.png', url: 'dearlove.vn/rose-whisper' },
  { name: 'Cherry Blossom', category: 'floral', catLabel: 'Hoa Lãng Mạn', price: '199,000đ', badge: 'MỚI', img: 'screen-VqM2YBzf.png', url: 'dearlove.vn/cherry-blossom' },
  { name: 'Lavender Field', category: 'floral', catLabel: 'Hoa Lãng Mạn', price: 'Miễn phí', badge: null, img: 'screen-BKf7lZ4i.png', url: 'dearlove.vn/lavender-field' },
  { name: 'Peony Garden', category: 'floral', catLabel: 'Hoa Lãng Mạn', price: '249,000đ', badge: null, img: 'screen-Bg6mAIDY.png', url: 'dearlove.vn/peony-garden' },
  { name: 'Magnolia', category: 'floral', catLabel: 'Hoa Lãng Mạn', price: 'Miễn phí', badge: 'MỚI', img: 'screen-Dz_o2gGA.png', url: 'dearlove.vn/magnolia' },

  // Hoàng gia (5)
  { name: 'Royal Crimson', category: 'royal', catLabel: 'Hoàng Gia', price: '199,000đ', badge: 'MỚI', img: 'screen-oQ5tO4eU.png', url: 'dearlove.vn/royal-crimson' },
  { name: 'Imperial Gold', category: 'royal', catLabel: 'Hoàng Gia', price: '299,000đ', badge: null, img: 'screen--Nx0rWgk.png', url: 'dearlove.vn/imperial-gold' },
  { name: 'Diamond Luxe', category: 'royal', catLabel: 'Hoàng Gia', price: '249,000đ', badge: 'MỚI', img: 'screen-B7cs4Wz9.png', url: 'dearlove.vn/diamond-luxe' },
  { name: 'Majestic Red', category: 'royal', catLabel: 'Hoàng Gia', price: 'Miễn phí', badge: null, img: 'screen-B5gDw83U.png', url: 'dearlove.vn/majestic-red' },
  { name: 'Royal Garden', category: 'royal', catLabel: 'Hoàng Gia', price: '349,000đ', badge: 'BÁN CHẠY', img: 'screen-BJQ9HPvx.png', url: 'dearlove.vn/royal-garden' },

  // Cổ điển (4)
  { name: 'Vintage Rose', category: 'classic', catLabel: 'Cổ Điển', price: '149,000đ', badge: 'BÁN CHẠY', img: 'screen-B2dGAM8f.png', url: 'dearlove.vn/vintage-rose' },
  { name: 'Heritage Gold', category: 'classic', catLabel: 'Cổ Điển', price: '199,000đ', badge: 'MỚI', img: 'screen-B3A56fHh.png', url: 'dearlove.vn/heritage-gold' },
  { name: 'Classic Ivory', category: 'classic', catLabel: 'Cổ Điển', price: 'Miễn phí', badge: null, img: 'screen-HY3xN3I1.png', url: 'dearlove.vn/classic-ivory' },
  { name: 'Victorian Charm', category: 'classic', catLabel: 'Cổ Điển', price: '249,000đ', badge: 'MỚI', img: 'screen-DQ6nrdS7.png', url: 'dearlove.vn/victorian-charm' },
]

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'traditional', label: 'Truyền Thống' },
  { key: 'modern', label: 'Hiện Đại' },
  { key: 'minimal', label: 'Tối Giản' },
  { key: 'floral', label: 'Hoa Lãng Mạn' },
  { key: 'royal', label: 'Hoàng Gia' },
  { key: 'classic', label: 'Cổ Điển' },
]

const IMAGES_PATH = '/templates-section/images/assets/'

export default function TemplatesSection() {
  const [currentCategory, setCurrentCategory] = useState('all')
  const [activeList, setActiveList] = useState(TEMPLATES)
  const [rotation, setRotation] = useState(0)
  const [dragStartX, setDragStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const rotateBy = useCallback((delta: number) => {
    setRotation(prev => {
      const n = activeList.length
      if (n === 0) return prev
      return (prev + delta + n) % n
    })
  }, [activeList.length])

  const handleCategoryChange = (cat: string) => {
    setCurrentCategory(cat)
    setActiveList(cat === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === cat))
    setRotation(0)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') rotateBy(-1)
      if (e.key === 'ArrowRight') rotateBy(1)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [rotateBy])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !stageRef.current) return
    const dx = e.clientX - dragStartX
    if (Math.abs(dx) > 60) {
      rotateBy(dx > 0 ? -1 : 1)
      setDragStartX(e.clientX)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !stageRef.current) return
    const dx = e.touches[0].clientX - dragStartX
    if (Math.abs(dx) > 60) {
      rotateBy(dx > 0 ? -1 : 1)
      setDragStartX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const getSlideStyle = (index: number) => {
    const n = activeList.length
    if (n === 0) return {}

    let offset = index - rotation
    if (offset > n / 2) offset -= n
    if (offset < -n / 2) offset += n

    const translateX = offset * 170
    const translateZ = -Math.abs(offset) * 170
    const rotateY = -offset * 24
    const scale = offset === 0 ? 1 : 0.92
    const opacity = Math.abs(offset) <= 2 ? (1 - Math.abs(offset) * 0.12) : 0
    const filter = offset === 0 ? 'none' : 'saturate(0.85) brightness(0.92)'
    const zIndex = n - Math.abs(offset)
    const pointerEvents = Math.abs(offset) <= 2 ? 'auto' : 'none'

    return {
      transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      filter,
      zIndex,
      pointerEvents: (Math.abs(offset) <= 2 ? 'auto' : 'none') as React.CSSProperties['pointerEvents'],
    } as React.CSSProperties
  }

  return (
    <section className="templates-section" id="templatesSection">
      {/* Decorative flower */}
      <div className="deco-flower">
        <img src="/templates-section/images/elements/hac-2.png" alt="" aria-hidden="true" className="floating" style={{ width: '100%', height: 'auto' }} />
      </div>

      {/* Decorative cloud */}
      <div className="deco-cloud">
        <svg viewBox="0 0 220 90" fill="none" style={{ width: '100%' }}>
          <g stroke="#d9a441" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
            <path d="M18 62 C6 58 4 42 14 35 C8 24 20 12 33 16 C36 4 56 2 62 13 C72 4 90 8 92 22 C106 16 120 26 116 40" />
            <path d="M33 47 C27 44 27 36 33 33 C39 30 46 34 46 41" />
            <path d="M70 34 C65 30 66 22 73 20 C80 18 86 24 84 31" />
            <path d="M116 40 C140 34 158 44 156 58 C176 52 196 60 198 74" />
            <path d="M140 52 C136 48 138 41 144 40" />
            <path d="M52 66 C74 60 96 64 108 74 C126 66 148 70 158 80" opacity="0.7" />
          </g>
        </svg>
      </div>

      <div className="mx-auto max-w-[1280px] px-6">
        {/* Header */}
        <ScrollReveal>
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d9a441]" />
            <span className="h-px w-12 bg-[#d9a441]" />
          </div>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#8d1216] sm:text-5xl lg:text-6xl">
            Kho mẫu thiệp <span className="highlight-gradient font-display italic">tuyệt đẹp</span>,<br className="hidden sm:block" /> sẵn sàng gửi đi
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#7c3f06]/70">
            Hơn 30 mẫu thiệp cưới thiết kế tinh tế — chỉ cần chọn mẫu bạn thích,
            thêm tên, ngày cưới và gửi lời mời đến mọi người.
          </p>
        </div>
        </ScrollReveal>

        {/* Filter Buttons */}
        <ScrollReveal delay={0.1}>
        <StaggerContainer staggerDelay={0.05} direction="scale" className="filter-bar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${currentCategory === f.key ? 'active' : ''}`}
              onClick={() => handleCategoryChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </StaggerContainer>
        </ScrollReveal>

        {/* 3D Carousel */}
        <div className="carousel-3d-wrap">
          <div
            className="carousel-3d"
            ref={stageRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="carousel-3d__stage">
              {activeList.length === 0 ? (
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
                  Không có mẫu nào trong danh mục này.
                </p>
              ) : (
                activeList.map((t, i) => {
                  const isFree = t.price === 'Miễn phí'
                  const priceClass = isFree ? 'tmpl-card__price--free' : 'tmpl-card__price--paid'
                  return (
                    <div
                      key={`${t.name}-${i}`}
                      className="carousel-3d__slide"
                      style={getSlideStyle(i)}
                    >
                      <button className="tmpl-card" aria-label={`${t.name} template preview`}>
                        <div className="tmpl-card__frame">
                          <div className="tmpl-card__topbar">
                            <span className="dot dot--gold" />
                            <span className="dot dot--orange" />
                            <span className="dot dot--cream" />
                            <span className="tmpl-url">{t.url}</span>
                          </div>
                          <div className="tmpl-card__screen">
                            <img
                              src={`${IMAGES_PATH}${t.img}`}
                              alt={`${t.name} preview`}
                              loading="lazy"
                            />
                            {t.badge && <span className="tmpl-badge">{t.badge}</span>}
                            <div className="tmpl-card__hover">
                              <span className="tmpl-card__hover-btn">
                                Xem trước
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14" />
                                  <path d="m12 5 7 7-7 7" />
                                </svg>
                              </span>
                            </div>
                          </div>
                          <div className="tmpl-card__footer">
                            <div style={{ minWidth: 0 }}>
                              <p className="tmpl-card__name">{t.name}</p>
                              <p className="tmpl-card__category">{t.catLabel}</p>
                            </div>
                            <span className={`tmpl-card__price ${priceClass}`}>{t.price}</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Prev / Next buttons */}
            <button
              id="btnPrev"
              className="carousel-nav carousel-nav--prev"
              aria-label="Mẫu trước"
              onClick={() => rotateBy(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              id="btnNext"
              className="carousel-nav carousel-nav--next"
              aria-label="Mẫu tiếp theo"
              onClick={() => rotateBy(1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div className="dots-container">
            {activeList.map((t, i) => (
              <button
                key={`dot-${t.name}-${i}`}
                className={`dot-btn ${i === rotation ? 'active' : ''}`}
                onClick={() => setRotation(i)}
                aria-label={t.name}
              />
            ))}
          </div>
        </div>

        {/* View all link */}
        <div className="mt-12 flex justify-center">
          <a href="#templatesSection" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8d1216] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#7c3f06]">
            Xem toàn bộ mẫu thiệp
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }}>
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
