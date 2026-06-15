import { client } from '@/lib/apollo-client'
import { GET_ABOUT_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import Link from 'next/link'
import { FadeIn } from '@/components/FadeIn'
import { FAQAccordion } from '@/components/FAQAccordion'
import { AboutImageCarousel } from '@/components/AboutImageCarousel'
import { WhyUsSection } from '@/components/WhyUsSection'
import AnimatedSteps from '@/components/AnimatedSteps'
import { ClientsSection } from '@/components/ClientsSection'
import { GrainOverlay, GlowOrb, Eyebrow, Marquee, WaveDivider, Button } from '@/components/ui'
import parse from 'html-react-parser'
import type { GetAboutPageData, GetThemeSettingsData, AboutPageFields, ThemeOptions, WPImage } from '@/lib/graphql-types'
import { wpImg } from '@/lib/images'

const ABOUT_PAGE_QUERY: TypedDocumentNode<GetAboutPageData> = gql`
  ${GET_ABOUT_PAGE}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function getAboutData(): Promise<AboutPageFields> {
  try {
    const { data } = await client.query({ query: ABOUT_PAGE_QUERY })
    return data?.page?.template?.aboutPage ?? ({} as AboutPageFields)
  } catch {
    return {} as AboutPageFields
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

export default async function AboutUsPage() {
  const [ap, ts] = await Promise.all([getAboutData(), getThemeSettings()])

  const faqItems: { faqQuestion: string; faqAnswer: string }[] = ap.faqItems ?? []
  const clientLogos: { url: string; alt: string }[] = (ap.clientLogos ?? []).flatMap(
    (l: { logoImage: WPImage | null; logoName: string | null }) => {
      const url = l.logoImage?.node?.sourceUrl
      return url ? [{ url, alt: l.logoName ?? '' }] : []
    },
  )

  const heroTitle = stripHtml(ap.headerTitle ?? '')

  // Showcase images for the carousel directly below the hero
  const showcaseImages = [
    ap.abtopleftImageTop?.node?.sourceUrl,
    ap.abtopleftImageTwo?.node?.sourceUrl,
    ap.leftImageTopThree?.node?.sourceUrl,
  ].filter(Boolean) as string[]

  // Category strip at bottom of hero — derived from why-us card titles
  const heroStripWords = (ap.abthrelist ?? [])
    .flatMap((c: { abteintitle: string | null; abthreintext: string | null; abthreimage: WPImage | null }) => {
      const text = stripHtml(c.abteintitle ?? '')
      return text ? [text] : []
    })
    .slice(0, 6)

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-32 relative">
      {/* Grain overlay */}
      <GrainOverlay />

      {/* ══ HERO ══ */}
      <section className="about-hero">
        <GlowOrb
          size={900}
          height={480}
          shape="ellipse"
          fade="70%"
          blur={80}
          color="rgba(250,204,21,0.14)"
          className="bottom-[-12%] left-1/2 -translate-x-1/2 z-0 opacity-85"
        />
        <GlowOrb size={640} fade="65%" blur={80} color="rgba(251,146,60,0.06)" className="top-[-8%] left-[-12%] z-0 opacity-60" />
        <div className="about-hero__grid" aria-hidden="true" />

        {/* Corner frame brackets */}
        <div className="about-hero__corner about-hero__corner--tl" aria-hidden="true" />
        <div className="about-hero__corner about-hero__corner--tr" aria-hidden="true" />
        <div className="about-hero__corner about-hero__corner--bl" aria-hidden="true" />
        <div className="about-hero__corner about-hero__corner--br" aria-hidden="true" />

        {/* Ghost number */}
        <div className="about-hero__ghost" aria-hidden="true">
          01
        </div>

        {/* Editorial section index */}
        <div className="about-hero__index" aria-hidden="true">
          — ABOUT —
        </div>

        {ap.headerBgOverlayLayer?.node?.sourceUrl && (
          <div className="about-hero__layer" aria-hidden="true">
            <img src={wpImg(ap.headerBgOverlayLayer.node.sourceUrl) ?? ''} alt="" />
          </div>
        )}

        <div className="about-hero__content">
          {ap.headerSubText && (
            <FadeIn yOffset={20} duration={0.7}>
              <Eyebrow
                ornament="dot"
                align="center"
                style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.32em', '--eb-dot': '5px' } as React.CSSProperties}
              >
                {ap.headerSubText}
              </Eyebrow>
            </FadeIn>
          )}

          {heroTitle && (
            <FadeIn yOffset={70} delay={0.1} duration={1}>
              <h1
                className="gradient-text gradient-text--animate text-[clamp(3.6rem,11vw,128px)] font-black leading-[0.88] tracking-[-0.055em] mb-12 [word-break:break-word]"
                style={{ '--gt-gradient': 'linear-gradient(135deg,#fff 38%,#facc15 52%,#fff 68%)' } as React.CSSProperties}
              >
                {heroTitle}
              </h1>
            </FadeIn>
          )}

          <FadeIn delay={0.22} duration={0.8}>
            <div className="about-hero__rule" aria-hidden="true" />
          </FadeIn>

          <div className="about-hero__meta">
            <div className="about-hero__meta-l">
              {ap.boldText && (
                <FadeIn yOffset={16} delay={0.32}>
                  <p className="about-hero__bold">{ap.boldText}</p>
                </FadeIn>
              )}
              {ap.shortText && (
                <FadeIn yOffset={14} delay={0.4}>
                  <p className="about-hero__short">{ap.shortText}</p>
                </FadeIn>
              )}
            </div>
            <div className="about-hero__meta-r">
              {ap.moreText && (
                <FadeIn yOffset={14} delay={0.46}>
                  <p className="about-hero__more">{parse(ap.moreText)}</p>
                </FadeIn>
              )}
              {ap.buttonText && (
                <FadeIn yOffset={20} delay={0.56}>
                  <Button
                    href="/contact-us"
                    variant="primary"
                    style={
                      {
                        '--btn-pad': '16px 34px',
                        '--btn-gap': '10px',
                        boxShadow: '0 4px 28px rgba(250,204,21,0.24)',
                      } as React.CSSProperties
                    }
                  >
                    {ap.buttonText}
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
                </FadeIn>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="about-scroll-cue" aria-hidden="true">
          <div className="about-scroll-cue__line" />
          <span className="about-scroll-cue__label">Scroll</span>
        </div>

        {/* Scrolling category strip — derived from why-us titles */}
        {heroStripWords.length > 0 && (
          <div className="about-hero__strip" aria-hidden="true">
            <Marquee
              items={heroStripWords as string[]}
              repeat={4}
              speed={44}
              renderItem={(w, i) => (
                <span key={i} className="about-hero__strip-item">
                  {w}
                  <span className="about-hero__strip-dot">✦</span>
                </span>
              )}
            />
          </div>
        )}
      </section>

      {/* ══ SHOWCASE CAROUSEL (below hero) ══ */}
      {showcaseImages.length > 0 && (
        <section className="about-showcase">
          <GlowOrb
            size={1100}
            height={600}
            shape="ellipse"
            fade="65%"
            blur={100}
            color="rgba(250,204,21,0.05)"
            className="top-[10%] left-1/2 -translate-x-1/2 z-0"
          />

          <FadeIn yOffset={40} duration={0.9}>
            <div className="about-showcase__stage">
              <div className="about-showcase__card about-showcase__card--left">
                <img src={showcaseImages[1] ?? showcaseImages[0]} alt="" className="about-showcase__img" />
                <div className="about-showcase__shine" aria-hidden="true" />
              </div>

              <div className="about-showcase__card about-showcase__card--main">
                <img src={showcaseImages[0]} alt="" className="about-showcase__img" />
                <div className="about-showcase__shine" aria-hidden="true" />
                <span className="about-showcase__tag">— Inside Triolla —</span>
              </div>

              <div className="about-showcase__card about-showcase__card--right">
                <img src={showcaseImages[2] ?? showcaseImages[0]} alt="" className="about-showcase__img" />
                <div className="about-showcase__shine" aria-hidden="true" />
              </div>

              {/* Decorative spark dots */}
              {[...Array(6)].map((_, i) => (
                <span key={i} className="about-showcase__spark" style={{ '--si': i } as React.CSSProperties} aria-hidden="true" />
              ))}
            </div>
          </FadeIn>

          {/* Auto-scroll caption ticker */}
          <div className="about-showcase__ticker" aria-hidden="true">
            <div className="about-showcase__ticker-track">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="about-showcase__ticker-item">
                  Studio
                  <span className="about-showcase__ticker-dot">✦</span>
                  Craft
                  <span className="about-showcase__ticker-dot">✦</span>
                  Process
                  <span className="about-showcase__ticker-dot">✦</span>
                  People
                  <span className="about-showcase__ticker-dot">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CRAFTING SECTION ══ */}
      <section className="about-crafting">
        <div className="about-crafting__inner">
          <FadeIn yOffset={40}>
            <div className="section-head">
              <Eyebrow
                ornament="line"
                align="center"
                color="#facc15"
                style={
                  {
                    '--eb-line-bg': '#facc15',
                    '--eb-line-opacity': '0.7',
                    '--eb-gap': '14px',
                    '--eb-size': '10px',
                    '--eb-spacing': '0.32em',
                  } as React.CSSProperties
                }
              >
                — 02 —
              </Eyebrow>
              {ap.toprightTitle && <h2 className="section-head__title">{ap.toprightTitle}</h2>}
              {ap.toprightext && (
                /* WP-sourced HTML — trusted backend only */
                <div className="section-head__sub" style={{ '--sh-sub-max': '620px' } as React.CSSProperties}>
                  {parse(ap.toprightext)}
                </div>
              )}
            </div>
          </FadeIn>

          {(ap.imagesSection ?? []).length > 0 && (
            <div className="about-partners">
              {(ap.imagesSection ?? []).map(
                (item: { imageText: string | null; topabtext: string | null; topimages: WPImage | null }, idx: number) => (
                  <FadeIn key={idx} delay={idx * 0.12} yOffset={20}>
                    <div className="about-partner">
                      <div className="about-partner__head">
                        {item.imageText && <span className="about-partner__label">{item.imageText}</span>}
                        {item.topimages?.node?.sourceUrl && (
                          <img src={wpImg(item.topimages.node.sourceUrl) ?? ''} alt="" className="about-partner__logo" />
                        )}
                      </div>
                      {item.topabtext && (
                        /* WP-sourced HTML — trusted backend only */
                        <div className="about-partner__body">{parse(item.topabtext)}</div>
                      )}
                    </div>
                  </FadeIn>
                ),
              )}
            </div>
          )}
        </div>

        {/* Wave: dark → cream */}
        <WaveDivider to="#f0eeea" />
      </section>

      {/* ══ SERVICES ══ */}
      <section className="about-services">
        <div className="about-services__dots" aria-hidden="true" />
        <div className="about-services__inner">
          <FadeIn className="section-head">
            <Eyebrow
              ornament="line"
              align="center"
              color="rgba(0,0,0,0.45)"
              style={
                {
                  '--eb-line-bg': 'rgba(0,0,0,0.35)',
                  '--eb-line-opacity': '1',
                  '--eb-gap': '14px',
                  '--eb-size': '10px',
                  '--eb-spacing': '0.32em',
                } as React.CSSProperties
              }
            >
              — 03 —
            </Eyebrow>
            {ap.servtitle && (
              <h2 className="section-head__title" style={{ color: '#0a0a0a' }}>
                {ap.servtitle}
              </h2>
            )}
            {ap.servtext && (
              /* WP-sourced HTML — trusted backend only */
              <div className="section-head__sub" style={{ '--sh-sub-max': '620px', color: '#4b5563' } as React.CSSProperties}>
                {parse(ap.servtext)}
              </div>
            )}
          </FadeIn>

          <div className="about-svc__rows">
            {(ap.servlist ?? []).map(
              (
                serv: {
                  servlleftText: string | null
                  servrightList: { listItem: string; itemLink: string | null; linkTarget: string | null }[] | null
                },
                i: number,
              ) => (
                <FadeIn key={i} delay={i * 0.08} yOffset={20}>
                  <div className="about-srow">
                    <div className="about-srow__left">
                      <div className="about-srow__num">{(i + 1).toString().padStart(2, '0')}</div>
                      <h3 className="about-srow__cat">{serv.servlleftText}</h3>
                    </div>
                    <div className="about-srow__right">
                      <p className="about-srow__items">
                        {(serv.servrightList ?? []).map(
                          (item: { listItem: string; itemLink: string | null; linkTarget: string | null }, j: number) => (
                            <span key={j}>
                              <Link href={item.itemLink || '#'} target={item.linkTarget || '_self'} className="about-sitem">
                                {item.listItem}
                              </Link>
                              {j < (serv.servrightList?.length ?? 0) - 1 && (
                                <span className="about-sitem__sep" aria-hidden="true">
                                  {' '}
                                  |{' '}
                                </span>
                              )}
                            </span>
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ),
            )}
          </div>
        </div>

        {/* Wave: cream → dark */}
        <WaveDivider to="#080808" />
      </section>

      {/* ══ WHY US ══ */}
      <WhyUsSection
        title={ap.abthretitle ?? ''}
        text={ap.abtthretext ?? ''}
        cards={ap.abthrelist ?? []}
        ctaText={ap.abthrebuttonText}
        ctaLink={ap.abthrebuttonLink}
      />

      {/* ══ DESIGN PROCESS ══ */}
      <AnimatedSteps
        steps={(ap.designType ?? []).map((item: { dName: string }) => ({
          numtitle: item.dName ?? '',
        }))}
        title={ap.uDesignHeading ?? null}
        subtext={ap.uSortText ?? null}
        accentColor="#facc15"
      />

      {/* ══ LEARN ══ */}
      {(ap.learnslider ?? []).length > 0 && (
        <section className="about-learn">
          <GlowOrb size={600} fade="65%" blur={90} color="rgba(250,204,21,0.04)" className="top-[-8%] left-[-4%] z-0" />
          <div className="about-learn__inner">
            <FadeIn className="section-head">
              <Eyebrow
                ornament="line"
                align="center"
                color="#facc15"
                style={
                  {
                    '--eb-line-bg': '#facc15',
                    '--eb-line-opacity': '0.7',
                    '--eb-gap': '14px',
                    '--eb-size': '10px',
                    '--eb-spacing': '0.32em',
                  } as React.CSSProperties
                }
              >
                — 05 —
              </Eyebrow>
              {ap.learntitle && <h2 className="section-head__title">{ap.learntitle}</h2>}
              {ap.learntext && (
                /* WP-sourced HTML — trusted backend only */
                <div className="section-head__sub" style={{ '--sh-sub-max': '620px' } as React.CSSProperties}>
                  {parse(ap.learntext)}
                </div>
              )}
            </FadeIn>
            <AboutImageCarousel
              images={(ap.learnslider ?? []).map((s: { learnimage: WPImage | null }) => s.learnimage?.node?.sourceUrl ?? null)}
            />
          </div>
        </section>
      )}

      {/* ══ CLIENTS ══ */}
      <ClientsSection
        logos={clientLogos}
        heading={ts?.ourClientsHeading ?? null}
        bigText={ts?.ourClientBigText ?? null}
        ctaText={ts?.cButton ?? null}
      />

      {/* ══ FAQ ══ */}
      {faqItems.length > 0 && (
        <section className="about-faq">
          <div className="about-faq__inner">
            <FadeIn>
              <Eyebrow
                ornament="line"
                color="#facc15"
                style={
                  {
                    '--eb-line-bg': '#facc15',
                    '--eb-line-opacity': '0.7',
                    '--eb-gap': '14px',
                    '--eb-size': '10px',
                    '--eb-spacing': '0.32em',
                  } as React.CSSProperties
                }
              >
                Got Questions
              </Eyebrow>
              <h2 className="about-faq__title">Frequently Asked Questions</h2>
            </FadeIn>
            <FAQAccordion items={faqItems} />
          </div>
        </section>
      )}

      <style>{`

        /* ─── Text selection ─────────────────── */
        ::selection { background: #fed125; color: #000; }
        .about-services ::selection { background: #0a0a0a; color: #fff; }

        /* ─── HERO (dark, services-style) ─────── */
        .about-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 128px 24px 164px;
          overflow: hidden;
        }
        .about-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 50%, black 0%, transparent 100%);
        }
        .about-hero__corner {
          position: absolute; width: 28px; height: 28px;
          pointer-events: none; z-index: 2;
        }
        .about-hero__corner--tl { top: 88px; left: 48px; border-top: 1.5px solid rgba(250,204,21,0.32); border-left: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__corner--tr { top: 88px; right: 48px; border-top: 1.5px solid rgba(250,204,21,0.32); border-right: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__corner--bl { bottom: 168px; left: 48px; border-bottom: 1.5px solid rgba(250,204,21,0.32); border-left: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__corner--br { bottom: 168px; right: 48px; border-bottom: 1.5px solid rgba(250,204,21,0.32); border-right: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__ghost {
          position: absolute; top: 50%; right: -2%; transform: translateY(-52%);
          font-size: clamp(180px, 26vw, 400px); font-weight: 900; line-height: 1;
          color: rgba(250,204,21,0.026); pointer-events: none; user-select: none;
          letter-spacing: -0.06em; z-index: 0;
        }
        .about-hero__index {
          position: absolute; top: 52px; right: 72px; z-index: 3;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(255,255,255,0.17);
        }
        .about-hero__layer {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .about-hero__layer img {
          width: 100%; height: 100%; object-fit: cover; mix-blend-mode: screen; opacity: 0.08;
        }
        .about-hero__content {
          position: relative; z-index: 2;
          max-width: 1100px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .about-hero__rule {
          width: 52%; max-width: 540px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(250,204,21,0.38), transparent);
          margin-bottom: 44px;
        }
        .about-hero__meta {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px; max-width: 680px;
        }
        .about-hero__meta-l { display: flex; flex-direction: column; gap: 10px; align-items: center; }
        .about-hero__meta-r { display: flex; flex-direction: column; gap: 18px; align-items: center; }
        .about-hero__bold { font-size: clamp(1rem,1.9vw,1.4rem); font-weight: 700; color: rgba(255,255,255,0.88); line-height: 1.35; }
        .about-hero__short { font-size: 1rem; color: rgba(255,255,255,0.46); line-height: 1.74; max-width: 560px; }
        .about-hero__more { font-size: 0.9rem; color: rgba(255,255,255,0.32); line-height: 1.8; max-width: 560px; }
        .about-scroll-cue {
          position: absolute; bottom: 72px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 4; pointer-events: none;
        }
        .about-scroll-cue__line {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, transparent, rgba(250,204,21,0.55));
          animation: aboutScrollPulse 2s ease-in-out infinite;
        }
        .about-scroll-cue__label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.26); }
        @keyframes aboutScrollPulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.1)} }
        .about-hero__strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          height: 52px; overflow: hidden;
          display: flex; align-items: center;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.6); backdrop-filter: blur(12px);
        }
        .about-hero__strip-item {
          display: inline-flex; align-items: center; gap: 14px; padding: 0 28px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .about-hero__strip-dot { color: #facc15; font-size: 7px; }

        /* ─── SHOWCASE (carousel below hero) ─── */
        .about-showcase {
          position: relative;
          padding: 96px 0 80px;
          overflow: hidden;
        }
        .about-showcase__stage {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 28px;
          align-items: center;
          perspective: 1400px;
        }
        .about-showcase__card {
          position: relative;
          border-radius: 26px;
          overflow: hidden;
          background: #111;
          box-shadow: 0 26px 80px rgba(0,0,0,0.68), 0 0 0 1px rgba(255,255,255,0.05);
          transition: transform 0.7s cubic-bezier(.23,1,.32,1), box-shadow 0.7s;
          will-change: transform;
        }
        .about-showcase__card--left {
          aspect-ratio: 3 / 4;
          transform: rotate(-3.2deg) translateY(20px);
          animation: scFloatL 7s ease-in-out infinite;
        }
        .about-showcase__card--main {
          aspect-ratio: 4 / 3;
          transform: rotate(0.3deg);
          z-index: 2;
          box-shadow: 0 40px 100px rgba(0,0,0,0.72), 0 0 0 1px rgba(250,204,21,0.1);
          animation: scFloatM 8s ease-in-out infinite;
        }
        .about-showcase__card--right {
          aspect-ratio: 3 / 4;
          transform: rotate(2.6deg) translateY(28px);
          animation: scFloatR 7.5s ease-in-out infinite;
        }
        @keyframes scFloatL {
          0%,100% { transform: rotate(-3.2deg) translateY(20px); }
          50%      { transform: rotate(-2.4deg) translateY(8px); }
        }
        @keyframes scFloatM {
          0%,100% { transform: rotate(0.3deg) translateY(0); }
          50%      { transform: rotate(-0.4deg) translateY(-10px); }
        }
        @keyframes scFloatR {
          0%,100% { transform: rotate(2.6deg) translateY(28px); }
          50%      { transform: rotate(1.8deg) translateY(14px); }
        }
        .about-showcase__card:hover {
          transform: rotate(0deg) translateY(-8px) scale(1.025);
          box-shadow: 0 48px 120px rgba(0,0,0,0.78), 0 0 0 1px rgba(250,204,21,0.18);
          animation-play-state: paused;
          z-index: 3;
        }
        .about-showcase__img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.85s cubic-bezier(.23,1,.32,1);
        }
        .about-showcase__card:hover .about-showcase__img { transform: scale(1.06); }
        .about-showcase__shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(128deg, transparent 36%, rgba(250,204,21,0.06) 50%, transparent 62%);
        }
        .about-showcase__tag {
          position: absolute; bottom: 14px; left: 14px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.72);
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(10px);
          padding: 6px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .about-showcase__spark {
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #facc15;
          opacity: 0;
          animation: scSpark 5s ease-in-out infinite;
          animation-delay: calc(var(--si) * 0.7s);
          top: calc(15% + var(--si) * 12%);
          left: calc(8% + var(--si) * 14%);
          z-index: 1;
          pointer-events: none;
        }
        @keyframes scSpark {
          0%,100% { opacity: 0; transform: scale(0) translateY(0); }
          40%      { opacity: 0.85; transform: scale(1.6) translateY(-12px); }
          70%      { opacity: 0.25; transform: scale(0.7) translateY(-22px); }
        }

        /* Ticker */
        .about-showcase__ticker {
          margin-top: 60px;
          overflow: hidden;
          padding: 14px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.5);
          backdrop-filter: blur(8px);
        }
        .about-showcase__ticker-track {
          display: flex;
          width: max-content;
          animation: scTicker 38s linear infinite;
        }
        .about-showcase__ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 0 18px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
        }
        .about-showcase__ticker-dot {
          color: #facc15;
          font-size: 8px;
        }
        @keyframes scTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ─── CRAFTING ───────────────────────── */
        .about-crafting { padding: 96px 0 0; position: relative; }
        .about-crafting__inner {
          max-width: 1100px; margin: 0 auto; padding: 0 32px;
        }
        .about-partners {
          margin-top: 64px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .about-partner {
          padding: 32px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: padding-left 0.32s cubic-bezier(.23,1,.32,1);
          position: relative;
        }
        .about-partner::before {
          content: ''; position: absolute; left: -12px; top: 0; bottom: 0; width: 3px;
          background: #facc15; transform: scaleY(0); transform-origin: top;
          transition: transform 0.4s cubic-bezier(.23,1,.32,1);
        }
        .about-partner:hover { padding-left: 12px; }
        .about-partner:hover::before { transform: scaleY(1); }
        .about-partner__head {
          display: flex; align-items: center; gap: 16px; margin-bottom: 12px;
        }
        .about-partner__label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .about-partner__logo {
          height: 36px; object-fit: contain;
          filter: brightness(10) opacity(0.55);
          transition: filter 0.3s;
        }
        .about-partner:hover .about-partner__logo { filter: brightness(10) opacity(0.9); }
        .about-partner__body { font-size: 0.95rem; color: #6b7280; line-height: 1.7; }

        /* ─── SERVICES ───────────────────────── */
        .about-services {
          position: relative;
          background: #f0eeea;
          padding: 96px 0 0;
          overflow: hidden;
        }
        .about-services__dots {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.13) 1.2px, transparent 1.2px);
          background-size: 36px 36px; opacity: 0.5;
        }
        .about-services__inner {
          max-width: 1000px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }
        .about-srow {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 60px; align-items: start;
          padding: 48px 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          position: relative;
          transition: background 0.3s;
        }
        .about-srow::before {
          content: '';
          position: absolute; left: -32px; top: 0; bottom: 0; width: 3px;
          background: #facc15;
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.4s cubic-bezier(.23,1,.32,1);
        }
        .about-srow:hover::before { transform: scaleY(1); }
        .about-srow:first-child { border-top: 1px solid rgba(0,0,0,0.1); }
        .about-srow__left { display: flex; flex-direction: column; gap: 4px; padding-top: 2px; }
        .about-srow__num {
          font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.25);
          letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6px;
        }
        .about-srow__cat {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800; color: #0a0a0a;
          line-height: 1.1; letter-spacing: -0.02em;
        }
        .about-srow__right { padding-top: 6px; }
        .about-srow__items { margin: 0; }
        .about-sitem {
          color: #444;
          font-size: 1.05rem;
          font-weight: 400;
          line-height: 1.8;
          transition: color 0.2s;
          text-decoration: none;
        }
        .about-sitem:hover { color: #0a0a0a; }
        .about-sitem__sep {
          color: rgba(0,0,0,0.22);
          font-weight: 300;
          user-select: none;
        }

        /* ─── LEARN ──────────────────────────── */
        .about-learn {
          position: relative; background: #0a0a0a;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 112px 0 80px; overflow: hidden;
        }
        .about-learn__inner {
          max-width: 1600px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }

        /* ─── FAQ ────────────────────────────── */
        .about-faq {
          padding: 112px 0 80px; border-top: 1px solid rgba(255,255,255,0.04);
        }
        .about-faq__inner { max-width: 880px; margin: 0 auto; padding: 0 32px; }
        .about-faq__title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 60px;
        }

        /* ─── RESPONSIVE ─────────────────────── */
        @media (max-width: 1100px) {
          .about-showcase__stage {
            grid-template-columns: 1fr;
            gap: 20px;
            max-width: 520px;
          }
          .about-showcase__card--left,
          .about-showcase__card--right {
            aspect-ratio: 4 / 3;
          }
          .about-showcase__card--left { transform: rotate(-1.6deg); animation: none; }
          .about-showcase__card--main { transform: rotate(0deg); animation: none; }
          .about-showcase__card--right { transform: rotate(1.4deg); animation: none; }
        }
        @media (max-width: 768px) {
          .about-hero { padding: 96px 20px 148px; }
          .about-hero__corner { display: none; }
          .about-hero__ghost { font-size: clamp(110px, 38vw, 180px); }
          .about-hero__index { right: 20px; top: 30px; }
          .about-showcase { padding: 64px 0 56px; }
          .about-showcase__stage { padding: 0 20px; }
          .about-showcase__ticker { margin-top: 40px; }
          .about-crafting { padding-top: 64px; }
          .about-crafting__inner { padding: 0 20px; }
          .about-services { padding: 80px 0 0; }
          .about-services__inner { padding: 0 20px; }
          .about-srow { grid-template-columns: 1fr; gap: 8px; padding: 32px 0; }
          .about-srow__cat { font-size: 1.6rem; }
          .about-learn { padding: 80px 0 64px; }
          .about-learn__inner { padding: 0 20px; }
          .about-faq { padding: 80px 0 64px; }
          .about-faq__inner { padding: 0 20px; }
        }
      `}</style>
    </main>
  )
}
