# Blog Page — Design Spec

**Date:** 2026-06-14
**Status:** Approved for planning
**Scope:** Add the blog listing page and single blog post pages, missing from the new site. Port every content element from the original `https://triolla.io/blog/` (and its post pages), restyled to the new site's dark brand design language. All content from WordPress; no hardcoded copy.

---

## 1. Background

The original site has a blog ("Wisdom Hub") at `/blog/` plus individual article pages at `/blog/<slug>/`. The new React site never ported these. The WP backend already exposes everything needed:

- A WP **Page** at `/blog/` using the **`Template_BlogPage`** template, carrying an ACF group **`blogPageFields`**.
- The standard WPGraphQL **`posts`** connection (101 published posts).
- Each **`Post`** carries standard fields plus an ACF group **`postFields`**.

### 1.1 Category finding (important)

The footer's `blog-menu` column is **not** a taxonomy. The WP backend has exactly **one** real category — "Uncategorized" (count 101). The `blog-menu` items are 7 **curated links**:

| Label             | Target                                                           |
| ----------------- | ---------------------------------------------------------------- |
| All Blogs         | `https://triolla.io/blog`                                        |
| Fintech & Finance | `https://triolla.io/blog/the-fintech-ux-playbook/`               |
| IOT & Devices     | `https://triolla.io/blog/designing-intuitive-and-secure-iot-...` |
| SaaS              | `https://triolla.io/blog/the-3-most-common-pain-points-...`      |
| Gaming            | `https://triolla.io/blog/level-up-your-gaming-app-...`           |
| Medical           | `https://triolla.io/blog/ux-in-medtech-...`                      |
| Agritech          | `https://triolla.io/blog/designing-an-engaging-...`              |

Each "vertical" points at **one representative post**, not a category archive. Therefore:

- **No taxonomy filter chips** on the listing (there is no real taxonomy to filter by). The original `/blog/` itself shows a single flat grid, so this also matches the source.
- The real requirement surfaced by the footer is that these `/blog/<slug>` links **resolve to local pages** — which is exactly why single-post pages are in scope.

---

## 2. Goals & Non-Goals

**Goals**

- `/blog` listing page mirroring the original "Wisdom Hub": hero + flat post grid + "Load More" + contact CTA + footer.
- `/blog/<slug>` single-post pages mirroring the original article layout: hero + article body + "More Posts" + contact CTA + footer.
- Footer `blog-menu` links under `/blog/` resolve to the new local pages.
- All content from WP. Absent field → render `null`, never a hardcoded fallback string.
- `npx react-doctor@latest` reports **100/100**.
- `.prettierrc` formatting applied to every touched file.

**Non-Goals**

- No category/taxonomy filtering UI (see §1.1).
- No search, no author bio block, no comments (none present on the source).
- No new design tokens, type scales, spacings, or colors — reuse the existing Design Language (CLAUDE.md).
- No changes to `app/[slug]` portfolio routing.

---

## 3. Routing & Rendering

| Route                   | File                       | Type                            | Data                                                   |
| ----------------------- | -------------------------- | ------------------------------- | ------------------------------------------------------ |
| `/blog`                 | `app/blog/page.tsx`        | Server Component                | `Template_BlogPage` page + first page of `posts`       |
| `/blog/<slug>`          | `app/blog/[slug]/page.tsx` | Server Component + static params | single `Post` by uri + a few related posts             |

- A **dedicated static `app/blog/` folder** is used (not the dynamic `app/[slug]`), per the CLAUDE.md "Adding a New Page" convention. Static folders take Next.js precedence; `app/[slug]` continues to resolve only `Template_PortfolioPage`.
- `app/blog/[slug]/page.tsx` uses `generateStaticParams()` over all post slugs and sets `export const dynamicParams = false`, so only real post slugs resolve and everything else 404s — mirroring the portfolio route's pattern.
- Post slug: WP `Post.uri` is `/blog/<slug>/`. `generateStaticParams` strips the leading `blog/` and surrounding slashes to yield `{ slug }`. The page query looks the post up by its full uri (`/blog/<slug>/`).
- Both routes wrap data fetches in `try/catch`; on failure a section renders `null` (never a crash, never placeholder copy). If the whole post lookup returns null → `notFound()`.

---

## 4. Data Layer (`lib/queries.ts` + `lib/graphql-types.ts`)

Read `schema.graphql` before writing each query; never guess field names. Add these plain-string query constants and matching TS response types.

### 4.1 `GET_BLOG_PAGE`

Fetches the listing hero from the `Template_BlogPage` page (`uri: "/blog/"`):

```
page(id:"/blog/", idType:URI) {
  template {
    ... on Template_BlogPage {
      blogPageFields {
        headerTitle
        shortText
        boldText
        buttonText
        moreText
        headerBgColor
        headerBgOverlayLayer { node { sourceUrl altText } }
      }
    }
  }
}
```

### 4.2 `GET_BLOG_POSTS` (paginated)

Cursor pagination for the grid and "Load More". Variables `$first: Int`, `$after: String`:

