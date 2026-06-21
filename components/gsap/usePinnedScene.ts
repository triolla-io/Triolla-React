'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

interface PinnedSceneOptions {
  trigger: React.RefObject<HTMLElement | null>
  /** Build the scrubbed timeline. Runs inside matchMedia (auto-cleaned). */
  build: (ctx: { timeline: gsap.core.Timeline }) => void
  /** ScrollTrigger end. Default '+=150%' (pins for ~1.5 viewports). */
  end?: string
  scrub?: number | boolean
}

export function usePinnedScene({ trigger, build, end = '+=150%', scrub = 1 }: PinnedSceneOptions) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const el = trigger.current
        if (!el) return
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top top', end, pin: true, scrub, anticipatePin: 1 },
        })
        build({ timeline: tl })
        return () => { tl.scrollTrigger?.kill(); tl.kill() }
      })
    },
    { scope: trigger },
  )
}
