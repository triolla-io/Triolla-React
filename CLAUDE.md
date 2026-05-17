# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
npx get-graphql-schema https://triolla.io/graphql > schema.graphql  # Regenerate after ACF changes
```

No test suite is configured.

## Architecture

**Next.js 16 App Router** with **headless WordPress + WPGraphQL** as the CMS backend. This is a CMS-managed landing page — **all content must come from WordPress**. Do not hardcode text, images, links, menu items, or any other content in the React code.

### GraphQL Schema Reference

`schema.graphql` (repo root) is the authoritative reference for every available type, field, and ACF group. Generated via:

```bash
npx get-graphql-schema https://triolla.io/graphql > schema.graphql
```

Regenerate it when new ACF fields or page templates are added in WP. Before writing or modifying a query, read `schema.graphql` to confirm the exact field names and nesting — do not guess field names.

### Data Fetching Pattern

WordPress content is fetched via Apollo Client v4 in Server Components:

1. Query strings (not `gql` tagged template literals) are defined in `lib/queries.ts`
2. Pages wrap them with `gql` at call-site: `client.query({ query: gql\`${GET_MY_QUERY}\` })`
3. WordPress uses **custom page templates** mapped to ACF field groups — the GraphQL response shape is `page.template.<TemplateName>.<fieldGroup>`
4. Data fetching is wrapped in `try/catch`; on failure, render empty/hidden states — do not substitute hardcoded text

Example shape for the services page:

```
page(id: "services", idType: URI)
  → template → Template_ServicePage → servicePage → { all fields }
```

The Apollo client (`lib/apollo-client.ts`) reads `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` from `.env`. The live WP instance is at `https://triolla.io/graphql`.

### `use client` vs Server Components

- App Router pages (`app/**/page.tsx`) are Server Components — they fetch from WP at request time
- Components that require `"use client"`: `HeaderClient`, `HeroHeadline`, `SectionReveal`, `FadeIn`, `CountUpNumber`, `CookieBanner`, `FAQAccordion`, `LearnCarousel`, `PortfolioGrid`, `ClientLogoStrip`
- `Header` and `Footer` are Server Components. `Header` fetches `GET_THEME_SETTINGS` + `GET_PRIMARY_MENU`; `Footer` fetches `GET_FOOTER_DATA` + `GET_THEME_SETTINGS`

### Adding a New Page

1. Create the page template and ACF fields in WP admin with a template slug like `Template_NewPage`
2. Regenerate `schema.graphql` to confirm the new field names
3. Add the query to `lib/queries.ts` as a plain string constant
4. Create `app/slug/page.tsx` as an async Server Component that calls `client.query()`
5. Destructure `data?.page?.template?.newPage` — if a field is absent, hide that UI section rather than substituting hardcoded content

### Styling

Two-layer approach:

- **`app/globals.css`** — minimal base: Tailwind v4 import, CSS variables for bg/fg, font-family
- **Inline `<style>` tags** in page/component files — all complex component styles (cards, orbs, animations, marquees) live here, colocated with the component JSX

Tailwind CSS v4 (PostCSS plugin, no `tailwind.config.js`). Brand tokens: `yellow-400` / `#facc15` (accent), `#080808`/`#0a0a0a`/`#0f0f0f`/`#111` (dark backgrounds), `#F5F5F5` (light bg on root layout).

### Animation

Two Framer Motion wrapper components:

- **`SectionReveal`** (`components/SectionReveal.tsx`) — staggered children: wraps an array of children and animates each with `opacity 0→1, y 40→0` staggered at 0.12s. Use when animating a grid or list of items together.
- **`FadeIn`** (`components/FadeIn.tsx`) — single element fade-up with configurable `delay`, `duration`, `yOffset`. Use for standalone sections.

Both use `whileInView` with `once: true`.

### Theme Settings — Critical Gotcha

The ACF field group "Theme Setting" and the WPGraphQL options page share the same name, causing a GraphQL type conflict where all fields silently return null. The group's GraphQL field name was manually set to `themeOptions` in ACF → Field Groups → Theme Setting → GraphQL tab.

**Correct path:** `themeSetting { themeOptions { … } }`  
**Wrong (returns null):** `themeSetting { themeSetting { … } }`

All consumers (Header, Footer, home page) use `data?.themeSetting?.themeOptions`. If theme settings ever return null unexpectedly, verify the ACF GraphQL field name is still `themeOptions`.

### ACF Fields in WP Queries

ACF field names in GraphQL are camelCase versions of the WP field slugs — always verify in `schema.graphql` before writing a query. Image fields resolve as `{ node { sourceUrl } }`. Repeater fields resolve as arrays. Fields not yet created in WP can be added to the query commented out (see `faqItems` / `clientLogos` in the services and about queries).

### HTML from WordPress

Rich text fields from WP arrive as raw HTML strings. Use the `stripHtml()` helper (defined in `app/page.tsx`) for plain-text extraction. Raw HTML rendering must only be done with content from the trusted WP backend.
