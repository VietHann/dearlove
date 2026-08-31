/**
 * ParallaxPetals — floating wedding petals with Framer Motion parallax.
 *
 * Uses Framer Motion's useScroll + useTransform to create a smooth
 * parallax drift effect as the user scrolls. Falls back to static
 * render when prefers-reduced-motion is active.
 *
 * Props:
 *   count  — number of petal elements (default 8)
 *   className
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface PetalProps {
  left: string
  size: number
  delay: number
  duration: number
  color: string
  parallaxStrength?: number
}

function Petal({ left, size, delay, duration, color, parallaxStrength = 60 }: PetalProps) {
  const ref = useRef<HTMLDivElement>(null)

  const reduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [parallaxStrength, -parallaxStrength])

  const drift = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['0deg', '8deg', '0deg', '-8deg', '0deg']
  )

  if (reduced) {
    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: 0,
          left,
          width: size,
          height: size,
          background: color,
          borderRadius: '60% 40% 60% 40%',
          opacity: 0.7,
        }}
      />
    )
  }

  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left,
        width: size,
        height: size,
        y,
        rotate: drift,
        background: color,
        borderRadius: '60% 40% 60% 40%',
        opacity: 0.7,
        filter: 'blur(.3px)',
      }}
      animate={{
        y: [0, -18, 0],
        rotate: [0, 6, 0, -6, 0],
      }}
      transition={{
        y: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
      }}
    />
  )
}

const PETALS: PetalProps[] = [
  { left: '6%',  size: 14, delay: 0,    duration: 5,  color: '#d9a441', parallaxStrength: 50 },
  { left: '22%', size: 10, delay: 0.7,  duration: 6,  color: '#f7c948', parallaxStrength: 70 },
  { left: '38%', size: 16, delay: 1.2,  duration: 5.5,color: '#d9a441', parallaxStrength: 45 },
  { left: '52%', size: 12, delay: 0.3,  duration: 7,  color: '#f7c948', parallaxStrength: 80 },
  { left: '68%', size: 14, delay: 1.8,  duration: 6,  color: '#8d1216', parallaxStrength: 55 },
  { left: '80%', size: 10, delay: 0.5,  duration: 5,  color: '#e0a422', parallaxStrength: 65 },
  { left: '89%', size: 14, delay: 2.1,  duration: 6.5,color: '#f7c948', parallaxStrength: 75 },
  { left: '95%', size: 12, delay: 1.5,  duration: 5.5,color: '#d9a441', parallaxStrength: 60 },
]

export function ParallaxPetals() {
  const reduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {PETALS.map((petal, i) =>
        reduced ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: petal.left,
              width: petal.size,
              height: petal.size,
              background: petal.color,
              borderRadius: '60% 40% 60% 40%',
              opacity: 0.7,
              filter: 'blur(.3px)',
            }}
          />
        ) : (
          <Petal key={i} {...petal} />
        )
      )}
    </div>
  )
}
