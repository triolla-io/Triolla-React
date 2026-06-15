import type { Metadata } from 'next'
import { client } from '@/lib/apollo-client'
import { GET_CAREERS_PAGE } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { notFound } from 'next/navigation'
import parse from 'html-react-parser'
import { FadeIn } from '@/components/FadeIn'
import { GrainOverlay, GlowOrb, Eyebrow, Button } from '@/components/ui'
import type { GetCareersPageData, CareerFields } from '@/lib/graphql-types'

const CAREERS_QUERY: TypedDocumentNode<GetCareersPageData> = gql`
  ${GET_CAREERS_PAGE}
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

async function getCareers(): Promise<CareerFields | null> {
  try {
    const { data } = await client.query({ query: CAREERS_QUERY })
    return data?.page?.template?.careerFields ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const cf = await getCareers()
  const title = cf?.headerTitle ? stripHtml(cf.headerTitle) : null
  return { title: title ? `${title} | Triolla` : 'Careers | Triolla' }
}

export default async function CareersPage() {
  const cf = await getCareers()
  if (!cf) notFound()

  const heroTitle = stripHtml(cf.headerTitle ?? '')

  return (
    <main className="careers-root bg-[#080808] text-white overflow-hidden relative">
      <GrainOverlay />

      {/* ══ HERO ══ */}
      <section className="careers-hero">
        <GlowOrb
          size={1000}
          height={520}
          shape="ellipse"
          fade="70%"
          blur={90}
          color="rgba(250,204,21,0.14)"
          className="top-[-14%] left-1/2 -translate-x-1/2 z-0 opacity-90"
        />
        <GlowOrb size={620} fade="65%" blur={80} color="rgba(251,146,60,0.06)" className="bottom-[-12%] left-[-10%] z-0 opacity-60" />
        <div className="careers-hero__grid" aria-hidden="true" />
        <div className="careers-hero__ghost" aria-hidden="true">
          ✦
        </div>
        <div className="careers-hero__index" aria-hidden="true">
          — CAREERS —
        </div>

        <div className="careers-hero__inner">
          <FadeIn yOffset={20} duration={0.7}>
            <Eyebrow
              ornament="dot"
              align="center"
              style={{ '--eb-gap': '14px', '--eb-size': '10px', '--eb-spacing': '0.3em', '--eb-dot': '5px' } as React.CSSProperties}
            >
              Triolla
            </Eyebrow>
          </FadeIn>

          {heroTitle && (
            <FadeIn yOffset={60} delay={0.1} duration={1}>
              <h1
                className="gradient-text gradient-text--animate careers-hero__title"
                style={{ '--gt-gradient': 'linear-gradient(135deg,#fff 36%,#facc15 52%,#fff 70%)' } as React.CSSProperties}
              >
                {heroTitle}
              </h1>
            </FadeIn>
          )}

          <FadeIn delay={0.22} duration={0.8}>
            <div className="careers-hero__rule" aria-hidden="true" />
          </FadeIn>

          {cf.boldText && (
            <FadeIn yOffset={16} delay={0.32}>
              <p className="careers-hero__bold">{cf.boldText}</p>
            </FadeIn>
          )}

          {cf.shortText && (
            <FadeIn yOffset={14} delay={0.4}>
              <p className="careers-hero__short">{cf.shortText}</p>
            </FadeIn>
          )}

          {cf.moreText && (
            <FadeIn yOffset={14} delay={0.46}>
              {/* WP-sourced HTML — trusted backend only */}
              <div className="careers-hero__more">{parse(cf.moreText)}</div>
            </FadeIn>
          )}

          {cf.buttonText && (
            <FadeIn yOffset={20} delay={0.56}>
              <Button
                href="/contact-us"
                variant="primary"
                style={{ '--btn-pad': '16px 34px', '--btn-gap': '10px', boxShadow: '0 4px 28px rgba(250,204,21,0.24)' } as React.CSSProperties}
              >
                {cf.buttonText}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </FadeIn>
          )}
        </div>
      </section>

      {/* TODO: jobs list + galleries (topImages / gImageList) — built separately */}

      <style>{`
        ::selection { background: #fed125; color: #000; }

        .careers-hero {
          position: relative; min-height: 92vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 150px 24px 120px; overflow: hidden;
        }
        .careers-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 50%, black 0%, transparent 100%);
        }
        .careers-hero__ghost {
          position: absolute; top: 50%; right: -1%; transform: translateY(-52%);
          font-size: clamp(220px, 32vw, 480px); line-height: 1;
          color: rgba(250,204,21,0.026); pointer-events: none; user-select: none; z-index: 0;
        }
        .careers-hero__index {
          position: absolute; top: 52px; right: 48px; z-index: 3;
          font-size: 10px; font-weight: 700; letter-spacing: 0.26em;
          text-transform: uppercase; color: rgba(255,255,255,0.17);
        }
        .careers-hero__inner {
          position: relative; z-index: 2;
          max-width: 1000px; width: 100%;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .careers-hero__title {
          font-size: clamp(3rem, 10vw, 116px);
          font-weight: 900; line-height: 0.9; letter-spacing: -0.055em;
          margin: 22px 0 0; word-break: break-word;
        }
        .careers-hero__rule {
          width: 52%; max-width: 520px; height: 1px; margin: 40px 0 36px;
          background: linear-gradient(to right, transparent, rgba(250,204,21,0.38), transparent);
        }
        .careers-hero__bold {
          font-size: clamp(1rem, 1.9vw, 1.4rem); font-weight: 700;
          color: rgba(255,255,255,0.88); line-height: 1.35; max-width: 640px;
        }
        .careers-hero__short {
          font-size: 1rem; color: rgba(255,255,255,0.46);
          line-height: 1.74; max-width: 560px; margin-top: 14px;
        }
        .careers-hero__more {
          font-size: 0.9rem; color: rgba(255,255,255,0.32);
          line-height: 1.8; max-width: 560px; margin-top: 12px;
        }
        .careers-hero__inner .btn { margin-top: 36px; }

        @media (max-width: 768px) {
          .careers-hero { padding: 64px 20px 52px; min-height: auto; }
          .careers-hero__index { right: 20px; top: 20px; }
          .careers-hero__ghost { font-size: clamp(140px, 40vw, 220px); }
        }
      `}</style>
    </main>
  )
}
