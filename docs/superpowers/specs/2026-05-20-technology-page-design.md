# /technology Page — Design Spec

**Date:** 2026-05-20  
**Approach:** Option A — Cinematic Scroll  
**Goal:** Maximum WOW / premium feel; users must feel impressed on arrival.

---

## 1. Overview

A new Next.js App Router page at `/technology` built on the existing headless WordPress + WPGraphQL stack. All content — text, images, colors — comes from WordPress. No hardcoded strings. If a field is absent, that section renders `null`.

The page uses the same dark design language as `cyber-security` and `app/page.tsx`: `#080808` background, `#facc15` gold accent, grain overlay, ambient orbs, shimmer text, and staggered `FadeIn` / `SectionReveal` animations.

---

## 2. Files

| File | Action |
|---|---|
| `lib/queries.ts` | Add `GET_TECHNOLOGY_PAGE` query constant |
| `app/technology/page.tsx` | New Server Component — data fetching + page JSX |
| `components/TechStickyFeature.tsx` | New Client Component — scroll-driven sticky split-screen (section 4) |

No existing files are modified except `lib/queries.ts`.

---

## 3. GraphQL Query — `GET_TECHNOLOGY_PAGE`

Added to `lib/queries.ts` as a plain string constant. Called with `gql\`...\`` at the call-site in the page, same as all other pages.

```graphql
query GetTechnologyPage {
  page(id: "technology", idType: URI) {
    template {
      ... on Template_TechnologyPage {
        technologyPage {
          headerTitle
          headerSubText
          buttonText
          headerBgColor
          headerBgOverlayLayer { node { sourceUrl } }

          companyList { companyName }

          midImageRightTitle
          midImageOne   { node { sourceUrl } }
          midImageTwo   { node { sourceUrl } }
          midImageTwoTitle
          midImageThree { node { sourceUrl } }
          midImageThreeTitle
          midImageFour  { node { sourceUrl } }
          midImageFourTitle
          midImageFive  { node { sourceUrl } }
          midImageFiveTitle
          midImageSix   { node { sourceUrl } }
          midImageSixTitle
          midImageSeven { node { sourceUrl } }
          midImageSevenTitle
          midImageEight { node { sourceUrl } }
          midImageEightTitle

          fourmidTitle
          fourtitleone
          fourtitletwo
          fourtext

          threeConent {
            lftimage { node { sourceUrl } }
            threincontent {
              threintitle
              threincontent
              tagList
            }
          }
          threbottomText
          threbottomLinkText
          threbottomButtonLink

          numberList { number numtitle }

          qatitle
          qatext
          qaList {
            question
            answer
          }
        }
      }
    }
  }
}
```

Response path: `data?.page?.template?.technologyPage ?? {}`.

Theme settings are also fetched in parallel via the existing `GET_THEME_SETTINGS` query (same `getThemeSettings()` helper pattern used on all pages).

---

## 4. Page Component — `app/technology/page.tsx`

Server Component. Pattern identical to `app/cyber-security/page.tsx`:

- `async function getTechData()` — wraps Apollo query, returns `technologyPage` object or `{}`
- `async function getThemeSettings()` — same helper as other pages
- `const [tp, ts] = await Promise.all([getTechData(), getThemeSettings()])`
- Exposes shared helpers: `stripHtml`, `htmlToLines`, `parseAccentHeading`
- Derives `accentColor = tp.headerBgColor ?? "#facc15"`
- Builds `contactItems` array from theme settings (identical to all other pages)
- Maps `tp.qaList` to `faqItems: { faqQuestion, faqAnswer }[]`
- Builds `clientLogos`, `logoRow1`, `logoRow2` from `ts.clientsLogos` (identical to homepage)

---

## 5. Sections

### 5.1 Hero

**Layout:** Full viewport (`min-h-screen`), `flex flex-col justify-end`, `pb-20 pt-32`

**Background layer (z-0):**
- `headerBgOverlayLayer` image fills the entire section via `position: absolute; inset: 0; object-fit: cover`
- Ken Burns animation: `animation: techKenBurns 20s ease-out forwards` — slow scale from 1.08 to 1.0, giving a cinematic zoom-in-then-settle feel
- Dark overlay: `rgba(0,0,0,0.55)` absolute layer above the image
- Grain overlay: reuse `.grain-overlay` from `app/page.tsx` global styles
- Two ambient gold orbs (same `.hero-orb` pattern from homepage)

**Content layer (z-10), `max-w-[1400px] mx-auto px-6 lg:px-10`:**
- Eyebrow: `headerSubText` in a gold pill badge (`FadeIn delay=0.05`)
- Headline: `headerTitle` at `text-[clamp(68px,11vw,180px)] font-black tracking-[-0.03em] leading-[0.88]` with `textShimmer` gradient animation (`FadeIn delay=0.12`)
- CTA row (right-aligned, below a `border-t border-white/10`): gold pill button with `buttonText` + arrow SVG (`FadeIn delay=0.22`)
- Scroll cue: reuse `.scroll-cue` + `.scroll-cue__line` from homepage

