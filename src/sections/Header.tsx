import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, UserRound, X } from 'lucide-react'
import { DarkButton } from '../components/ui/DarkButton'
import { GradientButton } from '../components/ui/GradientButton'
import { IMAGES, NAV_LINKS } from '../lib/constants'

/**
 * Header — sticky top nav with scroll-aware morphing shape.
 *
 * The nav bar flattens into a floating pill when the page scrolls past 24px,
 * driven by a single `scrolled` flag. Mobile menu uses a local toggle so
 * the parent (App.tsx) doesn't need to know about it.
 */
export function Header() {
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
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
          {NAV_LINKS.map(x => (
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
              {NAV_LINKS.map(x => (
                <a className="rounded-xl px-3 py-3 font-medium text-[#7c3f06] transition-colors hover:bg-[#fdf2e3]" href="#templates" key={x}>{x}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}