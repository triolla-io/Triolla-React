# Services Page Cinematic GSAP Choreography — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the services page to a GSAP-driven cinematic scroll experience (global smooth scroll + a varied motion hierarchy peaking on a horizontal scrub-gallery), on a reusable GSAP foundation that can replace Motion site-wide later.

**Architecture:** Phase 0 lays a site-wide GSAP foundation: ScrollSmoother in the root layout, portaled fixed overlays, and existing `position: sticky` sections converted to ScrollTrigger pins (forced because `#smooth-content` is transformed). Phase 1 builds reusable GSAP primitives (mirroring today's Motion component APIs) and rebuilds the services page choreography on them. All motion is gated through `gsap.matchMedia()` (desktop-only smoothing/pins; reduced-motion = static).

**Tech Stack:** Next.js 16 App Router, React 19, GSAP 3.13+ (`gsap`, `@gsap/react` `useGSAP`, ScrollTrigger, ScrollSmoother, SplitText, CustomEase), Tailwind v4, Playwright (visual regression).

**Spec:** `docs/superpowers/specs/2026-06-21-services-gsap-cinematic-design.md`

## Global Constraints

- **All content comes from WordPress.** GSAP only animates `transform`/`opacity` on already-rendered markup. Never hide content unless JS has confirmed it will animate it (the `html.gsap` gate). On data absence render `null`.
- **GSAP version:** `gsap@^3.13.0` (ScrollSmoother/SplitText are free and in the public package only from 3.13). `@gsap/react@^2.1.2`.
- **Smoothing & heavy scenes are desktop-only** (`min-width: 1024px`) AND `prefers-reduced-motion: no-preference`. Reduced-motion = no smoother, no pin, no scrub; content fully visible, reveals ≤200ms or instant.
- **Plugin registration happens once** via `registerGsap()` in `lib/gsap.ts`; never call `gsap.registerPlugin` elsewhere.
- **Easing vocabulary:** use the registered CustomEases `'smooth'`/`'bounce'`/`'standard'`/`'symmetric'` (mirror `lib/motion.ts`). Reveal duration ~0.6–0.8s, stagger 0.08–0.12s, scrub `1`.
- **SSR/SEO:** every section's WP content must be present and visible with JS disabled and under reduced motion.
- **Motion library:** do NOT remove `motion` from the repo. It stays in use site-wide except inside `app/[locale]/services/page.tsx`, which becomes 100% GSAP.
- **RTL:** `/he/` is `dir="rtl"`; any horizontal motion reads `dir` and flips sign.
- **Commit after every task.** We are on branch `gsap-migration`.
- **Verification baseline:** `npm run build` and `npm run lint` must pass at the end of every task. Visual suite (`npm run test:visual`) runs under reduced motion (configured in Task 0.9).

---

# PHASE 0 — Site-wide GSAP foundation

Produces: every page works with global smooth scroll on desktop, native scroll on mobile/reduced-motion, no broken `fixed`/`sticky`, visual suite green. No services choreography yet.

---

### Task 0.1: Install GSAP and create `lib/gsap.ts`

**Files:**
- Modify: `package.json` (dependencies)
- Create: `lib/gsap.ts`

**Interfaces:**
- Produces: `registerGsap(): void`; consts `Q_MOTION`, `Q_DESKTOP`, `SMOOTH_AMOUNT`; registered CustomEases `'smooth'|'bounce'|'standard'|'symmetric'`.

- [ ] **Step 1: Install packages**

Run:
```bash
npm install gsap@^3.13.0 @gsap/react@^2.1.2
```
Expected: `package.json` gains both deps; `package-lock.json` updated; exit 0.

- [ ] **Step 2: Create `lib/gsap.ts`**

```ts
'use client'

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

let registered = false

/** Register GSAP plugins + project eases exactly once (client only). */
export function registerGsap(): void {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, CustomEase)
  ScrollTrigger.config({ ignoreMobileResize: true })
  // Mirror lib/motion.ts EASE: cubic-bezier(x1,y1,x2,y2) -> "M0,0 C x1,y1 x2,y2 1,1"
  CustomEase.create('smooth', 'M0,0 C0.23,1 0.32,1 1,1')
  CustomEase.create('bounce', 'M0,0 C0.16,1 0.3,1 1,1')
  CustomEase.create('standard', 'M0,0 C0.4,0 0.2,1 1,1')
  CustomEase.create('symmetric', 'M0,0 C0.2,1 0.3,1 1,1')
  registered = true
}

/** Animate reveals only when the user allows motion. */
export const Q_MOTION = '(prefers-reduced-motion: no-preference)'
/** Smoothing + heavy scenes are desktop-only. */
export const Q_DESKTOP = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
export const SMOOTH_AMOUNT = 1.2
```

- [ ] **Step 3: Verify build & lint**

Run: `npm run build && npm run lint`
Expected: PASS. (`lib/gsap.ts` is imported nowhere yet; this just confirms the deps resolve and types are valid.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json lib/gsap.ts
git commit -m "feat(gsap): add gsap deps and lib/gsap.ts registration"
```

---

### Task 0.2: `SmoothScroll` component

**Files:**
- Create: `components/gsap/SmoothScroll.tsx`

**Interfaces:**
- Consumes: `registerGsap`, `Q_DESKTOP`, `SMOOTH_AMOUNT` from `@/lib/gsap`.
- Produces: `<SmoothScroll>{children}</SmoothScroll>` rendering `#smooth-wrapper > #smooth-content`. Creates ScrollSmoother only on desktop+motion.

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { registerGsap, Q_DESKTOP, SMOOTH_AMOUNT } from '@/lib/gsap'

registerGsap()

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Smoother created ONLY on desktop + no-preference. On mobile/reduced-motion
      // the wrapper/content are plain block divs and native scrolling is used.
      mm.add(Q_DESKTOP, () => {
        const smoother = ScrollSmoother.create({
          wrapper: wrapper.current as HTMLElement,
          content: content.current as HTMLElement,
          smooth: SMOOTH_AMOUNT,
          effects: true,
          normalizeScroll: true,
        })
        return () => smoother.kill()
      })
    },
    { scope: wrapper },
  )

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build & lint**

Run: `npm run build && npm run lint`
Expected: PASS (still unused; confirms compile).

- [ ] **Step 3: Commit**

```bash
git add components/gsap/SmoothScroll.tsx
git commit -m "feat(gsap): add SmoothScroll wrapper (desktop-only smoothing)"
```

---

### Task 0.3: Root layout restructure + reveal gate

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/globals.css` (append reveal-gate rules)

**Interfaces:**
- Consumes: `SmoothScroll` from `@/components/gsap/SmoothScroll`.
- Produces: Header/CookieBanner OUTSIDE the smooth wrapper; `main`+`Footer` inside `#smooth-content`; `html.gsap` class set pre-paint; CSS gate hides `[data-reveal]` / `[data-reveal-stagger] > *` only under `html.gsap`.

- [ ] **Step 1: Restructure the layout body**

