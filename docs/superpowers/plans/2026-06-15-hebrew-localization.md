# Hebrew Localization — All Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire every page of the Triolla Next.js site to fetch its locale-specific WordPress content when the visitor is on `/he/*`, using the same pattern already in place on the home page.

**Architecture:** Each page receives `params.locale`, validates it via `isLocale()`, then looks up the WordPress URI for that locale from `PAGE_URI` in `lib/i18n.ts`. Queries that currently hardcode an English slug are refactored to accept a `$uri: ID!` variable so the same query serves both locales. Images and copy come from whatever WP/WPML returns for the Hebrew page — no fallback to English assets.

**Tech Stack:** Next.js 15 App Router, Apollo Client v4 (server components), WPGraphQL + WPML, TypeScript

---

## Prerequisites — Hebrew WordPress Slugs

Before writing any code, you must know the Hebrew page slugs that WPML created in WordPress. In WP Admin, for each page listed below, switch to the Hebrew translation and check the "Permalink" slug shown under the page title.

**Fill in this table before starting:**

| Route | English URI | Hebrew URI (from WP) |
|---|---|---|
| Home | `/` | `home-new-he` ← already known |
| About Us | `about-us` | `_____________` |
| Services | `services` | `_____________` |
| Contact Us | `contact-us` | `_____________` |
| Careers | `careers` | `_____________` |
| Technology | `technology` | `_____________` |
| Branding Studio | `branding-studio` | `_____________` |
| Blog listing | `/blog/` | `_____________` |
| Privacy Policy | `privacy-policy` | `_____________` |
| Accessibility | `accessibility-statement` | `_____________` |
| Terms of Use | `terms-of-use` | `_____________` |

> If a Hebrew translation doesn't exist in WordPress yet, create it in WP Admin before running these tasks.

---

## File Map

| File | Change |
|---|---|
| `lib/i18n.ts` | Add `PAGE_URI` entries for all 10 remaining pages |
| `lib/queries.ts` | Refactor 7 queries to accept `$uri: ID!` instead of hardcoded slug |
| `app/[locale]/about-us/page.tsx` | Accept params, pass locale URI to data fetch |
| `app/[locale]/services/page.tsx` | Same pattern |
| `app/[locale]/contact-us/page.tsx` | Same pattern |
| `app/[locale]/careers/page.tsx` | Same pattern |
| `app/[locale]/technology/page.tsx` | Same pattern |
| `app/[locale]/branding-studio/page.tsx` | Same pattern |
| `app/[locale]/blog/page.tsx` | Same pattern |
| `app/[locale]/privacy-policy/page.tsx` | Accept params, use `GET_CONTENT_PAGE` with locale URI |
| `app/[locale]/accessibility-statement/page.tsx` | Same as privacy-policy |
| `app/[locale]/terms-of-use/page.tsx` | Same as privacy-policy |

**Out of scope:** `app/[locale]/[slug]/page.tsx` (portfolio, already marked English-only) and `app/[locale]/blog/[slug]/page.tsx` (individual posts use URL slug directly).

---

## Task 1: Extend `lib/i18n.ts` with all Hebrew URI mappings

**Files:**
- Modify: `lib/i18n.ts`

- [ ] **Step 1: Fill in the Hebrew slugs from the prerequisite table, then apply this exact diff**

Open `lib/i18n.ts`. The current `PAGE_URI` is:

```typescript
export const PAGE_URI: Record<string, Record<Locale, string>> = {
  home: { en: '/', he: 'home-new-he' },
}
```

Replace the entire `PAGE_URI` export with (substituting your real Hebrew slugs from the prerequisite table):

```typescript
export const PAGE_URI: Record<string, Record<Locale, string>> = {
  home:            { en: '/',                        he: 'home-new-he' },
  aboutUs:         { en: 'about-us',                 he: 'ABOUT_HE_SLUG' },
  services:        { en: 'services',                 he: 'SERVICES_HE_SLUG' },
  contactUs:       { en: 'contact-us',               he: 'CONTACT_HE_SLUG' },
  careers:         { en: 'careers',                  he: 'CAREERS_HE_SLUG' },
  technology:      { en: 'technology',               he: 'TECHNOLOGY_HE_SLUG' },
  brandingStudio:  { en: 'branding-studio',          he: 'BRANDING_HE_SLUG' },
  blog:            { en: '/blog/',                   he: 'BLOG_HE_SLUG' },
  privacyPolicy:   { en: 'privacy-policy',           he: 'PRIVACY_HE_SLUG' },
  accessibility:   { en: 'accessibility-statement',  he: 'ACCESSIBILITY_HE_SLUG' },
  termsOfUse:      { en: 'terms-of-use',             he: 'TERMS_HE_SLUG' },
}
```

