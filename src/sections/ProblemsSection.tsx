import { ScrollReveal } from '../components'

const PROBLEMS = [
  {
    number: '01',
    title: 'Gửi từng lời mời',
    description: 'Nhắn tin, gửi ảnh và cập nhật thông tin cho từng vị khách có thể mất hàng giờ.',
  },
  {
    number: '02',
    title: 'Khó truyền tải trọn vẹn',
    description: 'Một ảnh chụp thiệp hay vài dòng tin nhắn đôi khi chưa đủ để kể câu chuyện của hai người.',
  },
  {
    number: '03',
    title: 'Khó theo dõi phản hồi',
    description: 'Ai sẽ tham dự, đi cùng bao nhiêu người hay có thay đổi nào — mọi thứ dễ trở nên rời rạc.',
  },
] as const

/**
 * Editorial problem statement that bridges the cinematic hero and the
 * practical value of Dearlove without using sales-card patterns.
 */
export function ProblemsSection() {
  return (
    <section
      id="problems"
      aria-labelledby="problems-title"
      className="relative z-10 overflow-hidden border-t px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
      style={{
        background: 'linear-gradient(180deg, #f4eee6 0%, #faf7f2 52%, #f7f1ea 100%)',
        borderTopColor: 'rgba(80, 64, 55, 0.12)',
      }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
        <ScrollReveal direction="left" distance={18} duration={0.75}>
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#a87870] sm:text-xs">
              Because every detail matters
            </p>
            <h2
              id="problems-title"
              className="mt-6 max-w-lg font-display text-[clamp(2.55rem,5vw,4.7rem)] font-semibold leading-[.98] tracking-[-.045em] text-[#322b27]"
            >
              Một ngày đặc biệt,
              <br />
              không nên bắt đầu bằng{' '}
              <span className="italic text-[#a87870]">những điều phải lo.</span>
            </h2>
            <p className="mt-7 max-w-md text-base leading-8 text-[#7d746d] sm:text-lg">
              Từ việc gửi từng lời mời, theo dõi phản hồi đến cập nhật thông tin cho khách — những việc nhỏ đôi khi lại chiếm nhiều thời gian hơn bạn nghĩ.
            </p>
          </div>
        </ScrollReveal>

        <ol className="m-0 list-none p-0">
          {PROBLEMS.map((problem, index) => (
            <li
              key={problem.number}
              className="border-t border-[rgba(80,64,55,0.12)] last:border-b"
            >
              <ScrollReveal direction="up" delay={index * 0.08} distance={18} duration={0.75}>
                <article className="group py-8 sm:py-10 lg:py-11">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <span className="font-display text-2xl italic leading-none tracking-[-.04em] text-[#c5aa86] sm:text-3xl">
                      {problem.number}
                    </span>
                    <span className="h-px flex-1 bg-[rgba(80,64,55,0.12)] transition-colors duration-700 group-hover:bg-[#c5aa86]/55" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold leading-tight tracking-[-.025em] text-[#322b27] transition-colors duration-700 group-hover:text-[#a87870] sm:text-3xl lg:text-[2.15rem]">
                    {problem.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#7d746d] transition-colors duration-700 group-hover:text-[#625952] sm:text-base sm:leading-8">
                    {problem.description}
                  </p>
                </article>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
