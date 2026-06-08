# Styling System Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ~3,200 lines of duplicated per-file inline `<style>` CSS with a 3-layer Tailwind v4 system — design tokens + canonical keyframes in `app/globals.css`, a shared `components/ui/` primitive library, and pages that compose them — with **zero visual regression** enforced by Playwright screenshot diffs.

**Architecture:** Layer 1 (`app/globals.css`) holds `@theme` tokens, deduped `@keyframes`, and the shared CSS classes the primitives consume. Layer 2 (`components/ui/*`) is presentational React components (all Server-Component-safe, no `"use client"`) that render canonical markup, set per-instance CSS custom properties inline, and reach into Layer 1 classes. Layer 3 (pages/feature components) composes Layer 2 + plain Tailwind utilities; `<style>` tags shrink to genuinely-unique leftovers. Dynamic accent color flows through a single `--accent` CSS variable set on a root element, replacing today's JS-template-string CSS.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 (`@tailwindcss/postcss`, configured via `@theme` — no `tailwind.config.js`), `motion` v12 for animation primitives, Apollo Client v4 + WPGraphQL for data (unchanged), Playwright for visual-regression gating.

---

## Critical Constraints (read before any task)

1. **Zero visual regression is the hard requirement.** Every conversion is gated by `npm run test:visual`. A non-empty meaningful diff means the conversion is wrong — fix it, do not update the baseline to hide it. Baselines are only (re)generated in Phase 0 and only against unconverted code.

2. **Screenshots freeze animations at frame 0.** The harness uses Playwright's `animations: 'disabled'`, which pauses every CSS animation/transition at its first frame. Therefore:
   - The **static frame-0 appearance** (position, size, color, blur, gradient stops, radius, shadow) MUST match exactly.
   - **Animation *timing* differences are invisible to the gate.** Deduping ~30 near-identical keyframes (`svcShimmer`/`aboutShimmer`/`techShimmer` → one `textShimmer`; `svcGrain`/`aboutGrain`/`techGrain` → one `grain`) is an explicit spec goal and is safe — the frozen frame is identical.

3. **All content comes from WordPress.** This refactor touches only styling/markup structure. Never change data fetching, copy, `stripHtml`/`parse` usage, Apollo queries, or conditional-render logic (`data ? … : null`). If a field is absent the section still hides — preserve every existing guard.

4. **Primitives are Server Components.** Do NOT add `"use client"` to anything in `components/ui/`. All hover/scroll effects in scope are pure CSS. Components that are already client (`PortfolioGrid`, `HeaderClient`, etc.) stay client and may import primitives.

5. **Commit after every screenshot-gated step.** Small, reviewable units.

---

## File Structure

**Created:**
- `lib/motion.ts` — named easing curves (`EASE.smooth`, `EASE.bounce`, …) shared by `motion` components.
- `components/ui/GlowOrb.tsx` — radial-gradient blur orb.
- `components/ui/Eyebrow.tsx` — gold/accent uppercase label (dot / line / mark / pill variants).
- `components/ui/GradientText.tsx` — gradient-clip shimmer heading text.
- `components/ui/Button.tsx` — primary / ghost / outline CTA, renders `<Link>` or `<button>`.
- `components/ui/SectionHeading.tsx` — composes Eyebrow + title + subtitle block.
- `components/ui/Marquee.tsx` — infinite horizontal scroll strip.
- `components/ui/ShineImageCard.tsx` — hover-zoom image card with shine sweep + optional tag/badge.
- `components/ui/GrainOverlay.tsx` — fixed SVG fractal-noise grain overlay.
- `components/ui/WaveDivider.tsx` — SVG wave section transition.
- `components/ui/index.ts` — barrel re-export.
- `playwright.config.ts` — visual-regression config.
- `tests/visual/routes.spec.ts` — full-page screenshots per route × 2 viewports.

**Modified:**
- `app/globals.css` — add `@theme` tokens, canonical `@keyframes`, shared component classes.
- `package.json` — add Playwright dev dep + `test:visual` script.
- `app/page.tsx` (Phase 1) then every file in the Phase 2 list.

**Each `components/ui/*` file has one responsibility.** Pages import via the barrel: `import { GlowOrb, Eyebrow, SectionHeading } from "@/components/ui";`.

---

## Phase 0 — Foundation (no visual change)

### Task 0.1: Stand up the Playwright visual-regression harness

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/visual/routes.spec.ts`
- Create: `.gitignore` entry for Playwright artifacts

- [ ] **Step 1: Install Playwright as a dev dependency**

Run:
```bash
npm install -D @playwright/test && npx playwright install chromium
```
Expected: `@playwright/test` appears under `devDependencies`; Chromium downloads.

- [ ] **Step 2: Add the `test:visual` scripts to `package.json`**

In the `"scripts"` block add:
```json
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots"
```

- [ ] **Step 3: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    // Freeze animations at frame 0 so live timing differences never flake the diff.
    // The static rendered frame is what we gate on.
  },
  expect: {
    // Allow sub-pixel AA noise but catch real layout/color shifts.
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
      scale: "css",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Create `tests/visual/routes.spec.ts`**

> NOTE: the dynamic `[slug]` portfolio route needs one real published slug. Replace `PORTFOLIO_SLUG` with a real slug from WP (find one: `curl -s https://triolla.io/graphql -H 'content-type: application/json' -d '{"query":"{portfolios(first:1){nodes{slug}}}"}'` — adjust the query to the actual post type if it differs). If no slug is available, leave it out of `ROUTES` and document the gap.

```ts
import { test, expect } from "@playwright/test";

const PORTFOLIO_SLUG = "REPLACE_WITH_REAL_SLUG";

const ROUTES = [
  "/",
  "/services",
  "/about-us",
  "/technology",
  "/contact-us",
  "/privacy-policy",
  "/terms-of-use",
  `/${PORTFOLIO_SLUG}`,
];

for (const route of ROUTES) {
  test(`full-page screenshot ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    // Settle lazy/in-view content and webfont swap before snapshotting.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const name = route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "");
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
```

- [ ] **Step 5: Ignore Playwright artifacts (but commit baselines)**

Append to `.gitignore`:
```
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
```
Do NOT ignore `tests/visual/**/*-snapshots/` — baselines are committed and are the source of truth.

- [ ] **Step 6: Capture baselines against the CURRENT (unconverted) code**

Run:
```bash
npm run test:visual:update
```
Expected: baseline PNGs written under `tests/visual/routes.spec.ts-snapshots/` for every route × 2 projects. Confirm the directory is populated.

- [ ] **Step 7: Verify the gate is green against unchanged code**

Run:
```bash
npm run test:visual
```
Expected: all tests PASS (zero diff — we are comparing current code to baselines just captured). If any test flakes, increase the settle `waitForTimeout` or add the offending dynamic element to a mask; do not loosen `maxDiffPixelRatio` beyond 0.01.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json playwright.config.ts tests/ .gitignore
git commit -m "test: add Playwright visual-regression harness with route baselines"
```

---

### Task 0.2: Create `lib/motion.ts` shared easing curves

**Files:**
- Create: `lib/motion.ts`

- [ ] **Step 1: Write `lib/motion.ts`**

Curves extracted from existing usage (occurrence counts in comments).
```ts
// Shared easing curves, deduped from per-component cubic-bezier literals.
// Use with `motion` transitions: transition={{ ease: EASE.smooth }}.
// CSS equivalents live in app/globals.css as --ease-* @theme tokens.
export const EASE = {
  smooth: [0.23, 1, 0.32, 1] as const,    // ~42 uses — default transform/scale/lift
  bounce: [0.16, 1, 0.3, 1] as const,     // ~11 uses — modal/header reveals
  standard: [0.4, 0, 0.2, 1] as const,    // ~10 uses — geometric/rotation
  symmetric: [0.2, 1, 0.3, 1] as const,   // ~4 uses  — tech stack reveals
} as const;

export type EaseName = keyof typeof EASE;
```