In `app/[locale]/layout.tsx`, add the import:
```tsx
import { SmoothScroll } from '@/components/gsap/SmoothScroll'
```

Add the pre-paint gate script inside `<head>` (after the existing `<link>` tags):
```tsx
<script
  // Hide reveal targets before first paint ONLY when motion is allowed, so
  // no-JS / reduced-motion users always see content. Pairs with globals.css.
  dangerouslySetInnerHTML={{
    __html: `try{if(matchMedia('(prefers-reduced-motion: no-preference)').matches){document.documentElement.classList.add('gsap')}}catch(e){}`,
  }}
/>
```

Replace the current body inner structure:
```tsx
        <ConsentProvider>
          <MotionProvider>
            <Header locale={loc} />
            <main className="grow">{children}</main>
            <Footer locale={loc} />
            <CookieBanner />
          </MotionProvider>
        </ConsentProvider>
```
with (Header + CookieBanner stay OUTSIDE the wrapper; `main` + `Footer` move inside):
```tsx
        <ConsentProvider>
          <MotionProvider>
            <Header locale={loc} />
            <SmoothScroll>
              <main className="grow">{children}</main>
              <Footer locale={loc} />
            </SmoothScroll>
            <CookieBanner />
          </MotionProvider>
        </ConsentProvider>
```

Then change the `<body>` className: the current `min-h-full flex flex-col` sticky-footer layout no longer applies (content lives in the smoother wrapper). Replace:
```tsx
      <body className="min-h-full flex flex-col font-sans bg-[#F5F5F5] text-black selection:bg-yellow-400 selection:text-black pb-[env(safe-area-inset-bottom)]">
```
with:
```tsx
      <body className="font-sans bg-[#F5F5F5] text-black selection:bg-yellow-400 selection:text-black pb-[env(safe-area-inset-bottom)]">
```

- [ ] **Step 2: Append the reveal-gate CSS**

Add to the end of `app/globals.css`:
```css
/* ── GSAP reveal gate ─────────────────────────────────────────────────────
   html.gsap is added pre-paint by the layout head script ONLY when the user
   allows motion. Reveal targets start hidden so GSAP can animate them in
   without a flash. No-JS / reduced-motion users never get the class, so they
   see fully visible content. */
html.gsap [data-reveal] { opacity: 0; }
html.gsap [data-reveal-stagger] > * { opacity: 0; }

/* ScrollSmoother requires the content to size naturally; guard against the old
   sticky-footer flex collapsing it. */
#smooth-wrapper { width: 100%; }
```

- [ ] **Step 3: Verify smooth scroll works (manual + build)**

Run: `npm run build && npm run lint`
Expected: PASS.

Run: `npm run dev`, open `http://localhost:3000`:
- Desktop (≥1024px, normal motion): scrolling feels smoothed/inertial. Header stays fixed at top. Footer scrolls in. No layout overlap.
- Resize to <1024px: native scroll (no smoothing). Header sticky still works.
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: native scroll, no smoothing, all content visible.
- Confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/layout.tsx app/globals.css
git commit -m "feat(gsap): mount global SmoothScroll in root layout + reveal gate"
```

---

### Task 0.4: Portal the fixed overlays out of the smooth wrapper

`position: fixed` inside `#smooth-content` anchors to the transformed content (broken). These overlays render inside the page tree, so portal each to `document.body`. A shared SSR-safe `Portal` helper does the mounting.

**Files:**
- Create: `components/gsap/Portal.tsx`
- Modify: `components/ui/GrainOverlay.tsx`
- Modify: `components/ReadingProgress.tsx`
- Modify: `components/FloatingCta.tsx`
- Modify: `components/consent/PreferencesModal.tsx`

**Interfaces:**
- Produces: `<Portal>{children}</Portal>` — renders children into `document.body` after mount; renders `null` during SSR/first paint.

- [ ] **Step 1: Create the Portal helper**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** Renders children into document.body (outside #smooth-content) once mounted.
 *  SSR-safe: returns null until mounted so server and first client render match. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? createPortal(children, document.body) : null
}
```

- [ ] **Step 2: Portal `GrainOverlay`**

Replace the body of `components/ui/GrainOverlay.tsx`:
```tsx
import { Portal } from '@/components/gsap/Portal'

interface GrainOverlayProps {
  /** Overlay opacity. Defaults to the canonical 0.04. */
  opacity?: number
}

export function GrainOverlay({ opacity }: GrainOverlayProps) {
  return (
    <Portal>
      <div
        aria-hidden="true"
        className="grain"
        style={opacity !== undefined ? ({ '--grain-opacity': String(opacity) } as React.CSSProperties) : undefined}
      />
    </Portal>
  )
}
```
> Note: `GrainOverlay` was a non-`'use client'` module; importing `Portal` (a client component) into it is fine — it renders inside client/server trees alike. If the build complains about a Server Component importing a hook-using child, it won't: `Portal` is its own client boundary.

- [ ] **Step 3: Portal `ReadingProgress`**

In `components/ReadingProgress.tsx`, import the helper and wrap the returned markup:
```tsx
import { Portal } from '@/components/gsap/Portal'
```
Wrap the existing `return (<div className="reading-progress" …>…</div>)` so the outer element is `<Portal>`:
```tsx
  return (
    <Portal>
      <div className="reading-progress" aria-hidden="true">
        <div className="reading-progress__bar" style={{ transform: `scaleX(${progress})` }} />
        <style>{`
          .reading-progress {
            position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
            background: transparent; pointer-events: none;
          }
          .reading-progress__bar {
            height: 100%; width: 100%; transform-origin: left center;
            background: linear-gradient(to right, #facc15, #fde047);
            transition: transform 0.08s linear;
          }
        `}</style>
      </div>
    </Portal>
  )
