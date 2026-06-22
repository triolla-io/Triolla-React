'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { wpImg } from '@/lib/images'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

/* Per-tile entrance tilt (deg) so the wall assembles hand-laid, not rigid. */
const ENTER_ROT = [-5, 4, -3, 5.5, -4, 3, -6, 4.5, -2]
/* Max cursor lean (deg) for the 3D magnetic hover. */
const TILT = 10

/**
 * Product Design signature: every product shot laid out in one editorial mosaic —
 * all visible at once, no scroll-scrub. Each tile pops up from below with a springy
 * overshoot as it enters view: on desktop the whole wall assembles in a tight
 * cascade; on a tall phone each shot reveals as you reach it. Once a tile lands it
 * leans toward the cursor in 3D and springs back (fine-pointer only).
 *
 * Motion-gated (Q_MOTION); reduced-motion / no-JS users get the static composition
 * — the `[data-reveal]` opacity gate only engages under `html.gsap`. The desktop
 * collage reflows to a clean grid on phones via CSS, so the same markup serves
 * every breakpoint with no separate mobile rendering to fall out of sync.
 *
 * Perf notes: transforms use scaleX/scaleY (never the `scale` shorthand, which GSAP
 * can't reset cleanly under quickTo), and 3D perspective is applied only while a
 * tile is hovered — so a normal scroll past the section composites no 3D contexts.
 */
export function ProductMosaic({ images }: { images: string[] }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const el = root.current
        if (!el) return
        const tiles = gsap.utils.toArray<HTMLElement>(el.querySelectorAll('[data-reveal]'))
        if (!tiles.length) return

        // ── Entrance: each shot pops into place as it enters view ──
        const reveals = tiles.map((tile, i) =>
          gsap.fromTo(
            tile,
            { autoAlpha: 0, yPercent: 28, scaleX: 0.86, scaleY: 0.86, rotate: ENTER_ROT[i % ENTER_ROT.length] },
            {
              autoAlpha: 1,
              yPercent: 0,
              scaleX: 1,
              scaleY: 1,
              rotate: 0,
              ease: 'back',
              duration: 0.85,
              scrollTrigger: { trigger: tile, start: 'top 90%', once: true },
            },
          ),
        )

        // ── Magnetic 3D tilt — fine pointer only; touch keeps the clean deck ──
        const cleanups: Array<() => void> = []
        if (window.matchMedia('(pointer: fine)').matches) {
          tiles.forEach((tile) => {
            // 'smooth' (ease-out, no overshoot) tracks the cursor fluidly; 'back'
            // would wobble on every pointermove.
            const rx = gsap.quickTo(tile, 'rotationX', { duration: 0.5, ease: 'smooth' })
            const ry = gsap.quickTo(tile, 'rotationY', { duration: 0.5, ease: 'smooth' })
            const sx = gsap.quickTo(tile, 'scaleX', { duration: 0.5, ease: 'smooth' })
            const sy = gsap.quickTo(tile, 'scaleY', { duration: 0.5, ease: 'smooth' })
            // Cache the rect per-hover: a transform doesn't move the layout box,
            // so re-reading it every pointermove is wasted work.
            let rect: DOMRect | null = null
            const onEnter = () => {
              rect = tile.getBoundingClientRect()
              // Perspective only while hovered — no persistent 3D contexts to
              // composite during scroll (keeps the wall light as you pass it).
              gsap.set(tile, { zIndex: 6, transformPerspective: 900 })
              sx(1.045)
              sy(1.045)
            }
            const onMove = (e: PointerEvent) => {
              if (!rect) rect = tile.getBoundingClientRect()
              const px = (e.clientX - rect.left) / rect.width - 0.5
              const py = (e.clientY - rect.top) / rect.height - 0.5
              ry(px * TILT)
              rx(-py * TILT)
            }
            const onLeave = () => {
              rect = null
              rx(0)
              ry(0)
              sx(1)
              sy(1)
              gsap.set(tile, { zIndex: 'auto' })
            }
            tile.addEventListener('pointerenter', onEnter)
            tile.addEventListener('pointermove', onMove)
            tile.addEventListener('pointerleave', onLeave)
            cleanups.push(() => {
              tile.removeEventListener('pointerenter', onEnter)
              tile.removeEventListener('pointermove', onMove)
              tile.removeEventListener('pointerleave', onLeave)
            })
          })
        }

        return () => {
          reveals.forEach((t) => {
            t.scrollTrigger?.kill()
            t.kill()
          })
          cleanups.forEach((fn) => fn())
        }
      })
    },
    { scope: root },
  )

  if (!images.length) return null

  return (
    <div ref={root} className="svc-prod__gallery">
      {images[0] && (
        <div className="svc-img-card svc-img-card--featured" data-reveal="">
          <img src={wpImg(images[0]) ?? ''} alt="" className="svc-img-card__img" />
          <div className="svc-img-card__shine" aria-hidden="true" />
          <span className="svc-img-card__badge">UI Design</span>
        </div>
      )}
      {(images[1] || images[2]) && (
        <div className="svc-prod__row">
          {images[1] && (
            <div className="svc-img-card" style={{ flex: '2' }} data-reveal="">
              <img src={wpImg(images[1]) ?? ''} alt="" className="svc-img-card__img" />
              <div className="svc-img-card__shine" aria-hidden="true" />
            </div>
          )}
          {images[2] && (
            <div className="svc-img-card svc-img-card--offset" style={{ flex: '3' }} data-reveal="">
              <img src={wpImg(images[2]) ?? ''} alt="" className="svc-img-card__img" />
              <div className="svc-img-card__shine" aria-hidden="true" />
            </div>
          )}
        </div>
      )}
      {(images[3] || images[4] || images[5]) && (
        <div className="svc-prod__row">
          {[images[3], images[4], images[5]].filter(Boolean).map((img, i) => (
            <div key={i} className={`svc-img-card${i === 1 ? ' svc-img-card--up' : ''}`} style={{ flex: '1' }} data-reveal="">
              <img src={wpImg(img) ?? ''} alt="" className="svc-img-card__img" />
              <div className="svc-img-card__shine" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}
      {(images[6] || images[7] || images[8]) && (
        <div className="svc-prod__icons">
          {[images[6], images[7], images[8]].filter(Boolean).map((img, i) => (
            <div key={i} className="svc-img-icon" data-reveal="">
              <img src={wpImg(img) ?? ''} alt="" className="svc-img-icon__img" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
