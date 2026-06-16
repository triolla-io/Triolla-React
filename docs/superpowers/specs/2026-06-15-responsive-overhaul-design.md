# Responsive Overhaul — Design Spec

**Date:** 2026-06-15  
**Branch:** HE  
**Approach:** A — Global foundation fix first, then page-by-page in business priority order  
**Scope:** Full site responsiveness + creative mobile polish  
**Locale note:** All changes must respect RTL (`dir="rtl"` on `<html>` for `/he/`) — no hardcoded directional CSS without logical-property fallback.

---

## Root Cause

Despite Tailwind breakpoints being present throughout the codebase, the site appears non-responsive on mobile. The likely culprit: no `overflow-x` guard on `html`/`body`, combined with at least one element that escapes its container (marquee track, fixed-width dropdown panel, or a card with hardcoded pixel width). One overflowing element forces the browser to widen the viewport, making all responsive rules ineffective.

---

## Phase 0 — Global Foundation (applies site-wide)

**Goal:** Stop the overflow bleed so every existing breakpoint starts working. No visual redesign yet — just plumbing.

### 0.1 globals.css — overflow guard
```css
html, body { overflow-x: hidden; }
```

### 0.2 Marquee fade mask — fluid width
- Current: `.marquee__fade { width: 220px }` (fixed)
- Fix: `width: clamp(40px, 8vw, 220px)` so fades don't push content out on small screens

### 0.3 HeaderClient — dropdown panel width
- Current: `PROMO_PANEL_WIDTH = 900px` hardcoded constant
- Fix: On `< lg` screens the dropdown becomes full-width (`100vw`) with `max-width: 900px` on `>= lg`

### 0.4 Canonical breakpoints audit
Enforce these breakpoints uniformly (currently some components use ad-hoc `@media (max-width: 768px)`):
- `sm` 640px — small/tall phones
- `md` 768px — primary mobile → tablet switch
- `lg` 1024px — tablet → desktop
- `xl` 1280px — wide desktop

Any inline `<style>` `@media` blocks should align to these values.

### 0.5 Touch-device parallax guard
`GridImageSection.tsx` already reduces parallax intensity on `< 768px`, but the 3D tilt effect still fires on touch. Add `@media (hover: none) { /* disable tilt, reduce parallax */ }` so it's pointer-type aware, not just viewport-width aware.

---

## Phase 1 — Home Page

Business priority: highest traffic, most complex layout.

### 1.1 Header / Navigation

**Problems:**
- Burger menu transition/breakpoint unclear — may overlap logo on mid-width devices
- `PROMO_PANEL_WIDTH = 900px` can overflow tablets
- No dedicated mobile nav pattern — desktop dropdown reused

**Design — mobile nav (< lg):**
- Full-screen slide-in drawer from the right (LTR) / left (RTL)
- Backdrop blur overlay (`backdrop-blur-sm bg-black/60`)
- Framer Motion `x` animate: `0 → -100%` (LTR), `0 → 100%` (RTL) using `dir` from context
- Close on backdrop tap or `Escape`
- Nav items stacked, large touch targets (min 48px height)
- Language toggle at bottom of drawer
- No sub-menus on mobile — flatten to single level or expand inline with chevron

**Creative touch:** Spring animation (`type: "spring", stiffness: 300, damping: 30`) for drawer open/close.

### 1.2 Hero Section

**Problems:**
- Layout stacking order on mobile needs verification
- Glow orb sizes may overflow on narrow screens (`max-md:w-[560px]`)
- CTA button touch target may be too small

**Design:**
- Typography: existing `clamp(2.2rem, 10vw, 110px)` is correct — keep
- Orbs: cap orb width at `min(560px, 90vw)` on mobile to prevent overflow
- CTA: minimum `48px` tap height, `w-full` on `< sm` for easy tap
- Vertical padding: `pt-20 md:pt-32` (reduce top padding on mobile since header is sticky)

**Creative touch:** Hero CTA — add a subtle `sticky bottom-6` floating CTA button that appears on mobile after scrolling past the hero (uses IntersectionObserver, disappears when original CTA is visible).

### 1.3 PortfolioGrid

**Current:** `grid-cols-1 md:grid-cols-3` — column count is correct.

