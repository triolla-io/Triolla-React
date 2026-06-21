/* eslint-disable @typescript-eslint/no-explicit-any */
import { FadeIn } from '@/components/FadeIn'
import AnimatedSteps from '@/components/AnimatedSteps'
import { WannaChatSection } from '@/components/WannaChatSection'
import { CountUpNumber } from '@/components/CountUpNumber'
import { PortfolioShowcase } from '@/components/PortfolioShowcase'
import { Marquee } from '@/components/ui'
import parse from 'html-react-parser'
import { stripHtml } from '@/lib/text'

export function PortfolioTemplate({ pf, ts, locale = 'en' }: { pf: any; ts: any; locale?: string }) {
  const isRtl = locale === 'he'
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

        /* ─── Mobile overrides ──────────────────────── */
        @media (max-width: 768px) {
          .cs-stat-num { font-size: clamp(72px, 20vw, 180px); }
          .cs-stat-line { height: 48px; margin: 18px auto; }

          /* Why items: editorial numbered list on mobile */
          .cs-why-card {
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            border-radius: 0;
            padding: 24px 0 22px;
            box-shadow: none !important;
            transform: none !important;
          }
          .cs-why-card:first-child { border-top: 1px solid rgba(255,255,255,0.07); }
          .cs-why-card__ghost { display: none; }
          .cs-why-card__shine { display: none; }
          .cs-why-card__bar { display: none; }
          .cs-why-card__num {
            display: block;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: var(--accent);
            margin-bottom: 10px;
          }
        }

        /* ─── Portal button ──────────────────────── */
        .cs-portal-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 2px;
          border-radius: 999px;
          text-decoration: none;
          background: transparent;
          transition: transform 0.45s cubic-bezier(0.23,1,0.32,1),
                      box-shadow 0.45s;
          flex-shrink: 0;
        }
        .cs-portal-inner {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 999px;
          background: var(--accent);
          color: #000;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          transition: background 0.35s;
          white-space: nowrap;
        }
        .cs-portal-btn:hover {
          transform: scale(1.05);
          box-shadow:
            0 0 36px color-mix(in srgb, var(--accent) 38%, transparent),
            0 0 72px color-mix(in srgb, var(--accent) 14%, transparent);
        }
        .cs-portal-btn:hover .cs-portal-inner { background: #fff; }

        /* ─── World seam ─────────────────────────── */
        .cs-world-seam {
          position: relative;
          height: 1px;
          pointer-events: none;
        }
        .cs-world-seam__line {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            transparent 0%,
            color-mix(in srgb, var(--accent) 10%, transparent) 25%,
            color-mix(in srgb, var(--accent) 22%, transparent) 50%,
            color-mix(in srgb, var(--accent) 10%, transparent) 75%,
            transparent 100%
          );
        }
        .cs-world-seam__glow {
          position: absolute;
          left: 50%;
          top: -18px;
          transform: translateX(-50%);
          width: 160px;
          height: 36px;
          background: radial-gradient(ellipse,
            color-mix(in srgb, var(--accent) 14%, transparent) 0%,
            transparent 70%
          );
          filter: blur(14px);
          animation: cs-seam-pulse 3.5s ease-in-out infinite;
        }
        @keyframes cs-seam-pulse {
          0%,100% { opacity: 0.55; transform: translateX(-50%) scaleX(1); }
          50%      { opacity: 1;    transform: translateX(-50%) scaleX(1.5); }
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
      <section className="relative flex flex-col justify-center min-h-[56vh] md:min-h-[62vh] pt-20 md:pt-28 pb-12 md:pb-16 overflow-hidden">
        <div className="cs-hero-dots absolute inset-0 z-0" />
        <div className="cs-hero-glow absolute inset-0 z-0 pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
          <FadeIn delay={0.05} yOffset={24} duration={0.55}>
            <span
              className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.14em] uppercase px-4 py-2 rounded-full mb-6"
              style={{
                background: 'color-mix(in srgb, var(--accent) 9.4%, transparent)',
                color: 'var(--accent)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              {pf.headerSubText}
            </span>
          </FadeIn>

          <FadeIn delay={0.1} yOffset={32} duration={0.7}>
            <h1 className="text-[clamp(48px,10vw,160px)] font-black tracking-[-0.03em] leading-[0.9] mb-8 text-white">
              {pf.headerTitle}
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} yOffset={20} duration={0.55}>
            <a href="#portfolio" className="cs-portal-btn">
              <span className="cs-portal-inner">
                {pf.buttonText}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* World seam 1 — hero → intro */}
      <div className="cs-world-seam" aria-hidden="true">
        <span className="cs-world-seam__line" />
        <span className="cs-world-seam__glow" />
      </div>

      {/* ════════════════════════════════════════════
          INTRO
      ════════════════════════════════════════════ */}
      <section className="pt-10 pb-14 md:pt-16 md:pb-20 max-w-[1400px] mx-auto px-6 lg:px-10">
        <FadeIn className="mb-6">
          <h2 className="text-[clamp(24px,3.4vw,48px)] font-bold tracking-tight leading-[1.1] text-white max-w-3xl">{pf.boldText}</h2>
        </FadeIn>
        <FadeIn delay={0.1} className="mb-3">
          <p className="text-[17px] md:text-[19px] leading-relaxed text-gray-300 font-medium max-w-3xl">{pf.shortText}</p>
        </FadeIn>
        <FadeIn delay={0.18}>
          {/* WP-sourced HTML — trusted backend only */}
          <div className="text-[15px] md:text-[16px] leading-[1.85] text-gray-400 max-w-3xl">{parse(pf.moreText ?? '')}</div>
        </FadeIn>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE BANNER
      ════════════════════════════════════════════ */}
      {companies.length > 0 && (
        <div className="overflow-hidden border-y border-white/[0.05] py-4">
          <Marquee
            items={companies}
            repeat={2}
            speed={40}
            renderItem={(c: any, i: number) => (
              <span key={i} className="text-[12px] font-semibold tracking-[0.06em] uppercase text-gray-700 mx-6 shrink-0">
                {c.companyName}
                <span className="ml-10 text-gray-800">·</span>
              </span>
            )}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════
          PORTFOLIO CASE STUDIES — stat + showcase
      ════════════════════════════════════════════ */}
      <section id="portfolio" className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <FadeIn className="pt-12 pb-8 md:pt-16 md:pb-10 text-center">
          <div className="cs-stat-num">
            <CountUpNumber target={50} suffix="+" duration={1800} />
          </div>
          <span className="cs-stat-line" aria-hidden="true" />
          <p className="text-[clamp(20px,3vw,40px)] font-bold tracking-tight text-white leading-tight">
            {(pf.partnerWithUsText ?? '').replace(/^\d+\+?\s*/, '')}
          </p>
        </FadeIn>
      </section>

      {/* World seam 2 — stat → showcase */}
      <div className="cs-world-seam" aria-hidden="true">
        <span className="cs-world-seam__line" />
        <span className="cs-world-seam__glow" />
      </div>

      {/* Sticky split-screen case studies — image left, copy scrolls right */}
      <PortfolioShowcase items={portfolioItems} accentColor={accentColor} isRtl={isRtl} />

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

      {/* World seam 3 — process → why */}
      <div className="cs-world-seam" aria-hidden="true">
        <span className="cs-world-seam__line" />
        <span className="cs-world-seam__glow" />
      </div>

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="py-12 md:py-20 max-w-[1400px] mx-auto px-6 lg:px-10" style={{ background: 'linear-gradient(180deg, #080808 0%, #060608 100%)' }}>
        <FadeIn className="mb-8 md:mb-14">
          <h2 className="text-[clamp(28px,6vw,70px)] font-black tracking-[-0.03em] leading-[1.05] gradient-text gradient-text--animate"
            style={{ '--gt-gradient': `linear-gradient(135deg, #fff 35%, var(--accent) 52%, #fff 68%)` } as React.CSSProperties}>
            {/* WP-sourced HTML — trusted backend only */}
            {parse(pf.whyDoHeading ?? '')}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          {whyItems.map((item: any, i: number) => (
            <FadeIn key={i} delay={i * 0.08} yOffset={24} duration={0.55} className="cs-why-card">
              <div className="cs-why-card__ghost" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="cs-why-card__shine" aria-hidden="true" />
              <div className="cs-why-card__bar" />
              {/* Mobile: accent number label */}
              <span className="cs-why-card__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[19px] md:text-[21px] font-bold mb-2 md:mb-3 tracking-tight leading-snug text-white relative z-10">
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
