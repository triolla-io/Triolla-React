# Portfolio Dynamic Pages + Mega-Menu Promo Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-off `/cyber-security` page with a single WordPress-driven dynamic route that renders all 14 portfolio-template pages, and add a beautifully presented promo card to the Portfolio mega-menu dropdown.

**Architecture:** A new `app/[slug]/page.tsx` enumerates every page on `Template_PortfolioPage` via `generateStaticParams` (zero hardcoded slugs) and renders a shared, server-component `PortfolioTemplate` extracted verbatim from the current cyber-security page — so all 14 categories keep their own per-page accent color with no visual regression. Static route folders (`about-us`, `services`, `technology`) take Next.js precedence over the dynamic segment, so the deleted `cyber-security` folder is served by `[slug]`. Phase 2 upgrades `DropdownItem` to render a content-driven promo pane (shown only when a dropdown has >6 children) sourced from the existing `themeOptions.menuBackgroundImage`.

**Tech Stack:** Next.js 16 App Router (Server Components, async `params`, `generateStaticParams`, `dynamicParams`), Apollo Client v4, WPGraphQL, `html-react-parser`, `motion/react`, Tailwind CSS v4.

> **No test suite.** Per CLAUDE.md this project has no test runner. Verification is done with `npm run lint`, `npm run build` (which exercises `generateStaticParams` against live WP), and route HTTP-status + visual checks against `npm run dev`. There are no unit-test steps — the build and route checks are the verification gates.

---

## File Structure

| File                               | Responsibility                                                                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/queries.ts`                   | Add `GET_PORTFOLIO_SLUGS` (enumerate template pages) + `GET_PORTFOLIO_PAGE($uri)` (parameterized fetch); add `menuBackgroundImage` to `GET_THEME_SETTINGS`; remove `GET_CYBER_SECURITY_PAGE`. |
| `components/PortfolioTemplate.tsx` | **New.** Shared server component holding the entire render body + helpers (`stripHtml`, `htmlToLines`, `parseAccentHeading`) extracted from the cyber-security page. Props: `pf`, `ts`.       |
| `app/[slug]/page.tsx`              | **New.** Thin dynamic route: `generateStaticParams`, `dynamicParams = false`, fetch-by-slug, `notFound()` on empty, render `<PortfolioTemplate>`.                                             |
| `app/cyber-security/page.tsx`      | **Deleted.** Replaced by the dynamic route.                                                                                                                                                   |
| `components/Header.tsx`            | Pass `menuPromoImage` from `themeOptions.menuBackgroundImage` into `HeaderClient`.                                                                                                            |
| `components/HeaderClient.tsx`      | Add `menuPromoImage` prop; thread to `DropdownItem`; render the conditional promo pane with viewport-clamped positioning.                                                                     |

---

## Phase 1 — Dynamic Portfolio Route

### Task 1: Add portfolio queries and theme promo field to `lib/queries.ts`

**Files:**

- Modify: `lib/queries.ts` (add two constants, extend `GET_THEME_SETTINGS`, remove `GET_CYBER_SECURITY_PAGE`)

- [ ] **Step 1: Add `menuBackgroundImage` to the `GET_THEME_SETTINGS` selection**

In `lib/queries.ts`, find the `commonGridOneMobile` line inside `GET_THEME_SETTINGS.themeOptions` (around line 214) and add the promo field directly after it.

Replace:

```
        commonGridOneImage { node { sourceUrl } }
        commonGridOneMobile { node { sourceUrl } }
      }
    }
  }
`;
```

with:

```
        commonGridOneImage { node { sourceUrl } }
        commonGridOneMobile { node { sourceUrl } }
        menuBackgroundImage { node { sourceUrl } }
      }
    }
  }
`;
```

- [ ] **Step 2: Replace `GET_CYBER_SECURITY_PAGE` with `GET_PORTFOLIO_SLUGS` + `GET_PORTFOLIO_PAGE`**

Delete the entire `GET_CYBER_SECURITY_PAGE` constant (lines ~235–273) and replace it with the two constants below. The `portfolioFields` selection set is **identical** to the old query (the render logic is unchanged), only the query is now parameterized by `$uri` and a sibling enumeration query is added.

```ts
export const GET_PORTFOLIO_SLUGS = `
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
`;

