'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { FooterNavLink } from '@/components/FooterNavLink'

export interface FooterNavItem {
  label: string
  url: string
  serviceIndex: number | null
}

export interface FooterNavColumn {
  heading: string | null
  items: FooterNavItem[]
}

export interface FooterContactItem {
  label: string
  href: string
  display: string
}

export interface FooterSocialItem {
  href: string
  text: string
}

interface Props {
  navColumns: FooterNavColumn[]
  contactHeading: string
  contactItems: FooterContactItem[]
  socialHeading: string
  socialItems: FooterSocialItem[]
}

function Chevron({ open }: { open: boolean }) {
  return (
    <m.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden="true"
    >
      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </m.svg>
  )
}

function AccordionRow({
  heading,
  isOpen,
  onToggle,
  children,
}: {
  heading: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-white/5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span
          className="text-[10px] font-bold tracking-[0.18em] uppercase transition-colors duration-200"
          style={{ color: isOpen ? '#facc15' : '#facc15' }}
        >
          {heading}
        </span>
        <span className={`transition-colors duration-200 ${isOpen ? 'text-yellow-400' : 'text-white/25'}`}>
          <Chevron open={isOpen} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-5">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FooterNavAccordion({ navColumns, contactHeading, contactItems, socialHeading, socialItems }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i))

  const sections = [
    ...navColumns.map((col) => ({
      heading: col.heading ?? '',
      content: col.items.length > 0 ? (
        <ul className="space-y-3">
          {col.items.map((item) => (
            <li key={item.label}>
              <FooterNavLink label={item.label} url={item.url} serviceIndex={item.serviceIndex} />
            </li>
          ))}
        </ul>
      ) : null,
    })),
    ...(socialItems.length > 0
      ? [
          {
            heading: socialHeading,
            content: (
              <ul className="space-y-3">
                {socialItems.map((s, i) => (
                  <li key={i}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                      {s.text}
                    </a>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
    ...(contactItems.length > 0
      ? [
          {
            heading: contactHeading,
            content: (
              <div className="space-y-4">
                {contactItems.map((item, i) => (
                  <div key={i}>
                    <div className="footer-contact-label">{item.label}</div>
                    <a href={item.href} className="footer-nav-link">
                      {item.display}
                    </a>
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ].filter((s) => s.heading && s.content)

  return (
    <>
      {/* ── Mobile: accordion (hidden on md+) ── */}
      <div className="md:hidden">
        {sections.map((section, idx) => (
          <AccordionRow key={idx} heading={section.heading} isOpen={openIdx === idx} onToggle={() => toggle(idx)}>
            {section.content}
          </AccordionRow>
        ))}
      </div>

      {/* ── Desktop: original grid (hidden on mobile) ── */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-7 gap-x-5 md:gap-x-8 gap-y-10 md:gap-y-12">
        {navColumns.map((col, i) => (
          <div key={i}>
            {col.heading && <h3 className="footer-col-heading">{col.heading}</h3>}
            <ul className="space-y-3">
              {col.items.map((item) => (
                <li key={item.label}>
                  <FooterNavLink label={item.label} url={item.url} serviceIndex={item.serviceIndex} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {socialItems.length > 0 && (
          <div>
            <h3 className="footer-col-heading">{socialHeading}</h3>
            <ul className="space-y-3">
              {socialItems.map((s, i) => (
                <li key={i}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                    {s.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {contactItems.length > 0 && (
          <div>
            <h3 className="footer-col-heading">{contactHeading}</h3>
            <div className="space-y-4">
              {contactItems.map((item, i) => (
                <div key={i}>
                  <div className="footer-contact-label">{item.label}</div>
                  <a href={item.href} className="footer-nav-link">
                    {item.display}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