```
> The scroll math (`document.documentElement.scrollTop / max`) still works under ScrollSmoother because the page scrolls natively (the smoother only transforms the content). Verify in Step 6.

- [ ] **Step 4: Portal `FloatingCta`**

In `components/FloatingCta.tsx`, import `Portal`. Keep the sentinel `<div ref={sentinelRef}>` in place (it must stay in normal flow to observe the hero). Wrap ONLY the `AnimatePresence`/`m.div` fixed overlay in `<Portal>`:
```tsx
import { Portal } from '@/components/gsap/Portal'
```
```tsx
  return (
    <>
      {/* sentinel placed by the caller at the bottom of the hero */}
      <div ref={sentinelRef} aria-hidden="true" />
      <Portal>
        <AnimatePresence>
          {visible && (
            <m.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed bottom-0 inset-x-0 z-40 md:hidden"
              style={{ padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
            >
              <Link
                href={href}
                className="flex items-center justify-center w-full h-14 rounded-2xl bg-yellow-400 text-black font-bold text-[15px] tracking-tight shadow-2xl shadow-yellow-400/25 hover:bg-yellow-300 transition-colors"
              >
                {label}
              </Link>
            </m.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
```

- [ ] **Step 5: Portal `PreferencesModal`**

In `components/consent/PreferencesModal.tsx`, import `Portal` and wrap the top-level `m.div` (`className="fixed inset-0 …"`) of `PreferencesDialog` in `<Portal>`:
```tsx
import { Portal } from '@/components/gsap/Portal'
```
Wrap the returned `<m.div className="fixed inset-0 z-110 …">…</m.div>` so the outermost returned element is `<Portal>…</Portal>`. (No other change to the dialog internals.)

- [ ] **Step 6: Verify build, lint, and overlays**

Run: `npm run build && npm run lint`
Expected: PASS.

Run `npm run dev` (desktop, smoothing on):
- Grain overlay covers the viewport and stays fixed while scrolling (not drifting with content).
- On a blog post route, the reading-progress bar tracks scroll correctly top→bottom.
- On a page using `FloatingCta` (mobile width), scroll past the hero → the CTA appears pinned to the bottom of the viewport (not mid-page).
- Open cookie preferences (footer "Cookie settings") → modal centers over the viewport, backdrop covers everything, scroll-locked.

- [ ] **Step 7: Commit**

```bash
git add components/gsap/Portal.tsx components/ui/GrainOverlay.tsx components/ReadingProgress.tsx components/FloatingCta.tsx components/consent/PreferencesModal.tsx
git commit -m "fix(gsap): portal fixed overlays out of the smooth wrapper"
```

---

### Task 0.5: Refresh ScrollTrigger/Smoother on bfcache & route change

**Files:**
- Modify: `components/BfcacheReloader.tsx`
- Create: `components/gsap/RouteRefresh.tsx`
- Modify: `app/[locale]/layout.tsx` (mount `RouteRefresh`)

**Interfaces:**
- Produces: `<RouteRefresh/>` — on `usePathname()` change, scrolls to top and refreshes ScrollTrigger + re-scans ScrollSmoother effects.

- [ ] **Step 1: Read the current `BfcacheReloader`**

Run: `cat components/BfcacheReloader.tsx` and note its `pageshow` handler. Add a `ScrollTrigger.refresh()` call inside the existing `pageshow` listener (guarded for client). If `ScrollTrigger` is not already imported, add:
```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap } from '@/lib/gsap'
```
and call `registerGsap()` at module top, then inside the `pageshow` handler (after any existing logic) call:
```tsx
ScrollTrigger.refresh()
```

- [ ] **Step 2: Create `RouteRefresh`**

```tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { registerGsap } from '@/lib/gsap'

registerGsap()

/** After client navigation, reset scroll position and recompute triggers/effects
 *  for the new page's content. */
export function RouteRefresh() {
  const pathname = usePathname()
  useEffect(() => {
    const smoother = ScrollSmoother.get()
    if (smoother) {
      smoother.scrollTo(0, false)
      smoother.effects('[data-speed],[data-lag]', {})
    } else {
      window.scrollTo(0, 0)
    }
    ScrollTrigger.refresh()
  }, [pathname])
  return null
}
```

- [ ] **Step 3: Mount `RouteRefresh` in the layout**

In `app/[locale]/layout.tsx`, import and render it just after `<BfcacheReloader />`:
```tsx
import { RouteRefresh } from '@/components/gsap/RouteRefresh'
```
```tsx
        <BfcacheReloader />
        <RouteRefresh />
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint`
Expected: PASS.

Manual (desktop, smoothing on): navigate Home → Services → About via header links. Each navigation lands scrolled to top; no leftover pin offsets; no console errors. Use browser back/forward (bfcache) → page restores without frozen scroll.

- [ ] **Step 5: Commit**

```bash
git add components/BfcacheReloader.tsx components/gsap/RouteRefresh.tsx app/\[locale\]/layout.tsx
git commit -m "fix(gsap): refresh ScrollTrigger/Smoother on bfcache and route change"
```

---

### Task 0.6: Convert `TechStickyFeature` sticky → ScrollTrigger pin

The left image panel uses `sticky top-0 h-screen` (line ~209) to stay while the right panels scroll. Under ScrollSmoother sticky breaks; pin the left panel instead. The IntersectionObserver active-panel logic stays unchanged.

**Files:**
- Modify: `components/TechStickyFeature.tsx`

- [ ] **Step 1: Add a pin for the sticky image panel**

Add imports:
```tsx
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'
```
Call `registerGsap()` at module top. Add a ref for the left panel and the grid container:
```tsx
const gridRef = useRef<HTMLDivElement>(null)
const stickyRef = useRef<HTMLDivElement>(null)
```
Attach `gridRef` to the `<div className="lg:grid lg:grid-cols-[45fr_55fr]">` and `stickyRef` to the inner sticky `<div className="sticky top-0 h-screen overflow-hidden">`. Change that className to remove `sticky top-0` (keep `h-screen overflow-hidden`):
```tsx
<div ref={stickyRef} className="h-screen overflow-hidden">
```
Add the pin (desktop+motion only; mobile keeps the stacked layout where the left panel is `hidden lg:block`):
```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia()
    mm.add(Q_DESKTOP, () => {
      const grid = gridRef.current
      const sticky = stickyRef.current
      if (!grid || !sticky) return
      const st = ScrollTrigger.create({
        trigger: grid,
        start: 'top top',
        end: 'bottom bottom',
        pin: sticky,
        pinSpacing: false,
        anticipatePin: 1,
      })
      return () => st.kill()
    })
  },
  { scope: gridRef },
)
```

- [ ] **Step 2: Verify on the page that renders it**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop, smoothing on): on the page using `TechStickyFeature`, the left image holds in place while the right panels scroll and crossfade; active dot tracks; releases cleanly at the section end. Mobile width: stacked layout unaffected.

- [ ] **Step 3: Commit**

```bash
git add components/TechStickyFeature.tsx
git commit -m "fix(gsap): pin TechStickyFeature image panel instead of CSS sticky"
```

---

### Task 0.7: Convert `PortfolioShowcase` sticky → pin

`components/PortfolioShowcase.tsx` uses `sticky top-0 h-screen` (line ~121) for a pinned scroll section.

**Files:**
- Modify: `components/PortfolioShowcase.tsx`

- [ ] **Step 1: Read the file and identify the sticky element + its scroll parent**

Run: `cat components/PortfolioShowcase.tsx`. Identify the `sticky top-0 h-screen` element and the taller parent it sticks within.

- [ ] **Step 2: Replace sticky with a pin**

Add imports + `registerGsap()` (same four imports as Task 0.6 Step 1). Add `parentRef` (the tall scroll container) and `pinRef` (the `h-screen` element). Remove `sticky top-0` from the pinned element's className (keep `h-screen` and any `overflow`). Add:
```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia()
    mm.add(Q_DESKTOP, () => {
      const parent = parentRef.current
      const pin = pinRef.current
      if (!parent || !pin) return
      const st = ScrollTrigger.create({
        trigger: parent,
        start: 'top top',
        end: 'bottom bottom',
        pin,
        pinSpacing: false,
        anticipatePin: 1,
      })
      return () => st.kill()
    })
  },
  { scope: parentRef },
)
```
> If the existing component already drives an active index via scroll position/IntersectionObserver, leave that logic intact — only the pinning mechanism changes.

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop): the showcase pins and progresses as designed; releases at the end; mobile unaffected.

- [ ] **Step 4: Commit**

```bash
git add components/PortfolioShowcase.tsx
git commit -m "fix(gsap): pin PortfolioShowcase instead of CSS sticky"
```

---

### Task 0.8: Convert `FAQSection` and `branding-studio` rail sticky → pin

**Files:**
- Modify: `components/FAQSection.tsx` (sticky heading, line ~173)
- Modify: `app/[locale]/branding-studio/page.tsx` (`.brand-process__rail`, line ~307)

- [ ] **Step 1: `FAQSection` — read and convert**

Run: `cat components/FAQSection.tsx`. The sticky element is a heading column that stays beside the scrolling FAQ list. Add imports + `registerGsap()`. Add `sectionRef` (the two-column container) and `headingRef` (the sticky heading). Remove `position: sticky; top: …` from the heading's CSS rule. Add a pin scoped to desktop+motion:
```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia()
    mm.add(Q_DESKTOP, () => {
      const section = sectionRef.current
      const heading = headingRef.current
      if (!section || !heading) return
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: heading,
        pinSpacing: false,
        anticipatePin: 1,
      })
      return () => st.kill()
    })
  },
  { scope: sectionRef },
)
```
> If the heading column is shorter than the list (the usual case), `pinSpacing: false` keeps it pinned beside the scrolling list. Verify the start/end so it doesn't pin past the section.

- [ ] **Step 2: `branding-studio` rail — convert**

In `app/[locale]/branding-studio/page.tsx`, the `.brand-process__rail` uses `position: sticky; top: 120px`. This page is a Server Component; the pin must run in a client component. Two options — pick based on the file:
- If the rail + steps are already inside a client component, add the pin there (same pattern as Step 1, `start: 'top 120px'`).
- Otherwise, extract the rail+steps block into a small new client component `components/BrandProcessRail.tsx` that renders the existing markup and runs the pin, and use it from the page. Remove `position: sticky; top: 120px` from the CSS.

Pin code (client component):
```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia()
    mm.add(Q_DESKTOP, () => {
      const section = sectionRef.current
      const rail = railRef.current
      if (!section || !rail) return
      const st = ScrollTrigger.create({
        trigger: section, start: 'top 120px', end: 'bottom bottom',
        pin: rail, pinSpacing: false, anticipatePin: 1,
      })
      return () => st.kill()
    })
  },
  { scope: sectionRef },
)
```

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop): FAQ heading holds beside the scrolling list; branding-studio rail holds beside its process steps; both release at section end; mobile unaffected.

- [ ] **Step 4: Commit**

```bash
git add components/FAQSection.tsx app/\[locale\]/branding-studio/page.tsx components/BrandProcessRail.tsx 2>/dev/null; git commit -m "fix(gsap): pin FAQ heading and branding-studio rail instead of CSS sticky"
```

---

### Task 0.9: Route anchor links & programmatic scroll through ScrollSmoother

Native `#hash` jumps and `scrollIntoView` fight the smoothed transform. Route them through `ScrollSmoother.scrollTo()` when a smoother exists; no-op otherwise. (Keyboard focus-scroll is already handled by `normalizeScroll: true`.)