**If `headerBgOverlayLayer` is absent:** fall back to the ambient orbs + dots pattern (no image, same as cyber-security hero).

---

### 5.2 Marquee Banner

**Layout:** `overflow-hidden border-t border-b border-white/[0.07] py-5`

**Content:** `companyList[].companyName` doubled (`[...list, ...list]`) for seamless loop

**Animation:** `animation: techMarquee 40s linear infinite` (translateX 0 to -50%)
Hover: `animation-play-state: paused`

**Item styling:** `text-[15px] font-bold tracking-[0.08em] uppercase text-gray-600 mx-8`
Separator: gold dot `·` between items
On hover: item color transitions to `accentColor` (0.2s)

**Guard:** render `null` if `companyList` is empty.

---

### 5.3 Floating Tech Grid

**Layout:** `py-24 max-w-[1600px] mx-auto px-6 lg:px-10`

**Heading:** `midImageRightTitle` — `text-[clamp(36px,5vw,72px)] font-black tracking-tight` with `FadeIn`

**Featured image row:** `midImageOne` renders as a single full-width card at the top — tall aspect ratio (`aspect-[16/7]`), `rounded-[24px]`, `overflow-hidden`, Ken Burns hover effect. Rendered only if image exists.

**Grid:** `midImageTwo` through `midImageEight` (up to 7 cards) in a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` using `SectionReveal` for stagger.

Each grid card:
- `rounded-[20px] overflow-hidden relative` with `aspect-[4/3]` image fill
- Title in an overlay bar at the bottom: absolute bottom with a gradient scrim `linear-gradient(to top, rgba(0,0,0,0.8), transparent)`
- Hover: `translateY(-8px)`, gold glow border, image scales `1.06`
- Float animation: each card has `techCardFloat` keyframe (translateY 0 to -6px) with unique `animation-delay` via CSS custom property `--ci` and duration between 7s–11s

Cards with no image are skipped (`null` guard on `sourceUrl`).

---

### 5.4 Sticky Split-Screen Morph (`TechStickyFeature`)

This is the WOW centerpiece. Implemented as `components/TechStickyFeature.tsx` (`"use client"`).

**Props:**
```ts
interface TechStickyFeatureProps {
  fourmidTitle: string | null;
  fourtitleone: string | null;
  fourtitletwo: string | null;
  fourtext: string | null;
  threeConent: Array<{
    lftimage: { node: { sourceUrl: string } } | null;
    threincontent: Array<{
      threintitle: string | null;
      threincontent: string | null;
      tagList: string | null;
    }> | null;
  }> | null;
  threbottomText: string | null;
  threbottomLinkText: string | null;
  threbottomButtonLink: string | null;
  accentColor: string;
}
```

**Section header** (above the split layout):
- `fourmidTitle` — large heading `clamp(36px,5vw,72px) font-black`
- `fourtitleone` + `fourtitletwo` — two-column label strip, `text-sm font-bold tracking-widest uppercase text-gray-500`
- `fourtext` — WP WYSIWYG HTML, rendered via `dangerouslySetInnerHTML`. Content originates solely from the trusted WP backend (same pattern used throughout the codebase in `cyber-security/page.tsx` and `FAQSection.tsx`). No user input reaches this field.

**Split layout (desktop `lg:flex`, mobile stacked):**

Left column (`lg:w-[45%] lg:sticky lg:top-[120px] lg:self-start`):
- Renders the `lftimage` of the currently active `threeConent` entry
- Image styled `rounded-[28px] overflow-hidden aspect-[3/4] w-full object-cover`
- Cross-fade: controlled by `activeIndex` state. Both images are rendered with `position: absolute`; the active one has `opacity: 1`, inactive ones `opacity: 0`. Transition: `opacity 0.45s ease`.
- A gold glow orb behind the image (`position: absolute; blur: 120px; accentColor + opacity 0.12`)

Right column (`lg:w-[55%]`):
- Each `threeConent` entry is a panel. A `ref` is attached to each panel. An `IntersectionObserver` (threshold: 0.4) watches all panel refs. When a panel enters view, `setActiveIndex(i)` is called, triggering the left image cross-fade.
- Each panel: `py-16 border-b border-white/[0.07]`
- Each `threincontent` item within the panel:
  - `threintitle` — `text-[clamp(22px,2.8vw,38px)] font-bold tracking-tight text-white mb-4`
  - `threincontent` wysiwyg — rendered via `dangerouslySetInnerHTML` (trusted WP backend only, same pattern as rest of codebase). Styled `text-[16px] leading-[1.85] text-gray-400`
  - `tagList` — split on comma, each token rendered as a gold pill chip

**Footer CTA** (below the split layout):
- `threbottomText` as a subheading
- `threbottomLinkText` as a gold pill button linking to `threbottomButtonLink`
- Rendered only when all three fields are non-null

**Guard:** If `threeConent` is empty/null, component renders `null`.

---

### 5.5 Our Clients

Identical markup and styles to the clients section in `app/page.tsx`. No new component needed — markup lives directly in the page Server Component.

**Data:** `ts.clientsLogos` to `clientLogos[]`, split into `logoRow1` (first half) + `logoRow2` (second half).

**Renders:**
- `ts.ourClientsHeading` eyebrow with flanking lines
- `ts.ourClientBigText` large heading
- Dual marquee rows: row 1 scrolls left (`.marquee-track`), row 2 scrolls right (`.marquee-track--reverse`)
- Fade edge overlays on both sides
- `ts.cButton` CTA linking to `/contact-us`

**Guard:** Entire section wrapped in `{clientLogos.length > 0 && (...)}`.

---

### 5.6 Steps — Animated Number Ticker

**Layout:** `py-24 max-w-[1600px] mx-auto overflow-hidden px-4`

**Content:** `numberList[].{ number, numtitle }` — if empty, section renders `null`.

**Desktop:** Horizontal scrollable `flex overflow-x-auto pb-12 hide-scrollbar gap-8 px-10 snap-x` inside a `SectionReveal`.

Each step card (`min-w-[260px] shrink-0 snap-center`):
- Ghost number: `number` field at `120px font-weight-900 opacity-[0.025]` positioned absolute top-left behind
- Gold dot (14px circle with gold box-shadow) + connecting line (same pattern as cyber-security `cs-timeline-item__dot` + `__line`)
- `numtitle` as `text-xl font-bold mt-8` — passed through `htmlToLines` to handle any `<br>` tags
- `CountUpNumber` animates the ghost background number (0 to `parseInt(number)`) on enter

**Mobile:** `min-w-[200px]`, ghost number scales to `76px`.

---

### 5.7 FAQ

Uses the existing `FAQSection` component without any modification.

```tsx
<FAQSection
  heading={tp.qatitle ?? null}
  subtext={tp.qatext ? stripHtml(tp.qatext) : null}
  items={faqItems}
