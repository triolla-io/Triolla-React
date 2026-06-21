import { client } from '@/lib/apollo-client'
import { GET_SERVICES_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { FadeIn } from '@/components/FadeIn'
import { FAQSection } from '@/components/FAQSection'
import { HeroHeadline } from '@/components/HeroHeadline'
import { ClientsSection } from '@/components/ClientsSection'
import { GrainOverlay, GlowOrb, Eyebrow } from '@/components/ui'
import { ScrollRevealText } from '@/components/services/ScrollRevealText'
import { ServiceSections, type ServiceSectionItem } from '@/components/services/ServiceSections'
import type { GetServicesPageData, GetThemeSettingsData, ServicesPageFields, ThemeOptions, WPImage } from '@/lib/graphql-types'
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'
import { JsonLd } from '@/components/JsonLd'
import { breadcrumbSchema, serviceSchema } from '@/lib/jsonld'

const SERVICES_PAGE_QUERY: TypedDocumentNode<GetServicesPageData> = gql`
  ${GET_SERVICES_PAGE}
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
    .replace(/\s+/g, ' ')
    .trim()
}

/** Lay a flat WP menu out across two columns (no invented headings). */
function twoColumns(items: string[]): ServiceSectionItem['groups'] {
  if (items.length === 0) return []
  if (items.length < 2) return [{ items }]
  const mid = Math.ceil(items.length / 2)
  return [{ items: items.slice(0, mid) }, { items: items.slice(mid) }]
}

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
  const description = stripHtml(sp?.shortText ?? sp?.boldText ?? '') || undefined
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

  // Hero content is 1:1 from WordPress.
  const hero = {
    eyebrow: sp.headerSubText?.trim() || null,
    headline: stripHtml(sp.headerTitle ?? ''),
    statement: sp.boldText?.trim() || null,
  }

  // Service sections — 1:1 from WordPress (Product Design / Branding & Studio / Technology).
  const prodItems = (sp.prodrightMenu ?? [])
    .map((i: { prodmtitle: string | null }) => i?.prodmtitle)
    .filter((v): v is string => Boolean(v))
  const brandItems = (sp.brandrightMenu ?? [])
    .map((i: { rightmetitle: string | null }) => i?.rightmetitle)
    .filter((v): v is string => Boolean(v))

  // Technology keeps its real named groups; groups with no items are dropped.
  const devGroups: ServiceSectionItem['groups'] = [
    { title: sp.devrightMenuToptitle, items: (sp.rightMenuTopList ?? []).map((x: { rightTopMenuItem: string }) => x?.rightTopMenuItem) },
    { title: sp.devrightMenuBottitle, items: (sp.rightMenuBotList ?? []).map((x: { rightBottomMenuItem: string }) => x?.rightBottomMenuItem) },
    { title: sp.rightMenuThreeTitle, items: (sp.rightMenuThreeList ?? []).map((x: { rightThreeMenuItem: string }) => x?.rightThreeMenuItem) },
  ]
    .map((g) => ({ title: g.title?.trim() || null, items: (g.items ?? []).filter((v): v is string => Boolean(v)) }))
    .filter((g) => g.items.length > 0)

  const serviceCards: ServiceSectionItem[] = [
    sp.prodtitle && {
      number: '01',
      title: stripHtml(sp.prodtitle),
      description: sp.proddtxt ? stripHtml(sp.proddtxt) : null,
      image: sp.prodleftImageOne?.node?.sourceUrl ?? null,
      groups: twoColumns(prodItems),
    },
    sp.brandtitle && {
      number: '02',
      title: stripHtml(sp.brandtitle),
      description: sp.brandtext ? stripHtml(sp.brandtext) : null,
      image: sp.brandimageOne?.node?.sourceUrl ?? null,
      groups: twoColumns(brandItems),
    },
    sp.devtitle && {
      number: '03',
      title: stripHtml(sp.devtitle),
      description: sp.devtext ? stripHtml(sp.devtext) : null,
      image: sp.devleftimage?.node?.sourceUrl ?? null,
      groups: devGroups,
    },
  ].filter(Boolean) as ServiceSectionItem[]

  const clientLogos: { url: string; alt: string }[] = (ts?.clientsLogos ?? []).flatMap(
    (item: { cLogo: WPImage | null }) => {
      const url = item.cLogo?.node?.sourceUrl
      return url ? [{ url, alt: item.cLogo?.node?.altText ?? '' }] : []
    },
  )

  const faqItems = (ts?.questionAnswerList ?? []).flatMap(
    (q: { fQuestion: string | null; fAnswer: string | null }) =>
      q?.fQuestion ? [{ faqQuestion: q.fQuestion, faqAnswer: q.fAnswer ?? '' }] : [],
  )

  const svcPath = loc === 'he' ? '/he/services' : '/services'
  const svcJsonLd = serviceSchema({
    name: hero.headline || 'Services',
    description: hero.statement,
    path: svcPath,
    serviceType: 'Product Design & Development',
  })
  const svcCrumbs = breadcrumbSchema(
    [{ name: hero.headline || 'Services', path: svcPath }],
    loc === 'he' ? 'דף הבית' : 'Home',
  )

  return (
    <main className="bg-[#080808] text-white overflow-hidden relative">
      {svcJsonLd && <JsonLd data={[svcJsonLd, svcCrumbs]} />}
      <GrainOverlay />

      {/* ══ HERO + scroll-reveal statement ══ */}
      <section className="svc2-hero">
        <GlowOrb
          size={900}
          height={480}
          shape="ellipse"
          fade="70%"
          blur={80}
          color="rgba(250,204,21,0.12)"
          className="top-[-10%] left-1/2 -translate-x-1/2 z-0"
        />
        <GlowOrb size={560} fade="65%" blur={80} color="rgba(251,146,60,0.05)" className="bottom-[-12%] right-[-10%] z-0" />
        <div className="svc2-hero__grid" aria-hidden="true" />

        <div className="svc2-hero__content">
          {hero.eyebrow && (
            <FadeIn yOffset={20} duration={0.7}>
              <Eyebrow
                ornament="dot"
                align="center"
                style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.32em', '--eb-dot': '5px' } as React.CSSProperties}
              >
                {hero.eyebrow}
              </Eyebrow>
            </FadeIn>
          )}

          {hero.headline && (
            <HeroHeadline
              headline={hero.headline}
              headlineClassName="gradient-text gradient-text--animate text-[clamp(3rem,10vw,118px)] font-black leading-[0.9] tracking-[-0.05em] mt-6 mb-12 [word-break:break-word]"
              headlineStyle={{ '--gt-gradient': 'linear-gradient(135deg,#fff 38%,#facc15 52%,#fff 68%)' } as React.CSSProperties}
            />
          )}

          {hero.statement && <ScrollRevealText text={hero.statement} className="svc2-hero__statement" />}
        </div>

        <div className="svc2-scroll-cue" aria-hidden="true">
          <div className="svc2-scroll-cue__line" />
          <span className="svc2-scroll-cue__label">Scroll</span>
        </div>
      </section>

      {/* ══ SERVICES (stacked sections) — WP ══ */}
      {serviceCards.length > 0 && <ServiceSections cards={serviceCards} eyebrow="Capabilities" locale={loc} />}

      {/* ══ CLIENTS (WP) ══ */}
      <ClientsSection
        logos={clientLogos}
        heading={ts?.ourClientsHeading ?? null}
        bigText={ts?.ourClientBigText ?? null}
        ctaText={ts?.cButton ?? null}
        locale={loc}
      />

      {/* ══ FAQ (WP) ══ */}
      {faqItems.length > 0 && <FAQSection heading={ts?.faqHeading ?? null} subtext={ts?.faqShortText ?? null} items={faqItems} />}

      <style>{`
        ::selection { background: #fed125; color: #000; }

        .svc2-hero {
          position: relative; min-height: 92vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 128px 24px 120px; overflow: hidden; text-align: center;
        }
        .svc2-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 50%, black 0%, transparent 100%);
        }
        .svc2-hero__content { position: relative; z-index: 2; max-width: 1000px; width: 100%; }
        .svc2-hero__statement {
          font-size: clamp(1.4rem, 3.4vw, 2.6rem); font-weight: 600;
          line-height: 1.32; letter-spacing: -0.015em;
          color: #fff; max-width: 900px; margin: 0 auto;
        }
        .svc2-scroll-cue {
          position: absolute; bottom: 48px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 4; pointer-events: none;
        }
        .svc2-scroll-cue__line {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, transparent, rgba(250,204,21,0.55));
          animation: svc2Pulse 2s ease-in-out infinite;
        }
        .svc2-scroll-cue__label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.26); }
        @keyframes svc2Pulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.1)} }

        @media (max-width: 768px) {
          .svc2-hero { min-height: auto; padding: 80px 20px 48px; }
          .svc2-scroll-cue { display: none; }
          .svc2-hero__statement { font-size: clamp(1.15rem, 5.5vw, 1.7rem); line-height: 1.4; }
        }
      `}</style>
    </main>
  )
}
