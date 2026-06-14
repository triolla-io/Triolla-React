# Headless WP Frontend Elevation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the existing Next.js headless WP site with staggered scroll animations, animated mobile menu, hero word-stagger, count-up numbers, drag carousel, FAQ accordion, and client logo strip — making it visually superior to triolla.io.

**Architecture:** New `"use client"` components handle all animations; existing Server Component pages import them. `lib/queries.ts` gains `faqItems` and `clientLogos` fields on both page queries. No new pages, no structural changes to Apollo or routing.

**Tech Stack:** Next.js 16 App Router, Framer Motion v12, Tailwind CSS v4, TypeScript, Apollo Client / WPGraphQL

> **Security note on `dangerouslySetInnerHTML`:** Several existing fields (`moreText`, `toprightext`, `devtext`, etc.) are already rendered this way throughout the codebase. CLAUDE.md documents this as intentional: content comes exclusively from the trusted WP backend. The FAQ answer field added in this plan follows the same pattern. Do NOT add new `dangerouslySetInnerHTML` calls for any content that could originate from user input or untrusted sources.

---

## File Map

**Create:**

- `components/SectionReveal.tsx` — staggered `whileInView` wrapper for child lists
- `components/FAQAccordion.tsx` — animated expand/collapse accordion
- `components/ClientLogoStrip.tsx` — grayscale-to-color logo grid
- `components/HeroHeadline.tsx` — word-by-word stagger on page load
- `components/CountUpNumber.tsx` — count-up animation triggered `whileInView`
- `components/LearnCarousel.tsx` — Framer Motion `drag="x"` carousel for About learn slider

**Modify:**

- `lib/queries.ts` — add `faqItems` + `clientLogos` to both `GET_SERVICES_PAGE` and `GET_ABOUT_PAGE`
- `components/Header.tsx` — add active nav indicator + animated mobile menu
- `app/page.tsx` — wire `HeroHeadline`, `SectionReveal`, `CountUpNumber` into existing sections
- `app/services/page.tsx` — add `SectionReveal`, `ClientLogoStrip`, `FAQAccordion`
- `app/about-us/page.tsx` — add `SectionReveal`, replace learn slider with `LearnCarousel`, add `ClientLogoStrip`, `FAQAccordion`

---

## Task 1: SectionReveal Component

**Files:**

- Create: `components/SectionReveal.tsx`

This is a `"use client"` wrapper that staggers its direct children into view. Each child gets `opacity: 0->1`, `y: 40->0`, `easeOut 0.6s`, stagger delay `0.12s`.

- [ ] **Step 1: Create `components/SectionReveal.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SectionRevealProps {
  children: ReactNode | ReactNode[]
  className?: string
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  return (
    <motion.div className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors referencing `SectionReveal`.

- [ ] **Step 3: Commit**

```bash
git add components/SectionReveal.tsx
git commit -m "feat: add SectionReveal staggered scroll animation component"
```

---

## Task 2: FAQAccordion Component

**Files:**

- Create: `components/FAQAccordion.tsx`

`"use client"` accordion — one item open at a time. Chevron rotates 180deg on open. Answer panel animates height via `AnimatePresence`. Answer content comes from trusted WP backend only.

- [ ] **Step 1: Create `components/FAQAccordion.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  faqQuestion: string
  faqAnswer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
  className?: string
}

