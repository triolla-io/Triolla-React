'use client'

import { useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion, type MotionValue } from 'motion/react'

/**
 * Word-by-word scroll-scrubbed text reveal — the Outcrowd "We prove, design…"
 * effect. Each word's opacity + y is mapped to a slice of the element's scroll
 * progress, so the sentence "fills in" as the user scrolls through it and
 * reverses on scroll-up. Falls back to static text under prefers-reduced-motion.
 */

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const y = useTransform(progress, range, [14, 0])
  return (
    <m.span style={{ opacity, y, display: 'inline-block', willChange: 'opacity, transform' }}>
      {children}
    </m.span>
  )
}

interface ScrollRevealTextProps {
  text: string
  className?: string
  /** Fraction of the reveal window each word overlaps the next (0–1). */
  overlap?: number
}

export function ScrollRevealText({ text, className = '', overlap = 0.55 }: ScrollRevealTextProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  })

  if (reduce) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    )
  }

  const words = text.split(' ')
  const step = 1 / words.length

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i * step
        const end = Math.min(1, start + step * (1 + overlap))
        return (
          <span key={i}>
            <Word progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>{' '}
          </span>
        )
      })}
    </p>
  )
}