**Files:**
- Create: `components/gsap/AnchorScroll.tsx`
- Modify: `app/[locale]/layout.tsx` (mount it)
- Modify: `components/TechStickyFeature.tsx` (progress-dot `scrollIntoView`)

**Interfaces:**
- Produces: `<AnchorScroll/>` — global click interceptor for in-page hash anchors.

- [ ] **Step 1: Create `AnchorScroll`**

```tsx
'use client'

import { useEffect } from 'react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { registerGsap } from '@/lib/gsap'

registerGsap()

/** Route in-page #hash anchor clicks through ScrollSmoother so native jumps
 *  don't fight the smoothed transform. No-op when no smoother exists. */
export function AnchorScroll() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      const smoother = ScrollSmoother.get()
      if (!smoother) return // native scroll handles it
      e.preventDefault()
      smoother.scrollTo(target as HTMLElement, true, 'top 80px')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
```

- [ ] **Step 2: Mount in the layout**

In `app/[locale]/layout.tsx`, after `<RouteRefresh />`:
```tsx
import { AnchorScroll } from '@/components/gsap/AnchorScroll'
```
```tsx
        <RouteRefresh />
        <AnchorScroll />
```

- [ ] **Step 3: Fix `TechStickyFeature` progress-dot scroll**

The dots call `panelRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })`, which won't move under the smoother. Add the import + `registerGsap()` (already added in Task 0.6) and change the dot `onClick` to:
```tsx
onClick={() => {
  const el = panelRefs.current[i]
  if (!el) return
  const smoother = ScrollSmoother.get()
  if (smoother) smoother.scrollTo(el, true, 'center center')
  else el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}}
```
Add `import { ScrollSmoother } from 'gsap/ScrollSmoother'` to the file.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop, smoothing on): any in-page `#hash` link scrolls smoothly to its target (test the TechStickyFeature progress dots on the technology page — clicking a dot glides to that panel). Reduced-motion/mobile: native jump still works.

- [ ] **Step 5: Commit**

```bash
git add components/gsap/AnchorScroll.tsx app/\[locale\]/layout.tsx components/TechStickyFeature.tsx
git commit -m "fix(gsap): route hash anchors and scrollIntoView through ScrollSmoother"
```

---

### Task 0.10: Configure Playwright for reduced motion + re-baseline (Phase 0 checkpoint)

`fullPage` screenshots break under ScrollSmoother (the wrapper is `fixed; overflow:hidden`). Running the suite under `reducedMotion: 'reduce'` means no smoother is created → normal document flow → stable, capturable full-page snapshots. This becomes the regression guard for Phase 1.

**Files:**
- Modify: `playwright.config.ts`
- Modify (regenerate): `tests/visual/routes.spec.ts-snapshots/*`

- [ ] **Step 1: Force reduced motion in the visual config**

In `playwright.config.ts`, add `reducedMotion: 'reduce'` to `use`:
```ts
  use: {
    baseURL: 'http://localhost:3000',
    reducedMotion: 'reduce',
    // Reduced motion => no ScrollSmoother => normal document flow => fullPage
    // screenshots capture the whole page and stay stable across runs.
  },
```

- [ ] **Step 2: Confirm reduced-motion renders full static pages, then re-baseline**

Run (with a dev server available; Playwright starts one): `npm run test:visual`
Expected: tests may FAIL diffs because the layout wrapper + portaled overlays shifted rendering slightly. Inspect the HTML report — confirm each page is fully rendered (no clipping, all sections present, content visible). If correct, re-baseline:
```bash
npm run test:visual:update
```
Then re-run to confirm green:
```bash
npm run test:visual
```
Expected: PASS (all routes).

- [ ] **Step 3: Full Phase 0 manual checkpoint**

