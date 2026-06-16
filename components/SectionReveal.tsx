'use client'

import { m } from 'motion/react'
import { ReactNode, useEffect, useRef, useState } from 'react'

interface SectionRevealProps {
  children: ReactNode | ReactNode[]
  className?: string
}

export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const childArray = Array.isArray(children) ? children : [children]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, i) => (
        <m.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: visible ? i * 0.12 : 0, ease: 'easeOut' }}
        >
          {child}
        </m.div>
      ))}
    </div>
  )
}
