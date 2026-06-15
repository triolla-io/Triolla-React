'use client'

import { useState } from 'react'
import { m } from 'motion/react'
import { EASE } from '@/lib/motion'

const WP_IMAGES = [
  { src: 'https://triolla.io/wp-content/uploads/2025/06/2.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/1.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/medicak-ipad.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/3.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/final_watch6.svg', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/6.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/Front-cloean-1.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/88.png', alt: 'Portfolio work' },
  { src: 'https://triolla.io/wp-content/uploads/2025/06/White-1.png', alt: 'Portfolio work' },
]

const COL1 = [0, 3, 6]
const COL2 = [1, 4, 7]
const COL3 = [2, 5, 8]

function MasonryColumn({
  indices,
  delay,
  activeIdx,
  onTap,
}: {
  indices: number[]
  delay: number
  activeIdx: number | null
  onTap: (idx: number) => void
}) {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      {indices.map((idx, i) => {
        const img = WP_IMAGES[idx]
        const isActive = activeIdx === idx
        return (
          <m.div
            key={img.src}
            className="shine-card group overflow-hidden rounded-2xl relative bg-[#0f0f0f] cursor-pointer"
            style={{ aspectRatio: '4/3' }}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: delay + i * 0.1, ease: [...EASE.smooth] }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTap(idx)}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
            />
            {/* hover shine sweep (desktop) */}
            <div className="shine-card__shine" aria-hidden="true" />
            {/* tap-to-reveal overlay (touch) — visible when isActive */}
            <m.div
              className="absolute inset-0 flex items-end p-4"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 65%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-white font-semibold text-sm border-b-2 border-yellow-400 pb-0.5">
                View work
              </span>
            </m.div>
          </m.div>
        )
      })}
    </div>
  )
}

export function PortfolioGrid() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const handleTap = (idx: number) => {
    setActiveIdx(prev => (prev === idx ? null : idx))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
      <MasonryColumn indices={COL1} delay={0} activeIdx={activeIdx} onTap={handleTap} />
      <MasonryColumn indices={COL2} delay={0.08} activeIdx={activeIdx} onTap={handleTap} />
      <MasonryColumn indices={COL3} delay={0.16} activeIdx={activeIdx} onTap={handleTap} />
    </div>
  )
}
