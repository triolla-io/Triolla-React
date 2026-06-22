'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { wpImg } from '@/lib/images'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

/** Resting fan angles for the three cards (deg). Mirrored in CSS for the
 *  reduced-motion / no-JS static view so the cluster looks designed either way. */
const ROT = [-5, 5, -8]

/**
 * Hero proof-of-work cluster: a fanned stack of real product UI shots that
 * animates in on load (rise + settle with a soft overshoot) so the hero leads
 * with the work instead of a wall of copy. Decorative — `aria-hidden`.
 * Reduced motion / no-JS: cards are shown statically in their fanned positions.
 */
export function HeroShowcase({ images }: { images: string[] }) {
  const root = useRef<HTMLDivElement>(null)
  const cards = images.slice(0, 3)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const root_ = root.current
        if (!root_) return
        const els = root_.querySelectorAll<HTMLElement>('.hs-card')
        if (!els.length) return
        gsap.set(root_, { autoAlpha: 1 })
        const tl = gsap.timeline({ delay: 0.3 })
        els.forEach((el, i) => {
          tl.fromTo(
            el,
            { autoAlpha: 0, yPercent: 28, scale: 0.85, rotate: 0 },
            { autoAlpha: 1, yPercent: 0, scale: 1, rotate: ROT[i] ?? 0, duration: 1.05, ease: 'bounce' },
            i * 0.13,
          )
        })
        return () => tl.kill()
      })
    },
    { scope: root },
  )

  if (!cards.length) return null

  return (
    <div ref={root} className="svc-hero__showcase" data-reveal="" aria-hidden="true">
      <div className="hs-glow" />
      {cards.map((img, i) => (
        <div key={i} className={`hs-card hs-card--${['a', 'b', 'c'][i]}`}>
          <div className="hs-card__frame">
            <img src={wpImg(img) ?? ''} alt="" />
            <span className="hs-card__shine" />
          </div>
        </div>
      ))}
    </div>
  )
}
