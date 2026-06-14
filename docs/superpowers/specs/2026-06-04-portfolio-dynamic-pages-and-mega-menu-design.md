# Portfolio Dynamic Pages + Mega-Menu Promo Card — Design Spec

**Date:** 2026-06-04
**Status:** Approved for planning

## Problem

All portfolio category pages on the live WordPress site (`/cyber-security`, `/gaming`,
`/fintech-finance`, etc.) share one WP template (`Template_PortfolioPage`). In the React
port, only `/cyber-security` exists — built as a one-off `app/cyber-security/page.tsx`
(~570 lines). The other 11+ categories have no React route.

Separately, the live site's **Portfolio** nav hover shows a mega-menu: a two-column
industry link list plus a promo card on the right ("From Design To Product Launch",
sourced from WP). The current React dropdown (`DropdownItem`) renders only the plain link
grid — no promo card.

This spec covers both, with the dynamic pages as priority phase 1 and the mega-menu as
phase 2.

## Goals

- One dynamic route renders **all** portfolio-template pages — no per-page components.
- Routes are derived from WordPress, with **zero hardcoded slugs** (per CLAUDE.md: all
  content from WP).
- Preserve the existing top-level URLs exactly (`/cyber-security`, …) — no SEO/URL
  changes, full parity with WP and the nav menu links.
- Add the promo card to the Portfolio dropdown, sourced from existing WP fields.

## Non-Goals

- No redirects (URLs are unchanged).
- No animated "jumping avatar" promo effect (static image only — see Future Enhancements).
- No new ACF fields and no `schema.graphql` regeneration — every field used already exists
  live.
- No restructuring of the WP menu's two intermediate "test" grouping nodes; the existing
  `buildNavTree` already flattens their children into the dropdown correctly.

## Verified Facts (from live WP introspection, 2026-06-04)

- **14 pages** use `Template_PortfolioPage`: the 12 menu categories
  (`cyber-security`, `medical-healthcare`, `fintech-finance`, `gaming`, `agritech`, `b2c`,
  `device-iot`, `startups-tech`, `mobile-apps`, `saas-platforms`, `b2b`, `dev`) plus
  `dashboard-design` and `portfolio-page` (not in the menu, same template).
- `pages(first:100){ nodes{ uri template{ templateName __typename } } }` works and returns
  the template `__typename`, enabling enumeration.
- All portfolio pages are **top-level slugs** (e.g. `/cyber-security/`), not nested.
- Promo card source (on `themeSetting.themeOptions`):
  - `menuBackgroundImage` → `menu-image2.png` (380×340) — the complete designed promo card
    (heading + avatars + badges all baked into one PNG).
  - `jumpingImage1/2/3` → three ~900KB SVGs (avatar + speech badge each), the animated
    floating versions used on the live site. **Not used** in this spec.
  - There is **no** heading/link text field for the promo — it is a self-contained image
    with no defined click target.
- `schema.graphql` (dated 2026-05-17) is **stale** — it still shows the old
  `themeSetting { themeSetting }` field name. The live field is
  `themeSetting { themeOptions }`. Do not rely on the local file for theme-option fields;
  it does not need regenerating for this work.

## Architecture

### Phase 1 — Dynamic portfolio route

**New file `app/[slug]/page.tsx`** — async Server Component.

- `export const dynamicParams = false;` — only slugs returned by `generateStaticParams`
  resolve at this segment; any other unknown slug 404s. Existing static route folders
  (`about-us`, `services`, `technology`) take priority over the dynamic segment per Next.js
  route precedence, so there is no collision.

- **`generateStaticParams()`** runs:

  ```graphql
  query GetPortfolioSlugs {
    pages(first: 100) {
      nodes {
        uri
        template {
          __typename
        }
      }
    }
  }
  ```

  Filters `node.template?.__typename === "Template_PortfolioPage"`, maps each `uri` to a
  slug by stripping leading/trailing slashes, returns `[{ slug }, …]`. On fetch failure,
  returns `[]` (build emits no portfolio routes rather than crashing).

- **Parameterized data query** — new constant in `lib/queries.ts` replacing
  `GET_CYBER_SECURITY_PAGE`:

  ```graphql
  query GetPortfolioPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_PortfolioPage {
          portfolioFields { …identical field set to the current GET_CYBER_SECURITY_PAGE… }
        }
      }
    }
  }
  ```

  Called with `variables: { uri: slug }`. The `portfolioFields` shape is unchanged, so
  rendering logic is unchanged.

- **Guard:** if `portfolioFields` is null/empty (fetch failed, or the page is not actually
  on the portfolio template), call `notFound()` instead of rendering an empty shell.

- The page file is **thin**: resolve `slug` from params → fetch portfolio data by slug →
  fetch theme settings → `notFound()` if empty → render `<PortfolioTemplate>`.

