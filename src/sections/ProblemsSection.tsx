import type { LucideIcon } from 'lucide-react'
import { Clock, MessageCircle, Users } from 'lucide-react'

interface Problem {
  Icon: LucideIcon
  title: string
  desc: string
}

const PROBLEMS: Problem[] = [
  { Icon: Clock,         title: 'Mất nhiều thời gian',     desc: 'để gửi tận tay tất cả thiệp mời' },
  { Icon: MessageCircle, title: 'Không đủ chia sẻ thành ý', desc: 'khi dùng tin nhắn và ảnh chụp thiệp' },
  { Icon: Users,         title: 'Không biết số khách mời tham dự', desc: 'một cách chính xác' },
]

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

function ProblemCard({ Icon, title, desc }: Problem) {
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

/**
 * ProblemsSection — "BẠN ĐANG CÓ KẾ HOẠCH MỜI TIỆC 100+ KHÁCH".
 *
 * Editorial intro that surfaces the friction of hosting a 100+ guest
 * event, with three problem cards underneath. Layout differs between
 * mobile and desktop breakpoints.
 */
export function ProblemsSection() {
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
          {PROBLEMS.map(({ Icon, title, desc }, i) => (
            <div key={title} style={{ animationDelay: `${i * 0.1}s` }}>
              <ProblemCard Icon={Icon} title={title} desc={desc} />
            </div>
          ))}
        </div>

        {/* Mobile cards horizontal scroller */}
        <div className="block md:hidden">
          <div className="problems-cards-scroll">
            {PROBLEMS.map(({ Icon, title, desc }) => (
              <ProblemCard key={title} Icon={Icon} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}