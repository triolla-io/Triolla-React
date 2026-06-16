# Responsive Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix global overflow bleed that makes every breakpoint ineffective, then enhance the home page with fluid sizing and creative mobile polish.

**Architecture:** Phase 0 is a prerequisite — one global CSS guard fixes the overflow root cause so every existing Tailwind breakpoint "turns on". Phase 1 then layers in fluid sizing and touch interactions component by component.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4 (PostCSS, no config file), Framer Motion (`motion/react`), inline `<style>` blocks (project convention for complex component styles), TypeScript.

**Testing note:** No test suite is configured. Each task's "verify" step means: run `npm run dev`, open DevTools → Toggle Device Toolbar → 375px (iPhone SE), and check the stated behavior.

---

## File Map

| File | Change |
|------|--------|
| `app/globals.css` | Add `overflow-x: hidden` on `html, body`; fluid marquee fade width |
| `components/HeaderClient.tsx` | Fix dropdown tablet overflow; close drawer on route change |
| `components/GridImageSection.tsx` | Guard 3D tilt with `@media (hover: none)` |
| `components/PortfolioGrid.tsx` | Add `aspect-ratio` on cards; tap-to-reveal overlay (→ client component) |
| `components/ClientsSection.tsx` | Replace fixed `176px/112px` + `@media` override with `clamp()` |
| `components/AnimatedSteps.tsx` | Add scroll-driven pagination dots |
| `app/[locale]/page.tsx` | Add floating mobile CTA (IntersectionObserver on hero) |

---

## Task 1: Global overflow guard + fluid marquee fades

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Observe the broken state**

  Run `npm run dev`. Open http://localhost:3000 in DevTools, set device to iPhone SE (375px). Scroll horizontally — the page overflows and elements appear zoomed out. Note it.

- [ ] **Step 2: Add overflow guard to globals.css**

  Open `app/globals.css`. After the `body { ... }` block (around line 46), add:

  ```css
  html {
    overflow-x: hidden;
  }
  ```

  The existing `body` rule already handles background/color/font. Just add this `html` rule.

- [ ] **Step 3: Fix marquee fade mask width**

  In `globals.css`, in the `.marquee__fade` rule inside `@layer components`, change the width:

  **Before:**
  ```css
  .marquee__fade {
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--mq-fade-w, 220px);
    z-index: 2;
    pointer-events: none;
  }
  ```

  **After:**
  ```css
  .marquee__fade {
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--mq-fade-w, clamp(48px, 8vw, 220px));
    z-index: 2;
    pointer-events: none;
  }
  ```

- [ ] **Step 4: Verify**

  `npm run dev` → 375px DevTools. Horizontal overflow should be gone. The page should no longer scroll sideways.

- [ ] **Step 5: Build check**

  ```bash
  npm run build
  ```
  Expected: no TypeScript errors, build succeeds.

- [ ] **Step 6: Commit**

  ```bash
  git add app/globals.css
  git commit -m "fix(responsive): add html overflow-x guard + fluid marquee fade width"
  ```

---

## Task 2: Dropdown panel — tablet overflow fix

**Files:**
- Modify: `components/HeaderClient.tsx` (lines 103–115)

The `DropdownItem` component places its panel with `position: fixed` via a portal. On a ~900px tablet, a promo panel of `minWidth: 900` can overflow the right edge. Fix: cap the panel so it never exceeds viewport width.

- [ ] **Step 1: Observe**

  DevTools → 900px wide. Click a nav item that has >6 children (the promo dropdown). The panel may clip or push right. Note it.

- [ ] **Step 2: Update the promo panel positioning**

  In `components/HeaderClient.tsx`, inside `DropdownItem`, find the `style` object on the `m.div` portal (lines ~96–115). Replace the promo branch:

  **Before:**
  ```tsx
  ...(showPromo
    ? {
        left: Math.max(
          16,
          Math.min(rect.left + rect.width / 2 - PROMO_PANEL_WIDTH / 2, window.innerWidth - PROMO_PANEL_WIDTH - 16),
        ),
        minWidth: PROMO_PANEL_WIDTH,
      }
  ```

  **After:**
  ```tsx
  ...(showPromo
    ? {
        left: Math.max(
          16,
          Math.min(rect.left + rect.width / 2 - PROMO_PANEL_WIDTH / 2, window.innerWidth - PROMO_PANEL_WIDTH - 16),
        ),
        minWidth: Math.min(PROMO_PANEL_WIDTH, window.innerWidth - 32),
        maxWidth: window.innerWidth - 32,
      }
  ```

- [ ] **Step 3: Verify**

  DevTools → 900px. Open the large dropdown. Panel should fit within the viewport without clipping.

