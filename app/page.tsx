import Link from "next/link";
import { HeroHeadline } from "@/components/HeroHeadline";
import { SectionReveal } from "@/components/SectionReveal";
import { CountUpNumber } from "@/components/CountUpNumber";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { client } from "@/lib/apollo-client";
import { GET_HOME_PAGE } from "@/lib/queries";
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

// Splits WP heading HTML into plain/accented segments (uses split, not exec)
function parseDesignHeading(html: string): { text: string; accent: boolean }[] {
  const cleaned = html.replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ");
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

function htmlToLines(html: string): string[] {
  return html
    .split(/<br\s*\/?>/gi)
    .map((s) => stripHtml(s).trim())
    .filter(Boolean);
}

/* ── Data fetching ───────────────────────────────── */

async function getHomeData() {
  try {
    const { data } = await client.query<any>({
      query: gql`${GET_HOME_PAGE}`,
    });
    return data?.page?.template?.homePage ?? {};
  } catch {
    return {};
  }
}

/* ── Page ────────────────────────────────────────── */

export default async function Home() {
  const hp = await getHomeData();

  const heroHeadline =
    stripHtml(hp.topsectitle) ||
    "Creative Design Attracts People. Smart UX Makes Them Stay";
  const heroSubtext =
    stripHtml(hp.toptext) ||
    "Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups";

  const winTitle =
    hp.winTitle ?? "Global winners in Product UX/UI Design 2025";
  const awards = (hp.wboxes ?? []).map((b: any) =>
    parseAward(b.wboxTitle ?? "")
  );

  const whyTitle = stripHtml(hp.abthretitle ?? "");
  const whyText = stripHtml(hp.abtthretext ?? "");
  const serviceCards: any[] = hp.abthrelist ?? [];

  const clientLogos: { url: string; alt: string }[] = (hp.gImageList ?? [])
    .map((item: any) => ({
      url: item.gImage?.node?.sourceUrl ?? "",
      alt: item.gImage?.node?.altText ?? "",
    }))
    .filter((l: { url: string }) => l.url);

  const half = Math.ceil(clientLogos.length / 2);
  const logoRow1 = clientLogos.slice(0, half);
  const logoRow2 = clientLogos.slice(half);

  const designSteps: any[] = hp.designType ?? [];
  const designHeadingParts = parseDesignHeading(
    hp.uDesignHeading ?? "Our unique Design Process"
  );
  const designSubtext = stripHtml(hp.uSortText ?? "");

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-32 relative">

      {/* ── Grain noise overlay ── */}
      <div aria-hidden="true" className="grain-overlay" />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-4 overflow-hidden">

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
            headlineClassName="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px] hero-headline"
            subtextClassName="text-xl md:text-2xl font-light text-gray-400 max-w-3xl mx-auto leading-relaxed"
          />

        </div>

        {/* Scroll cue */}
        <div className="scroll-cue" aria-hidden="true">
          <div className="scroll-cue__line" />
          <span className="scroll-cue__label">Scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PORTFOLIO GRID
      ══════════════════════════════════════════════ */}
      <section className="relative z-20 max-w-[1600px] mx-auto px-4 -mt-10 mb-32">
        <PortfolioGrid />
      </section>

      {/* ══════════════════════════════════════════════
          WHY US SECTION
      ══════════════════════════════════════════════ */}
      <section className="why-section py-24 mx-4 md:mx-10 px-8 lg:px-24 mb-32 relative overflow-hidden">
        <div className="why-section__orb" aria-hidden="true" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between mb-20 gap-10">
            <div>
              <h3 className="text-5xl md:text-6xl font-bold max-w-2xl leading-tight">
                {whyTitle}
              </h3>
            </div>
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed mt-4 lg:mt-10 lg:self-end">
              {whyText}
            </p>
          </div>

          <SectionReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((card: any, i: number) => (
              <div key={i} className="service-card group">
                <div className="service-card__num">0{i + 1}</div>
                <div className="service-card__icon-wrap">
                  {card.abthreimage?.node?.sourceUrl ? (
                    <img
                      src={card.abthreimage.node.sourceUrl}
                      alt=""
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                      />
                    </svg>
                  )}
                </div>
                <h5 className="text-lg font-bold mb-3 mt-6 leading-snug">
                  {stripHtml(card.abteintitle ?? "")}
                </h5>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {stripHtml(card.abthreintext ?? "")}
                </p>
                <div className="service-card__border-anim" aria-hidden="true" />
              </div>
            ))}
          </SectionReveal>

          <div className="mt-20 flex justify-center">
            <Link href="/contact-us" className="btn-outline-gold">
              Partner with us
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AWARDS SECTION
      ══════════════════════════════════════════════ */}
      <section id="winners-section" className="py-24 max-w-[1400px] mx-auto px-4 mb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold">{winTitle}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {awards.map((award: { rank: number; label: string }, i: number) => (
              <div
                key={i}
                className="award-card group"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* SVG progress ring */}
                <div className="award-ring-wrap" aria-hidden="true">
                  <svg className="award-ring" viewBox="0 0 120 120">
                    <circle className="award-ring__track" cx="60" cy="60" r="52" />
                    <circle
                      className="award-ring__fill"
                      cx="60"
                      cy="60"
                      r="52"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  </svg>
                  <div className="award-ring__number">
                    #<CountUpNumber target={award.rank} duration={800 + i * 200} />
                  </div>
                </div>
                <div className="text-xl font-bold mt-8">{award.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLIENTS SECTION
      ══════════════════════════════════════════════ */}
      {clientLogos.length > 0 && (
        <section className="clients-section py-28 mb-32 relative overflow-hidden">
          {/* Ambient atmosphere */}
          <div className="clients-orb clients-orb--left" aria-hidden="true" />
          <div className="clients-orb clients-orb--right" aria-hidden="true" />

          {/* Heading */}
          <div className="text-center mb-20 relative z-10 px-4">
            <div className="clients-eyebrow">
              <span className="clients-eyebrow__line" />
              Our Clients
              <span className="clients-eyebrow__line" />
            </div>
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mt-6 max-w-3xl mx-auto leading-[0.95]">
              From small to global,{" "}
              <br className="hidden md:block" />
              we&apos;ve partnered with{" "}
              <br className="hidden lg:block" />
              <em className="clients-headline-em">great companies</em>
            </h3>
          </div>

          {/* Row 1 — scrolls left */}
          <div className="marquee-wrapper mb-4 relative z-10">
            <div className="marquee-fade marquee-fade--left" aria-hidden="true" />
            <div className="marquee-fade marquee-fade--right" aria-hidden="true" />
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
            <div className="marquee-fade marquee-fade--left" aria-hidden="true" />
            <div className="marquee-fade marquee-fade--right" aria-hidden="true" />
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
          <div className="text-center mt-16 relative z-10">
            <Link href="/contact-us" className="btn-primary">
              Let&apos;s Talk
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2 8H14M10.5 4L14 8L10.5 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          DESIGN PROCESS TIMELINE
      ══════════════════════════════════════════════ */}
      <section className="py-24 max-w-[1600px] mx-auto overflow-hidden px-4">
        <div className="text-center mb-24">
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter">
            {designHeadingParts.map((part, i) =>
              part.accent ? (
                <span key={i} className="text-yellow-400">
                  {part.text}
                </span>
              ) : (
                part.text
              )
            )}
          </h3>
          <p className="text-xl text-gray-400 mt-6 max-w-xl mx-auto">
            {designSubtext}
          </p>
        </div>

        <SectionReveal className="flex overflow-x-auto pb-16 hide-scrollbar gap-8 px-10 snap-x">
          {designSteps.map((item: any, i: number) => (
            <div
              key={i}
              className="timeline-item min-w-[260px] shrink-0 snap-center"
            >
              <div className="timeline-item__bg-num" aria-hidden="true">
                {(i + 1).toString().padStart(2, "0")}
              </div>
              <div className="relative z-10">
                <div className="timeline-item__dot" />
                <div className="timeline-item__line" />
                <h4 className="text-xl font-bold mb-3 mt-8">
                  {htmlToLines(item.dName ?? "").map((line, li) => (
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

      {/* ══════════════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════════════ */}
      <section className="mt-24 max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="contact-section relative overflow-hidden">
          <div className="contact-section__orb contact-section__orb--1" aria-hidden="true" />
          <div className="contact-section__orb contact-section__orb--2" aria-hidden="true" />
          <div className="contact-section__grid" aria-hidden="true" />

          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-12 p-10 lg:p-20">
            <div className="md:w-1/2">
              <h3 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
                Wanna Chat?
              </h3>
              <p className="text-xl text-gray-400 mb-10 max-w-md">
                Leave your details and we will get back to you as soon as possible.
              </p>

              <form className="space-y-8">
                {[
                  { key: "name", type: "text", label: "Name*" },
                  { key: "email", type: "email", label: "Email*" },
                  { key: "phone", type: "text", label: "Phone" },
                ].map((f) => (
                  <div key={f.key} className="form-field">
                    <input
                      type={f.type}
                      placeholder={f.label}
                      className="form-input"
                    />
                  </div>
                ))}
                <div className="form-field">
                  <textarea
                    placeholder="Message"
                    rows={3}
                    className="form-input resize-none"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary w-full md:w-auto justify-center"
                >
                  Send Message
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M2 8H14M10.5 4L14 8L10.5 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </form>
            </div>

            <div className="md:w-1/3 flex flex-col gap-5 md:pt-28">
              {[
                {
                  label: "Email Us",
                  value: "contact@triolla.io",
                  href: "mailto:contact@triolla.io",
                },
                {
                  label: "Call Us (TLV)",
                  value: "+972-73-744-3322",
                  href: "tel:+972737443322",
                },
                {
                  label: "Drop By",
                  value: "Yigal Alon St 98, Tel Aviv-Yafo",
                  href: undefined,
                },
              ].map((item, i) => (
                <div key={i} className="contact-info-card">
                  <div className="contact-info-card__label">{item.label}</div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="contact-info-card__value contact-info-card__value--link"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <div className="contact-info-card__value">{item.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
        .btn-outline-gold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #facc15;
          color: #facc15;
          font-weight: 600;
          font-size: 16px;
          padding: 14px 32px;
          border-radius: 999px;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .btn-outline-gold:hover {
          background: #facc15;
          color: #000;
          transform: translateY(-2px);
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

        /* ─── Why Us / service section ──────────── */
        .why-section {
          background: #0a0a0a;
          border-radius: 48px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .why-section__orb {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%);
          filter: blur(60px);
          pointer-events: none;
        }

        /* Service cards */
        .service-card {
          position: relative;
          background: #111;
          padding: 28px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          transition: border-color 0.3s, transform 0.3s;
        }
        .service-card:hover { border-color: rgba(250,204,21,0.25); transform: translateY(-4px); }
        .service-card__num {
          font-size: 11px;
          font-weight: 700;
          color: #facc15;
          letter-spacing: 0.2em;
          margin-bottom: 20px;
          opacity: 0.7;
        }
        .service-card__icon-wrap {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.15);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.3s, transform 0.3s;
        }
        .service-card:hover .service-card__icon-wrap {
          background: rgba(250,204,21,0.16);
          transform: scale(1.1) rotate(-3deg);
        }
        .service-card__border-anim {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(250,204,21,0.15) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .service-card:hover .service-card__border-anim { opacity: 1; }

        /* ─── Awards ────────────────────────────── */
        .award-card {
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 40px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: border-color 0.3s, transform 0.4s, box-shadow 0.4s;
        }
        .award-card:hover {
          border-color: rgba(250,204,21,0.3);
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(250,204,21,0.08);
        }
        .award-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
        }
        .award-ring {
          width: 120px; height: 120px;
          transform: rotate(-90deg);
        }
        .award-ring__track {
          fill: none;
          stroke: rgba(255,255,255,0.06);
          stroke-width: 3;
        }
        .award-ring__fill {
          fill: none;
          stroke: #facc15;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 326.7;
          stroke-dashoffset: 326.7;
          animation: ringFill 1.4s cubic-bezier(.23,1,.32,1) forwards;
          filter: drop-shadow(0 0 8px rgba(250,204,21,0.6));
        }
        @keyframes ringFill {
          to { stroke-dashoffset: 0; }
        }
        .award-ring__number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: 900;
          color: #facc15;
          text-shadow: 0 0 20px rgba(250,204,21,0.4);
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

        /* ─── Timeline ──────────────────────────── */
        .timeline-item {
          position: relative;
          padding-top: 32px;
        }
        .timeline-item__bg-num {
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
        .timeline-item__dot {
          width: 14px; height: 14px;
          background: #facc15;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(250,204,21,0.15), 0 0 20px rgba(250,204,21,0.3);
        }
        .timeline-item__line {
          position: absolute;
          top: 38px;
          left: 14px;
          height: 1px;
          right: -32px;
          background: linear-gradient(to right, rgba(250,204,21,0.3), rgba(255,255,255,0.05));
        }

        /* ─── Contact section ───────────────────── */
        .contact-section {
          background: #0a0a0a;
          border-radius: 48px;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 40px 120px rgba(0,0,0,0.5);
        }
        .contact-section__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
        }
        .contact-section__orb--1 {
          top: -10%;
          left: -5%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 65%);
        }
        .contact-section__orb--2 {
          bottom: -10%;
          right: -5%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%);
        }
        .contact-section__grid {
          position: absolute;
          inset: 0;
          border-radius: 48px;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 20% 50%, black 0%, transparent 100%);
        }

        /* ─── Form inputs ───────────────────────── */
        .form-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding-bottom: 14px;
          font-size: 17px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input::placeholder { color: rgba(255,255,255,0.3); }
        .form-input:focus { border-color: #facc15; }

        /* ─── Contact info cards ────────────────── */
        .contact-info-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 24px;
          transition: border-color 0.2s, background 0.2s;
        }
        .contact-info-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(250,204,21,0.2);
        }
        .contact-info-card__label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .contact-info-card__value {
          font-size: 18px;
          font-weight: 500;
          color: #e5e7eb;
        }
        .contact-info-card__value--link:hover { color: #facc15; transition: color 0.2s; }

        /* ─── Scrollbar hide ────────────────────── */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}
