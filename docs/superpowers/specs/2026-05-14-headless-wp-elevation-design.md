# Headless WP Frontend Elevation Design

**Date:** 2026-05-14  
**Scope:** Existing pages — Layout (Header/Footer), Homepage, Services, About Us  
**Goal:** Audit and elevate to be visually superior to triolla.io — modern, animated, and complete (including missing FAQ and client logo sections)

---

## Approach

Shared component library + pages pass (Approach B). Build reusable animated components first, apply them across all existing pages, fill in data gaps from WP GraphQL.

---

## 1. Shared Component System

### New components in `components/`

#### `SectionReveal.tsx` (client component)
- Wraps a list of children and staggers their `whileInView` entrance
- Each child: `opacity: 0 → 1`, `y: 40 → 0`, easeOut over 0.6s
- Stagger delay: 0.12s between children
- `viewport={{ once: true, margin: "-80px" }}`
- Used for: cards grids, list rows, image collages, logo strips

#### `FAQAccordion.tsx` (client component)
- Props: `items: { question: string; answer: string }[]`
- Each item: click to expand/collapse with Framer Motion `AnimatePresence`
- Answer panel: animated height (overflow hidden, `initial={{ height: 0 }}` → `animate={{ height: "auto" }}`) + opacity fade
- Chevron icon rotates 180° on open via `motion.div` rotate transition
- Only one item open at a time

#### `ClientLogoStrip.tsx` (client component)
- Props: `logos: { sourceUrl: string; name: string }[]`
- Renders a responsive logo grid
- Each logo: grayscale by default, transitions to full color + opacity 1 on hover
- Entrance: `SectionReveal` stagger on scroll

`FadeIn` remains unchanged for single-element reveals.

---

## 2. Data Layer (`lib/queries.ts`)

### Additions to `GET_SERVICES_PAGE` inside `servicePage { ... }`
```graphql
faqItems {
  faqQuestion
  faqAnswer
}
clientLogos {
  logoImage { node { sourceUrl } }
  logoName
}
```

### Additions to `GET_ABOUT_PAGE` inside `aboutPage { ... }`
```graphql
faqItems {
  faqQuestion
  faqAnswer
}
clientLogos {
  logoImage { node { sourceUrl } }
  logoName
}
```

> **Note:** Exact ACF field names must be confirmed against the live WP GraphQL schema (introspect or test query) before implementation. Pattern is consistent with existing fields.

No changes to `lib/apollo-client.ts` or query file structure.

---

## 3. Page-by-Page Changes

### Header (`components/Header.tsx`)
- Import `usePathname` from `next/navigation` to derive active route
- Active nav link: yellow dot/underline indicator using conditional class
- Mobile menu: wrap in `AnimatePresence`, replace instant show/hide with a `motion.div` slide-down (`y: -20 → 0`, opacity fade, 0.2s)

### Footer (`components/Footer.tsx`)
- No structural changes needed — solid implementation
- Media mention logos (13TV, BIZPORTAL, etc.) are currently text placeholders; swap to real `<img>` tags when assets are available (out of scope for this pass)

### Homepage (`app/page.tsx`)
Currently hardcoded — no WP data connection in this pass.

| Section | Change |
|---|---|
| Hero headline | Word-by-word stagger on page load (not scroll-triggered). Split headline text by spaces, each word is a `motion.span` with staggered `opacity` + `y` entrance |
| Hero subtext | Fades in after headline completes (0.4s delay) |
| Portfolio grid | Wrap with `SectionReveal` — images reveal staggered |
| Feature cards | Wrap with `SectionReveal` — 4 cards stagger in |
| Awards numbers | Count-up animation (0 → final value) triggered `whileInView` using a `useEffect` counter |
| Process timeline steps | Each step node reveals sequentially as it enters viewport |
| Contact form fields | Each input fades in staggered with `SectionReveal` |

### Services Page (`app/services/page.tsx`)
| Section | Change |
|---|---|
| All 3 content sections | Wrap titles, text, and image collages with `SectionReveal` |
| Image collages | Add subtle scroll-driven vertical parallax offset on the stacked/offset images |
| New: `ClientLogoStrip` | Added after Technology section, fed from `sp.clientLogos` |
| New: `FAQAccordion` | Final section before page end, fed from `sp.faqItems` |

### About Page (`app/about-us/page.tsx`)
| Section | Change |
|---|---|
| Hero | Title + subtitle stagger entrance on load |
| Services list rows | `SectionReveal` stagger |
| Partner cards grid | `SectionReveal` stagger |
| Learn slider | Upgrade from `overflow-x-auto` div to Framer Motion `drag="x"` carousel with prev/next buttons, drag constraints, and momentum |
| New: `ClientLogoStrip` | After learn slider section, fed from `ap.clientLogos` |
| New: `FAQAccordion` | Final section, fed from `ap.faqItems` |

---

## 4. Animation Token Summary

| Token | Value |
|---|---|
| Reveal duration | 0.6s |
| Reveal easing | easeOut |
| Stagger delay | 0.12s between children |
| UI transitions (hover, open/close) | 0.2s |
| Hero entrance delay (first word) | 0s, subsequent +0.08s per word |
| Count-up duration | 1.5s |
| Viewport margin | -80px (fire slightly before fully in view) |

---

## 5. Out of Scope (This Pass)

- Homepage WP GraphQL connection (hardcoded content stays)
- New pages: Portfolio, Technology, Contact Us
- Footer media logo images (text placeholders remain)
- CookieBanner changes
- Any WP admin / ACF schema changes (assumed complete)
