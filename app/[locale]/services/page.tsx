import { client } from '@/lib/apollo-client'
import { GET_SERVICES_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
import { enrichServiceDetails } from '@/lib/service-details'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { FAQSection } from '@/components/FAQSection'
import { Reveal } from '@/components/gsap/Reveal'
import { Parallax } from '@/components/gsap/Parallax'
import { HeroMarquee } from '@/components/services/HeroMarquee'
import { ProductMosaic } from '@/components/services/ProductMosaic'
import { BrandingPolaroids } from '@/components/services/BrandingPolaroids'
import { BrandingMenuPin } from '@/components/services/BrandingMenuPin'
import { ClientsSection } from '@/components/ClientsSection'
import { ServiceModalMenu } from '@/components/ServiceModalMenu'
import { ServiceTechGroups, type TechGroup } from '@/components/ServiceTechGroups'
import { GrainOverlay, Eyebrow } from '@/components/ui'
import parse from 'html-react-parser'
import type { GetServicesPageData, GetThemeSettingsData, ServicesPageFields, ThemeOptions, WPImage } from '@/lib/graphql-types'
import { wpImg } from '@/lib/images'
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema, serviceSchema } from '@/lib/jsonld'
import { stripHtml } from '@/lib/text'

const SERVICES_PAGE_QUERY: TypedDocumentNode<GetServicesPageData> = gql`
  ${GET_SERVICES_PAGE}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

async function getServicesData(uri: string): Promise<ServicesPageFields> {
  try {
    const { data } = await client.query({ query: SERVICES_PAGE_QUERY, variables: { uri } })
    return data?.page?.template?.servicePage ?? ({} as ServicesPageFields)
  } catch {
    return {} as ServicesPageFields
  }
}

async function getThemeSettings(): Promise<ThemeOptions | null> {
  try {
    const { data } = await client.query({ query: THEME_SETTINGS_QUERY })
    return data?.themeSetting?.themeOptions ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import('next').Metadata> {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const sp = await getServicesData(PAGE_URI.services[loc])
  const title = sp?.headerTitle ? `${stripHtml(sp.headerTitle)} | Triolla` : 'Services | Triolla'
  const description = stripHtml(sp?.boldText ?? sp?.shortText ?? '') || undefined
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { languages: { en: '/services', he: '/he/services' } },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      locale: loc === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
  }
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [sp, ts] = await Promise.all([getServicesData(PAGE_URI.services[loc]), getThemeSettings()])

  // Each menu link is normalized to { label, link } and enriched from its WP
  // detail page in parallel. Anything that doesn't resolve degrades to a plain
  // link (or plain text) rather than a fabricated modal.
  const [productServices, brandServices, engServices] = await Promise.all([
    enrichServiceDetails(
      (sp.prodrightMenu ?? []).map((i: { prodmtitle: string | null; prodmlink: string | null }) => ({
        label: i?.prodmtitle ?? null,
        link: i?.prodmlink ?? null,
      })),
    ),
    enrichServiceDetails(
      (sp.brandrightMenu ?? []).map((i: { rightmetitle: string | null; rightmelink: string | null }) => ({
        label: i?.rightmetitle ?? null,
        link: i?.rightmelink ?? null,
      })),
    ),
    enrichServiceDetails([
      { label: sp.devrightMenuToptitle ?? null, link: sp.devrightMenuToptitleLink ?? null },
      { label: sp.devrightMenuBottitle ?? null, link: sp.devrightMenuBottitleLink ?? null },
      { label: sp.rightMenuThreeTitle ?? null, link: sp.rightMenuThreeTitleLink ?? null },
    ]),
  ])

  // Engineering groups, aligned by index with `engServices`. Empty groups
  // (no title) are dropped inside <ServiceTechGroups>.
  const techGroups: TechGroup[] = [
    {
      detail: engServices[0],
      copy: sp.devrightMenuToptitleCopy ?? null,
      chips: (sp.rightMenuTopList ?? []).flatMap((x: { rightTopMenuItem: string }) => x?.rightTopMenuItem ? [x.rightTopMenuItem] : []),
    },
    {
      detail: engServices[1],
      copy: null,
      chips: (sp.rightMenuBotList ?? []).flatMap((x: { rightBottomMenuItem: string }) => x?.rightBottomMenuItem ? [x.rightBottomMenuItem] : []),
    },
    {
      detail: engServices[2],
      copy: null,
      chips: (sp.rightMenuThreeList ?? []).flatMap((x: { rightThreeMenuItem: string }) => x?.rightThreeMenuItem ? [x.rightThreeMenuItem] : []),
    },
  ]

  const prodImages = [
    sp.prodleftImageOne?.node?.sourceUrl,
    sp.prodleftImageTwo?.node?.sourceUrl,
    sp.prodleftImageThree?.node?.sourceUrl,
    sp.prodleftImageFour?.node?.sourceUrl,
    sp.prodleftImageFive?.node?.sourceUrl,
    sp.prodleftImageSix?.node?.sourceUrl,
    sp.prodleftImageSeven?.node?.sourceUrl,
    sp.prodleftImageEight?.node?.sourceUrl,
    sp.prodleftImageNine?.node?.sourceUrl,
  ].filter(Boolean) as string[]

  const brandImages = [
    sp.brandimageOne?.node?.sourceUrl,
    sp.brandimageTwo?.node?.sourceUrl,
    sp.brandimageThree?.node?.sourceUrl,
    sp.brandimageFour?.node?.sourceUrl,
    sp.brandimageFive?.node?.sourceUrl,
    sp.brandimageSix?.node?.sourceUrl,
  ].filter(Boolean) as string[]

  const clientLogos: { url: string; alt: string }[] = (ts?.clientsLogos ?? []).flatMap(
    (item: { cLogo: WPImage | null }) => {
      const url = item.cLogo?.node?.sourceUrl
      return url ? [{ url, alt: item.cLogo?.node?.altText ?? '' }] : []
    }
  )

  // Hero "jumping" illustrations (WP themeOptions). Decorative — bounce on the
  // yellow hero. Absent images are dropped; the cluster hides entirely if none.
  const jumpImages: string[] = [ts?.jumpingImage1, ts?.jumpingImage2, ts?.jumpingImage3].flatMap(
    (img: WPImage | null | undefined) => (img?.node?.sourceUrl ? [img.node.sourceUrl] : []),
  )

  const faqItems = (ts?.questionAnswerList ?? []).flatMap(
    (q: { fQuestion: string | null; fAnswer: string | null }) => {
      return q?.fQuestion
        ? [{ faqQuestion: q.fQuestion, faqAnswer: q.fAnswer ?? '' }]
        : []
    }
  )

  const heroTitle = stripHtml(sp.headerTitle ?? '')

  const svcCategories = [sp.prodtitle, sp.brandtitle, sp.devtitle, sp.prodtitle, sp.brandtitle, sp.devtitle]
    .filter((v): v is string => Boolean(v))
    .map(stripHtml)

  const svcPath = loc === 'he' ? '/he/services' : '/services'
  const svcJsonLd = serviceSchema({
    name: heroTitle || 'Services',
    description: sp.shortText ? stripHtml(sp.shortText) : null,
    path: svcPath,
    serviceType: 'Product Design & Development',
  })
  const svcCrumbs = breadcrumbSchema(
    [{ name: heroTitle || 'Services', path: svcPath }],
    loc === 'he' ? 'דף הבית' : 'Home',
  )

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-16 md:pb-32 relative">
      {svcJsonLd && <JsonLd data={[svcJsonLd, svcCrumbs]} />}
      {/* Grain overlay */}
      <GrainOverlay />

      {/* ══ HERO — centered yellow field (WP headerBgColor), black ink, bouncing
          "jumping" illustrations floating around the copy as the signature. ══ */}
      <section className="svc-hero" style={{ '--svc-hero-bg': sp.headerBgColor ?? '#fed125' } as React.CSSProperties}>
        {/* Ambient: WP portfolio overlay layer + a faint banner grid, parallaxed. */}
        {sp.headerBgOverlayLayer?.node?.sourceUrl && (
          <Parallax speed={0.9} className="svc-hero__layer">
            <img src={wpImg(sp.headerBgOverlayLayer.node.sourceUrl) ?? ''} alt="" aria-hidden="true" />
          </Parallax>
        )}
        <Parallax speed={1.08}>
          <div className="svc-hero__grid" aria-hidden="true" />
        </Parallax>

        {/* Signature: WP "jumping" illustrations, floated around the centered copy. */}
        {jumpImages.length > 0 && (
          <div className="svc-hero__jumps" aria-hidden="true">
            {jumpImages.map((img, i) => (
              <span key={i} className={`svc-jump svc-jump--${i + 1}`}>
                <img className="svc-jump__img" src={wpImg(img) ?? ''} alt="" />
                <span className="svc-jump__shadow" />
              </span>
            ))}
          </div>
        )}

        <div className="svc-hero__shell">
          <div className="svc-hero__copy">
            {sp.headerSubText && (
              <Reveal yOffset={18} duration={0.7}>
                <Eyebrow
                  ornament="dot"
                  className="eyebrow--center"
                  style={{ '--eb-gap': '12px', '--eb-size': '11px', '--eb-spacing': '0.3em', '--eb-dot': '6px', '--eb-mb': '0px', '--eb-color': '#0a0a0a' } as React.CSSProperties}
                >
                  {sp.headerSubText}
                </Eyebrow>
              </Reveal>
            )}

            <div className="svc-hero__title-wrap">
              <Reveal yOffset={24} duration={0.85}>
                <h1 className="svc-hero__title">{heroTitle}</h1>
              </Reveal>
              <span className="svc-hero__title-rule" aria-hidden="true" />
            </div>

            {sp.boldText && (
              <Reveal yOffset={16} delay={0.26}>
                <p className="svc-hero__bold">{sp.boldText}</p>
              </Reveal>
            )}
            {sp.shortText && (
              <Reveal yOffset={14} delay={0.36}>
                <p className="svc-hero__short">{sp.shortText}</p>
              </Reveal>
            )}

            {/* The … toggle collapses the long statement (kept in the DOM for SEO,
                expandable on click). Native <details> — no JS, keyboard-accessible. */}
            {sp.moreText && (
              <Reveal yOffset={14} delay={0.46} className="svc-hero__more-wrap">
                <details className="svc-hero__more">
                  <summary className="svc-hero__more-toggle">
                    <span className="sr-only">Read more about our services</span>
                    <span className="svc-hero__dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </summary>
                  {/* Trusted WP HTML */}
                  <div className="svc-hero__lead-text">{parse(sp.moreText)}</div>
                </details>
              </Reveal>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="svc-scroll-cue" aria-hidden="true">
          <div className="svc-scroll-cue__line" />
          <span className="svc-scroll-cue__label">Scroll</span>
        </div>

        {/* Scrolling category strip */}
        {svcCategories.length > 0 && (
          <div className="svc-hero__strip" aria-hidden="true">
            <HeroMarquee items={svcCategories} />
          </div>
        )}
      </section>

      {/* ══ PRODUCT DESIGN ══ */}
      <section className="svc-prod">
        <div className="svc-prod__inner">
          {/* Section heading — shown at every breakpoint now that the scene is no
              longer pinned (there's no separate in-scene title to dedupe against). */}
          <Reveal className="section-head svc-prod__head">
            <span className="svc-head-mark" aria-hidden="true" />
            {sp.prodtitle && <h2 className="section-head__title">{stripHtml(sp.prodtitle)}</h2>}
            {/* WP-sourced HTML — trusted backend only */}
            {sp.proddtxt && <div className="section-head__sub">{parse(sp.proddtxt)}</div>}
          </Reveal>

          <div className="svc-prod__body">
            {/* Editorial mosaic — every product shot in one composition, all
                visible at once (no scroll-scrub). Each tile pops up as it scrolls
                in; the desktop collage reflows to a clean grid on phones. */}
            <ProductMosaic images={prodImages} />

            {/* Right: sticky numbered menu — each item opens a fullscreen
                service-detail modal (falls back to a plain link if its detail
                page didn't resolve). */}
            <div className="svc-prod__menu">
              <ServiceModalMenu services={productServices} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" />
            </div>
          </div>
        </div>

      </section>

      {/* ══ BRANDING ══ */}
      <section className="svc-brand">
        <div className="svc-brand__dots" aria-hidden="true" />

        <div className="svc-brand__inner">
          <Reveal className="section-head" style={{ '--sh-title-color': '#0a0a0a', '--sh-sub-color': '#4b5563' } as React.CSSProperties}>
            <span className="svc-head-mark svc-head-mark--dark" aria-hidden="true" />
            {sp.brandtitle && <h2 className="section-head__title">{stripHtml(sp.brandtitle)}</h2>}
            {/* WP-sourced HTML — trusted backend only */}
            {sp.brandtext && <div className="section-head__sub">{parse(sp.brandtext)}</div>}
          </Reveal>

          <div className="svc-brand__body">
            {/* Polaroid gallery — staggered cascade that settles into its tilt */}
            <BrandingPolaroids images={brandImages} />

            {/* Pinned numbered menu beside the gallery — each item opens the
                shared service-detail modal (light variant); falls back to a plain
                link if its detail page didn't resolve. */}
            <BrandingMenuPin sectionSelector=".svc-brand__body">
              <ServiceModalMenu services={brandServices} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" variant="light" />
            </BrandingMenuPin>
          </div>
        </div>

      </section>

      {/* ══ ENGINEERING ══ */}
      <section className="svc-dev">
        <div className="svc-dev__orb" aria-hidden="true" />
        <div className="svc-dev__inner">
          <Reveal className="section-head">
            <span className="svc-head-mark" aria-hidden="true" />
            {sp.devtitle && <h2 className="section-head__title">{stripHtml(sp.devtitle)}</h2>}
            {/* WP-sourced HTML — trusted backend only */}
            {sp.devtext && <div className="section-head__sub">{parse(sp.devtext)}</div>}
          </Reveal>

          <div className="svc-dev__body">
            <ServiceTechGroups groups={techGroups} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" />

            {sp.devleftimage?.node?.sourceUrl && (
              <Reveal yOffset={32} delay={0.1} className="svc-dev__img-wrap">
                <Parallax speed={0.85}>
                  <div className="svc-dev__img-inner">
                    <img src={wpImg(sp.devleftimage.node.sourceUrl) ?? ''} alt="" className="svc-dev__img" />
                    <div className="svc-dev__img-glow" aria-hidden="true" />
                  </div>
                </Parallax>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ══ CLIENTS ══ */}
      <ClientsSection
        logos={clientLogos}
        heading={ts?.ourClientsHeading ?? null}
        bigText={ts?.ourClientBigText ?? null}
        ctaText={ts?.cButton ?? null}
        locale={loc}
      />

      {/* ══ FAQ ══ */}
      {faqItems.length > 0 && <FAQSection heading={ts?.faqHeading ?? null} subtext={ts?.faqShortText ?? null} items={faqItems} />}

      <style>{`

        /* ─── Text selection ─────────────────────── */
        /* Dark sections: yellow highlight. Light/yellow sections invert it so the
           selection never matches the background. */
        ::selection { background: #fed125; color: #000; }
        .svc-hero ::selection, .svc-hero::selection { background: #0a0a0a; color: #fed125; }
        .svc-brand ::selection { background: #0a0a0a; color: #fff; }

        /* ─── Hero — bold yellow field ───────────── */
        .svc-hero {
          position: relative; min-height: 100vh; min-height: 100svh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 150px 0 120px;
          overflow: hidden;
          color: #0a0a0a;
          /* Depth gradient built from the WP yellow: a lighter crown up top, the
             core #fed125 through the middle, a slightly deeper base. */
          background:
            radial-gradient(125% 115% at 50% 6%,
              color-mix(in srgb, var(--svc-hero-bg, #fed125) 72%, #ffffff) 0%,
              var(--svc-hero-bg, #fed125) 44%,
              color-mix(in srgb, var(--svc-hero-bg, #fed125) 86%, #000000) 100%);
        }
        /* Soft spotlight behind the headline for extra depth. */
        .svc-hero::before {
          content: ''; position: absolute; z-index: 0; pointer-events: none;
          top: -14%; left: 50%; width: 80vw; height: 70vh; transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 60%);
          mix-blend-mode: soft-light;
        }
        /* Faint banner grid in black (echoes the original banner_grid texture). */
        .svc-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 92% 82% at 58% 42%, black 0%, transparent 100%);
        }
        /* WP portfolio overlay (portolio_layer.svg) — faint, large, upper-right. */
        .svc-hero__layer { position: absolute; top: -10%; right: -6%; width: min(58vw, 880px); z-index: 0; pointer-events: none; }
        .svc-hero__layer img { width: 100%; height: auto; opacity: 0.13; mix-blend-mode: multiply; }

        .svc-hero__shell {
          position: relative; z-index: 2; width: 100%;
          max-width: 980px; margin: 0 auto; padding: 0 clamp(24px, 5vw, 48px);
          display: flex; flex-direction: column; align-items: center;
        }
        .svc-hero__copy {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 22px; width: 100%;
        }

        .svc-hero__title-wrap { position: relative; display: inline-block; }
        .svc-hero__title {
          font-size: clamp(3.4rem, 10.5vw, 9rem); font-weight: 900;
          line-height: 0.88; letter-spacing: -0.055em;
          /* Metallic sheen sweeping across the dark letters — the "shiny" bit.
             Plain text (no SplitText) so background-clip is safe. */
          background: linear-gradient(110deg, #0a0a0a 0%, #0a0a0a 38%, #6b6b6b 50%, #0a0a0a 62%, #0a0a0a 100%);
          background-size: 260% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: heroShine 5.5s linear infinite;
        }
        @keyframes heroShine { from { background-position: 200% center; } to { background-position: -60% center; } }
        .svc-hero__title-rule {
          display: block; height: 6px; width: clamp(72px, 12vw, 140px);
          margin: 22px auto 0; border-radius: 999px;
          background: #0a0a0a;
          transform-origin: center;
        }
        html.gsap .svc-hero__title-rule { transform: scaleX(0); animation: heroRuleIn 0.9s var(--ease-smooth) 0.7s forwards; }
        @keyframes heroRuleIn { to { transform: scaleX(1); } }

        .svc-hero__bold {
          font-size: clamp(1.2rem, 2vw, 1.7rem); font-weight: 800;
          color: #0a0a0a; line-height: 1.22; letter-spacing: -0.015em; max-width: 26ch;
        }
        .svc-hero__short {
          font-size: clamp(1rem, 1.3vw, 1.15rem); color: rgba(10,10,10,0.72);
          line-height: 1.65; max-width: 52ch; font-weight: 500;
        }

        /* … collapse toggle — native <details>. The long statement stays in the
           DOM (SEO) but is hidden until the … is clicked. */
        .svc-hero__more-wrap { width: 100%; display: flex; justify-content: center; }
        .svc-hero__more { width: 100%; max-width: 760px; }
        .svc-hero__more-toggle {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; list-style: none; cursor: pointer;
          padding: 8px 14px; min-height: 44px; margin: 0 auto; border-radius: 999px;
          transition: background 0.2s;
        }
        .svc-hero__more-toggle::-webkit-details-marker { display: none; }
        .svc-hero__more-toggle::marker { content: ''; }
        .svc-hero__more-toggle:hover { background: rgba(10,10,10,0.06); }
        .svc-hero__more-toggle:focus-visible { outline: 2px solid #0a0a0a; outline-offset: 3px; }
        .svc-hero__dots { display: inline-flex; gap: 6px; }
        .svc-hero__dots i {
          width: 7px; height: 7px; border-radius: 50%; background: #0a0a0a; display: inline-block;
          animation: svcDots 1.4s ease-in-out infinite;
        }
        .svc-hero__dots i:nth-child(2) { animation-delay: 0.18s; }
        .svc-hero__dots i:nth-child(3) { animation-delay: 0.36s; }
        .svc-hero__more[open] .svc-hero__dots i { animation: none; opacity: 0.85; }
        @keyframes svcDots { 0%, 100% { opacity: 0.28; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }

        /* Expanded statement (WP moreText) — centered, readable measure. */
        .svc-hero__lead-text {
          margin: 18px auto 0; max-width: 720px; text-align: center;
          font-size: clamp(0.98rem, 1.3vw, 1.18rem);
          line-height: 1.62; color: rgba(10,10,10,0.78); font-weight: 400; letter-spacing: -0.005em;
        }
        .svc-hero__lead-text :is(b, strong) { color: #0a0a0a; font-weight: 700; }
        .svc-hero__lead-text a { color: #0a0a0a; text-decoration: none; border-bottom: 2px solid rgba(10,10,10,0.4); transition: border-color 0.2s; }
        .svc-hero__lead-text a:hover { border-bottom-color: #0a0a0a; }

        /* ── Jumping illustrations (WP) — float in the gutters around the copy ── */
        .svc-hero__jumps { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .svc-jump { position: absolute; display: block; transform: rotate(var(--jr, 0deg)); }
        .svc-jump__img { display: block; width: 100%; height: auto; filter: drop-shadow(0 12px 22px rgba(0,0,0,0.16)); }
        .svc-jump__shadow {
          position: absolute; left: 50%; bottom: -16px; width: 62%; height: 14px;
          transform: translateX(-50%); border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, transparent 70%);
        }
        .svc-jump--1 { width: clamp(140px, 15vw, 230px); top: 15%; left: 3%;  --jr: -6deg; }
        .svc-jump--2 { width: clamp(160px, 18vw, 280px); top: 30%; right: 2%; --jr: 5deg; z-index: 2; }
        .svc-jump--3 { width: clamp(88px, 10vw, 138px);  bottom: 14%; left: 9%; --jr: -3deg; }
        /* Entrance pop (motion only — gated by html.gsap). */
        html.gsap .svc-jump { opacity: 0; animation: svcJumpIn 0.7s var(--ease-back) forwards; }
        html.gsap .svc-jump--1 { animation-delay: 0.55s; }
        html.gsap .svc-jump--2 { animation-delay: 0.70s; }
        html.gsap .svc-jump--3 { animation-delay: 0.85s; }
        @keyframes svcJumpIn {
          from { opacity: 0; transform: scale(0.55) translateY(34px) rotate(var(--jr, 0deg)); }
          to   { opacity: 1; transform: scale(1) translateY(0) rotate(var(--jr, 0deg)); }
        }
        /* Continuous bounce on the inner image + ground shadow (kept off the
           wrapper so they don't fight its resting tilt / entrance). */
        .svc-jump__img { animation: svcBounce var(--bdur, 2.6s) ease-in-out var(--bdelay, 1.5s) infinite; }
        .svc-jump__shadow { animation: svcJumpShadow var(--bdur, 2.6s) ease-in-out var(--bdelay, 1.5s) infinite; }
        .svc-jump--1 .svc-jump__img, .svc-jump--1 .svc-jump__shadow { --bdur: 2.4s; --bdelay: 1.4s; }
        .svc-jump--2 .svc-jump__img, .svc-jump--2 .svc-jump__shadow { --bdur: 3.0s; --bdelay: 1.7s; }
        .svc-jump--3 .svc-jump__img, .svc-jump--3 .svc-jump__shadow { --bdur: 2.1s; --bdelay: 1.9s; }
        @keyframes svcBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-24px); } }
        @keyframes svcJumpShadow {
          0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.22; }
          50% { transform: translateX(-50%) scaleX(0.62); opacity: 0.08; }
        }

        .svc-scroll-cue {
          position: absolute; bottom: 78px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 4; pointer-events: none;
        }
        .svc-scroll-cue__line { width: 1px; height: 46px; background: linear-gradient(to bottom, transparent, rgba(10,10,10,0.5)); }
        .svc-scroll-cue__label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(10,10,10,0.5); }

        /* Bottom strip — inverted black band grounds the yellow field. */
        .svc-hero__strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          height: 54px; overflow: hidden; display: flex; align-items: center;
          background: #0a0a0a;
        }
        .svc-hero__strip-item {
          display: inline-flex; align-items: center; gap: 16px; padding: 0 30px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .svc-hero__strip-dot { color: #fed125; font-size: 8px; }

        @media (prefers-reduced-motion: reduce) {
          .svc-jump__img, .svc-jump__shadow, .svc-hero__dots i, .svc-hero__title { animation: none; }
        }

        @media (max-width: 980px) {
          .svc-hero__shell { max-width: 640px; }
          /* Jumps shrink to corner accents so they frame, not cover, the copy. */
          .svc-jump--1 { width: clamp(64px, 17vw, 104px); top: 9%;  left: 1%; }
          .svc-jump--2 { width: clamp(74px, 19vw, 118px); top: 7%;  right: 1%; }
          .svc-jump--3 { width: clamp(52px, 13vw, 84px);  bottom: 11%; left: auto; right: 5%; }
        }

        /* ─── Section accent mark (replaces decorative 01/02/03 eyebrows) ── */
        .svc-head-mark { display: block; width: 46px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #facc15, #fde047); }
        .svc-head-mark--dark { background: #0a0a0a; }
        .section-head .svc-head-mark { margin: 0 auto 24px; }
        /* Long unbreakable strings (compound terms / URLs from WP) must wrap rather
           than spill past the viewport on narrow screens. */
        .svc-hero__title, .section-head__title, .svc-tech-group__title,
        .svc-menu-item__title { overflow-wrap: break-word; }
        /* Bigger, Outcrowd-scale section headings across the page. */
        .svc-prod .section-head, .svc-brand .section-head, .svc-dev .section-head {
          --sh-title-size: clamp(2.8rem, 7vw, 6rem);
          --sh-sub-size: clamp(1.05rem, 1.6vw, 1.35rem);
          --sh-sub-max: 680px;
        }

        /* ─── Product Design ─────────────────────── */
        .svc-prod { position: relative; padding: 56px 0 0; }
        .svc-prod__inner { max-width: 1240px; margin: 0 auto; padding: 0 clamp(18px, 4vw, 32px); }
        .svc-prod__body { display: grid; grid-template-columns: 2fr 1fr; gap: 56px; align-items: start; }

        /* The Product scene is no longer pinned/scroll-scrubbed — <ProductMosaic>
           lays out every shot in one composition and assembles it in a single GSAP
           beat (see components/services/ProductMosaic.tsx). The gallery/card rules
           below style that mosaic and the mobile float-collage. */
        .svc-prod__gallery { display: flex; flex-direction: column; gap: 16px; }
        .svc-prod__row { display: flex; gap: 16px; align-items: flex-start; }
        .svc-prod__icons { display: flex; gap: 14px; padding-left: 28px; }
        .svc-img-card {
          position: relative; border-radius: 22px; overflow: hidden; background: #111;
          box-shadow: 0 18px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          transition: transform 0.7s cubic-bezier(.23,1,.32,1), box-shadow 0.7s;
        }
        .svc-img-card:hover { transform: translateY(-7px) scale(1.018); box-shadow: 0 32px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(250,204,21,0.1); }
        .svc-img-card--featured { width: 58%; align-self: flex-start; margin-bottom: 4px; }
        .svc-img-card--offset { margin-top: 40px; }
        .svc-img-card--up { margin-top: -28px; }
        .svc-img-card__img { width: 100%; height: auto; object-fit: cover; display: block; transition: transform 0.75s cubic-bezier(.23,1,.32,1); }
        .svc-img-card:hover .svc-img-card__img { transform: scale(1.06); }
        /* Motion path: <ProductMosaic> drives the card transform (entrance assemble
           + cursor tilt) through GSAP, so drop the CSS transform transition here —
           it would double-animate every quickTo frame. Hover box-shadow and the
           inner-image zoom stay pure CSS (and remain the full effect under
           reduced-motion / no-JS, where GSAP never runs). */
        html.gsap .svc-img-card { transition: box-shadow 0.7s; }
        html.gsap .svc-img-icon { transition: box-shadow 0.35s; }
        .svc-img-card__shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(128deg, transparent 36%, rgba(250,204,21,0.055) 50%, transparent 62%);
        }
        .svc-img-card__badge {
          position: absolute; bottom: 12px; left: 12px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;
          /* Solid translucent fill (no backdrop-filter — it forces a per-frame
             backdrop resample under ScrollSmoother, which stutters the scroll). */
          color: rgba(255,255,255,0.72); background: rgba(0,0,0,0.74);
          padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1);
        }
        .svc-img-icon {
          width: 96px; height: 96px; border-radius: 18px; overflow: hidden;
          background: #111; flex-shrink: 0;
          box-shadow: 0 10px 32px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.05);
          transition: transform 0.35s cubic-bezier(.23,1,.32,1), box-shadow 0.35s;
        }
        .svc-img-icon:hover { transform: translateY(-7px); box-shadow: 0 18px 44px rgba(0,0,0,0.64); }
        .svc-img-icon__img { width: 100%; height: 100%; object-fit: cover; }

        /* Numbered menus */
        .svc-prod__menu { position: sticky; top: 96px; padding-top: 8px; }
        /* Branding menu is pinned beside the gallery on desktop+motion. */
        .svc-brand__menu { padding-top: 8px; }
        .svc-menu-list { list-style: none; padding: 0; margin: 0; }
        .svc-menu-item {
          position: relative; padding: 22px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: padding-left 0.28s cubic-bezier(.23,1,.32,1);
        }
        .svc-menu-item::before {
          content: ''; position: absolute; left: -12px; top: 0; bottom: 0; width: 3px;
          background: #facc15; transform: scaleY(0); transform-origin: top;
          transition: transform 0.38s cubic-bezier(.23,1,.32,1);
        }
        .svc-menu-item:hover { padding-left: 10px; }
        .svc-menu-item:hover::before { transform: scaleY(1); }
        .svc-menu-item--light { border-color: rgba(0,0,0,0.1); }
        .svc-menu-item--light::before { background: #0a0a0a; }
        .svc-menu-item__num {
          display: block; font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(250,204,21,0.7); margin-bottom: 6px;
        }
        .svc-menu-item__num--dark { color: rgba(0,0,0,0.4); }
        .svc-menu-item__title {
          display: block; text-decoration: none;
          font-size: clamp(1.1rem, 2vw, 1.65rem);
          font-weight: 800; color: #fff; line-height: 1.18;
          letter-spacing: -0.02em; transition: color 0.2s;
        }
        .svc-menu-item__title--dark { color: #0a0a0a; }
        a.svc-menu-item__title:hover { color: #facc15; }
        a.svc-menu-item__title--dark:hover { color: #555; }

        /* ─── Branding ───────────────────────────── */
        .svc-brand { position: relative; background: #f0eeea; color: #0a0a0a; }
        .svc-brand__dots {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.13) 1.2px, transparent 1.2px);
          background-size: 36px 36px; opacity: 0.5;
        }
        /* Centered, balanced 2-col: polaroid gallery + pinned menu, symmetric margins. */
        .svc-brand__inner { max-width: 1180px; margin: 0 auto; padding: clamp(80px, 9vw, 120px) clamp(18px, 4vw, 32px); position: relative; z-index: 1; }
        .svc-brand__body { display: grid; grid-template-columns: 2.1fr 1fr; gap: clamp(40px, 5vw, 64px); align-items: start; }
        .svc-polaroid-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        /* Entry + tilt-settle is driven by <BrandingPolaroids> (GSAP). These
           resting rotations are the reduced-motion / no-JS fallback; GSAP
           animates to the same angles for motion users. */
        .svc-polaroid:nth-child(1) .svc-polaroid__frame { transform: rotate(-2.5deg); }
        .svc-polaroid:nth-child(2) .svc-polaroid__frame { transform: rotate(1.8deg); }
        .svc-polaroid:nth-child(3) .svc-polaroid__frame { transform: rotate(-1.2deg); }
        .svc-polaroid:nth-child(4) .svc-polaroid__frame { transform: rotate(2.1deg); }
        .svc-polaroid:nth-child(5) .svc-polaroid__frame { transform: rotate(-0.9deg); }
        .svc-polaroid:nth-child(6) .svc-polaroid__frame { transform: rotate(1.5deg); }
        .svc-polaroid__frame {
          background: #fff; padding: 9px 9px 30px;
          box-shadow: 0 10px 36px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.07);
          transition: transform 0.42s cubic-bezier(.23,1,.32,1), box-shadow 0.42s;
        }
        /* Motion path: GSAP owns the frame transform during the deal, so suppress
           the CSS transform transition until the frame has settled (then it powers
           the hover-straighten). */
        html.gsap .svc-polaroid__frame { transition: box-shadow 0.42s; }
        html.gsap .svc-polaroid__frame.is-settled { transition: transform 0.42s var(--ease-smooth), box-shadow 0.42s; }
        .svc-polaroid:hover .svc-polaroid__frame { transform: rotate(0deg) scale(1.04) !important; box-shadow: 0 22px 60px rgba(0,0,0,0.24); }
        .svc-polaroid__img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }

        /* ─── Engineering ────────────────────────── */
        .svc-dev { position: relative; padding: 112px 0 128px; background: #080808; }
        .svc-dev__orb {
          position: absolute; top: -6%; right: -4%;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 65%);
          filter: blur(90px); pointer-events: none;
        }
        .svc-dev__inner { max-width: 1180px; margin: 0 auto; padding: 0 clamp(18px, 4vw, 32px); position: relative; z-index: 2; }
        /* Horizontal, balanced 2-col: tech groups beside the engineering image. */
        .svc-dev__body { display: grid; grid-template-columns: 1fr 1.05fr; gap: clamp(40px, 5vw, 72px); align-items: center; }
        .svc-dev__lists { display: flex; flex-direction: column; }
        .svc-tech-group { padding: 30px 0; border-top: 1px solid rgba(255,255,255,0.1); }
        .svc-tech-group:first-child { border-top: 0; padding-top: 0; }
        .svc-tech-group:last-child { padding-bottom: 0; }
        .svc-tech-group__title {
          font-size: clamp(1.45rem, 2.6vw, 2.2rem);
          font-weight: 800; color: #fff; line-height: 1.12;
          letter-spacing: -0.02em; margin-bottom: 14px;
        }
        .svc-tech-group__sub { font-size: clamp(0.95rem, 1.3vw, 1.08rem); color: rgba(255,255,255,0.6); line-height: 1.65; margin-bottom: 16px; max-width: 44ch; }
        .svc-tech-link { color: inherit; text-decoration: none; transition: color 0.2s; }
        .svc-tech-link:hover { color: #facc15; }
        .svc-tech-chips { display: flex; flex-wrap: wrap; gap: 9px; list-style: none; padding: 0; margin: 0; }
        .svc-tech-chip {
          font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.72);
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.11);
          border-radius: 999px; padding: 6px 14px;
          transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.34s var(--ease-back); cursor: default;
        }
        .svc-tech-chip:hover { color: #facc15; background: rgba(250,204,21,0.07); border-color: rgba(250,204,21,0.22); transform: translateY(-3px); }
        @media (prefers-reduced-motion: reduce) { .svc-tech-chip:hover { transform: none; } }
        .svc-dev__img-inner { position: relative; }
        .svc-dev__img {
          width: 100%; height: auto; object-fit: contain;
          filter: drop-shadow(0 24px 72px rgba(0,0,0,0.72));
          transition: transform 0.6s cubic-bezier(.23,1,.32,1);
        }
        .svc-dev__img-wrap:hover .svc-dev__img { transform: translateY(-10px) scale(1.025); }
        .svc-dev__img-glow {
          position: absolute; inset: 5%; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.055) 0%, transparent 70%);
          filter: blur(44px); pointer-events: none; z-index: -1;
        }

        /* ─── Responsive ─────────────────────────── */
        @media (max-width: 1100px) {
          .svc-prod__body, .svc-brand__body { grid-template-columns: 1fr; gap: 32px; }
          .svc-dev__body { grid-template-columns: 1fr; }
          .svc-prod__menu, .svc-brand__menu { position: static; margin-top: 40px; }
        }
        @media (max-width: 768px) {

          /* ── Hero ── */
          .svc-hero { padding: 96px 0 64px; min-height: auto; }
          .svc-scroll-cue { display: none; }
          .svc-hero__shell { padding: 0 20px; gap: 28px; }
          .svc-hero__copy { gap: 16px; }
          .svc-hero__title { font-size: clamp(2.6rem, 13vw, 4.2rem); }
          .svc-hero__title-rule { margin-top: 16px; }
          .svc-hero__jumps { min-height: clamp(220px, 70vw, 320px); }
          .svc-hero__strip { height: 46px; }
          .svc-hero__lead-text { font-size: 1.04rem; }

          /* ── Section spacing (horizontal gutter scales fluidly via the base clamp) ── */
          .svc-prod { padding-top: 36px; }
          .svc-dev { padding: 36px 0 44px; }
          .svc-brand__inner { padding-block: 36px; }

          /* ── Section heads ── */
          .section-head { margin-bottom: 24px; }
          .section-head__title { font-size: clamp(1.8rem, 7vw, 3.2rem) !important; line-height: 1.08 !important; }

          /* ── Product mosaic → responsive grid (every shot visible) ──
             The rows dissolve (display:contents) so each shot becomes a cell in a
             2-col grid; the lead shot spans the full width and the thumbnail strip
             sits centered below. No scroll-scrub and nothing hidden — the whole body
             of work reads at a glance on a phone too. */
          .svc-prod__gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
          .svc-prod__row { display: contents; }
          .svc-img-card--featured { grid-column: 1 / -1; width: 100%; margin: 0; }
          .svc-img-card--offset, .svc-img-card--up { margin: 0; }
          .svc-img-card:hover { transform: none; }
          .svc-prod__icons { grid-column: 1 / -1; padding-left: 0; justify-content: center; flex-wrap: wrap; }
          /* Remove the 40px gap the 1100px rule adds between gallery and menu */
          .svc-prod__menu { margin-top: 12px; }

          /* ── Polaroids → 2-col, no rotation (rotations distort on mobile) ── */
          .svc-polaroid-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .svc-polaroid__frame { padding: 6px 6px 20px; }
          .svc-polaroid:nth-child(n) .svc-polaroid__frame { transform: none !important; }
          .svc-polaroid:hover .svc-polaroid__frame { transform: none !important; }

          /* ── Dev / tech groups ── */
          .svc-dev__body { gap: 36px; }
          .svc-dev__lists { gap: 28px; }
          .svc-tech-group__title { font-size: clamp(1.1rem, 4.5vw, 1.5rem); }

          /* ── Service menus ── */
          .svc-menu-item { padding: 14px 0; }
          .svc-menu-item__title { font-size: clamp(1rem, 4.5vw, 1.4rem); }
        }
      `}</style>
    </main>
  )
}
