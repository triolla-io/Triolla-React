import Link from 'next/link'
import { client } from '@/lib/apollo-client'
import type { Locale } from '@/lib/i18n'
import { defaultLocale } from '@/lib/i18n'
import { GET_FOOTER_DATA, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { SectionReveal } from '@/components/SectionReveal'
import { FooterModalProvider } from '@/components/FooterServiceModal'
import { FooterNavLink } from '@/components/FooterNavLink'
import { getAllServices, deriveUri } from '@/lib/service-details'
import type { GetFooterData, GetThemeSettingsData, FooterMenu, ThemeOptions } from '@/lib/graphql-types'

interface MentionLogo {
  mentionLogo?: { node?: { sourceUrl?: string } } | null
  mentionLogoLink?: string | null
}

interface SocialItem {
  socialMediaLink?: string | null
  socialMediaText?: string | null
}

const MENU_COLUMNS = [
  { slug: 'product-menu' },
  { slug: 'case-study-menu' },
  { slug: 'technology-menu' },
  { slug: 'company-menu' },
  { slug: 'blog-menu' },
]

const COL_HEADING_FIELDS = ['footmenuTitleOne', 'footmenuTitleTwo', 'footmenuTitleThree', 'footmenuTitleFour', 'footmenuTitleFive'] as const

/** Turn a WP legal-page link (e.g. "https://triolla.io/privacy-policy/") into a
 *  local route so it resolves to the new-site page instead of the old WP one.
 *  Genuinely external hosts are returned untouched. */
function localizeHref(url: string): string {
  if (url.startsWith('http') && !url.includes('triolla.io')) return url
  return url.replace(/^https?:\/\/(www\.)?triolla\.io/i, '').replace(/\/+$/, '') || '/'
}

/* ── Data fetching ──────────────────────────────────────── */

const FOOTER_QUERY: TypedDocumentNode<GetFooterData> = gql`
  ${GET_FOOTER_DATA}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

async function getFooterMenus(): Promise<FooterMenu[]> {
  try {
    const { data } = await client.query({ query: FOOTER_QUERY })
    return data?.menus?.nodes ?? []
  } catch {
    return []
  }
}

async function getThemeSettings(): Promise<ThemeOptions | null> {
  try {
    const { data } = await client.query({ query: THEME_SETTINGS_QUERY })
    return data?.themeSetting?.themeOptions ?? null
  } catch {
    return null
  }
}

/* ── Social icon SVGs ───────────────────────────────────── */

function FacebookIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.995 0C4.47 0 0 4.475 0 10c0 5.525 4.47 10 9.995 10C15.52 20 20 15.525 20 10 20 4.475 15.52 0 9.995 0zm6.925 6H13.97c-.325-1.25-.78-2.45-1.38-3.56A8.495 8.495 0 0116.92 6zM10 2.035c.835 1.2 1.485 2.535 1.91 3.965H8.09C8.515 4.57 9.165 3.235 10 2.035zM2.26 12A8.01 8.01 0 012 10c0-.69.095-1.36.26-2h3.375C5.555 8.655 5.5 9.32 5.5 10c0 .68.055 1.345.14 2H2.26zM3.075 14h2.95c.325 1.25.78 2.45 1.38 3.565A8.477 8.477 0 013.075 14zm2.95-8H3.075A8.477 8.477 0 017.405 2.435C6.805 3.55 6.35 4.75 6.025 6zM10 17.965c-.83-1.2-1.48-2.535-1.91-3.965h3.82c-.43 1.43-1.08 2.765-1.91 3.965zM12.34 12H7.66A12.23 12.23 0 017.5 10c0-.68.065-1.345.16-2h4.68c.095.655.16 1.32.16 2 0 .68-.065 1.345-.16 2zm.255 5.56c.6-1.115 1.055-2.31 1.38-3.56h2.95a8.497 8.497 0 01-4.33 3.56zM14.36 12c.08-.655.14-1.32.14-2 0-.68-.055-1.345-.14-2h3.375c.165.64.265 1.31.265 2s-.1 1.36-.265 2H14.36z" />
    </svg>
  )
}

/* ── Component ──────────────────────────────────────────── */

export default async function Footer({ locale = defaultLocale }: { locale?: Locale } = {}) {
  const [ts, wpMenus, services] = await Promise.all([getThemeSettings(), getFooterMenus(), getAllServices()])

  // Map each resolved service detail page (URI path → index) so footer links
  // that point at one render as a modal trigger instead of a dead link.
  // Unresolved services (hasDetail: false) are skipped → those links stay
  // plain links.
  const serviceByUri = new Map<string, number>()
  services.forEach((s, i) => {
    if (!s.hasDetail || !s.link) return
    const uri = deriveUri(s.link)
    if (uri) serviceByUri.set(uri, i)
  })

  const colHeadings: (string | null)[] = COL_HEADING_FIELDS.map((field) => ts?.[field] ?? null)

  const columns = MENU_COLUMNS.map((col, i) => {
    const wpMenu = wpMenus.find(
      (m) => m.slug === col.slug || m.slug === `footer-${col.slug}` || m.name.toLowerCase().replace(/\s+/g, '-') === col.slug,
    )
    const items = (wpMenu?.menuItems?.nodes ?? []).map((item) => {
      const uri = deriveUri(item.url)
      const serviceIndex = uri ? (serviceByUri.get(uri) ?? null) : null
      return { label: item.label, url: item.url, serviceIndex }
    })
    const heading = colHeadings[i] ?? null
    return { heading, items }
  })

  const mentions: MentionLogo[] = ts?.mentionsLogos?.length ? ts.mentionsLogos : []
  const socials: SocialItem[] = ts?.socialMenuItems?.length ? ts.socialMenuItems : []

  const logoUrl: string = ts?.siteLogo?.node?.sourceUrl ?? ''
  const sqlinkUrl: string = ts?.sqlink ?? ''
  const emailAddress: string = ts?.emailAddress ?? ''
  const tlvLabel: string = ts?.tlvOfficesLabel ?? ''
  const tlvPhone: string = ts?.tlvOfficesPhone ?? ''
  const nyLabel: string = ts?.nyOfficesLabel ?? ''
  const nyPhone: string = ts?.nyOfficesPhone ?? ''
  const privacyText: string | null = ts?.footerPrivacyText ?? null
  const privacyLink: string | null = ts?.footerPrivacyLink ?? null
  const termText: string | null = ts?.footerTermText ?? null
  const termLink: string | null = ts?.footerTermLink ?? null
  const mentionsLabel: string = ts?.footerMentionsLabel ?? ''
  const fbLink: string = ts?.facebookLink ?? ''
  const igLink: string = ts?.instagramLink ?? ''
  const ttLink: string = ts?.tiktokLink ?? ''
  const liLink: string = ts?.linkedinLink ?? ''

  return (
    <footer className="bg-[#0f0f0f] text-white overflow-hidden">
      {/* ══════════════════════════════════════════
          MENTIONS STRIP
      ══════════════════════════════════════════ */}
      {mentions.length > 0 && (
        <div className="footer-mentions-strip border-b border-white/5 py-5 md:py-8">
          <div className="w-[90%] mx-auto">
            <div className="flex items-center gap-6 md:gap-10">
              {mentionsLabel && (
                <div className="footer-mentions-label-wrap shrink-0">
                  <span className="footer-mentions-label">{mentionsLabel}</span>
                </div>
              )}
              <div className="footer-mentions-sep" aria-hidden="true" />
              <div className="flex flex-1 overflow-x-auto sm:flex-wrap items-center justify-start sm:justify-start gap-6 md:gap-10 hide-scrollbar">
                {mentions.map((m, i) => {
                  const src = m.mentionLogo?.node?.sourceUrl
                  if (!src) return null
                  const linkHostname = m.mentionLogoLink ? m.mentionLogoLink.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : ''
                  const label = linkHostname ? `Visit ${linkHostname}` : 'View mention'
                  return (
                    <a
                      key={i}
                      href={m.mentionLogoLink ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-mention"
                      style={{ '--mi': i } as React.CSSProperties}
                      aria-label={label}
                    >
                      <img src={src} alt="" className="footer-mention__img" width={100} height={36} />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN NAV GRID
          Wrapped in FooterModalProvider so service links (e.g. Product
          Design) open the shared service-detail modal instead of navigating
          to pages that no longer exist on the new site.
      ══════════════════════════════════════════ */}
      <FooterModalProvider services={services} ctaText={ts?.cButton ?? null} ctaLink="/contact-us">
        <div className="w-[90%] mx-auto py-10 md:py-16">
          <SectionReveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-x-5 md:gap-x-8 gap-y-10 md:gap-y-12">
            {[
              ...columns.flatMap((col, i) => {
                if (col.heading || col.items.length > 0) {
                  return [
                    <div key={i}>
                      {col.heading && <h3 className="footer-col-heading">{col.heading}</h3>}
                      <ul className="space-y-3">
                        {col.items.map((item) => (
                          <li key={item.label}>
                            <FooterNavLink label={item.label} url={item.url} serviceIndex={item.serviceIndex} />
                          </li>
                        ))}
                      </ul>
                    </div>,
                  ]
                }
                return []
              }),
              ...(socials.length > 0
                ? [
                    <div key="social">
                      <h3 className="footer-col-heading">Social</h3>
                      <ul className="space-y-3">
                        {socials.map((s, i) => (
                          <li key={i}>
                            {s.socialMediaLink && s.socialMediaText ? (
                              <a href={s.socialMediaLink} target="_blank" rel="noopener noreferrer" className="footer-nav-link">
                                {s.socialMediaText}
                              </a>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>,
                  ]
                : []),
              <div key="contact">
                <h3 className="footer-col-heading">Talk to Us</h3>
                <div className="space-y-4">
                  {emailAddress && (
                    <div>
                      <div className="footer-contact-label">Mail</div>
                      <a href={`mailto:${emailAddress}`} className="footer-nav-link">
                        {emailAddress}
                      </a>
                    </div>
                  )}
                  {tlvPhone && (
                    <div>
                      <div className="footer-contact-label">{tlvLabel ?? 'TLV Offices'}</div>
                      <a href={`tel:${tlvPhone.replace(/[^+\d]/g, '')}`} className="footer-nav-link">
                        {tlvPhone}
                      </a>
                    </div>
                  )}
                  {nyPhone && (
                    <div>
                      <div className="footer-contact-label">{nyLabel ?? 'NY Offices'}</div>
                      <a href={`tel:${nyPhone.replace(/[^+\d]/g, '')}`} className="footer-nav-link">
                        {nyPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>,
            ]}
          </SectionReveal>
        </div>
      </FooterModalProvider>

      {/* ══════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div className="border-t border-white/5 py-4 md:py-6">
        <div className="w-[90%] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Left: logo */}
            <Link href="/">
              {logoUrl ? <img src={logoUrl} alt="Triolla" width={92} height={30} className="h-7 w-auto brightness-0 invert" /> : null}
            </Link>

            {/* Center: copyright + legal */}
            <p className="text-[#4b5563] text-sm text-center">
              All rights reserved to Triolla LTD
              {privacyText && privacyLink && (
                <>
                  {' | '}
                  <Link href={localizeHref(privacyLink)} className="footer-bottom-link">
                    {privacyText}
                  </Link>
                </>
              )}
              {termText && termLink && (
                <>
                  {' | '}
                  <Link href={localizeHref(termLink)} className="footer-bottom-link">
                    {termText}
                  </Link>
                </>
              )}
            </p>

            {/* Mobile social icons — premium round buttons */}
            <div className="flex items-center gap-3 md:hidden">
              {liLink && (
                <a
                  href={liLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <LinkedInIcon />
                </a>
              )}
              {ttLink && (
                <a
                  href={ttLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <TikTokIcon />
                </a>
              )}
              {igLink && (
                <a
                  href={igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <InstagramIcon />
                </a>
              )}
              {fbLink && (
                <a
                  href={fbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <FacebookIcon />
                </a>
              )}
            </div>

            {/* Right: language + sqlink + social (desktop only) */}
            <div className="hidden md:flex items-center gap-5">
              <div className="footer-lang flex items-center gap-2">
                <GlobeIcon />
                <Link
                  href="/"
                  className={`footer-lang__opt${locale === 'en' ? ' footer-lang__opt--active' : ''}`}
                >
                  Eng
                </Link>
                <span className="footer-lang__sep">/</span>
                <Link
                  href="/he"
                  className={`footer-lang__opt${locale === 'he' ? ' footer-lang__opt--active' : ''}`}
                >
                  Heb
                </Link>
              </div>
              {sqlinkUrl && (
                <a href={sqlinkUrl} target="_blank" rel="noopener noreferrer" className="footer-sqlink">
                  Part of
                  <img src="https://triolla.io/wp-content/themes/triolla/images/sqlink_icon.png" alt="Sqlink" className="h-5 w-auto" />
                </a>
              )}
              <div className="flex items-center gap-3">
                {liLink && (
                  <a href={liLink} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-icon">
                    <LinkedInIcon />
                  </a>
                )}
                {ttLink && (
                  <a href={ttLink} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer-social-icon">
                    <TikTokIcon />
                  </a>
                )}
                {igLink && (
                  <a href={igLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-icon">
                    <InstagramIcon />
                  </a>
                )}
                {fbLink && (
                  <a href={fbLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-icon">
                    <FacebookIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        /* ── Mentions strip ────────────────────── */
        .footer-mentions-label-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .footer-mentions-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #374151;
          white-space: nowrap;
        }
        .footer-mentions-sep {
          width: 1px;
          height: 32px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent);
          flex-shrink: 0;
        }
        .footer-mentions-strip {
          position: relative;
          overflow: hidden;
        }
        .footer-mentions-strip::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255, 255, 255, 0.03) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          background-position: -200% 0;
          animation: stripShimmer 8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes stripShimmer {
          0%, 40%  { background-position: -200% 0; }
          60%, 100% { background-position: 200% 0; }
        }
        @keyframes mentionFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .footer-mention {
          display: flex;
          align-items: center;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s;
          opacity: 1;
          animation: mentionFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
          animation-delay: calc(var(--mi, 0) * 0.08s + 0.1s);
        }
        .footer-mention:hover {
          transform: translateY(-3px) scale(1.04);
        }
        .footer-mention__img {
          height: 32px;
          width: auto;
          max-width: 120px;
          object-fit: contain;
          filter: grayscale(0.25) opacity(0.65);
          transition: filter 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .footer-mention:hover .footer-mention__img {
          filter: grayscale(0) opacity(1);
        }

        /* ── Nav columns ───────────────────────── */
        .footer-col-heading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #facc15;
          margin-bottom: 20px;
        }
        .footer-nav-link {
          position: relative;
          display: inline-block;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: #facc15;
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .footer-nav-link:hover { color: #e5e7eb; }
        .footer-nav-link:hover::after { width: 100%; }
        /* Service links rendered as modal triggers — strip native button
           chrome so they read identically to the surrounding link list. */
        button.footer-nav-link--btn {
          background: none; border: 0; padding: 0; margin: 0;
          text-align: left; cursor: pointer; font: inherit; appearance: none;
        }

        /* ── Contact labels ────────────────────── */
        .footer-contact-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 4px;
        }

        /* ── Bottom bar ────────────────────────── */
        .footer-bottom-link {
          color: #4b5563;
          font-size: 13px;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-bottom-link:hover { color: #e5e7eb; }
        .footer-lang {
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #4b5563;
        }
        .footer-lang__opt {
          color: #4b5563;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-lang__opt:hover,
        .footer-lang__opt--active { color: #e5e7eb; }
        .footer-lang__sep {
          color: #1f2937;
          font-size: 10px;
        }
        .footer-sqlink {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #374151;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s, opacity 0.2s;
          opacity: 0.6;
        }
        .footer-sqlink:hover { color: #9ca3af; opacity: 1; }
        .footer-social-icon {
          display: flex;
          align-items: center;
          color: #4b5563;
          transition: color 0.2s;
        }
        .footer-social-icon:hover { color: #e5e7eb; }

        /* ── Scrollbar hide ───────────────────── */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Mobile overrides ──────────────────── */
        @media (max-width: 768px) {
          .footer-col-heading {
            font-size: 10px;
            margin-bottom: 12px;
          }
          .footer-nav-link {
            font-size: 13px;
          }
          .footer-contact-label {
            font-size: 9px;
          }
          .footer-mention__img {
            height: 22px;
          }
          .footer-mentions-label {
            font-size: 8px;
          }
          .footer-mentions-sep {
            height: 22px;
          }
        }
      `}</style>
    </footer>
  )
}