- [ ] **Step 4: Build check**

  ```bash
  npm run build
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add components/HeaderClient.tsx
  git commit -m "fix(header): cap dropdown panel width to viewport on tablet"
  ```

---

## Task 3: GridImageSection — disable 3D tilt on touch devices

**Files:**
- Modify: `components/GridImageSection.tsx`

The `onMouseMove` tilt handler only fires on pointer devices (not touch), so tilt is already de-facto disabled. But the `cursor: crosshair` style looks wrong on mobile. Fix with a `@media (hover: none)` guard.

- [ ] **Step 1: Add CSS guard**

  In `components/GridImageSection.tsx`, find the inline `<style>` block. After the `.gi-frame` rule (ends around `cursor: crosshair;`), add:

  ```css
  @media (hover: none) {
    .gi-frame { cursor: default; }
  }
  ```

  Place it just before the `/* pulsing glow on border */` comment.

- [ ] **Step 2: Verify**

  DevTools → 375px (ensure "Touch" is enabled). The image section should show no crosshair cursor. Parallax scroll still works (reduced intensity at <768px via existing code).

- [ ] **Step 3: Build + commit**

  ```bash
  npm run build
  git add components/GridImageSection.tsx
  git commit -m "fix(grid-image): disable crosshair cursor on touch devices"
  ```

---

## Task 4: PortfolioGrid — aspect-ratio + tap-to-reveal

**Files:**
- Modify: `components/PortfolioGrid.tsx`

Currently images have no aspect-ratio, so card heights vary. On mobile, the tap-to-reveal replaces hover (hover is invisible on touch).

- [ ] **Step 1: Observe**

  DevTools → 375px. Scroll to the portfolio grid. Cards have inconsistent heights since images are different sizes. Tapping a card does nothing (no hover interaction on touch).

- [ ] **Step 2: Convert to client component + add tap-to-reveal**

  Replace the entire `components/PortfolioGrid.tsx` with:

  ```tsx
  'use client'

  import { useState } from 'react'
  import { m } from 'motion/react'
  import { EASE } from '@/lib/motion'

  const WP_IMAGES = [
    { src: 'https://triolla.io/wp-content/uploads/2025/06/2.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/1.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/medicak-ipad.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/3.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/final_watch6.svg', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/6.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/Front-cloean-1.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/88.png', alt: 'Portfolio work' },
    { src: 'https://triolla.io/wp-content/uploads/2025/06/White-1.png', alt: 'Portfolio work' },
  ]

  const COL1 = [0, 3, 6]
  const COL2 = [1, 4, 7]
  const COL3 = [2, 5, 8]

  function MasonryColumn({
    indices,
    delay,
    activeIdx,
    onTap,
  }: {
    indices: number[]
    delay: number
    activeIdx: number | null
    onTap: (idx: number) => void
  }) {
    return (
      <div className="flex flex-col gap-3 md:gap-5">
        {indices.map((idx, i) => {
          const img = WP_IMAGES[idx]
          const isActive = activeIdx === idx
          return (
            <m.div
              key={img.src}
              className="shine-card group overflow-hidden rounded-2xl relative bg-[#0f0f0f] cursor-pointer"
              style={{ aspectRatio: '4/3' }}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: delay + i * 0.1, ease: [...EASE.smooth] }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onTap(idx)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
              />
              {/* hover shine sweep (desktop) */}
              <div className="shine-card__shine" aria-hidden="true" />
              {/* tap-to-reveal overlay (touch) — visible when isActive */}
              <m.div
                className="absolute inset-0 flex items-end p-4"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 65%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="text-white font-semibold text-sm border-b-2 border-yellow-400 pb-0.5">
                  View work
                </span>
              </m.div>
            </m.div>
          )
        })}
      </div>
    )
  }

  export function PortfolioGrid() {
    const [activeIdx, setActiveIdx] = useState<number | null>(null)

    const handleTap = (idx: number) => {
      setActiveIdx(prev => (prev === idx ? null : idx))
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        <MasonryColumn indices={COL1} delay={0} activeIdx={activeIdx} onTap={handleTap} />
        <MasonryColumn indices={COL2} delay={0.08} activeIdx={activeIdx} onTap={handleTap} />
        <MasonryColumn indices={COL3} delay={0.16} activeIdx={activeIdx} onTap={handleTap} />
      </div>
    )
  }
  ```

- [ ] **Step 3: Verify**

  DevTools → 375px. All cards should be uniform 4:3 ratio. Tap a card — "View work" label fades in at the bottom with a yellow underline. Tap again — it fades out.

  DevTools → 1280px. Hover over a card — the original shine sweep still plays (desktop hover is unchanged).