export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={className}>
      {items.map((item, i) => (
        <div key={i} className="border-b border-white/10">
          <button
            className="w-full flex justify-between items-center py-6 text-left gap-4"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-[22px] font-semibold">{item.faqQuestion}</span>
            <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="text-gray-400 text-[18px] leading-relaxed pb-6" dangerouslySetInnerHTML={{ __html: item.faqAnswer }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors on `FAQAccordion`.

- [ ] **Step 3: Commit**

```bash
git add components/FAQAccordion.tsx
git commit -m "feat: add FAQAccordion animated accordion component"
```

---

## Task 3: ClientLogoStrip Component

**Files:**

- Create: `components/ClientLogoStrip.tsx`

Responsive logo grid. Each logo is grayscale by default, full-color on hover. Uses `SectionReveal` for staggered entrance.

- [ ] **Step 1: Create `components/ClientLogoStrip.tsx`**

```tsx
import { SectionReveal } from './SectionReveal'

interface Logo {
  sourceUrl: string
  name: string
}

interface ClientLogoStripProps {
  logos: Logo[]
  className?: string
}

export function ClientLogoStrip({ logos, className = '' }: ClientLogoStripProps) {
  if (!logos || logos.length === 0) return null

  return (
    <div className={className}>
      <SectionReveal className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
        {logos.map((logo, i) => (
          <div key={i} className="flex items-center justify-center p-4 group">
            <img
              src={logo.sourceUrl}
              alt={logo.name}
              className="max-h-[50px] w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>
        ))}
      </SectionReveal>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add components/ClientLogoStrip.tsx
git commit -m "feat: add ClientLogoStrip logo grid component"
```

---

## Task 4: HeroHeadline Component

**Files:**

- Create: `components/HeroHeadline.tsx`

`"use client"` component. Splits headline text by spaces, each word is a `motion.span` with staggered entrance (`opacity 0->1`, `y 20->0`). Subtext fades in after headline (0.4s delay).

- [ ] **Step 1: Create `components/HeroHeadline.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'

interface HeroHeadlineProps {
  headline: string
  subtext?: string
  headlineClassName?: string
  subtextClassName?: string
}

export function HeroHeadline({ headline, subtext, headlineClassName = '', subtextClassName = '' }: HeroHeadlineProps) {
  const words = headline.split(' ')

  return (
    <>
      <h1 className={headlineClassName}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </h1>
      {subtext && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: words.length * 0.08 + 0.4 }}
          className={subtextClassName}
        >
          {subtext}
        </motion.p>
      )}
    </>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add components/HeroHeadline.tsx
git commit -m "feat: add HeroHeadline word-by-word stagger animation component"
```

---

## Task 5: CountUpNumber Component

**Files:**

- Create: `components/CountUpNumber.tsx`

`"use client"`. Uses `useEffect` + `useState` to animate a number from 0 to `target` over 1.5s when the element enters viewport. Uses `useInView` from framer-motion.

- [ ] **Step 1: Create `components/CountUpNumber.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpNumberProps {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function CountUpNumber({ target, prefix = '', suffix = '', duration = 1500, className = '' }: CountUpNumberProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isInView, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add components/CountUpNumber.tsx
git commit -m "feat: add CountUpNumber viewport-triggered count-up animation"
```

---

## Task 6: LearnCarousel Component

**Files:**

- Create: `components/LearnCarousel.tsx`

`"use client"`. Replaces the `overflow-x-auto` div in the About learn slider. Uses Framer Motion `drag="x"` with `dragConstraints` and momentum.

- [ ] **Step 1: Create `components/LearnCarousel.tsx`**

```tsx
'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

interface Slide {
  learntext: string
  learnimage?: { node?: { sourceUrl?: string } }
  learnvideo?: { node?: { mediaItemUrl?: string } }
}

interface LearnCarouselProps {
  slides: Slide[]
}

export function LearnCarousel({ slides }: LearnCarouselProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        className="flex gap-8 cursor-grab active:cursor-grabbing pb-16 px-10"
        style={{ width: 'max-content' }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-[220px] md:w-[260px] shrink-0 group">
            <div className="rounded-3xl overflow-hidden relative aspect-3/4 mb-8 bg-black">
              <img
                src={slide.learnimage?.node?.sourceUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100 pointer-events-none"
              />
              {slide.learnvideo?.node?.mediaItemUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center pl-2 shadow-2xl group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5V19L19 12L8 5Z" fill="black" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <h4 className="text-2xl font-bold group-hover:text-yellow-400 transition-colors line-clamp-2">{slide.learntext}</h4>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add components/LearnCarousel.tsx
git commit -m "feat: add LearnCarousel drag-based Framer Motion carousel"
```

---

## Task 7: Update lib/queries.ts — Add faqItems + clientLogos

**Files:**

- Modify: `lib/queries.ts`

Add `faqItems` and `clientLogos` fields inside both `servicePage { ... }` and `aboutPage { ... }`.

> **Note:** These field names (`faqItems`, `faqQuestion`, `faqAnswer`, `clientLogos`, `logoImage`, `logoName`) are the expected ACF/WPGraphQL field names per the spec. Confirm against the live schema at `https://triolla.io/graphql` if queries return null — use GraphQL introspection or the WP GraphQL IDE to verify exact names before implementing Task 10/11.

- [ ] **Step 1: Add fields to `GET_SERVICES_PAGE`**

In `lib/queries.ts`, inside the `servicePage { ... }` block, after `devleftimage { node { sourceUrl } }` (the last existing field), insert:

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

- [ ] **Step 2: Add fields to `GET_ABOUT_PAGE`**

Inside the `aboutPage { ... }` block, after the `learnslider { ... }` block (the last existing field group), insert:

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

- [ ] **Step 3: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: clean. GraphQL field errors only surface at runtime if field names differ from the live schema.

- [ ] **Step 4: Commit**

```bash
git add lib/queries.ts
git commit -m "feat: add faqItems and clientLogos fields to services and about page queries"
```

---

## Task 8: Header — Active Nav Indicator + Animated Mobile Menu

**Files:**

- Modify: `components/Header.tsx`

- [ ] **Step 1: Add imports**

Add to the top of `components/Header.tsx`:

```tsx
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
```

- [ ] **Step 2: Add pathname and navLinks inside the component**

After `const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);`, add:

```tsx
const pathname = usePathname()
const navLinks = [
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/services', label: 'Services' },
  { href: '/technology', label: 'Technology' },
  { href: '/about-us', label: 'The Company' },
]
```

- [ ] **Step 3: Replace desktop nav with active-state version**

Replace the entire `<nav className="hidden lg:flex space-x-10">` block:

```tsx
<nav className="hidden lg:flex space-x-10">
  {navLinks.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      className={`relative text-[15px] font-medium transition-colors hover:text-yellow-400 ${pathname === href ? 'text-yellow-400' : ''}`}
    >
      {label}
      {pathname === href && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full" />}
    </Link>
  ))}
</nav>
```

- [ ] **Step 4: Replace mobile menu with AnimatePresence version**

Replace the `{isMobileMenuOpen && ( <div ...> )}` block at the bottom of the Header with:

```tsx
<AnimatePresence>
  {isMobileMenuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="lg:hidden absolute top-full left-0 w-full bg-black border-t border-white/10 p-4 shadow-xl"
    >
      <nav className="flex flex-col space-y-4">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-lg font-medium transition-colors hover:text-yellow-400 ${pathname === href ? 'text-yellow-400' : ''}`}
          >
            {label}
          </Link>
        ))}
        <hr className="border-white/20" />
        <Link href="/contact-us" className="text-center bg-white text-black py-2 rounded-full font-medium">
          Contact Us
        </Link>
      </nav>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 6: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add active nav indicator and animated mobile menu to Header"
