'use client'

import { useRef } from 'react'
import { wpImg } from '@/lib/images'
import { usePinnedScene } from '@/components/gsap/usePinnedScene'

export function ProductGalleryScene({
  images, dir, menu,
}: { images: string[]; dir: 'ltr' | 'rtl'; menu: React.ReactNode }) {
  const scene = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  usePinnedScene({
    trigger: scene,
    end: '+=200%',
    build: ({ timeline }) => {
      const t = track.current
      const r = rail.current
      if (!t || !r) return
      // The track is `width: max-content`, so its own scrollWidth === clientWidth.
      // Measure overflow against the visible rail width instead. Flip sign in RTL.
      const distance = t.scrollWidth - r.clientWidth
      if (distance <= 0) return
      const sign = dir === 'rtl' ? 1 : -1
      timeline.to(t, { x: sign * distance, ease: 'none' })
    },
  })

  return (
    <div ref={scene} className="svc-pgscene">
      <div ref={rail} className="svc-pgscene__rail">
        <div ref={track} className="svc-pgscene__track">
          {images.map((img, i) => (
            <div key={i} className="svc-pgscene__card" data-depth={i % 3}>
              <img src={wpImg(img) ?? ''} alt="" />
            </div>
          ))}
        </div>
      </div>
      <div className="svc-pgscene__menu">{menu}</div>
    </div>
  )
}
