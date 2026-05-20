import { client } from "@/lib/apollo-client";
import { GET_TECHNOLOGY_PAGE, GET_THEME_SETTINGS } from "@/lib/queries";
import { gql } from "@apollo/client";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { SectionReveal } from "@/components/SectionReveal";
import { CountUpNumber } from "@/components/CountUpNumber";
import { FAQSection } from "@/components/FAQSection";
import { WannaChatSection } from "@/components/WannaChatSection";
import { TechStickyFeature } from "@/components/TechStickyFeature";
import { TechStackSection } from "@/components/TechStackSection";

function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "'")
    .trim();
}

function htmlToLines(html: string): string[] {
  return (html ?? "")
    .split(/<br\s*\/?>/gi)
    .map((s) => stripHtml(s).trim())
    .filter(Boolean);
}

async function getTechData() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_TECHNOLOGY_PAGE}
      `,
    });
    return data?.page?.template?.technologyPage ?? {};
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

export default async function TechnologyPage() {
  const [tp, ts] = await Promise.all([getTechData(), getThemeSettings()]);

  const accentColor: string = tp.headerBgColor ?? "#facc15";

  const companies: any[] = tp.companyList ?? [];
  const marqueeItems = [...companies, ...companies];

  const featuredImageUrl: string | null =
    tp.midImageOne?.node?.sourceUrl ?? null;
  const gridImages = [
    {
      url: tp.midImageTwo?.node?.sourceUrl ?? null,
      title: tp.midImageTwoTitle ?? null,
    },
    {
      url: tp.midImageThree?.node?.sourceUrl ?? null,
      title: tp.midImageThreeTitle ?? null,
    },
    {
      url: tp.midImageFour?.node?.sourceUrl ?? null,
      title: tp.midImageFourTitle ?? null,
    },
    {
      url: tp.midImageFive?.node?.sourceUrl ?? null,
      title: tp.midImageFiveTitle ?? null,
    },
    {
      url: tp.midImageSix?.node?.sourceUrl ?? null,
      title: tp.midImageSixTitle ?? null,
    },
    {
      url: tp.midImageSeven?.node?.sourceUrl ?? null,
      title: tp.midImageSevenTitle ?? null,
    },
    {
      url: tp.midImageEight?.node?.sourceUrl ?? null,
      title: tp.midImageEightTitle ?? null,
    },
  ].filter((item) => item.url);

  const hasTechGrid = !!featuredImageUrl || gridImages.length > 0;

  const steps: any[] = tp.numberList ?? [];

  /* ── All 8 Tech Stack Images ── */
  const allStackImages = [
    { url: tp.midImageOne?.node?.sourceUrl ?? null, title: null },
    ...gridImages,
  ];

  /* ── Tech-stack stepped bars ("five" section from WP) ── */
  const techStackBars: string[] = [
    tp.fivebottomTextOne,
    tp.fivebottomTextTwo,
    tp.fivebottomTextThree,
    tp.fivebottomTextFour,
    tp.fivebottomTextFive,
    tp.fivebottomTextSix,
  ].filter((v): v is string => !!v);

  /* ── Bottom portfolio grid image ── */
  const bottomGridImage: string | null =
    ts?.commonGridOneImage?.node?.sourceUrl ?? null;

  const faqItems = (tp.qaList ?? [])
    .filter((q: any) => q?.question)
    .map((q: any) => ({
      faqQuestion: q.question as string,
      faqAnswer: q.answer ?? "",
    }));

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

  return (
    <main className="overflow-hidden bg-[#080808] text-white">
      <style>{`
        /* ─── Grain overlay ─────────────────────────────── */
        .tech-grain {
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.04;
          pointer-events: none;
          z-index: 9999;
          animation: techGrain 8s steps(10) infinite;
        }
        @keyframes techGrain {
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

        /* ─── Hero ──────────────────────────────────────── */
        .tech-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: techKenBurns 20s ease-out forwards;
        }
        .tech-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
        }
        @keyframes techKenBurns {
          0%   { transform: scale(1.08); }
          100% { transform: scale(1.0); }
        }
        .tech-hero-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .tech-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .tech-hero-orb--gold {
          bottom: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 500px;
          background: radial-gradient(ellipse at center, ${accentColor}22 0%, transparent 70%);
          animation: techOrbPulse 8s ease-in-out infinite;
        }
        .tech-hero-orb--amber {
          top: 10%;
          right: -8%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, ${accentColor}0d 0%, transparent 65%);
          animation: techOrbPulse 14s ease-in-out infinite reverse;
        }
        @keyframes techOrbPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes techShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .tech-shimmer-heading {
          background: linear-gradient(135deg, #fff 40%, ${accentColor} 55%, #fff 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: techShimmer 6s linear infinite;
        }
        .tech-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 8px 16px;
          border-radius: 999px;
          margin-bottom: 32px;
        }
        .tech-eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .tech-cta-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 14px 28px;
          border-radius: 999px;
          transition: opacity 0.2s;
        }
        .tech-cta-pill:hover { opacity: 0.8; }
        .tech-scroll-cue {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 10;
        }
        .tech-scroll-cue__line {
          width: 1px;
          height: 48px;
          background: linear-gradient(to bottom, transparent, ${accentColor}99);
          animation: techScrollPulse 2s ease-in-out infinite;
        }
        .tech-scroll-cue__label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
        }
        @keyframes techScrollPulse {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }

        /* ─── Marquee banner ────────────────────────────── */
        @keyframes techMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .tech-marquee-track {
          display: flex;
          white-space: nowrap;
          animation: techMarquee 40s linear infinite;
          will-change: transform;
        }
        .tech-marquee-track:hover { animation-play-state: paused; }

        /* ─── Tech grid ─────────────────────────────────── */
        @keyframes techCardFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        .tech-grid-card {
          animation: techCardFloat calc(7s + var(--ci, 0) * 0.6s) ease-in-out infinite;
          animation-delay: calc(var(--ci, 0) * 0.5s);
          transition: box-shadow 0.4s, border-color 0.4s;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .tech-grid-card:hover {
          animation-play-state: paused;
          transform: translateY(-8px);
          box-shadow: 0 0 0 1px ${accentColor}4d, 0 24px 48px rgba(0,0,0,0.5);
          border-color: ${accentColor}4d;
        }
        .tech-grid-card img {
          transition: transform 0.65s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tech-grid-card:hover img { transform: scale(1.06); }
        .tech-grid-card .tech-grid-scrim {
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .tech-featured-card {
          border: 1px solid rgba(255,255,255,0.06);
          transition: box-shadow 0.4s;
        }
        .tech-featured-card:hover {
          box-shadow: 0 0 0 1px ${accentColor}4d, 0 32px 64px rgba(0,0,0,0.5);
        }
        .tech-featured-card img {
          transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tech-featured-card:hover img { transform: scale(1.03); }

        /* ─── Steps ─────────────────────────────────────── */
        .tech-step {
          position: relative;
          padding-top: 32px;
        }
        .tech-step__bg-num {
          position: absolute;
          top: -16px;
          left: -16px;
          font-size: 120px;
          font-weight: 900;
          color: rgba(255,255,255,0.025);
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }
        .tech-step__dot {
          width: 14px;
          height: 14px;
          background: ${accentColor};
          border-radius: 50%;
          box-shadow: 0 0 0 4px ${accentColor}26, 0 0 20px ${accentColor}4d;
        }
        .tech-step__line {
          position: absolute;
          top: 38px;
          left: 14px;
          height: 1px;
          right: -32px;
          background: linear-gradient(to right, ${accentColor}4d, rgba(255,255,255,0.05));
        }
        .tech-hide-scrollbar::-webkit-scrollbar { display: none; }
        .tech-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ─── Clients section ────────────────────────────── */
        .tech-clients-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .tech-clients-orb--left {
          top: 50%; left: -10%;
          transform: translateY(-50%);
          width: 500px; height: 500px;
          background: radial-gradient(circle, ${accentColor}12 0%, transparent 65%);
        }
        .tech-clients-orb--right {
          top: 50%; right: -10%;
          transform: translateY(-50%);
          width: 400px; height: 400px;
          background: radial-gradient(circle, ${accentColor}0d 0%, transparent 65%);
        }
        .tech-clients-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${accentColor};
        }
        .tech-clients-eyebrow__line {
          display: block;
          width: 40px;
          height: 1px;
          background: linear-gradient(to right, transparent, ${accentColor});
        }
        .tech-clients-eyebrow__line:last-child {
          background: linear-gradient(to left, transparent, ${accentColor});
        }

        /* ─── Logo marquee ───────────────────────────────── */
        .tech-marquee-wrapper {
          position: relative;
          overflow: hidden;
          padding: 8px 0;
        }
        .tech-marquee-fade {
          position: absolute;
          top: 0; bottom: 0;
          width: 200px;
          z-index: 2;
          pointer-events: none;
        }
        .tech-marquee-fade--left {
          left: 0;
          background: linear-gradient(to right, #080808 0%, transparent 100%);
        }
        .tech-marquee-fade--right {
          right: 0;
          background: linear-gradient(to left, #080808 0%, transparent 100%);
        }
        .tech-logo-track {
          display: flex;
          gap: 16px;
          animation: techLogoLeft 35s linear infinite;
          width: max-content;
        }
        .tech-logo-track--reverse {
          animation-name: techLogoRight;
          animation-duration: 28s;
        }
        .tech-marquee-wrapper:hover .tech-logo-track { animation-play-state: paused; }
        @keyframes techLogoLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes techLogoRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .tech-logo-card {
          flex-shrink: 0;
          width: 160px; height: 100px;
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
        .tech-logo-card:hover {
          border-color: ${accentColor}2e;
          background: ${accentColor}08;
          transform: translateY(-4px) scale(1.03);
        }
        .tech-logo-card__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          border-radius: 12px;
        }
      `}</style>

      {/* Grain overlay */}
      <div aria-hidden="true" className="tech-grain" />

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 pt-32 overflow-hidden">
        {/* Background */}
        {tp.headerBgOverlayLayer?.node?.sourceUrl ? (
          <>
            <img
              src={tp.headerBgOverlayLayer.node.sourceUrl}
              alt=""
              className="tech-hero-bg"
              aria-hidden="true"
            />
            <div className="tech-hero-overlay" aria-hidden="true" />
          </>
        ) : (
          <div className="tech-hero-dots" />
        )}

        {/* Ambient orbs */}
        <div className="tech-hero-orb tech-hero-orb--gold" aria-hidden="true" />
        <div
          className="tech-hero-orb tech-hero-orb--amber"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 w-full flex flex-col items-center text-center">
          {tp.headerSubText && (
            <FadeIn delay={0.05} yOffset={20}>
              <span
                className="tech-eyebrow-pill mx-auto"
                style={{ background: `${accentColor}18`, color: accentColor }}
              >
                <span
                  className="tech-eyebrow-dot"
                  style={{ background: accentColor }}
                />
                {tp.headerSubText}
              </span>
            </FadeIn>
          )}

          <FadeIn delay={0.12} yOffset={30}>
            <h1 className="text-[clamp(68px,11vw,180px)] font-black tracking-[-0.03em] leading-[0.88] mb-12 tech-shimmer-heading mx-auto">
              {tp.headerTitle}
            </h1>
          </FadeIn>

          {tp.buttonText && (
            <FadeIn delay={0.22} yOffset={20}>
              <div className="flex justify-center border-t border-white/10 pt-8 w-full max-w-md mx-auto">
                <a
                  href="#contact"
                  className="tech-cta-pill"
                  style={{ background: accentColor, color: "#000" }}
                >
                  {tp.buttonText}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
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
          )}
        </div>

        {/* Scroll cue */}
        <div className="tech-scroll-cue" aria-hidden="true">
          <div className="tech-scroll-cue__line" />
          <span className="tech-scroll-cue__label">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE BANNER
      ════════════════════════════════════════════ */}
      {companies.length > 0 && (
        <div className="overflow-hidden border-t border-b border-white/[0.07] py-5">
          <div className="tech-marquee-track">
            {marqueeItems.map((c: any, i: number) => (
              <span
                key={i}
                className="text-[15px] font-bold tracking-[0.08em] uppercase text-gray-600 mx-8 shrink-0 transition-colors duration-200 hover:text-yellow-400"
                style={{ color: undefined }}
              >
                {c.companyName}
                <span className="ml-8 text-yellow-500" aria-hidden="true">
                  {" "}
                  ·{" "}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          STICKY SPLIT-SCREEN (WOW section)
      ════════════════════════════════════════════ */}
      <TechStickyFeature
        fourmidTitle={null}
        fourtitleone={null}
        fourtitletwo={null}
        fourtext={null}
        threeConent={tp.threeConent ?? null}
        threbottomText={tp.threbottomText ?? null}
        threbottomLinkText={tp.threbottomLinkText ?? null}
        threbottomButtonLink={tp.threbottomButtonLink ?? null}
        accentColor={accentColor}
      />

      {/* ════════════════════════════════════════════
          TECH STACK — circular layout
      ════════════════════════════════════════════ */}
      <TechStackSection
        titleOne={tp.fourtitleone ?? null}
        titleTwo={tp.fourtitletwo ?? null}
        text={tp.fourtext ?? null}
        midTitle={tp.fourmidTitle ?? null}
        images={allStackImages}
        accentColor={accentColor}
      />

      {/* ════════════════════════════════════════════
          OUR CLIENTS
      ════════════════════════════════════════════ */}
      {clientLogos.length > 0 && (
        <section className="py-16 md:py-28 relative overflow-hidden border-t border-white/[0.07]">
          <div
            className="tech-clients-orb tech-clients-orb--left"
            aria-hidden="true"
          />
          <div
            className="tech-clients-orb tech-clients-orb--right"
            aria-hidden="true"
          />

          <div className="text-center mb-12 md:mb-20 relative z-10 px-4">
            {ts?.ourClientsHeading && (
              <div className="tech-clients-eyebrow justify-center mb-6">
                <span className="tech-clients-eyebrow__line" />
                {ts.ourClientsHeading}
                <span className="tech-clients-eyebrow__line" />
              </div>
            )}
            {ts?.ourClientBigText && (
              <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-3xl mx-auto leading-[0.95]">
                {ts.ourClientBigText}
              </h3>
            )}
          </div>

          <div className="tech-marquee-wrapper mb-4 relative z-10">
            <div
              className="tech-marquee-fade tech-marquee-fade--left"
              aria-hidden="true"
            />
            <div
              className="tech-marquee-fade tech-marquee-fade--right"
              aria-hidden="true"
            />
            <div className="tech-logo-track">
              {[...logoRow1, ...logoRow1].map((logo, i) => (
                <div key={i} className="tech-logo-card">
                  <img
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    className="tech-logo-card__img"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="tech-marquee-wrapper relative z-10">
            <div
              className="tech-marquee-fade tech-marquee-fade--left"
              aria-hidden="true"
            />
            <div
              className="tech-marquee-fade tech-marquee-fade--right"
              aria-hidden="true"
            />
            <div className="tech-logo-track tech-logo-track--reverse">
              {[...logoRow2, ...logoRow2].map((logo, i) => (
                <div key={i} className="tech-logo-card">
                  <img
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    className="tech-logo-card__img"
                  />
                </div>
              ))}
            </div>
          </div>

          {ts?.cButton && (
            <div className="text-center mt-16 relative z-10">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 font-bold text-[15px] px-7 py-3.5 rounded-full transition-colors hover:opacity-80"
                style={{ background: accentColor, color: "#000" }}
              >
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

      {/* ════════════════════════════════════════════
          STEPS — ANIMATED NUMBER TICKER
      ════════════════════════════════════════════ */}
      {steps.length > 0 && (
        <section className="py-24 max-w-[1600px] mx-auto overflow-hidden px-4 border-t border-white/[0.07]">
          {(tp.fivetitle || tp.fivetext) && (
            <div className="mb-16 px-10 max-w-3xl">
              {tp.fivetitle && (
                <h2 className="text-[clamp(32px,4vw,56px)] font-black tracking-[-0.02em] leading-tight mb-6">
                  {tp.fivetitle}
                </h2>
              )}
              {tp.fivetext && (
                <div
                  className="text-gray-400 text-lg leading-relaxed [&>p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: tp.fivetext }}
                />
              )}
            </div>
          )}
          <SectionReveal className="flex overflow-x-auto pb-12 tech-hide-scrollbar gap-8 px-10 snap-x">
            {steps.map((step: any, i: number) => (
              <div
                key={i}
                className="tech-step min-w-[260px] shrink-0 snap-center"
              >
                <div className="tech-step__bg-num" aria-hidden="true">
                  <CountUpNumber
                    target={parseInt(step.number ?? "0") || 0}
                    duration={1600}
                  />
                </div>
                <div className="relative z-10">
                  <div className="tech-step__dot" />
                  <div className="tech-step__line" />
                  <h4 className="text-xl font-bold mt-8">
                    {htmlToLines(step.numtitle ?? "").map((line, li) => (
                      <span key={li} className="block">
                        {line}
                      </span>
                    ))}
                  </h4>
                </div>
              </div>
            ))}
          </SectionReveal>
        </section>
      )}

      {/* ════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════ */}
      <FAQSection
        heading={tp.qatitle ?? null}
        subtext={tp.qatext ? stripHtml(tp.qatext) : null}
        items={faqItems}
      />

      {/* ════════════════════════════════════════════
          BOTTOM PORTFOLIO GRID IMAGE
      ════════════════════════════════════════════ */}
      {bottomGridImage && (
        <section className="py-8 md:py-16 max-w-[1600px] mx-auto px-6 lg:px-10">
          <FadeIn>
            <div
              className="relative rounded-[28px] overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={bottomGridImage}
                alt=""
                className="w-full h-auto block"
                style={{
                  transition: "transform 0.8s cubic-bezier(.23,1,.32,1)",
                }}
              />
            </div>
          </FadeIn>
        </section>
      )}

      {/* ════════════════════════════════════════════
          CONTACT
      ════════════════════════════════════════════ */}
      <div id="contact">
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
      </div>
    </main>
  );
}