### Phase 1 — Shared template component

**New file `components/PortfolioTemplate.tsx`** (client/server as the current page requires;
it renders `FadeIn`, `SectionReveal`, `CountUpNumber`, `WannaChatSection`, inline `<style>`,
and `html-react-parser` — same as today).

- Moves the entire existing render body from `app/cyber-security/page.tsx` (hero, intro,
  marquee, portfolio case studies, design process, why-us, WannaChat) into this component.
- Props: `pf` (portfolioFields) and `ts` (themeOptions).
- Helper functions `stripHtml`, `htmlToLines`, `parseAccentHeading` move into this file (or
  a small shared util) alongside it.
- Per-page `accentColor` continues to come from `pf.headerBgColor` (default `#fed125`), so
  each category keeps its own accent.

### Phase 2 — Mega-menu promo card

Upgrade `DropdownItem` inside `components/HeaderClient.tsx`.

- **New prop on `HeaderClient`: `menuPromoImage: string | null`.** Sourced in the `Header`
  Server Component (`components/Header.tsx`) from
  `ts?.themeOptions?.menuBackgroundImage?.node?.sourceUrl` and passed through to each
  `DropdownItem`. Add `menuBackgroundImage { node { sourceUrl } }` to the `GET_THEME_SETTINGS`
  query's `themeOptions` selection.
- **Conditional layout:** when `menuPromoImage` is present **and** the dropdown is the
  mega-menu, the dropdown panel becomes a two-pane flex row — existing two-column link grid
  on the left, promo `<img>` on the right (rounded corners, ~340–380px wide). `minWidth`
  widens to accommodate the promo pane.
- **Trigger rule (content-driven, not label-hardcoded):** show the promo pane only when
  `item.children.length > 6`. That is Portfolio today and avoids hardcoding the string
  "Portfolio".
- **Promo is decorative:** plain `<img>` with empty `alt` and `aria-hidden="true"`, no click
  target (no link field exists in WP). Existing portal positioning, hover-bridge
  (`onMouseEnter`/`onMouseLeave`), and entrance animation are unchanged.
- **No regression:** when `menuPromoImage` is null or `children.length <= 6`, the dropdown
  renders exactly as today (Services and any other dropdown unaffected).
- **Mobile menu unchanged** — the promo card is desktop-hover only; mobile keeps the
  existing child-chip accordion.

## Data Flow

1. **Build time:** `generateStaticParams` → enumerate portfolio-template pages → static
   params for all 14.
2. **Page render (per slug):** `GetPortfolioPage($uri)` → `portfolioFields`; `GetThemeSettings`
   → `themeOptions` → `<PortfolioTemplate pf ts />`. Empty data → `notFound()`.
3. **Header render (every page):** `GetThemeSettings` (now includes `menuBackgroundImage`) +
   `GetPrimaryMenu` → `<HeaderClient menuPromoImage=… navItems=… />` → `DropdownItem` shows
   the promo pane on the mega-menu.

## Files Touched

| File                               | Change                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/[slug]/page.tsx`              | **New** — thin dynamic route + `generateStaticParams` + `dynamicParams=false`                                                               |
| `components/PortfolioTemplate.tsx` | **New** — shared render body extracted from cyber-security page                                                                             |
| `app/cyber-security/page.tsx`      | **Delete**                                                                                                                                  |
| `lib/queries.ts`                   | Remove `GET_CYBER_SECURITY_PAGE`; add `GET_PORTFOLIO_PAGE($uri)` + `GET_PORTFOLIO_SLUGS`; add `menuBackgroundImage` to `GET_THEME_SETTINGS` |
| `components/Header.tsx`            | Pass `menuPromoImage` from `themeOptions.menuBackgroundImage`                                                                               |
| `components/HeaderClient.tsx`      | Add `menuPromoImage` prop; conditional promo pane in `DropdownItem`                                                                         |

## Error Handling

- Page/theme fetches wrapped in `try/catch` (existing pattern). Failure or empty
  `portfolioFields` → `notFound()`.
- `generateStaticParams` fetch failure → return `[]`.
- Missing promo image → dropdown falls back to the current link-only layout.

## Edge Cases

- `/portfolio-page/` (the template's sample page) and `/dashboard-design/` become routable
  since they share the template. This matches "expose what WP has." If `/portfolio-page/`
  should be hidden, filter it out in `generateStaticParams` — decision deferred; default is
  to expose it.
- Static folders win over `[slug]`, so `cyber-security` must be deleted as a folder for the
  dynamic route to serve it.

## Future Enhancements (out of scope)

- Animated promo card using `jumpingImage1/2/3` with floating motion, matching the live
  hover effect (~2.7MB of SVG assets, needs motion tuning).
