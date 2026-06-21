import type { Metadata } from 'next'
import { client } from '@/lib/apollo-client'
import { GET_BRANDING_STUDIO, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { notFound } from 'next/navigation'
import parse from 'html-react-parser'
import { FadeIn } from '@/components/FadeIn'
import { BrandProcessRail } from '@/components/BrandProcessRail'
import { WpContent } from '@/lib/wp-content'
import { GrainOverlay, GlowOrb, Eyebrow, Button } from '@/components/ui'
import type { GetBrandingStudioData, GetThemeSettingsData, ServiceDetailPage, ThemeOptions } from '@/lib/graphql-types'
import { isLocale, defaultLocale, PAGE_URI, localizeHref } from '@/lib/i18n'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema, serviceSchema } from '@/lib/jsonld'

const BRANDING_QUERY: TypedDocumentNode<GetBrandingStudioData> = gql`
  ${GET_BRANDING_STUDIO}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

async function getBranding(uri: string): Promise<ServiceDetailPage | null> {
  try {
    const { data } = await client.query({ query: BRANDING_QUERY, variables: { uri } })
    return data?.page ?? null
  } catch {
    return null
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const page = await getBranding(PAGE_URI.brandingStudio[loc])
  const title = page?.title ? `${page.title} | Triolla` : 'Branding & Studio | Triolla'
  const description = page?.template?.postFields?.topBoldText ?? undefined
  const ogImage = page?.featuredImage?.node?.sourceUrl ?? undefined
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { languages: { en: '/branding-studio', he: '/he/branding-studio' } },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      locale: loc === 'he' ? 'he_IL' : 'en_US',
      type: 'website',
    },
  }
}

export default async function BrandingStudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [page, ts] = await Promise.all([getBranding(PAGE_URI.brandingStudio[loc]), getThemeSettings()])
  if (!page || (!page.title && !page.content)) notFound()

  const title = page.title ?? ''
  const lead = page.template?.postFields?.topBoldText ?? null
  const heroImg = page.featuredImage?.node?.sourceUrl ?? null
  const heroAlt = page.featuredImage?.node?.altText ?? ''
  const content = page.content ?? null
  const ctaText = ts?.cButton ?? null

  const brandPath = loc === 'he' ? '/he/branding-studio' : '/branding-studio'
  const brandJsonLd = serviceSchema({
    name: title || null,
    description: lead ? lead.replace(/<[^>]+>/g, '').trim() : null,
    path: brandPath,
    serviceType: 'Branding & Studio',
  })
  const brandCrumbs = breadcrumbSchema(
    [{ name: title || 'Branding Studio', path: brandPath }],
    loc === 'he' ? 'דף הבית' : 'Home',
  )

  return (
    <main className="brand-root bg-[#080808] text-white overflow-hidden relative">
      {brandJsonLd && <JsonLd data={[brandJsonLd, brandCrumbs]} />}
      <GrainOverlay />

      {/* ══ HERO ══ */}
      <section className="brand-hero">
        <GlowOrb
          size={1000}
          height={520}
          shape="ellipse"
          fade="70%"
          blur={90}
          color="rgba(250,204,21,0.14)"
          className="top-[-14%] left-1/2 -translate-x-1/2 z-0 opacity-90"
        />
        <GlowOrb size={620} fade="65%" blur={80} color="rgba(251,146,60,0.06)" className="bottom-[-10%] right-[-10%] z-0 opacity-60" />
        <div className="brand-hero__grid" aria-hidden="true" />
        <div className="brand-hero__ghost" aria-hidden="true">
          ★
        </div>
        <div className="brand-hero__index" aria-hidden="true">
          — STUDIO —
        </div>

        <div className="brand-hero__inner">
          <div className="brand-hero__copy">
            <FadeIn yOffset={20} duration={0.7}>
              <Eyebrow
                ornament="dot"
                style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.3em', '--eb-dot': '5px' } as React.CSSProperties}
              >
                Triolla
              </Eyebrow>
            </FadeIn>

            {title && (
              <FadeIn yOffset={60} delay={0.1} duration={1}>
                <h1
                  className="gradient-text gradient-text--animate brand-hero__title"
                  style={{ '--gt-gradient': 'linear-gradient(135deg,#fff 36%,#facc15 52%,#fff 70%)' } as React.CSSProperties}
                >
                  {title}
                </h1>
              </FadeIn>
            )}

            <FadeIn delay={0.22} duration={0.8}>
              <div className="brand-hero__rule" aria-hidden="true" />
            </FadeIn>

            {lead && (
              <FadeIn yOffset={18} delay={0.32}>
                {/* WP-sourced HTML — trusted backend only */}
                <div className="brand-hero__lead">{parse(lead)}</div>
              </FadeIn>
            )}

            {ctaText && (
              <FadeIn yOffset={20} delay={0.44}>
                <Button
                  href={localizeHref('/contact-us', loc)}
                  variant="primary"
                  style={{ '--btn-pad': '16px 34px', '--btn-gap': '10px', boxShadow: '0 4px 28px rgba(250,204,21,0.24)' } as React.CSSProperties}
                >
                  {ctaText}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </FadeIn>
            )}
          </div>

          {heroImg && (
            <FadeIn yOffset={50} delay={0.2} duration={1} className="brand-hero__media-wrap">
              <div className="brand-hero__media">
                <img src={heroImg} alt={heroAlt} className="brand-hero__img" />
                <div className="brand-hero__shine" aria-hidden="true" />
                <div className="brand-hero__frame" aria-hidden="true" />
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ══ PROCESS / CONTENT ══ */}
      {content && (
        <section className="brand-process">
          <GlowOrb size={760} fade="65%" blur={90} color="rgba(250,204,21,0.05)" className="top-[6%] left-[-8%] z-0" />
          <div className="brand-process__inner">
            <BrandProcessRail sectionSelector=".brand-process__inner">
              <FadeIn yOffset={30}>
                <Eyebrow
                  ornament="line"
                  color="#facc15"
                  style={{ '--eb-line-bg': '#facc15', '--eb-line-opacity': '0.7', '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.3em' } as React.CSSProperties}
                >
                  — Process —
                </Eyebrow>
              </FadeIn>
            </BrandProcessRail>
            <FadeIn yOffset={40} delay={0.1}>
              {/* WP-sourced HTML — trusted backend only */}
              <div className="brand-prose">
                <WpContent html={content} />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ══ CLOSING CTA ══ */}
      {ctaText && (
        <section className="brand-cta">
          <GlowOrb size={900} height={460} shape="ellipse" fade="70%" blur={80} color="rgba(250,204,21,0.1)" className="bottom-[-30%] left-1/2 -translate-x-1/2 z-0" />
          <FadeIn yOffset={30}>
            <div className="brand-cta__inner">
              {title && <h2 className="brand-cta__title">{title}</h2>}
              <Button
                href={localizeHref('/contact-us', loc)}
                variant="primary"
                style={{ '--btn-pad': '17px 38px', '--btn-gap': '10px', boxShadow: '0 6px 32px rgba(250,204,21,0.28)' } as React.CSSProperties}
              >
                {ctaText}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </div>
          </FadeIn>
        </section>
      )}

      <style>{`
        ::selection { background: #fed125; color: #000; }
        .brand-root { padding-bottom: 0; }

        /* ─── HERO ─────────────────────────────── */
        .brand-hero {
          position: relative; min-height: 92vh;
          display: flex; align-items: center;
          padding: 150px 24px 96px; overflow: hidden;
        }
        .brand-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 0%, transparent 100%);
        }
        .brand-hero__ghost {
          position: absolute; top: 48%; left: -3%; transform: translateY(-50%);
          font-size: clamp(280px, 40vw, 620px); line-height: 1;
          color: rgba(250,204,21,0.026); pointer-events: none; user-select: none; z-index: 0;
        }
        .brand-hero__index {
          position: absolute; top: 52px; right: 48px; z-index: 3;
          font-size: 10px; font-weight: 700; letter-spacing: 0.26em;
          text-transform: uppercase; color: rgba(255,255,255,0.17);
        }
        .brand-hero__inner {
          position: relative; z-index: 2;
          max-width: 1400px; width: 100%; margin: 0 auto;
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: 64px; align-items: center;
        }
        .brand-hero__copy { display: flex; flex-direction: column; align-items: flex-start; }
        .brand-hero__title {
          font-size: clamp(2.8rem, 7.4vw, 6.2rem);
          font-weight: 900; line-height: 0.92; letter-spacing: -0.05em;
          margin: 22px 0 0; word-break: break-word;
        }
        .brand-hero__rule {
          width: 64px; height: 2px; margin: 32px 0;
          background: linear-gradient(to right, #facc15, rgba(250,204,21,0));
          border-radius: 2px;
        }
        .brand-hero__lead {
          font-size: clamp(1.05rem, 1.7vw, 1.35rem);
          font-weight: 600; line-height: 1.55; color: rgba(255,255,255,0.82);
          max-width: 560px;
        }
        .brand-hero__lead p { margin: 0; }
        .brand-hero__lead strong { color: #fff; font-weight: 700; }

        .brand-hero__media-wrap { position: relative; }
        .brand-hero__media {
          position: relative; border-radius: 28px; overflow: hidden;
          aspect-ratio: 4 / 3; background: #111;
          box-shadow: 0 40px 110px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.1);
          animation: brandFloat 9s ease-in-out infinite;
        }
        @keyframes brandFloat {
          0%,100% { transform: translateY(0) rotate(0.2deg); }
          50%     { transform: translateY(-14px) rotate(-0.3deg); }
        }
        .brand-hero__img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.9s cubic-bezier(.23,1,.32,1);
        }
        .brand-hero__media:hover .brand-hero__img { transform: scale(1.05); }
        .brand-hero__shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(128deg, transparent 38%, rgba(250,204,21,0.08) 50%, transparent 62%);
        }
        .brand-hero__frame {
          position: absolute; inset: 14px; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px; pointer-events: none;
        }

        /* ─── PROCESS ──────────────────────────── */
        .brand-process { position: relative; padding: 112px 24px; overflow: hidden; }
        .brand-process__inner {
          position: relative; z-index: 2;
          max-width: 1000px; margin: 0 auto;
          display: grid; grid-template-columns: 200px 1fr; gap: 48px;
        }
        .brand-process__rail { align-self: start; }

        .brand-prose { color: rgba(255,255,255,0.66); }
        .brand-prose h2 {
          font-size: clamp(1.6rem, 3.4vw, 2.4rem);
          font-weight: 800; color: #fff; letter-spacing: -0.025em; line-height: 1.22;
          margin: 0 0 1.2em; max-width: 22ch;
        }
        .brand-prose p {
          font-size: 1.08rem; line-height: 1.9; margin: 0 0 1.5em;
        }
        .brand-prose p:empty { display: none; }
        .brand-prose strong { color: rgba(255,255,255,0.92); }
        .brand-prose a { color: #facc15; text-decoration: underline; text-underline-offset: 3px; }
        .brand-prose ul, .brand-prose ol { margin: 0 0 1.6em; padding-left: 1.4em; }
        .brand-prose li { margin: 0 0 0.6em; line-height: 1.7; }
        .brand-prose img { max-width: 100%; height: auto; border-radius: 16px; margin: 1.5em 0; }

        /* ─── CTA ──────────────────────────────── */
        .brand-cta {
          position: relative; padding: 120px 24px 140px; overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .brand-cta__inner {
          position: relative; z-index: 2;
          max-width: 900px; margin: 0 auto; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 36px;
        }
        .brand-cta__title {
          font-size: clamp(2.2rem, 6vw, 4.6rem);
          font-weight: 900; letter-spacing: -0.045em; line-height: 0.96;
          background: linear-gradient(135deg, #fff 38%, #facc15 52%, #fff 68%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ─── RESPONSIVE ───────────────────────── */
        @media (max-width: 980px) {
          .brand-hero__inner { grid-template-columns: 1fr; gap: 48px; }
          .brand-hero__media { aspect-ratio: 16 / 10; animation: none; }
          .brand-process__inner { grid-template-columns: 1fr; gap: 24px; }
          .brand-process__rail { position: static; }
        }
        @media (max-width: 768px) {
          .brand-hero { padding: 60px 20px 52px; min-height: auto; }
          .brand-hero__index { right: 20px; top: 20px; }
          .brand-process { padding: 44px 20px; }
          .brand-cta { padding: 48px 20px 52px; }
        }
      `}</style>
    </main>
  )
}
