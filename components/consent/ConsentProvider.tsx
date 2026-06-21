'use client'

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { type ConsentChoice, type ConsentState, makeConsent, parseConsent, syncGtagConsent } from '@/lib/consent'
import { consentStore, SSR_SNAPSHOT } from '@/components/consent/consentStore'

interface ConsentContextValue {
  /** The saved decision, or null if the visitor hasn't chosen yet. */
  consent: ConsentState | null
  bannerOpen: boolean
  prefsOpen: boolean
  acceptAll: () => void
  rejectAll: () => void
  /** Save a specific combination (from the preferences modal). */
  save: (choice: ConsentChoice) => void
  openPrefs: () => void
  closePrefs: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const ctx = use(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within <ConsentProvider>')
  return ctx
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Cookie is read on the client only; the server snapshot is a sentinel so the
  // banner is never baked into static HTML (no flash for returning visitors).
  const raw = useSyncExternalStore(consentStore.subscribe, consentStore.getSnapshot, consentStore.getServerSnapshot)
  const hydrated = raw !== SSR_SNAPSHOT

  const consent = useMemo(() => (hydrated ? parseConsent(raw) : null), [hydrated, raw])
  const [prefsOpen, setPrefsOpen] = useState(false)

  // Show the banner only once we know (client-side) there's no saved choice.
  const bannerOpen = hydrated && consent === null && !prefsOpen

  // Mirror the saved choice into Google Consent Mode whenever it changes —
  // including on first load for returning visitors (updates the deny-by-default).
  useEffect(() => {
    if (consent) syncGtagConsent(consent)
  }, [consent])

  const commit = useCallback((choice: ConsentChoice) => {
    consentStore.write(makeConsent(choice, Date.now()))
    setPrefsOpen(false)
  }, [])

  const acceptAll = useCallback(() => commit({ analytics: true, marketing: true }), [commit])
  const rejectAll = useCallback(() => commit({ analytics: false, marketing: false }), [commit])
  const save = useCallback((choice: ConsentChoice) => commit(choice), [commit])
  const openPrefs = useCallback(() => setPrefsOpen(true), [])
  const closePrefs = useCallback(() => setPrefsOpen(false), [])

  const value = useMemo<ConsentContextValue>(
    () => ({ consent, bannerOpen, prefsOpen, acceptAll, rejectAll, save, openPrefs, closePrefs }),
    [consent, bannerOpen, prefsOpen, acceptAll, rejectAll, save, openPrefs, closePrefs],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}
