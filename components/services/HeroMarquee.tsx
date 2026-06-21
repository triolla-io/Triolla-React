'use client'

import { useRef } from 'react'
import { Marquee } from '@/components/ui'
import { useScrollVelocity } from '@/components/gsap/useScrollVelocity'

export function HeroMarquee({ items }: { items: string[] }) {
  const wrap = useRef<HTMLDivElement>(null)
  useScrollVelocity(wrap, 5)
  return (
    <div ref={wrap} style={{ willChange: 'transform' }}>
      <Marquee
        items={items}
        repeat={4}
        speed={44}
        renderItem={(cat, i) => (
          <span key={i} className="svc-hero__strip-item">
            {cat}
            <span className="svc-hero__strip-dot">✦</span>
          </span>
        )}
      />
    </div>
  )
}