- [ ] **Step 4: Build + commit**

  ```bash
  npm run build
  git add components/PortfolioGrid.tsx
  git commit -m "feat(portfolio-grid): uniform aspect-ratio + tap-to-reveal on mobile"
  ```

---

## Task 5: ClientsSection — clamp-based logo sizing

**Files:**
- Modify: `components/ClientsSection.tsx` (inline `<style>`)

Replace the fixed `176px / 112px` card + `@media` override with `clamp()` so logos scale fluidly with no breakpoint jump.

- [ ] **Step 1: Update the CSS**

  In `components/ClientsSection.tsx`, inside the `<style>` block, replace:

  ```css
  .cs-logo-card {
    flex-shrink: 0;
    width: 176px; height: 112px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.025);
    display: flex; align-items: center; justify-content: center;
    padding: 14px;
    position: relative;
    transition: border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease;
    overflow: hidden;
    backdrop-filter: blur(2px);
  }
  ```

  With:

  ```css
  .cs-logo-card {
    flex-shrink: 0;
    width: clamp(120px, 18vw, 176px);
    height: clamp(76px, 11.5vw, 112px);
    border-radius: clamp(16px, 3vw, 24px);
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.025);
    display: flex; align-items: center; justify-content: center;
    padding: clamp(10px, 1.5vw, 14px);
    position: relative;
    transition: border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease;
    overflow: hidden;
    backdrop-filter: blur(2px);
  }
  ```

  Then remove the entire `@media (max-width: 768px)` block for `.cs-logo-card`:

  **Remove this block:**
  ```css
  @media (max-width: 768px) {
    .cs-clients { padding: 52px 0 64px; }
    .cs-logo-card { width: 136px; height: 88px; border-radius: 18px; }
  }
  ```

  **Replace with** (keep the section padding change, drop the card override):
  ```css
  @media (max-width: 768px) {
    .cs-clients { padding: 52px 0 64px; }
  }
  ```

- [ ] **Step 2: Verify**

  DevTools → 375px. Logo cards should be ~120px wide, proportionally sized. No jump at the 768px breakpoint — resize the viewport and watch logos scale continuously.

- [ ] **Step 3: Build + commit**

  ```bash
  npm run build
  git add components/ClientsSection.tsx
  git commit -m "fix(clients): replace fixed logo card px with clamp() fluid sizing"
  ```

---

## Task 6: AnimatedSteps — scroll-driven pagination dots

**Files:**
- Modify: `components/AnimatedSteps.tsx`

The scroll-snap is already implemented (`scroll-snap-type: x mandatory`, `scroll-snap-align: start`). Add a dots indicator below that tracks which step is currently snapped.

- [ ] **Step 1: Observe**

  DevTools → 375px. The steps section already scroll-snaps. But there's no indication of how many steps there are or which one you're on.

- [ ] **Step 2: Add the dots (convert to 'use client' + add ref + scroll listener)**

  At the top of `components/AnimatedSteps.tsx`, add `'use client'` and the new imports:

  ```tsx
  'use client'

  import { useRef, useState, useEffect } from 'react'
  import { m, AnimatePresence } from 'motion/react'
  import parse from 'html-react-parser'
  import { FadeIn } from './FadeIn'
  import { GlowOrb, Eyebrow } from '@/components/ui'
  ```

  In the `AnimatedSteps` function body, add a ref for the scroll container and state for the active index:

  ```tsx
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const cardWidth = el.scrollWidth / steps.length
      const idx = Math.round(el.scrollLeft / cardWidth)
      setActiveStep(Math.min(idx, steps.length - 1))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [steps.length])
  ```

  On the scroll wrapper `<div className="tech-steps__scroll-wrap">`, add the ref:

  ```tsx
  <div className="tech-steps__scroll-wrap" ref={scrollRef}>
  ```

  After the closing `</div>` of the scroll wrapper (just before `</section>`), add the dots:

  ```tsx
  {steps.length > 1 && (
    <div className="flex justify-center gap-2 mt-4 md:hidden" aria-hidden="true">
      {steps.map((_, i) => (
        <m.span
          key={i}
          animate={{
            width: i === activeStep ? 16 : 6,
            backgroundColor: i === activeStep ? '#facc15' : 'rgba(255,255,255,0.25)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ height: 6, borderRadius: 999, display: 'block' }}
        />
      ))}
    </div>
  )}
  ```

- [ ] **Step 3: Verify**

  DevTools → 375px. Swipe through the steps — the yellow dot slides to track the active card. On desktop (>768px) the dots are hidden (`md:hidden`).

- [ ] **Step 4: Build + commit**

  ```bash
  npm run build
  git add components/AnimatedSteps.tsx
  git commit -m "feat(steps): add scroll-driven pagination dots on mobile"
  ```

