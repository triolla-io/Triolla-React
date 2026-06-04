import { client } from "@/lib/apollo-client";
import { GET_TECHNOLOGY_PAGE, GET_THEME_SETTINGS } from "@/lib/queries";
import { gql } from "@apollo/client";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { FAQSection } from "@/components/FAQSection";
import { WannaChatSection } from "@/components/WannaChatSection";
import { TechStickyFeature } from "@/components/TechStickyFeature";
import { TechStackSection } from "@/components/TechStackSection";
import AnimatedSteps from "@/components/AnimatedSteps";
import parse from "html-react-parser";
import { ClientsSection } from "@/components/ClientsSection";

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

function decodeHtml(html: string): string {
  return (html ?? "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'");
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

  /* Brand yellow — CMS headerBgColor resolved dark, making accent elements
     (eyebrow lines, hover labels, CTA pill) invisible. Hardcode brand color. */
  const accentColor: string = "#facc15";

  const companies: any[] = tp.companyList ?? [];
  const marqueeItems = [...companies, ...companies];

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

  const steps: any[] = tp.numberList ?? [];

  /* ── All 8 Tech Stack Images ── */
  const allStackImages = [
    { url: tp.midImageOne?.node?.sourceUrl ?? null, title: null },
    ...gridImages,
  ];

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
    <main className="overflow-x-clip bg-[#080808] text-white">
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
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: techMarquee 55s linear infinite;
          will-change: transform;
        }
        .tech-marquee-track:hover { animation-play-state: paused; }
        .tech-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: clamp(22px, 2.8vw, 56px);
          padding-right: clamp(22px, 2.8vw, 56px);
          flex-shrink: 0;
        }
        .tech-marquee-name {
          font-size: clamp(22px, 2.8vw, 44px);
          font-weight: 900;
          letter-spacing: -0.015em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          transition: color 0.3s ease;
          line-height: 1;
        }
        .tech-marquee-item:hover .tech-marquee-name {
          color: rgba(255,255,255,0.95);
        }
        .tech-marquee-sep {
          font-size: 16px;
          display: inline-block;
          transform: translateY(-0.1em);
          letter-spacing: 0;
        }

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
      `}</style>

      {/* Grain overlay */}
      <div aria-hidden="true" className="tech-grain" />

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-28 pb-32">
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

        {/* Editorial frame — corner indices */}
        <div className="absolute top-8 left-6 lg:left-12 z-10 hidden sm:flex items-center gap-4">
          <span
            className="text-[11px] font-black tabular-nums tracking-[0.36em]"
            style={{ color: accentColor }}
          >
            01
          </span>
          <span
            aria-hidden="true"
            className="block h-px w-20"
            style={{
              background: `linear-gradient(to right, ${accentColor}66, transparent)`,
            }}
          />
        </div>
        <div className="absolute top-8 right-6 lg:right-12 z-10 hidden sm:flex items-center gap-3">
          <span aria-hidden="true" className="block h-px w-14 bg-white/25" />
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor }}
          />
        </div>
        <div className="absolute bottom-8 left-6 lg:left-12 z-10 hidden sm:flex items-center gap-3">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: accentColor }}
            />
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: accentColor }}
            />
          </span>
          <span aria-hidden="true" className="block h-px w-16 bg-white/20" />
        </div>
        <div className="absolute bottom-8 right-6 lg:right-12 z-10 hidden sm:flex items-center gap-3">
          <span aria-hidden="true" className="block h-px w-12 bg-white/20" />
          <span
            aria-hidden="true"
            className="block w-1.5 h-1.5 rotate-45 border-l border-t"
            style={{ borderColor: `${accentColor}aa` }}
          />
        </div>

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
            <h1 className="text-[clamp(60px,10.5vw,168px)] font-black tracking-[-0.035em] leading-[0.86] mb-10 tech-shimmer-heading mx-auto">
              {tp.headerTitle}
            </h1>
          </FadeIn>

          {tp.buttonText && (
            <FadeIn delay={0.22} yOffset={20}>
              <div className="flex items-center justify-center gap-5 border-t border-white/10 pt-7 w-full max-w-md mx-auto">
                <span
                  aria-hidden="true"
                  className="hidden sm:block h-px w-10"
                  style={{ background: `${accentColor}88` }}
                />
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
                <span
                  aria-hidden="true"
                  className="hidden sm:block h-px w-10"
                  style={{ background: `${accentColor}88` }}
                />
              </div>
            </FadeIn>
          )}
        </div>

        {/* Scroll cue */}
        <div className="tech-scroll-cue" aria-hidden="true">
          <div className="tech-scroll-cue__line" />
          <span className="tech-scroll-cue__label">{"Scroll"}</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE BANNER
      ════════════════════════════════════════════ */}
      {companies.length > 0 && (
        <div className="relative overflow-hidden border-t border-b border-white/[0.07] py-7">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-40 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, #080808, transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-40 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, #080808, transparent)",
            }}
          />
          <div className="tech-marquee-track">
            {marqueeItems.map((c: any, i: number) => (
              <span key={i} className="tech-marquee-item">
                <span className="tech-marquee-name">{c.companyName}</span>
                <span
                  className="tech-marquee-sep"
                  style={{ color: accentColor }}
                  aria-hidden="true"
                >
                  ✦
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
      <ClientsSection
        logos={clientLogos}
        heading={ts?.ourClientsHeading ?? null}
        bigText={ts?.ourClientBigText ?? null}
        ctaText={ts?.cButton ?? null}
        accentColor={accentColor}
      />

      {/* ════════════════════════════════════════════
          STEPS — ANIMATED NUMBER TICKER
      ════════════════════════════════════════════ */}
      <AnimatedSteps
        steps={steps}
        title={tp.fivetitle ?? null}
        subtext={tp.fivetext ?? null}
        accentColor={accentColor}
      />

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
        <section className="py-6 md:py-12 max-w-[1600px] mx-auto px-6 lg:px-10">
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
