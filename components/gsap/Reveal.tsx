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
  className?: string
  style?: React.CSSProperties
  once?: boolean
}

export function Reveal({
  children, delay = 0, duration = 0.7, yOffset = 40, stagger,
  className, style, once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
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
            scrollTrigger: { trigger: root, start: 'top 85%', once },
          },
        )
        return () => tween.scrollTrigger?.kill()
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className} style={style} {...(isStagger ? { 'data-reveal-stagger': '' } : { 'data-reveal': '' })}>
      {children}
    </div>
  )
}
