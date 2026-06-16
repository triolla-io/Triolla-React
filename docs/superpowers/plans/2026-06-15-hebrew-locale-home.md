# Hebrew Locale Support (Home Page) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Hebrew (`/he/`) locale support to the Next.js site via a `[locale]` route segment, and pull the Hebrew Home page content + assets from the existing WordPress backend through the same WPGraphQL/Apollo pattern already in use.

**Architecture:** WordPress (WPML) already stores the Hebrew Home page as a regular page (slug `home-new-he`) in the same install. It resolves through the **existing** `https://triolla.io/graphql` endpoint with the **same** `Template_HomePageNew` type and `homePage` ACF field group — verified live. No backend plugin, no REST API, no schema change. We introduce a `[locale]` dynamic segment (all routes move under it because Next.js forbids two differently-named dynamic segments — `[locale]` and the existing `[slug]` — at the app root), a `lib/i18n.ts` config, and a `middleware.ts` that keeps English URLs prefix-free while serving Hebrew under `/he/`. The Home page selects the WP page URI by locale. The `<html>` element gets `lang`/`dir` per locale for RTL.

**Tech Stack:** Next.js 16 App Router, Apollo Client v4 (Server Components), WPGraphQL, Tailwind v4, TypeScript.

---

## Scope

**In scope (this plan):**
- `[locale]` routing infrastructure (`en` default, `he` under `/he/`), RTL `<html dir>`.
- Hebrew **Home page** body content + assets, fetched from WP by Hebrew slug.
- Footer language toggle wired to internal `/` ↔ `/he` links (replacing the external WP links).

**Explicitly out of scope (documented follow-ups):**
- **Translated navigation menus + theme settings.** Verified live: WPGraphQL exposes only one `header-menu` / footer menus (English labels) and a single global `themeSetting`. WPML serves menu/string translations contextually, which WPGraphQL cannot reach without the `wp-graphql-wpml` bridge plugin (not installed). CLAUDE.md forbids hardcoding text, so the Header/Footer chrome **stays English** on `/he/` until that plugin is enabled on the backend. This is a backend task, tracked at the end of this plan, not implemented here.
- Hebrew content for any page other than Home (About, Services, Contact, etc.). Other routes still exist under `/he/` for structural uniformity but render their existing English content for now. Each gets wired in a future plan by adding its Hebrew slug to the i18n map.

**Verification model:** This repo has **no test suite** (per CLAUDE.md). "Verify" steps therefore use `npm run build`, `npm run lint`, and live checks against `npm run dev` (curl + browser), not unit tests.

---

## File Structure

**New files**
- `lib/i18n.ts` — locale list, default locale, `dir`/`lang` maps, and the route→WP-URI map per locale (starts with Home).
- `middleware.ts` — rewrites prefix-free English paths to the internal `/en/...` segment; leaves `/he/...` as-is; redirects accidental `/en/...` to the clean path.

**Moved files** (no logic change except the layout and Home page — moves are import-safe because the codebase imports via the `@/` alias, not relative `../` paths)
- `app/layout.tsx` → `app/[locale]/layout.tsx` (becomes locale-aware)
- `app/page.tsx` → `app/[locale]/page.tsx` (becomes locale-aware)
- `app/[slug]/` → `app/[locale]/[slug]/` (portfolio; `generateStaticParams` updated for locale)
- `app/about-us/` → `app/[locale]/about-us/`
- `app/accessibility-statement/` → `app/[locale]/accessibility-statement/`
- `app/blog/` → `app/[locale]/blog/` (includes `blog/[slug]/`)
- `app/branding-studio/` → `app/[locale]/branding-studio/`
- `app/careers/` → `app/[locale]/careers/`
- `app/contact-us/` → `app/[locale]/contact-us/`
- `app/privacy-policy/` → `app/[locale]/privacy-policy/`
- `app/services/` → `app/[locale]/services/`
- `app/technology/` → `app/[locale]/technology/`
- `app/terms-of-use/` → `app/[locale]/terms-of-use/`
- `app/globals.css` stays at `app/globals.css`; the moved layout import becomes `import '../globals.css'`.