```

---

## Task 9: Homepage — Hero + Section Animations + Count-Up

**Files:**

- Modify: `app/page.tsx`

The homepage is a Server Component. All animation components are client components imported into it.

- [ ] **Step 1: Add imports**

At the top of `app/page.tsx`, add:

```tsx
import { HeroHeadline } from '@/components/HeroHeadline'
import { SectionReveal } from '@/components/SectionReveal'
import { CountUpNumber } from '@/components/CountUpNumber'
```

- [ ] **Step 2: Replace hero h1 + h2 with HeroHeadline**

Find and replace:

```tsx
<h1 className="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px]">
  Creative Design Attracts People. Smart UX Makes Them Stay
</h1>
<h2 className="text-xl md:text-3xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed">
  Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups
</h2>
```

With:

```tsx
<HeroHeadline
  headline="Creative Design Attracts People. Smart UX Makes Them Stay"
  subtext="Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups"
  headlineClassName="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px]"
  subtextClassName="text-xl md:text-3xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed"
/>
```

- [ ] **Step 3: Replace portfolio grid div with SectionReveal**

In the "Top Images Grid" section, replace:

```tsx
<div className="grid grid-cols-12 gap-4 md:gap-6">{/* 6 child divs */}</div>
```

With (keep all 6 child divs unchanged, just change the outer wrapper):

```tsx
<SectionReveal className="grid grid-cols-12 gap-4 md:gap-6">
  {[
    <div className="col-span-12 md:col-span-8 group">...</div>,
    <div className="col-span-6 md:col-span-4 group">...</div>,
    <div className="col-span-6 md:col-span-6 group">...</div>,
    <div className="col-span-12 md:col-span-6 group">...</div>,
    <div className="col-span-4 md:col-span-3 group">...</div>,
    <div className="col-span-8 md:col-span-9 group">...</div>,
  ]}
</SectionReveal>
```

- [ ] **Step 4: Replace feature cards grid div with SectionReveal**

In the "About Section", replace:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{/* 4 card divs */}</div>
```

With:

```tsx
<SectionReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">{[card1JSX, card2JSX, card3JSX, card4JSX]}</SectionReveal>
```

