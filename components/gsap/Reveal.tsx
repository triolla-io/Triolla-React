'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

interface RevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  yOffset?: number
  /** When set, animates direct children with this stagger (seconds). */
  stagger?: number
  /** Host element to render (default 'div'). Use 'ul'/'ol' to keep list markup
   *  valid while still staggering the direct `<li>` children. */
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
  once?: boolean
  /** Tie the reveal to scroll progress instead of firing once — the block
   *  fades/rises in as you scroll through it (Outcrowd-style). `true` ≈ scrub 1.
   *  Best for long-form text; grids read better as a once-fire cascade. */
  scrub?: boolean | number
}

export function Reveal({
  children, delay = 0, duration = 0.7, yOffset = 40, stagger,
  as = 'div', className, style, once = true, scrub,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const Tag = as as React.ElementType
  const isStagger = stagger != null

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const root = ref.current as HTMLElement
        const targets: gsap.TweenTarget = isStagger ? root.children : root
        const tween = gsap.fromTo(
          targets,
          { autoAlpha: 0, y: yOffset },
          {
            autoAlpha: 1, y: 0, duration, delay, ease: 'smooth',
            stagger: stagger ?? 0,
            scrollTrigger: scrub != null
              ? { trigger: root, start: 'top 88%', end: 'top 42%', scrub: scrub === true ? 1 : scrub }
              : { trigger: root, start: 'top 85%', once },
          },
        )
        return () => tween.scrollTrigger?.kill()
      })
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className} style={style} {...(isStagger ? { 'data-reveal-stagger': '' } : { 'data-reveal': '' })}>
      {children}
    </Tag>
  )
}
