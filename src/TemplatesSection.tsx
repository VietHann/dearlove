import { useEffect, useRef, useState, useCallback } from 'react'

const TEMPLATES = [
  // Cafe (8)
  { name: 'Garden Oasis', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: 'Miễn phí', badge: null, img: 'screen-D5A5CUxl.png', url: 'vngoweb.com/coffe-1' },
  { name: 'Tropical Chill', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: '299,000đ', badge: 'MỚI', img: 'screen-E1F9MOF-.png', url: 'vngoweb.com/coffe-2' },
  { name: 'The Ocean Cafe', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: '499,000đ', badge: 'BÁN CHẠY', img: 'screen-CSqla4Re.png', url: 'vngoweb.com/coffe-3' },
  { name: 'Koi Garden', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: '399,000đ', badge: null, img: 'screen-CgCCgAYu.png', url: 'vngoweb.com/coffe-4' },
  { name: 'Mật Ngọt Tea', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: 'Miễn phí', badge: 'MỚI', img: 'screen-COd9dlwS.png', url: 'vngoweb.com/coffe-5' },
  { name: 'Oasis Symphony', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: '349,000đ', badge: 'MỚI', img: 'screen-C3MeFa6u.png', url: 'vngoweb.com/coffe-6' },
  { name: 'Garden Sanctuary', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: 'Miễn phí', badge: null, img: 'screen-D4bCK53t.png', url: 'vngoweb.com/coffe-7' },
  { name: 'Sage Sanctuary', category: 'cafe', catLabel: 'Cafe & Đồ Uống', price: '299,000đ', badge: 'MỚI', img: 'screen-CHaUdNcQ.png', url: 'vngoweb.com/coffe-8' },

  // Restaurant (6)
  { name: 'Bếp Việt Premium', category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: '399,000đ', badge: 'MỚI', img: 'screen-t1QviRV4.png', url: 'vngoweb.com/restaurant-2' },
  { name: 'Sizzling Hearth', category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: 'Miễn phí', badge: null, img: 'screen-De9bFzaH.png', url: 'vngoweb.com/restaurant-3' },
  { name: 'Siam Street Food', category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: '299,000đ', badge: 'MỚI', img: 'screen-BpAogSip.png', url: 'vngoweb.com/restaurant-4' },
  { name: 'Golden Lotus Dining', category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: 'Miễn phí', badge: null, img: 'screen-DZ-rpQ-Z.png', url: 'vngoweb.com/restaurant-5' },
  { name: 'Siam Teak House', category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: '299,000đ', badge: 'MỚI', img: 'screen-bgCJtZ2a.png', url: 'vngoweb.com/restaurant-6' },
  { name: 'Crimson Sushi', category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: 'Miễn phí', badge: null, img: 'screen-VqM2YBzf.png', url: 'vngoweb.com/restaurant-7' },

  // Spa (5)
  { name: 'Aura Clinic', category: 'spa', catLabel: 'Spa & Làm Đẹp', price: 'Miễn phí', badge: 'MỚI', img: 'screen-BKf7lZ4i.png', url: 'vngoweb.com/spa-1' },
  { name: 'Aura Wellness', category: 'spa', catLabel: 'Spa & Làm Đẹp', price: '299,000đ', badge: 'MỚI', img: 'screen-Bg6mAIDY.png', url: 'vngoweb.com/spa-2' },
  { name: 'Luminous Precision Clinic', category: 'spa', catLabel: 'Spa & Làm Đẹp', price: '299,000đ', badge: 'MỚI', img: 'screen-Dz_o2gGA.png', url: 'vngoweb.com/spa-4' },
  { name: 'Zenith', category: 'spa', catLabel: 'Spa & Làm Đẹp', price: 'Miễn phí', badge: null, img: 'screen-oQ5tO4eU.png', url: 'vngoweb.com/spa-5' },
  { name: 'Ocean Oasis', category: 'spa', catLabel: 'Spa & Làm Đẹp', price: '299,000đ', badge: 'MỚI', img: 'screen--Nx0rWgk.png', url: 'vngoweb.com/spa-6' },

  // Gym (3)
  { name: 'Crimson Peak', category: 'gym', catLabel: 'Gym & Thể Thao', price: 'Miễn phí', badge: 'MỚI', img: 'screen-B7cs4Wz9.png', url: 'vngoweb.com/gym-2' },
  { name: 'Terra Strength', category: 'gym', catLabel: 'Gym & Thể Thao', price: 'Miễn phí', badge: 'MỚI', img: 'screen-B5gDw83U.png', url: 'vngoweb.com/gym-3' },
  { name: 'Aether Fitness', category: 'gym', catLabel: 'Gym & Thể Thao', price: 'Miễn phí', badge: 'MỚI', img: 'screen-BJQ9HPvx.png', url: 'vngoweb.com/gym-4' },

  // Wedding (4)
  { name: 'Thiệp Hồng', category: 'wedding', catLabel: 'Thiệp Cưới', price: 'Miễn phí', badge: 'MỚI', img: 'screen-Co7xW3hO.png', url: 'vngoweb.com/wedding-1' },
  { name: 'Ánh Bạc', category: 'wedding', catLabel: 'Thiệp Cưới', price: '299,000đ', badge: null, img: 'screen-BePdfixw.png', url: 'vngoweb.com/wedding-2' },
  { name: 'Thành Hỷ', category: 'wedding', catLabel: 'Thiệp Cưới', price: '249,000đ', badge: 'MỚI', img: 'screen-BH9TbqLT.png', url: 'vngoweb.com/wedding-3' },
  { name: 'Di Sản Vĩnh Cửu', category: 'wedding', catLabel: 'Thiệp Cưới', price: '249,000đ', badge: 'MỚI', img: 'screen-DV6BzFar.png', url: 'vngoweb.com/wedding-4' },

  // Homestay (7)
  { name: 'Serenity Villa', category: 'homestay', catLabel: 'Homestay & Villa', price: 'Miễn phí', badge: 'MỚI', img: 'screen-B2dGAM8f.png', url: 'vngoweb.com/villa-1' },
  { name: 'Serenity Villa Deluxe', category: 'homestay', catLabel: 'Homestay & Villa', price: '299,000đ', badge: null, img: 'screen-B3A56fHh.png', url: 'vngoweb.com/villa-2' },
  { name: 'Zenith Wilderness - Phong Nha', category: 'homestay', catLabel: 'Homestay & Villa', price: '349,000đ', badge: null, img: 'screen-HY3xN3I1.png', url: 'vngoweb.com/villa-3' },
  { name: 'Rông Homestay', category: 'homestay', catLabel: 'Homestay & Villa', price: '349,000đ', badge: null, img: 'screen-DQ6nrdS7.png', url: 'vngoweb.com/villa-4' },
  { name: 'Serenity Sea-View Villa', category: 'homestay', catLabel: 'Homestay & Villa', price: '399,000đ', badge: 'BÁN CHẠY', img: 'screen-Df6qR7x8.png', url: 'vngoweb.com/villa-5' },
  { name: "H'Mong Cliff Villa", category: 'homestay', catLabel: 'Homestay & Villa', price: '399,000đ', badge: null, img: 'screen-DQwz8IfJ.png', url: 'vngoweb.com/villa-6' },
  { name: 'The Hill Villas', category: 'homestay', catLabel: 'Homestay & Villa', price: '349,000đ', badge: null, img: 'screen-Buo06aMu.png', url: 'vngoweb.com/villa-7' },

  // Dental (6)
  { name: 'Nha Khoa Rạng Ngời', category: 'dental', catLabel: 'Nha Khoa', price: 'Miễn phí', badge: 'MỚI', img: 'screen-Cat78Xki.png', url: 'vngoweb.com/dentalClinic-1' },
  { name: 'Nha Khoa Sáng Tâm', category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-BhIHP8Qk.png', url: 'vngoweb.com/dentalClinic-2' },
  { name: 'Nha Khoa Tinh Anh', category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-CErosBWf.png', url: 'vngoweb.com/dentalClinic-3' },
  { name: 'Nha Khoa Tân Kỷ Nguyên', category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-DoNDlm7d.png', url: 'vngoweb.com/dentalClinic-4' },
  { name: 'Nha Khoa An Nhiên', category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-CHn5BFph.png', url: 'vngoweb.com/dentalClinic-5' },
  { name: 'Nha Khoa Nụ Cười Vàng', category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-D7snLyZZ.png', url: 'vngoweb.com/dentalClinic-6' },
]

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'cafe', label: 'Cafe & Đồ Uống' },
  { key: 'restaurant', label: 'Nhà Hàng & Quán Ăn' },
  { key: 'spa', label: 'Spa & Làm Đẹp' },
  { key: 'gym', label: 'Gym & Thể Thao' },
  { key: 'wedding', label: 'Thiệp Cưới' },
  { key: 'homestay', label: 'Homestay & Villa' },
  { key: 'dental', label: 'Nha Khoa' },
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
    <section className="templates-section js-reveal" id="templatesSection">
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
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d9a441]" />
            <span className="eyebrow">Sản phẩm thật, chạm là chạy</span>
            <span className="h-px w-12 bg-[#d9a441]" />
          </div>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#8d1216] sm:text-5xl lg:text-6xl">
            Kho giao diện <span className="text-gradient-viet">tuyệt đẹp</span>,<br className="hidden sm:block" /> sẵn sàng sử dụng
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#7c3f06]/70">
            Đây là ảnh chụp thật từ các mẫu website đang bán trên vngoweb —
            di chuột lên mẫu chính giữa để cuộn xem toàn trang.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-bar" style={{ transitionDelay: '90ms' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${currentCategory === f.key ? 'active' : ''}`}
              onClick={() => handleCategoryChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

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
          <a href="marketplace/index.html" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8d1216] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#7c3f06]">
            Xem toàn bộ marketplace
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