- [ ] **Step 5: Replace awards static numbers with CountUpNumber**

In the Awards section, replace the 3 number divs:

```tsx
{
  /* was: <div className="text-yellow-400 text-6xl font-black mb-4">#1</div> */
}
;<div className="text-yellow-400 text-6xl font-black mb-4">
  #<CountUpNumber target={1} duration={800} />
</div>

{
  /* second #1 card */
}
;<div className="text-yellow-400 text-6xl font-black mb-4">
  #<CountUpNumber target={1} duration={800} />
</div>

{
  /* #2 card */
}
;<div className="text-yellow-400 text-6xl font-black mb-4">
  #<CountUpNumber target={2} duration={1000} />
</div>
```

- [ ] **Step 6: Wrap process timeline with SectionReveal**

Replace the timeline scroll container:

```tsx
<div className="flex overflow-x-auto pb-16 hide-scrollbar gap-10 px-10 snap-x">
  {[...].map((item, i) => (
    <div key={i} className="min-w-[300px] shrink-0 snap-center ...">...</div>
  ))}
</div>
```

With:

```tsx
<SectionReveal className="flex overflow-x-auto pb-16 hide-scrollbar gap-10 px-10 snap-x">
  {[{ step: '01', title: 'Kickoff meeting', text: '...' }, ...].map((item, i) => (
    <div key={i} className="min-w-[300px] shrink-0 snap-center relative pt-10">
      ...
    </div>
  ))}
</SectionReveal>
```

- [ ] **Step 7: Wrap contact form fields with SectionReveal**

In the Bottom Contact Section, replace `<form className="space-y-6">` content wrapper. Keep the `<form>` tag and `<button>` unchanged; wrap only the 4 input/textarea `<div>`s:

```tsx
<form className="space-y-6">
  <SectionReveal className="space-y-6">
    {[
      <div>
        <input
          type="text"
          placeholder="Name*"
          className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>,
      <div>
        <input
          type="email"
          placeholder="Email*"
          className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>,
      <div>
        <input
          type="text"
          placeholder="Phone"
          className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>,
      <div>
        <textarea
          placeholder="Message"
          rows={3}
          className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors resize-none"
        ></textarea>
      </div>,
    ]}
  </SectionReveal>
  <button
    type="button"
    className="bg-yellow-400 text-black font-bold text-xl px-12 py-4 rounded-full hover:bg-white transition-colors w-full md:w-auto"
  >
    Send Message
  </button>
</form>
```

- [ ] **Step 8: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: clean build.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add hero stagger, section reveals, and count-up animations to homepage"
```

---

## Task 10: Services Page — SectionReveal + ClientLogoStrip + FAQAccordion

**Files:**

- Modify: `app/services/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `app/services/page.tsx`, add:

```tsx
import { SectionReveal } from '@/components/SectionReveal'
import { ClientLogoStrip } from '@/components/ClientLogoStrip'
import { FAQAccordion } from '@/components/FAQAccordion'
```

- [ ] **Step 2: Map clientLogos and faqItems**

In `ServicesPage`, after the `brandImages` declaration, add:

```tsx
const faqItems: { faqQuestion: string; faqAnswer: string }[] = sp.faqItems ?? []
const clientLogos: { sourceUrl: string; name: string }[] = (sp.clientLogos ?? [])
  .map((l: any) => ({
    sourceUrl: l.logoImage?.node?.sourceUrl ?? '',
    name: l.logoName ?? '',
  }))
  .filter((l: { sourceUrl: string }) => l.sourceUrl)
```

- [ ] **Step 3: Wrap Product Design section title+text with SectionReveal**

In the Product Design section, replace:

```tsx
<div className="mb-20">
  <h3 className="text-[60px] font-bold mb-6 text-white tracking-tighter">{sp.prodtitle}</h3>
  <div className="text-[22px] leading-relaxed text-gray-400 max-w-3xl" dangerouslySetInnerHTML={{ __html: sp.proddtxt }} />
</div>
```

With:

```tsx
<SectionReveal className="mb-20">
  {[
    <h3 className="text-[60px] font-bold mb-6 text-white tracking-tighter">{sp.prodtitle}</h3>,
    <div className="text-[22px] leading-relaxed text-gray-400 max-w-3xl" dangerouslySetInnerHTML={{ __html: sp.proddtxt }} />,
  ]}
</SectionReveal>
```

