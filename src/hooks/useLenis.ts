/**
 * useLenis — Lenis smooth scroll integration with Framer Motion.
 *
 * Sets up Lenis as the global smooth-scroll engine and connects it to
 * Framer Motion's `useAnimationFrame` so Framer Motion reads scroll position
 * from Lenis (not the native RAF) for jitter-free sync.
 *
 * Usage:
 *   const lenis = useLenis()
 *   useFrame(() => lenis?.raf(performance.now()))
 */
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Honour prefers-reduced-motion: skip smooth scroll
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    lenisRef.current = lenis

    /**
     * Stop native smooth-scroll — Lenis handles it.
     * Keep this CSS so anchor links jump when Lenis is not active
     * (e.g. during SSR or reduced-motion).
     */
    document.documentElement.style.scrollBehavior = 'auto'

    // Expose lenis on window so other parts can call lenis.scrollTo(...)
    ;(window as any).__lenis = lenis

    return () => {
      lenis.destroy()
      lenisRef.current = null
      delete (window as any).__lenis
      document.documentElement.style.scrollBehavior = 'smooth'
    }
  }, [])

  return lenisRef.current
}
