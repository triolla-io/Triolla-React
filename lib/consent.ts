/**
 * Cookie-consent core.
 *
 * Single source of truth for the consent model, the Google Consent Mode v2
 * signal mapping, and cookie (de)serialization. Pure helpers here are safe on
 * both the server (read cookie in layout) and the client (read/write in the
 * provider). The browser-only helpers are clearly marked.
 */

const CONSENT_COOKIE = 'triolla_consent'
const CONSENT_VERSION = 1
/** Re-ask for consent after ~6 months (in seconds). */
const CONSENT_MAX_AGE = 60 * 60 * 24 * 182

/** GTM container — mirrors the live WordPress site; overridable per environment. */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5J25W22P'

/** User-toggleable categories. `necessary` is always on and cannot be disabled. */
export interface ConsentState {
  v: number
  necessary: true
  analytics: boolean
  marketing: boolean
  /** Unix ms timestamp of the decision — the audit trail GDPR expects. */
  ts: number
}

/** The two choices a visitor can change. */
export type ConsentChoice = Pick<ConsentState, 'analytics' | 'marketing'>

type GtagSignal =
  | 'ad_storage'
  | 'ad_user_data'
  | 'ad_personalization'
  | 'analytics_storage'
  | 'functionality_storage'
  | 'personalization_storage'
  | 'security_storage'

export type GtagConsent = Record<GtagSignal, 'granted' | 'denied'>

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

/** Build a fresh state object from a choice. */
export function makeConsent(choice: ConsentChoice, ts: number): ConsentState {
  return {
    v: CONSENT_VERSION,
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    ts,
  }
}

/** Parse the raw cookie value. Returns null if absent, malformed, or stale-versioned. */
export function parseConsent(raw: string | undefined | null): ConsentState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>
    if (data?.v !== CONSENT_VERSION) return null
    return {
      v: CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(data.analytics),
      marketing: Boolean(data.marketing),
      ts: typeof data.ts === 'number' ? data.ts : 0,
    }
  } catch {
    return null
  }
}

function serializeConsent(state: ConsentState): string {
  return encodeURIComponent(JSON.stringify(state))
}

/**
 * Map our categories to Google Consent Mode v2 signals.
 * A null state (no decision yet) denies everything except always-on signals.
 */
export function toGtagConsent(state: ConsentState | null): GtagConsent {
  const analytics = state?.analytics ?? false
  const marketing = state?.marketing ?? false
  const grant = (on: boolean) => (on ? 'granted' : 'denied')
  return {
    analytics_storage: grant(analytics),
    ad_storage: grant(marketing),
    ad_user_data: grant(marketing),
    ad_personalization: grant(marketing),
    personalization_storage: grant(marketing),
    // Always allowed — required for the site to function and stay secure.
    functionality_storage: 'granted',
    security_storage: 'granted',
  }
}

/* ── Browser-only helpers ─────────────────────────────────── */

/** Read the raw (still-encoded) cookie value, or '' if absent. Client-only. */
export function readConsentCookieRaw(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  return match ? match[1] : ''
}

/** Persist the choice to the cookie (client-side; consent is a user action). */
export function writeConsentCookie(state: ConsentState): void {
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie =
    `${CONSENT_COOKIE}=${serializeConsent(state)}` +
    `; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`
}

/**
 * Tell Google about the updated choice and notify any GTM tags listening for it.
 * Safe to call before GTM finishes loading — the queue is already initialized.
 */
export function syncGtagConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', toGtagConsent(state))
  }
  // Custom event so GTM triggers (and any future tags) can react to the choice.
  window.dataLayer.push({ event: 'consent_update', consent: state })
}