- [ ] **Step 4: Wrap Branding section title+text with SectionReveal**

Replace:

```tsx
<div className="mb-20 relative z-10">
  <h3 className="text-[60px] font-bold mb-6 tracking-tighter">{sp.brandtitle}</h3>
  <div className="text-[22px] leading-relaxed text-gray-600 max-w-3xl" dangerouslySetInnerHTML={{ __html: sp.brandtext }} />
</div>
```

With:

```tsx
<SectionReveal className="mb-20 relative z-10">
  {[
    <h3 className="text-[60px] font-bold mb-6 tracking-tighter">{sp.brandtitle}</h3>,
    <div className="text-[22px] leading-relaxed text-gray-600 max-w-3xl" dangerouslySetInnerHTML={{ __html: sp.brandtext }} />,
  ]}
</SectionReveal>
```

- [ ] **Step 5: Wrap Technology section title+text with SectionReveal**

Replace:

```tsx
<div className="mb-20 max-w-4xl">
  <h3 className="text-[60px] font-bold mb-6 text-white tracking-tighter">{sp.devtitle}</h3>
  <div className="text-[22px] leading-relaxed text-gray-400" dangerouslySetInnerHTML={{ __html: sp.devtext }} />
</div>
```

With:

```tsx
<SectionReveal className="mb-20 max-w-4xl">
  {[
    <h3 className="text-[60px] font-bold mb-6 text-white tracking-tighter">{sp.devtitle}</h3>,
    <div className="text-[22px] leading-relaxed text-gray-400" dangerouslySetInnerHTML={{ __html: sp.devtext }} />,
  ]}
</SectionReveal>
```

- [ ] **Step 6: Add ClientLogoStrip section after Technology `</section>`**

After the closing `</section>` of the Technology section (the last section before `</main>`), insert:

```tsx
{
  clientLogos.length > 0 && (
    <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <h3 className="text-[40px] font-bold mb-16 text-center tracking-tighter">Our Clients</h3>
      <ClientLogoStrip logos={clientLogos} />
    </section>
  )
}
```

- [ ] **Step 7: Add FAQAccordion section after ClientLogoStrip**

```tsx
{
  faqItems.length > 0 && (
    <section className="py-24 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-[50px] font-bold mb-16 tracking-tighter">Frequently Asked Questions</h3>
      <FAQAccordion items={faqItems} />
    </section>
  )
}
```

- [ ] **Step 8: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 9: Commit**

```bash
git add app/services/page.tsx
git commit -m "feat: add section reveals, ClientLogoStrip, and FAQAccordion to services page"
```

---

## Task 11: About Page — SectionReveal + LearnCarousel + ClientLogoStrip + FAQAccordion

**Files:**

- Modify: `app/about-us/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `app/about-us/page.tsx`, add:

```tsx
import { SectionReveal } from '@/components/SectionReveal'
import { ClientLogoStrip } from '@/components/ClientLogoStrip'
import { FAQAccordion } from '@/components/FAQAccordion'
import { LearnCarousel } from '@/components/LearnCarousel'
```

- [ ] **Step 2: Map clientLogos and faqItems**

After `const ap = await getAboutData();`, add:

```tsx
const faqItems: { faqQuestion: string; faqAnswer: string }[] = ap.faqItems ?? []
const clientLogos: { sourceUrl: string; name: string }[] = (ap.clientLogos ?? [])
  .map((l: any) => ({
    sourceUrl: l.logoImage?.node?.sourceUrl ?? '',
    name: l.logoName ?? '',
  }))
  .filter((l: { sourceUrl: string }) => l.sourceUrl)
```

- [ ] **Step 3: Wrap hero content with SectionReveal**

In the Hero section, replace the inner content div:

```tsx
<div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
  <h1 ...>{ap.headerTitle}</h1>
  <div ...>{ap.boldText}</div>
  <p ...>{ap.shortText}</p>
  <div dangerouslySetInnerHTML={{ __html: ap.moreText }} />
</div>
```

With:

```tsx
<SectionReveal className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
  {[
    <h1 className="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px] text-black">
      {ap.headerTitle}
    </h1>,
    <div className="text-[26px] font-bold mb-4 text-black">{ap.boldText}</div>,
    <p className="text-[26px] leading-[1.3] text-black/80 mb-8 max-w-3xl mx-auto">{ap.shortText}</p>,
    <div
      className="text-black/70 leading-relaxed text-[17px] max-w-4xl mx-auto text-center"
      dangerouslySetInnerHTML={{ __html: ap.moreText }}
    />,
  ]}
