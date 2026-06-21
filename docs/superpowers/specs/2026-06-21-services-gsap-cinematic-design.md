# Services Page — Cinematic GSAP Scroll Choreography

**Status:** Design approved, ready for implementation plan
**Date:** 2026-06-21
**Branch:** `gsap-migration`
**Primary file:** `app/[locale]/services/page.tsx`

## Goal

Transform the services page from its current "fade-in-once + hover" motion into a cinematic, scroll-driven experience using GSAP. The services page is the pilot; the GSAP foundation is built site-wide and reusable so the treatment can roll out to other pages later, progressively replacing Motion.

"Cinematic" here means: site-wide smooth scroll, a deliberate motion hierarchy with one signature set-piece, multi-plane parallax, and scrubbed/pinned scenes — executed with restraint so it reads as intentional craft, not a templated GSAP demo.

## Decisions (locked)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Ambition | **Cinematic rebuild** — maximum impact |
| 2 | Smooth scroll scope | **Global, site-wide** — ScrollSmoother in the root layout |
| 3 | Motion ↔ GSAP | **Migrate** — services page goes 100% GSAP; build reusable primitives; Motion stays installed/used on the rest of the site for now |
| 4 | Creative direction | **"Studio Reel" (A)** + the **horizontal scrub-gallery (B)** on the Product section |
| 5 | Foundation sequencing | **Full global foundation first**, then services choreography |
| 6 | Motion rhythm | **Varied — Product is the peak**; Branding is a non-pinned calm exhale; Engineering is moderate |
| 7 | Testing | Build/lint + reduced-motion/no-JS automated checks + manual checklist; **no brittle motion snapshot tests** |

## Scope