`npm run dev`, verify across Home / Services / About / Technology / a blog post / a portfolio route / branding-studio:
- Desktop + motion: global smooth scroll; header fixed; all former-sticky sections pin correctly; overlays (grain, reading progress, cookie modal, floating CTA) correct.
- Mobile width: native scroll; layouts intact.
- `prefers-reduced-motion: reduce`: native scroll, full content, no pins.
- JS disabled (DevTools): full content visible on every route.
- No console errors anywhere.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/visual/routes.spec.ts-snapshots
git commit -m "test(visual): run suite under reduced motion; re-baseline after gsap foundation"
```

---

# PHASE 1 — Primitives + services choreography

Produces: reusable GSAP primitives and the fully cinematic services page. Other routes stay visually unchanged (verified each task).

---

### Task 1.1: `<Reveal>` primitive (replaces `FadeIn`)

**Files:**
- Create: `components/gsap/Reveal.tsx`
- Create: `tests/visual/reveal.spec.ts`

**Interfaces:**
- Produces: `<Reveal delay? duration? yOffset? stagger? className? style? once?>`. With `stagger`, animates direct children; sets `data-reveal-stagger`. Otherwise sets `data-reveal`.

- [ ] **Step 1: Create the primitive**

```tsx
'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

interface RevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  yOffset?: number
  /** When set, animates direct children with this stagger (seconds). */
  stagger?: number
  className?: string
  style?: React.CSSProperties
  once?: boolean
}

export function Reveal({
  children, delay = 0, duration = 0.7, yOffset = 40, stagger,
  className, style, once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isStagger = stagger != null

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const root = ref.current as HTMLElement
        const targets: gsap.TweenTarget = isStagger ? root.children : root
        const tween = gsap.fromTo(
          targets,
          { autoAlpha: 0, y: yOffset },
          {
            autoAlpha: 1, y: 0, duration, delay, ease: 'smooth',
            stagger: stagger ?? 0,
            scrollTrigger: { trigger: root, start: 'top 85%', once },
          },
        )
        return () => tween.scrollTrigger?.kill()
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className} style={style} {...(isStagger ? { 'data-reveal-stagger': '' } : { 'data-reveal': '' })}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Write the failing reduced-motion test**

```ts
// tests/visual/reveal.spec.ts
import { test, expect } from '@playwright/test'

// Reveal targets must be fully visible (opacity 1) under reduced motion,
// since no html.gsap class is added and no animation runs.
test('reveal content is visible under reduced motion on services', async ({ page }) => {
  await page.goto('/services', { waitUntil: 'networkidle' })
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/(^|\s)gsap(\s|$)/)
})
```

- [ ] **Step 3: Run it (passes immediately — gate is correct)**

Run: `npx playwright test tests/visual/reveal.spec.ts --project=desktop`
Expected: PASS (the config forces reduced motion → `html` never gets `gsap`). This guards the SSR/SEO invariant. (`Reveal` isn't used yet; full behavior is verified when the services page adopts it.)

- [ ] **Step 4: Verify build & lint**

Run: `npm run build && npm run lint` → PASS.

- [ ] **Step 5: Commit**

```bash
git add components/gsap/Reveal.tsx tests/visual/reveal.spec.ts
git commit -m "feat(gsap): add Reveal primitive (replaces FadeIn) + reduced-motion guard"
```

---

### Task 1.2: `<SplitReveal>` primitive (replaces `HeroHeadline`)

**Files:**
- Create: `components/gsap/SplitReveal.tsx`

**Interfaces:**
- Produces: `<SplitReveal text as? type? className? style? delay? duration? stagger?>` rendering a heading/paragraph; masks lines/words/chars up. LCP-safe via a fonts-ready cap.

- [ ] **Step 1: Create the primitive**

```tsx
'use client'

import { createElement, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import { registerGsap, Q_MOTION } from '@/lib/gsap'

registerGsap()

interface SplitRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'p'
  type?: 'lines' | 'words' | 'chars'
  className?: string
  style?: React.CSSProperties
  delay?: number
  duration?: number
  stagger?: number
}

export function SplitReveal({
  text, as = 'h1', type = 'lines', className, style,
  delay = 0, duration = 0.9, stagger = 0.12,
}: SplitRevealProps) {
  // Typed as HTMLElement (not a union) and rendered via createElement so the
  // dynamic tag's ref type-checks cleanly for h1/h2/p alike.
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_MOTION, () => {
        const el = ref.current
        if (!el) return
        let split: SplitText | null = null
        let cancelled = false
        const run = () => {
          if (cancelled) return
          split = new SplitText(el, { type, mask: type === 'lines' ? 'lines' : undefined })
          gsap.set(el, { autoAlpha: 1 })
          gsap.from(split[type], { yPercent: 110, duration, delay, ease: 'smooth', stagger })
        }
        // Split after fonts are ready (final line breaks), but cap the wait so the
        // LCP headline is never hidden longer than ~150ms beyond hydration.
        if (document.fonts?.status === 'loaded') run()
        else Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 150))]).then(run)
        return () => { cancelled = true; split?.revert() }
      })
    },
    { scope: ref, dependencies: [text] },
  )

  return createElement(as, { ref, className, style, 'data-reveal': '' }, text)
}
```

- [ ] **Step 2: Verify build & lint**

Run: `npm run build && npm run lint` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/gsap/SplitReveal.tsx
git commit -m "feat(gsap): add SplitReveal primitive (replaces HeroHeadline)"
```

---

### Task 1.3: `<Parallax>` primitive

**Files:**
- Create: `components/gsap/Parallax.tsx`

**Interfaces:**
- Produces: `<Parallax speed? lag? className? style?>` — a div that sets ScrollSmoother `data-speed`/`data-lag`. No-op without a smoother (mobile/reduced-motion).

- [ ] **Step 1: Create the primitive**

```tsx
'use client'

interface ParallaxProps {
  /** ScrollSmoother data-speed: 1 = normal, <1 slower, >1 faster, 'auto' = fit. */
  speed?: number | 'auto'
  /** ScrollSmoother data-lag: seconds to "catch up". */
  lag?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function Parallax({ speed, lag, className, style, children }: ParallaxProps) {
  const attrs: Record<string, string> = {}
  if (speed != null) attrs['data-speed'] = String(speed)
  if (lag != null) attrs['data-lag'] = String(lag)
  return (
    <div className={className} style={style} {...attrs}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Verify build & lint**

Run: `npm run build && npm run lint` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/gsap/Parallax.tsx
git commit -m "feat(gsap): add Parallax primitive (data-speed/data-lag)"
```

---

### Task 1.4: `useScrollVelocity` hook

**Files:**
- Create: `components/gsap/useScrollVelocity.ts`

**Interfaces:**
- Produces: `useScrollVelocity(ref, maxSkew?)` — tweens `skewX` on `ref.current` from scroll velocity. Desktop+motion only. Apply to a WRAPPER, never the element running a CSS transform.

- [ ] **Step 1: Create the hook**

```ts
'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

/** Skews `ref` based on scroll velocity (deg). Apply to a wrapper element so it
 *  doesn't fight a CSS transform on the inner content. */
export function useScrollVelocity(ref: React.RefObject<HTMLElement | null>, maxSkew = 6) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const el = ref.current
        if (!el) return
        const setSkew = gsap.quickTo(el, 'skewX', { duration: 0.4, ease: 'power3' })
        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            setSkew(gsap.utils.clamp(-maxSkew, maxSkew, self.getVelocity() / -300))
          },
        })
        return () => st.kill()
      })
    },
    { scope: ref },
  )
}
```

- [ ] **Step 2: Verify build & lint**

Run: `npm run build && npm run lint` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/gsap/useScrollVelocity.ts
git commit -m "feat(gsap): add useScrollVelocity hook"
```

