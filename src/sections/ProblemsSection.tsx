import { useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Clock, MessageCircle, Users } from 'lucide-react'

interface Problem { Icon: LucideIcon; title: string; desc: string }

const PROBLEMS: Problem[] = [
  { Icon: Clock,         title: 'Mất nhiều thời gian',     desc: 'để gửi tận tay tất cả thiệp mời' },
  { Icon: MessageCircle, title: 'Không đủ chia sẻ thành ý', desc: 'khi dùng tin nhắn và ảnh chụp thiệp' },
  { Icon: Users,         title: 'Không biết số khách mời tham dự', desc: 'một cách chính xác' },
]

function ProblemCard({ Icon, title, desc }: Problem) {
  return (
    <article
      className="h-full bg-white rounded-2xl p-5 flex flex-col items-center text-center gap-3
                 shadow-[0_12px_28px_-6px_rgba(124,63,6,0.12),0_4px_10px_-2px_rgba(124,63,6,0.06)]
                 hover:-translate-y-1.5 hover:scale-[1.02]
                 hover:shadow-[0_20px_40px_-8px_rgba(229,65,83,0.22),0_8px_16px_-4px_rgba(124,63,6,0.08)]
                 transition-all duration-300 ease-out motion-safe:animate-fade-up"
    >
      <div className="grid place-items-center w-24 h-24 rounded-full text-amber-700
                      bg-[radial-gradient(circle_at_30%_30%,#fde8a8,#f9d375_55%,#f3c14b)]
                      shadow-[inset_0_-8px_18px_rgba(180,83,9,0.18),0_6px_14px_-4px_rgba(243,193,75,0.45)]">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h4 className="font-heading text-sm md:text-base font-bold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{desc}</p>
    </article>
  )
}

/** Decorative heart-arrow used in the heading. Inline SVG, no CSS or JS needed. */
function HeartArrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 185" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <g>
        <path d="M31.3241 62.7815C47.4635 55.8776 67.585 56.5652 83.0467 61.6266C97.8573 66.5229 115.035 77.868 113.291 94.3852C112.678 100.421 108.063 106.435 100.768 105.188C93.9868 104.054 90.938 97.9703 92.9528 91.9158C98.5647 75.6789 123.856 76.9771 136.611 81.4172C144.737 84.211 151.779 88.7664 157.359 94.7104C162.423 100.23 167.259 107.599 167.512 115.271C167.587 116.382 165.503 116.765 165.12 115.772C162.966 110.485 161.428 105.273 158.08 100.546C154.56 95.6785 149.88 91.4617 144.557 88.3198C133.877 81.9458 117.705 78.0889 104.705 83.6874C97.9159 86.8044 90.623 96.8478 98.5558 101.58C101.784 103.556 106.332 103.161 108.672 99.7793C110.876 96.6564 110.918 92.4965 110.248 89.2311C107.871 75.7418 93.2766 67.137 80.114 63.1637C72.6759 60.9353 64.7316 59.833 56.7603 59.8806C48.1051 59.9828 40.1454 61.8905 31.811 64.0454C30.9571 64.2687 30.5397 63.1854 31.3241 62.7815Z" fill="#E54153"/>
        <path d="M26.8188 64.5063C42.6587 53.4698 63.5876 51.9837 80.4944 58.3565C88.6223 61.4603 95.8017 66.0668 102.029 71.5558C108.325 77.2254 114.938 84.3276 117.145 92.4953C118.652 98.2374 117.039 108.385 108.353 109.017C100.728 109.658 92.7503 103.285 91.5465 96.805C90.2345 89.4343 96.83 82.7657 104.169 80.163C112.942 77.0116 123.043 78.2208 131.404 80.4064C149.772 85.0805 164.938 97.61 171.233 113.95C171.824 115.485 169.164 116.814 168.573 115.279C163.812 103.531 154.685 93.8695 142.809 87.7461C136.7 84.6981 129.981 82.5054 122.825 81.6192C114.676 80.5954 104.685 80.5871 98.1883 86.5965C91.0113 93.2806 94.5876 101.649 102.205 105.259C106.666 107.384 111.695 107.323 114.058 102.172C115.947 97.9262 114.823 93.1772 113.02 89.4128C107.06 77.2955 94.3353 66.8353 81.1978 61.4021C64.9034 54.4841 43.9338 54.9499 28.0244 65.8058C27.1048 66.4686 25.8316 65.2986 26.8188 64.5063Z" fill="#E54153"/>
        <path d="M153.739 106.663C157.135 108.159 160.329 110.044 163.488 111.839C164.998 112.711 166.577 113.454 168.088 114.325C168.808 114.671 172.211 117.098 173.03 116.784C173.439 116.628 173.549 112.338 173.58 111.808C173.775 110.18 173.936 108.461 174.131 106.832C174.521 103.575 174.291 99.6233 175.811 96.5551C176.317 95.429 177.959 95.4219 178.274 96.5444C178.835 98.6089 178.302 100.885 177.973 103.082C177.647 105.59 177.423 108.058 177.096 110.566C176.803 112.854 177.35 118.238 174.485 119.646C171.722 121.014 167.935 117.284 165.876 116.208C161.378 113.683 156.573 111.275 152.415 108.412C151.316 107.694 152.504 106.203 153.739 106.663Z" fill="#E54153"/>
        <path d="M154.556 106.039C157.752 108.234 160.269 111.414 163.124 113.947C166.496 116.903 169.97 119.821 173.749 122.31C172.862 122.753 171.975 123.196 171.088 123.639C171.61 119.503 172.029 115.406 172.174 111.207C172.286 107.228 171.3 102.84 172.131 98.8964C172.397 97.7584 174.445 96.9744 174.932 98.2383C176.289 101.759 175.804 106.296 175.725 110.055C175.582 114.564 175.199 119.061 174.475 123.586C174.278 124.905 172.503 125.481 171.471 124.633C168.134 121.766 164.628 119.069 161.461 116.034C158.536 113.321 155.199 110.454 153.296 107.039C152.951 106.447 153.903 105.564 154.556 106.039Z" fill="#E54153"/>
        <path d="M153.511 103.021C160.704 109.797 167.897 116.574 175.294 123.272C174.27 123.664 173.314 123.927 172.29 124.319C173.356 119.767 174.388 115.125 175.18 110.471C175.871 106.166 175.637 101.594 177.082 97.4151C177.519 96.1084 179.675 96.2153 179.922 97.4673C180.736 101.714 179.502 106.745 178.708 111.089C177.881 115.652 176.917 120.165 175.611 124.705C175.242 125.882 173.465 126.148 172.81 125.363C165.854 118.288 158.866 111.433 151.809 104.397C150.742 103.459 152.547 102.043 153.511 103.021Z" fill="#E54153"/>
      </g>
    </svg>
  )
}