**Problems:**
- Image cards: no `aspect-ratio` enforcement — images may reflow
- No touch-friendly reveal (hover overlay invisible on touch)

**Design:**
- Add `aspect-ratio: 4/3` to all grid items (consistent card height)
- Replace hover overlay with tap-to-reveal: on touch devices show overlay on first tap, navigate on second tap (uses `useState` in PortfolioGrid client component)
- On mobile: `gap-3` (tighter) vs `gap-4 md:gap-6` (desktop)

**Creative touch:** Tap-to-reveal shows project name + category with a yellow accent underline, micro-scale animation (`scale(0.97)` on press).

### 1.4 ClientsSection (logo marquee)

**Current:** `176×112px` → `136×88px` via `@media` — works but uses fixed px.

**Design:**
- Migrate to `clamp(110px, 20vw, 176px)` width, `clamp(70px, 13vw, 112px)` height
- Remove the manual `@media` override — clamp handles it
- Marquee speed: `--mq-dur: 40s` on desktop, `--mq-dur: 28s` on mobile (fewer items visible, faster feel)

### 1.5 WhyUs / Feature Cards

**Current:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` — already correct.

**Fixes only:**
- Card padding: `p-6 md:p-8` (reduce on mobile)
- Icon size: `48px` on mobile, `64px` on desktop
- Spacing between sections: `mb-16 md:mb-32` (already in design language — verify it's applied)

### 1.6 AnimatedSteps (Process section)

**Problems:**
- Horizontal scroll on mobile with weak swipe indicator
- Step cards have fixed widths

**Design:**
- Convert to CSS scroll-snap: `scroll-snap-type: x mandatory` on container, `scroll-snap-align: start` on each card
- Step card width: `min(280px, 80vw)` so 1.2 cards are visible on mobile (peek pattern — indicates there's more)
- Pagination dots below: `flex gap-1.5`, active dot is `bg-yellow-400 w-4`, inactive is `bg-white/30 w-1.5`, animated with Framer `layoutId`
- Scroll event updates active dot index

**Creative touch:** Dots use `layoutId="step-dot-active"` so the yellow indicator slides between positions.

### 1.7 Footer

**Current:** `grid-cols-2 md:grid-cols-3 lg:grid-cols-7` — base is correct.

**Fixes:**
- Mobile: `grid-cols-1` with accordion-style section collapse for the link columns (toggle open/close with chevron) — reduces footer height on mobile from ~600px to ~200px collapsed
- Social icons: already `hidden md:flex` / `md:hidden` pattern — verify it works
- Bottom bar: already flex → column on mobile — verify copy doesn't overflow

---

## Phase 2 — Services / Technology Pages

*(Planned for next sprint — not in this implementation plan)*

Covers: service cards modal, tech stack groups, sticky feature reveal.

## Phase 3 — Blog / Case Studies

*(Planned for next sprint)*

Covers: blog grid, blog article reading experience, portfolio case study template.

## Phase 4 — Contact / Careers / Legal

*(Low complexity — planned last)*

---

## Creative Mobile Touches (Summary)

| Touch | Component | Technique |
|-------|-----------|-----------|
| Spring drawer nav | HeaderClient | Framer `type:"spring"` |
| Floating CTA | Hero | IntersectionObserver + `sticky bottom` |
| Tap-to-reveal portfolio | PortfolioGrid | `useState` touch toggle |
| Snap-scroll process | AnimatedSteps | CSS `scroll-snap` + Framer `layoutId` dots |
| Clamp-fluid logos | ClientsSection | CSS `clamp()` |

---

## RTL Considerations

- Drawer slides from left on `/he/` (reads `dir` from HTML element)
- `scroll-snap` horizontal direction already works with `dir="rtl"` in modern browsers
- Logical properties: use `ps/pe` (padding-inline-start/end) instead of `pl/pr` where direction matters
- Floating CTA: `bottom-6 start-4 end-4` (logical) not `left-4 right-4`

---

## Out of Scope

- New page templates or new WordPress content
- Dark/light mode toggle (already handled by `prefers-color-scheme`)
- Any content text changes
- Performance / bundle size optimization (separate concern)
- Hebrew chrome text (blocked on `wp-graphql-wpml` plugin — noted in CLAUDE.md)
