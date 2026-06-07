import { FadeIn } from "@/components/FadeIn";
import { SectionReveal } from "@/components/SectionReveal";
import { WannaChatSection } from "@/components/WannaChatSection";
import { CountUpNumber } from "@/components/CountUpNumber";
import parse from "html-react-parser";

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

function parseAccentHeading(html: string): { text: string; accent: boolean }[] {
  const cleaned = (html ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ");
  const segments = cleaned.split(/(<span[^>]*>[\s\S]*?<\/span>)/i);
  return segments
    .filter((s) => s.length > 0)
    .map((seg) => {
      const inner = seg.match(/^<span[^>]*>([\s\S]*?)<\/span>$/i);
      return inner
        ? { text: inner[1], accent: true }
        : { text: seg, accent: false };
    });
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

  const portfolioItems: any[] = pf.portfolioList ?? [];
  const designSteps: any[] = pf.designType ?? [];
  const whyItems: any[] = pf.whyDoList ?? [];
  const companies: any[] = pf.companyList ?? [];
  const accentColor: string = pf.headerBgColor ?? "#fed125";
  const designHeadingParts = parseAccentHeading(pf.uDesignHeading ?? "");
  const marqueeItems = [...companies, ...companies];

  return (
    <main className="overflow-hidden bg-[#080808] text-white">
      <style>{`
        /* ─── Hero ───────────────────────────────── */
        .cs-hero-dots {
          background-image: radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .cs-hero-glow {
          background: radial-gradient(circle at 70% 30%, ${accentColor}22 0%, transparent 60%);
        }

        /* ─── Portfolio cards ────────────────────── */
        .cs-p-card {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 48px 0;
        }
        .cs-p-card:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .cs-p-img {
          border-radius: 18px;
          overflow: hidden;
          background: #111;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
        }
        .cs-p-img img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cs-p-card:hover .cs-p-img img {
          transform: scale(1.025);
        }
        .cs-tag {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid rgba(250,204,21,0.3);
          color: #facc15;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: background 0.2s;
        }
        .cs-tag:hover {
          background: rgba(250,204,21,0.1);
        }

        /* ─── Design process ─────────────────────── */
        .cs-step {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 28px 24px 32px;
          background: #0d0d0d;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .cs-step:hover {
          border-color: ${accentColor}55;
          background: #111;
          transform: translateY(-3px);
        }
        .cs-step-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: ${accentColor};
          margin-bottom: 14px;
          display: block;
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
          border-color: ${accentColor}55;
          box-shadow: 0 24px 64px rgba(0,0,0,0.45),
                      0 0 0 1px ${accentColor}18,
                      0 0 40px ${accentColor}0a;
        }
        .cs-why-card__ghost {
          position: absolute;
          top: -10px;
          right: 20px;
          font-size: 96px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.04em;
          color: rgba(255,255,255,0.028);
          pointer-events: none;
          user-select: none;
        }
        .cs-why-card__bar {
          width: 28px;
          height: 2.5px;
          background: ${accentColor};
          border-radius: 2px;
          margin-bottom: 24px;
          transition: width 0.4s cubic-bezier(.23,1,.32,1);
          box-shadow: 0 0 10px ${accentColor}66;
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

        /* ─── Companies marquee ──────────────────── */
        @keyframes cs-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cs-marquee-track {
          display: flex;
          white-space: nowrap;
          animation: cs-marquee 40s linear infinite;
          will-change: transform;
        }
        .cs-marquee-track:hover {
          animation-play-state: paused;
        }

        /* ─── Stat title ────────────────────────── */
        .cs-stat-num {
          font-size: clamp(96px, 14vw, 180px);
          font-weight: 900;
          line-height: 0.88;
          letter-spacing: -0.04em;
          color: ${accentColor};
          text-shadow:
            0 0 60px ${accentColor}55,
            0 0 140px ${accentColor}22;
          display: inline-block;
        }
        .cs-stat-line {
          display: block;
          width: 2px;
          height: 72px;
          background: linear-gradient(to bottom, ${accentColor}, transparent);
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

        /* ─── Timeline (design process) ─────────── */
        .cs-timeline-item {
          position: relative;
          padding-top: 32px;
        }
        .cs-timeline-item__bg-num {
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
        .cs-timeline-item__dot {
          width: 14px; height: 14px;
          background: ${accentColor};
          border-radius: 50%;
          box-shadow: 0 0 0 4px ${accentColor}26, 0 0 20px ${accentColor}4d;
        }
        .cs-timeline-item__line {
          position: absolute;
          top: 38px;
          left: 14px;
          height: 1px;
          right: -32px;
          background: linear-gradient(to right, ${accentColor}4d, rgba(255,255,255,0.05));
        }
        .cs-hide-scrollbar::-webkit-scrollbar { display: none; }
        .cs-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

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
              style={{ background: `${accentColor}18`, color: accentColor }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accentColor }}
              />
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
                style={{ background: accentColor, color: "#000" }}
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
          <h2 className="text-[clamp(28px,3.8vw,52px)] font-bold tracking-tight leading-[1.1] text-white max-w-3xl">
            {pf.boldText}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1} className="mb-4">
          <p className="text-[19px] leading-relaxed text-gray-300 font-medium max-w-3xl">
            {pf.shortText}
          </p>
        </FadeIn>
        <FadeIn delay={0.18}>
          {/* WP-sourced HTML — trusted backend only */}
          <div className="text-[16px] leading-[1.85] text-gray-400 max-w-3xl">
            {parse(pf.moreText ?? "")}
          </div>
        </FadeIn>
      </section>

      {/* ════════════════════════════════════════════
          MARQUEE BANNER
      ════════════════════════════════════════════ */}
      <div className="overflow-hidden border-t border-b border-white/[0.07] py-5">
        <div className="cs-marquee-track">
          {marqueeItems.map((c: any, i: number) => (
            <span
              key={i}
              className="text-[13px] font-semibold tracking-[0.06em] uppercase text-gray-600 mx-6 shrink-0"
            >
              {c.companyName}
              <span className="ml-12 text-gray-800">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PORTFOLIO CASE STUDIES
      ════════════════════════════════════════════ */}
      <section
        id="portfolio"
        className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-28 border-t border-white/[0.07]"
      >
        {/* ── Stat title ── */}
        <FadeIn className="pt-20 pb-4 text-center">
          <div className="cs-stat-num">
            <CountUpNumber target={50} suffix="+" duration={1800} />
          </div>
          <span className="cs-stat-line" aria-hidden="true" />
          <p className="text-[clamp(22px,3.2vw,44px)] font-bold tracking-tight text-white leading-tight">
            {(pf.partnerWithUsText ?? "").replace(/^\d+\+?\s*/, "")}
          </p>
        </FadeIn>

        {portfolioItems.map((item: any, i: number) => {
          const isEven = i % 2 === 0;
          return (
            <div key={i} className="cs-p-card">
              <div
                className={`flex flex-col lg:gap-16 lg:items-center ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                {/* Text panel — vertically centered against image */}
                <FadeIn
                  xOffset={isEven ? -40 : 40}
                  yOffset={0}
                  duration={0.7}
                  delay={0.05}
                  className="lg:w-[40%] shrink-0 flex flex-col gap-5 py-8"
                >
                  {item.pLogo?.node?.sourceUrl && (
                    <img
                      src={item.pLogo.node.sourceUrl}
                      alt=""
                      className="h-12 object-contain self-start"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  )}
                  <h3 className="text-[20px] font-bold leading-snug text-white tracking-tight">
                    {item.pTitle}
                  </h3>
                  {/* WP-sourced HTML — trusted backend only */}
                  <div className="text-[15px] text-gray-400 leading-relaxed">
                    {parse(item.sortText ?? "")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(item.pTags ?? []).map((tag: any, ti: number) => (
                      <span key={ti} className="cs-tag">
                        {tag.tagName}
                      </span>
                    ))}
                  </div>
                </FadeIn>

                {/* Image panel */}
                <FadeIn
                  xOffset={isEven ? 40 : -40}
                  yOffset={0}
                  duration={0.7}
                  delay={0.1}
                  className="lg:w-[60%] cs-p-img"
                >
                  {item.pImage?.node?.sourceUrl && (
                    <img
                      src={item.pImage.node.sourceUrl}
                      alt={stripHtml(item.pTitle ?? "")}
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  )}
                </FadeIn>
              </div>
            </div>
          );
        })}
      </section>

      {/* ════════════════════════════════════════════
          DESIGN PROCESS
      ════════════════════════════════════════════ */}
      <section className="py-28 bg-[#0a0a0a] border-t border-white/[0.07]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <SectionReveal className="mb-5">
            {[
              <h2
                key="h"
                className="text-[clamp(36px,5vw,70px)] font-black tracking-[-0.03em] leading-tight"
              >
                {designHeadingParts.map((seg, i) =>
                  seg.accent ? (
                    <span key={i} style={{ color: accentColor }}>
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </h2>,
            ]}
          </SectionReveal>

          <p className="text-[17px] text-gray-400 max-w-2xl mb-16 leading-relaxed">
            {pf.uSortText}
          </p>

          <SectionReveal className="flex overflow-x-auto pb-16 cs-hide-scrollbar gap-8 px-10 snap-x">
            {designSteps.map((step: any, i: number) => (
              <div
                key={i}
                className="cs-timeline-item min-w-[260px] shrink-0 snap-center"
              >
                <div className="cs-timeline-item__bg-num" aria-hidden="true">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <div className="relative z-10">
                  <div className="cs-timeline-item__dot" />
                  <div className="cs-timeline-item__line" />
                  <h4 className="text-xl font-bold mb-3 mt-8">
                    {htmlToLines(step.dName ?? "").map((line, li) => (
                      <span key={li} className="block">
                        {line}
                      </span>
                    ))}
                  </h4>
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="py-28 max-w-[1400px] mx-auto px-6 lg:px-10 border-t border-white/[0.07]">
        <FadeIn className="mb-16">
          {/* WP-sourced HTML — trusted backend only */}
          <h2 className="text-[clamp(36px,5vw,70px)] font-black tracking-[-0.03em] leading-tight">
            {parse(pf.whyDoHeading ?? "")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {whyItems.map((item: any, i: number) => (
            <FadeIn
              key={i}
              delay={i * 0.1}
              yOffset={28}
              duration={0.65}
              className="cs-why-card"
            >
              <div className="cs-why-card__ghost" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="cs-why-card__shine" aria-hidden="true" />
              <div className="cs-why-card__bar" />
              <h3 className="text-[21px] font-bold mb-3 tracking-tight leading-snug text-white relative z-10">
                {/* WP-sourced HTML — trusted backend only */}
                <span>{parse(item.whyTitle ?? "")}</span>
              </h3>
              <p className="text-[15px] text-gray-400 leading-relaxed relative z-10">
                {item.whyShortText}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

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
    </main>
  );
}
