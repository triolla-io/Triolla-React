'use client'

import { useState } from 'react'
import { m } from 'motion/react'
import { EASE } from '@/lib/motion'
import { wpImg } from '@/lib/images'

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

/*
  Varied aspect ratios create visual rhythm across the 3-column masonry.
  The staggered heights break the "grid of identical cards" feel.

  Desktop (3 cols):          Mobile (2 cols):
  Col 1: tall, portrait, wide  Col A: wide, square, portrait
  Col 2: wide, square, portrait Col B: tall, portrait, wide
  Col 3: square, wide, tall
*/
const SLOTS: { ratio: string; mobileRatio: string; delay: number }[] = [
  { ratio: 'aspect-[4/5]',  mobileRatio: 'aspect-[4/3]',  delay: 0     }, // tall portrait
  { ratio: 'aspect-[16/9]', mobileRatio: 'aspect-[4/5]',  delay: 0.08  }, // wide landscape
  { ratio: 'aspect-square', mobileRatio: 'aspect-[16/9]', delay: 0.04  }, // square
  { ratio: 'aspect-[4/3]',  mobileRatio: 'aspect-[4/5]',  delay: 0.12  }, // standard
  { ratio: 'aspect-square', mobileRatio: 'aspect-square',  delay: 0.18  }, // square
  { ratio: 'aspect-[16/9]', mobileRatio: 'aspect-[4/3]',  delay: 0.14  }, // wide
  { ratio: 'aspect-[16/9]', mobileRatio: 'aspect-[16/9]', delay: 0.2   }, // wide
  { ratio: 'aspect-[4/3]',  mobileRatio: 'aspect-[4/3]',  delay: 0.26  }, // standard
  { ratio: 'aspect-[4/5]',  mobileRatio: 'aspect-[4/5]',  delay: 0.22  }, // tall
]

// Desktop: split into 3 masonry columns
const COL_INDICES = [[0, 3, 6], [1, 4, 7], [2, 5, 8]]

function Card({
  img,
  idx,
  isActive,
  onTap,
  ratio,
  delay,
}: {
  img: { src: string; alt: string }
  idx: number
  isActive: boolean
  onTap: () => void
  ratio: string
  delay: number
}) {
  return (
    <m.div
      className="shine-card group overflow-hidden rounded-xl md:rounded-2xl relative bg-[#0f0f0f] cursor-pointer"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.72, delay, ease: [...EASE.smooth] }}
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
    >
      <div className={`relative w-full ${ratio}`}>
        <img
          src={wpImg(img.src) ?? ''}
          alt={img.alt}
          className="absolute inset-0 w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
        />
        {/* shine sweep */}
        <div className="shine-card__shine" aria-hidden="true" />
        {/* tap-to-reveal */}
        <m.div
          className="absolute inset-0 flex items-end p-3 md:p-4"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 60%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.22 }}
        >
          <span className="text-white font-semibold text-xs md:text-sm border-b-2 border-yellow-400 pb-0.5">
            View work
          </span>
        </m.div>
      </div>
    </m.div>
  )
}

export function PortfolioGrid() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const toggle = (idx: number) => setActiveIdx((prev) => (prev === idx ? null : idx))

  return (
    <>
      {/* ── Mobile: 2-column flat grid ── */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {WP_IMAGES.map((img, idx) => {
          const slot = SLOTS[idx]
          return (
            <Card
              key={img.src}
              img={img}
              idx={idx}
              isActive={activeIdx === idx}
              onTap={() => toggle(idx)}
              ratio={slot.mobileRatio}
              delay={slot.delay}
            />
          )
        })}
      </div>

      {/* ── Desktop: 3-column masonry ── */}
      <div className="hidden md:grid grid-cols-3 gap-3 lg:gap-4">
        {COL_INDICES.map((colIdxs, col) => (
          <div key={col} className="flex flex-col gap-3 lg:gap-4">
            {colIdxs.map((idx) => {
              const img = WP_IMAGES[idx]
              const slot = SLOTS[idx]
              return (
                <Card
                  key={img.src}
                  img={img}
                  idx={idx}
                  isActive={activeIdx === idx}
                  onTap={() => toggle(idx)}
                  ratio={slot.ratio}
                  delay={slot.delay}
                />
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
