/* eslint-disable @typescript-eslint/no-explicit-any */
import { FadeIn } from '@/components/FadeIn'
import AnimatedSteps from '@/components/AnimatedSteps'
import { WannaChatSection } from '@/components/WannaChatSection'
import { CountUpNumber } from '@/components/CountUpNumber'
import { PortfolioShowcase } from '@/components/PortfolioShowcase'
import { Marquee } from '@/components/ui'
import parse from 'html-react-parser'

function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .trim()
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
          href: `tel:${ts.cTlvNumber.replace(/[^+\d]/g, '')}`,
        }
      : null,
    ts?.cNyLabel && ts?.cNyNumber
      ? {
          label: ts.cNyLabel,
          value: ts.cNyNumber,
          href: `tel:${ts.cNyNumber.replace(/[^+\d]/g, '')}`,
        }
      : null,
    ts?.cAddressLabel && ts?.cAddress ? { label: ts.cAddressLabel, value: ts.cAddress, href: undefined } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null)

  const portfolioItems: any[] = pf.portfolioList ?? []
  const designSteps: any[] = pf.designType ?? []
  const whyItems: any[] = pf.whyDoList ?? []
  const companies: any[] = pf.companyList ?? []
  const accentColor: string = pf.headerBgColor ?? '#fed125'

  return (
    <main className="overflow-x-clip bg-[#080808] text-white" style={{ '--accent': accentColor } as React.CSSProperties}>
      <style>{`
        /* ─── Hero ───────────────────────────────── */
        .cs-hero-dots {
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .cs-hero-glow {
          background: radial-gradient(circle at 70% 30%, color-mix(in srgb, var(--accent) 13.3%, transparent) 0%, transparent 60%);
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
          border-color: color-mix(in srgb, var(--accent) 33.3%, transparent);
          box-shadow: 0 24px 64px rgba(0,0,0,0.45),
                      0 0 0 1px color-mix(in srgb, var(--accent) 9.4%, transparent),
                      0 0 40px color-mix(in srgb, var(--accent) 3.9%, transparent);
        }
        .cs-why-card__ghost {
          position: absolute;
          top: 22px;
          right: 28px;
          font-size: 84px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.04em;
          color: rgba(255,255,255,0.03);
          pointer-events: none;
          user-select: none;
        }
        .cs-why-card__bar {
          width: 28px;
          height: 2.5px;
          background: var(--accent);
          border-radius: 2px;
          margin-bottom: 24px;
          transition: width 0.4s cubic-bezier(.23,1,.32,1);
          box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 40%, transparent);
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

        /* ─── Stat title ────────────────────────── */
        .cs-stat-num {
          font-size: clamp(96px, 14vw, 180px);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.04em;
          color: var(--accent);
          text-shadow:
            0 0 60px color-mix(in srgb, var(--accent) 33.3%, transparent),
            0 0 140px color-mix(in srgb, var(--accent) 13.3%, transparent);
          display: inline-block;
        }
        .cs-stat-line {
          display: block;
          width: 2px;
          height: 72px;
          background: linear-gradient(to bottom, var(--accent), transparent);
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
              style={{
                background: 'color-mix(in srgb, var(--accent) 9.4%, transparent)',
                color: 'var(--accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
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
                style={{ background: 'var(--accent)', color: '#000' }}
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
          <h2 className="text-[clamp(28px,3.8vw,52px)] font-bold tracking-tight leading-[1.1] text-white max-w-3xl">{pf.boldText}</h2>
        </FadeIn>
        <FadeIn delay={0.1} className="mb-4">
          <p className="text-[19px] leading-relaxed text-gray-300 font-medium max-w-3xl">{pf.shortText}</p>
        </FadeIn>
        <FadeIn delay={0.18}>
          {/* WP-sourced HTML — trusted backend only */}
          <div className="text-[16px] leading-[1.85] text-gray-400 max-w-3xl">{parse(pf.moreText ?? '')}</div>
        </FadeIn>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE BANNER
      ════════════════════════════════════════════ */}
      <div className="overflow-hidden border-t border-b border-white/[0.07] py-5">
        <Marquee
          items={companies}
          repeat={2}
          speed={40}
          renderItem={(c: any, i: number) => (
            <span key={i} className="text-[13px] font-semibold tracking-[0.06em] uppercase text-gray-600 mx-6 shrink-0">
              {c.companyName}
              <span className="ml-12 text-gray-800">·</span>
            </span>
          )}
        />
      </div>

      {/* ════════════════════════════════════════════
          PORTFOLIO CASE STUDIES
      ════════════════════════════════════════════ */}
      <section id="portfolio" className="max-w-[1400px] mx-auto px-6 lg:px-10 border-t border-white/[0.07]">
        {/* ── Stat title ── */}
        <FadeIn className="pt-20 pb-10 text-center">
          <div className="cs-stat-num">
            <CountUpNumber target={50} suffix="+" duration={1800} />
          </div>
          <span className="cs-stat-line" aria-hidden="true" />
          <p className="text-[clamp(22px,3.2vw,44px)] font-bold tracking-tight text-white leading-tight">
            {(pf.partnerWithUsText ?? '').replace(/^\d+\+?\s*/, '')}
          </p>
        </FadeIn>
      </section>

      {/* Sticky split-screen case studies — image left, copy scrolls right */}
      <PortfolioShowcase items={portfolioItems} accentColor={accentColor} />

      {/* ════════════════════════════════════════════
          DESIGN PROCESS
      ════════════════════════════════════════════ */}
      <AnimatedSteps
        steps={designSteps.map((step: any, i: number) => ({
          number: String(i + 1),
          numtitle: step.dName ?? '',
        }))}
        title={pf.uDesignHeading ?? null}
        subtext={pf.uSortText ?? null}
        accentColor={accentColor}
      />

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="py-28 max-w-[1400px] mx-auto px-6 lg:px-10 border-t border-white/[0.07]">
        <FadeIn className="mb-16">
          {/* WP-sourced HTML — trusted backend only */}
          <h2 className="text-[clamp(36px,5vw,70px)] font-black tracking-[-0.03em] leading-tight">{parse(pf.whyDoHeading ?? '')}</h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {whyItems.map((item: any, i: number) => (
            <FadeIn key={i} delay={i * 0.1} yOffset={28} duration={0.65} className="cs-why-card">
              <div className="cs-why-card__ghost" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="cs-why-card__shine" aria-hidden="true" />
              <div className="cs-why-card__bar" />
              <h3 className="text-[21px] font-bold mb-3 tracking-tight leading-snug text-white relative z-10">
                {/* WP-sourced HTML — trusted backend only */}
                <span>{parse(item.whyTitle ?? '')}</span>
              </h3>
              <p className="text-[15px] text-gray-400 leading-relaxed relative z-10">{item.whyShortText}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <WannaChatSection
        contactItems={contactItems}
        leftHeading={
          ts?.cLeftHeading
            ? ts.cLeftHeading
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .trim()
            : null
        }
        formHeading={ts?.cContactFormHeading ? stripHtml(ts.cContactFormHeading) : null}
        submitLabel={ts?.cButton ?? null}
        callUsLabel={ts?.cCallUsLabel ?? null}
      />
    </main>
  )
}