**In scope**
- GSAP + ScrollSmoother foundation in the root layout (affects every page).
- Site-wide foundation prerequisites forced by global smooth scroll (portal fixed overlays; convert other pages' `position: sticky` to ScrollTrigger pin).
- Reusable GSAP primitives that mirror the existing Motion component APIs.
- Full GSAP rebuild of the services page motion (`app/[locale]/services/page.tsx`).

**Out of scope**
- Removing Motion from the rest of the site. Motion stays installed and in use elsewhere; only the services page is migrated now.
- Redesigning the services page *layout/content* — content and structure come from WordPress and stay. This is a motion layer, not a visual redesign.
- Rebuilding other pages' choreography. Other pages get the smooth-scroll foundation and the minimum sticky→pin conversions needed to not break; their motion is otherwise unchanged.

## Architecture

### Packages & plugin registration
- Add `gsap` (bundles ScrollTrigger, ScrollSmoother, SplitText — all free as of GSAP 3.13 / post-Webflow) and `@gsap/react` (the `useGSAP` hook).
- A single client module (`lib/gsap.ts`) registers plugins exactly once: `gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText)` and sets `ScrollTrigger.config({ ignoreMobileResize: true })` (prevents iOS address-bar resize jumps).

### `lib/gsap.ts` — single source of truth
- Registers plugins (above).
- Registers `CustomEase` curves that mirror `lib/motion.ts` `EASE` values (`smooth = [0.23,1,0.32,1]`, `bounce = [0.16,1,0.3,1]`, `standard`, `symmetric`) so the *feel* is identical across the Motion→GSAP boundary during migration.
- Exports shared config: smooth amount (`1.2`), breakpoint constants, the `matchMedia` query strings.

### `SmoothScroll` (new client component, root layout)
- Renders the required structure and creates the smoother inside `useGSAP`:
  ```
  <div id="smooth-wrapper">
    <div id="smooth-content">{children}</div>
  </div>
  ```
- `ScrollSmoother.create({ smooth: 1.2, effects: true, normalizeScroll: true })`. `effects: true` enables declarative `data-speed`/`data-lag` parallax.
- **Created only on desktop and only when `prefers-reduced-motion: no-preference`** (via `gsap.matchMedia`). On touch/reduced-motion the component renders the wrapper markup but does *not* create a smoother — native scrolling is used.

### Root layout restructure (`app/[locale]/layout.tsx`)
Because `#smooth-content` gets a CSS `transform`, it becomes a containing block that breaks `position: fixed`/`sticky` inside it. New structure:
```
<body>
  <Header/>                       ← OUTSIDE the wrapper (stays truly fixed/sticky)
  <SmoothScroll>
    <main>{children}</main>
    <Footer/>
  </SmoothScroll>
  <CookieBanner/>                 ← OUTSIDE the wrapper (layout sibling)
</body>
```
- The current `min-h-full flex flex-col` sticky-footer pattern is reworked since content now lives inside the smoother (footer sits after content inside `#smooth-content`).
- `MotionProvider` / `ConsentProvider` wrappers are preserved.

### Reduced motion & responsive
- All GSAP work runs inside `gsap.matchMedia()` with conditions: `(prefers-reduced-motion: reduce)`, `(min-width: 1024px)` desktop, touch/mobile. `matchMedia` auto-reverts everything on cleanup.
- Reduced-motion path: no smoother, no pins, no scrub, no parallax; reveals collapse to ≤200ms opacity fades or instant. Page is fully readable and reachable.

### SSR/SEO safety — the `html.gsap` gate
- All WP content renders server-side and stays in the DOM. GSAP only animates `transform`/`opacity` on already-present markup.
- Elements that start hidden for a reveal are hidden **only** under an `html.gsap` class set before first paint (by the init module). No-JS, crawlers, and GSAP-load-failure all see fully visible content. GSAP never hides content it isn't confirmed to animate.

## Foundation pass (Phase 0) — site-wide prerequisites

Global smooth scroll forces these before the services work, so other pages don't break:

### Portal the inline fixed overlays to `document.body`
These render inside the page tree (inside `#smooth-content`) and use `position: fixed`, which breaks under the content transform. Convert each to `createPortal(..., document.body)`:
- `components/FloatingCta.tsx`
- `components/ReadingProgress.tsx`
- `components/consent/PreferencesModal.tsx`
- `CookieBanner` — already a layout sibling; keep it outside the wrapper (no portal needed) or portal for safety.

Already portaled (no change): `HeaderClient` mobile menu, `ServiceDetailModal`.

### Convert other pages' `position: sticky` → ScrollTrigger `pin`
CSS sticky inside `#smooth-content` breaks; convert these to real pins (the last two are already "pinned scroll" sections faked with sticky and convert cleanly):
- `app/[locale]/branding-studio/page.tsx` — `.brand-process__rail` (`top: 120px`)
- `components/FAQSection.tsx` — sticky heading
- `components/PortfolioShowcase.tsx` — `sticky top-0 h-screen`
- `components/TechStickyFeature.tsx` — `sticky top-0 h-screen` (also drives an IntersectionObserver active-panel; can stay observer-driven, just convert the *pinning* mechanism)

The services page's own sticky menus (`.svc-prod__menu`, `.svc-brand__menu`) are handled in the services rebuild, not here.

## Reusable GSAP primitives (migration layer)

New `components/gsap/` directory. Every primitive is reduced-motion aware (jumps to final state) and SSR-safe (works with the `html.gsap` gate).

| Primitive | Replaces | Behavior |
|-----------|----------|----------|
| `<Reveal>` | `FadeIn` | opacity/y on scroll-enter, `once`, optional child stagger. **Prop API mirrors `FadeIn`** (`delay`/`duration`/`yOffset`) so call-site swaps are 1:1 for future migration. |
| `<SplitReveal>` | `HeroHeadline` | `SplitText` lines/words/chars + mask-up stagger; waits for `document.fonts.ready`; `revert()`s on cleanup. |
| `<Parallax speed lag>` | new | thin wrapper applying ScrollSmoother `data-speed`/`data-lag`; attributes stripped under reduced motion. Drives multi-plane depth. |
| `useScrollVelocity()` | new | shared hook exposing scroll velocity via `gsap.quickTo`; feeds marquee speed + (limited) skew. |
| `usePinnedScene()` | new | standardizes pin + scrub + `matchMedia` gating + reduced-motion fallback for the chapter scenes, keeping each section declarative. |

**Services-page migration mapping:** `FadeIn → <Reveal>`, `HeroHeadline → <SplitReveal>`, `SectionReveal → <Reveal stagger>` or a scene timeline. Motion is removed entirely from `services/page.tsx`.

## Services page choreography

### The spine — spend boldness in one place
The three services are the genuine arc of how a studio builds a product: **design it (01) → brand it (02) → engineer it (03)** — a real sequence that justifies the chapter framing. The chapters do **not** shout equally; intensity is calibrated to create a cinematic build:

```
SCROLL ↓                 MOTION                                  INTENSITY
──────────────────────────────────────────────────────────────────────────
HERO          load: headline masks up line-by-line;             ●●●○○  overture
              eyebrow→rule→meta cascade once.
              scroll: 3-plane depth drift (orbs / grid / ghost   (ambient, subtle)
              "01") via data-speed. Marquee skews w/ velocity.
──────────────────────────────────────────────────────────────────────────
01 PRODUCT    ★ THE SIGNATURE ★  pin ~150vh.                     ●●●●●  PEAK
              Product-work collage scrubs HORIZONTALLY as you
              scroll down; numbered index holds fixed beside it;
              rows parallax at different depths.
──────────────────────────────────────────────────────────────────────────
02 BRANDING   deliberate "exhale" — cream, calm. Clean          ●●○○○  counterpoint
              dark→cream wipe on entry. Polaroids reveal in a
              disciplined stagger — NOT scrubbed/pinned.
──────────────────────────────────────────────────────────────────────────
03 ENGINEERING back to dark, focused. Tech image depth-rise;    ●●●○○  resolve
              chips reveal in sequence (moderate).
──────────────────────────────────────────────────────────────────────────
CLIENTS/FAQ   quiet landing — logos settle, items reveal.       ●○○○○  outro
```

### Hero (overture)
- On load: `<SplitReveal type="lines">` masks the headline up line-by-line (lines, not chars — chars read as chaos). Eyebrow → rule → meta cascade once via `<Reveal>` with the existing delays.
- On scroll: the two glow orbs, the background grid, and the ghost "01" each drift at a different `data-speed` (true multi-plane depth). Subtle, ambient.
- The category marquee gains scroll-velocity reactivity (speed/skew) via `useScrollVelocity` — the one expressive velocity touch on the page.
- **LCP guard:** the headline renders in final visible state server-side; the mask-up only plays after `document.fonts.ready` and only if JS is ready promptly. Otherwise it's simply already visible.

### 01 Product — the signature
- The section pins (`usePinnedScene`, pin distance ~150vh, `anticipatePin`, `scrub: 1`).
- The product-work collage (`prodImages`) scrubs **horizontally** as the user scrolls down. The numbered service index (`ServiceModalMenu`) holds fixed beside it as the "chapter index."
- Rows within the collage parallax at slightly different rates for depth.
- **RTL:** the horizontal translation sign flips based on `dir` so it scrubs the natural direction on `/he/`.
- The collage imagery is decorative (`alt=""`, `aria-hidden`); the interactive numbered links stay in normal flow and tab order — the pin never hides interactive content.
- Mobile (smoothing off): no horizontal pin; falls back to the existing mobile collage + stacked menu with simple `<Reveal>`s.

### 02 Branding — the exhale
- Dark→cream entry as a clean full-bleed wipe.
- Polaroids reveal in a disciplined stagger (`<Reveal stagger>`), retaining their per-item rotation. **Not** scrubbed, **not** pinned — the restraint here is what makes Product feel big.
- The section is **not** a pinned/scrubbed scene. The numbered menu's existing stick-beside-the-gallery behavior (currently CSS `sticky`, which breaks under ScrollSmoother) is preserved with a lightweight pin on desktop and normal flow on mobile — a small affordance, distinct from the Product spectacle.

### 03 Engineering — resolve
- Tech image depth-rises (`<Parallax>` / scrubbed y) as the tech chips reveal in sequence (`<Reveal stagger>`).
- Moderate intensity — a resolution, not a second climax.

### Clients / FAQ — outro
- Logos settle in; FAQ items reveal on enter. Quiet.

### Easing & timing vocabulary
- Entrance reveals: ~0.6–0.8s, `CustomEase` mirror of `EASE.smooth`.
- Staggers: 0.08–0.12s (matches today's `FadeIn`/`SectionReveal`).
- Scrubbed scenes: `scrub: 1` (1s catch-up) so motion feels weighted, not twitchy.
- Yellow (`#facc15`) in motion is *emphasis only* (pinned chapter number, active index marker) — never ambient sparkle.

### Deliberately omitted (restraint)
No velocity-skew on every image (only the hero marquee), no magnetic-cursor buttons, no pinning on Branding, no char-by-char headline shatter. Each kept effect earns its place.

## Performance & LCP
- gsap + ScrollTrigger + ScrollSmoother + SplitText ≈ ~40–50KB gzipped, client-only, isolated to client components; page stays SSR.
- LCP = hero headline; never gated by SplitText (see Hero LCP guard).
- Smoothing is desktop-only (`matchMedia`); mobile uses native scroll.
- Pins use `anticipatePin`; pin count kept low. Above-fold images never lazy-load; horizontal-gallery images get explicit sizing.

## Accessibility
- `prefers-reduced-motion: reduce` → never create the smoother; no pins/scrub/parallax; reveals ≤200ms or instant. Fully readable/reachable.
- Anchor links and focus-driven scrolling route through `ScrollSmoother.get()?.scrollTo()` so native scroll doesn't fight the smoother.
- Decorative imagery stays `aria-hidden`; interactive content stays in normal flow and tab order.

## Fallback / failure modes
- No-JS / crawler / GSAP load failure → full content visible, zero animation (the `html.gsap` gate). SEO-safe.
- bfcache / resize / route change → `ScrollTrigger.refresh()` on `pageshow` (fold into existing `BfcacheReloader`) and after client navigations; `scrollTo(0)` on route change. ScrollSmoother persists across same-locale nav.
- Retired CSS: `svcPolaroidIn`, `svcScrollPulse` → GSAP. Kept: mobile-collage float loops (cheap, mobile-only).

## Verification
- `npm run build` and `npm run lint` green.
- Automated (Playwright): reduced-motion and no-JS both render the full static page. Motion itself is not snapshot-tested.
- Manual checklist: LCP not regressed (headline); keyboard + anchor nav works under the smoother; RTL gallery direction; mobile (smoothing off) clean; every section's content present with JS disabled; other pages' converted pins behave; portaled overlays appear correctly above the smoother.

## File-level change list (anticipated)
**New**
- `lib/gsap.ts` — plugin registration, CustomEases, config
- `components/gsap/SmoothScroll.tsx`
- `components/gsap/Reveal.tsx`
- `components/gsap/SplitReveal.tsx`
- `components/gsap/Parallax.tsx`
- `components/gsap/useScrollVelocity.ts`
- `components/gsap/usePinnedScene.ts`

**Modified — foundation (Phase 0)**
- `app/[locale]/layout.tsx` — wrapper restructure
- `components/FloatingCta.tsx`, `components/ReadingProgress.tsx`, `components/consent/PreferencesModal.tsx` — portal
- `app/[locale]/branding-studio/page.tsx`, `components/FAQSection.tsx`, `components/PortfolioShowcase.tsx`, `components/TechStickyFeature.tsx` — sticky→pin
- `components/BfcacheReloader.tsx` — ScrollTrigger.refresh on pageshow

**Modified — services rebuild**
- `app/[locale]/services/page.tsx` — replace Motion usages with GSAP primitives; add hero parallax, Product horizontal-pin scene, Branding/Engineering choreography; retire replaced CSS keyframes.

## Risks & open items
- ScrollSmoother + Next App Router client navigation needs careful refresh/cleanup; validate on real route changes within and across locales.
- The horizontal-pin scene is the highest-effort, highest-risk piece; build it behind `matchMedia` desktop-only with a clean mobile fallback first.
- Other-page sticky→pin conversions must be visually verified per page (they're collateral of going global, not the focus).
- Confirm `package-lock.json`/install strategy with the team's package manager (repo uses `npm`).
