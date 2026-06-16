'use client'

import Link from 'next/link'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useConsent } from '@/components/consent/ConsentProvider'
import PreferencesModal from '@/components/consent/PreferencesModal'

export default function CookieBanner() {
  const { bannerOpen, prefsOpen, acceptAll, rejectAll, openPrefs } = useConsent()
  const reduce = useReducedMotion()

  return (
    <>
      <AnimatePresence>
        {bannerOpen && !prefsOpen && (
          <m.div
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            role="region"
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-100 p-4 sm:p-6 pointer-events-none"
          >
            <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]/95 shadow-2xl backdrop-blur-md pointer-events-auto">
              {/* Brand accent hairline */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-yellow-400/70 to-transparent"
              />

              <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-7">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400 sm:flex"
                  >
                    <CookieGlyph />
                  </span>
                  <p className="max-w-2xl text-[14px] leading-relaxed text-gray-400">
                    <span className="font-semibold text-white">We value your privacy.</span> We use cookies to improve your experience,
                    analyze traffic, and show relevant content. Choose what you&apos;re comfortable with — read our{' '}
                    <Link href="/privacy-policy" className="text-yellow-400 underline-offset-2 hover:underline">
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  >
                    Reject all
                  </button>
                  <button
                    type="button"
                    onClick={openPrefs}
                    className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
                  >
                    Customize
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-300"
                  >
                    Accept all
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <PreferencesModal />
    </>
  )
}

function CookieGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4-4 4 4 0 0 1-4-4 4 4 0 0 1-2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="13" r="1.2" fill="currentColor" />
      <circle cx="14" cy="16" r="1.1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}
