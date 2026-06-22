'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { wpImg } from '@/lib/images'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

/** Resting tilt per polaroid (deg) — MUST match the CSS nth-child rotations the
 *  reduced-motion / no-JS path relies on. GSAP settles each frame into this angle
 *  from flat, so the deck looks hand-laid as it cascades in. */
const REST_ROT = [-2.5, 1.8, -1.2, 2.1, -0.9, 1.5]

/**
 * Branding gallery: a staggered "parade" of polaroids that rise, fade and settle
 * into their resting tilt (Outcrowd tile-cascade). The slide/fade lives on the
 * wrapper (so it survives the mobile `transform:none` reset on the frame and
 * carries the html.gsap reveal gate); the tilt-settle lives on the frame
 * (desktop only — mobile flattens it). Motion-gated via Q_MOTION; reduced-motion
 * / no-JS users get the frames at their CSS resting rotation with no animation.
 */
export function BrandingPolaroids({ images }: { images: string[] }) {
  const grid = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const root = grid.current
        if (!root) return
        const wraps = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.svc-polaroid'))
        const frames = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.svc-polaroid__frame'))
        if (!wraps.length) return

        const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 85%', once: true } })
        // Wrapper: slide + fade (releases the reveal gate; survives the mobile
        // frame `transform:none` reset).
        tl.fromTo(
          wraps,
          { autoAlpha: 0, yPercent: 16 },
          { autoAlpha: 1, yPercent: 0, ease: 'smooth', duration: 0.8, stagger: 0.13 },
          0,
        )
        // Frame: settle into the resting tilt (desktop; mobile flattens via CSS).
        tl.fromTo(
          frames,
          { rotate: 0, scale: 0.92 },
          {
            rotate: (i: number) => REST_ROT[i % REST_ROT.length],
            scale: 1,
            ease: 'smooth',
            duration: 0.8,
            stagger: 0.13,
            // Re-enable the frame's transform transition only after the deal, so
            // the hover-straighten is smooth without the entrance double-smoothing.
            onComplete: () => frames.forEach((f) => f.classList.add('is-settled')),
          },
          0,
        )
        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })
    },
    { scope: grid },
  )

  if (!images.length) return null

  return (
    <div ref={grid} className="svc-polaroid-grid">
      {images.map((img, i) => (
        <div key={i} className="svc-polaroid" data-reveal="">
          <div className="svc-polaroid__frame">
            <img src={wpImg(img) ?? ''} alt="" className="svc-polaroid__img" />
          </div>
        </div>
      ))}
    </div>
  )
}