**Modified files**
- `lib/queries.ts` — add a URI-parameterized Home query.
- `lib/graphql-types.ts` — reuse existing `GetHomePageData` (already shaped as `page.template.homePage`); no new type needed (confirmed in Task 2).
- `components/Footer.tsx` — language toggle → internal locale links reflecting the active locale.

---

## Task 1: Locale configuration module

**Files:**
- Create: `lib/i18n.ts`

- [ ] **Step 1: Create the i18n config**

Create `lib/i18n.ts`:

```ts
// Locale configuration for the bilingual (EN default, HE under /he/) site.
// Hebrew content lives in the SAME WordPress install; pages are addressed by
// their Hebrew slug via the existing WPGraphQL endpoint. Add a route's Hebrew
// slug to PAGE_URI as it gets localized.

export const locales = ['en', 'he'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** HTML `dir` attribute per locale. */
export const dir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  he: 'rtl',
}

/** HTML `lang` attribute per locale. */
export const htmlLang: Record<Locale, string> = {
  en: 'en',
  he: 'he',
}

/**
 * WordPress page URI per route, per locale, queried with `idType: URI`.
 * Verified live: en `/` and he `home-new-he` both resolve to
 * Template_HomePageNew with the homePage ACF field group.
 * Extend this map (keyed by a stable route id) as more pages are localized.
 */
export const PAGE_URI: Record<string, Record<Locale, string>> = {
  home: { en: '/', he: 'home-new-he' },
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: No new errors referencing `lib/i18n.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/i18n.ts
git commit -m "feat(i18n): add locale configuration module"
```

---

## Task 2: URI-parameterized Home query

The existing `GET_HOME_PAGE` hardcodes `page(id: "/", idType: URI)`. Add a variant accepting a `$uri` so the Home page can fetch either locale's WP page. Keep the existing constant untouched (other code may rely on it).

**Files:**
- Modify: `lib/queries.ts:98-124`

- [ ] **Step 1: Confirm the Hebrew page resolves with the same field group (sanity check, read-only)**

Run:
```bash
curl -s -m 25 -X POST "https://triolla.io/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"query($uri: ID!){ page(id: $uri, idType: URI){ template { ... on Template_HomePageNew { homePage { topsectitle winTitle } } } } }","variables":{"uri":"home-new-he"}}'
```
Expected: JSON with Hebrew `topsectitle` and `winTitle` strings (non-null).

- [ ] **Step 2: Add the parameterized query**

In `lib/queries.ts`, immediately after the existing `GET_HOME_PAGE` constant (ends at line 124), add:

```ts
// Same shape as GET_HOME_PAGE but URI-parameterized so the Home route can
// fetch the page for the active locale (en `/`, he `home-new-he`).
export const GET_HOME_PAGE_BY_URI = `
  query GetHomePageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_HomePageNew {
          homePage {
            topsectitle
            toptext
            uDesignHeading
            uSortText
            designType { dName }
            winTitle
            winSubtitle
            wboxes { wboxTitle winImg { node { sourceUrl } } }
            abthretitle
            abtthretext
            abthrelist {
              abteintitle
              abthreintext
              abthreimage { node { sourceUrl } }
            }
          }
        }
      }
    }
  }
`
```

- [ ] **Step 3: Verify the existing `GetHomePageData` type matches (no new type needed)**

Open `lib/graphql-types.ts` and confirm `GetHomePageData` is shaped `{ page: { template: { homePage: HomePageFields } | null } | null }`. The parameterized query returns the identical selection set, so `TypedDocumentNode<GetHomePageData>` is correct. If — and only if — the existing type is named differently or narrower, note the exact name to reuse in Task 5; do not invent a new type.

Run: `npx tsc --noEmit`
Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/queries.ts
git commit -m "feat(i18n): add URI-parameterized Home page query"
```

---

## Task 3: Locale middleware