export const GET_PORTFOLIO_PAGE = `
  query GetPortfolioPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      template {
        ... on Template_PortfolioPage {
          portfolioFields {
            headerTitle
            headerSubText
            boldText
            shortText
            moreText
            buttonText
            pPartnerButton
            partnerWithUsText
            uDesignHeading
            uSortText
            whyDoHeading
            headerBgColor
            headerBgOverlayLayer { node { sourceUrl } }
            designType { dName }
            companyList { companyName }
            whyDoList { whyTitle whyShortText }
            gImageList { gImage { node { sourceUrl } } }
            portfolioList {
              pTitle
              sortText
              pTags { tagName }
              pImage { node { sourceUrl } }
              pImageMob { node { sourceUrl } }
              pLogo { node { sourceUrl } }
              popupTopText
              popupGalleryImages { galleryImage { node { sourceUrl } } }
            }
          }
        }
      }
    }
  }
`;
```

- [ ] **Step 3: Verify lint passes (no dangling references yet — the cyber-security page still imports the removed constant)**

The cyber-security page (`app/cyber-security/page.tsx`) still imports `GET_CYBER_SECURITY_PAGE`, which no longer exists. **Do not lint or build between Task 1 and Task 4** — Tasks 2–4 are a single atomic refactor. Proceed directly to Task 2. (The first green build is the Task 5 gate.)

- [ ] **Step 4: Commit**

```bash
git add lib/queries.ts
git commit -m "feat(queries): add parameterized portfolio queries and menu promo field"
```

---

### Task 2: Create the shared `PortfolioTemplate` component

**Files:**

- Create: `components/PortfolioTemplate.tsx`

This is a **server component** (no `"use client"`) — it only composes JSX, an inline `<style>`, `html-react-parser`, and already-client child components (`FadeIn`, `SectionReveal`, `CountUpNumber`, `WannaChatSection`). The body is moved verbatim from `app/cyber-security/page.tsx`; only the function signature changes (it now receives `pf` and `ts` as props instead of fetching) and the helpers move in with it.

- [ ] **Step 1: Write the full component**

Create `components/PortfolioTemplate.tsx` with this exact content:

```tsx
import { FadeIn } from "@/components/FadeIn";
import { SectionReveal } from "@/components/SectionReveal";
import { WannaChatSection } from "@/components/WannaChatSection";
import { CountUpNumber } from "@/components/CountUpNumber";
import parse from "html-react-parser";

function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .trim();
}

function htmlToLines(html: string): string[] {
  return (html ?? "")
    .split(/<br\s*\/?>/gi)
    .map((s) => stripHtml(s).trim())
    .filter(Boolean);
}