- [ ] **Step 2: Typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/motion.ts
git commit -m "feat(ui): add shared EASE curves in lib/motion.ts"
```

---

### Task 0.3: Extend `app/globals.css` with tokens + canonical keyframes

This is additive only. No existing rule changes; nothing yet consumes these. The screenshot gate must stay green (no selector here matches existing markup).

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add `@theme` tokens and a default `--accent`**

After the existing `@theme { … }` block's closing brace is fine, but keep it in one `@theme`. Replace the current `@theme` block with:
```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: #facc15;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --ease-smooth: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-bounce: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-symmetric: cubic-bezier(0.2, 1, 0.3, 1);
}
```
And add a default accent on `:root` (so accent-agnostic primitives work everywhere without an explicit override). In the existing `:root { … }` block add the line:
```css
  --accent: #facc15;
```

- [ ] **Step 2: Append the canonical keyframes block at the end of the file**

These are the deduped union of the ~30 per-file keyframes. Bodies are taken verbatim from the most representative current usage; frozen frame 0 matches every page.
```css
/* ───────────────────────── Canonical keyframes ───────────────────────── */

@keyframes grain {
  0%   { transform: translate(0,0); }
  10%  { transform: translate(-5%,-10%); }
  20%  { transform: translate(-15%, 5%); }
  30%  { transform: translate( 7%,-25%); }
  40%  { transform: translate(-5%, 25%); }
  50%  { transform: translate(-15%, 10%); }
  60%  { transform: translate(15%, 0%); }
  70%  { transform: translate( 0%, 15%); }
  80%  { transform: translate( 3%,  35%); }
  90%  { transform: translate(-10%, 10%); }
  100% { transform: translate(0, 0); }
}

@keyframes orbPulse {
  0%,100% { opacity: 1;   transform: scale(1); }
  50%     { opacity: 0.7; transform: scale(1.08); }
}

@keyframes orbDrift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(40px, 30px) scale(1.08); }
}

@keyframes textShimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

@keyframes dotBlink {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.3; }
}

@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes marqueeRev {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

@keyframes scrollPulse {
  0%,100% { opacity: 0.4; transform: scaleY(1); }
  50%     { opacity: 1;   transform: scaleY(1.1); }
}

@keyframes shineSweep {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
```

- [ ] **Step 3: Verify the gate is still green (additive change)**

Run:
```bash
npm run test:visual
```
Expected: PASS on all routes (no markup consumes the new tokens/keyframes yet).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat(ui): add design tokens and canonical keyframes to globals.css"
```

---

### Task 0.4: `GrainOverlay` primitive

Extracted from the identical `.grain-overlay` / `.svc-grain` / `.about-grain` / `.tech-grain` (all byte-identical except keyframe name).

**Files:**
- Create: `components/ui/GrainOverlay.tsx`
- Modify: `app/globals.css` (add `.grain` class)
- Create: `components/ui/index.ts`

- [ ] **Step 1: Add the `.grain` class to `app/globals.css`** (append after keyframes)

```css
/* ───────────────────────── Shared component classes ───────────────────── */

.grain {
  position: fixed;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  opacity: var(--grain-opacity, 0.04);
  pointer-events: none;
  z-index: 9999;
  animation: grain 8s steps(10) infinite;
}
```

- [ ] **Step 2: Write `components/ui/GrainOverlay.tsx`**

```tsx
interface GrainOverlayProps {
  /** Overlay opacity. Defaults to the canonical 0.04. */
  opacity?: number;
}

export function GrainOverlay({ opacity }: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className="grain"
      style={opacity !== undefined ? ({ "--grain-opacity": String(opacity) } as React.CSSProperties) : undefined}
    />
  );
}
```

- [ ] **Step 3: Create the barrel `components/ui/index.ts`**

```ts
export { GrainOverlay } from "./GrainOverlay";
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/GrainOverlay.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add GrainOverlay primitive and .grain class"
```

---

### Task 0.5: `GlowOrb` primitive

Replaces every radial-gradient blur orb (`hero-orb*`, `winners-orb*`, `svc-hero__orb*`, `about-*__orb*`, `tech-hero-orb*`, `tss-orb*`, `tsf-cream-orb`, `wc-orb*`, `fq-orb*`, `why-section__orb`, `cs-clients__orb*`, `tech-steps__orb*`). All differ only in static visual + position + animation timing — all of which the props below express.

**Files:**
- Create: `components/ui/GlowOrb.tsx`
- Modify: `app/globals.css` (add `.glow-orb` classes)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.glow-orb` classes to `app/globals.css`**

```css
.glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  width: var(--orb-w);
  height: var(--orb-h, var(--orb-w));
  background: radial-gradient(var(--orb-shape, circle) at center, var(--orb-color) 0%, transparent var(--orb-fade, 65%));
  filter: blur(var(--orb-blur, 0px));
}
.glow-orb--pulse      { animation: orbPulse var(--orb-dur, 9s) ease-in-out infinite; }
.glow-orb--pulse-rev  { animation: orbPulse var(--orb-dur, 9s) ease-in-out infinite reverse; }
.glow-orb--drift      { animation: orbDrift var(--orb-dur, 14s) ease-in-out infinite alternate; }
.glow-orb--drift-rev  { animation: orbDrift var(--orb-dur, 14s) ease-in-out infinite alternate-reverse; }
```

- [ ] **Step 2: Write `components/ui/GlowOrb.tsx`**

```tsx
type OrbAnimation = "none" | "pulse" | "pulse-rev" | "drift" | "drift-rev";

interface GlowOrbProps {
  /** CSS width, e.g. 900 (px) or "60vw". */
  size: number | string;
  /** CSS height; defaults to `size` (circle). Pass a different value for an ellipse. */
  height?: number | string;
  /** Full gradient inner color incl. alpha, e.g. "rgba(250,204,21,0.14)"
   *  or accent-driven "color-mix(in srgb, var(--accent) 14%, transparent)". */
  color: string;
  shape?: "circle" | "ellipse";
  /** Transparent stop, e.g. "65%" or "70%". */
  fade?: string;
  /** blur() radius in px. Many orbs use 0; some use 60–110. */
  blur?: number;
  animation?: OrbAnimation;
  /** Animation duration in seconds. */
  duration?: number;
  /** Tailwind positioning utilities, e.g. "bottom-[-10%] left-1/2 -translate-x-1/2". */
  className?: string;
}

const ANIM_CLASS: Record<OrbAnimation, string> = {
  none: "",
  pulse: "glow-orb--pulse",
  "pulse-rev": "glow-orb--pulse-rev",
  drift: "glow-orb--drift",
  "drift-rev": "glow-orb--drift-rev",
};

const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export function GlowOrb({
  size,
  height,
  color,
  shape = "circle",
  fade = "65%",
  blur = 0,
  animation = "none",
  duration,
  className = "",
}: GlowOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={`glow-orb ${ANIM_CLASS[animation]} ${className}`}
      style={
        {
          "--orb-w": px(size),
          "--orb-h": px(height ?? size),
          "--orb-color": color,
          "--orb-shape": shape,
          "--orb-fade": fade,
          "--orb-blur": `${blur}px`,
          ...(duration !== undefined ? { "--orb-dur": `${duration}s` } : {}),
        } as React.CSSProperties
      }
    />
  );
}
```

- [ ] **Step 3: Add to barrel**

In `components/ui/index.ts` add:
```ts
export { GlowOrb } from "./GlowOrb";
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/GlowOrb.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add GlowOrb primitive and .glow-orb classes"
```

---

### Task 0.6: `Eyebrow` primitive

Covers all eyebrow variants: dots (home/svc/about), lines+text (svc/about/cs), lines+mark ✦ (tss/tech-steps), pill (tech hero). Variant axes from extraction: ornament (dot|line|mark|none), alignment, color (gold/accent/dark/muted), pill wrapper.

**Files:**
- Create: `components/ui/Eyebrow.tsx`
- Modify: `app/globals.css` (add `.eyebrow*` classes)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.eyebrow` classes to `app/globals.css`**

