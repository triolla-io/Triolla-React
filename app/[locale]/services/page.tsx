import { client } from '@/lib/apollo-client'
import { GET_SERVICES_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
import { enrichServiceDetails } from '@/lib/service-details'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { SectionReveal } from '@/components/SectionReveal'
import { FadeIn } from '@/components/FadeIn'
import { FAQSection } from '@/components/FAQSection'
import { Reveal } from '@/components/gsap/Reveal'
import { SplitReveal } from '@/components/gsap/SplitReveal'
import { Parallax } from '@/components/gsap/Parallax'
import { HeroMarquee } from '@/components/services/HeroMarquee'
import { ClientsSection } from '@/components/ClientsSection'
import { ServiceModalMenu } from '@/components/ServiceModalMenu'
import { ServiceTechGroups, type TechGroup } from '@/components/ServiceTechGroups'
import { GrainOverlay, GlowOrb, Eyebrow, Button } from '@/components/ui'
import parse from 'html-react-parser'
import type { GetServicesPageData, GetThemeSettingsData, ServicesPageFields, ThemeOptions, WPImage } from '@/lib/graphql-types'
import { wpImg } from '@/lib/images'
import { isLocale, defaultLocale, PAGE_URI, localizeHref } from '@/lib/i18n'
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

      {/* ══ HERO ══ */}
      <section className="svc-hero">
        {/* animation="none" preserves base CSS transform (-translate-x-1/2) and matches
            frame-0 opacity of the original svcOrbGold (0.85) / svcOrbAmber (0.6) keyframes.
            Each layer drifts at a different data-speed for multi-plane parallax. */}
        <Parallax speed={1.15}>
          <GlowOrb
            size={900}
            height={480}
            shape="ellipse"
            fade="70%"
            blur={80}
            color="rgba(250,204,21,0.13)"
            className="bottom-[-12%] left-1/2 -translate-x-1/2 z-0 opacity-85"
          />
        </Parallax>
        <Parallax speed={0.9}>
          <GlowOrb size={640} fade="65%" blur={80} color="rgba(251,146,60,0.055)" className="top-[-8%] left-[-12%] z-0 opacity-60" />
        </Parallax>
        <Parallax speed={1.05}>
          <div className="svc-hero__grid" aria-hidden="true" />
        </Parallax>

        {/* Corner frame brackets */}
        <div className="svc-hero__corner svc-hero__corner--tl" aria-hidden="true" />
        <div className="svc-hero__corner svc-hero__corner--tr" aria-hidden="true" />
        <div className="svc-hero__corner svc-hero__corner--bl" aria-hidden="true" />
        <div className="svc-hero__corner svc-hero__corner--br" aria-hidden="true" />

        {/* Ghost number */}
        <Parallax speed={0.8} className="svc-hero__ghost-wrap">
          <div className="svc-hero__ghost" aria-hidden="true">
            01
          </div>
        </Parallax>

        {/* Editorial index top-right */}
        <div className="svc-hero__index" aria-hidden="true">
          — SERVICES —
        </div>

        {sp.headerBgOverlayLayer?.node?.sourceUrl && (
          <div className="svc-hero__layer" aria-hidden="true">
            <img src={wpImg(sp.headerBgOverlayLayer.node.sourceUrl) ?? ''} alt="" />
          </div>
        )}

        <div className="svc-hero__content">
          {sp.headerSubText && (
            <Reveal yOffset={20} duration={0.7}>
              <Eyebrow
                ornament="dot"
                align="center"
                style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.32em', '--eb-dot': '5px' } as React.CSSProperties}
              >
                {sp.headerSubText}
              </Eyebrow>
            </Reveal>
          )}

          <SplitReveal
            text={heroTitle}
            type="lines"
            className="gradient-text gradient-text--animate text-[clamp(3.6rem,11vw,128px)] font-black leading-[0.88] tracking-[-0.055em] mb-12 [word-break:break-word]"
            style={{ '--gt-gradient': 'linear-gradient(135deg,#fff 38%,#facc15 52%,#fff 68%)' } as React.CSSProperties}
          />

          <Reveal delay={0.22} duration={0.8}>
            <div className="svc-hero__rule" aria-hidden="true" />
          </Reveal>

          <div className="svc-hero__meta">
            <div className="svc-hero__meta-l">
              {sp.boldText && (
                <Reveal yOffset={16} delay={0.32}>
                  <p className="svc-hero__bold">{sp.boldText}</p>
                </Reveal>
              )}
              {sp.shortText && (
                <Reveal yOffset={14} delay={0.4}>
                  <p className="svc-hero__short">{sp.shortText}</p>
                </Reveal>
              )}
            </div>
            <div className="svc-hero__meta-r">
              {sp.moreText && (
                <Reveal yOffset={14} delay={0.46}>
                  {/* WP-sourced HTML — trusted backend only */}
                  <div className="svc-hero__more">{parse(sp.moreText)}</div>
                </Reveal>
              )}
              {sp.buttonText && (
                <Reveal yOffset={20} delay={0.56}>
                  <Button
                    href={localizeHref('/contact-us', loc)}
                    variant="primary"
                    style={
                      {
                        '--btn-pad': '16px 34px',
                        '--btn-gap': '10px',
                        boxShadow: '0 4px 28px rgba(250,204,21,0.24)',
                      } as React.CSSProperties
                    }
                  >
                    {sp.buttonText}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path
                        d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </Reveal>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue — above the strip */}
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
          <FadeIn className="section-head">
            <Eyebrow
              ornament="line"
              align="center"
              color="rgba(255,255,255,0.3)"
              style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.32em' } as React.CSSProperties}
            >
              — 01 —
            </Eyebrow>
            {sp.prodtitle && <h2 className="section-head__title">{stripHtml(sp.prodtitle)}</h2>}
            {/* WP-sourced HTML — trusted backend only */}
            {sp.proddtxt && <div className="section-head__sub">{parse(sp.proddtxt)}</div>}
          </FadeIn>

          <div className="svc-prod__body">
            {/* Mobile-only: 3-card floating collage */}
            {(prodImages[0] || prodImages[1] || prodImages[2]) && (
              <div className="svc-mobile-collage md:hidden" aria-hidden="true">
                {prodImages[0] && (
                  <div className="svc-mc-card svc-mc-card--a">
                    <img src={wpImg(prodImages[0]) ?? ''} alt="" />
                  </div>
                )}
                {prodImages[1] && (
                  <div className="svc-mc-card svc-mc-card--b">
                    <img src={wpImg(prodImages[1]) ?? ''} alt="" />
                  </div>
                )}
                {prodImages[2] && (
                  <div className="svc-mc-card svc-mc-card--c">
                    <img src={wpImg(prodImages[2]) ?? ''} alt="" />
                  </div>
                )}
              </div>
            )}

            {/* Left: image collage (desktop only, hidden via CSS on mobile) */}
            <div className="svc-prod__gallery">
              {prodImages[0] && (
                <div className="svc-img-card svc-img-card--featured">
                  <img src={wpImg(prodImages[0]) ?? ''} alt="" className="svc-img-card__img" />
                  <div className="svc-img-card__shine" aria-hidden="true" />
                  <span className="svc-img-card__badge">UI Design</span>
                </div>
              )}
              {(prodImages[1] || prodImages[2]) && (
                <div className="svc-prod__row">
                  {prodImages[1] && (
                    <div className="svc-img-card" style={{ flex: '2' }}>
                      <img src={wpImg(prodImages[1]) ?? ''} alt="" className="svc-img-card__img" />
                      <div className="svc-img-card__shine" aria-hidden="true" />
                    </div>
                  )}
                  {prodImages[2] && (
                    <div className="svc-img-card svc-img-card--offset" style={{ flex: '3' }}>
                      <img src={wpImg(prodImages[2]) ?? ''} alt="" className="svc-img-card__img" />
                      <div className="svc-img-card__shine" aria-hidden="true" />
                    </div>
                  )}
                </div>
              )}
              {(prodImages[3] || prodImages[4] || prodImages[5]) && (
                <div className="svc-prod__row">
                  {[prodImages[3], prodImages[4], prodImages[5]].filter(Boolean).map((img, i) => (
                    <div key={i} className={`svc-img-card${i === 1 ? ' svc-img-card--up' : ''}`} style={{ flex: '1' }}>
                      <img src={wpImg(img) ?? ''} alt="" className="svc-img-card__img" />
                      <div className="svc-img-card__shine" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              )}
              {(prodImages[6] || prodImages[7] || prodImages[8]) && (
                <div className="svc-prod__icons">
                  {[prodImages[6], prodImages[7], prodImages[8]].filter(Boolean).map((img, i) => (
                    <div key={i} className="svc-img-icon">
                      <img src={wpImg(img) ?? ''} alt="" className="svc-img-icon__img" />
                    </div>
                  ))}
                </div>
              )}
            </div>

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
          <FadeIn className="section-head" style={{ '--sh-title-color': '#0a0a0a', '--sh-sub-color': '#4b5563' } as React.CSSProperties}>
            <Eyebrow
              ornament="line"
              align="center"
              color="rgba(0,0,0,0.45)"
              style={
                {
                  '--eb-gap': '14px',
                  '--eb-size': '10px',
                  '--eb-spacing': '0.32em',
                  '--eb-line-bg': 'rgba(0,0,0,0.35)',
                  '--eb-line-opacity': '1',
                } as React.CSSProperties
              }
            >
              — 02 —
            </Eyebrow>
            {sp.brandtitle && <h2 className="section-head__title">{stripHtml(sp.brandtitle)}</h2>}
            {/* WP-sourced HTML — trusted backend only */}
            {sp.brandtext && <div className="section-head__sub">{parse(sp.brandtext)}</div>}
          </FadeIn>

          <div className="svc-brand__body">
            {/* Left: polaroid gallery */}
            <SectionReveal className="svc-polaroid-grid">
              {brandImages.map((img, i) => (
                <div key={i} className="svc-polaroid" style={{ '--pi': i } as React.CSSProperties}>
                  <div className="svc-polaroid__frame">
                    <img src={wpImg(img) ?? ''} alt="" className="svc-polaroid__img" />
                  </div>
                </div>
              ))}
            </SectionReveal>

            {/* Right: sticky numbered menu — each item opens the shared
                service-detail modal (light variant); falls back to a plain link
                if its detail page didn't resolve. */}
            <div className="svc-brand__menu">
              <ServiceModalMenu services={brandServices} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" variant="light" />
            </div>
          </div>
        </div>

      </section>

      {/* ══ ENGINEERING ══ */}
      <section className="svc-dev">
        <div className="svc-dev__orb" aria-hidden="true" />
        <div className="svc-dev__inner">
          <FadeIn className="section-head">
            <Eyebrow
              ornament="line"
              align="center"
              color="rgba(255,255,255,0.3)"
              style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.32em' } as React.CSSProperties}
            >
              — 03 —
            </Eyebrow>
            {sp.devtitle && <h2 className="section-head__title">{stripHtml(sp.devtitle)}</h2>}
            {/* WP-sourced HTML — trusted backend only */}
            {sp.devtext && <div className="section-head__sub">{parse(sp.devtext)}</div>}
          </FadeIn>

          <div className="svc-dev__body">
            <ServiceTechGroups groups={techGroups} ctaText={sp.buttonText ?? null} ctaLink="/contact-us" />

            {sp.devleftimage?.node?.sourceUrl && (
              <FadeIn delay={0.18} yOffset={32} className="svc-dev__img-wrap">
                <div className="svc-dev__img-inner">
                  <img src={wpImg(sp.devleftimage.node.sourceUrl) ?? ''} alt="" className="svc-dev__img" />
                  <div className="svc-dev__img-glow" aria-hidden="true" />
                </div>
              </FadeIn>
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
        ::selection { background: #fed125; color: #000; }
        .svc-brand ::selection { background: #0a0a0a; color: #fff; }

        /* ─── Hero ───────────────────────────────── */
        .svc-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 128px 24px 164px;
          overflow: hidden;
        }
        .svc-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 50%, black 0%, transparent 100%);
        }
        .svc-hero__corner {
          position: absolute; width: 28px; height: 28px;
          pointer-events: none; z-index: 2;
        }
        .svc-hero__corner--tl { top: 88px; left: 48px; border-top: 1.5px solid rgba(250,204,21,0.32); border-left: 1.5px solid rgba(250,204,21,0.32); }
        .svc-hero__corner--tr { top: 88px; right: 48px; border-top: 1.5px solid rgba(250,204,21,0.32); border-right: 1.5px solid rgba(250,204,21,0.32); }
        .svc-hero__corner--bl { bottom: 168px; left: 48px; border-bottom: 1.5px solid rgba(250,204,21,0.32); border-left: 1.5px solid rgba(250,204,21,0.32); }
        .svc-hero__corner--br { bottom: 168px; right: 48px; border-bottom: 1.5px solid rgba(250,204,21,0.32); border-right: 1.5px solid rgba(250,204,21,0.32); }
        .svc-hero__ghost {
          position: absolute; top: 50%; right: -2%; transform: translateY(-52%);
          font-size: clamp(180px, 26vw, 400px); font-weight: 900; line-height: 1;
          color: rgba(250,204,21,0.026); pointer-events: none; user-select: none;
          letter-spacing: -0.06em; z-index: 0;
        }
        .svc-hero__index {
          position: absolute; top: 52px; right: 72px; z-index: 3;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(255,255,255,0.17);
        }
        .svc-hero__layer {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .svc-hero__layer img {
          width: 100%; height: 100%; object-fit: cover; mix-blend-mode: screen; opacity: 0.08;
        }
        .svc-hero__content {
          position: relative; z-index: 2;
          max-width: 1100px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .svc-hero__rule {
          width: 52%; max-width: 540px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(250,204,21,0.38), transparent);
          margin-bottom: 44px;
        }
        .svc-hero__meta {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px; max-width: 680px;
        }
        .svc-hero__meta-l { display: flex; flex-direction: column; gap: 10px; align-items: center; }
        .svc-hero__meta-r { display: flex; flex-direction: column; gap: 18px; align-items: center; }
        .svc-hero__bold { font-size: clamp(1rem,1.9vw,1.4rem); font-weight: 700; color: rgba(255,255,255,0.88); line-height: 1.35; }
        .svc-hero__short { font-size: 1rem; color: rgba(255,255,255,0.46); line-height: 1.74; max-width: 560px; }
        .svc-hero__more { font-size: 0.9rem; color: rgba(255,255,255,0.32); line-height: 1.8; max-width: 560px; }
        .svc-scroll-cue {
          position: absolute; bottom: 72px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 4; pointer-events: none;
        }
        .svc-scroll-cue__line {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, transparent, rgba(250,204,21,0.55));
          animation: svcScrollPulse 2s ease-in-out infinite;
        }
        .svc-scroll-cue__label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.26); }
        @keyframes svcScrollPulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.1)} }
        .svc-hero__strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          height: 52px; overflow: hidden;
          display: flex; align-items: center;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.6); backdrop-filter: blur(12px);
        }
        .svc-hero__strip-item {
          display: inline-flex; align-items: center; gap: 14px; padding: 0 28px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .svc-hero__strip-dot { color: #facc15; font-size: 7px; }

        /* ─── Product Design ─────────────────────── */
        .svc-prod { position: relative; padding: 112px 0 0; }
        .svc-prod__inner { max-width: 1400px; margin: 0 auto; padding: 0 32px; }
        .svc-prod__body { display: grid; grid-template-columns: 3fr 1fr; gap: 64px; align-items: start; }
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
        .svc-img-card__shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(128deg, transparent 36%, rgba(250,204,21,0.055) 50%, transparent 62%);
        }
        .svc-img-card__badge {
          position: absolute; bottom: 12px; left: 12px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase;
          color: rgba(255,255,255,0.65); background: rgba(0,0,0,0.52); backdrop-filter: blur(10px);
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
        .svc-brand__menu { position: sticky; top: 96px; padding-top: 8px; }
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
          display: block; font-size: 9px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(255,255,255,0.2); margin-bottom: 5px;
        }
        .svc-menu-item__num--dark { color: rgba(0,0,0,0.28); }
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
        .svc-brand__inner { max-width: 1400px; margin: 0 auto; padding: 80px 32px; position: relative; z-index: 1; }
        .svc-brand__body { display: grid; grid-template-columns: 3fr 1fr; gap: 64px; align-items: start; }
        .svc-polaroid-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .svc-polaroid {
          animation: svcPolaroidIn 0.65s cubic-bezier(.23,1,.32,1) both;
          animation-delay: calc(var(--pi, 0) * 0.11s + 0.15s);
        }
        @keyframes svcPolaroidIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
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
        .svc-dev__inner { max-width: 1400px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 2; }
        .svc-dev__body { display: grid; grid-template-columns: 1fr 1.3fr; gap: 80px; align-items: start; }
        .svc-dev__lists { display: flex; flex-direction: column; gap: 52px; }
        .svc-tech-group__title {
          font-size: clamp(1.3rem, 2.2vw, 1.9rem);
          font-weight: 800; color: #fff; line-height: 1.12;
          letter-spacing: -0.02em; margin-bottom: 12px;
        }
        .svc-tech-group__sub { font-size: 0.88rem; color: #6b7280; line-height: 1.62; margin-bottom: 14px; }
        .svc-tech-link { color: inherit; text-decoration: none; transition: color 0.2s; }
        .svc-tech-link:hover { color: #facc15; }
        .svc-tech-chips { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin: 0; }
        .svc-tech-chip {
          font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.048); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px; padding: 5px 13px;
          transition: color 0.2s, background 0.2s, border-color 0.2s; cursor: default;
        }
        .svc-tech-chip:hover { color: #facc15; background: rgba(250,204,21,0.07); border-color: rgba(250,204,21,0.22); }
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
          .svc-hero { padding: 56px 20px 48px; min-height: auto; }
          .svc-scroll-cue { display: none; }
          .svc-hero__corner { display: none; }
          .svc-hero__ghost { font-size: clamp(100px, 36vw, 160px); opacity: 0.015; }
          .svc-hero__index { right: 16px; top: 18px; }
          .svc-hero__rule { margin-bottom: 20px; }
          /* reduce headline mb (tailwind mb-12 = 3rem) */
          .svc-hero__content h1 { margin-bottom: 20px !important; }

          /* ── Section spacing ── */
          .svc-prod__inner, .svc-dev__inner { padding: 0 18px; }
          .svc-prod { padding-top: 36px; }
          .svc-dev { padding: 36px 0 44px; }
          .svc-brand__inner { padding: 36px 18px; }

          /* ── Section heads ── */
          .section-head { margin-bottom: 24px; }
          .section-head__title { font-size: clamp(1.8rem, 7vw, 3.2rem) !important; line-height: 1.08 !important; }

          /* ── Mobile collage ── */
          .svc-mobile-collage {
            overflow: hidden; /* clip rotation bleed */
            padding: 4px 4px 24px;
          }
          /* A — smaller, slides in from LEFT */
          .svc-mc-card--a {
            position: relative;
            width: 62%;
            aspect-ratio: 4/3;
            border-radius: 16px; overflow: hidden;
            box-shadow: 0 18px 52px rgba(0,0,0,0.62), 0 0 0 1px rgba(255,255,255,0.05);
            z-index: 2;
            animation: svcMcA 9s ease-in-out infinite,
                       svcSlideLeft 1.1s cubic-bezier(0.23,1,0.32,1) 0.1s both;
          }
          /* B — slides in from RIGHT */
          .svc-mc-card--b {
            position: relative;
            width: 66%;
            aspect-ratio: 4/3;
            border-radius: 15px; overflow: hidden;
            margin-top: -44px;
            margin-left: auto;
            margin-right: 4px;
            box-shadow: 0 14px 44px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04);
            z-index: 3;
            animation: svcMcB 12s ease-in-out 1.5s infinite,
                       svcSlideRight 1.1s cubic-bezier(0.23,1,0.32,1) 0.3s both;
          }
          /* C — square, slides in from BOTTOM */
          .svc-mc-card--c {
            position: relative;
            width: 46%;
            aspect-ratio: 1/1;
            border-radius: 14px; overflow: hidden;
            margin-top: -30px;
            margin-left: 14px;
            box-shadow: 0 10px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(250,204,21,0.12);
            z-index: 4;
            animation: svcMcC 15s ease-in-out 0.8s infinite,
                       svcSlideUp 1.0s cubic-bezier(0.23,1,0.32,1) 0.5s both;
          }
          .svc-mc-card img { width: 100%; height: 100%; object-fit: cover; display: block; }

          /* Float loops */
          @keyframes svcMcA {
            0%,100% { transform: rotate(-2deg) translateY(0); }
            50%      { transform: rotate(-1.3deg) translateY(-8px); }
          }
          @keyframes svcMcB {
            0%,100% { transform: rotate(2.2deg) translateY(0); }
            50%      { transform: rotate(1.5deg) translateY(-6px); }
          }
          @keyframes svcMcC {
            0%,100% { transform: rotate(-0.7deg) translateY(0); }
            50%      { transform: rotate(-0.1deg) translateY(-5px); }
          }
          /* Slide-in entrances */
          @keyframes svcSlideLeft {
            from { opacity: 0; transform: translateX(-48px) rotate(-2deg); }
            to   { opacity: 1; transform: translateX(0)    rotate(-2deg); }
          }
          @keyframes svcSlideRight {
            from { opacity: 0; transform: translateX(48px) rotate(2.2deg); }
            to   { opacity: 1; transform: translateX(0)   rotate(2.2deg); }
          }
          @keyframes svcSlideUp {
            from { opacity: 0; transform: translateY(40px) rotate(-0.7deg); }
            to   { opacity: 1; transform: translateY(0)    rotate(-0.7deg); }
          }

          /* Hide desktop gallery on mobile via CSS (Tailwind max-md: unreliable in v4) */
          .svc-prod__gallery,
          .svc-prod__row,
          .svc-prod__icons { display: none; }
          .svc-img-card:hover { transform: none; }
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
