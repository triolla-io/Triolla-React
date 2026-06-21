'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

/** Skews `ref` based on scroll velocity (deg). Apply to a wrapper element so it
 *  doesn't fight a CSS transform on the inner content. */
export function useScrollVelocity(ref: React.RefObject<HTMLElement | null>, maxSkew = 6) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const el = ref.current
        if (!el) return
        const setSkew = gsap.quickTo(el, 'skewX', { duration: 0.4, ease: 'power3' })
        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            setSkew(gsap.utils.clamp(-maxSkew, maxSkew, self.getVelocity() / -300))
          },
        })
        return () => st.kill()
      })
    },
    { scope: ref },
  )
}
