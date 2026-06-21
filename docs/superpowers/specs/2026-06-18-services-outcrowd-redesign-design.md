# Services Page — Outcrowd-Style Redesign

**Date:** 2026-06-18
**Status:** Approved
**Route:** `/services` (`app/[locale]/services/page.tsx`)

## Goal

Rebuild the `/services` page to mirror the look, sections, and animations of
[outcrowd.io](https://www.outcrowd.io) / [outcrowd.io/services] — a "full clone"
of the sections the user liked, animated with Framer Motion (no new
dependencies), driven by **mock content for now** that is shaped like the future
WordPress response so it can be swapped to real WPGraphQL later.

## Decisions (from brainstorming)

- **Scope:** Full clone — sections + content + animations.
- **Content:** Mock for now, isolated in one file shaped like the future WP
  `servicePage` template response. Real WP wiring comes later. This intentionally
  overrides the repo's no-hardcode rule for the interim, at the user's request.
- **Animation stack:** Pure Framer Motion (`motion/react` v12). No GSAP, Swiper,
  Lenis, or SplitType. No site-wide scroll changes.

## Page Structure (top → bottom)

1. **Hero + scroll-reveal statement** — headline plus the signature word-by-word
   scroll-scrubbed text reveal (Outcrowd's "We prove, design, implement…" effect).
2. **Stats row** — 4 metrics with count-up (reuses `CountUpNumber`).
3. **Stages carousel** — Pre-seed / Seed / Series A–style swipeable cards
   (image + copy + highlight).
4. **Service cards** — 4 horizontal expanding cards (Branding / Digital Design /
   Development / Marketing Assets), each listing sub-services.
5. **Clients** — existing `ClientsSection`, WP-wired, untouched.
6. **FAQ** — existing `FAQSection`, WP-wired, untouched.
7. **CTA** — "Innovate with us"–style closing band.

## Components (new, all `motion/react`)

- `components/services/ScrollRevealText.tsx` — splits a string into word spans;
  each word's `opacity` + `y` mapped to scroll progress via `useScroll` /
  `useTransform` (scrubbed, reverses on scroll-up). Honors
  `prefers-reduced-motion` → static text.
- `components/services/StatsRow.tsx` — count-up metrics grid.
- `components/services/StagesCarousel.tsx` — motion drag + CSS scroll-snap cards.
- `components/services/ServiceCards.tsx` — 4 expanding service cards.
- `components/services/ServicesCTA.tsx` — closing CTA band.

Reused: `CountUpNumber`, `FadeIn`, `SectionReveal`, `GlowOrb`, `Eyebrow`,
`Button`, `ClientsSection`, `FAQSection`.

## Mock Content

- File: `lib/mock/services-page.ts` — typed object shaped like a future WP
  `servicePage` response: `{ hero, statement, stats[], stages[], serviceCards[], cta }`.
- `page.tsx` has a single clearly-marked boundary:
  `// TODO: swap mock → client.query(GET_SERVICES_PAGE)`. Components take typed
  props and never know mock vs. WP.
- Images point at existing Triolla WP media URLs so the page looks real.

## Constraints

- Strict adherence to the repo Design Language (type scale, glow orbs,
  `yellow-400`, dark `#0a0a0a` / cream bands, `rounded-2xl/3xl`). No new tokens.
- Bilingual structure preserved; mock is English for now, Hebrew arrives with WP.
- Mobile gets the `triolla-mobile-design` treatment; final pass via `react-doctor`.
- Existing page replaced but recoverable via git.

## Out of Scope

Lenis/GSAP/Swiper, testimonials & awards sections, new WP ACF fields.
