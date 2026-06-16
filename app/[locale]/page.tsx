import type { Metadata } from 'next'
import { HeroHeadline } from '@/components/HeroHeadline'
import { SectionReveal } from '@/components/SectionReveal'
import { FadeIn } from '@/components/FadeIn'
import { CountUpNumber } from '@/components/CountUpNumber'
import { PortfolioGrid } from '@/components/PortfolioGrid'
import { FAQSection } from '@/components/FAQSection'
import { GridImageSection } from '@/components/GridImageSection'
import { ContactCTA } from '@/components/ContactCTA'
import { WhyUsSection } from '@/components/WhyUsSection'
import AnimatedSteps from '@/components/AnimatedSteps'
import { ClientsSection } from '@/components/ClientsSection'
import { FloatingCta } from '@/components/FloatingCta'
import { GrainOverlay, GlowOrb, Eyebrow } from '@/components/ui'
import { client } from '@/lib/apollo-client'
import { GET_HOME_PAGE_BY_URI, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import type { GetHomePageData, GetThemeSettingsData, HomePageFields, ThemeOptions, WPImage } from '@/lib/graphql-types'
import { stripHtml } from '@/lib/text'
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
import { wpImg } from '@/lib/images'
import { JsonLd } from '@/components/JsonLd'
import { webPageSchema } from '@/lib/jsonld'

const HOME_PAGE_QUERY: TypedDocumentNode<GetHomePageData> = gql`
  ${GET_HOME_PAGE_BY_URI}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

/* ── WP content helpers ──────────────────────────── */

function parseAward(wboxTitle: string): { rank: number; label: string } {
  const rankMatch = wboxTitle.match(/#(\d+)/)
  const rank = rankMatch ? parseInt(rankMatch[1]) : 1
  const label = wboxTitle
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/#\d+\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return { rank, label }
}

/* ── Data fetching ───────────────────────────────── */

async function getHomeData(uri: string): Promise<HomePageFields> {
  try {
    const { data } = await client.query({ query: HOME_PAGE_QUERY, variables: { uri } })
    return data?.page?.template?.homePage ?? ({} as HomePageFields)
  } catch {
    return {} as HomePageFields
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

async function getLocalizedThemeOptions(locale: string): Promise<Partial<ThemeOptions> | null> {
  if (locale === 'en') return null
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL ?? 'https://triolla.io'}/wp-json/triolla/v1/theme-options/${locale}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/* ── Metadata ────────────────────────────────────── */

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const hp = await getHomeData(PAGE_URI.home[loc])
  const title = hp?.topsectitle ? `${stripHtml(hp.topsectitle)} | Triolla` : 'Triolla | Product Design & Development'
  const description = stripHtml(hp?.toptext ?? '') || 'Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups'
  return {
    title,
    description,
    alternates: { languages: { en: '/', he: '/he' } },
    openGraph: {
      title,
      description,
      locale: loc === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
  }
}

/* ── Page ────────────────────────────────────────── */

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [hp, ts, localizedTs] = await Promise.all([
    getHomeData(PAGE_URI.home[loc]),
    getThemeSettings(),
    getLocalizedThemeOptions(loc),
  ])

  const heroHeadline = stripHtml(hp.topsectitle ?? '')
  const heroSubtext = stripHtml(hp.toptext ?? '')

  const winTitle = hp.winTitle ?? ''
  const winSubtext = hp.winSubtitle ?? ''

  const awards = (hp.wboxes ?? []).map((b: { wboxTitle: string; winImg: WPImage | null }) => ({
    ...parseAward(b.wboxTitle ?? ''),
    imgUrl: b.winImg?.node?.sourceUrl ?? null,
  }))

  const whyTitle = stripHtml(hp.abthretitle ?? '')
  const whyText = stripHtml(hp.abtthretext ?? '')
  const whyCtaText = hp.abthrebuttonText ?? null
  const whyCtaLink = hp.abthrebuttonLink ?? '/contact-us'
  const serviceCards = hp.abthrelist ?? []

  const clientLogos: { url: string; alt: string }[] = (ts?.clientsLogos ?? []).flatMap((item: { cLogo: WPImage | null }) => {
    const url = item.cLogo?.node?.sourceUrl
    return url ? [{ url, alt: item.cLogo?.node?.altText ?? '' }] : []
  })

  const faqHeading = localizedTs?.faqHeading ?? ts?.faqHeading ?? null
  const faqShortText = localizedTs?.faqShortText ?? ts?.faqShortText ?? null
  const faqItems = ((localizedTs?.questionAnswerList ?? ts?.questionAnswerList) ?? []).flatMap((q: { fQuestion: string | null; fAnswer: string | null }) => {
    return q?.fQuestion ? [{ faqQuestion: q.fQuestion, faqAnswer: q.fAnswer ?? '' }] : []
  })

  const homePath = loc === 'he' ? '/he' : '/'
  const homePageJsonLd = webPageSchema({
    path: homePath,
    name: heroHeadline || 'Triolla',
    description: heroSubtext || null,
    type: 'WebPage',
  })

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-16 md:pb-32 relative">
      {homePageJsonLd && <JsonLd data={homePageJsonLd} />}
      {/* ── Grain noise overlay ── */}
      <GrainOverlay />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative md:min-h-screen flex flex-col items-center pt-16 md:pt-32 pb-8 md:pb-20 px-4 overflow-hidden">
        {/* Ambient orb cluster */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <GlowOrb
            size={900}
            height={500}
            shape="ellipse"
            fade="70%"
            blur={80}
            color="rgba(250,204,21,0.14)"
            animation="pulse"
            duration={8}
            className="bottom-[-10%] left-1/2 -translate-x-1/2 max-md:w-[560px] max-md:h-[320px]"
          />
          <GlowOrb
            size={600}
            fade="65%"
            blur={80}
            color="rgba(251,146,60,0.06)"
            animation="pulse-rev"
            duration={11}
            className="top-[-5%] left-[-10%] max-md:w-[400px] max-md:h-[400px] max-md:top-0 max-md:left-[-20%]"
          />
          <GlowOrb
            size={500}
            fade="65%"
            blur={80}
            color="rgba(250,204,21,0.05)"
            animation="pulse"
            duration={14}
            className="top-[10%] right-[-8%] max-md:w-[320px] max-md:h-[320px]"
          />
          <div className="hero-grid" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center w-full">
          {/* Eyebrow */}
          <Eyebrow
            ornament="dot"
            align="center"
            style={{ '--eb-spacing': '0.25em', '--eb-mb': '28px', '--eb-weight': '600' } as React.CSSProperties}
          >
            Product UX/UI design for
          </Eyebrow>

          <HeroHeadline
            headline={heroHeadline}
            subtext={heroSubtext}
            headlineClassName="text-[clamp(2.2rem,10vw,110px)] leading-[0.9] font-bold tracking-tighter mb-6 md:mb-8 max-w-[1200px] gradient-text gradient-text--animate"
            subtextClassName="text-base md:text-xl lg:text-2xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed"
          />
        </div>

        {/* Scroll cue — hidden on mobile (no min-h-screen, absolute position collides) */}
        <div className="scroll-cue hidden md:flex" aria-hidden="true">
          <div className="scroll-cue__line" />
          <span className="scroll-cue__label">{`Scroll`}</span>
        </div>
        {/* Floating mobile CTA — sentinel placed here so CTA appears once hero exits viewport */}
        <FloatingCta href={whyCtaLink} label="Let's Talk" />
      </section>

      {/* ══════════════════════════════════════════════
          PORTFOLIO GRID
      ══════════════════════════════════════════════ */}
      <section className="relative z-20 max-w-[1600px] mx-auto px-4 md:-mt-10 mb-6 md:mb-32">
        <PortfolioGrid />
      </section>

      {/* ══════════════════════════════════════════════
          WHY US SECTION
      ══════════════════════════════════════════════ */}
      <WhyUsSection title={whyTitle} text={whyText} cards={serviceCards} ctaText={whyCtaText} ctaLink={whyCtaLink} />

      {/* ══════════════════════════════════════════════
          AWARDS SECTION
      ══════════════════════════════════════════════ */}
      <section id="winners-section" className="winners-section mb-6 md:mb-32 relative overflow-hidden">
        {/* Ambient light orbs */}
        <div className="winners-orb winners-orb--tl" aria-hidden="true" />
        <div className="winners-orb winners-orb--br" aria-hidden="true" />
        <div className="winners-orb winners-orb--center" aria-hidden="true" />

        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="winners-sparkle" style={{ '--si': i } as React.CSSProperties} aria-hidden="true" />
        ))}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <FadeIn className="text-center mb-8 md:mb-20">
            <h3 className="winners-title">{winTitle}</h3>
            <p className="winners-subtitle">{winSubtext}</p>
          </FadeIn>

          <SectionReveal className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-12">
            {awards.map((award: { rank: number; label: string; imgUrl: string | null }, i: number) => (
              <div key={i} className="award-card group" style={{ '--ai': i } as React.CSSProperties}>
                <div className="award-medal-wrap">
                  {award.imgUrl ? (
                    <img src={wpImg(award.imgUrl) ?? ''} alt={award.label} className="award-medal-img" />
                  ) : (
                    <div className="award-medal-fallback">
                      #
                      <CountUpNumber target={award.rank} duration={900 + i * 200} />
                    </div>
                  )}
                </div>
                <div className="award-label">
                  <span className="award-label__rank">#{award.rank}</span>
                  <span>{award.label}</span>
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLIENTS SECTION
      ══════════════════════════════════════════════ */}
      <ClientsSection
        logos={clientLogos}
        heading={localizedTs?.ourClientsHeading ?? ts?.ourClientsHeading ?? null}
        bigText={localizedTs?.ourClientBigText ?? ts?.ourClientBigText ?? null}
        ctaText={ts?.cButton ?? null}
        locale={loc}
      />

      {/* ══════════════════════════════════════════════
          DESIGN PROCESS TIMELINE
      ══════════════════════════════════════════════ */}
      <AnimatedSteps
        steps={(hp.designType ?? []).map((item: { dName: string }, i: number) => ({
          number: String(i + 1),
          numtitle: item.dName ?? '',
        }))}
        title={hp.uDesignHeading ?? null}
        subtext={hp.uSortText ?? null}
      />

      {/* ══════════════════════════════════════════════
          FAQ SECTION
      ══════════════════════════════════════════════ */}
      <FAQSection heading={faqHeading} subtext={faqShortText} items={faqItems} />

      {/* ══════════════════════════════════════════════
          GRID IMAGE SECTION
      ══════════════════════════════════════════════ */}
      <GridImageSection
        imageUrl={ts?.commonGridOneImage?.node?.sourceUrl ?? null}
        imageMobileUrl={ts?.commonGridOneMobile?.node?.sourceUrl ?? null}
      />

      {/* ══════════════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════════════ */}
      <ContactCTA ts={localizedTs ? { ...ts, ...localizedTs } as typeof ts : ts} />

      {/* ══════════════════════════════════════════════
          GLOBAL STYLES
      ══════════════════════════════════════════════ */}
      <style>{`
        /* ─── Fonts ─────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');

        /* ─── Hero grid lines ───────────────────── */
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%);
        }

        /* ─── Scroll cue ────────────────────────── */
        .scroll-cue {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .scroll-cue__line {
          width: 1px;
          height: 48px;
          background: linear-gradient(to bottom, transparent, rgba(250,204,21,0.6));
          animation: scrollPulse 2s ease-in-out infinite;
        }
        .scroll-cue__label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }

        /* ─── Winners section ───────────────────── */
        .winners-section {
          position: relative;
          padding: 120px 0 140px;
          background:
            radial-gradient(ellipse at 15% 50%, rgba(255,180,120,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 15%, rgba(255,220,100,0.30) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 90%, rgba(255,160,160,0.20) 0%, transparent 45%),
            #faf7f2;
        }
        .winners-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
        }
        .winners-orb--tl {
          top: -10%; left: -5%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(255,160,80,0.25) 0%, transparent 70%);
          animation: orbDrift 12s ease-in-out infinite alternate;
        }
        .winners-orb--br {
          bottom: -10%; right: -5%;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(250,200,80,0.20) 0%, transparent 70%);
          animation: orbDrift 16s ease-in-out infinite alternate-reverse;
        }
        .winners-orb--center {
          top: 30%; left: 30%;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(255,240,180,0.15) 0%, transparent 65%);
          animation: orbDrift 20s ease-in-out infinite alternate;
        }
        @keyframes orbDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        .winners-sparkle {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #d4a017;
          opacity: 0;
          animation: sparklePop 4s ease-in-out infinite;
          animation-delay: calc(var(--si) * 0.6s);
          top:  calc(15% + var(--si) * 10%);
          left: calc(5%  + var(--si) * 12%);
        }
        @keyframes sparklePop {
          0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
          30%       { opacity: 0.8; transform: scale(1.4) translateY(-8px); }
          60%       { opacity: 0.3; transform: scale(0.8) translateY(-16px); }
        }
        .winners-eyebrow {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c47a00;
          margin-bottom: 16px;
        }
        .winners-title {
          font-size: clamp(2.4rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.08;
          color: #111;
          max-width: 820px;
          margin: 0 auto 20px;
        }
        .winners-subtitle {
          font-size: 1.2rem;
          color: #555;
          font-weight: 500;
        }

        /* Award cards */
        .award-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: cardRise 0.7s cubic-bezier(.23,1,.32,1) both;
          animation-delay: calc(var(--ai) * 0.18s + 0.2s);
          cursor: default;
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .award-medal-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: medalFloat 5s ease-in-out infinite;
          animation-delay: calc(var(--ai, 0) * 0.5s);
        }
        @keyframes medalFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .award-medal-img {
          width: 240px;
          height: 240px;
          object-fit: contain;
          filter: drop-shadow(0 12px 32px rgba(180,120,0,0.22));
          transition: filter 0.3s, transform 0.3s;
        }
        .award-card:hover .award-medal-img {
          filter: drop-shadow(0 18px 48px rgba(180,120,0,0.35));
          transform: scale(1.04);
        }
        .award-medal-fallback {
          width: 180px; height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #f5c842, #d4880a 60%, #8b5a00);
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; font-weight: 900; color: #fff;
          text-shadow: 0 2px 8px rgba(100,60,0,0.4);
          filter: drop-shadow(0 10px 28px rgba(180,120,0,0.3));
        }
        .award-label {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-top: 24px;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .award-label__rank {
          font-size: 1.2rem;
          font-weight: 800;
          color: #111;
        }

        /* ══════════════════════════════════════════
           MOBILE-ONLY STYLES (max-width: 768px)
        ══════════════════════════════════════════ */

        @media (max-width: 767px) {
          .scroll-cue { display: none; }
        }

        /* ─── Winners section ──────────────────── */
        @media (max-width: 768px) {
          .winners-section {
            padding: 40px 0 44px;
          }
          .winners-title {
            font-size: clamp(1.5rem, 7vw, 2.2rem);
          }
          .winners-subtitle {
            font-size: 0.9rem;
          }
          .award-medal-img {
            width: clamp(72px, 22vw, 110px);
            height: clamp(72px, 22vw, 110px);
          }
          .award-medal-fallback {
            width: 84px; height: 84px; font-size: 24px;
          }
          .award-medal-wrap {
            animation: none;
          }
          .award-label {
            font-size: 0.7rem;
            margin-top: 10px;
          }
          .award-label__rank {
            font-size: 0.8rem;
          }
        }

      `}</style>
    </main>
  )
}
