# Homepage WP Integration — Design Spec

_Date: 2026-05-17_

## Goal

Migrate the Next.js homepage, Header, and Footer to be fully driven by headless WordPress + WPGraphQL. No hardcoded content values in any shared component or the homepage. Styling remains in the Next.js codebase; all text, images, links, and config come from WP.

---

## Scope

- `components/Header.tsx` + new `components/HeaderClient.tsx`
- `components/Footer.tsx`
- `app/page.tsx` (homepage)
- `lib/queries.ts`
- One WP admin step (ThemeSetting GraphQL exposure)

Out of scope: other pages (`/about-us`, `/services`), contact form wiring, new WP ACF fields.

---

## Architecture

### Data source: ThemeSetting ACF Options page

All global site data (logos, phones, socials, mentions, WhatsApp, buttons, FAQ, contact info) lives in the WP ACF "Theme Setting" Options page. The GraphQL type is `ThemeSetting`.

**WP admin step required (done once):**

- ACF → Options Pages → "Theme Setting" → enable **Show in GraphQL**
- Set GraphQL field name (e.g. `themeSettings`)
- After saving, regenerate `schema.graphql`:
  ```bash
  npx get-graphql-schema https://triolla.io/graphql > schema.graphql
  ```
- Confirm root query path in WP GraphQL IDE before writing queries

The root query path will be something like:

```graphql
acfOptionsThemeSetting {
  themeSetting { ... }
}
```

Exact path must be verified from the regenerated schema.

### Navigation data source: WP Menus

- `PRIMARY_MENU` location → header desktop nav
- `MOBILE_HEADER_MENU` location → header mobile nav (falls back to PRIMARY_MENU if empty)
- Footer nav columns → existing `GET_FOOTER_DATA` query (menus by slug)

---

## Queries (`lib/queries.ts`)

### Delete

- `GET_FOOTER_OPTIONS` — uses `themeGeneralSettings > footerOptions` which doesn't exist in the schema. Replaced by `GET_THEME_SETTINGS`.

### Add: `GET_THEME_SETTINGS`

Fetches all global site config from the ThemeSetting options page. Fields needed:

```
# Header fields
siteLogo { node { sourceUrl altText } }
siteLogoWhite { node { sourceUrl altText } }
newsTicker
bookButton
bookButtonLink
bookButtonTarget
contactButton
contactButtonLink
whatsappNumber
whatsappMessage

# Footer fields
footerLogo { node { sourceUrl altText } }
footerMentionsLabel
mentionsLogos { fMentionName fMentionLink fMentionLogo { node { sourceUrl } } }
emailAddress
tlvOfficesLabel
tlvOfficesPhone
nyOfficesLabel
nyOfficesPhone
sqlink
facebookLink
instagramLink
tiktokLink
linkedinLink
socialMenuItems { platform url }
footerPrivacyText
footerPrivacyLink
footerTermText
footerTermLink
footmenuTitleOne
footmenuTitleTwo
footmenuTitleThree
footmenuTitleFour
footmenuTitleFive

# Homepage contact section
cCallUsLabel
cEmailAddress
cEmailLabel
cTlvLabel
cTlvNumber
cNyLabel
cNyNumber
cAddress
cAddressLabel

# Homepage FAQ section
faqHeading
faqShortText
questionAnswerList {
  fQuestion
  fAnswer
}
```

> Note: `mentionsLogos` and `socialMenuItems` sub-field names must be verified from the regenerated schema before implementation. Check `ThemeSettingMentionsLogos` and `ThemeSettingSocialMenuItems` types.

### Add: `GET_PRIMARY_MENU`

```graphql
primaryMenu: menu(id: "PRIMARY_MENU", idType: LOCATION) {
  menuItems { nodes { label url } }
}
mobileMenu: menu(id: "MOBILE_HEADER_MENU", idType: LOCATION) {
  menuItems { nodes { label url } }
}
```

---

## Header Component

### Problem

`Header.tsx` is a single `"use client"` component — can't `await` WP data inside it.

### Solution: Server/Client split

**`components/Header.tsx`** — async Server Component

- Calls `GET_THEME_SETTINGS` and `GET_PRIMARY_MENU`
- Extracts: logo URL, ticker text, nav items, mobile nav items, WhatsApp config, book/contact button config
- Renders `<HeaderClient>` with all data as props
- On fetch failure: passes empty/null props; HeaderClient hides sections gracefully

**`components/HeaderClient.tsx`** — `"use client"` component

- Receives all data as typed props (no WP fetching inside)
- Owns: sticky scroll behavior, mobile menu toggle, Framer Motion animations, active link detection
- Hardcoded removal: no more `CONTACT.whatsapp`, no Calendly URL constant, no `"Pitangoux is now Triolla"` string, no hardcoded nav links

**Props interface (HeaderClient):**

```ts
interface HeaderClientProps {
  logoUrl: string | null
  ticker: string | null
  navItems: { label: string; url: string }[]
  mobileNavItems: { label: string; url: string }[]
  whatsappHref: string | null // built from whatsappNumber + whatsappMessage
  bookButtonText: string | null
  bookButtonHref: string | null
  contactButtonText: string | null
  contactButtonHref: string | null
}
```

**URL construction (in Header.tsx server component):**

```ts
const whatsappHref = ts.whatsappNumber
  ? `https://wa.me/${ts.whatsappNumber}${ts.whatsappMessage ? `?text=${encodeURIComponent(ts.whatsappMessage)}` : ''}`
  : null