```
posts(first:$first, after:$after, where:{ status:PUBLISH, orderby:{ field:DATE, order:DESC } }) {
  pageInfo { hasNextPage endCursor }
  nodes {
    id
    title
    uri
    date
    featuredImage { node { sourceUrl altText } }
  }
}
```

### 4.3 `GET_POST_SLUGS`

All published post uris for `generateStaticParams` (paginate to cover all 101 if a single request is capped):

```
posts(first:200, where:{ status:PUBLISH }) { nodes { uri } }
```

### 4.4 `GET_POST_BY_URI`

Single article by uri (variable `$uri: ID!`, `idType: URI`):

```
post(id:$uri, idType:URI) {
  title
  content
  date
  uri
  featuredImage { node { sourceUrl altText } }
  postFields { topBoldText }
}
```

"More Posts" reuses `GET_BLOG_POSTS` (first 3, excluding the current post by uri in the component).

> ACF reminder: `postFields` only exposes `topBoldText` (wysiwyg). `blogPageFields` exposes the seven fields above. Field names verified against `schema.graphql`.

---

## 5. Components

### New

| Component       | File                            | Client? | Responsibility                                                                                                   |
| --------------- | ------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `BlogPostCard`  | `components/BlogPostCard.tsx`   | No      | One post: featured image + title, linking to `/blog/<slug>`. `rounded-2xl shadow-2xl hover:scale-105`. Renders `null` if no title/uri. Shared by the grid and "More Posts". |
| `BlogPostGrid`  | `components/BlogPostGrid.tsx`   | Yes     | Renders the initial server-provided posts, then fetches more via Apollo cursor pagination on "Load More". Hides the button when `hasNextPage` is false. Button label from `buttonText`/`moreText`. |
| `BlogArticle`   | `components/BlogArticle.tsx`    | No      | Single-post hero + body: back link, title, featured image, `topBoldText` intro, then sanitized WP `content`. Reuses the `LegalArticle` HTML parser + `DROP_TAGS` allowlist (extract into a shared helper if cleaner than duplicating). |

### Reused (no change)

- `WannaChatSection` — contact CTA on both pages, wired from theme settings exactly as `app/page.tsx` does (`contactItems`, `leftHeading`, `formHeading`, `submitLabel`, `callUsLabel`, `fallbackEmail`).
- `GlowOrb`, `Eyebrow`, `SectionReveal`/`FadeIn`, `Footer`, `Header` (Header/Footer already in the root layout).
- `LegalArticle`'s parser/allowlist as the basis for rendering WP post `content` (sanitized; the WP backend is trusted).

### Changed

- `components/Footer.tsx` — for `blog-menu` items whose URL path begins with `/blog`, render a local `next/link` href (via `deriveUri` → `/<path>`) instead of the absolute `triolla.io` URL, so they resolve to the new pages. Non-blog footer links are unaffected.

---

## 6. Styling (align to existing Design Language)

No new tokens. Use the shared scales from CLAUDE.md:

- **Listing hero:** dark bg `#0a0a0a`/`#0f0f0f`; section heading scale `text-[clamp(2rem,8vw,5rem)] md:text-7xl font-bold tracking-tighter`; lead text `text-xl md:text-2xl text-gray-400 font-light`; one `GlowOrb` (yellow radial, `opacity 0.04–0.08`, `aria-hidden`). Optional `headerBgOverlayLayer` image behind the hero.
- **Grid:** `max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8`, responsive columns (`grid sm:grid-cols-2 lg:grid-cols-3 gap-...`), `py-16 md:py-24`. Cards use `rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500`, images from WP `sourceUrl` only.
- **Load More:** primary CTA style `bg-yellow-400 text-black font-bold hover:bg-yellow-300`.
- **Single post:** article body styled like `LegalArticle` (brand-styled headings, paragraphs, lists, links on dark bg). Back-to-blog as a ghost link `text-gray-400 hover:text-white`.
- **Component CSS** lives in colocated inline `<style>` tags, per the project's two-layer styling approach.

---

## 7. Edge Cases & Error Handling

- Listing page query fails → hero hidden, grid hidden; page still renders shell (CTA + footer). No placeholder copy.
- A post lacks a featured image or title → `BlogPostCard` returns `null` for that card.
- Single post not found → `notFound()` (404).
- Post `content` empty → article body hidden; hero/intro still render if present.
- "Load More" when `hasNextPage` is false → button not rendered.
- Hebrew-titled posts exist (RTL content in `title`/`content`) — render as-is from WP; no special handling required, but do not break layout.

---

## 8. Verification (definition of done)

1. `/blog` renders hero + grid; "Load More" loads additional posts; all text/images come from WP.
2. `/blog/<slug>` renders for real post slugs (incl. the 6 footer-linked posts); unknown slugs 404.
3. Footer `blog-menu` links navigate to local `/blog/...` pages.
4. No hardcoded content strings anywhere in the new code.
5. `npm run lint` passes; `npm run build` succeeds.
6. `npx react-doctor@latest` = **100/100**.
7. `.prettierrc` (printWidth 140, single quotes, no semis, trailing commas, 2-space tabs) applied to every touched file.

---

## 9. Open Questions

None outstanding. Taxonomy filtering resolved (dropped per §1.1); content rendering approach (reuse `LegalArticle` parser) confirmed.