/>
```

`faqItems = (tp.qaList ?? []).filter(q => q?.question).map(q => ({ faqQuestion: q.question as string, faqAnswer: q.answer ?? "" }))`

Guard: `FAQSection` already returns `null` when `items` is empty.

---

### 5.8 Contact

```tsx
<WannaChatSection
  contactItems={contactItems}
  leftHeading={...}
  formHeading={...}
  submitLabel={ts?.cButton ?? null}
  callUsLabel={ts?.cCallUsLabel ?? null}
/>
```

Identical to all other pages.

---

## 6. Styling Rules

- All section-specific CSS lives in a single colocated `<style>` tag in `app/technology/page.tsx`
- Component-specific CSS lives in a `<style>` tag inside `TechStickyFeature.tsx`
- Tailwind utility classes for layout/spacing; inline `<style>` for animations, hover effects, complex selectors
- Brand tokens: `#facc15` / `yellow-400` (accent), `#080808` (page bg), `#0a0a0a` / `#0f0f0f` / `#111` (section/card bg)
- `accentColor` CSS variable from WP `headerBgColor` used in dynamic style strings (same pattern as cyber-security page)

---

## 7. Animation Inventory

| Name | Where | Technique |
|---|---|---|
| `techKenBurns` | Hero bg image | CSS keyframe: scale 1.08 to 1.0, 20s forwards |
| `textShimmer` | Hero headline | Reuse existing from `app/page.tsx` |
| `techMarquee` | Section 2 | CSS keyframe: translateX 0 to -50%, 40s linear infinite |
| `techCardFloat` | Section 3 grid cards | CSS keyframe: translateY 0 to -6px, staggered per card |
| Image cross-fade | Section 4 left image | React state + CSS opacity transition 0.45s |
| IntersectionObserver | Section 4 right panels | Drives `activeIndex` state |
| `FadeIn` / `SectionReveal` | All sections | Existing components, whileInView once: true |
| `CountUpNumber` | Section 6 ghost numbers | Existing component |

---

## 8. Data-Absence Rules

Every section has an explicit guard:

| Section | Guard condition |
|---|---|
| Hero | Always renders; fields default to empty string |
| Marquee | `companyList.length > 0` |
| Tech Grid | At least one image field is non-null |
| Sticky Feature | `threeConent.length > 0` |
| Clients | `clientLogos.length > 0` |
| Steps | `numberList.length > 0` |
| FAQ | `faqItems.length > 0` (handled by `FAQSection`) |
| Contact | Always renders (theme settings) |

---

## 9. Component Boundaries

```
app/technology/page.tsx          <- Server Component
  +-- FadeIn                     <- existing client component
  +-- SectionReveal              <- existing client component
  +-- CountUpNumber              <- existing client component
  +-- TechStickyFeature          <- new client component
  +-- FAQSection                 <- existing client component
  +-- WannaChatSection           <- existing client component
```

`TechStickyFeature` is the only new component. It is the narrowest possible extraction — only the scroll-driven sticky split section needs client-side JS (`IntersectionObserver` + `useState`). Everything else stays in the Server Component.

---

## 10. No Hardcoded Content

The following are explicitly not hardcoded:
- Page heading text
- Company names in the marquee
- Any section heading or body copy
- Image URLs
- Button labels and links
- FAQ questions and answers
- Step labels and numbers
- Client logos
- Accent color

If any WP field returns null or undefined, the UI hides that element or skips that section entirely.