</SectionReveal>
```

- [ ] **Step 4: Wrap services list rows with SectionReveal**

In the Services section, replace:

```tsx
<div className="flex flex-col gap-12">
  {ap.servlist?.map((serv: any, i: number) => (
    <div key={i} className="flex flex-col md:flex-row border-b border-white/10 pb-12 ...">
      ...
    </div>
  ))}
</div>
```

With:

```tsx
<SectionReveal className="flex flex-col gap-12">
  {(ap.servlist ?? []).map((serv: any, i: number) => (
    <div key={i} className="flex flex-col md:flex-row border-b border-white/10 pb-12 last:border-b-0 last:pb-0">
      <div className="md:w-1/3 text-[32px] font-bold text-white mb-6 md:mb-0">{serv.servlleftText}</div>
      <div className="md:w-2/3">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          {serv.servrightList?.map((item: any, idx: number) => (
            <li key={idx}>
              <Link
                href={item.itemLink || '#'}
                target={item.linkTarget || '_self'}
                className="text-[20px] text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-3 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-yellow-400 transition-colors"></span>
                {item.listItem}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ))}
</SectionReveal>
```

- [ ] **Step 5: Wrap partner cards grid with SectionReveal**

In the "Why Startups Partner With Us" section, replace:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {ap.abthrelist?.map(...)}
</div>
```

With:

```tsx
<SectionReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {(ap.abthrelist ?? []).map((item: any, i: number) => (
    <div
      key={i}
      className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group relative overflow-hidden"
    >
      <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <img src={item.abthreimage?.node?.sourceUrl} alt="" className="w-64 h-64 object-contain" />
      </div>
      <div className="mb-12 h-20">
        <img
          src={item.abthreimage?.node?.sourceUrl}
          alt=""
          className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <h5 className="text-2xl font-bold mb-4 relative z-10" dangerouslySetInnerHTML={{ __html: item.abteintitle }} />
      <p className="text-gray-400 text-lg leading-relaxed relative z-10" dangerouslySetInnerHTML={{ __html: item.abthreintext }} />
    </div>
  ))}
</SectionReveal>
```

- [ ] **Step 6: Replace learn slider with LearnCarousel**

In the "Learn Explore Grow Slider" section, replace:

```tsx
<div className="flex overflow-x-auto pb-16 hide-scrollbar gap-8 snap-x">
  {ap.learnslider?.map((slide: any, i: number) => (
    ...
  ))}
</div>
```

With:

```tsx
<LearnCarousel slides={ap.learnslider ?? []} />
```

- [ ] **Step 7: Add ClientLogoStrip section after learn slider `</section>`**

After the closing `</section>` of the Learn section:

```tsx
{
  clientLogos.length > 0 && (
    <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-[40px] font-bold mb-16 text-center tracking-tighter">Our Clients</h3>
      <ClientLogoStrip logos={clientLogos} />
    </section>
  )
}
```

- [ ] **Step 8: Add FAQAccordion as final section**

```tsx
{
  faqItems.length > 0 && (
    <section className="py-24 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-[50px] font-bold mb-16 tracking-tighter">Frequently Asked Questions</h3>
      <FAQAccordion items={faqItems} />
    </section>
  )
}
```

- [ ] **Step 9: Build check**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 10: Commit**

```bash
git add app/about-us/page.tsx
git commit -m "feat: add section reveals, drag carousel, ClientLogoStrip, and FAQAccordion to about page"
```

---

## Task 12: Final Build + Smoke Test

- [ ] **Step 1: Clean build**

```bash
npm run build 2>&1 | tail -40
```

Expected: `Compiled successfully`, zero type errors.

- [ ] **Step 2: Lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 3: Dev server smoke test**

```bash
npm run dev
```

Check each route:

- `http://localhost:3000` — hero headline words animate in one-by-one on load; portfolio grid images stagger on scroll; awards numbers count up; feature cards stagger; contact fields stagger
- `http://localhost:3000/services` — section titles stagger in; ClientLogoStrip renders or is hidden; FAQAccordion opens/closes with chevron rotation
- `http://localhost:3000/about-us` — hero staggers in; service rows stagger; partner cards stagger; learn section is draggable; ClientLogoStrip renders or is hidden; FAQAccordion works
- Resize to mobile — active nav link has yellow underline; mobile menu slides down and fades on open; slides up and fades on close
