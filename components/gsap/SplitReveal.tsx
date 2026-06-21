'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

interface SplitRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'p'
  type?: 'lines' | 'words' | 'chars'
  className?: string
  style?: React.CSSProperties
  delay?: number
  duration?: number
  stagger?: number
}

export function SplitReveal({
  text, as = 'h1', type = 'lines', className, style,
  delay = 0, duration = 0.9, stagger = 0.12,
}: SplitRevealProps) {
  // Typed as HTMLElement (not a union) and rendered through a dynamic JSX tag so
  // the ref type-checks cleanly for h1/h2/p alike. (Dynamic tag via JSX rather
  // than createElement so react-hooks/refs doesn't flag passing the ref as a
  // function argument.)
  const ref = useRef<HTMLElement>(null)
  const Tag = as as React.ElementType

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const el = ref.current
        if (!el) return
        let split: SplitText | null = null
        let cancelled = false
        const run = () => {
          if (cancelled) return
          split = new SplitText(el, { type, mask: type === 'lines' ? 'lines' : undefined })
          gsap.set(el, { autoAlpha: 1 })
          gsap.from(split[type], { yPercent: 110, duration, delay, ease: 'smooth', stagger })
        }
        // Split after fonts are ready (final line breaks), but cap the wait so the
        // LCP headline is never hidden longer than ~150ms beyond hydration.
        if (document.fonts?.status === 'loaded') run()
        else Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 150))]).then(run)
        return () => { cancelled = true; split?.revert() }
      })
    },
    { scope: ref, dependencies: [text] },
  )

  return (
    <Tag ref={ref} className={className} style={style} data-reveal="">
      {text}
    </Tag>
  )
}