```

---

## Footer Component

### Changes to `components/Footer.tsx`

**Remove entirely:**

- `CONTACT` constant (lines 14–20)
- `SOCIALS` constant (lines 22–29)
- `MENTIONS` constant (lines 31–38)
- `SQLINK` constant (lines 40–43)
- CTA band section ("Let's work together / Ready to build something extraordinary?") — lines 275–316. This section does not exist in the original WP footer.
- Mobile CTA bar (`footmob-cta`) — audit against original; remove if not in original

**Replace with WP data from `GET_THEME_SETTINGS`:**

| Was hardcoded             | Now from ThemeSetting                           |
| ------------------------- | ----------------------------------------------- |
| Contact email             | `emailAddress`                                  |
| TLV phone                 | `tlvOfficesPhone` / `tlvOfficesLabel`           |
| NY phone                  | `nyOfficesPhone` / `nyOfficesLabel`             |
| WhatsApp URL              | built from `whatsappNumber` + `whatsappMessage` |
| Calendly/book URL         | `bookButtonLink`                                |
| Social links array        | `socialMenuItems` repeater                      |
| Media mentions array      | `mentionsLogos` repeater                        |
| "Featured In" label       | `footerMentionsLabel`                           |
| Sqlink URL                | `sqlink`                                        |
| Footer logo               | `footerLogo`                                    |
| Triolla logo (bottom bar) | `siteLogo`                                      |
| Privacy text + link       | `footerPrivacyText` + `footerPrivacyLink`       |
| Terms text + link         | `footerTermText` + `footerTermLink`             |
| Menu column headings      | `footmenuTitleOne`–`footmenuTitleFive`          |

**Menu columns:** `MENU_COLUMNS` fallback items (the `url`/`label` arrays) stay in code as last-resort UX fallbacks when WP menu returns empty. Column headings are replaced with ThemeSetting values.

**Both queries called in Footer:**

```ts
const [ts, wpMenus] = await Promise.all([
  getThemeSettings(), // GET_THEME_SETTINGS
  getFooterMenus(), // GET_FOOTER_DATA (existing)
])
```

---

## Homepage (`app/page.tsx`)

### A) Fix contact section (lines 395–490)

The right-side contact info cards are hardcoded with wrong values. Replace with ThemeSetting contact fields (fetched via `GET_THEME_SETTINGS`):

| Current hardcoded                               | Replace with                      |
| ----------------------------------------------- | --------------------------------- |
| `"Email Us"` / `contact@triolla.io`             | `cEmailLabel` / `cEmailAddress`   |
| `"Call Us (TLV)"` / `+972-73-744-3322`          | `cTlvLabel` / `cTlvNumber`        |
| Missing NY phone                                | `cNyLabel` / `cNyNumber`          |
| `"Drop By"` / `Yigal Alon St 98, Tel Aviv-Yafo` | `cAddressLabel` / `cAddress`      |
| `"Leave your details..."` subtext               | no WP field; keep as-is or remove |

"Give us a call:" heading on the right column: `cCallUsLabel`.

The contact form on the left side stays unchanged.

### B) Add FAQ section

Insert after the "Our unique Design Process" section (the `uDesignHeading` / `uSortText` / `designType` block).

- Section heading: `ThemeSetting.faqHeading`
- Section subtext: `ThemeSetting.faqShortText`
- FAQ items: `ThemeSetting.questionAnswerList` → map `{ fQuestion, fAnswer }` to `{ faqQuestion, faqAnswer }` for `FAQAccordion`

```tsx
{
  faqItems.length > 0 && (
    <section>
      <h2>{ts.faqHeading}</h2>
      {ts.faqShortText && <p>{ts.faqShortText}</p>}
      <FAQAccordion items={faqItems} />
    </section>
  )
}
```

Field name remap (schema → FAQAccordion props):

- `fQuestion` → `faqQuestion`
- `fAnswer` → `faqAnswer`

### C) Hero fallbacks

Empty the hardcoded fallback strings for `heroHeadline` and `heroSubtext`. If WP returns null, render nothing rather than substitute copy. Consistent with CLAUDE.md: "hide that UI section rather than substituting hardcoded content."

### Data fetching on homepage

`app/page.tsx` currently calls only `GET_HOME_PAGE`. Add `GET_THEME_SETTINGS` call:

```ts
const [homeData, themeSettings] = await Promise.all([
  getHomeData(), // existing
  getThemeSettings(), // new
])
```

---

## Error handling

All WP fetches wrapped in `try/catch` returning `null` or `{}` on failure. Components check for null before rendering a section. No fallback hardcoded content — missing WP data = section not rendered.

---

## Files changed

| File                          | Change                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `lib/queries.ts`              | Delete `GET_FOOTER_OPTIONS`; add `GET_THEME_SETTINGS`, `GET_PRIMARY_MENU`          |
| `components/Header.tsx`       | Rewrite as async Server Component; fetches data; renders HeaderClient              |
| `components/HeaderClient.tsx` | New file; `"use client"`; all interactivity; receives data as props                |
| `components/Footer.tsx`       | Remove CTA band + hardcoded constants; fetch ThemeSetting; use WP data             |
| `app/page.tsx`                | Add ThemeSetting fetch; fix contact section; add FAQ section; empty hero fallbacks |
| `schema.graphql`              | Regenerate after WP admin ThemeSetting config change                               |

---

## Open questions (resolve during implementation)

1. **ThemeSetting root query field name** — verify from regenerated `schema.graphql` after WP admin change
2. **`mentionsLogos` sub-field names** — check `ThemeSettingMentionsLogos` type in regenerated schema
3. **`socialMenuItems` sub-field names** — check `ThemeSettingSocialMenuItems` type in regenerated schema
4. **`MOBILE_HEADER_MENU` content** — if empty in WP, fall back to `PRIMARY_MENU` items
5. **Footer mobile CTA bar** — confirm whether it exists in the original WP footer before deciding to keep or remove