---

### Task 1.5: `usePinnedScene` hook

**Files:**
- Create: `components/gsap/usePinnedScene.ts`

**Interfaces:**
- Produces: `usePinnedScene({ trigger, build, end?, scrub? })` — pins `trigger` and runs a scrubbed timeline built by `build({ timeline })`. Desktop+motion only; no-op otherwise.

- [ ] **Step 1: Create the hook**

```ts
'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

interface PinnedSceneOptions {
  trigger: React.RefObject<HTMLElement | null>
  /** Build the scrubbed timeline. Runs inside matchMedia (auto-cleaned). */
  build: (ctx: { timeline: gsap.core.Timeline }) => void
  /** ScrollTrigger end. Default '+=150%' (pins for ~1.5 viewports). */
  end?: string
  scrub?: number | boolean
}

export function usePinnedScene({ trigger, build, end = '+=150%', scrub = 1 }: PinnedSceneOptions) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const el = trigger.current
        if (!el) return
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top top', end, pin: true, scrub, anticipatePin: 1 },
        })
        build({ timeline: tl })
        return () => { tl.scrollTrigger?.kill(); tl.kill() }
      })
    },
    { scope: trigger },
  )
}
```

- [ ] **Step 2: Verify build & lint**

Run: `npm run build && npm run lint` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/gsap/usePinnedScene.ts
git commit -m "feat(gsap): add usePinnedScene hook"
```

---

### Task 1.6: Services hero — SplitReveal + parallax + velocity marquee

Rebuild the hero (`<section className="svc-hero">`) motion. Swap Motion `FadeIn`/`HeroHeadline` for `Reveal`/`SplitReveal`; add multi-plane parallax via `Parallax`; add velocity skew to the marquee wrapper.

**Files:**
- Modify: `app/[locale]/services/page.tsx`

**Interfaces:**
- Consumes: `Reveal`, `SplitReveal`, `Parallax`, `useScrollVelocity` from `@/components/gsap/*`.

- [ ] **Step 1: Swap hero imports & headline**

In `app/[locale]/services/page.tsx`, add:
```tsx
import { Reveal } from '@/components/gsap/Reveal'
import { SplitReveal } from '@/components/gsap/SplitReveal'
import { Parallax } from '@/components/gsap/Parallax'
```
Replace the `<HeroHeadline … />` usage with:
```tsx
<SplitReveal
  text={heroTitle}
  type="lines"
  className="gradient-text gradient-text--animate text-[clamp(3.6rem,11vw,128px)] font-black leading-[0.88] tracking-[-0.055em] mb-12 [word-break:break-word]"
  style={{ '--gt-gradient': 'linear-gradient(135deg,#fff 38%,#facc15 52%,#fff 68%)' } as React.CSSProperties}
/>
```
Replace each hero `<FadeIn …>` wrapper (eyebrow, rule, bold, short, more, button) with `<Reveal …>` keeping the same `delay`/`yOffset` values (e.g. `<FadeIn yOffset={20} duration={0.7}>` → `<Reveal yOffset={20} duration={0.7}>`).

- [ ] **Step 2: Add multi-plane parallax to hero layers**

Wrap the two `<GlowOrb>` orbs, the `.svc-hero__grid`, and the `.svc-hero__ghost` so each drifts at a different `data-speed`. Example for the ghost number:
```tsx
<Parallax speed={0.8} className="svc-hero__ghost-wrap" aria-hidden="true">
  <div className="svc-hero__ghost">01</div>
</Parallax>
```
Use: orbs `speed={1.15}` and `speed={0.9}`, grid `speed={1.05}`, ghost `speed={0.8}`. (Keep `animation="none"`/positioning on `GlowOrb` as-is; `Parallax` is a wrapping div.)

> Marquee velocity skew is wired in Step 3. The category strip itself must be a client-rendered island; since the whole page is a Server Component, extract the marquee + its velocity wrapper into a small client component `components/services/HeroMarquee.tsx` that takes `items: string[]` and renders the existing `<Marquee>` inside a `ref`'d wrapper running `useScrollVelocity`.

- [ ] **Step 3: Create `HeroMarquee` client island**

```tsx
// components/services/HeroMarquee.tsx
'use client'

import { useRef } from 'react'
import { Marquee } from '@/components/ui'
import { useScrollVelocity } from '@/components/gsap/useScrollVelocity'

export function HeroMarquee({ items }: { items: string[] }) {
  const wrap = useRef<HTMLDivElement>(null)
  useScrollVelocity(wrap, 5)
  return (
    <div ref={wrap} style={{ willChange: 'transform' }}>
      <Marquee
        items={items}
        repeat={4}
        speed={44}
        renderItem={(cat, i) => (
          <span key={i} className="svc-hero__strip-item">
            {cat}
            <span className="svc-hero__strip-dot">✦</span>
          </span>
        )}
      />
    </div>
  )
}
```
In `services/page.tsx`, replace the inline `<Marquee … />` inside `.svc-hero__strip` with `<HeroMarquee items={svcCategories} />` and import it.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop, motion): reload `/services` — headline masks up line-by-line once; eyebrow/rule/meta reveal in sequence; on scroll the orbs/grid/ghost drift at visibly different rates; the category strip skews slightly with fast scrolling. No flash of hidden content (headline appears within ~150ms). Reduced-motion: everything visible immediately, no drift. Mobile: no parallax/skew, content intact.
Run: `npm run test:visual` → all routes PASS (services at rest is unchanged enough; if the hero layout shifted, `npm run test:visual:update` and re-run).

- [ ] **Step 5: Commit**

```bash
git add app/\[locale\]/services/page.tsx components/services/HeroMarquee.tsx tests/visual/routes.spec.ts-snapshots
git commit -m "feat(services): cinematic hero — SplitReveal headline, parallax layers, velocity marquee"
```

---

### Task 1.7: Services Product — horizontal scrub-gallery (the signature)

The Product section's desktop gallery (`.svc-prod__gallery`) becomes a horizontally-scrubbed wall while the section pins; the numbered menu holds beside it. Desktop+motion only; mobile keeps today's collage. This is the highest-risk task — build it isolated and verify before moving on.

**Files:**
- Create: `components/services/ProductGalleryScene.tsx`
- Modify: `app/[locale]/services/page.tsx`

**Interfaces:**
- Consumes: `usePinnedScene` from `@/components/gsap/usePinnedScene`.
- Produces: `<ProductGalleryScene images={string[]} dir={'ltr'|'rtl'} menu={ReactNode} />`.

- [ ] **Step 1: Create the scene component**

```tsx
// components/services/ProductGalleryScene.tsx
'use client'

import { useRef } from 'react'
import { wpImg } from '@/lib/images'
import { usePinnedScene } from '@/components/gsap/usePinnedScene'

export function ProductGalleryScene({
  images, dir, menu,
}: { images: string[]; dir: 'ltr' | 'rtl'; menu: React.ReactNode }) {
  const scene = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  usePinnedScene({
    trigger: scene,
    end: '+=200%',
    build: ({ timeline }) => {
      const t = track.current
      if (!t) return
      // Translate the track so its overflow scrolls past the viewport. Flip sign in RTL.
      const distance = t.scrollWidth - t.clientWidth
      const sign = dir === 'rtl' ? 1 : -1
      timeline.to(t, { x: sign * distance, ease: 'none' })
    },
  })

  return (
    <div ref={scene} className="svc-pgscene">
      <div className="svc-pgscene__rail">
        <div ref={track} className="svc-pgscene__track">
          {images.map((img, i) => (
            <div key={i} className="svc-pgscene__card" data-depth={i % 3}>
              <img src={wpImg(img) ?? ''} alt="" />
            </div>
          ))}
        </div>
      </div>
      <div className="svc-pgscene__menu">{menu}</div>
    </div>
  )
}
```
Add the scene CSS to the services page `<style>` block:
```css
.svc-pgscene { position: relative; }
.svc-pgscene__rail { overflow: hidden; width: 100%; }
.svc-pgscene__track { display: flex; gap: 24px; width: max-content; will-change: transform; }
/* Fixed aspect-ratio makes the track width deterministic at layout time, so the
   scrub distance never depends on image-load timing. */
