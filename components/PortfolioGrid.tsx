'use client'

import Image from 'next/image'
import { m } from 'motion/react'
import { EASE } from '@/lib/motion'
import { wpImg } from '@/lib/images'

// Actual WP homepage grid images (hometopimage1–9 from triolla.io)
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

// Desktop: 3 columns. Mobile: 2 balanced columns (6 images each from alternating picks).
const COL_DESKTOP = [[0, 3, 6], [1, 4, 7], [2, 5, 8]]
const COL_MOBILE  = [[0, 2, 4, 6, 8], [1, 3, 5, 7]] // odd/even split for balanced heights

function MasonryColumn({ indices, delay, className = '' }: { indices: number[]; delay: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 md:gap-5 ${className}`}>
      {indices.map((idx, i) => {
        const img = WP_IMAGES[idx]
        return (
          <m.div
            key={img.src}
            className="shine-card group overflow-hidden rounded-xl md:rounded-2xl relative bg-[#0f0f0f]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: delay + i * 0.08, ease: [...EASE.smooth] }}
          >
            <Image src={wpImg(img.src) ?? img.src} alt={img.alt} width={800} height={600} className="w-full h-auto block" />
            <div className="shine-card__shine" aria-hidden="true" />
          </m.div>
        )
      })}
    </div>
  )
}

export function PortfolioGrid() {
  return (
    <>
      {/* Mobile: 2 balanced masonry columns */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {COL_MOBILE.map((indices, col) => (
          <MasonryColumn key={col} indices={indices} delay={col * 0.06} />
        ))}
      </div>

      {/* Desktop: original 3-column masonry — untouched */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-5">
        {COL_DESKTOP.map((indices, col) => (
          <MasonryColumn key={col} indices={indices} delay={col * 0.08} />
        ))}
      </div>
    </>
  )
}
