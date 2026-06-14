'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import parse from 'html-react-parser'

interface FAQItem {
  faqQuestion: string
  faqAnswer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
  className?: string
}

export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={`faq-acc ${className}`} style={{ overflowAnchor: 'none' }}>
      <style>{`
        .faq-acc { overflow-anchor: none; }
        .faq-acc__panel {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          overflow-anchor: none;
          transition:
            grid-template-rows 0.4s cubic-bezier(.23,1,.32,1),
            opacity           0.28s ease;
        }
        .faq-acc__panel[data-open="true"] {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .faq-acc__panel-inner { min-height: 0; overflow: hidden; }
        @media (prefers-reduced-motion: reduce) {
          .faq-acc__panel { transition: none; }
        }
      `}</style>
      {items.map((item, i) => (
        <div key={i} className="border-b border-white/10">
          <button
            className="w-full flex justify-between items-center py-6 text-left gap-4"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-[22px] font-semibold">{item.faqQuestion}</span>
            <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </button>
          {/* CSS grid-rows expand — smooth height with no scroll-anchor jump */}
          <div className="faq-acc__panel" data-open={openIndex === i}>
            <div className="faq-acc__panel-inner">
              {/* Content is from trusted WP backend only — same pattern as moreText, toprightext, devtext throughout this codebase */}
              <div className="text-gray-400 text-[18px] leading-relaxed pb-6">{parse(item.faqAnswer)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
