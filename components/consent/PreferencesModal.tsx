'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useConsent } from '@/components/consent/ConsentProvider'

interface Category {
  key: 'necessary' | 'analytics' | 'marketing'
  title: string
  description: string
  locked?: boolean
}

const CATEGORIES: Category[] = [
  {
    key: 'necessary',
    title: 'Strictly necessary',
    description: 'Required for the site to work — security, navigation, and remembering your privacy choice. Always on.',
    locked: true,
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Anonymous usage stats that help us understand what works and improve the site.',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description: 'Lets us measure campaigns and show you more relevant content across the web.',
  },
]

export default function PreferencesModal() {
  const { prefsOpen } = useConsent()
  // Mount the dialog only while open so its draft state seeds fresh from the
  // saved choice on every open (no setState-in-effect needed).
  return <AnimatePresence>{prefsOpen && <PreferencesDialog />}</AnimatePresence>
}

function PreferencesDialog() {
  const { consent, closePrefs, acceptAll, rejectAll, save } = useConsent()
  const reduce = useReducedMotion()
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  // Draft, seeded from the saved choice at mount.
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const [marketing, setMarketing] = useState(consent?.marketing ?? false)

  // Focus management: trap focus, restore on close, ESC to dismiss, lock scroll.
  useEffect(() => {
    lastFocused.current = document.activeElement as HTMLElement | null
    const node = dialogRef.current
    node?.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closePrefs()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const focusable = node.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      lastFocused.current?.focus()
    }
  }, [closePrefs])

  const state: Record<Category['key'], boolean> = { necessary: true, analytics, marketing }

  return (
    <m.div
      className="fixed inset-0 z-110 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" onClick={closePrefs} />

      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.98 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-yellow-400/70 to-transparent"
        />

        <div className="flex items-start justify-between gap-4 px-7 pt-7 pb-5">
          <div>
            <h2 id={titleId} className="text-2xl font-bold tracking-tight text-white">
              Privacy preferences
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Manage how we use cookies. See our{' '}
              <Link href="/privacy-policy" className="text-yellow-400 underline-offset-2 hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={closePrefs}
            aria-label="Close preferences"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-7 pb-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-white">{cat.title}</h3>
                <Toggle
                  checked={state[cat.key]}
                  disabled={cat.locked}
                  label={cat.title}
                  onChange={(v) => (cat.key === 'analytics' ? setAnalytics(v) : setMarketing(v))}
                />
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-gray-400">{cat.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            data-autofocus
            onClick={() => save({ analytics, marketing })}
            className="order-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:order-1"
          >
            Save preferences
          </button>
          <div className="order-1 flex gap-3 sm:order-2">
            <button
              type="button"
              onClick={rejectAll}
              className="flex-1 rounded-full px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:text-white sm:flex-none"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-yellow-300 sm:flex-none"
            >
              Accept all
            </button>
          </div>
        </div>
      </m.div>
    </m.div>
  )
}

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${label} cookies`}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-yellow-400' : 'bg-white/15'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
