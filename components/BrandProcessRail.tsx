'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

/** Pins the process rail beside the scrolling content (replaces CSS sticky,
 *  which breaks under ScrollSmoother). Desktop+motion only; below lg the rail
 *  is in normal flow. The trigger section is resolved by selector since the
 *  page is a Server Component and owns the grid container. */
export function BrandProcessRail({
  sectionSelector,
  children,
}: {
  sectionSelector: string
  children: React.ReactNode
}) {
  const rail = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const section = document.querySelector<HTMLElement>(sectionSelector)
        const el = rail.current
        if (!section || !el) return
        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top 120px',
          end: 'bottom bottom',
          pin: el,
          pinSpacing: false,
          anticipatePin: 1,
        })
        return () => st.kill()
      })
    },
    { scope: rail },
  )
  return (
    <div ref={rail} className="brand-process__rail">
      {children}
    </div>
  )
}