// Card advances every 3.2s on mobile; respect prefers-reduced-motion and pause on hover.
const AUTOPLAY_MS = 3200
// Keep each mobile transition crisp while remaining easy to follow.
const SCROLL_MS = 220

/**
 * ProblemsSection — "BẠN ĐANG CÓ KẾ HOẠCH MỜI TIỆC 100+ KHÁCH"
 *
 * Mobile uses an auto-advancing carousel. Desktop displays the same
 * cards in a static grid.
 * The mobile track scrolls itself every
 * AUTOPLAY_MS, the snap loop wraps back to the first card, and
 * no manual controls are exposed. Hovering pauses the timer.
 */
export function ProblemsSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const isHoveredRef = useRef(false)

  // Smooth-scroll the i-th card to the horizontal center of the track.
  // Uses a rAF loop with ease-out-cubic so we control the duration and
  // feel — the browser's native smooth-scroll is too slow for a 4.5s tick.
  const scrollToIndex = (i: number, duration = SCROLL_MS) => {
    const track = trackRef.current
    const card = track?.children[i] as HTMLElement | undefined
    if (!track || !card) return

    const target =
      card.offsetLeft - track.offsetLeft - (track.clientWidth - card.offsetWidth) / 2

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.scrollLeft = target
      return
    }

    const start = track.scrollLeft
    const distance = target - start
    if (Math.abs(distance) < 1) return

    const startTime = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      // ease-out cubic — fast start, soft landing
      const ease = 1 - Math.pow(1 - t, 3)
      track.scrollLeft = start + distance * ease
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  // Keep the side gutters equal to (track − card) / 2 so the first and
  // last cards can sit dead-center. Without this, the first card sits
  // flush-left because scrollLeft can't go negative.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateGutter = () => {
      const firstCard = track.children[0] as HTMLElement | undefined
      if (!firstCard) return
      const gutter = Math.max(0, (track.clientWidth - firstCard.offsetWidth) / 2)
      track.style.setProperty('--gutter', `${gutter}px`)
    }

    updateGutter()
    const ro = new ResizeObserver(updateGutter)
    ro.observe(track)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let i = 0
    let intervalId: number | undefined
    const startAutoplay = () => {
      if (!mobileQuery.matches || intervalId !== undefined) return
      intervalId = window.setInterval(() => {
      if (isHoveredRef.current) return
      i = (i + 1) % PROBLEMS.length
      scrollToIndex(i)
      }, AUTOPLAY_MS)
    }
    const stopAutoplay = () => {
      if (intervalId === undefined) return
      window.clearInterval(intervalId)
      intervalId = undefined
    }
    const syncAutoplay = () => {
      stopAutoplay()
      startAutoplay()
    }

    startAutoplay()
    mobileQuery.addEventListener('change', syncAutoplay)

    return () => {
      stopAutoplay()
      mobileQuery.removeEventListener('change', syncAutoplay)
    }
  }, [])

  return (
    <section id="problems" className="bg-white py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading — single responsive layout, no PC/mobile branching */}
        <div className="flex flex-col items-center text-[#8d1216]">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold tracking-tight text-center">
            Bạn đang có kế hoạch
          </h2>

          <div className="flex items-center justify-center gap-2 md:gap-4 mt-2">
            <HeartArrow className="hidden md:block w-20 h-auto shrink-0" />
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold tracking-tight">
              Mời tiệc
            </h2>
          </div>

          <div className="flex items-baseline justify-center gap-2 md:gap-3 mt-2">
            <span className="font-signature italic font-bold text-[#e54153] text-7xl md:text-[5rem] leading-none">
              100
              <span className="text-4xl md:text-[3rem] align-super ml-1 md:ml-2 leading-none">+</span>
            </span>
            <span className="sr-only">Hơn 100 khách mời</span>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold tracking-tight">
              Khách
            </h2>
          </div>

          <HeartArrow className="md:hidden w-16 h-auto mt-2" />
        </div>

        <h3 className="text-center mt-4 text-[#e54153] uppercase tracking-wider text-base sm:text-lg font-semibold">
          Nhưng có nhiều vấn đề phải bận tâm?
        </h3>

        {/* Mobile carousel */}
        <div
          className="md:hidden overflow-hidden mt-2 py-6"
          onMouseEnter={() => { isHoveredRef.current = true }}
          onMouseLeave={() => { isHoveredRef.current = false }}
        >
          <div
            ref={trackRef}
            aria-label="Các vấn đề thường gặp"
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth gap-4
                       [scrollbar-width:none] [-ms-overflow-style:none]
                       [&::-webkit-scrollbar]:hidden
                       before:shrink-0 before:content-[''] before:basis-[var(--gutter,0px)]
                       after:shrink-0 after:content-[''] after:basis-[var(--gutter,0px)]"
          >
            {PROBLEMS.map(({ Icon, title, desc }) => (
              <div key={title} className="snap-center shrink-0 basis-[80%] sm:basis-[48%]">
                <ProblemCard Icon={Icon} title={title} desc={desc} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop cards — no slide or auto-scroll. */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
          {PROBLEMS.map(({ Icon, title, desc }) => (
            <ProblemCard key={title} Icon={Icon} title={title} desc={desc} />
          ))}
        </div>
      </div>
    </section>
  )
}
