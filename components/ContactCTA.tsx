import { WannaChatSection } from '@/components/WannaChatSection'
import { stripHtml } from '@/lib/text'
import type { ThemeOptions } from '@/lib/graphql-types'

/**
 * Contact CTA band wired entirely from theme settings. Encapsulates the
 * contact-item assembly and heading sanitization so every page (home, blog
 * listing, single post) renders an identical, WP-driven CTA.
 */
export function ContactCTA({ ts }: { ts: ThemeOptions | null }) {
  const contactItems = [
    ts?.cEmailLabel && ts?.cEmailAddress
      ? { label: ts.cEmailLabel, value: ts.cEmailAddress, href: `mailto:${ts.cEmailAddress}` }
      : null,
    ts?.cTlvLabel && ts?.cTlvNumber
      ? { label: ts.cTlvLabel, value: ts.cTlvNumber, href: `tel:${ts.cTlvNumber.replace(/[^+\d]/g, '')}` }
      : null,
    ts?.cNyLabel && ts?.cNyNumber
      ? { label: ts.cNyLabel, value: ts.cNyNumber, href: `tel:${ts.cNyNumber.replace(/[^+\d]/g, '')}` }
      : null,
    ts?.cAddressLabel && ts?.cAddress ? { label: ts.cAddressLabel, value: ts.cAddress, href: undefined } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null)

  return (
    <WannaChatSection
      contactItems={contactItems}
      leftHeading={
        ts?.cLeftHeading
          ? ts.cLeftHeading
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .trim()
          : null
      }
      formHeading={ts?.cContactFormHeading ? stripHtml(ts.cContactFormHeading) : null}
      submitLabel={ts?.cButton ?? null}
      callUsLabel={ts?.cCallUsLabel ?? null}
      fallbackEmail={ts?.cEmailAddress ?? null}
    />
  )
}