function parseAccentHeading(html: string): { text: string; accent: boolean }[] {
  const cleaned = (html ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ");
  const segments = cleaned.split(/(<span[^>]*>[\s\S]*?<\/span>)/i);
  return segments
    .filter((s) => s.length > 0)
    .map((seg) => {
      const inner = seg.match(/^<span[^>]*>([\s\S]*?)<\/span>$/i);
      return inner
        ? { text: inner[1], accent: true }
        : { text: seg, accent: false };
    });
}

export function PortfolioTemplate({ pf, ts }: { pf: any; ts: any }) {
  const contactItems = [
    ts?.cEmailLabel && ts?.cEmailAddress
      ? {
          label: ts.cEmailLabel,
          value: ts.cEmailAddress,
          href: `mailto:${ts.cEmailAddress}`,
        }
      : null,
    ts?.cTlvLabel && ts?.cTlvNumber
      ? {
          label: ts.cTlvLabel,
          value: ts.cTlvNumber,
          href: `tel:${ts.cTlvNumber.replace(/[^+\d]/g, "")}`,
        }
      : null,
    ts?.cNyLabel && ts?.cNyNumber
      ? {
          label: ts.cNyLabel,
          value: ts.cNyNumber,
          href: `tel:${ts.cNyNumber.replace(/[^+\d]/g, "")}`,
        }
      : null,
    ts?.cAddressLabel && ts?.cAddress
      ? { label: ts.cAddressLabel, value: ts.cAddress, href: undefined }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  const portfolioItems: any[] = pf.portfolioList ?? [];
  const designSteps: any[] = pf.designType ?? [];
  const whyItems: any[] = pf.whyDoList ?? [];
  const companies: any[] = pf.companyList ?? [];
  const accentColor: string = pf.headerBgColor ?? "#fed125";
  const designHeadingParts = parseAccentHeading(pf.uDesignHeading ?? "");
  const marqueeItems = [...companies, ...companies];

  return (
    <main className="overflow-hidden bg-[#080808] text-white">
      <style>{`
        /* ─── Hero ───────────────────────────────── */
        .cs-hero-dots {
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .cs-hero-glow {
          background: radial-gradient(circle at 70% 30%, ${accentColor}22 0%, transparent 60%);
        }

        /* ─── Portfolio cards ────────────────────── */
        .cs-p-card {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 48px 0;
        }
        .cs-p-card:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cs-p-img {
          border-radius: 18px;
          overflow: hidden;
          background: #111;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
        }
        .cs-p-img img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cs-p-card:hover .cs-p-img img {
          transform: scale(1.025);
        }
        .cs-tag {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid rgba(250,204,21,0.3);
          color: #facc15;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: background 0.2s;
        }
        .cs-tag:hover {
          background: rgba(250,204,21,0.1);
        }

        /* ─── Design process ─────────────────────── */
        .cs-step {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px 24px 32px;
          background: #0d0d0d;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .cs-step:hover {
          border-color: ${accentColor}55;
          background: #111;
          transform: translateY(-3px);
        }
        .cs-step-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: ${accentColor};
          margin-bottom: 14px;
          display: block;
        }

        /* ─── Why cards ──────────────────────────── */
        .cs-why-card {
          position: relative;
          overflow: hidden;
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 40px 36px 36px;
          transition: transform 0.4s cubic-bezier(.23,1,.32,1),
                      border-color 0.4s,
                      box-shadow 0.4s;
        }
        .cs-why-card:hover {
          transform: translateY(-7px);
          border-color: ${accentColor}55;
          box-shadow: 0 24px 64px rgba(0,0,0,0.45),
                      0 0 0 1px ${accentColor}18,
                      0 0 40px ${accentColor}0a;
        }
        .cs-why-card__ghost {
          position: absolute;
          top: -10px;
          right: 20px;
          font-size: 96px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.04em;
          color: rgba(255,255,255,0.028);
          pointer-events: none;
          user-select: none;
        }
        .cs-why-card__bar {
          width: 28px;
          height: 2.5px;
          background: ${accentColor};
          border-radius: 2px;
          margin-bottom: 24px;
          transition: width 0.4s cubic-bezier(.23,1,.32,1);
          box-shadow: 0 0 10px ${accentColor}66;
        }
        .cs-why-card:hover .cs-why-card__bar {
          width: 52px;
        }
        .cs-why-card__shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            125deg,
            transparent 30%,
            rgba(255,255,255,0.025) 50%,
            transparent 70%
          );
          background-size: 300% 100%;
          background-position: 200% 0;
          transition: background-position 0.7s ease;
          pointer-events: none;
          border-radius: inherit;
        }
        .cs-why-card:hover .cs-why-card__shine {
          background-position: -100% 0;
        }

        /* ─── Companies marquee ──────────────────── */
        @keyframes cs-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cs-marquee-track {
          display: flex;
          white-space: nowrap;
          animation: cs-marquee 40s linear infinite;
          will-change: transform;
        }
        .cs-marquee-track:hover {
          animation-play-state: paused;
        }

        /* ─── Stat title ────────────────────────── */
        .cs-stat-num {
          font-size: clamp(96px, 14vw, 180px);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.04em;
          color: ${accentColor};
          text-shadow:
            0 0 60px ${accentColor}55,
            0 0 140px ${accentColor}22;
          display: inline-block;
        }
        .cs-stat-line {
          display: block;
          width: 2px;
          height: 72px;
          background: linear-gradient(to bottom, ${accentColor}, transparent);
          margin: 28px auto;
          border-radius: 2px;
        }

        /* ─── Grid images ────────────────────────── */
        .cs-grid-img {
          border-radius: 14px;
          overflow: hidden;
          background: #111;
        }
        .cs-grid-img img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.65s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cs-grid-img:hover img {
          transform: scale(1.06);
        }

        /* ─── Timeline (design process) ─────────── */
        .cs-timeline-item {
          position: relative;
          padding-top: 32px;
        }
        .cs-timeline-item__bg-num {
          position: absolute;
          top: -16px;
          left: -16px;
          font-size: 120px;
          font-weight: 900;
          color: rgba(255,255,255,0.025);
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }
        .cs-timeline-item__dot {
          width: 14px; height: 14px;
          background: ${accentColor};
          border-radius: 50%;
          box-shadow: 0 0 0 4px ${accentColor}26, 0 0 20px ${accentColor}4d;
        }
        .cs-timeline-item__line {
          position: absolute;
          top: 38px;
          left: 14px;
          height: 1px;
          right: -32px;
          background: linear-gradient(to right, ${accentColor}4d, rgba(255,255,255,0.05));
        }
        .cs-hide-scrollbar::-webkit-scrollbar { display: none; }
        .cs-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ─── CTA strip ──────────────────────────── */
        .cs-cta-strip {
          background: linear-gradient(135deg, #111 0%, #0d0d0d 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
        }
      `}</style>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative flex flex-col justify-end pt-32 pb-16 overflow-hidden">
        <div className="cs-hero-dots absolute inset-0 z-0" />
        <div className="cs-hero-glow absolute inset-0 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
          <FadeIn delay={0.05} yOffset={20}>
            <span
              className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.14em] uppercase px-4 py-2 rounded-full mb-8"
              style={{ background: `${accentColor}18`, color: accentColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accentColor }}
              />
              {pf.headerSubText}
            </span>
          </FadeIn>

          <FadeIn delay={0.12} yOffset={30}>
            <h1 className="text-[clamp(68px,11.5vw,180px)] font-black tracking-[-0.03em] leading-[0.88] mb-12 text-white">
              {pf.headerTitle}
            </h1>
          </FadeIn>

          <FadeIn delay={0.22} yOffset={20}>
            <div className="flex justify-end border-t border-white/10 pt-8">
              <a
                href="#portfolio"
                className="inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.06em] uppercase px-7 py-3.5 rounded-full shrink-0 transition-opacity hover:opacity-80"
                style={{ background: accentColor, color: "#000" }}
              >
                {pf.buttonText}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          INTRO
      ════════════════════════════════════════════ */}
      <section className="py-28 max-w-[1400px] mx-auto px-6 lg:px-10 border-t border-white/[0.07]">
        <FadeIn className="mb-8">
          <h2 className="text-[clamp(28px,3.8vw,52px)] font-bold tracking-tight leading-[1.1] text-white max-w-3xl">
            {pf.boldText}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1} className="mb-4">
          <p className="text-[19px] leading-relaxed text-gray-300 font-medium max-w-3xl">
            {pf.shortText}
          </p>
        </FadeIn>
        <FadeIn delay={0.18}>
          {/* WP-sourced HTML — trusted backend only */}
          <div className="text-[16px] leading-[1.85] text-gray-400 max-w-3xl">
            {parse(pf.moreText ?? "")}
          </div>
        </FadeIn>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE BANNER
      ════════════════════════════════════════════ */}
      <div className="overflow-hidden border-t border-b border-white/[0.07] py-5">
        <div className="cs-marquee-track">
          {marqueeItems.map((c: any, i: number) => (
            <span
              key={i}
              className="text-[13px] font-semibold tracking-[0.06em] uppercase text-gray-600 mx-6 shrink-0"
            >
              {c.companyName}
              <span className="ml-12 text-gray-800">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PORTFOLIO CASE STUDIES
      ════════════════════════════════════════════ */}
      <section
        id="portfolio"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-28 border-t border-white/[0.07]"
      >
        {/* ── Stat title ── */}
        <FadeIn className="pt-20 pb-4 text-center">
          <div className="cs-stat-num">
            <CountUpNumber target={50} suffix="+" duration={1800} />
          </div>
          <span className="cs-stat-line" aria-hidden="true" />
          <p className="text-[clamp(22px,3.2vw,44px)] font-bold tracking-tight text-white leading-tight">
            {(pf.partnerWithUsText ?? "").replace(/^\d+\+?\s*/, "")}
          </p>
        </FadeIn>

        {portfolioItems.map((item: any, i: number) => {
          const isEven = i % 2 === 0;
          return (
            <div key={i} className="cs-p-card">
              <div
                className={`flex flex-col lg:gap-16 lg:items-center ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                {/* Text panel — vertically centered against image */}
                <FadeIn
                  xOffset={isEven ? -40 : 40}
                  yOffset={0}
                  duration={0.7}
                  delay={0.05}
                  className="lg:w-[40%] shrink-0 flex flex-col gap-5 py-8"
                >
                  {item.pLogo?.node?.sourceUrl && (
                    <img
                      src={item.pLogo.node.sourceUrl}
                      alt=""
                      className="h-12 object-contain self-start"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  )}
                  <h3 className="text-[20px] font-bold leading-snug text-white tracking-tight">
                    {item.pTitle}
                  </h3>
                  {/* WP-sourced HTML — trusted backend only */}
                  <div className="text-[15px] text-gray-400 leading-relaxed">
                    {parse(item.sortText ?? "")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(item.pTags ?? []).map((tag: any, ti: number) => (
                      <span key={ti} className="cs-tag">
                        {tag.tagName}
                      </span>
                    ))}
                  </div>
                </FadeIn>

                {/* Image panel */}
                <FadeIn
                  xOffset={isEven ? 40 : -40}
                  yOffset={0}
                  duration={0.7}
                  delay={0.1}
                  className="lg:w-[60%] cs-p-img"
                >
                  {item.pImage?.node?.sourceUrl && (
                    <img
                      src={item.pImage.node.sourceUrl}
                      alt={stripHtml(item.pTitle ?? "")}
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  )}
                </FadeIn>
              </div>
            </div>
          );
        })}
      </section>

      {/* ════════════════════════════════════════════
          DESIGN PROCESS
      ════════════════════════════════════════════ */}
      <section className="py-28 bg-[#0a0a0a] border-t border-white/[0.07]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <SectionReveal className="mb-5">
            {[
              <h2
                key="h"
                className="text-[clamp(36px,5vw,70px)] font-black tracking-[-0.03em] leading-tight"
              >
                {designHeadingParts.map((seg, i) =>
                  seg.accent ? (
                    <span key={i} style={{ color: accentColor }}>
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </h2>,
            ]}
          </SectionReveal>

          <p className="text-[17px] text-gray-400 max-w-2xl mb-16 leading-relaxed">
            {pf.uSortText}
          </p>

          <SectionReveal className="flex overflow-x-auto pb-16 cs-hide-scrollbar gap-8 px-10 snap-x">
            {designSteps.map((step: any, i: number) => (
              <div
                key={i}
                className="cs-timeline-item min-w-[260px] shrink-0 snap-center"
              >
                <div className="cs-timeline-item__bg-num" aria-hidden="true">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <div className="relative z-10">
                  <div className="cs-timeline-item__dot" />
                  <div className="cs-timeline-item__line" />
                  <h4 className="text-xl font-bold mb-3 mt-8">
                    {htmlToLines(step.dName ?? "").map((line, li) => (
                      <span key={li} className="block">
                        {line}
                      </span>
                    ))}
                  </h4>
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="py-28 max-w-[1400px] mx-auto px-6 lg:px-10 border-t border-white/[0.07]">
        <FadeIn className="mb-16">
          {/* WP-sourced HTML — trusted backend only */}
          <h2 className="text-[clamp(36px,5vw,70px)] font-black tracking-[-0.03em] leading-tight">
            {parse(pf.whyDoHeading ?? "")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {whyItems.map((item: any, i: number) => (
            <FadeIn
              key={i}
              delay={i * 0.1}
              yOffset={28}
              duration={0.65}
              className="cs-why-card"
            >
              <div className="cs-why-card__ghost" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="cs-why-card__shine" aria-hidden="true" />
              <div className="cs-why-card__bar" />
              <h3 className="text-[21px] font-bold mb-3 tracking-tight leading-snug text-white relative z-10">
                {/* WP-sourced HTML — trusted backend only */}
                <span>{parse(item.whyTitle ?? "")}</span>
              </h3>
              <p className="text-[15px] text-gray-400 leading-relaxed relative z-10">
                {item.whyShortText}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      <WannaChatSection
        contactItems={contactItems}
        leftHeading={
          ts?.cLeftHeading
            ? ts.cLeftHeading
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<[^>]+>/g, "")
                .trim()
            : null
        }
        formHeading={
          ts?.cContactFormHeading ? stripHtml(ts.cContactFormHeading) : null
        }
        submitLabel={ts?.cButton ?? null}
        callUsLabel={ts?.cCallUsLabel ?? null}
      />
    </main>
  );
}
```

- [ ] **Step 2: Commit** (the file is not yet imported anywhere — the build gate is Task 5)

```bash
git add components/PortfolioTemplate.tsx
git commit -m "feat(portfolio): extract shared PortfolioTemplate component"
```

---

### Task 3: Create the dynamic `app/[slug]/page.tsx` route

**Files:**

- Create: `app/[slug]/page.tsx`

- [ ] **Step 1: Write the route**

Create `app/[slug]/page.tsx` with this exact content:

```tsx
import { client } from "@/lib/apollo-client";
import {
  GET_PORTFOLIO_PAGE,
  GET_PORTFOLIO_SLUGS,
  GET_THEME_SETTINGS,
} from "@/lib/queries";
import { gql } from "@apollo/client";
import { notFound } from "next/navigation";
import { PortfolioTemplate } from "@/components/PortfolioTemplate";

// Only slugs returned by generateStaticParams resolve here; any other slug 404s.
// Static route folders (about-us, services, technology) take Next.js precedence
// over this dynamic segment, so they are never reached by [slug].
export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PORTFOLIO_SLUGS}
      `,
    });
    const nodes: any[] = data?.pages?.nodes ?? [];
    return nodes
      .filter((n) => n?.template?.__typename === "Template_PortfolioPage")
      .map((n) => ({ slug: (n.uri ?? "").replace(/^\/+|\/+$/g, "") }))
      .filter((p) => p.slug.length > 0);
  } catch {
    // Build emits no portfolio routes rather than crashing.
    return [];
  }
}

async function getPortfolioData(slug: string) {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PORTFOLIO_PAGE}
      `,
      variables: { uri: slug },
    });
    return data?.page?.template?.portfolioFields ?? null;
  } catch {
    return null;
  }
}

async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    });
    return data?.themeSetting?.themeOptions ?? null;
  } catch {
    return null;
  }
}

export default async function PortfolioSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pf, ts] = await Promise.all([
    getPortfolioData(slug),
    getThemeSettings(),
  ]);

  // Empty/failed fetch, or a page not actually on the portfolio template.
  if (!pf || Object.keys(pf).length === 0) notFound();

  return <PortfolioTemplate pf={pf} ts={ts} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[slug]/page.tsx
git commit -m "feat(portfolio): add dynamic [slug] route with generateStaticParams"
```

---

### Task 4: Delete the one-off cyber-security page

**Files:**

- Delete: `app/cyber-security/page.tsx` (and the now-empty `app/cyber-security/` folder)

- [ ] **Step 1: Remove the file and folder**

```bash
git rm app/cyber-security/page.tsx
rmdir app/cyber-security 2>/dev/null || true
```

Expected: the file is staged for deletion. `rmdir` removes the folder if empty; if it errors because the folder is already gone or non-empty, that's fine (`|| true` swallows it — but if non-empty, inspect what else is in there before continuing).

- [ ] **Step 2: Confirm no remaining references to the deleted constant or route**

Run:

```bash
grep -rn "GET_CYBER_SECURITY_PAGE\|cyber-security/page" app components lib
```

Expected: **no output** (empty). The only place `cyber-security` should now appear is as WP-returned data, never in source paths.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(portfolio): remove one-off cyber-security page in favor of dynamic route"
```

---

### Task 5: Verify Phase 1 — lint, build, and route checks

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: PASS with no errors. (Pre-existing warnings unrelated to these files are acceptable; no new errors referencing `app/[slug]`, `PortfolioTemplate`, or `queries.ts`.)

- [ ] **Step 2: Production build (exercises `generateStaticParams` against live WP)**

Run: `npm run build`
Expected: build succeeds. In the route output, `/[slug]` appears as a statically generated route, and the build log lists the prerendered portfolio paths (e.g. `/cyber-security`, `/medical-healthcare`, `/fintech-finance`, `/gaming`, `/agritech`, `/b2c`, `/device-iot`, `/startups-tech`, `/mobile-apps`, `/saas-platforms`, `/b2b`, `/dev`, `/dashboard-design`, `/portfolio-page` — 14 total). If the count is far below 14, the `__typename` filter or slug mapping is wrong — fix before continuing.

- [ ] **Step 3: Start the dev server**

Run (background): `npm run dev`
Wait for `Ready` / `Local: http://localhost:3000`.

- [ ] **Step 4: Verify the migrated cyber-security route still serves (no regression)**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/cyber-security`
Expected: `200`

- [ ] **Step 5: Verify a different category resolves through the same route**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/gaming`
Expected: `200`

- [ ] **Step 6: Verify an unknown slug 404s (`dynamicParams = false` working)**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/this-slug-does-not-exist`
Expected: `404`

- [ ] **Step 7: Verify static routes still win over `[slug]`**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/services`
Expected: `200` (served by `app/services/`, not the dynamic segment).

- [ ] **Step 8: Visual check — accent color is per-page**

Open `http://localhost:3000/cyber-security` and `http://localhost:3000/gaming` in a browser. Confirm each renders the full hero → intro → marquee → case studies → design process → why-us → WannaChat, and that the hero badge/CTA accent differs between categories (driven by each page's `headerBgColor`, default `#fed125`). Confirm cyber-security looks identical to before the refactor.

- [ ] **Step 9: Stop the dev server** once checks pass.

> **Phase 1 gate:** Do not proceed to Phase 2 until Steps 1–8 all pass.

---

## Phase 2 — Mega-Menu Promo Card

### Task 6: Pass `menuPromoImage` from `Header` into `HeaderClient`

**Files:**

- Modify: `components/Header.tsx`

- [ ] **Step 1: Pass the promo source URL**

In `components/Header.tsx`, find the `<HeaderClient ... />` return (around lines 80–95) and add the `menuPromoImage` prop. Replace:

```tsx
  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={nav}
      mobileNavItems={mobile}
```

with:

```tsx
  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={nav}
      mobileNavItems={mobile}
      menuPromoImage={ts?.menuBackgroundImage?.node?.sourceUrl ?? null}
```

(The rest of the prop list — `whatsappHref`, `bookButtonText`, etc. — is unchanged.)

- [ ] **Step 2: Do not build yet** — `HeaderClient` does not accept this prop until Task 7. Proceed directly to Task 7.

---

### Task 7: Add the promo pane to `DropdownItem` in `HeaderClient`

**Files:**

- Modify: `components/HeaderClient.tsx`

- [ ] **Step 1: Import `CSSProperties` and add `menuPromoImage` to the props interface**

Change the React import (line 5) from:

```tsx
import { useEffect, useRef, useState } from "react";
```

to:

```tsx
import { useEffect, useRef, useState, type CSSProperties } from "react";
```

Then add `menuPromoImage` to the `HeaderClientProps` interface — replace:

```tsx
export interface HeaderClientProps {
  logoUrl: string | null;
  ticker: string | null;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
```

with:

```tsx
export interface HeaderClientProps {
  logoUrl: string | null;
  ticker: string | null;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  menuPromoImage: string | null;
```

- [ ] **Step 2: Replace the entire `DropdownItem` function**

Replace the whole `DropdownItem` function (currently lines ~38–122, from `function DropdownItem({ item, pathname }...` through its closing `}`) with the version below. It adds the `menuPromoImage` parameter, a content-driven `showPromo` flag (`>6` children), viewport-clamped positioning for the wide panel, and the animated promo pane. Link-only dropdowns (e.g. Services) keep the exact same centered layout and width as today.

```tsx
// Wide promo mega-menu panel width (link grid + divider + promo pane + padding).
const PROMO_PANEL_WIDTH = 900;

function DropdownItem({
  item,
  pathname,
  menuPromoImage,
}: {
  item: NavItem;
  pathname: string;
  menuPromoImage: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const href = toHref(item.url);
  const isActive = href !== "/" && pathname.startsWith(href);

  // Content-driven: the promo pane shows only for the large (>6-child) dropdown,
  // which today is Portfolio — no label string is hardcoded.
  const showPromo = Boolean(menuPromoImage) && item.children.length > 6;

  const handleMouseEnter = () => {
    if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
    setOpen(true);
  };

  // Positioning: link-only dropdowns stay centered on the trigger (unchanged).
  // The wide promo panel is left-anchored and clamped to the viewport so it
  // never overflows either edge. `rect` is only ever set on the client after
  // mouse enter, so reading window dimensions here is safe.
  let panelStyle: CSSProperties = {};
  if (rect) {
    if (showPromo) {
      const desiredLeft = rect.left + rect.width / 2 - PROMO_PANEL_WIDTH / 2;
      const clampedLeft = Math.max(
        16,
        Math.min(desiredLeft, window.innerWidth - PROMO_PANEL_WIDTH - 16),
      );
      panelStyle = {
        top: rect.bottom + 12,
        left: clampedLeft,
        minWidth: PROMO_PANEL_WIDTH,
      };
    } else {
      panelStyle = {
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
        minWidth: Math.min(item.children.length, 6) > 3 ? 460 : 240,
      };
    }
  }

  return (
    <div
      ref={buttonRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 text-[14px] font-medium transition-colors hover:text-yellow-400 ${
          isActive ? "text-yellow-400" : "text-white"
        }`}
      >
        {item.label}
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          className={`mt-px transition-transform duration-200 opacity-70 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open &&
          item.children.length > 0 &&
          rect &&
          createPortal(
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`fixed bg-white rounded-2xl shadow-2xl shadow-black/15 p-6 z-9999 ${
                showPromo ? "flex items-stretch gap-6" : ""
              }`}
              style={panelStyle}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {/* Link grid (left) */}
              <div
                className={`grid gap-x-10 gap-y-3.5 ${
                  item.children.length > 6 ? "grid-cols-2" : "grid-cols-1"
                } ${showPromo ? "content-center" : ""}`}
              >
                {item.children.map((child, idx) => (
                  <Link
                    key={idx}
                    href={toHref(child.url)}
                    className="text-[14px] text-gray-700 font-medium hover:text-black transition-colors whitespace-nowrap"
                    onClick={() => setOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>

              {/* Promo pane (right) — decorative, WP-sourced, no click target */}
              {showPromo && menuPromoImage && (
                <>
                  <div
                    aria-hidden="true"
                    className="w-px self-stretch bg-linear-to-b from-transparent via-black/10 to-transparent"
                  />
                  <motion.div
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.06,
                    }}
                    className="relative shrink-0 w-[340px] flex items-center justify-center"
                  >
                    {/* Soft gold glow bleeding behind the card */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 42%, rgba(250,204,21,0.28) 0%, transparent 68%)",
                        filter: "blur(18px)",
                        transform: "scale(1.15)",
                      }}
                    />
                    {/* The promo image floats subtly and lifts on hover */}
                    <motion.img
                      src={menuPromoImage}
                      alt=""
                      aria-hidden="true"
                      className="relative w-full h-auto rounded-2xl shadow-xl ring-1 ring-black/5"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 4.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                      whileHover={{ scale: 1.03 }}
                    />
                  </motion.div>
                </>
              )}
            </motion.div>,
            document.body,
          )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Destructure `menuPromoImage` in the `HeaderClient` function signature**

Find the `HeaderClient` function declaration (around line 124) and add `menuPromoImage` to the destructured params. Replace:

```tsx
export function HeaderClient({
  logoUrl,
  ticker,
  navItems,
  mobileNavItems,
  whatsappHref,
```

with:

```tsx
export function HeaderClient({
  logoUrl,
  ticker,
  navItems,
  mobileNavItems,
  menuPromoImage,
  whatsappHref,
```

- [ ] **Step 4: Pass `menuPromoImage` to each `DropdownItem`**

Find the desktop nav `DropdownItem` usage (around line 217). Replace:

```tsx
return (
  <DropdownItem
    key={`nav-${item.label}-${i}`}
    item={item}
    pathname={pathname}
  />
);
```

with:

```tsx
return (
  <DropdownItem
    key={`nav-${item.label}-${i}`}
    item={item}
    pathname={pathname}
    menuPromoImage={menuPromoImage}
  />
);
```

- [ ] **Step 5: Commit**

```bash
git add components/Header.tsx components/HeaderClient.tsx
git commit -m "feat(header): add promo card pane to portfolio mega-menu dropdown"
```

---

### Task 8: Verify Phase 2 — lint, build, and mega-menu visual checks

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: PASS, no new errors in `Header.tsx` / `HeaderClient.tsx`.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds (type check passes — `menuPromoImage` is now a required prop and is supplied by `Header.tsx`).

- [ ] **Step 3: Start dev server**

Run (background): `npm run dev` — wait for `Ready`.

- [ ] **Step 4: Visual check — Portfolio mega-menu shows the promo pane**

Open `http://localhost:3000/` on a desktop-width viewport (≥1024px) and hover the **Portfolio** nav item. Confirm:

- The dropdown is a two-pane panel: the two-column industry link grid on the left, a vertical hairline divider, and the promo image (`menu-image2.png`) on the right inside a rounded card with a soft gold glow behind it.
- The promo card fades/slides in just after the panel opens and floats gently (subtle vertical drift).
- Hovering the promo image lifts it slightly (scale).
- The panel does not overflow the left or right edge of the viewport (clamped). Re-check by hovering at a narrow desktop width (~1024px).

- [ ] **Step 5: Visual check — other dropdowns are unchanged (no regression)**

Hover the **Services** dropdown (≤6 children). Confirm it renders exactly as before: centered on its trigger, no promo pane, original width. Any non-Portfolio dropdown with ≤6 children must look identical to pre-change.

- [ ] **Step 6: Visual check — mobile menu unchanged**

Shrink the viewport below `lg` (<1024px) and open the hamburger menu. Confirm the Portfolio item still shows its child chips in the existing accordion style and that **no promo card** appears (promo is desktop-hover only).

- [ ] **Step 7: Accessibility spot-check**

In devtools, confirm the promo `<img>` has empty `alt` and `aria-hidden="true"`, the glow and divider are `aria-hidden`, and there is no anchor wrapping the promo (decorative, no click target).

- [ ] **Step 8: Graceful fallback (optional but recommended)**

If feasible, confirm that when `menuBackgroundImage` is absent the dropdown falls back to the link-only layout. (You can simulate by temporarily having `Header.tsx` pass `menuPromoImage={null}` — then revert.) `showPromo` is false → original centered link grid renders. Revert any temporary change before finishing.

- [ ] **Step 9: Stop the dev server.**

---

## Self-Review (author's pass against the spec)

- **Spec coverage:**
  - Dynamic route rendering all portfolio-template pages → Task 3 (`app/[slug]/page.tsx`).
  - Zero hardcoded slugs, derived from WP → Task 3 `generateStaticParams` filters by `Template_PortfolioPage`.
  - Preserve existing top-level URLs / no SEO change → Task 4 deletes the folder so `[slug]` serves `/cyber-security`; Task 5 Steps 4–7 verify parity + precedence.
  - `dynamicParams = false` + 404 on unknown → Task 3 + Task 5 Step 6.
  - `notFound()` on empty `portfolioFields` → Task 3 guard.
  - Parameterized `GET_PORTFOLIO_PAGE($uri)` replacing `GET_CYBER_SECURITY_PAGE`, identical field set → Task 1.
  - Shared `PortfolioTemplate` with `pf`/`ts` props + helpers moved → Task 2.
  - Per-page accent from `headerBgColor` → preserved verbatim in Task 2; verified Task 5 Step 8.
  - Promo pane: new `menuPromoImage` prop, sourced from `themeOptions.menuBackgroundImage`, `>6`-children trigger, decorative `aria-hidden` image, no mobile change, no regression → Tasks 1 (field), 6, 7; verified Task 8.
  - No new ACF fields / no schema regeneration → only query selection changes (field exists live per spec).
- **Placeholder scan:** none — every code step contains complete code; verification steps use concrete commands with expected output.
- **Type/name consistency:** `GET_PORTFOLIO_SLUGS`, `GET_PORTFOLIO_PAGE`, `PortfolioTemplate`, `menuPromoImage`, `showPromo`, `PROMO_PANEL_WIDTH` are used identically across all tasks. `params` is typed as a `Promise` and awaited (Next.js 16). `menuPromoImage` is a required prop on `HeaderClientProps` and supplied by `Header.tsx` (Task 6) — so the Task 8 build type-checks.
- **Note on the `gImageList` field:** included in the query for parity with the original selection set even though the current render body does not consume it — matches the spec's "identical field set" requirement.
