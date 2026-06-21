'use client'

import { useConsent } from '@/components/consent/ConsentProvider'

/**
 * Lets visitors re-open their cookie preferences after the banner is gone.
 * Styled to match the footer's legal links (`.footer-bottom-link`).
 */
export default function CookieSettingsButton() {
  const { openPrefs } = useConsent()
  return (
    <button type="button" onClick={openPrefs} className="footer-bottom-link">
      Cookie settings
    </button>
  )
}