Keeps English URLs prefix-free (`/about-us`) by rewriting them to the internal `/en/...` segment, serves Hebrew literally under `/he/...`, and redirects any accidental visible `/en/...` to the clean path to avoid duplicate URLs.

**Files:**
- Create: `middleware.ts` (repo root, sibling of `next.config.ts`)

- [ ] **Step 1: Create the middleware**

Create `middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n'

const NON_DEFAULT_LOCALES = locales.filter((l) => l !== defaultLocale)

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // A non-default locale (e.g. /he, /he/...) is served as-is.
  const isNonDefaultLocale = NON_DEFAULT_LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (isNonDefaultLocale) return NextResponse.next()

  // Redirect a visible default-locale prefix (/en, /en/...) to the clean path.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || '/'
    return NextResponse.redirect(url)
  }

  // Everything else is the default locale: rewrite to /en/... internally,
  // keeping the visible URL prefix-free.
  const url = req.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Next internals, API routes, and files with an extension (assets).
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: No new errors. (Routes don't exist under `[locale]` yet — that's Task 4; the middleware only rewrites paths and is verified end-to-end in Task 4 Step 5.)

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(i18n): add locale routing middleware"
```

---

## Task 4: Restructure routes under `[locale]` + locale-aware layout

Move all routes under `app/[locale]/`. Imports use the `@/` alias so they survive the move unchanged. The layout becomes locale-aware (`lang`/`dir`). After this task English behavior must be byte-for-byte unchanged at the same URLs.

**Files:**
- Move: every folder/file listed in **Moved files** above into `app/[locale]/`
- Modify: `app/[locale]/layout.tsx` (the moved layout)

- [ ] **Step 1: Move the routes with git (preserves history)**

Run from repo root:

```bash
mkdir -p "app/[locale]"
git mv "app/layout.tsx" "app/[locale]/layout.tsx"
git mv "app/page.tsx" "app/[locale]/page.tsx"
git mv "app/[slug]" "app/[locale]/[slug]"
git mv "app/about-us" "app/[locale]/about-us"
git mv "app/accessibility-statement" "app/[locale]/accessibility-statement"
git mv "app/blog" "app/[locale]/blog"
git mv "app/branding-studio" "app/[locale]/branding-studio"
git mv "app/careers" "app/[locale]/careers"
git mv "app/contact-us" "app/[locale]/contact-us"
git mv "app/privacy-policy" "app/[locale]/privacy-policy"
git mv "app/services" "app/[locale]/services"
git mv "app/technology" "app/[locale]/technology"
git mv "app/terms-of-use" "app/[locale]/terms-of-use"
```

Leave `app/globals.css` where it is. Confirm: `app/` now contains only `globals.css` and `[locale]/`.

Run: `ls app && echo "---" && ls "app/[locale]"`
Expected: `app/` → `globals.css  [locale]`. `app/[locale]/` → all the moved folders + `layout.tsx` + `page.tsx`.

- [ ] **Step 2: Fix the globals.css import in the moved layout**

In `app/[locale]/layout.tsx`, the import is now one level deeper. Change:

```ts
import './globals.css'
```

to:

```ts
import '../globals.css'
```

- [ ] **Step 3: Make the layout locale-aware**

Replace the layout's imports-and-signature region and the `<html>` tag. Full updated `app/[locale]/layout.tsx`:

```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import { BfcacheReloader } from '@/components/BfcacheReloader'
import { MotionProvider } from '@/components/MotionProvider'
import { locales, defaultLocale, isLocale, dir, htmlLang } from '@/lib/i18n'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Triolla | Product Design & Development',
  description: 'Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale

  return (
    <html lang={htmlLang[loc]} dir={dir[loc]} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F5F5F5] text-black selection:bg-yellow-400 selection:text-black pb-[env(safe-area-inset-bottom)]">
        <MotionProvider>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
          <CookieBanner />
        </MotionProvider>
        <BfcacheReloader />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Update portfolio `generateStaticParams` for the locale param**

`app/[locale]/[slug]/page.tsx` now receives a `locale` param and its `generateStaticParams` must return `locale` alongside `slug`, or the build errors. Replace the `generateStaticParams` function (currently `app/[locale]/[slug]/page.tsx:26-44`) with:

```tsx
export async function generateStaticParams() {
  try {
    const { data } = await client.query({ query: PORTFOLIO_SLUGS_QUERY })

    const nodes = data?.pages?.nodes ?? []
    const slugs = nodes.flatMap((n) => {
      if (n?.template?.__typename === 'Template_PortfolioPage') {
        const slug = (n.uri ?? '').replace(/^\/+|\/+$/g, '')
        if (slug.length > 0) {
          return [slug]
        }
      }
      return []
    })

    // Portfolio pages are English-only for now; emit them under the default locale.
    return slugs.map((slug) => ({ locale: defaultLocale, slug }))
  } catch {
    // Build emits no portfolio routes rather than crashing.
    return []
  }
}
```

Add `defaultLocale` to the imports at the top of that file:

```tsx
import { defaultLocale } from '@/lib/i18n'
```

Update the component's `params` type (currently `app/[locale]/[slug]/page.tsx:67`) from `Promise<{ slug: string }>` to `Promise<{ locale: string; slug: string }>` and destructure only `slug` (locale unused here):

```tsx
export default async function PortfolioSlugPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params
```

> Note: `dynamicParams = false` (line 24) stays. With only `{ locale: 'en' }` portfolio params emitted, `/he/<portfolio-slug>` correctly 404s — Hebrew portfolio pages are not in scope.

- [ ] **Step 5: Build and verify English is unchanged**

Run: `npm run build`
Expected: Build succeeds. No "different slug names for the same dynamic path" error (the old `[slug]`/root conflict is gone). Portfolio routes appear under `/<slug>` (the `/en` prefix is stripped by middleware redirect at runtime).

Then run the dev server and check English routes still serve at their original URLs:

```bash
npm run dev &
sleep 6
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L http://localhost:3000/
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L http://localhost:3000/about-us
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" -L http://localhost:3000/en   # should redirect to /
kill %1
```
Expected: `/` → `200 .../`; `/about-us` → `200 .../about-us`; `/en` → `200 .../` (redirected). English Home content unchanged.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(i18n): move routes under [locale] segment, locale-aware layout"
```

---

## Task 5: Locale-aware Home page (Hebrew content + assets)

Make the Home page fetch the WP page for the active locale via the parameterized query and `PAGE_URI`. Assets come from whichever page WP returns (Hebrew `winImg` is `null` where English had images — verified live — so existing `?? null` handling already renders nothing rather than an English asset). No content is hardcoded.

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Swap the query import and make `getHomeData` locale-aware**

In `app/[locale]/page.tsx`, change the queries import (line 13) from:

```tsx
import { GET_HOME_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
```

to:

```tsx
import { GET_HOME_PAGE_BY_URI, GET_THEME_SETTINGS } from '@/lib/queries'
```

Add the i18n import below the existing `@/lib/text` import (line 18):