.svc-pgscene__card { flex: 0 0 auto; width: clamp(280px, 32vw, 460px); aspect-ratio: 4 / 3; border-radius: 22px; overflow: hidden; background: #111; box-shadow: 0 18px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04); }
.svc-pgscene__card img { width: 100%; height: 100%; object-fit: cover; display: block; }
.svc-pgscene__card[data-depth='1'] { margin-top: 36px; }
.svc-pgscene__card[data-depth='2'] { margin-top: 18px; }
.svc-pgscene__menu { margin-top: 32px; }
/* The scene is desktop-only; below lg the page keeps the existing collage. */
@media (max-width: 1023px) { .svc-pgscene { display: none; } }
```

- [ ] **Step 2: Wire it into the Product section (desktop) without breaking mobile**

In `services/page.tsx`, the Product `<div className="svc-prod__body">` currently renders the desktop `.svc-prod__gallery` + sticky `.svc-prod__menu`, plus a `md:hidden` mobile collage. Keep the mobile collage exactly as-is. Replace the desktop gallery + menu pair with:
- Render `<ProductGalleryScene images={prodImages} dir={loc === 'he' ? 'rtl' : 'ltr'} menu={<ServiceModalMenu services={productServices} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" />} />` for the desktop path (it self-hides below `lg` via the CSS above).
- Keep the existing `.svc-prod__gallery` markup but add `hidden` semantics so only ONE desktop gallery shows. Simplest: remove the old desktop `.svc-prod__gallery` block and the old sticky `.svc-prod__menu` wrapper, since `ProductGalleryScene` now owns the desktop gallery + menu; the `md:hidden` mobile collage + a mobile-only menu remain.

> Mobile menu: ensure the numbered menu still renders on mobile. Add a `lg:hidden` block after the mobile collage that renders `<ServiceModalMenu …/>` (the same menu), so mobile users get the collage + menu while desktop gets the pinned scene.

- [ ] **Step 3: Verify the signature carefully**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop ≥1024, motion):
- Scroll into Product → section pins; the image wall scrubs horizontally L→R as you scroll down; rows sit at staggered depths; releases at scene end and normal scroll resumes.
- The numbered menu is reachable and its hover/modal still works.
- `/he/services`: the wall scrubs the opposite direction (R→L start).
- Resize <1024: no pin; the mobile collage + menu show; no horizontal scroll artifacts.
- Reduced motion (desktop): no pin; confirm the section still shows content — since the scene is desktop-CSS-shown but the pin is matchMedia-gated, under reduced-motion the track renders statically (it may overflow). If it overflows awkwardly, add `@media (prefers-reduced-motion: reduce) { .svc-pgscene { display: none; } }` and ensure a static fallback gallery shows. Verify and adjust.
Run: `npm run test:visual` → services snapshot will change (intentional): `npm run test:visual:update`; other routes must stay green.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/services/page.tsx components/services/ProductGalleryScene.tsx tests/visual/routes.spec.ts-snapshots
git commit -m "feat(services): horizontal scrub-gallery signature scene for Product"
```

---

### Task 1.8: Services Branding — wipe + polaroid stagger (the exhale)

Replace `SectionReveal` (the polaroid grid) with `Reveal stagger`; add a dark→cream entry wipe; preserve the menu's stick-beside-gallery via a light desktop pin. NOT a scrubbed scene.

**Files:**
- Modify: `app/[locale]/services/page.tsx`
- Create: `components/services/BrandingMenuPin.tsx` (small client wrapper to pin the menu)

- [ ] **Step 1: Swap the polaroid grid reveal**

Replace `<SectionReveal className="svc-polaroid-grid">…</SectionReveal>` with:
```tsx
<Reveal stagger={0.11} className="svc-polaroid-grid">
  {brandImages.map((img, i) => (
    <div key={i} className="svc-polaroid" style={{ '--pi': i } as React.CSSProperties}>
      <div className="svc-polaroid__frame">
        <img src={wpImg(img) ?? ''} alt="" className="svc-polaroid__img" />
      </div>
    </div>
  ))}
</Reveal>
```
Remove the now-unused `svcPolaroidIn` keyframes and the `.svc-polaroid { animation … }` rule from the `<style>` block (the `Reveal` now drives entry; keep the per-child rotation rules `:nth-child` and the hover rule).

- [ ] **Step 2: Reveal the Branding heading (no JS wipe)**

Decision: do NOT add a JS wipe. The dark→cream transition is the existing cream `.svc-brand` background meeting the dark section above — that boundary already reads as a clean handoff and a scrubbed wipe would compete with the Product peak. The only entry motion here is the heading reveal + polaroid stagger (Step 1).

Wrap the Branding section heading (`<FadeIn className="section-head" …>` currently) by replacing that `FadeIn` with `Reveal`, keeping the same `className` and `style`:
```tsx
<Reveal className="section-head" style={{ '--sh-title-color': '#0a0a0a', '--sh-sub-color': '#4b5563' } as React.CSSProperties}>
  {/* …existing Eyebrow + h2 + sub markup unchanged… */}
</Reveal>
```

- [ ] **Step 3: Convert the Branding menu sticky → light desktop pin**

`.svc-brand__menu` uses `position: sticky; top: 96px`. Remove that rule. Create the pin wrapper:
```tsx
// components/services/BrandingMenuPin.tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

export function BrandingMenuPin({ sectionSelector, children }: { sectionSelector: string; children: React.ReactNode }) {
  const menu = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const section = document.querySelector<HTMLElement>(sectionSelector)
        const el = menu.current
        if (!section || !el) return
        const st = ScrollTrigger.create({
          trigger: section, start: 'top 96px', end: 'bottom bottom',
          pin: el, pinSpacing: false, anticipatePin: 1,
        })
        return () => st.kill()
      })
    },
    { scope: menu },
  )
  return <div ref={menu} className="svc-brand__menu">{children}</div>
}
```
Replace the existing `<div className="svc-brand__menu">…</div>` with:
```tsx
<BrandingMenuPin sectionSelector=".svc-brand__body">
  <ServiceModalMenu services={brandServices} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" variant="light" />
