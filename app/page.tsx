import Link from "next/link";
import { HeroHeadline } from "@/components/HeroHeadline";
import { SectionReveal } from "@/components/SectionReveal";
import { FadeIn } from "@/components/FadeIn";
import { CountUpNumber } from "@/components/CountUpNumber";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { FAQSection } from "@/components/FAQSection";
import { GridImageSection } from "@/components/GridImageSection";
import { WannaChatSection } from "@/components/WannaChatSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import AnimatedSteps from "@/components/AnimatedSteps";
import { client } from "@/lib/apollo-client";
import { GET_HOME_PAGE, GET_THEME_SETTINGS } from "@/lib/queries";
import { gql } from "@apollo/client";

/* ── WP content helpers ──────────────────────────── */

function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseAward(wboxTitle: string): { rank: number; label: string } {
  const rankMatch = wboxTitle.match(/#(\d+)/);
  const rank = rankMatch ? parseInt(rankMatch[1]) : 1;
  const label = wboxTitle
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/#\d+\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { rank, label };
}

/* ── Data fetching ───────────────────────────────── */

async function getHomeData() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_HOME_PAGE}
      `,
    });
    return data?.page?.template?.homePage ?? {};
  } catch {
    return {};
  }
}

async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    });
    return data?.themeSetting?.themeOptions ?? null;
  } catch {
    return null;
  }
}

/* ── Page ────────────────────────────────────────── */

export default async function Home() {
  const [hp, ts] = await Promise.all([getHomeData(), getThemeSettings()]);

  const heroHeadline = stripHtml(hp.topsectitle ?? "");
  const heroSubtext = stripHtml(hp.toptext ?? "");

  const winTitle = hp.winTitle ?? "";
  const winSubtext = hp.winSubtitle ?? "";

  const awards = (hp.wboxes ?? []).map((b: any) => ({
    ...parseAward(b.wboxTitle ?? ""),
    imgUrl: b.winImg?.node?.sourceUrl ?? null,
  }));

  const whyTitle = stripHtml(hp.abthretitle ?? "");
  const whyText = stripHtml(hp.abtthretext ?? "");
  const serviceCards: any[] = hp.abthrelist ?? [];

  const clientLogos: { url: string; alt: string }[] = (ts?.clientsLogos ?? [])
    .map((item: any) => ({
      url: item.cLogo?.node?.sourceUrl ?? "",
      alt: item.cLogo?.node?.altText ?? "",
    }))
    .filter((l: { url: string }) => l.url);

  const half = Math.ceil(clientLogos.length / 2);
  const logoRow1 = clientLogos.slice(0, half);
  const logoRow2 = clientLogos.slice(half);

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
          href: `tel:${ts.cTlvNumber.replace(/[^+\d]/g, "")}`,
        }
      : null,
    ts?.cNyLabel && ts?.cNyNumber
      ? {
          label: ts.cNyLabel,
          value: ts.cNyNumber,
          href: `tel:${ts.cNyNumber.replace(/[^+\d]/g, "")}`,
        }
      : null,
    ts?.cAddressLabel && ts?.cAddress
      ? { label: ts.cAddressLabel, value: ts.cAddress, href: undefined }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  const faqItems = (ts?.questionAnswerList ?? [])
    .filter((q: any) => q?.fQuestion)
    .map((q: any) => ({
      faqQuestion: q.fQuestion as string,
      faqAnswer: (q.fAnswer ?? "") as string,
    }));

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-32 relative">
      {/* ── Grain noise overlay ── */}
      <div aria-hidden="true" className="grain-overlay" />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center pt-24 md:pt-32 pb-14 md:pb-20 px-4 overflow-hidden">
        {/* Ambient orb cluster */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="hero-orb hero-orb--gold" />
          <div className="hero-orb hero-orb--amber" />
          <div className="hero-orb hero-orb--dim" />
          <div className="hero-grid" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center w-full">
          {/* Eyebrow */}
          <div className="eyebrow">
            <span className="eyebrow__dot" />
            Product UX/UI design for
            <span className="eyebrow__dot" />
          </div>

          <HeroHeadline
            headline={heroHeadline}
            subtext={heroSubtext}
            headlineClassName="text-[clamp(2.2rem,10vw,110px)] leading-[0.9] font-bold tracking-tighter mb-6 md:mb-8 max-w-[1200px] hero-headline"
            subtextClassName="text-base md:text-xl lg:text-2xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed"
          />
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue" aria-hidden="true">
          <div className="scroll-cue__line" />
          <span className="scroll-cue__label">{`Scroll`}</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PORTFOLIO GRID
      ══════════════════════════════════════════════ */}
      <section className="relative z-20 max-w-[1600px] mx-auto px-4 -mt-10 mb-16 md:mb-32">
        <PortfolioGrid />
      </section>

      {/* ══════════════════════════════════════════════
          WHY US SECTION
      ══════════════════════════════════════════════ */}
      <WhyUsSection
        title={whyTitle}
        text={whyText}
        cards={serviceCards}
        ctaText="Partner with us"
        ctaLink="/contact-us"
      />

      {/* ══════════════════════════════════════════════
          AWARDS SECTION
      ══════════════════════════════════════════════ */}
      <section
        id="winners-section"
        className="winners-section mb-16 md:mb-32 relative overflow-hidden"
      >
        {/* Ambient light orbs */}
        <div className="winners-orb winners-orb--tl" aria-hidden="true" />
        <div className="winners-orb winners-orb--br" aria-hidden="true" />
        <div className="winners-orb winners-orb--center" aria-hidden="true" />

        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="winners-sparkle"
            style={{ "--si": i } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <FadeIn className="text-center mb-20">
            <h3 className="winners-title">{winTitle}</h3>
            <p className="winners-subtitle">{winSubtext}</p>
          </FadeIn>

          <SectionReveal className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {awards.map(
              (
                award: { rank: number; label: string; imgUrl: string | null },
                i: number,
              ) => (
                <div
                  key={i}
                  className="award-card group"
                  style={{ "--ai": i } as React.CSSProperties}
                >
                  <div className="award-medal-wrap">
                    {award.imgUrl ? (
                      <img
                        src={award.imgUrl}
                        alt={award.label}
                        className="award-medal-img"
                      />
                    ) : (
                      <div className="award-medal-fallback">
                        #
                        <CountUpNumber
                          target={award.rank}
                          duration={900 + i * 200}
                        />
                      </div>
                    )}
                  </div>
                  <div className="award-label">
                    <span className="award-label__rank">#{award.rank}</span>
                    <span>{award.label}</span>
                  </div>
                </div>
              ),
            )}
          </SectionReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLIENTS SECTION
      ══════════════════════════════════════════════ */}
      {clientLogos.length > 0 && (
        <section className="clients-section py-16 md:py-28 mb-16 md:mb-32 relative overflow-hidden">
          {/* Ambient atmosphere */}
          <div className="clients-orb clients-orb--left" aria-hidden="true" />
          <div className="clients-orb clients-orb--right" aria-hidden="true" />

          {/* Heading */}
          <div className="text-center mb-12 md:mb-20 relative z-10 px-4">
            {ts?.ourClientsHeading && (
              <div className="clients-eyebrow">
                <span className="clients-eyebrow__line" />
                {ts.ourClientsHeading}
                <span className="clients-eyebrow__line" />
              </div>
            )}
            {ts?.ourClientBigText && (
              <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mt-6 max-w-3xl mx-auto leading-[0.95]">
                {ts.ourClientBigText}
              </h3>
            )}
          </div>

          {/* Row 1 — scrolls left */}
          <div className="marquee-wrapper mb-4 relative z-10">
            <div
              className="marquee-fade marquee-fade--left"
              aria-hidden="true"
            />
            <div
              className="marquee-fade marquee-fade--right"
              aria-hidden="true"
            />
            <div className="marquee-track">
              {[...logoRow1, ...logoRow1].map((logo, i) => (
                <div key={i} className="logo-card">
                  <img
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    className="logo-card__img"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div className="marquee-wrapper relative z-10">
            <div
              className="marquee-fade marquee-fade--left"
              aria-hidden="true"
            />
            <div
              className="marquee-fade marquee-fade--right"
              aria-hidden="true"
            />
            <div className="marquee-track marquee-track--reverse">
              {[...logoRow2, ...logoRow2].map((logo, i) => (
                <div key={i} className="logo-card">
                  <img
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    className="logo-card__img"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          {ts?.cButton && (
            <div className="text-center mt-16 relative z-10">
              <Link href="/contact-us" className="btn-primary">
                {ts.cButton}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8H14M10.5 4L14 8L10.5 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════
          DESIGN PROCESS TIMELINE
      ══════════════════════════════════════════════ */}
      <AnimatedSteps
        steps={(hp.designType ?? []).map((item: any, i: number) => ({
          number: String(i + 1),
          numtitle: item.dName ?? "",
        }))}
        title={hp.uDesignHeading ?? null}
        subtext={hp.uSortText ?? null}
      />

      {/* ══════════════════════════════════════════════
          FAQ SECTION
      ══════════════════════════════════════════════ */}
      <FAQSection
        heading={ts?.faqHeading ?? null}
        subtext={ts?.faqShortText ?? null}
        items={faqItems}
      />

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
      <WannaChatSection
        contactItems={contactItems}
        leftHeading={
          ts?.cLeftHeading
            ? ts.cLeftHeading
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<[^>]+>/g, "")
                .trim()
            : null
        }
        formHeading={
          ts?.cContactFormHeading ? stripHtml(ts.cContactFormHeading) : null
        }
        submitLabel={ts?.cButton ?? null}
        callUsLabel={ts?.cCallUsLabel ?? null}
      />

      {/* ══════════════════════════════════════════════
          GLOBAL STYLES
      ══════════════════════════════════════════════ */}
      <style>{`
        /* ─── Fonts ─────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');

        /* ─── Grain overlay ─────────────────────── */
        .grain-overlay {
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.04;
          pointer-events: none;
          z-index: 9999;
          animation: grain 8s steps(10) infinite;
        }
        @keyframes grain {
          0%   { transform: translate(0,0); }
          10%  { transform: translate(-5%,-10%); }
          20%  { transform: translate(-15%, 5%); }
          30%  { transform: translate( 7%,-25%); }
          40%  { transform: translate(-5%, 25%); }
          50%  { transform: translate(-15%, 10%); }
          60%  { transform: translate(15%, 0%); }
          70%  { transform: translate( 0%, 15%); }
          80%  { transform: translate( 3%,  35%); }
          90%  { transform: translate(-10%, 10%); }
          100% { transform: translate(0, 0); }
        }

        /* ─── Hero ambient orbs ─────────────────── */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-orb--gold {
          bottom: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 500px;
          background: radial-gradient(ellipse at center, rgba(250,204,21,0.14) 0%, transparent 70%);
          animation: orbPulse 8s ease-in-out infinite;
        }
        .hero-orb--amber {
          top: -5%;
          left: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 65%);
          animation: orbPulse 11s ease-in-out infinite reverse;
        }
        .hero-orb--dim {
          top: 10%;
          right: -8%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%);
          animation: orbPulse 14s ease-in-out infinite;
        }
        @keyframes orbPulse {
          0%,100% { opacity: 1; transform: scale(1) translateX(var(--tx,0)); }
          50%      { opacity: 0.7; transform: scale(1.08) translateX(var(--tx,0)); }
        }

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

        /* ─── Hero headline golden shimmer ──────── */
        .hero-headline {
          background: linear-gradient(135deg, #fff 40%, #facc15 55%, #fff 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 6s linear infinite;
        }
        @keyframes textShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        /* ─── Eyebrow label ─────────────────────── */
        .eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #facc15;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 28px;
        }
        .eyebrow__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #facc15;
          animation: dotBlink 2s ease-in-out infinite;
        }
        @keyframes dotBlink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }

        .section-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 0;
        }

        /* ─── Buttons ───────────────────────────── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #facc15;
          color: #000;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: 999px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 0 0 rgba(250,204,21,0);
        }
        .btn-primary:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(250,204,21,0.3);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.6);
          font-size: 15px;
          font-weight: 500;
          padding: 14px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-ghost:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
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
        @keyframes scrollPulse {
          0%,100% { opacity: 0.4; transform: scaleY(1); }
          50%      { opacity: 1;   transform: scaleY(1.1); }
        }

        /* ─── Portfolio cards ───────────────────── */
        .portfolio-card {
          overflow: hidden;
          border-radius: 20px;
          position: relative;
          background: #0f0f0f;
          box-shadow: 0 4px 40px rgba(0,0,0,0.4);
          transition: transform 0.5s cubic-bezier(.23,1,.32,1), box-shadow 0.5s;
          width: 100%;
        }
        .portfolio-card:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(250,204,21,0.18);
        }
        .portfolio-card__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
          transition: transform 0.7s cubic-bezier(.23,1,.32,1);
          display: block;
        }
        .portfolio-card:hover .portfolio-card__img {
          transform: scale(1.07);
        }
        .portfolio-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 65%);
          display: flex;
          align-items: flex-end;
          padding: 24px;
          opacity: 0;
          transition: opacity 0.35s;
        }
        .portfolio-card:hover .portfolio-card__overlay { opacity: 1; }
        .portfolio-card__tag {
          background: #facc15;
          color: #000;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          letter-spacing: 0.05em;
          transform: translateY(10px);
          transition: transform 0.4s cubic-bezier(.23,1,.32,1);
        }
        .portfolio-card:hover .portfolio-card__tag { transform: translateY(0); }
        .portfolio-card__shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.045) 50%, transparent 60%);
          background-size: 200% 100%;
          background-position: 200% 0;
          transition: background-position 0.55s;
          pointer-events: none;
        }
        .portfolio-card:hover .portfolio-card__shine {
          background-position: -200% 0;
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

        /* ─── Clients section ───────────────────── */
        .clients-section {
          position: relative;
        }
        .clients-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .clients-orb--left {
          top: 50%;
          left: -10%;
          transform: translateY(-50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 65%);
        }
        .clients-orb--right {
          top: 50%;
          right: -10%;
          transform: translateY(-50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%);
        }

        /* Clients eyebrow */
        .clients-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #facc15;
        }
        .clients-eyebrow__line {
          display: block;
          width: 40px;
          height: 1px;
          background: linear-gradient(to right, transparent, #facc15);
        }
        .clients-eyebrow__line:last-child {
          background: linear-gradient(to left, transparent, #facc15);
        }

        /* Clients italic gradient headline */
        .clients-headline-em {
          font-style: italic;
          background: linear-gradient(90deg, #facc15 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ─── Logo marquee ───────────────────────── */
        .marquee-wrapper {
          position: relative;
          overflow: hidden;
          padding: 8px 0;
        }
        .marquee-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 200px;
          z-index: 2;
          pointer-events: none;
        }
        .marquee-fade--left {
          left: 0;
          background: linear-gradient(to right, #080808 0%, transparent 100%);
        }
        .marquee-fade--right {
          right: 0;
          background: linear-gradient(to left, #080808 0%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          gap: 16px;
          animation: marqueeLeft 35s linear infinite;
          width: max-content;
        }
        .marquee-track--reverse {
          animation-name: marqueeRight;
          animation-duration: 28s;
        }
        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        /* Logo cards */
        .logo-card {
          flex-shrink: 0;
          width: 160px;
          height: 100px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          transition: border-color 0.4s, background 0.4s, transform 0.4s;
          overflow: hidden;
        }
        .logo-card:hover {
          border-color: rgba(250,204,21,0.18);
          background: rgba(250,204,21,0.03);
          transform: translateY(-4px) scale(1.03);
        }
        .logo-card__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          border-radius: 12px;
        }

        /* ─── Scrollbar hide ────────────────────── */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ══════════════════════════════════════════
           MOBILE-ONLY STYLES (max-width: 768px)
        ══════════════════════════════════════════ */

        /* ─── Hero orbs — feel bigger on mobile ── */
        @media (max-width: 768px) {
          .hero-orb--gold {
            width: 560px; height: 320px;
          }
          .hero-orb--amber {
            width: 400px; height: 400px; top: 0; left: -20%;
          }
          .hero-orb--dim {
            width: 320px; height: 320px;
          }
        }

        /* ─── Winners section ──────────────────── */
        @media (max-width: 768px) {
          .winners-section {
            padding: 72px 0 80px;
          }
          .winners-title {
            font-size: clamp(1.8rem, 8vw, 2.6rem);
          }
          .winners-subtitle {
            font-size: 1rem;
          }
          .award-medal-img {
            width: 170px; height: 170px;
          }
          .award-medal-fallback {
            width: 140px; height: 140px; font-size: 38px;
          }
          .award-label {
            font-size: 0.875rem;
          }
          .award-label__rank {
            font-size: 1rem;
          }
        }

        /* ─── Logo marquee ─────────────────────── */
        @media (max-width: 768px) {
          .logo-card {
            width: 120px; height: 76px;
            border-radius: 14px;
          }
          .marquee-track {
            animation-duration: 25s;
          }
          .marquee-track--reverse {
            animation-duration: 20s;
          }
          .marquee-fade {
            width: 80px;
          }
        }

        /* ─── Clients section ──────────────────── */
        @media (max-width: 768px) {
          .clients-section {
            padding-top: 64px;
            padding-bottom: 64px;
          }
        }

      `}</style>
    </main>
  );
}
