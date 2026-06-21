'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

export function BrandingMenuPin({ sectionSelector, children }: { sectionSelector: string; children: React.ReactNode }) {
  const menu = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const section = document.querySelector<HTMLElement>(sectionSelector)
        const el = menu.current
        if (!section || !el) return
        const st = ScrollTrigger.create({
          trigger: section, start: 'top 96px', end: 'bottom bottom',
          pin: el, pinSpacing: false, anticipatePin: 1,
        })
        return () => st.kill()
      })
    },
    { scope: menu },
  )
  return <div ref={menu} className="svc-brand__menu">{children}</div>
}
