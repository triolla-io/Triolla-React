'use client'

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
        <div
          key={i}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(40px)',
            transition: `opacity 0.6s ease-out ${i * 0.12}s, transform 0.6s ease-out ${i * 0.12}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
