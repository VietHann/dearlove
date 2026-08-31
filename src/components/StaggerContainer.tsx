/**
 * StaggerContainer — animates direct children one after another when scrolled into view.
 *
 * Props:
 *   staggerDelay  — seconds between each child animation (default 0.09)
 *   duration      — each child's animation duration in seconds (default 0.6)
 *   direction     — 'up' | 'scale' (default 'up')
 *   threshold     — viewport threshold to trigger (default 0.15)
 *   className
 *   style
 *   children      — should be direct React children (not wrapped in arrays)
 *
 * Honours prefers-reduced-motion (renders children instantly without animation).
 */
import { useRef, Children, cloneElement, isValidElement, ReactElement } from 'react'
import { motion, useInView } from 'framer-motion'

interface StaggerContainerProps {
  staggerDelay?: number
  duration?: number
  direction?: 'up' | 'scale'
  threshold?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function StaggerContainer({
  staggerDelay = 0.09,
  duration = 0.6,
  direction = 'up',
  threshold = 0.15,
  className,
  style,
  children,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  const reduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const variants = {
    hidden: direction === 'scale'
      ? { opacity: 0, scale: 0.88 }
      : { opacity: 0, y: 36 },
    visible: (i: number) => ({
      opacity: 1,
      scale: direction === 'scale' ? 1 : undefined,
      y: direction === 'up' ? 0 : undefined,
      transition: {
        duration,
        delay: i * staggerDelay,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    }),
  }

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
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
      style={style}
    >
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        return (
          <motion.div
            key={(child as ReactElement).key ?? i}
            custom={i}
            variants={variants}
          >
            {child}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
