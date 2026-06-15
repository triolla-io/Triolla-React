'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { m, AnimatePresence } from 'motion/react'

interface FloatingCtaProps {
  href: string
  label: string
}

export function FloatingCta({ href, label }: FloatingCtaProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* sentinel placed by the caller at the bottom of the hero */}
      <div ref={sentinelRef} aria-hidden="true" />
      <AnimatePresence>
        {visible && (
          <m.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 inset-x-0 z-40 md:hidden"
            style={{ padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <Link
              href={href}
              className="flex items-center justify-center w-full h-14 rounded-2xl bg-yellow-400 text-black font-bold text-[15px] tracking-tight shadow-2xl shadow-yellow-400/25 hover:bg-yellow-300 transition-colors"
            >
              {label}
            </Link>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