</BrandingMenuPin>
```
> Give `.svc-brand__body` a stable identifier (it already has the class). Pin scoped desktop-only; mobile keeps normal flow.

- [ ] **Step 4: Verify**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop, motion): scrolling into Branding feels calm — polaroids reveal in a staggered cascade once; the numbered menu holds beside the grid then releases; the dark→cream boundary reads clean. Mobile: polaroids in 2-col, menu in normal flow. Reduced motion: all visible, menu static.
Run: `npm run test:visual` → services changes intentional (`:update`); other routes green.

- [ ] **Step 5: Commit**

```bash
git add app/\[locale\]/services/page.tsx components/services/BrandingMenuPin.tsx tests/visual/routes.spec.ts-snapshots
git commit -m "feat(services): branding exhale — polaroid stagger + light menu pin"
```

---

### Task 1.9: Services Engineering — depth-rise + chip sequence

Replace the `FadeIn` on the dev image with a `Parallax` depth-rise; reveal the tech chips in sequence via `Reveal stagger`. Moderate intensity.

**Files:**
- Modify: `app/[locale]/services/page.tsx`
- Modify: `components/ServiceTechGroups.tsx` (chip stagger) — only if chips aren't already wrapped; otherwise wrap in the page.

- [ ] **Step 1: Depth-rise the dev image**

Replace the `<FadeIn delay={0.18} yOffset={32} className="svc-dev__img-wrap">…</FadeIn>` wrapper with a `Parallax` (slower speed → it rises relative to scroll) plus a `Reveal` for the entry:
```tsx
<Reveal yOffset={32} delay={0.1} className="svc-dev__img-wrap">
  <Parallax speed={0.85}>
    <div className="svc-dev__img-inner">
      <img src={wpImg(sp.devleftimage.node.sourceUrl) ?? ''} alt="" className="svc-dev__img" />
      <div className="svc-dev__img-glow" aria-hidden="true" />
    </div>
  </Parallax>
</Reveal>
```

- [ ] **Step 2: Stagger the tech chips**

If `ServiceTechGroups` renders the chip `<ul className="svc-tech-chips">`, wrap that list’s items reveal. Prefer doing it inside `ServiceTechGroups` by wrapping each group's chips list in `<Reveal stagger={0.05}>`. Read `components/ServiceTechGroups.tsx` first (`cat components/ServiceTechGroups.tsx`) and wrap the `<ul className="svc-tech-chips">…</ul>` with `<Reveal stagger={0.05} className="svc-tech-chips">` (move the class to the Reveal, change the inner to a plain `<ul>` or keep structure and let Reveal animate `<li>` children). Keep the title/sub reveals via `Reveal` as needed.

- [ ] **Step 3: Verify**

Run: `npm run build && npm run lint` → PASS.
Manual (desktop): the dev image rises with a subtle depth offset; chips pop in sequence. Mobile/reduced-motion: present, static. Other routes green; services snapshot `:update`.

- [ ] **Step 4: Commit**

```bash
git add app/\[locale\]/services/page.tsx components/ServiceTechGroups.tsx tests/visual/routes.spec.ts-snapshots
git commit -m "feat(services): engineering depth-rise image + chip sequence"
```

---

### Task 1.10: Services outro + remove Motion from the page (Phase 1 checkpoint)

Reveal Clients/FAQ as a quiet outro; remove ALL remaining Motion usage and imports from `services/page.tsx`; retire replaced CSS; final cinematic QA.

**Files:**
- Modify: `app/[locale]/services/page.tsx`

- [ ] **Step 1: Outro reveals**

Wrap the Clients and FAQ section entries (or their headings) in `<Reveal>` for a quiet settle. (ClientsSection/FAQSection are separate components; if they already animate internally, only add a light `Reveal` around the section wrapper if needed — don't double-animate.)

- [ ] **Step 2: Purge Motion from the services page**

Confirm no `FadeIn`, `HeroHeadline`, `SectionReveal`, or `motion/react` imports remain in `app/[locale]/services/page.tsx`. Run:
```bash
grep -nE "FadeIn|HeroHeadline|SectionReveal|motion/react" app/\[locale\]/services/page.tsx
```
Expected: no matches. Remove any leftover imports.

- [ ] **Step 3: Retire replaced CSS**

In the page `<style>` block, remove `@keyframes svcScrollPulse` and `@keyframes svcPolaroidIn` and the rules that referenced them (the scroll-cue line can keep a static style or a `Reveal`). Keep the mobile-collage float keyframes (mobile-only, smoothing off there). Confirm no orphaned selectors.

- [ ] **Step 4: Full Phase 1 verification**

Run: `npm run build && npm run lint` → PASS.
Run: `npm run test:visual` → re-baseline services (`npm run test:visual:update`); ALL other routes PASS unchanged.
Manual cinematic QA on `/services` AND `/he/services`:
- Desktop + motion: overture hero → Product pins & scrubs horizontally (peak) → Branding calm exhale → Engineering resolve → quiet outro. Smooth scroll throughout. Yellow used only as emphasis.
- Mobile: native scroll; collage + stacked menus; reveals simple; no pins.
- Reduced motion: all content visible, no pins/scrub/parallax.
- JS disabled: full page content present (SEO).
- Keyboard: Tab reaches all service links; anchor/focus scrolling isn't fought by the smoother.
- LCP: run Lighthouse on `/services` (desktop + mobile) — LCP within target; if the SplitReveal headline regresses LCP, fall back to rendering the headline visible (drop `data-reveal`, replace the mask-up with a short opacity fade).

- [ ] **Step 5: Commit**

```bash
git add app/\[locale\]/services/page.tsx tests/visual/routes.spec.ts-snapshots
git commit -m "feat(services): outro reveals, remove Motion from services page, retire dead CSS"
```

---

## Done criteria
- `/services` and `/he/services` deliver the cinematic choreography on desktop, degrade cleanly on mobile and reduced-motion, and keep full SSR content.
- `npm run build`, `npm run lint`, and `npm run test:visual` all pass; non-services snapshots unchanged.
- No `motion/react` imports remain in `app/[locale]/services/page.tsx`; Motion still used elsewhere.
- All former `position: sticky`/`fixed` site-wide behaves correctly under global ScrollSmoother.
