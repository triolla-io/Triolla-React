'use client'

import { m } from 'motion/react'
import { ReactNode } from 'react'

interface SectionRevealProps {
  children: ReactNode | ReactNode[]
  className?: string
}

export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      {childArray.map((child, i) => (
        <m.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.6, delay: i * 0.12, ease: 'easeOut' }}
        >
          {child}
        </m.div>
      ))}
    </div>
  )
}
