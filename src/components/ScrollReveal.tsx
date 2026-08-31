/**
 * ScrollReveal — wraps Framer Motion while respecting prefers-reduced-motion.
 *
 * Props:
 *   direction    — 'up' | 'down' | 'left' | 'right' | 'scale'  (default 'up')
 *   delay       — seconds before animation starts (default 0)
 *   duration    — animation duration in seconds (default 0.7)
 *   threshold   — 0-1, how much of the element is visible before triggering (default 0.15)
 *   distance    — how far the element travels in px (default 36)
 *   className   — forwarded to the motion.div
 *   children    — content
 *
 * Falls back to plain div (no animation) when prefers-reduced-motion is set.
 */
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface ScrollRevealProps {
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
  delay?: number
  duration?: number
  threshold?: number
  distance?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const getInitial = (direction: string, distance: number) => {
  switch (direction) {
    case 'up':      return { opacity: 0, y: distance }
    case 'down':    return { opacity: 0, y: -distance }
    case 'left':    return { opacity: 0, x: distance }
    case 'right':   return { opacity: 0, x: -distance }
    case 'scale':   return { opacity: 0, scale: 0.88 }
    default:        return { opacity: 0, y: distance }
  }
}

const getAnimate = () => ({ opacity: 1, x: 0, y: 0, scale: 1 })

export function ScrollReveal({
  direction = 'up',
  delay = 0,
  duration = 0.7,
  threshold = 0.15,
  distance = 36,
  className,
  style,
  children,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  const reduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  if (reduced) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitial(direction, distance)}
      animate={isInView ? getAnimate() : getInitial(direction, distance)}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // ease-out quart
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
