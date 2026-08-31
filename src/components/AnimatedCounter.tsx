/**
 * AnimatedCounter — counts from 0 to a target value when scrolled into view.
 *
 * Props:
 *   to           — target number to count up to (default 100)
 *   duration     — total animation duration in seconds (default 2.0)
 *   suffix       — appended after the number, e.g. '+' or 'k' (default '+')
 *   prefix       — prepended before the number (default '')
 *   decimals     — decimal places (default 0)
 *   className
 *   style
 *
 * Honours prefers-reduced-motion (renders the final number immediately).
 */
import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  to?: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
  style?: React.CSSProperties
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

export function AnimatedCounter({
  to = 100,
  duration = 2.0,
  suffix = '+',
  prefix = '',
  decimals = 0,
  className,
  style,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  const reduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    if (reduced) {
      setCount(to)
      hasAnimated.current = true
      return
    }

    hasAnimated.current = true
    const start = performance.now()
    const end = start + duration * 1000

    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const easedProgress = easeOutQuart(progress)
      setCount(parseFloat((easedProgress * to).toFixed(decimals)))
      if (now < end) requestAnimationFrame(tick)
      else setCount(to)
    }

    requestAnimationFrame(tick)
  }, [isInView, to, duration, decimals, reduced])

  return (
    <motion.span
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {prefix}{reduced ? to.toFixed(decimals) : count.toFixed(decimals)}{suffix}
    </motion.span>
  )
}