Where each `*_HE_SLUG` is the real value from your prerequisite table.

- [ ] **Step 2: Commit**

```bash
git add lib/i18n.ts
git commit -m "feat(i18n): add PAGE_URI entries for all Hebrew pages"
```

---

## Task 2: Refactor `lib/queries.ts` — add `$uri` variable to 7 queries

Currently 7 queries have the WordPress URI baked into the query string. This task makes them accept a variable so pages can pass the locale-appropriate slug at runtime.

**Files:**
- Modify: `lib/queries.ts`

- [ ] **Step 1: Refactor `GET_ABOUT_PAGE`** (line ~379)

Find:
```
  query GetAboutPage {
    page(id: "about-us", idType: URI) {
```
Replace with:
```
  query GetAboutPage($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 2: Refactor `GET_SERVICES_PAGE`** (line ~1)

Find:
```
  query GetServicesPage {
    page(id: "services", idType: URI) {
```
Replace with:
```
  query GetServicesPage($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 3: Refactor `GET_CONTACT_PAGE`** (line ~131)

Find:
```
  query GetContactPage {
    page(id: "contact-us", idType: URI) {
```
Replace with:
```
  query GetContactPage($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 4: Refactor `GET_CAREERS_PAGE`** (line ~169)

Find:
```
  query GetCareersPage {
    page(id: "careers", idType: URI) {
```
Replace with:
```
  query GetCareersPage($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 5: Refactor `GET_BRANDING_STUDIO`** (line ~206)

Find:
```
  query GetBrandingStudio {
    page(id: "branding-studio", idType: URI) {
```
Replace with:
```
  query GetBrandingStudio($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 6: Refactor `GET_TECHNOLOGY_PAGE`** (line ~440)

Find:
```
  query GetTechnologyPage {
    page(id: "technology", idType: URI) {
```
Replace with:
```
  query GetTechnologyPage($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 7: Refactor `GET_BLOG_PAGE`** (line ~527)

Find:
```
  query GetBlogPage {
    page(id: "/blog/", idType: URI) {
```
Replace with:
```
  query GetBlogPage($uri: ID!) {
    page(id: $uri, idType: URI) {
```

- [ ] **Step 8: Verify build still compiles**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds (pages will now pass `undefined` as `uri` variable and return null from WP — that's fine, they'll be fixed in subsequent tasks).

- [ ] **Step 9: Commit**

```bash
git add lib/queries.ts
git commit -m "feat(queries): accept \$uri variable in 7 page queries for locale support"
```

---

## Task 3: Localize `app/[locale]/about-us/page.tsx`

**Files:**
- Modify: `app/[locale]/about-us/page.tsx`

- [ ] **Step 1: Add i18n imports at the top of the file**

After the existing imports, add:
```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getAboutData` to accept a `uri` argument**

Find:
```typescript
async function getAboutData(): Promise<AboutPageFields> {
  try {
    const { data } = await client.query({ query: ABOUT_PAGE_QUERY })
```
Replace with:
```typescript
async function getAboutData(uri: string): Promise<AboutPageFields> {
  try {
    const { data } = await client.query({ query: ABOUT_PAGE_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update the page component signature and call site**

Find:
```typescript
export default async function AboutUsPage() {
  const [ap, ts] = await Promise.all([getAboutData(), getThemeSettings()])
```
Replace with:
```typescript
export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [ap, ts] = await Promise.all([getAboutData(PAGE_URI.aboutUs[loc]), getThemeSettings()])
```

- [ ] **Step 4: Run the dev server and open `/he/about-us` in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/he/about-us`. Verify Hebrew text appears and is not `null`. Also verify `http://localhost:3000/about-us` (English) still works.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/about-us/page.tsx"
git commit -m "feat(i18n): localize about-us page — fetch Hebrew content for /he/ locale"
```

---

## Task 4: Localize `app/[locale]/services/page.tsx`

**Files:**
- Modify: `app/[locale]/services/page.tsx`

- [ ] **Step 1: Add i18n imports**

After existing imports add:
```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getServicesData` to accept `uri`**

Find:
```typescript
async function getServicesData(): Promise<ServicesPageFields> {
  try {
    const { data } = await client.query({ query: SERVICES_PAGE_QUERY })
```
Replace with:
```typescript
async function getServicesData(uri: string): Promise<ServicesPageFields> {
  try {
    const { data } = await client.query({ query: SERVICES_PAGE_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update page component signature**

Find:
```typescript
export default async function ServicesPage() {
  const [sp, ts] = await Promise.all([getServicesData(), getThemeSettings()])
```
Replace with:
```typescript
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [sp, ts] = await Promise.all([getServicesData(PAGE_URI.services[loc]), getThemeSettings()])
```

- [ ] **Step 4: Verify in browser**

- `http://localhost:3000/he/services` — Hebrew content
- `http://localhost:3000/services` — English content unchanged

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/services/page.tsx"
git commit -m "feat(i18n): localize services page"
```

---

## Task 5: Localize `app/[locale]/contact-us/page.tsx`

**Files:**
- Modify: `app/[locale]/contact-us/page.tsx`

- [ ] **Step 1: Add i18n imports**

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getContactData` to accept `uri`**

Find:
```typescript
async function getContactData(): Promise<{ title: string | null; fields: ContactFields | null }> {
  try {
    const { data } = await client.query({ query: CONTACT_PAGE_QUERY })
```
Replace with:
```typescript
async function getContactData(uri: string): Promise<{ title: string | null; fields: ContactFields | null }> {
  try {
    const { data } = await client.query({ query: CONTACT_PAGE_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update page component signature**

Find the `export default async function` — its exact signature depends on whether it uses `params` already. Look for the function name and update it to:

```typescript
export default async function ContactUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [{ title, fields }, ts] = await Promise.all([getContactData(PAGE_URI.contactUs[loc]), getThemeSettings()])
```

(Match the existing destructuring pattern for `title` and `fields`.)

- [ ] **Step 4: Verify in browser**

- `http://localhost:3000/he/contact-us` — Hebrew content
- `http://localhost:3000/contact-us` — English unchanged

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/contact-us/page.tsx"
git commit -m "feat(i18n): localize contact-us page"
```

---

## Task 6: Localize `app/[locale]/careers/page.tsx`

**Files:**
- Modify: `app/[locale]/careers/page.tsx`

- [ ] **Step 1: Add i18n imports**

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getCareers` to accept `uri`**

Find:
```typescript
async function getCareers(): Promise<CareerFields | null> {
  try {
    const { data } = await client.query({ query: CAREERS_QUERY })
```
Replace with:
```typescript
async function getCareers(uri: string): Promise<CareerFields | null> {
  try {
    const { data } = await client.query({ query: CAREERS_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update page component signature**

Find:
```typescript
export default async function CareersPage() {
  const cf = await getCareers()
```
Replace with:
```typescript
export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const cf = await getCareers(PAGE_URI.careers[loc])
```

- [ ] **Step 4: Verify in browser**

- `http://localhost:3000/he/careers` — Hebrew content
- `http://localhost:3000/careers` — English unchanged

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/careers/page.tsx"
git commit -m "feat(i18n): localize careers page"
```

---

## Task 7: Localize `app/[locale]/technology/page.tsx`

**Files:**
- Modify: `app/[locale]/technology/page.tsx`

- [ ] **Step 1: Add i18n imports**

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getTechData` to accept `uri`**

Find:
```typescript
async function getTechData(): Promise<TechnologyPageFields> {
  try {
    const { data } = await client.query({ query: TECH_PAGE_QUERY })
```
Replace with:
```typescript
async function getTechData(uri: string): Promise<TechnologyPageFields> {
  try {
    const { data } = await client.query({ query: TECH_PAGE_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update page component signature**

Find the `export default async function TechnologyPage` and update:
```typescript
export default async function TechnologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [tp, ts] = await Promise.all([getTechData(PAGE_URI.technology[loc]), getThemeSettings()])
```

(Match whatever the existing variable names are — `tp`/`ts` or whatever the file uses for tech data and theme settings.)

- [ ] **Step 4: Verify in browser**

- `http://localhost:3000/he/technology` — Hebrew content
- `http://localhost:3000/technology` — English unchanged

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/technology/page.tsx"
git commit -m "feat(i18n): localize technology page"
```

---

## Task 8: Localize `app/[locale]/branding-studio/page.tsx`

**Files:**
- Modify: `app/[locale]/branding-studio/page.tsx`

- [ ] **Step 1: Add i18n imports**

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getBranding` to accept `uri`**

Find:
```typescript
async function getBranding(): Promise<ServiceDetailPage | null> {
  try {
    const { data } = await client.query({ query: BRANDING_QUERY })
```
Replace with:
```typescript
async function getBranding(uri: string): Promise<ServiceDetailPage | null> {
  try {
    const { data } = await client.query({ query: BRANDING_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update page component signature**

Find:
```typescript
export default async function BrandingStudioPage() {
  const [page, ts] = await Promise.all([getBranding(), getThemeSettings()])
```
Replace with:
```typescript
export default async function BrandingStudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [page, ts] = await Promise.all([getBranding(PAGE_URI.brandingStudio[loc]), getThemeSettings()])
```

- [ ] **Step 4: Verify in browser**

- `http://localhost:3000/he/branding-studio` — Hebrew content
- `http://localhost:3000/branding-studio` — English unchanged

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/branding-studio/page.tsx"
git commit -m "feat(i18n): localize branding-studio page"
```

---

## Task 9: Localize `app/[locale]/blog/page.tsx`

The blog listing page has two data fetches: the hero/header from `GET_BLOG_PAGE` (locale-aware after this task) and the post list from `GET_BLOG_POSTS` (returns all posts regardless of locale — WPML handles language filtering server-side if configured).

**Files:**
- Modify: `app/[locale]/blog/page.tsx`

- [ ] **Step 1: Add i18n imports**

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

- [ ] **Step 2: Update `getBlogPage` to accept `uri`**

Find:
```typescript
async function getBlogPage(): Promise<BlogPageFields | null> {
  try {
    const { data } = await client.query({ query: BLOG_PAGE_QUERY })
```
Replace with:
```typescript
async function getBlogPage(uri: string): Promise<BlogPageFields | null> {
  try {
    const { data } = await client.query({ query: BLOG_PAGE_QUERY, variables: { uri } })
```

- [ ] **Step 3: Update page component signature**

Find the `export default async function` for the blog listing page. It calls `getBlogPage()`. Update it to:

```typescript
export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  // … existing parallel fetches, changing getBlogPage() → getBlogPage(PAGE_URI.blog[loc])
```

Find the line that calls `getBlogPage()` inside the function body and change it to `getBlogPage(PAGE_URI.blog[loc])`. Keep the function signature and all other calls (`getInitialPosts`, `getThemeSettings`, etc.) exactly as they are.

- [ ] **Step 4: Verify in browser**

- `http://localhost:3000/he/blog` — Hebrew blog header content
- `http://localhost:3000/blog` — English unchanged

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/blog/page.tsx"
git commit -m "feat(i18n): localize blog listing page header"
```

---

## Task 10: Localize three legal pages (privacy-policy, accessibility-statement, terms-of-use)

These three pages already use `GET_CONTENT_PAGE` which accepts a `$uri` variable — only the page components need to change. No query refactor needed.

**Files:**
- Modify: `app/[locale]/privacy-policy/page.tsx`
- Modify: `app/[locale]/accessibility-statement/page.tsx`
- Modify: `app/[locale]/terms-of-use/page.tsx`

- [ ] **Step 1: Update `privacy-policy/page.tsx`**

Add imports at the top:
```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
```

The file currently has `const URI = 'privacy-policy'` and the `getPage()` function uses it. Replace the entire file's top-of-file constant and function with a parameterized approach. Update the `export default` function to:

```typescript
export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const page = await getPage(PAGE_URI.privacyPolicy[loc])
  if (!page || (!page.title && !page.content)) notFound()
  return <LegalArticle title={page.title} content={page.content} eyebrow="Legal" />
}
```

Update `getPage` to accept a `uri` argument:
```typescript
async function getPage(uri: string) {
  try {
    const { data } = await client.query<{
      page: { title: string | null; content: string | null } | null
    }>({
      query: gql`${GET_CONTENT_PAGE}`,
      variables: { uri },
    })
    return data?.page ?? null
  } catch {
    return null
  }
}
```

Remove the `const URI = 'privacy-policy'` line.

- [ ] **Step 2: Update `accessibility-statement/page.tsx`**

Same pattern as Step 1. Replace `const URI = 'accessibility-statement'` with locale-aware lookup:

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'

async function getPage(uri: string) {
  try {
    const { data } = await client.query<{
      page: { title: string | null; content: string | null } | null
    }>({
      query: gql`${GET_CONTENT_PAGE}`,
      variables: { uri },
    })
    return data?.page ?? null
  } catch {
    return null
  }
}

export default async function AccessibilityStatementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const page = await getPage(PAGE_URI.accessibility[loc])
  if (!page || (!page.title && !page.content)) notFound()
  return <LegalArticle title={page.title} content={page.content} eyebrow="Accessibility" />
}
```

- [ ] **Step 3: Update `terms-of-use/page.tsx`**

Same pattern. Replace `const URI = 'terms-of-use'`:

```typescript
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'

async function getPage(uri: string) {
  try {
    const { data } = await client.query<{
      page: { title: string | null; content: string | null } | null
    }>({
      query: gql`${GET_CONTENT_PAGE}`,
      variables: { uri },
    })
    return data?.page ?? null
  } catch {
    return null
  }
}

export default async function TermsOfUsePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const page = await getPage(PAGE_URI.termsOfUse[loc])
  if (!page || (!page.title && !page.content)) notFound()
  return <LegalArticle title={page.title} content={page.content} eyebrow="Legal" />
}
```

- [ ] **Step 4: Verify all three in browser**

- `http://localhost:3000/he/privacy-policy` — Hebrew content
- `http://localhost:3000/he/accessibility-statement` — Hebrew content
- `http://localhost:3000/he/terms-of-use` — Hebrew content
- All three English URLs still load

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/privacy-policy/page.tsx" "app/[locale]/accessibility-statement/page.tsx" "app/[locale]/terms-of-use/page.tsx"
git commit -m "feat(i18n): localize legal pages (privacy, accessibility, terms)"
```

---

## Task 11: Full smoke test of all Hebrew routes

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Visit every Hebrew route and confirm Hebrew content renders**

| URL | Expected |
|---|---|
| `http://localhost:3000/he` | Hebrew home |
| `http://localhost:3000/he/about-us` | Hebrew about |
| `http://localhost:3000/he/services` | Hebrew services |
| `http://localhost:3000/he/contact-us` | Hebrew contact |
| `http://localhost:3000/he/careers` | Hebrew careers |
| `http://localhost:3000/he/technology` | Hebrew technology |
| `http://localhost:3000/he/branding-studio` | Hebrew branding |
| `http://localhost:3000/he/blog` | Hebrew blog header |
| `http://localhost:3000/he/privacy-policy` | Hebrew legal copy |
| `http://localhost:3000/he/accessibility-statement` | Hebrew legal copy |
| `http://localhost:3000/he/terms-of-use` | Hebrew legal copy |

For each page check:
- Text is Hebrew (not English)
- Images load (or `null` gracefully if WP has no Hebrew image — no broken `<img>` tags with empty `src`)
- `dir="rtl"` is applied (comes from the layout, not the page)
- No console errors

- [ ] **Step 3: Re-verify all English routes still work**

Spot-check: `http://localhost:3000/`, `/about-us`, `/services`, `/contact-us`

- [ ] **Step 4: Run build**

```bash
npm run build 2>&1 | tail -40
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 5: Final commit if any fixes were needed during smoke test**

```bash
git add -A
git commit -m "fix(i18n): smoke test fixes for Hebrew localization"
```

---

## Notes

**Images per locale:** Per CLAUDE.md, assets come from whatever WordPress returns for the fetched page. Because we now fetch the Hebrew WP page, WPML will return the Hebrew-locale featured image and ACF image fields automatically. No extra handling in React is needed. If WP has no image for a field on the Hebrew page, the field returns `null` and the section renders `null` (existing guard pattern).

**Blog posts list:** `GET_BLOG_POSTS` fetches posts without a language filter. If WPML is configured to filter by language automatically (via `lang` query param or cookie), posts will be Hebrew. If not, posts show in English even on `/he/blog`. This is a WordPress/WPML configuration concern, not a React code concern.

**Portfolio and blog single posts:** Left English-only. Portfolio `[slug]/page.tsx` already documents this. Blog `[slug]/page.tsx` fetches by URL slug — for Hebrew posts to work, WP slugs would need separate handling.

**generateMetadata:** Pages with `export async function generateMetadata()` that call the data function should have that function updated to pass the locale URI too. Follow the same param pattern: `generateMetadata({ params }: { params: Promise<{ locale: string }> })`. This is a bonus step if SEO metadata needs to be locale-specific.
