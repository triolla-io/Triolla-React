# Homepage WP Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded content in Header, Footer, and Homepage with live data from the WordPress ThemeSetting ACF options page and WP menus — no hardcoded text, images, links, or contact data anywhere in these shared components.

**Architecture:** `lib/queries.ts` gains two new query strings (`GET_THEME_SETTINGS`, `GET_PRIMARY_MENU`) and loses `GET_FOOTER_OPTIONS`. `Header.tsx` is rewritten as an async Server Component that passes WP data as props to a new `HeaderClient.tsx` `"use client"` component. `Footer.tsx` drops its hardcoded constants and fetches ThemeSetting alongside the existing menu call. `app/page.tsx` adds a parallel ThemeSetting fetch, replaces hardcoded contact cards, adds a FAQ section from WP, and empties hero fallback strings.

**Tech Stack:** Next.js 16 App Router, Apollo Client v4 (`gql` at call-site), WPGraphQL, Framer Motion, TypeScript

---

## Schema facts confirmed before writing this plan

All field names below were verified against `schema.graphql` (repo root):

- **Root query path for ThemeSetting:** `themeSetting { themeSetting { ...fields } }` — `RootQuery` implements `WithAcfOptionsPageThemeSetting` which exposes `themeSetting: ThemeSetting`; the inner `.themeSetting` field on the node holds the ACF data.
- **`mentionsLogos` sub-fields:** `mentionLogo { node { sourceUrl } }` and `mentionLogoLink: String` — _not_ `fMentionName`/`fMentionLink`/`fMentionLogo` (the spec's unverified guesses were wrong).
- **`socialMenuItems` sub-fields:** `socialMediaLink: String` and `socialMediaText: String` — _not_ `platform`/`url`.
- **`questionAnswerList` sub-fields:** `fQuestion: String` and `fAnswer: String` ✓
- **Individual social link fields also exist:** `facebookLink`, `instagramLink`, `tiktokLink`, `linkedinLink` (used for bottom-bar social icons where we need to know which icon to render).

---

## File map

| File                          | Action                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `lib/queries.ts`              | Delete `GET_FOOTER_OPTIONS`; add `GET_THEME_SETTINGS`, `GET_PRIMARY_MENU`                     |
| `components/Header.tsx`       | Rewrite as async Server Component; fetches data; renders `<HeaderClient>`                     |
| `components/HeaderClient.tsx` | **New file** — `"use client"`; all interactivity; receives data as props                      |
| `components/Footer.tsx`       | Remove hardcoded constants + CTA band + mobile CTA bar; add ThemeSetting fetch; update JSX    |
| `app/page.tsx`                | Add ThemeSetting parallel fetch; empty hero fallbacks; replace contact cards; add FAQ section |

---

## Task 1: Update `lib/queries.ts`

**Files:**

- Modify: `lib/queries.ts`

- [ ] **Step 1: Delete `GET_FOOTER_OPTIONS`**

Remove the entire block (lines 111–146 currently — the JSDoc comment through the closing backtick):

```ts
// DELETE this entire export:
export const GET_FOOTER_OPTIONS = `...`
```

- [ ] **Step 2: Add `GET_THEME_SETTINGS` at the bottom of the file**

```ts
export const GET_THEME_SETTINGS = `
  query GetThemeSettings {
    themeSetting {
      themeSetting {
        bookButton
        bookButtonLink
        contactButton
        contactButtonLink
        whatsappNumber
        whatsappMessage
        newsTicker
        siteLogo { node { sourceUrl altText } }
        siteLogoWhite { node { sourceUrl altText } }
        footerLogo { node { sourceUrl altText } }
        footerMentionsLabel
        mentionsLogos {
          mentionLogo { node { sourceUrl } }
          mentionLogoLink
        }
        emailAddress
        tlvOfficesLabel
        tlvOfficesPhone
        nyOfficesLabel
        nyOfficesPhone
        sqlink
        facebookLink
        instagramLink
        tiktokLink
        linkedinLink
        socialMenuItems {
          socialMediaLink
          socialMediaText
        }
        footerPrivacyText
        footerPrivacyLink
        footerTermText
        footerTermLink
        footmenuTitleOne
        footmenuTitleTwo
        footmenuTitleThree
        footmenuTitleFour
        footmenuTitleFive
        cCallUsLabel
        cEmailAddress
        cEmailLabel
        cTlvLabel
        cTlvNumber
        cNyLabel
        cNyNumber
        cAddress
        cAddressLabel
        faqHeading
        faqShortText
        questionAnswerList {
          fQuestion
          fAnswer
        }
      }
    }
  }
`
```

- [ ] **Step 3: Add `GET_PRIMARY_MENU` at the bottom of the file**

```ts
export const GET_PRIMARY_MENU = `
  query GetPrimaryMenu {
    primaryMenu: menu(id: "PRIMARY_MENU", idType: LOCATION) {
      menuItems(first: 30) {
        nodes {
          label
          url
        }
      }
    }
    mobileMenu: menu(id: "MOBILE_HEADER_MENU", idType: LOCATION) {
      menuItems(first: 30) {
        nodes {
          label
          url
        }
      }
    }
  }
`
```

- [ ] **Step 4: Verify no remaining import of `GET_FOOTER_OPTIONS` anywhere**

Run:

```bash
grep -r "GET_FOOTER_OPTIONS" .
```

Expected: no results (or only the now-deleted definition itself).

- [ ] **Step 5: Commit**

```bash
git add lib/queries.ts
git commit -m "feat: add GET_THEME_SETTINGS and GET_PRIMARY_MENU queries; remove unused GET_FOOTER_OPTIONS"
```

---

## Task 2: Create `components/HeaderClient.tsx`

**Files:**

- Create: `components/HeaderClient.tsx`

This new file is a `"use client"` component that owns all header interactivity (ticker close, mobile menu, sticky scroll, active link detection). It receives all content as typed props — no WP fetching inside.

- [ ] **Step 1: Create the file**

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

interface NavItem {
  label: string
  url: string
}

export interface HeaderClientProps {
  logoUrl: string | null
  ticker: string | null
  navItems: NavItem[]
  mobileNavItems: NavItem[]
  whatsappHref: string | null
  bookButtonText: string | null
  bookButtonHref: string | null
  contactButtonText: string | null
  contactButtonHref: string | null
}

export function HeaderClient({
  logoUrl,
  ticker,
  navItems,
  mobileNavItems,
  whatsappHref,
  bookButtonText,
  bookButtonHref,
  contactButtonText,
  contactButtonHref,
}: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTickerDismissed, setIsTickerDismissed] = useState(false)
  const pathname = usePathname()

  function toHref(url: string): string {
    if (!url) return '/'
    if (url.startsWith('http') && !url.includes('triolla.io')) return url
    return url.replace(/^https?:\/\/triolla\.io/, '') || '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      {/* Ticker */}
      {ticker && !isTickerDismissed && (
        <div className="bg-yellow-400 text-black py-2 px-4 text-center text-[13px] font-medium relative flex items-center justify-center">
          <span>{ticker}</span>
          <button className="absolute right-4 text-black hover:opacity-70" aria-label="Close" onClick={() => setIsTickerDismissed(true)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[90px]">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/">{logoUrl ? <img src={logoUrl} alt="Triolla" className="h-9 w-auto brightness-0 invert" /> : null}</Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-10">
            {navItems.map(({ label, url }) => {
              const href = toHref(url)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative text-[15px] font-medium transition-colors hover:text-yellow-400 ${pathname === href ? 'text-yellow-400' : ''}`}
                >
                  {label}
                  {pathname === href && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full" />}
                </Link>
              )
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-6">
            {contactButtonHref && contactButtonText && (
              <Link
                href={toHref(contactButtonHref)}
                className="border border-white/30 rounded-full px-8 py-[10px] text-[15px] font-medium hover:bg-white hover:text-black transition-all"
              >
                {contactButtonText}
              </Link>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-[45px] h-[45px] bg-[#25D366] rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
            {bookButtonHref && bookButtonText && (
              <a
                href={toHref(bookButtonHref)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[15px] font-medium hover:text-yellow-400 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.61418 2.45849V3.07326C8.60311 3.6185 7.72211 3.92927 7.44361 3.33357C7.40611 3.25295 7.38767 3.16372 7.38582 3.07326V2.45849H5.5439C5.07112 2.43572 4.75451 1.81725 5.07973 1.44124C5.19162 1.31201 5.282 1.24186 5.5439 1.22894C6.15746 1.22894 6.77164 1.22709 7.38582 1.2234V0.614775C7.38767 0.514467 7.3975 0.481851 7.41656 0.422158C7.49771 0.175386 7.74056 0 8.0123 0C8.33998 0.0129232 8.6068 0.258464 8.61418 0.614775V1.21601C9.84192 1.20863 11.0703 1.20186 12.2986 1.20801V0.614775C12.3048 0.286157 12.5446 0.014154 12.9005 0C12.9085 0 12.9165 0 12.9245 0C13.2528 0.0129232 13.5196 0.258464 13.5264 0.614775V1.21909C13.7465 1.22217 13.9666 1.22586 14.1861 1.22955C15.1273 1.25909 15.9647 2.06956 15.9825 3.05049C16.0058 6.7533 16.0058 10.4567 15.9825 14.1601C15.9653 15.1109 15.1433 15.9626 14.1633 15.9811C10.0546 16.0063 5.94536 16.0063 1.8367 15.9811C0.890528 15.9632 0.0359654 15.1571 0.0175216 14.1601C-0.00584054 10.4567 -0.00584054 6.7533 0.0175216 3.05049C0.0347358 2.09294 0.854255 1.2357 1.8576 1.22894H2.47362V0.614775C2.47547 0.514467 2.48469 0.481851 2.50436 0.422158C2.58551 0.175386 2.82836 0 3.09948 0C3.42778 0.0129232 3.6946 0.258464 3.70136 0.614775V3.07326C3.69091 3.61788 2.83512 3.92311 2.54186 3.35572C2.49698 3.26895 2.47547 3.17234 2.47362 3.07326V2.45602C2.26336 2.45479 2.05372 2.45479 1.84407 2.45849C1.53237 2.46833 1.2551 2.74156 1.24526 3.05788C1.17702 6.75514 1.17641 10.4549 1.24526 14.1521C1.2551 14.4648 1.52807 14.7417 1.84407 14.7515C5.9472 14.8278 10.0528 14.8278 14.1559 14.7515C14.4676 14.7417 14.7449 14.4684 14.7547 14.1521C14.823 10.4549 14.823 6.75514 14.7547 3.05788C14.7449 2.73972 14.4615 2.46033 14.1387 2.45849H13.5264V3.07326C13.5159 3.61296 12.6577 3.91758 12.3669 3.55572C12.3226 3.26895 12.3005 3.17234 12.2986 3.07326V2.45849H8.61418ZM3.08719 12.293C3.42655 12.293 3.70136 12.5687 3.70136 12.9078C3.70136 13.2469 3.42655 13.5226 3.08719 13.5226C2.74843 13.5226 2.47362 13.2469 2.47362 12.9078C2.47362 12.5687 2.74843 12.293 3.08719 12.293ZM5.5439 12.293C5.88265 12.293 6.15746 12.5687 6.15746 12.9078C6.15746 13.2469 5.88265 13.5226 5.5439 13.5226C5.20453 13.5226 4.92972 13.2469 4.92972 12.9078C4.92972 12.5687 5.20453 12.293 5.5439 12.293ZM8 12.293C8.33875 12.293 8.61418 12.5687 8.61418 12.9078C8.61418 13.2469 8.33875 13.5226 8 13.5226C7.66125 13.5226 7.38582 13.2469 7.38582 12.9078C7.38582 12.5687 7.66125 12.293 8 12.293ZM3.08719 9.83456C3.42655 9.83456 3.70136 10.1096 3.70136 10.4493C3.70136 10.7884 3.42655 11.0635 3.08719 11.0635C2.74843 11.0635 2.47362 10.7884 2.47362 10.4493C2.47362 10.1096 2.74843 9.83456 3.08719 9.83456ZM5.5439 9.83456C5.88265 9.83456 6.15746 10.1096 6.15746 10.4493C6.15746 10.7884 5.88265 11.0635 5.5439 11.0635C5.20453 11.0635 4.92972 10.7884 4.92972 10.4493C4.92972 10.1096 5.20453 9.83456 5.5439 9.83456ZM8 9.83456C8.33875 9.83456 8.61418 10.1096 8.61418 10.4493C8.61418 10.7884 8.33875 11.0635 8 11.0635C7.66125 11.0635 7.38582 10.7884 7.38582 10.4493C7.38582 10.1096 7.66125 9.83456 8 9.83456ZM10.4561 9.83456C10.7949 9.83456 11.0703 10.1096 11.0703 10.4493C11.0703 10.7884 10.7949 11.0635 10.4561 11.0635C10.1173 11.0635 9.84192 10.7884 9.84192 10.4493C9.84192 10.1096 10.1173 9.83456 10.4561 9.83456ZM12.9122 9.83456C13.2516 9.83456 13.5264 10.1096 13.5264 10.4493C13.5264 10.7884 13.2516 11.0635 12.9122 11.0635C12.5734 11.0635 12.2986 10.7884 12.2986 10.4493C12.2986 10.1096 12.5734 9.83456 12.9122 9.83456ZM5.5439 7.37607C5.88265 7.37607 6.15746 7.65115 6.15746 7.99023C6.15746 8.32993 5.88265 8.60501 5.5439 8.60501C5.20453 8.60501 4.92972 8.32993 4.92972 7.99023C4.92972 7.65115 5.20453 7.37607 5.5439 7.37607ZM8 7.37607C8.33875 7.37607 8.61418 7.65115 8.61418 7.99023C8.61418 8.32993 8.33875 8.60501 8 8.60501C7.66125 8.60501 7.38582 8.32993 7.38582 7.99023C7.38582 7.65115 7.66125 7.37607 8 7.37607ZM10.4561 7.37607C10.7949 7.37607 11.0703 7.65115 11.0703 7.99023C11.0703 8.32993 10.7949 8.60501 10.4561 8.60501C10.1173 8.60501 9.84192 8.32993 9.84192 7.99023C9.84192 7.65115 10.1173 7.37607 10.4561 7.37607ZM12.9122 7.37607C13.2516 7.37607 13.5264 7.65115 13.5264 7.99023C13.5264 8.32993 13.2516 8.60501 12.9122 8.60501C12.5734 8.60501 12.2986 8.32993 12.2986 7.99023C12.2986 7.65115 12.5734 7.37607 12.9122 7.37607Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span>{bookButtonText}</span>
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-yellow-400 p-2">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden absolute top-full left-0 w-full bg-black border-t border-white/10 p-4 shadow-xl"
          >
            <nav className="flex flex-col space-y-4">
              {mobileNavItems.map(({ label, url }) => {
                const href = toHref(url)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-lg font-medium transition-colors hover:text-yellow-400 ${pathname === href ? 'text-yellow-400' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                )
              })}
              <hr className="border-white/20" />
              {contactButtonHref && contactButtonText && (
                <Link
                  href={toHref(contactButtonHref)}
                  className="text-center bg-white text-black py-2 rounded-full font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {contactButtonText}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
```

- [ ] **Step 2: Verify the file compiles (no TS errors)**

Run:

```bash
npx tsc --noEmit
```

Expected: no errors in `components/HeaderClient.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/HeaderClient.tsx
git commit -m "feat: add HeaderClient component — client-side header with typed WP props"
```

---

## Task 3: Rewrite `components/Header.tsx`

**Files:**

- Modify: `components/Header.tsx`

Replace the entire file. The new `Header.tsx` is an async Server Component that fetches ThemeSetting and primary menu, extracts prop values, builds the whatsappHref, then renders `<HeaderClient>`.

- [ ] **Step 1: Replace the full contents of `components/Header.tsx`**

```tsx
import { client } from '@/lib/apollo-client'
import { GET_THEME_SETTINGS, GET_PRIMARY_MENU } from '@/lib/queries'
import { gql } from '@apollo/client'
import { HeaderClient } from './HeaderClient'

interface MenuItem {
  label: string
  url: string
}

async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    })
    return data?.themeSetting?.themeSetting ?? null
  } catch {
    return null
  }
}

async function getPrimaryMenu(): Promise<{
  nav: MenuItem[]
  mobile: MenuItem[]
}> {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PRIMARY_MENU}
      `,
    })
    const nav: MenuItem[] = data?.primaryMenu?.menuItems?.nodes ?? []
    const mobile: MenuItem[] = data?.mobileMenu?.menuItems?.nodes?.length ? data.mobileMenu.menuItems.nodes : nav
    return { nav, mobile }
  } catch {
    return { nav: [], mobile: [] }
  }
}

export default async function Header() {
  const [ts, menus] = await Promise.all([getThemeSettings(), getPrimaryMenu()])

  const whatsappHref = ts?.whatsappNumber
    ? `https://wa.me/${ts.whatsappNumber}${ts.whatsappMessage ? `?text=${encodeURIComponent(ts.whatsappMessage)}` : ''}`
    : null

  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={menus.nav}
      mobileNavItems={menus.mobile}
      whatsappHref={whatsappHref}
      bookButtonText={ts?.bookButton ?? null}
      bookButtonHref={ts?.bookButtonLink ?? null}
      contactButtonText={ts?.contactButton ?? null}
      contactButtonHref={ts?.contactButtonLink ?? null}
    />
  )
}
```

- [ ] **Step 2: Run the dev server and verify the header renders**

```bash
npm run dev
```

Open http://localhost:3000. Check:

- Header renders without a JS error
- If WP returns data: logo image appears, ticker shows if set, nav links populate from WP
- If WP returns null for a field: that element is absent (no broken image, no blank ticker bar)
- Mobile menu opens/closes

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "refactor: split Header into async server component + HeaderClient; all content from WP"
```

---

## Task 4: Update `components/Footer.tsx`

**Files:**

- Modify: `components/Footer.tsx`

This is the largest change. We need to:

1. Remove the `CONTACT`, `SOCIALS`, `MENTIONS`, `SQLINK` constants (lines 14–43)
2. Remove the CTA band section and mobile CTA bar (they don't exist in the original WP footer)
3. Add `GET_THEME_SETTINGS` import and a `getThemeSettings()` fetcher
4. Fetch ThemeSetting in parallel with footer menus
5. Replace all hardcoded data references with ThemeSetting fields
6. Use `footmenuTitleOne`–`footmenuTitleFive` for column headings (with empty string fallback)
7. Use `mentionsLogos` for the mentions strip
8. Use `socialMenuItems` for the social nav column
9. Use individual link fields (`facebookLink`, `instagramLink`, `tiktokLink`, `linkedinLink`) for bottom-bar icons
10. Use ThemeSetting for contact details, sqlink URL, footer logo, privacy/terms

- [ ] **Step 1: Replace the full contents of `components/Footer.tsx`**

```tsx
import Link from 'next/link'
import { client } from '@/lib/apollo-client'
import { GET_FOOTER_DATA, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'

/* ── Types ──────────────────────────────────────────────── */

interface MenuItem {
  label: string
  url: string
}
interface WPMenu {
  name: string
  slug: string
  menuItems: { nodes: MenuItem[] }
}
interface FooterQueryResult {
  menus: { nodes: WPMenu[] }
}

interface MentionLogo {
  mentionLogo?: { node?: { sourceUrl?: string } } | null
  mentionLogoLink?: string | null
}

interface SocialItem {
  socialMediaLink?: string | null
  socialMediaText?: string | null
}

/* ── Menu column slugs (fallback items stay; headings come from WP) ── */

const MENU_COLUMNS = [
  {
    slug: 'product-menu',
    fallback: [
      {
        label: 'Product UX & UI Design',
        url: '/services/product-ux-ui-design',
      },
      { label: 'UX Research', url: '/services/ux-research' },
      { label: 'Prototype', url: '/services/prototyping' },
      { label: 'Digital Branding', url: '/branding-studio' },
      { label: 'Front End Development', url: '/services/front-end-dev' },
    ],
  },
  {
    slug: 'case-study-menu',
    fallback: [
      { label: 'Mobile Apps', url: '/mobile-apps' },
      { label: 'Fintech & Finance', url: '/fintech-finance' },
      { label: 'IOT & Devices', url: '/device-iot' },
      { label: 'SaaS', url: '/saas-platforms' },
      { label: 'Gaming', url: '/gaming' },
      { label: 'Medical', url: '/medical-healthcare' },
      { label: 'Agritech', url: '/agritech' },
    ],
  },
  {
    slug: 'technology-menu',
    fallback: [
      { label: 'Dev & Technology', url: '/technology' },
      { label: 'Front End', url: '/services/front-end-dev' },
      { label: 'React.js', url: '/services/front-end-dev' },
      { label: 'Vue.js', url: '/services/front-end-dev' },
      { label: 'Back End', url: '/services/back-end-dev' },
      { label: 'Node.js', url: '/services/back-end-dev' },
    ],
  },
  {
    slug: 'company-menu',
    fallback: [
      { label: 'About us', url: '/about-us' },
      { label: 'Careers', url: '/careers' },
      { label: 'Our Services', url: '/services' },
      { label: 'Talk to us', url: '/contact-us' },
      {
        label: 'Press',
        url: 'https://www.themarker.com/labels/2021-04-05/ty-article-labels/0000017f-f88a-d044-adff-fbfb48ad0000',
      },
      { label: 'Accessibility', url: '/accessibility-statement' },
    ],
  },
  {
    slug: 'blog-menu',
    fallback: [
      { label: 'All Blogs', url: '/blog' },
      { label: 'Fintech & Finance', url: '/blog/the-fintech-ux-playbook/' },
      {
        label: 'IOT & Devices',
        url: '/blog/designing-intuitive-and-secure-iot-products-for-the-future/',
      },
      {
        label: 'SaaS',
        url: '/blog/the-3-most-common-pain-points-when-hiring-ui-ux-agency-for-a-saas-product/',
      },
      {
        label: 'Gaming',
        url: '/blog/level-up-your-gaming-app-with-triollas-expert-ux-tips-boost-user-engagement-and-retention/',
      },
      {
        label: 'Medical',
        url: '/blog/ux-in-medtech-when-trust-is-a-matter-of-life-and-death/',
      },
      {
        label: 'Agritech',
        url: '/blog/designing-an-engaging-and-effective-agritech-app/',
      },
    ],
  },
]

const COL_HEADING_FIELDS = ['footmenuTitleOne', 'footmenuTitleTwo', 'footmenuTitleThree', 'footmenuTitleFour', 'footmenuTitleFive'] as const

/* ── Data fetching ──────────────────────────────────────── */

async function getFooterMenus(): Promise<WPMenu[]> {
  try {
    const { data } = await client.query<FooterQueryResult>({
      query: gql`
        ${GET_FOOTER_DATA}
      `,
    })
    return data?.menus?.nodes ?? []
  } catch {
    return []
  }
}

async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    })
    return data?.themeSetting?.themeSetting ?? null
  } catch {
    return null
  }
}

/* ── Helpers ────────────────────────────────────────────── */

function isExternal(url: string): boolean {
  return url.startsWith('http') && !url.includes('triolla.io')
}

function toHref(url: string): string {
  if (isExternal(url)) return url
  return url.replace(/^https?:\/\/triolla\.io/, '') || '/'
}

function NavLink({ label, url }: { label: string; url: string }) {
  const href = toHref(url)
  const cls = 'footer-nav-link'
  return isExternal(url) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {label}
    </Link>
  )
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

function DribbbleIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function BehanceIcon() {
  return (
    <svg width="18" height="16" fill="currentColor" viewBox="0 0 24 16" aria-hidden="true">
      <path d="M7.443 5.35c.639 0 1.23.05 1.77.198.54.099 1.031.297 1.42.545.389.248.687.595.883 1.039.196.444.294.98.294 1.607 0 .694-.147 1.29-.441 1.735-.295.444-.737.84-1.326 1.186.787.198 1.376.595 1.77 1.186.393.59.589 1.285.589 2.127 0 .694-.147 1.29-.442 1.784-.295.494-.687.889-1.18 1.186-.492.297-1.031.544-1.67.694-.638.148-1.277.248-1.917.248H0V5.35h7.443zm-.344 5.302c.54 0 .982-.148 1.326-.395.344-.248.491-.644.491-1.136 0-.294-.05-.544-.147-.74-.1-.199-.246-.346-.44-.445-.196-.1-.393-.198-.64-.248-.246-.05-.491-.05-.786-.05H2.556v3.014h4.543zm.197 5.5c.295 0 .59-.05.835-.099.246-.05.491-.148.687-.297.196-.148.344-.346.491-.594.099-.248.197-.545.197-.89 0-.693-.196-1.186-.59-1.484-.393-.297-.884-.445-1.473-.445H2.556v3.81h4.74zM16.935 11.5c.344.347.835.543 1.47.543.393 0 .786-.099 1.13-.297.344-.198.54-.445.638-.693h2.358c-.393 1.14-.983 1.982-1.769 2.525-.786.545-1.77.79-2.949.79-.786 0-1.523-.099-2.162-.346-.638-.248-1.18-.595-1.622-1.039-.442-.445-.786-.98-1.032-1.584-.246-.595-.343-1.29-.343-1.982 0-.693.099-1.387.343-1.982.245-.594.59-1.14 1.032-1.584.442-.444.984-.79 1.622-1.038.64-.248 1.375-.347 2.162-.347.886 0 1.67.148 2.308.494.638.347 1.18.793 1.622 1.387.44.593.736 1.237.884 1.98.098.742.098 1.533 0 2.225h-6.995c.05.79.294 1.384.637 1.731zm3.21-4.857c-.295-.346-.786-.494-1.425-.494-.393 0-.737.05-1.031.198-.295.148-.491.297-.688.494-.196.198-.295.396-.344.594-.099.198-.099.395-.147.544h4.29c-.098-.644-.394-1.09-.655-1.336zM15.167 4.9H20.7V3.566h-5.533V4.9z" />
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

export default async function Footer() {
  const [ts, wpMenus] = await Promise.all([getThemeSettings(), getFooterMenus()])

  const colHeadings: (string | null)[] = COL_HEADING_FIELDS.map((field) => ts?.[field] ?? null)

  const columns = MENU_COLUMNS.map((col, i) => {
    const wpMenu = wpMenus.find(
      (m) => m.slug === col.slug || m.slug === `footer-${col.slug}` || m.name.toLowerCase().replace(/\s+/g, '-') === col.slug,
    )
    const items = wpMenu?.menuItems?.nodes?.length ? wpMenu.menuItems.nodes : col.fallback
    return { heading: colHeadings[i], items }
  })

  const mentions: MentionLogo[] = ts?.mentionsLogos ?? []
  const socials: SocialItem[] = ts?.socialMenuItems ?? []

  const logoUrl: string | null = ts?.siteLogo?.node?.sourceUrl ?? null
  const sqlinkUrl: string | null = ts?.sqlink ?? null
  const emailAddress: string | null = ts?.emailAddress ?? null
  const tlvLabel: string | null = ts?.tlvOfficesLabel ?? null
  const tlvPhone: string | null = ts?.tlvOfficesPhone ?? null
  const nyLabel: string | null = ts?.nyOfficesLabel ?? null
  const nyPhone: string | null = ts?.nyOfficesPhone ?? null
  const privacyText: string | null = ts?.footerPrivacyText ?? null
  const privacyLink: string | null = ts?.footerPrivacyLink ?? null
  const termText: string | null = ts?.footerTermText ?? null
  const termLink: string | null = ts?.footerTermLink ?? null
  const mentionsLabel: string | null = ts?.footerMentionsLabel ?? null
  const fbLink: string | null = ts?.facebookLink ?? null
  const igLink: string | null = ts?.instagramLink ?? null
  const ttLink: string | null = ts?.tiktokLink ?? null
  const liLink: string | null = ts?.linkedinLink ?? null

  return (
    <footer className="bg-[#0f0f0f] text-white overflow-hidden">
      {/* ══════════════════════════════════════════
          MENTIONS STRIP
      ══════════════════════════════════════════ */}
      {mentions.length > 0 && (
        <div className="border-b border-white/5 py-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              {mentionsLabel && <span className="footer-mentions-label">{mentionsLabel}</span>}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 md:gap-10">
                {mentions.map((m, i) => {
                  const src = m.mentionLogo?.node?.sourceUrl
                  if (!src) return null
                  return (
                    <a key={i} href={m.mentionLogoLink ?? undefined} target="_blank" rel="noopener noreferrer" className="footer-mention">
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
      ══════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">
          {columns.map((col, i) => (
            <div key={i}>
              {col.heading && <h3 className="footer-col-heading">{col.heading}</h3>}
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <NavLink label={item.label} url={item.url} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social + Contact column */}
          <div className="col-span-2 md:col-span-1">
            {socials.length > 0 && (
              <>
                <h3 className="footer-col-heading">Social</h3>
                <ul className="space-y-3 mb-10">
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
              </>
            )}

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
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
                  <a href={privacyLink} className="footer-bottom-link">
                    {privacyText}
                  </a>
                </>
              )}
              {termText && termLink && (
                <>
                  {' | '}
                  <a href={termLink} className="footer-bottom-link">
                    {termText}
                  </a>
                </>
              )}
            </p>

            {/* Mobile social icons */}
            <div className="flex items-center gap-3 md:hidden">
              {ttLink && (
                <a href={ttLink} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              )}
              {igLink && (
                <a href={igLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {fbLink && (
                <a href={fbLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
            </div>

            {/* Right: language + sqlink + social (desktop) */}
            <div className="hidden md:flex items-center gap-5">
              <div className="footer-lang flex items-center gap-2">
                <GlobeIcon />
                <a
                  href="https://triolla.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-lang__opt footer-lang__opt--active"
                >
                  Eng
                </a>
                <span className="footer-lang__sep">/</span>
                <a href="https://triolla.io/he/" target="_blank" rel="noopener noreferrer" className="footer-lang__opt">
                  Heb
                </a>
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
          STYLES (unchanged from previous)
      ══════════════════════════════════════════ */}
      <style>{`
        /* ── Mentions strip ────────────────────── */
        .footer-mentions-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4b5563;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 80px;
        }
        .footer-mention {
          display: flex;
          align-items: center;
          transition: transform 0.25s, opacity 0.25s;
          opacity: 0.45;
        }
        .footer-mention:hover {
          opacity: 0.85;
          transform: translateY(-2px);
        }
        .footer-mention__img {
          height: 30px;
          width: auto;
          max-width: 110px;
          object-fit: contain;
          filter: brightness(0) invert(1);
          transition: filter 0.25s;
        }
        .footer-mention:hover .footer-mention__img {
          filter: brightness(0) saturate(100%) invert(87%) sepia(63%) saturate(600%) hue-rotate(1deg) brightness(103%) contrast(102%);
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
      `}</style>
    </footer>
  )
}
```

- [ ] **Step 2: Run the dev server and verify the footer renders**

```bash
npm run dev
```

Open http://localhost:3000. Check:

- Footer renders without errors
- Mentions strip shows if WP has `mentionsLogos` data, hidden if empty
- Nav columns render with WP headings (or no heading if WP field is null)
- Social column renders if WP has `socialMenuItems`
- Contact details show from WP (`emailAddress`, `tlvOfficesPhone`, `nyOfficesPhone`)
- Bottom bar: logo from WP, sqlink link from WP, social icons from individual link fields
- Privacy / Terms links render with WP text and href
- CTA band and mobile CTA bar are gone

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "refactor: replace all hardcoded Footer constants with WP ThemeSetting data; remove CTA band"
```

---

## Task 5: Update `app/page.tsx`

**Files:**

- Modify: `app/page.tsx`

Three changes: (A) empty hero fallback strings, (B) replace hardcoded contact info cards with ThemeSetting data, (C) insert FAQ section after the Design Process timeline.

- [ ] **Step 1: Add the ThemeSetting import and parallel fetch**

At the top of the file, add the import alongside the existing one:

```ts
import { GET_HOME_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
```

Replace the single `getHomeData()` call in the `Home()` function:

```ts
// OLD:
const hp = await getHomeData()

// NEW:
async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    })
    return data?.themeSetting?.themeSetting ?? null
  } catch {
    return null
  }
}

// Inside Home():
const [hp, ts] = await Promise.all([getHomeData(), getThemeSettings()])
```

- [ ] **Step 2: Empty the hero fallback strings**

```ts
// OLD:
const heroHeadline = stripHtml(hp.topsectitle) || 'Creative Design Attracts People. Smart UX Makes Them Stay'
const heroSubtext =
  stripHtml(hp.toptext) || 'Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups'

// NEW:
const heroHeadline = stripHtml(hp.topsectitle ?? '')
const heroSubtext = stripHtml(hp.toptext ?? '')
```

- [ ] **Step 3: Build contact items from ThemeSetting**

Replace the hardcoded contact array (currently lines ~450–466) with a derived array from `ts`. Add this variable just before the `return (`:

```ts
const contactItems = [
  ts?.cEmailLabel && ts?.cEmailAddress
    ? {
        label: ts.cEmailLabel,
        value: ts.cEmailAddress,
        href: `mailto:${ts.cEmailAddress}`,
      }
    : null,
  ts?.cTlvLabel && ts?.cTlvNumber
    ? {
        label: ts.cTlvLabel,
        value: ts.cTlvNumber,
        href: `tel:${ts.cTlvNumber.replace(/[^+\d]/g, '')}`,
      }
    : null,
  ts?.cNyLabel && ts?.cNyNumber
    ? {
        label: ts.cNyLabel,
        value: ts.cNyNumber,
        href: `tel:${ts.cNyNumber.replace(/[^+\d]/g, '')}`,
      }
    : null,
  ts?.cAddressLabel && ts?.cAddress ? { label: ts.cAddressLabel, value: ts.cAddress, href: undefined } : null,
].filter((x): x is NonNullable<typeof x> => x !== null)
```

- [ ] **Step 4: Update the contact section JSX**

Find the right-side contact column in the JSX (currently `<div className="md:w-1/3 flex flex-col gap-5 md:pt-28">`). Replace the hardcoded array `.map(...)` with the `contactItems` array:

```tsx
<div className="md:w-1/3 flex flex-col gap-5 md:pt-28">
  {ts?.cCallUsLabel && <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{ts.cCallUsLabel}</p>}
  {contactItems.map((item, i) => (
    <div key={i} className="contact-info-card">
      <div className="contact-info-card__label">{item.label}</div>
      {item.href ? (
        <a href={item.href} className="contact-info-card__value contact-info-card__value--link">
          {item.value}
        </a>
      ) : (
        <div className="contact-info-card__value">{item.value}</div>
      )}
    </div>
  ))}
</div>
```

- [ ] **Step 5: Add the FAQ section**

Add this import at the top of `app/page.tsx`:

```ts
import { FAQAccordion } from '@/components/FAQAccordion'
```

Prepare the FAQ items variable alongside the other derived variables:

```ts
const faqItems = (ts?.questionAnswerList ?? [])
  .filter((q: any) => q?.fQuestion)
  .map((q: any) => ({
    faqQuestion: q.fQuestion as string,
    faqAnswer: (q.fAnswer ?? '') as string,
  }))
```

Insert this JSX block **after** the closing `</section>` tag of the Design Process Timeline section (which ends with `</SectionReveal>` and `</section>`) and **before** the Contact section:

```tsx
{
  /* ══════════════════════════════════════════════
    FAQ SECTION
══════════════════════════════════════════════ */
}
{
  faqItems.length > 0 && (
    <section className="py-24 max-w-[1400px] mx-auto px-4 lg:px-8 mb-32">
      <div className="text-center mb-16">
        {ts?.faqHeading && <h3 className="text-4xl md:text-5xl font-bold tracking-tighter">{ts.faqHeading}</h3>}
        {ts?.faqShortText && <p className="text-xl text-gray-400 mt-4 max-w-xl mx-auto">{ts.faqShortText}</p>}
      </div>
      <FAQAccordion items={faqItems} />
    </section>
  )
}
```

- [ ] **Step 6: Run the dev server and verify all three changes**

```bash
npm run dev
```

Open http://localhost:3000. Check:

- Hero: if WP has `topsectitle`/`toptext`, they show. If WP returns empty, no fallback text appears (blank headline is expected behaviour).
- Contact section: cards show WP values from `cEmailLabel`/`cEmailAddress`, TLV, NY, address. `cCallUsLabel` shows as a subheading if present.
- FAQ section: appears between Design Process and Contact if WP has `questionAnswerList` items; hidden if the list is empty.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage fetches ThemeSetting; WP contact cards, FAQ section, empty hero fallbacks"
```

---

## Self-review checklist (against spec)

| Spec requirement                                                              | Covered       |
| ----------------------------------------------------------------------------- | ------------- |
| `GET_FOOTER_OPTIONS` deleted                                                  | Task 1        |
| `GET_THEME_SETTINGS` added with correct root path `themeSetting.themeSetting` | Task 1        |
| `GET_PRIMARY_MENU` for PRIMARY_MENU + MOBILE_HEADER_MENU locations            | Task 1        |
| Header split into Server + Client component                                   | Tasks 2 & 3   |
| HeaderClient: ticker, logo, nav, mobile nav, WA, book, contact from props     | Task 2        |
| Header server: builds whatsappHref, passes all props, try/catch fallback      | Task 3        |
| Footer: `CONTACT`, `SOCIALS`, `MENTIONS`, `SQLINK` constants removed          | Task 4        |
| Footer: CTA band removed                                                      | Task 4        |
| Footer: Mobile CTA bar removed                                                | Task 4        |
| Footer: mentions, socials, contact, headings, logo, sqlink, privacy from WP   | Task 4        |
| Footer column headings from `footmenuTitleOne`–`footmenuTitleFive`            | Task 4        |
| Homepage: hero fallbacks emptied                                              | Task 5        |
| Homepage: contact cards from ThemeSetting                                     | Task 5        |
| Homepage: FAQ section added after Design Process                              | Task 5        |
| `mentionsLogos` uses `mentionLogo`/`mentionLogoLink` (schema-verified)        | Task 1 & 4    |
| `socialMenuItems` uses `socialMediaLink`/`socialMediaText` (schema-verified)  | Task 1 & 4    |
| `questionAnswerList` remaps `fQuestion`→`faqQuestion`, `fAnswer`→`faqAnswer`  | Task 5        |
| All try/catch — null on failure, section hidden                               | Tasks 3, 4, 5 |
