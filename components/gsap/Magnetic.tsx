'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

interface MagneticProps {
  children: React.ReactNode
  /** Pull strength as a fraction of the cursor's offset from centre. */
  strength?: number
  className?: string
}

/**
 * Outcrowd-style magnetic hover: the wrapped element leans toward the cursor and
 * springs back on leave. Also feeds the cursor position to a child `.btn__ink`
 * (via --ex/--ey) so the explode ink-fill grows from the pointer.
 *
 * Pointer + desktop + motion only (Q_DESKTOP). On touch / reduced-motion it is a
 * plain inline-flex wrapper, so the child stays fully interactive and visible.
 */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const el = ref.current
        const target = el?.firstElementChild as HTMLElement | null
        if (!el || !target) return
        // Magnetic pull is a fine-pointer affordance only.
        if (!window.matchMedia('(pointer: fine)').matches) return

        const xTo = gsap.quickTo(target, 'x', { duration: 0.5, ease: 'back' })
        const yTo = gsap.quickTo(target, 'y', { duration: 0.5, ease: 'back' })

        // Cache the wrapper rect per-hover: translating the child doesn't change
        // the wrapper's layout box, so re-reading it every move is wasted work.
        let rect: DOMRect | null = null
        const onEnter = () => {
          rect = el.getBoundingClientRect()
        }
        const onMove = (e: PointerEvent) => {
          if (!rect) rect = el.getBoundingClientRect()
          const relX = e.clientX - rect.left
          const relY = e.clientY - rect.top
          xTo((relX - rect.width / 2) * strength)
          yTo((relY - rect.height / 2) * strength)
          // Origin for the explode ink (no-op when the child has no .btn__ink).
          target.style.setProperty('--ex', `${relX}px`)
          target.style.setProperty('--ey', `${relY}px`)
        }
        const onLeave = () => {
          rect = null
          xTo(0)
          yTo(0)
        }

        el.addEventListener('pointerenter', onEnter)
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        return () => {
          el.removeEventListener('pointerenter', onEnter)
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerleave', onLeave)
          gsap.set(target, { x: 0, y: 0 })
        }
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={`magnetic${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
}