---

## Task 7: Hero — floating mobile CTA

**Files:**
- Modify: `app/[locale]/page.tsx`

The hero has no CTA button. A floating sticky CTA at the bottom of the screen on mobile improves conversion. It appears only after the user scrolls past the top of the page, uses IntersectionObserver on a sentinel element placed in the hero.

- [ ] **Step 1: Create the FloatingCta client component**

  Create `components/FloatingCta.tsx`:

  ```tsx
  'use client'

  import { useEffect, useRef, useState } from 'react'
  import Link from 'next/link'
  import { m, AnimatePresence } from 'motion/react'

  interface FloatingCtaProps {
    href: string
    label: string
  }

  export function FloatingCta({ href, label }: FloatingCtaProps) {
    const sentinelRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
      const el = sentinelRef.current
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0 },
      )
      obs.observe(el)
      return () => obs.disconnect()
    }, [])

    return (
      <>
        {/* sentinel placed by the caller at the bottom of the hero */}
        <div ref={sentinelRef} aria-hidden="true" />
        <AnimatePresence>
          {visible && (
            <m.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed bottom-0 inset-x-0 z-40 md:hidden"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))', padding: '12px 16px' }}
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
      </>
    )
  }
  ```

- [ ] **Step 2: Add FloatingCta to the home page**

  In `app/[locale]/page.tsx`, add the import at the top:

  ```tsx
  import { FloatingCta } from '@/components/FloatingCta'
  ```

  Inside the hero `<section>`, at the very end just before the scroll cue `</section>` close, add the `FloatingCta`. The `contactButtonText` is not available in `page.tsx` directly, so use a static label (pulled from theme settings if available, otherwise a safe default):

  Find this block in `page.tsx`:
  ```tsx
        {/* Scroll cue */}
        <div className="scroll-cue" aria-hidden="true">
          <div className="scroll-cue__line" />
          <span className="scroll-cue__label">{`Scroll`}</span>
        </div>
      </section>
  ```

  Replace with:
  ```tsx
        {/* Scroll cue */}
        <div className="scroll-cue" aria-hidden="true">
          <div className="scroll-cue__line" />
          <span className="scroll-cue__label">{`Scroll`}</span>
        </div>
        {/* Floating mobile CTA — sentinel placed here so CTA appears once hero exits viewport */}
        <FloatingCta href="/contact-us" label="Let's Talk" />
      </section>
  ```

  Note: Hebrew chrome text is intentionally left in English per the CLAUDE.md backend follow-up note (requires `wp-graphql-wpml` plugin to translate). Do not hardcode Hebrew here.

- [ ] **Step 3: Verify**

  DevTools → 375px (Touch mode on). Load `/`. The CTA should be hidden initially (hero is in view). Scroll down — the yellow "Let's Talk" bar slides up from the bottom. Scroll back to the top — it slides away.

  DevTools → 1280px. The CTA should be invisible (`.md:hidden`).

- [ ] **Step 4: Build + commit**

  ```bash
  npm run build
  git add components/FloatingCta.tsx app/[locale]/page.tsx
  git commit -m "feat(hero): floating mobile CTA with spring animation"
  ```

---

## Task 8: Final smoke test

- [ ] **Step 1: Full mobile smoke test**

  Run `npm run dev`. Test at 375px, 768px, 1024px, 1440px:

  | Check | 375px | 768px | 1024px |
  |-------|-------|-------|--------|
  | No horizontal scroll | ✓ | ✓ | ✓ |
  | Header fits, burger opens drawer | ✓ | ✓ | — |
  | Portfolio cards uniform height | ✓ | ✓ | ✓ |
  | Logo marquee not overflowing | ✓ | ✓ | ✓ |
  | Steps dots visible + tracking | ✓ | ✓ | hidden |
  | Floating CTA visible | ✓ | ✓ | hidden |

- [ ] **Step 2: RTL smoke test**

  Navigate to `http://localhost:3000/he`. Verify: header drawer slides from left (RTL), no layout breakage.

- [ ] **Step 3: Production build**

  ```bash
  npm run build
  ```
  Expected: build succeeds with no errors.

- [ ] **Step 4: Final commit**

  ```bash
  git add -A
  git commit -m "chore: Phase 0 + Phase 1 responsive overhaul complete"
  ```

---

## Out of Scope (Future Phases)

- Services / Technology pages (Phase 2)
- Blog / Case Studies (Phase 3)
- Contact / Careers / Legal (Phase 4)
- Header WhatsApp marquee tick on mobile
- Footer accordion collapse on mobile (Footer.tsx already has `grid-cols-2` on mobile — verify but likely functional)
