'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { registerGsap, Q_DESKTOP, SMOOTH_AMOUNT } from '@/lib/gsap'

registerGsap()

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Smoother created ONLY on desktop + no-preference. On mobile/reduced-motion
      // the wrapper/content are plain block divs and native scrolling is used.
      mm.add(Q_DESKTOP, () => {
        const smoother = ScrollSmoother.create({
          wrapper: wrapper.current as HTMLElement,
          content: content.current as HTMLElement,
          smooth: SMOOTH_AMOUNT,
          effects: true,
          normalizeScroll: true,
        })
        return () => smoother.kill()
      })
    },
    { scope: wrapper },
  )

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  )
}
