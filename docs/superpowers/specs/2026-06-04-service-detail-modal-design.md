# Service Detail Modal + Product Gallery Fix — Design Spec

**Date:** 2026-06-04
**Page:** `app/services/page.tsx`
**Execution:** Implement with the `/frontend-design:frontend-design` skill. This document is the spec; there is **no separate implementation plan** — go spec → execution directly.

---

## Goal

Two changes to the Services page:

1. **Shrink the dominant featured image** in the Product Design gallery (`prodImages[0]`).
2. **Replace the 8 "right menu" links** (which currently navigate to old WordPress pages) with an **immersive, cinematic fullscreen modal** that renders each service's full content — featured image, bold tagline, and rich body — **in-page**, with no navigation away and no new routes.

**Hard rule:** All content must come from WordPress via WPGraphQL. Never hardcode text, images, or links. On data absence, render `null` or degrade gracefully — never substitute fallback strings.

---

## Part 1 — Featured Image Fix

The first product image (`.svc-img-card--featured`) currently spans the full width of the 3fr gallery column and visually dominates the section.

**Change:** Constrain `.svc-img-card--featured` to **~58% width, left-aligned**, so it reads as a deliberate editorial anchor rather than a billboard. The rows beneath it then form a balanced collage.

- CSS-only change to the existing inline `<style>` block. No markup change.
- Verify responsive behaviour: on mobile (`max-width: 768px`) it should return to full width.

---

## Part 2 — Service Detail Modal

### 2.1 Data Layer (server-side prefetch, one batched query)

**Strategy:** Prefetch all 8 service detail pages server-side in a single batched GraphQL request (decision: option A). The content is text-light (structured `<h3>`/`<p>`/`<ol>`), so prefetch cost is negligible and the modal opens instantly with zero loading state.

**Confirmed field mappings** (verified against `acf-export-2026-05-17.json` + `schema.graphql`):

The service sub-pages use the `page-servicedetail.php` template = **`Template_ServiceDetailPage`** in GraphQL.

| Modal element             | Source                        | GraphQL path                                                                    |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| Real headline             | WP page title                 | `title`                                                                         |
| Bold lead tagline         | ACF `top_bold_text` (wysiwyg) | `template { ... on Template_ServiceDetailPage { postFields { topBoldText } } }` |
| Featured hero image       | WP featured image             | `featuredImage { node { sourceUrl altText } }`                                  |
| Rich body (process steps) | WP post content               | `content`                                                                       |

The long rendered HTML from the old site (banner grid, contact form, Gravity Forms scripts, "trusted by" logos) is **template chrome** — ignored entirely. We pull only the 4 clean fields above.

**Implementation:**

1. `sp.prodrightMenu` already returns 8 `{ prodmtitle, prodmlink }` items from WP.
2. Derive each page URI from `prodmlink`:
   `https://triolla.io/services/product-ux-ui-design/` → `services/product-ux-ui-design`.
3. Add helper `buildServiceDetailsQuery(uris: string[])` in `lib/queries.ts` that returns a plain string with one **aliased** `page(id, idType: URI)` per service:

   ```graphql
   query {
     s0: page(id: "services/product-ux-ui-design", idType: URI) {
       title
       featuredImage { node { sourceUrl altText } }
       content
       template { ... on Template_ServiceDetailPage { postFields { topBoldText } } }
     }
     s1: page(id: "services/ux-research", idType: URI) { ... }
     # ... through s7 — one round trip
   }
   ```

4. In the Server Component, run the batched query inside `try/catch` (hide on failure, per project convention). Map each `s{i}` result back onto the menu item by index → enriched array:

   ```ts
   {
     ;(title, link, image, altText, boldText, content)
   }
   ```

5. Any page that fails to resolve → that menu item renders as a plain link (its original `prodmlink`), not a modal trigger. Graceful degradation, no fabricated content.

### 2.2 Component Architecture

- `app/services/page.tsx` stays a **Server Component**; it does all fetching and builds the enriched services array.
- The Product section's right-hand numbered menu becomes a **new client component**: `components/ServiceModalMenu.tsx` (`"use client"`).
  - Receives the enriched services array as a prop.
  - Renders the **exact same numbered `<ul>` markup and classes** (`svc-menu-list`, `svc-menu-item`, `svc-menu-item__num`, `svc-menu-item__title`) so existing styling carries over untouched — but each item becomes a `<button>` that opens the modal.
  - Owns: active-service index state, the modal, `Esc`-to-close, body scroll-lock while open, backdrop-click-to-close, and **prev/next navigation** to move through all 8 services without closing.
  - Renders the modal via `createPortal` to `document.body` so it escapes the section's `overflow: hidden`.
  - Heavy modal styles live in a **colocated inline `<style>` tag** within the component (per project styling convention).
- This isolates all interactivity to one focused client component; the page remains a clean Server Component.

### 2.3 Modal UX — "WOW" (cinematic fullscreen takeover)

Built entirely on the existing design language (dark `#080808`, grain overlay, gold `#facc15` shimmer, editorial brackets/ghost numbers, `cubic-bezier(.16,1,.3,1)` easing) so it feels continuous with the page, not a bolted-on dialog.

**Entry animation:**

- Backdrop fades to dark + backdrop-blur.
- A **gold curtain sweeps up** from the bottom, then the panel reveals beneath it.
- Grain overlay carries into the modal for continuity.

**Inside (vertically scrollable), with staggered reveal via `animation-delay`:**

1. **Sticky top bar** — `— 0X —` index, small service eyebrow label, gold-hover close ✕.
2. **Hero stage** — featured image at ~60vh, `object-fit: cover`; scales `1.08 → 1` on entry plus a slow parallax on scroll; gradient scrim melts the image into `#080808`; faint ghost-number watermark behind.
3. **Headline** — `title` rendered in the shimmer-gradient `svc-hero__title` treatment.
4. **Lead** — `topBoldText` (parsed HTML via `html-react-parser`) as an oversized bold intro paragraph.
5. **Body** — `content` parsed and re-typeset into the new UI:
   - `<h3>` process steps → **auto-numbered gold step markers** (CSS counter).
   - `<p>` → ~720px reading column, refined line-height, gray body text.
   - `<ol>` / `<li>` → restyled to match.
   - None of the old form/grid/script chrome appears — just the clean article.
6. **Footer nav** — `← Prev / Next →` cycling through the 8 services. Optional gold CTA **only if** a WP-sourced button text already exists (e.g. reuse `sp.buttonText`); otherwise omit — no hardcoded string.

**Exit:** reverse curtain-down wipe; backdrop fades out.

**Accessibility / robustness:**

- `Esc` closes; backdrop click closes.
- Body scroll locked while open.
- Basic focus management (focus the close button on open; restore focus to the trigger on close).
- Honour `prefers-reduced-motion` by reducing/skipping the curtain + parallax animations.

---

## Files Touched

- `lib/queries.ts` — add `buildServiceDetailsQuery(uris)` helper.
- `app/services/page.tsx` — batched prefetch + URI derivation + enriched array; replace inline Product right-menu with `<ServiceModalMenu services={...} />`; apply Part 1 CSS tweak.
- `components/ServiceModalMenu.tsx` — **new** client component (menu list + portal modal + colocated styles).

## Out of Scope

- No new routes/pages.
- Branding (`brandrightMenu`) and Engineering menus are unchanged in this spec — only the Product `prodrightMenu` gets the modal treatment.
- The old contact form / "trusted by" logos / phone numbers from the rendered pages are intentionally dropped.