```css
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--eb-gap, 12px);
  font-size: var(--eb-size, 11px);
  font-weight: var(--eb-weight, 700);
  letter-spacing: var(--eb-spacing, 0.25em);
  text-transform: uppercase;
  color: var(--eb-color, var(--accent));
  margin-bottom: var(--eb-mb, 24px);
}
.eyebrow--center { display: flex; justify-content: center; }
.eyebrow--pill {
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--eb-pill-bg, color-mix(in srgb, var(--accent) 9%, transparent));
}
.eyebrow__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor;
  animation: dotBlink 2.2s ease-in-out infinite;
  flex-shrink: 0;
}
.eyebrow__line {
  display: block;
  width: var(--eb-line-w, 32px);
  height: 1px;
  background: var(--eb-line-bg, currentColor);
  opacity: var(--eb-line-opacity, 0.55);
}
.eyebrow__mark { color: currentColor; font-size: 13px; line-height: 1; }
```

- [ ] **Step 2: Write `components/ui/Eyebrow.tsx`**

```tsx
import { ReactNode } from "react";

type Ornament = "none" | "dot" | "line" | "mark";

interface EyebrowProps {
  children: ReactNode;
  /** Symmetric ornaments on both sides of the label. */
  ornament?: Ornament;
  align?: "start" | "center";
  pill?: boolean;
  /** Override label color (defaults to var(--accent)). e.g. "rgba(0,0,0,0.45)". */
  color?: string;
  /** Per-instance CSS-var overrides (size, spacing, gap, line width, etc.). */
  style?: React.CSSProperties;
  className?: string;
}

function Ornaments({ kind }: { kind: Ornament }) {
  if (kind === "dot") return <span className="eyebrow__dot" aria-hidden="true" />;
  if (kind === "line") return <span className="eyebrow__line" aria-hidden="true" />;
  if (kind === "mark") return <span className="eyebrow__mark" aria-hidden="true">✦</span>;
  return null;
}

export function Eyebrow({
  children,
  ornament = "none",
  align = "start",
  pill = false,
  color,
  style,
  className = "",
}: EyebrowProps) {
  const cls = [
    "eyebrow",
    align === "center" ? "eyebrow--center" : "",
    pill ? "eyebrow--pill" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={cls}
      style={{ ...(color ? ({ "--eb-color": color } as React.CSSProperties) : {}), ...style }}
    >
      <Ornaments kind={ornament} />
      {children}
      <Ornaments kind={ornament} />
    </div>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { Eyebrow } from "./Eyebrow";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Eyebrow.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add Eyebrow primitive and .eyebrow classes"
```

---

### Task 0.7: `GradientText` primitive

Replaces the gradient-clip headings (`hero-headline`, `svc-hero__title`, `about-hero__title`, `tech-shimmer-heading`, `tss-title__line--accent`, `wc-heading__gold`, static `fq-count`).

