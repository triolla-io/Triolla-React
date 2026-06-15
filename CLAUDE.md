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

**Next.js 16 App Router** with **headless WordPress + WPGraphQL** as the CMS backend. **All content must come from WordPress** — never hardcode text, images, links, or menu items in React code. On data absence render `null`; never substitute fallback strings.

### Data Fetching

Apollo Client v4 in Server Components. Query strings live in `lib/queries.ts`; pages wrap with `gql` at call-site. Response shape: `page.template.<TemplateName>.<fieldGroup>` (e.g. `Template_ServicePage → servicePage`). Wrap fetches in `try/catch`; hide sections on failure.

Read `schema.graphql` before writing any query — never guess field names. Regenerate it after adding ACF fields: `npx get-graphql-schema https://triolla.io/graphql > schema.graphql`. ACF fields are camelCase in GraphQL. Image fields: `{ node { sourceUrl } }`. Repeater fields: arrays.

### Internationalization (i18n)

Bilingual via a `[locale]` route segment: English is the default (prefix-free URLs, internal `/en`), Hebrew is served under `/he/` (`dir="rtl"`). Config in `lib/i18n.ts`; `middleware.ts` keeps English URLs clean and redirects `/en/...`. Hebrew content lives in the SAME WordPress install (WPML) and is fetched through the existing WPGraphQL endpoint by the page's Hebrew slug — see `PAGE_URI` in `lib/i18n.ts`. Add a route's Hebrew slug there to localize it. Assets differ per locale and come from whatever WP returns for that page; render `null` when absent — never reuse the English asset.

**Backend follow-up (not yet done):** Navigation menus and `themeSetting` are not translatable via WPGraphQL without the `wp-graphql-wpml` plugin. Until it is enabled, Header/Footer chrome renders English on `/he/`. Do not hardcode Hebrew chrome text.

### `use client` vs Server Components

Pages (`app/**/page.tsx`) are Server Components. Client components: `HeaderClient`, `HeroHeadline`, `SectionReveal`, `FadeIn`, `CountUpNumber`, `CookieBanner`, `FAQAccordion`, `PortfolioGrid`. `Header`/`Footer` are Server Components.

### Adding a New Page

1. Create the page template and ACF fields in WP admin with a template slug like `Template_NewPage`
2. Regenerate `schema.graphql` to confirm the new field names
3. Add the query to `lib/queries.ts` as a plain string constant
4. Create `app/slug/page.tsx` as an async Server Component that calls `client.query()`
5. Destructure `data?.page?.template?.newPage` — if a field is absent, hide that UI section rather than substituting hardcoded content
6. Style sections using the shared Design Language above — do not invent new type scales, spacings, or color values

### Styling

Two-layer approach:

- **`app/globals.css`** — minimal base: Tailwind v4 import, CSS variables for bg/fg, font-family
- **Inline `<style>` tags** in page/component files — all complex component styles (cards, orbs, animations, marquees) live here, colocated with the component JSX

Tailwind CSS v4 (PostCSS plugin, no `tailwind.config.js`). Brand tokens: `yellow-400` / `#facc15` (accent), `#080808`/`#0a0a0a`/`#0f0f0f`/`#111` (dark backgrounds), `#F5F5F5` (light bg on root layout).

### Design Language

All pages share a consistent visual language — do not invent new patterns.

**Typography**

| Role            | Classes                                                                   |
| --------------- | ------------------------------------------------------------------------- |
| Hero title      | `text-[clamp(2.2rem,10vw,110px)] font-bold tracking-tighter leading-none` |
| Section heading | `text-[clamp(2rem,8vw,5rem)] md:text-7xl font-bold tracking-tighter`      |
| Lead text       | `text-xl md:text-2xl text-gray-400 leading-relaxed font-light`            |
| Body            | `text-[17px] md:text-[22px] text-gray-300 leading-relaxed`                |
| Accent label    | `text-yellow-400 font-bold`                                               |

**Layout:** Padding `py-16 md:py-24` (standard) / `py-24`–`py-32` (hero). Between sections: `mb-16 md:mb-32`. Container: `max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8` (standard) / `max-w-[1600px] mx-auto px-4` (wide).

**Backgrounds & cards:** Dark bg: `#0a0a0a`/`#0f0f0f`/`#111`. Inverted card: `bg-white text-black rounded-[4rem]`. Dark cards: `rounded-2xl`/`rounded-3xl shadow-2xl`. Dividers: `border-t border-white/10` (dark) / `border-black/10` (light).

**Glow orbs:** One per dark hero section — `radial-gradient(ellipse at center, #facc15 0%, transparent 70%)`, `opacity: 0.04–0.08`, positioned `absolute top-0 left-1/2 -translate-x-1/2`, `aria-hidden="true"`.

**Images:** Always from WP `sourceUrl` — never local paths. Cards: `rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500`.

**CTAs:** Primary: `bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors`. Ghost: `text-gray-400 hover:text-white transition-colors`. Link lists: `border-b border-white/10 py-6`.

### Animation

- **`SectionReveal`** — staggered grid/list: `opacity 0→1, y 40→0` at 0.12s stagger
- **`FadeIn`** — single element with configurable `delay`, `duration`, `yOffset`

Both use `whileInView` with `once: true`.

### Theme Settings Gotcha

ACF field group name collision causes silent null returns. Always use `themeSetting { themeOptions { … } }` — not `themeSetting { themeSetting { … } }`. All consumers use `data?.themeSetting?.themeOptions`.

### HTML from WordPress

Use `stripHtml()` (in `app/page.tsx`) for plain-text extraction. Raw HTML rendering must only be done with content from the trusted WP backend.
