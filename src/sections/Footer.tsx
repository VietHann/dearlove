import { Send, Facebook, Instagram, Sparkles, Linkedin, Youtube } from 'lucide-react'
import { FOOTER_SECTIONS, IMAGES } from '../lib/constants'

const SOCIAL_ICONS = [Facebook, Instagram, Sparkles, Linkedin, Youtube]
const TRUST_BADGES = ['✓ Hơn 500 mẫu thiệp', 'Tạo trong 60 giây']

/**
 * Site footer with newsletter signup, three link columns, and social row.
 */
export function Footer() {
  return (
    <footer className="bg-[#8d1216] px-5 py-12 text-white sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="flex items-center">
              <img src={IMAGES.logo} alt="Dearlove - Digital Invites" style={{ height: '88px', width: 'auto' }} className="object-contain" />
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
            {FOOTER_SECTIONS.map(([t, ...xs]) => (
              <div key={t}>
                <p className="mb-4 text-sm font-semibold text-[#f7c948]">{t}</p>
                <div className="grid gap-2.5">
                  {xs.map(x => <a className="text-sm text-white/65 transition hover:text-[#f7c948]" href="#" key={x}>{x}</a>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="my-8 border-t border-[#d9a441]/30"/>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex gap-2">
            {SOCIAL_ICONS.map((I, i) => (
              <a href="#" className="grid size-10 place-items-center rounded-full border border-[#d9a441]/40 text-white/75 transition hover:border-[#d9a441] hover:text-[#f7c948]" key={i}>
                <I size={17}/>
              </a>
            ))}
          </div>
          <div className="flex gap-3">
            {TRUST_BADGES.map(badge => (
              <span className="rounded-xl border border-[#d9a441]/40 px-4 py-2 text-xs text-white/85" key={badge}>{badge}</span>
            ))}
          </div>
        </div>
        <p className="mt-8 text-[11px] leading-5 text-white/50">
          Dearlove - Nền tảng tạo thiệp trực tuyến cho mọi dịp. Hơn 500 mẫu thiệp đẹp, tùy chỉnh dễ dàng, gửi nhanh chóng. © 2026 Dearlove Inc.
        </p>
      </div>
    </footer>
  )
}