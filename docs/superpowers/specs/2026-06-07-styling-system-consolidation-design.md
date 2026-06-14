# Styling System Consolidation — Design

**Date:** 2026-06-07
**Status:** Approved (design); pending spec review
**Author:** Daniel Shalem (with Claude)

## Problem

Almost every component in the Triolla Next.js 16 app carries its own inline `<style>`
tag with bespoke, hand-written CSS — **~3,200 lines across 20 files**. The same visual
nouns (glow orbs, gold eyebrow labels, gradient/shimmer headings, marquees, buttons,
section headings, image-shine cards, grain overlays, wave dividers) are re-implemented
from scratch in file after file with different class-name prefixes (`.svc-*`, `.about-*`,
`.tss-*`, `.wc-*`, …). This is hard to maintain, inconsistent, and bloats every file.

The app currently **works and looks good** — zero visual regression is a hard requirement.

## Goal

Consolidate styling into a maintainable, idiomatic **Tailwind v4 hybrid** system:

- Tailwind utilities for the trivial + arbitrary-value CSS (~70% of current CSS).
- A small shared CSS layer for what genuinely cannot be a utility (~30%: keyframes,
  masks, CSS counters, complex pseudo-element cascades).
- Shared React components for the duplicated UI, eliminating the copy-paste.

## Non-Goals

- **Not** eliminating 100% of CSS. Keyframes, `mask-image`, CSS `counter()` numbering,
  and one-off page-unique complex rules legitimately stay in the CSS layer.
- **Not** changing any visuals, copy, data fetching (Apollo/WPGraphQL), or component
  behavior. This is a pure refactor.
- **Not** rewriting the already-clean animation primitives (`FadeIn`, `SectionReveal`,
  `HeroHeadline`, `CountUpNumber`) beyond extracting their shared easing curves.
- **Not** introducing `tailwind.config.js`. Tailwind v4 is configured via `@theme` in
  `app/globals.css`; we stay idiomatic.

## Key Decisions

| Decision         | Choice                                  | Rationale                                                                                                                                                                                                            |
| ---------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| End-state        | Pragmatic hybrid                        | ~30% of CSS can't be clean utilities; forcing it produces unreadable arbitrary-value soup or is simply impossible (keyframes/counters/masks).                                                                        |
| Approach         | Foundation + Home pilot, then rollout   | No test suite exists; validate the system on the highest-value page before broad rollout.                                                                                                                            |
| Dynamic theming  | CSS custom properties                   | Technology pages inject `accentColor` via JS template strings today. Replace with `style={{ '--accent': color }}` + `var(--accent)` in the shared layer. Clean, performant, works with Tailwind v4 arbitrary values. |
| Pilot page       | Home (`app/page.tsx`)                   | Most-visited; exercises the most shared patterns (hero, orbs, eyebrow, awards, portfolio cards, buttons). Best real-world proof.                                                                                     |
| Regression guard | Lightweight Playwright screenshot diffs | Catches accidental pixel shifts automatically given there is no test suite.                                                                                                                                          |

## Architecture: 3-Layer Styling System

```
Layer 1 — Design tokens & primitives   (app/globals.css)
  @theme:     brand colors, type-scale clamps, easing curves as named tokens
  @utility:   reusable effects that ARE expressible (gradient-text, grain, glow)
  @keyframes: the ~30 animations deduped to a canonical named set
              (orbPulse, shimmer, marquee, dotBlink, float, cardRise, scrollPulse, …)

Layer 2 — Shared UI components          (components/ui/*)
  React components for the duplicated visual nouns. Tailwind utilities inside,
  reaching into Layer 1 tokens/utilities. Kills the duplication.

Layer 3 — Page/feature components
  Compose Layer 2 + plain Tailwind utilities. Pages end up with little-to-no
  <style> tag. Page-unique complex CSS may remain as a scoped block — allowed.
```

**Routing principle for every CSS rule encountered:**

- Trivial (padding/flex/grid/color/simple hover) → Tailwind utility.
- Arbitrary value (clamp type scale, gradient, custom shadow) → Tailwind arbitrary value,
  or a Layer-1 `@theme` token / `@utility` if it repeats.
- Impossible as utility (keyframes, mask, counter, complex selector cascade) → Layer 1.
- Repeats across files → extract to a Layer 2 component.

## Layer 2 — Shared Component Library (`components/ui/`)

Derived from patterns observed repeating across the codebase:

| Component        | Replaces (occurrences)                              | Key props                                           |
| ---------------- | --------------------------------------------------- | --------------------------------------------------- |
| `GlowOrb`        | radial-gradient blur orbs (7+ files)                | `color`, `size`, `opacity`, `position`, `animation` |
| `Eyebrow`        | gold accent label w/ dot/lines (every page)         | `children`, `align`, `variant`                      |
| `GradientText`   | gradient-clip shimmer headings (4+ files)           | `as`, `animate`                                     |
| `Button`         | primary/ghost/pill CTAs (6+ files)                  | `variant`, `size`, `as` (link/button)               |
| `SectionHeading` | eyebrow + title + subtitle blocks (services, about) | `eyebrow`, `title`, `subtitle`, `align`             |
| `Marquee`        | infinite scroll strips (4 files)                    | `speed`, `direction`, `pauseOnHover`                |
| `ShineImageCard` | hover-zoom + shine cards (3 files)                  | `src`, `badge`, `tag`                               |
| `GrainOverlay`   | SVG fractal-noise overlay (4+ files)                | `opacity?`                                          |
| `WaveDivider`    | section wave SVG transitions (services, about)      | `from`, `to`                                        |

Plus `lib/motion.ts` exporting shared easing curves (e.g. `EASE.smooth = [0.16,1,0.3,1]`)
currently copy-pasted across components.

Each primitive is built by extracting from its most representative current usage, then
that usage is swapped to consume the primitive.

## Dynamic Accent Color

Components that today interpolate `accentColor` into CSS via JS template strings
(`app/technology`, `TechStackSection`, `TechStickyFeature`) instead set
`style={{ '--accent': accentColor }}` on their root element. Layer-1 utilities and
keyframes reference `var(--accent)`. Tailwind arbitrary values like
`shadow-[0_0_12px_var(--accent)]` and `bg-[var(--accent)]` work directly. Accent flows
down via the cascade; primitives (`GlowOrb`, `GradientText`, card glows) become
accent-agnostic.

## Conversion Methodology (per file, repeatable)

1. Screenshot the page/route (baseline) via the visual harness.
2. Map each CSS rule to its bucket (utility / arbitrary-value / Layer-1 / extract-to-Layer-2).
3. Replace markup with Layer 2 components + utilities; move keyframes/masks/counters to Layer 1.
4. Delete the `<style>` block (or shrink to genuinely-unique leftovers).
5. Screenshot again; diff against baseline; reconcile to zero meaningful diff.
6. Commit in a small, reviewable unit.

## Visual-Regression Harness

- Add Playwright as a dev dependency with a minimal config.
- One spec visits each route and captures a full-page screenshot at 2 viewports
  (e.g. mobile ~390px and desktop ~1440px).
- `npm run test:visual` produces before/after diffs.
- Built once in Phase 0; baselines captured before any conversion; run per converted file.

## Phased Rollout

### Phase 0 — Foundation (no visual change)

- Create `components/ui/` primitives (extracted from representative usages).
- Extend `app/globals.css`: `@theme` tokens, `@utility` effects, deduped `@keyframes`.
- Add `lib/motion.ts`.
- Stand up Playwright harness; capture baselines for all routes.

### Phase 1 — Home pilot (`app/page.tsx`)

- Full conversion using Phase-0 primitives. System gets battle-tested; primitive props
  finalized here. Any gap found becomes a Phase-0 fix.
- Zero-diff reconcile against baseline.

### Phase 2 — Rollout (one file per step, screenshot-gated)

1. `app/services` (sticky menus, marquees, `:nth-child`, waves)
2. `app/about-us` (showcase carousel, tickers — largest file)
3. `app/technology` + `TechStackSection` + `TechStickyFeature` (proves `--accent`)
4. `WannaChatSection`, `Footer`, `ServiceDetailModal`
5. `AnimatedSteps`, `GridImageSection`, `FAQSection`, `PortfolioTemplate`
6. `ClientsSection`, `WhyUsSection`, `AboutImageCarousel`, `LegalArticle`,
   `app/contact-us`, legal pages (`privacy-policy`, `terms-of-use`), and trivial leftovers
   (`ServiceModalMenu`, `ServiceTechGroups`).

## Success Criteria

- `<style>` tags removed or reduced to genuinely-unique leftovers across all 20 files.
- Shared `components/ui/` library in use; no more per-file re-implementation of orbs,
  eyebrows, gradient text, marquees, buttons, section headings, shine cards.
- `accentColor` flows via `--accent` CSS variable; no JS-template-string CSS remains.
- Visual diff against baselines shows zero meaningful change on every route.
- Each conversion landed as a small, screenshot-gated commit.

## Risks & Mitigations

| Risk                                                               | Mitigation                                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Subtle visual regression (no test suite)                           | Playwright screenshot diffs gate every file.                                           |
| Primitive API churns mid-rollout                                   | Pilot the full Home page first to finalize props before broad rollout.                 |
| Dynamic accent edge cases                                          | Technology stack converted early (Phase 2 step 3) to surface `--accent` issues.        |
| Scroll-driven / JS-mutated styles (parallax, 3D tilt, sticky sync) | These stay JS-driven; not forced into CSS/utilities. Documented as expected leftovers. |
| Scope creep into behavior/visual changes                           | Explicit non-goals; refactor-only discipline; zero-diff requirement.                   |