**Files:**
- Create: `components/ui/GradientText.tsx`
- Modify: `app/globals.css` (add `.gradient-text` class)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.gradient-text` class to `app/globals.css`**

```css
.gradient-text {
  background: var(--gt-gradient, linear-gradient(135deg, #fff 40%, var(--accent) 55%, #fff 70%));
  background-size: var(--gt-size, 200% auto);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.gradient-text--animate {
  animation: textShimmer var(--gt-dur, 6s) linear infinite;
}
```

- [ ] **Step 2: Write `components/ui/GradientText.tsx`**

```tsx
import { ElementType, ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  /** Tag to render. Default span. */
  as?: ElementType;
  animate?: boolean;
  /** Full CSS gradient. Defaults to the white→accent→white diagonal. */
  gradient?: string;
  /** background-size, e.g. "200% auto" or "220% auto". */
  backgroundSize?: string;
  /** Shimmer duration in seconds. */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GradientText({
  children,
  as: Tag = "span",
  animate = false,
  gradient,
  backgroundSize,
  duration,
  className = "",
  style,
}: GradientTextProps) {
  return (
    <Tag
      className={`gradient-text ${animate ? "gradient-text--animate" : ""} ${className}`.trim()}
      style={
        {
          ...(gradient ? { "--gt-gradient": gradient } : {}),
          ...(backgroundSize ? { "--gt-size": backgroundSize } : {}),
          ...(duration !== undefined ? { "--gt-dur": `${duration}s` } : {}),
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { GradientText } from "./GradientText";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/GradientText.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add GradientText primitive and .gradient-text class"
```

---

### Task 0.8: `Button` primitive

Replaces `btn-primary`, `btn-ghost`, `svc-hero__cta`, `about-hero__cta`, `cs-clients__cta`, `btn-outline-gold`, and the simple pill CTAs. (The form-submit `wc-btn` with its shine sweep + done/busy states is page-unique and stays in `WannaChatSection` — documented leftover.)

**Files:**
- Create: `components/ui/Button.tsx`
- Modify: `app/globals.css` (add `.btn*` classes)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.btn` classes to `app/globals.css`** (verbatim values from home `btn-primary`/`btn-ghost` + WhyUs `btn-outline-gold`)

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  font-size: var(--btn-size, 15px);
  padding: var(--btn-pad, 14px 28px);
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}
.btn--primary {
  background: var(--accent);
  color: #000;
  font-weight: 700;
  box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
}
.btn--primary:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(250, 204, 21, 0.3);
}
.btn--ghost {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  padding: var(--btn-pad, 14px 20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn--ghost:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}
.btn--outline {
  border: 1px solid var(--accent);
  color: var(--accent);
  font-weight: 600;
  padding: var(--btn-pad, 14px 32px);
}
.btn--outline:hover {
  background: var(--accent);
  color: #000;
  transform: translateY(-2px);
}
```

- [ ] **Step 2: Write `components/ui/Button.tsx`**

```tsx
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
}

type ButtonAsLink = CommonProps & { href: string };
type ButtonAsButton = CommonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonProps = ButtonAsLink | ButtonAsButton;

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn--primary",
  ghost: "btn--ghost",
  outline: "btn--outline",
};

export function Button(props: ButtonProps) {
  const { children, variant = "primary", className = "", style } = props;
  const cls = `btn ${VARIANT_CLASS[variant]} ${className}`.trim();

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} style={style}>
        {children}
      </Link>
    );
  }
  const { children: _c, variant: _v, className: _cn, style: _s, href: _h, ...rest } = props;
  return (
    <button className={cls} style={style} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { Button } from "./Button";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add Button primitive and .btn classes"
```

---

### Task 0.9: `SectionHeading` primitive

Composes `Eyebrow` + title (`GradientText` or plain) + subtitle. Replaces `svc-section-head`, `about-section-head`, `tss-head`, `cs-clients__head`, `tech-steps__head`.

**Files:**
- Create: `components/ui/SectionHeading.tsx`
- Modify: `app/globals.css` (add `.section-head*` classes)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.section-head` classes to `app/globals.css`** (values from `svc-section-*`)

```css
.section-head { text-align: center; margin-bottom: var(--sh-mb, 72px); max-width: var(--sh-max, none); margin-left: auto; margin-right: auto; }
.section-head__title {
  font-size: var(--sh-title-size, clamp(2.2rem, 5.5vw, 4.8rem));
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 18px;
  color: var(--sh-title-color, #fff);
}
.section-head__sub {
  font-size: var(--sh-sub-size, 1.05rem);
  color: var(--sh-sub-color, #6b7280);
  max-width: var(--sh-sub-max, 600px);
  margin: 0 auto;
  line-height: 1.74;
}
```

- [ ] **Step 2: Write `components/ui/SectionHeading.tsx`**

```tsx
import { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface SectionHeadingProps {
  /** Eyebrow label content (string or nodes). Omit to skip the eyebrow. */
  eyebrow?: ReactNode;
  eyebrowOrnament?: "none" | "dot" | "line" | "mark";
  eyebrowColor?: string;
  /** Title — accepts already-parsed nodes (e.g. parse(decodeHtml(...))). */
  title?: ReactNode;
  /** Subtitle/lead — accepts parsed nodes. */
  subtitle?: ReactNode;
  /** Dark text variant for light/cream backgrounds. */
  dark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SectionHeading({
  eyebrow,
  eyebrowOrnament = "line",
  eyebrowColor,
  title,
  subtitle,
  dark = false,
  className = "",
  style,
}: SectionHeadingProps) {
  const darkVars = dark
    ? ({ "--sh-title-color": "#0a0a0a", "--sh-sub-color": "#4b5563" } as React.CSSProperties)
    : {};
  return (
    <div className={`section-head ${className}`.trim()} style={{ ...darkVars, ...style }}>
      {eyebrow != null && (
        <Eyebrow
          ornament={eyebrowOrnament}
          align="center"
          color={eyebrowColor ?? (dark ? "rgba(0,0,0,0.45)" : undefined)}
        >
          {eyebrow}
        </Eyebrow>
      )}
      {title != null && <h2 className="section-head__title">{title}</h2>}
      {subtitle != null && <div className="section-head__sub">{subtitle}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { SectionHeading } from "./SectionHeading";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/SectionHeading.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add SectionHeading primitive and .section-head classes"
```

---

### Task 0.10: `Marquee` primitive

Replaces `cs-mq*`, `cs-marquee-track`, `tech-marquee-track`, `svc-hero__strip-track`, `about-hero__strip-track`, `about-showcase__ticker-track`. Variant axes: speed, direction, pause-on-hover, fade masks, item duplication.

**Files:**
- Create: `components/ui/Marquee.tsx`
- Modify: `app/globals.css` (add `.marquee*` classes)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.marquee` classes to `app/globals.css`**

```css
.marquee { position: relative; overflow: hidden; }
.marquee__track {
  display: flex;
  width: max-content;
  align-items: center;
  animation: marquee var(--mq-dur, 40s) linear infinite;
  will-change: transform;
}
.marquee__track--rev { animation-name: marqueeRev; }
.marquee--pause:hover .marquee__track { animation-play-state: paused; }
.marquee__fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--mq-fade-w, 220px);
  z-index: 2;
  pointer-events: none;
}
.marquee__fade--l { left: 0;  background: linear-gradient(to right, var(--mq-fade-color, #080808) 0%, transparent 100%); }
.marquee__fade--r { right: 0; background: linear-gradient(to left,  var(--mq-fade-color, #080808) 0%, transparent 100%); }
```

- [ ] **Step 2: Write `components/ui/Marquee.tsx`**

```tsx
import { ReactNode } from "react";

interface MarqueeProps<T> {
  items: T[];
  /** How many times to repeat `items` for a seamless loop (2 minimum). */
  repeat?: number;
  /** Animation duration in seconds. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  /** Edge fade masks (gradient to a solid bg color). */
  fade?: boolean;
  /** Solid color the fade masks blend to. Default "#080808". */
  fadeColor?: string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

export function Marquee<T>({
  items,
  repeat = 2,
  speed = 40,
  direction = "left",
  pauseOnHover = false,
  fade = false,
  fadeColor,
  renderItem,
  className = "",
}: MarqueeProps<T>) {
  const duped = Array.from({ length: repeat }).flatMap(() => items);
  return (
    <div
      className={`marquee ${pauseOnHover ? "marquee--pause" : ""} ${className}`.trim()}
      style={
        {
          ...(fadeColor ? { "--mq-fade-color": fadeColor } : {}),
        } as React.CSSProperties
      }
    >
      {fade && <div className="marquee__fade marquee__fade--l" aria-hidden="true" />}
      {fade && <div className="marquee__fade marquee__fade--r" aria-hidden="true" />}
      <div
        className={`marquee__track ${direction === "right" ? "marquee__track--rev" : ""}`.trim()}
        style={{ "--mq-dur": `${speed}s` } as React.CSSProperties}
      >
        {duped.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { Marquee } from "./Marquee";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Marquee.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add Marquee primitive and .marquee classes"
```

---

### Task 0.11: `ShineImageCard` primitive

Replaces `portfolio-card*`, `svc-img-card*`, `about-showcase__card*`, `aic-slide*`. Variant axes: radius, shine angle, hover-zoom scale, hover-lift, optional tag/badge/overlay.

**Files:**
- Create: `components/ui/ShineImageCard.tsx`
- Modify: `app/globals.css` (add `.shine-card*` classes)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.shine-card` classes to `app/globals.css`** (base values from home `portfolio-card`)

```css
.shine-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: var(--sc-radius, 20px);
  background: var(--sc-bg, #0f0f0f);
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.5s var(--ease-smooth), box-shadow 0.5s;
}
.shine-card:hover {
  transform: translateY(var(--sc-lift, -5px)) scale(var(--sc-scale, 1.01));
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(250, 204, 21, 0.18);
}
.shine-card__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s var(--ease-smooth);
}
.shine-card:hover .shine-card__img { transform: scale(var(--sc-img-scale, 1.07)); }
.shine-card__shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(var(--sc-shine-angle, 105deg), transparent 40%, rgba(255, 255, 255, 0.045) 50%, transparent 60%);
  background-size: 200% 100%;
  background-position: 200% 0;
  transition: background-position 0.55s;
}
.shine-card:hover .shine-card__shine { background-position: -200% 0; }
.shine-card__tag {
  background: var(--accent);
  color: #000;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  letter-spacing: 0.05em;
}
.shine-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 24px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.1) 45%, transparent 65%);
  opacity: 0;
  transition: opacity 0.35s;
}
.shine-card:hover .shine-card__overlay { opacity: 1; }
```

- [ ] **Step 2: Write `components/ui/ShineImageCard.tsx`**

```tsx
import { ReactNode } from "react";

interface ShineImageCardProps {
  src: string;
  alt: string;
  /** Border radius in px. Default 20. */
  radius?: number;
  /** Diagonal shine angle, e.g. "105deg" | "128deg" | "135deg". */
  shineAngle?: string;
  /** Image zoom scale on hover. Default 1.07. */
  imgScale?: number;
  /** Content shown in the bottom gradient overlay (revealed on hover). */
  overlay?: ReactNode;
  /** Static tag/badge content (always visible). */
  badge?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ShineImageCard({
  src,
  alt,
  radius,
  shineAngle,
  imgScale,
  overlay,
  badge,
  className = "",
  style,
}: ShineImageCardProps) {
  return (
    <div
      className={`shine-card ${className}`.trim()}
      style={
        {
          ...(radius !== undefined ? { "--sc-radius": `${radius}px` } : {}),
          ...(shineAngle ? { "--sc-shine-angle": shineAngle } : {}),
          ...(imgScale !== undefined ? { "--sc-img-scale": String(imgScale) } : {}),
          ...style,
        } as React.CSSProperties
      }
    >
      <img src={src} alt={alt} className="shine-card__img" />
      <div className="shine-card__shine" aria-hidden="true" />
      {overlay != null && <div className="shine-card__overlay">{overlay}</div>}
      {badge != null && badge}
    </div>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { ShineImageCard } from "./ShineImageCard";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/ShineImageCard.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add ShineImageCard primitive and .shine-card classes"
```

---

### Task 0.12: `WaveDivider` primitive

Replaces `svc-wave-down` / `about-wave-down` (identical path; only `fill` changes to bridge section bg colors).

**Files:**
- Create: `components/ui/WaveDivider.tsx`
- Modify: `app/globals.css` (add `.wave-divider` class)
- Modify: `components/ui/index.ts`

- [ ] **Step 1: Add `.wave-divider` class to `app/globals.css`**

```css
.wave-divider { position: relative; line-height: 0; z-index: 2; margin-top: var(--wave-mt, 64px); }
.wave-divider svg { width: 100%; display: block; }
```

- [ ] **Step 2: Write `components/ui/WaveDivider.tsx`** (path verbatim from extraction)

```tsx
interface WaveDividerProps {
  /** Fill color = the background color of the section BELOW the wave. */
  to: string;
  /** Top margin in px. Default 64. */
  marginTop?: number;
  className?: string;
}

const WAVE_PATH =
  "M0 55 L180 22 L360 68 L540 18 L720 60 L900 20 L1080 58 L1260 24 L1440 52 L1440 90 L0 90 Z";

export function WaveDivider({ to, marginTop, className = "" }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`wave-divider ${className}`.trim()}
      style={marginTop !== undefined ? ({ "--wave-mt": `${marginTop}px` } as React.CSSProperties) : undefined}
    >
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={WAVE_PATH} fill={to} />
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Add to barrel**

```ts
export { WaveDivider } from "./WaveDivider";
```

- [ ] **Step 4: Typecheck** — Run: `npx tsc --noEmit` — Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add components/ui/WaveDivider.tsx components/ui/index.ts app/globals.css
git commit -m "feat(ui): add WaveDivider primitive and .wave-divider class"
```

---

## Phase 1 — Home pilot (`app/page.tsx`)

Convert the home page end-to-end. This battle-tests every primitive and finalizes its props. **If a primitive can't reproduce a Home pattern exactly, fix the primitive in a Phase-0 file (re-run that primitive's typecheck + commit), then continue here** — do not fork a one-off.

The Home page contains: `grain-overlay`, hero orbs (`hero-orb--gold/amber/dim`), `hero-grid` (mask — page-unique leftover), `hero-headline` (gradient text), `eyebrow` (dots), `scroll-cue` (page-unique leftover), portfolio cards (via `PortfolioGrid` — defer to Phase 2.5), `winners-*` section (orbs + sparkles + award cards — largely page-unique), `btn-primary`/`btn-ghost` (none rendered directly on this page — they belong to child components).

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Baseline check (must be green before editing)**

Run:
```bash
npm run test:visual -- -g "home"
```
Expected: PASS (home desktop + mobile match committed baselines).

- [ ] **Step 2: Replace the grain overlay**

Add import: `import { GrainOverlay, GlowOrb, Eyebrow, GradientText } from "@/components/ui";`
Replace line 133 `<div aria-hidden="true" className="grain-overlay" />` with:
```tsx
<GrainOverlay />
```
Delete the `.grain-overlay` rule and its `@keyframes grain` from the `<style>` block (now provided by `.grain` + canonical `grain` keyframe).

- [ ] **Step 3: Replace the hero orbs**

Replace lines 141-143 (`hero-orb--gold/amber/dim`) with the GlowOrb equivalents (exact static values from the extracted CSS):
```tsx
<GlowOrb
  size={900} height={500} shape="ellipse" fade="70%" blur={80}
  color="rgba(250,204,21,0.14)" animation="pulse" duration={8}
  className="bottom-[-10%] left-1/2 -translate-x-1/2 max-md:w-[560px] max-md:h-[320px]"
/>
<GlowOrb
  size={600} fade="65%" blur={80}
  color="rgba(251,146,60,0.06)" animation="pulse-rev" duration={11}
  className="top-[-5%] left-[-10%] max-md:w-[400px] max-md:h-[400px] max-md:top-0 max-md:left-[-20%]"
/>
<GlowOrb
  size={500} fade="65%" blur={80}
  color="rgba(250,204,21,0.05)" animation="pulse" duration={14}
  className="top-[10%] right-[-8%] max-md:w-[320px] max-md:h-[320px]"
/>
```
> The mobile size overrides (lines 715-725 of the old `<style>`) move into the `max-md:` arbitrary utilities above. Delete `.hero-orb`, `.hero-orb--gold/amber/dim`, `@keyframes orbPulse`, and the mobile `@media` orb block from the `<style>`.
Keep `.hero-grid` in the `<style>` (mask-image — legitimate Layer-1-or-leftover; leave as a scoped leftover for now).

- [ ] **Step 4: Replace the hero eyebrow**

Replace lines 149-153 with:
```tsx
<Eyebrow ornament="dot" align="center" style={{ "--eb-spacing": "0.25em", "--eb-mb": "28px" } as React.CSSProperties}>
  Product UX/UI design for
</Eyebrow>
```
Delete `.eyebrow`, `.eyebrow__dot`, `@keyframes dotBlink`, and the unused `.section-eyebrow` rule from the `<style>`. (The old dot used `2s` blink and `gap:12px`; canonical uses `2.2s` + `gap:12px` default — frozen frame identical, gap identical.)

- [ ] **Step 5: Replace the hero headline gradient**

The `HeroHeadline` component receives `headlineClassName`. Today it includes `hero-headline`. Swap that class for the canonical `gradient-text gradient-text--animate` and remove the `hero-headline` rule + `@keyframes textShimmer` from `<style>`. Change the `headlineClassName` (line 158) from:
```
"text-[clamp(2.2rem,10vw,110px)] leading-[0.9] font-bold tracking-tighter mb-6 md:mb-8 max-w-[1200px] hero-headline"
```
to:
```
"text-[clamp(2.2rem,10vw,110px)] leading-[0.9] font-bold tracking-tighter mb-6 md:mb-8 max-w-[1200px] gradient-text gradient-text--animate"
```
> The default `--gt-gradient` is `linear-gradient(135deg, #fff 40%, var(--accent) 55%, #fff 70%)` = the exact home gradient (accent is #facc15). `--gt-dur` defaults to 6s = exact. No inline override needed.

- [ ] **Step 6: Leave page-unique blocks as scoped leftovers**

Keep in the `<style>`: `.hero-grid`, `.scroll-cue*` + `@keyframes scrollPulse` (or move `scrollPulse` reference to the canonical keyframe — it's already in globals; you may delete the local `@keyframes scrollPulse` and keep only the `.scroll-cue*` classes), `.winners-*`, `.award-*`, `@keyframes orbDrift/sparklePop/cardRise/medalFloat`, and the Google Fonts `@import`. These are page-unique per the spec's allowed-leftovers rule. (Winners orbs MAY optionally be swapped to `GlowOrb` with `animation="drift"` — only if the screenshot stays zero-diff; otherwise leave them.)

- [ ] **Step 7: Run the screenshot gate**

Run:
```bash
npm run test:visual -- -g "home"
```
Expected: PASS with zero meaningful diff. If a diff appears, open `playwright-report/` and reconcile (most likely cause: a CSS-var default differs from the original literal — fix the primitive call, not the baseline).

- [ ] **Step 8: Lint + typecheck**

Run:
```bash
npm run lint && npx tsc --noEmit
```
Expected: no new errors.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "refactor(home): convert hero to shared ui primitives, zero visual diff"
```

- [ ] **Step 10: Finalize primitive APIs**

If Steps 2-7 required any primitive prop additions, note them. The primitive APIs are now frozen for Phase 2. Record any change in the commit message of the relevant Phase-0 file.

---

## Phase 2 — Rollout (one file per step, screenshot-gated)

**Repeatable methodology for every task below** (the spec's per-file conversion loop):

1. `git status` clean; run `npm run test:visual -- -g "<route-or-name>"` → must be green (baseline confirmed).
2. Add `import { … } from "@/components/ui";` for the primitives that file needs.
3. For each pattern in the file's inventory (listed per task), replace markup with the primitive and delete the corresponding rules + keyframes from the file's `<style>` block.
4. Shrink the `<style>` to genuinely-unique leftovers (documented per task). Delete the block entirely if nothing unique remains.
5. Run the screenshot gate for that route; reconcile to zero meaningful diff.
6. `npm run lint && npx tsc --noEmit`.
7. Commit as one reviewable unit.

> **Accent migration (applies to Tasks 2.3 onward):** components that today interpolate `accentColor`/`ac` into `<style>` template strings must instead set `style={{ "--accent": accentColor }}` on their root element and let primitives + the canonical classes read `var(--accent)`. For colors that used hex-alpha (`${ac}22`), reproduce the exact alpha with `color-mix(in srgb, var(--accent) N%, transparent)` where `N% = (0xAA / 255) * 100` (e.g. `22`→13.3%, `0c`→4.7%, `66`→40%, `aa`→66.7%). Verify with the screenshot gate.

---

### Task 2.1: Convert `app/services/page.tsx`

**Files:** Modify `app/services/page.tsx`. Route: `/services`.

**Pattern inventory → primitive:**
- `.svc-grain` + `@keyframes svcGrain` → `<GrainOverlay />`.
- `.svc-hero__orb--gold` (900×480, `rgba(250,204,21,0.13)`, ellipse, fade 70%) and `.svc-hero__orb--amber` (640, `rgba(251,146,60,0.055)`, fade 65%, alternate) + their keyframes → two `<GlowOrb>` (use `animation="drift"`/`"pulse"` matching original; static values exact).
- `.svc-eyebrow*` (dot/line/center/gold/dark variants) → `<Eyebrow ornament="dot|line" align="center" color={…}>`. Map `--dark-text` → `color="rgba(0,0,0,0.45)"`; `--gold` → default; line width is 32px = default.
- `.svc-section-head` + `.svc-section-title(--dark)` + `.svc-section-sub(--dark)` → `<SectionHeading dark={…} eyebrow={…} title={…} subtitle={…} />`. (The `svc-section-*` values ARE the `.section-head` defaults — verify max-width 600px.)
- `.svc-hero__title` (gradient shimmer, stops 38/52/68) → `<GradientText as="h1" animate gradient="linear-gradient(135deg,#fff 38%,#facc15 52%,#fff 68%)">` plus the existing size utilities. NOTE: original used `!important` on font-size/weight/line-height/margin; keep those as Tailwind arbitrary utilities on the element (no `!important` needed once the bespoke rule is gone).
- `.svc-hero__cta` (primary, padding 16px 34px, shadow) → `<Button variant="primary" href={…} style={{ "--btn-pad": "16px 34px" }}>`. The hero CTA shadow `0 4px 28px rgba(250,204,21,0.24)` differs from `.btn--primary` default — add it via inline `style` or a `className` arbitrary `shadow-[…]`; verify zero-diff (if it diffs, keep the bespoke shadow via inline style).
- `.svc-hero__strip*` + `@keyframes svcStrip` (44s, 4× dup) → `<Marquee items={svcCategories} repeat={4} speed={44} renderItem={…}>`. The fixed bottom-strip container styling (`.svc-hero__strip`: absolute, backdrop-blur, border-top) is page-unique → keep as a leftover wrapper around `<Marquee>`.
- `.svc-wave-down` (two instances, fills `#f0eeea` and `#080808`) → `<WaveDivider to="#f0eeea" />` and `<WaveDivider to="#080808" />`.
- `.svc-img-card*` (radius 22px, shine 128deg, badge) → `<ShineImageCard radius={22} shineAngle="128deg" imgScale={1.06} badge={…} />`. NOTE the lift is `-7px` + scale `1.018` and shadow differs — set `style={{ "--sc-lift":"-7px","--sc-scale":"1.018" }}` and verify; the badge markup (`.svc-img-card__badge`: bottom-left pill) is passed as `badge` prop content (keep its classes as a small leftover or inline utilities).

**Leftovers allowed:** sticky-menu behavior, `:nth-child` section coloring, the bottom-strip container chrome, any 3D/scroll-driven rules.

- [ ] **Step 1:** Confirm baseline green: `npm run test:visual -- -g "services"`.
- [ ] **Step 2:** Apply the inventory mapping above; delete replaced rules/keyframes from `<style>`.
- [ ] **Step 3:** Screenshot gate: `npm run test:visual -- -g "services"` → zero meaningful diff; reconcile.
- [ ] **Step 4:** `npm run lint && npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `git add app/services/page.tsx && git commit -m "refactor(services): adopt shared ui primitives, zero visual diff"`.

---

### Task 2.2: Convert `app/about-us/page.tsx`

**Files:** Modify `app/about-us/page.tsx`. Route: `/about-us`. (Largest file — 1015 lines.)

**Pattern inventory → primitive:**
- `.about-grain` + keyframes → `<GrainOverlay />`.
- `.about-hero__orb--gold` (900×480, `rgba(250,204,21,0.14)`), `.about-hero__orb--amber` (640, `rgba(251,146,60,0.06)`), `.about-showcase__orb` (1100×600, `rgba(250,204,21,0.05)`, blur 100, ellipse, no anim), `.about-learn__orb` (600, `rgba(250,204,21,0.04)`, blur 90) → `<GlowOrb>` each (exact static values; `animation="none"` for the showcase/learn orbs).
- `.about-eyebrow*` (identical to svc variants) → `<Eyebrow>` (dot/line, center, color).
- `.about-section-head/title/sub(--dark)` → `<SectionHeading dark={…} />`. NOTE about's `--sh-sub-max` is 620px (svc uses 600) — pass `style={{ "--sh-sub-max":"620px" }}`.
- `.about-hero__title` (gradient stops 38/52/68) → `<GradientText as="h1" animate gradient="linear-gradient(135deg,#fff 38%,#facc15 52%,#fff 68%)">` + size utilities.
- `.about-hero__cta` (primary 16px 34px) → `<Button variant="primary" href={…} style={{ "--btn-pad":"16px 34px" }}>` (same shadow caveat as svc).
- `.about-hero__strip*` (44s, 4× dup) → `<Marquee repeat={4} speed={44}>` inside the page-unique strip container (leftover).
- `.about-showcase__ticker*` + `@keyframes scTicker` (38s, fixed text ×8) → `<Marquee items={["Studio","Craft","Process","People"]} repeat={8} speed={38} renderItem={…}>` inside the ticker container (border/backdrop = leftover).
- `.about-wave-down` (two: `#f0eeea`, `#080808`) → `<WaveDivider to="…" />`.
- `.about-showcase__card*` (radius 26px, shine 128deg, tag, pre-hover rotation) → `<ShineImageCard radius={26} shineAngle="128deg" imgScale={1.06} badge={…} style={{ "--sc-lift":"-8px","--sc-scale":"1.025" }} />`. The idle rotation/`animation-play-state` choreography is page-unique → keep that as a leftover wrapper class on the card (pass via `className`).

**Leftovers allowed:** `AboutImageCarousel` (own component, Task 2.6), showcase rotation/marquee-pause choreography, any scroll-driven rules.

- [ ] **Step 1:** Baseline: `npm run test:visual -- -g "about-us"`.
- [ ] **Step 2:** Apply mapping; delete replaced rules/keyframes.
- [ ] **Step 3:** Gate: `npm run test:visual -- -g "about-us"` → reconcile to zero diff.
- [ ] **Step 4:** `npm run lint && npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `git add app/about-us/page.tsx && git commit -m "refactor(about-us): adopt shared ui primitives, zero visual diff"`.

---

### Task 2.3: Convert `app/technology/page.tsx` + `TechStackSection` + `TechStickyFeature` (proves `--accent`)

**Files:** Modify `app/technology/page.tsx`, `components/TechStackSection.tsx`, `components/TechStickyFeature.tsx`. Route: `/technology`. **This task migrates dynamic accent to `--accent`.**

**`app/technology/page.tsx`:**
- Set `--accent` once: on the page's outermost element add `style={{ "--accent": accentColor } as React.CSSProperties}` (accentColor stays `"#facc15"` at line 66). All descendant primitives/classes inherit it.
- `.tech-grain` + keyframes → `<GrainOverlay />`.
- `.tech-hero-orb--gold` (`${accentColor}22`→`color-mix(in srgb, var(--accent) 13.3%, transparent)`, 900×500, ellipse, fade 70%) and `.tech-hero-orb--amber` (`${accentColor}0d`→4.7%, 500, fade 65%, reverse) → `<GlowOrb color="color-mix(...)" …>`.
- `.tech-eyebrow-pill` + `.tech-eyebrow-dot` → `<Eyebrow pill ornament="dot" align="center">` (the pill bg `${accentColor}18`→`color-mix(... 9.4% ...)`; `--eb-pill-bg` override; dot uses accent). Verify the pill bg matches.
- `.tech-shimmer-heading` (stops 40/55/70, accent middle) → `<GradientText animate gradient="linear-gradient(135deg,#fff 40%,var(--accent) 55%,#fff 70%)">` (this is the `.gradient-text` default — likely no override needed).
- `.tech-cta-pill` (uppercase, opacity-hover) → keep as a small leftover OR a `Button` variant; it differs enough (opacity-only hover, no lift) that a leftover is acceptable — document it.
- `.tech-marquee-track` (55s) → `<Marquee speed={55} renderItem={…}>`; the `✦` separator uses accent → `style={{ color: "var(--accent)" }}`.
- Inline `style={{ background: accentColor }}` / `linear-gradient(... ${accentColor}66 ...)` for corner brackets/dots → replace `accentColor` with `"var(--accent)"` and hex-alpha with `color-mix`.

**`components/TechStackSection.tsx`** (prop `accentColor`): set `style={{ "--accent": accentColor }}` on its root; convert ALL `${accentColor}`/`${accentColor}NN` in its `<style>` to `var(--accent)` / `color-mix`. Map: `.tss-orb--tr/bl` → `<GlowOrb>`; `.tss-eyebrow*` (lines + ✦ mark, accent) → `<Eyebrow ornament="line"/"mark">` with `--eb-line-bg` gradients + accent color; `.tss-title__line--accent` (stops 38/58/78, italic, 7s) → `<GradientText animate duration={7} gradient="linear-gradient(135deg,#fff 38%,var(--accent) 58%,#fff 78%)" className="italic">`; `.tss-head/.tss-title/.tss-desc` → `<SectionHeading>` (note `.tss-head` has the `--on` scroll-reveal transition — that's JS-driven visibility, keep as leftover wrapper). Card halo/border/glow hover rules: convert accent interpolation to `var(--accent)`/`color-mix`, keep the bespoke card rules as leftovers (page-unique cascade).

**`components/TechStickyFeature.tsx`** (prop `accentColor`): set `style={{ "--accent": accentColor }}` on root; convert all inline `accentColor` style objects to `"var(--accent)"`/`color-mix`. `.tsf-cream-orb` (`${accentColor}20`→12.5%, ellipse, blur 80) → `<GlowOrb color="color-mix(...)" shape="ellipse" blur={80} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" animation="…">`. The scan-line/3D-tilt/progress-dot/sticky-sync logic is JS-driven → leftover (just swap the color token).

- [ ] **Step 1:** Baseline: `npm run test:visual -- -g "technology"`.
- [ ] **Step 2:** Add `--accent` roots to all three files; convert orbs/eyebrows/gradient/marquee per mapping; replace every `accentColor` CSS interpolation with `var(--accent)`/`color-mix`; delete replaced rules/keyframes.
- [ ] **Step 3:** Gate: `npm run test:visual -- -g "technology"` → reconcile to zero diff (watch the `color-mix` alpha conversions especially).
- [ ] **Step 4:** `npm run lint && npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `git add app/technology/page.tsx components/TechStackSection.tsx components/TechStickyFeature.tsx && git commit -m "refactor(technology): adopt primitives + migrate accentColor to --accent var"`.

---

### Task 2.4: Convert `WannaChatSection`, `Footer`, `ServiceDetailModal`

**Files:** Modify `components/WannaChatSection.tsx`, `components/Footer.tsx`, `components/ServiceDetailModal.tsx`. Routes touched: all (Footer/WannaChat) + `/services` (modal). Gate against `/` and `/services`.

**`WannaChatSection`:** `.wc-orb--a/b/c` (`rgba(250,204,21,0.11)` / `rgba(251,146,60,0.08)` / `rgba(250,204,21,0.04)`, `wcFloat` drift) → `<GlowOrb animation="drift|drift-rev">`. `.wc-heading__gold` (4-stop gold gradient, 5s, `wcGoldMove`) → `<GradientText animate duration={5} backgroundSize="220% auto" gradient="linear-gradient(128deg,#facc15 0%,#fbbf24 40%,#f59e0b 70%,#facc15 100%)">` (the `wcGoldMove` keyframe ends at `-20%` not `-200%`; frozen frame 0 = `220% center` identical to `textShimmer` start `200%`? NO — verify: at frame 0 `wcGoldMove` is `220% center`, `textShimmer` is `200% center`. These differ. **Keep `wc-heading__gold`'s bespoke keyframe + class as a leftover** rather than forcing `textShimmer` — document it.) **The `.wc-btn` submit button (shine sweep + done/busy states) stays as-is — documented leftover** (form behavior, not a generic CTA).

**`Footer`:** inventory its `<style>`; convert any orbs/eyebrows/gradient text/buttons present to primitives; keep nav/layout-specific rules. (Footer renders on every route — gate against `/`.)

**`ServiceDetailModal`:** uses `cubic-bezier(.16,1,.3,1)` (×7) → if it has `motion` transitions, import `EASE.bounce` for the JS ones; CSS transitions can reference `var(--ease-bounce)`. Convert any orb/gradient/eyebrow patterns; the modal open/close choreography + scroll logic stays. (Modal is interactive — screenshot gate covers its closed/default state only; verify the trigger area is unchanged.)

- [ ] **Step 1:** Baseline: `npm run test:visual -- -g "home|services"`.
- [ ] **Step 2:** Apply mappings per file; keep documented leftovers (`wc-btn`, `wc-heading__gold` keyframe, modal/footer behavior).
- [ ] **Step 3:** Gate: `npm run test:visual -- -g "home|services"` → reconcile to zero diff.
- [ ] **Step 4:** `npm run lint && npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `git add components/WannaChatSection.tsx components/Footer.tsx components/ServiceDetailModal.tsx && git commit -m "refactor: adopt primitives in WannaChat, Footer, ServiceDetailModal"`.

---

### Task 2.5: Convert `AnimatedSteps`, `GridImageSection`, `FAQSection`, `PortfolioTemplate`, `PortfolioGrid`

**Files:** Modify `components/AnimatedSteps.tsx`, `components/GridImageSection.tsx`, `components/FAQSection.tsx`, `components/PortfolioTemplate.tsx`, `components/PortfolioGrid.tsx`. Routes: `/`, `/<portfolio-slug>`. Gate against `home` and the portfolio route.

**Pattern inventory → primitive:**
- `AnimatedSteps` (prop `accentColor`): set `--accent` root; `.tech-steps__orb--l/r` → `<GlowOrb>` (`${ac}10`→6.25%, `${ac}0a`→3.9%); `.tech-steps__eyebrow*` → `<Eyebrow ornament="line"/"mark">`; `.tech-steps__head/title/sub` → `<SectionHeading>`. The step dots/connector/scan-beam/shimmer rules are bespoke step-timeline cascade → convert `${ac}` → `var(--accent)`/`color-mix`, keep rules as leftover.
- `GridImageSection`: `.gi-shimmer` one-time entry shimmer (108deg, `giShimmer` keyframe) is parallax/entrance-specific → keep as leftover; convert any plain orb/badge to primitives. The frame radius (52px) and parallax are JS/scroll-driven → leftover.
- `FAQSection`: `.fq-orb--a/b/c` (`rgba(250,204,21,0.09)`/`rgba(251,146,60,0.06)`/`rgba(250,204,21,0.03)`, `fqFloat`) → `<GlowOrb animation="drift">`; `.fq-count` (static gradient 128deg #facc15→#f59e0b) → `<GradientText gradient="linear-gradient(128deg,#facc15,#f59e0b)">` (no `animate`). The accordion (`FAQAccordion`) behavior + `.fq-item__btn` stay.
- `PortfolioTemplate`: `.cs-marquee-track` (40s) → `<Marquee speed={40}>`; `.cs-why-card__shine` (125deg, non-image text card) → either `<ShineImageCard>` is wrong (no image) — keep `.cs-why-card__shine` as a leftover OR add a future `Shine` wrapper; for now keep as documented leftover. Any orbs/eyebrows/buttons → primitives.
- `PortfolioGrid` (client component): `.portfolio-card*` now lives in globals as `.shine-card*`. Replace the `portfolio-card` markup with `<ShineImageCard>` (radius 16/`rounded-2xl`→ pass `radius={16}`) OR, since it's a `motion.div` with `whileInView`, keep the `motion.div` wrapper and apply `shine-card` classes + `.shine-card__shine`. Import `EASE.smooth` and replace the literal `[0.23,1,0.32,1]`. Verify the grid (rendered on Home) stays zero-diff.

- [ ] **Step 1:** Baseline: `npm run test:visual -- -g "home"` (+ portfolio route if PORTFOLIO_SLUG set).
- [ ] **Step 2:** Apply mappings; convert accent interpolation; replace `motion` easing literals with `EASE.*`; keep documented leftovers.
- [ ] **Step 3:** Gate: `npm run test:visual -- -g "home"` (+ portfolio) → reconcile to zero diff.
- [ ] **Step 4:** `npm run lint && npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `git add components/AnimatedSteps.tsx components/GridImageSection.tsx components/FAQSection.tsx components/PortfolioTemplate.tsx components/PortfolioGrid.tsx && git commit -m "refactor: adopt primitives in steps, grid, faq, portfolio components"`.

---

### Task 2.6: Convert `ClientsSection`, `WhyUsSection`, `AboutImageCarousel`, `LegalArticle`, `app/contact-us`, legal pages, and trivial leftovers

**Files:** Modify `components/ClientsSection.tsx`, `components/WhyUsSection.tsx`, `components/AboutImageCarousel.tsx`, `components/LegalArticle.tsx`, `app/contact-us/page.tsx`, `components/ServiceModalMenu.tsx`, `components/ServiceTechGroups.tsx`. (Legal pages `app/privacy-policy`, `app/terms-of-use` are 36 lines each and render `LegalArticle` — converting `LegalArticle` covers them.) Routes: `/`, `/about-us`, `/contact-us`, `/privacy-policy`, `/terms-of-use`. Gate against each.

**Pattern inventory → primitive:**
- `ClientsSection` (prop `accentColor`): set `--accent` root; `.cs-clients__orb--l/r` → `<GlowOrb>`; `.cs-clients__eyebrow*` (lines, accent) → `<Eyebrow ornament="line">`; `.cs-clients__head/title` → `<SectionHeading>` (no subtitle); `.cs-mq*` two-row (32s fwd / 26s rev, 220px fade) → two `<Marquee speed={32}/{26} direction="left"/"right" fade pauseOnHover>` (logo cards passed via `renderItem`); `.cs-clients__cta` → `<Button variant="primary" href="/contact-us" style={{ background:"var(--accent)", "--btn-pad":"14px 32px" }}>`. Convert `${ac}` → `var(--accent)`/`color-mix`.
- `WhyUsSection`: `.why-section__orb` (`rgba(250,204,21,0.05)`, blur 60) → `<GlowOrb blur={60}>`; `.btn-outline-gold` → `<Button variant="outline" href={…} style={{ "--btn-pad":"14px 32px","--btn-size":"16px" }}>`. Card layout rules stay (page-unique).
- `AboutImageCarousel` (client, drag/scroll): `.aic-slide*` (radius 20, shine 135deg, scale-only 1.04, fixed 340×400) → `<ShineImageCard radius={20} shineAngle="135deg" imgScale={1.04} style={{ "--sc-lift":"0px","--sc-scale":"1" }} className="w-[340px] h-[400px] shrink-0" />` (no lift). Drag/scroll behavior stays.
- `LegalArticle`: convert any eyebrow/heading/gradient present; legal typography rules stay (prose styling is page-unique).
- `app/contact-us`: convert grain/orbs/eyebrow/buttons present to primitives; form behavior stays.
- `ServiceModalMenu`, `ServiceTechGroups`: trivial leftovers — convert whatever orb/eyebrow/button patterns exist; remove now-dead `<style>` rules.

- [ ] **Step 1:** Baseline: `npm run test:visual -- -g "home|about-us|contact-us|privacy-policy|terms-of-use"`.
- [ ] **Step 2:** Apply mappings; convert accent interpolation; remove dead `<style>` rules.
- [ ] **Step 3:** Gate the same set → reconcile to zero diff.
- [ ] **Step 4:** `npm run lint && npx tsc --noEmit`.
- [ ] **Step 5:** Commit: `git add components/ClientsSection.tsx components/WhyUsSection.tsx components/AboutImageCarousel.tsx components/LegalArticle.tsx app/contact-us/page.tsx components/ServiceModalMenu.tsx components/ServiceTechGroups.tsx && git commit -m "refactor: adopt primitives across clients, why-us, carousel, legal, contact"`.

---

### Task 2.7: Final sweep + success-criteria verification

**Files:** repo-wide audit; possible touch-ups.

- [ ] **Step 1: Confirm `<style>` reduction**

Run:
```bash
grep -rl "<style" app components | sort
```
Expected: only files with documented page-unique leftovers remain (e.g. home `winners`/`scroll-cue`, services strip chrome, sticky/3D/parallax in tech & grid). Every remaining `<style>` should be justified by a leftover noted in this plan. Run a line-count delta to confirm the ~3,200 → ~30% target:
```bash
git diff --stat <phase0-start-commit> HEAD -- app components | tail -1
```

- [ ] **Step 2: Confirm no JS-template-string CSS accent remains**

Run:
```bash
grep -rnE '\$\{(accentColor|ac)\}' app components
```
Expected: zero matches (all migrated to `var(--accent)` / `color-mix`).

- [ ] **Step 3: Confirm primitive adoption (no per-file re-implementation)**

Run:
```bash
grep -rnE '\.(svc|about|tss|wc|fq|cs|tech)-[a-z-]*(orb|eyebrow|grain|wave|marquee|shimmer)' app components | grep -v "components/ui/"
```
Expected: only documented leftovers.

- [ ] **Step 4: Full visual-regression run, all routes, both viewports**

Run:
```bash
npm run test:visual
```
Expected: ALL PASS, zero meaningful diff on every route.

- [ ] **Step 5: Lint + typecheck + production build**

Run:
```bash
npm run lint && npx tsc --noEmit && npm run build
```
Expected: all succeed.

- [ ] **Step 6: Commit any touch-ups**

```bash
git add -A && git commit -m "refactor(styling): final consolidation sweep, all routes zero visual diff"
```

---

## Success Criteria (from spec — verify at Task 2.7)

- [ ] `<style>` tags removed or reduced to genuinely-unique leftovers across all 20 files (Step 1).
- [ ] Shared `components/ui/` library in use; no per-file re-implementation of orbs, eyebrows, gradient text, marquees, buttons, section headings, shine cards (Step 3).
- [ ] `accentColor` flows via `--accent`; no JS-template-string CSS remains (Step 2).
- [ ] Visual diff against baselines shows zero meaningful change on every route × 2 viewports (Step 4).
- [ ] Each conversion landed as a small, screenshot-gated commit (one per Phase 1 / Phase 2 task).

## Documented Leftovers (intentional, allowed by Non-Goals)

- Home: `.hero-grid` (mask), `.scroll-cue*`, `.winners-*`/`.award-*` + `sparklePop`/`cardRise`/`medalFloat`, Google Fonts `@import`.
- Services/About: hero bottom-strip & ticker container chrome (backdrop-blur/borders), sticky menus, `:nth-child` section coloring, showcase idle-rotation choreography.
- Technology/TechStack/TechSticky: scroll-reveal `--on` toggles, 3D tilt, scan lines, progress-dot sync, sticky-section logic.
- WannaChat: `.wc-btn` submit button (shine sweep + done/busy states), `.wc-heading__gold` bespoke keyframe (frame-0 differs from canonical `textShimmer`).
- GridImageSection: `.gi-shimmer` entry animation + parallax frame.
- PortfolioTemplate: `.cs-why-card__shine` (non-image text card).
- Legal: prose typography.