```tsx
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

Replace the `HOME_PAGE_QUERY` constant (lines 20-22) with:

```tsx
const HOME_PAGE_QUERY: TypedDocumentNode<GetHomePageData> = gql`
  ${GET_HOME_PAGE_BY_URI}
`
```

Replace `getHomeData` (lines 45-52) to accept the page URI:

```tsx
async function getHomeData(uri: string): Promise<HomePageFields> {
  try {
    const { data } = await client.query({ query: HOME_PAGE_QUERY, variables: { uri } })
    return data?.page?.template?.homePage ?? ({} as HomePageFields)
  } catch {
    return {} as HomePageFields
  }
}
```

- [ ] **Step 2: Read the locale param and pass the URI**

Change the page signature and the first line of the function body. Replace:

```tsx
export default async function Home() {
  const [hp, ts] = await Promise.all([getHomeData(), getThemeSettings()])
```

with:

```tsx
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [hp, ts] = await Promise.all([getHomeData(PAGE_URI.home[loc]), getThemeSettings()])
```

> Everything below (`heroHeadline`, `awards`, JSX, etc.) is unchanged — it already reads from `hp` and renders `null` for absent assets, which satisfies the "no fallback strings, assets from WP only" rule for Hebrew.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: Build succeeds; both `/` and `/he` Home variants are generated (static params `en`, `he`).

- [ ] **Step 4: Verify Hebrew Home renders real WP content + RTL**

```bash
npm run dev &
sleep 6
# Hebrew home returns 200 and contains Hebrew hero copy + RTL direction
curl -s -L http://localhost:3000/he | grep -o 'dir="rtl"' | head -1
curl -s -L http://localhost:3000/he | grep -o 'עיצוב יצירתי' | head -1
# English home still LTR and English
curl -s -L http://localhost:3000/ | grep -o 'dir="ltr"' | head -1
kill %1
```
Expected: `/he` → `dir="rtl"` present and the Hebrew hero phrase `עיצוב יצירתי` present (from the live `topsectitle`); `/` → `dir="ltr"`. Also open `http://localhost:3000/he` in a browser and confirm the hero, "winners" boxes (Hebrew labels, no English medal images where WP returns null), and "why us" section show Hebrew text laid out RTL.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: No new warnings/errors in `app/[locale]/page.tsx`.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "feat(i18n): render Hebrew Home content by locale from WordPress"
```

---

## Task 6: Footer language toggle → internal locale links

Replace the two external WP links (`https://triolla.io/` and `https://triolla.io/he/`) with internal `/` ↔ `/he` links, and mark the active option based on the current locale. The toggle labels "Eng"/"Heb" are existing UI strings, not WP content, so they stay as-is (this is chrome, consistent with the rest of the Footer's hardcoded structural labels).

**Files:**
- Modify: `components/Footer.tsx:369-385`

- [ ] **Step 1: Determine how Footer knows the active locale**

Footer is a Server Component. Read the top of `components/Footer.tsx` to see whether it already receives params or reads headers. The middleware rewrite means the rendered tree's locale is available via the layout's param, but Footer is rendered by the layout without that prop. Use `next/headers` to read the request path, OR thread `locale` from the layout. Choose the **layout-thread** approach (explicit, no header parsing):

In `app/[locale]/layout.tsx`, pass `locale` to Footer. Change `<Footer />` to `<Footer locale={loc} />`.

- [ ] **Step 2: Accept the `locale` prop in Footer**

Open `components/Footer.tsx`. Find the component signature (the `export default function Footer(...)` or `export default async function Footer(...)`). Add an optional `locale` prop typed against the i18n `Locale`:

```tsx
import type { Locale } from '@/lib/i18n'
import { defaultLocale } from '@/lib/i18n'
```

and change the signature to accept `{ locale = defaultLocale }: { locale?: Locale }` (merge with any existing props — if Footer currently takes no props, add this object param).

- [ ] **Step 3: Replace the language toggle markup**

Replace `components/Footer.tsx:371-385` (the `<div className="footer-lang ...">` block) with:

```tsx
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
```

Ensure `Link` is imported at the top of `components/Footer.tsx` (`import Link from 'next/link'`); add it if absent.

- [ ] **Step 4: Build + verify the toggle**

Run: `npm run build`
Expected: success.

```bash
npm run dev &
sleep 6
# On /he, "Heb" carries the active class
curl -s -L http://localhost:3000/he | grep -o 'footer-lang__opt--active[^<]*Heb' | head -1
kill %1
```
Expected: the active class lands on the Hebrew option when on `/he` (and on the English option when on `/`). Also click the toggle in a browser: `/` ↔ `/he` navigates internally (no external redirect to the old WP site).

- [ ] **Step 5: Commit**

```bash
git add components/Footer.tsx "app/[locale]/layout.tsx"
git commit -m "feat(i18n): wire footer language toggle to internal locale routes"
```

---

## Task 7: Final verification & documentation

**Files:**
- Modify: `CLAUDE.md` (add a short i18n note)

- [ ] **Step 1: Full build + lint**

Run: `npm run build && npm run lint`
Expected: Build succeeds; no new lint errors.

- [ ] **Step 2: Route matrix smoke test**

```bash
npm run dev &
sleep 6
for p in / /he /about-us /he/about-us; do
  curl -s -o /dev/null -w "%{http_code} -> %{url_effective}\n" -L "http://localhost:3000$p"
done
kill %1
```
Expected:
- `/` → 200 (English Home, LTR)
- `/he` → 200 (Hebrew Home, RTL, Hebrew content)
- `/about-us` → 200 (English, unchanged)
- `/he/about-us` → 200 (renders; English content for now — documented interim, English chrome)

- [ ] **Step 3: Document the i18n model in CLAUDE.md**

Add this section to `CLAUDE.md` under "Architecture" (after the "Data Fetching" subsection):

```markdown
### Internationalization (i18n)

Bilingual via a `[locale]` route segment: English is the default (prefix-free URLs, internal `/en`), Hebrew is served under `/he/` (`dir="rtl"`). Config in `lib/i18n.ts`; `middleware.ts` keeps English URLs clean and redirects `/en/...`. Hebrew content lives in the SAME WordPress install (WPML) and is fetched through the existing WPGraphQL endpoint by the page's Hebrew slug — see `PAGE_URI` in `lib/i18n.ts`. Add a route's Hebrew slug there to localize it. Assets differ per locale and come from whatever WP returns for that page; render `null` when absent — never reuse the English asset.

**Backend follow-up (not yet done):** Navigation menus and `themeSetting` are not translatable via WPGraphQL without the `wp-graphql-wpml` plugin. Until it is enabled, Header/Footer chrome renders English on `/he/`. Do not hardcode Hebrew chrome text.
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(i18n): document locale model and backend follow-up"
```

---

## Backend Follow-Up (out of scope, for the user / WP admin)

To fully translate navigation menus, theme settings, and additional pages via the existing GraphQL pattern:

1. Install & activate **`wp-graphql-wpml`** on the WordPress backend.
2. Regenerate the schema: `npx get-graphql-schema https://triolla.io/graphql > schema.graphql`.
3. Confirm a `language`/`translations` arg/field now appears on `page`, `menu`, and `themeSetting`.
4. Then a follow-up plan can add per-locale menu/theme queries and remove the "English chrome on /he" interim note.

---

## Self-Review

**Spec coverage:**
- "Pull Hebrew content from WP" → Tasks 2, 5 (Home via Hebrew slug, existing pattern). ✓
- "Check the assets — they differ in Hebrew" → verified live (Hebrew `winImg` null); Task 5 Step 2 relies on existing `?? null` handling, never reuses English assets, and the doc note in Task 7 codifies it. ✓
- "Keep the code standard/structure/order, don't make a mess" → no REST/second data layer; same Apollo/queries.ts pattern; `@/`-alias moves preserve imports; i18n isolated in `lib/i18n.ts` + `middleware.ts`. ✓
- "Take only a few pages to start" → Home only; other routes unchanged English. ✓
- `/he/` subpath via `[locale]` segment (user's routing choice) → Tasks 3, 4. ✓

**Placeholder scan:** No "TBD/handle edge cases/similar to" — every code step shows full code. Line numbers reference current files; later tasks reference post-move paths under `app/[locale]/`.

**Type consistency:** `getHomeData(uri: string)` (Task 5) matches `variables: { uri }` against `GetHomePageByUri($uri: ID!)` (Task 2). `PAGE_URI.home[loc]` / `isLocale` / `defaultLocale` / `dir` / `htmlLang` names match `lib/i18n.ts` (Task 1) exactly. Footer `locale?: Locale` matches the layout passing `loc` (a `Locale`). Portfolio `generateStaticParams` returns `{ locale, slug }` matching its updated `params` type.

**Known interim (intentional, documented):** non-Home routes under `/he/` show English content + English chrome until `wp-graphql-wpml` is enabled and each page's Hebrew slug is added to `PAGE_URI`.
