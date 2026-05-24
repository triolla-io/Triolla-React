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

function decodeHtml(html: string): string {
  return (html ?? "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'");
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

  /* Brand yellow — CMS headerBgColor resolved dark, making accent elements
     (eyebrow lines, hover labels, CTA pill) invisible. Hardcode brand color. */
  const accentColor: string = "#facc15";

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

        /* ─── Steps section ─────────────────────────── */
        .tech-steps {
          position: relative;
          padding: 96px 0 88px;
          border-top: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
        }
        .tech-steps__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
        }
        .tech-steps__orb--l {
          top: 35%; left: -8%;
          width: 460px; height: 460px;
          background: radial-gradient(circle, ${accentColor}10 0%, transparent 65%);
        }
        .tech-steps__orb--r {
          bottom: 6%; right: -6%;
          width: 380px; height: 380px;
          background: radial-gradient(circle, ${accentColor}0a 0%, transparent 65%);
        }
        .tech-steps__head {
          position: relative; z-index: 2;
          text-align: center;
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
          margin-bottom: clamp(40px, 5vw, 64px);
        }
        .tech-steps__eyebrow {
          display: inline-flex; align-items: center; gap: 16px;
          margin-bottom: 22px;
        }
        .tech-steps__eyebrow-line {
          display: block; width: 56px; height: 1px;
          background: linear-gradient(to right, transparent, ${accentColor});
          opacity: 0.7;
        }
        .tech-steps__eyebrow-line--rev {
          background: linear-gradient(to left, transparent, ${accentColor});
        }
        .tech-steps__eyebrow-mark {
          color: ${accentColor};
          font-size: 14px;
          line-height: 1;
        }
        .tech-steps__title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -0.028em;
          line-height: 1.04;
          margin-bottom: 18px;
          color: #fff;
        }
        .tech-steps__sub {
          color: rgba(255,255,255,0.5);
          font-size: 17px;
          line-height: 1.78;
        }
        .tech-steps__sub p { margin-bottom: 6px; }
        .tech-steps__sub p:last-child { margin-bottom: 0; }
        .tech-steps__hint {
          align-items: center; gap: 8px;
          color: ${accentColor}aa;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          max-width: 1600px;
          margin: 0 auto 12px;
          padding: 0 32px;
          animation: techSwipeHint 2s ease-in-out infinite;
        }
        @keyframes techSwipeHint {
          0%,100% { opacity: 0.5; transform: translateX(0); }
          50%      { opacity: 1; transform: translateX(6px); }
        }
        .tech-steps__track {
          display: flex;
          overflow-x: auto;
          gap: 28px;
          padding: 24px 32px 52px;
          max-width: 1600px;
          margin: 0 auto;
          scrollbar-width: none; -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          position: relative; z-index: 2;
        }
        .tech-steps__track::-webkit-scrollbar { display: none; }

        /* ─── Step card ─────────────────────────────── */
        .tech-step {
          position: relative;
          flex-shrink: 0;
          min-width: 280px;
          scroll-snap-align: start;
          padding-top: 56px;
          padding-right: 16px;
          animation: techStepFloat calc(6.5s + (var(--si, 0) * 0.45s)) ease-in-out infinite;
          animation-delay: calc(var(--si, 0) * 0.35s);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tech-step:hover {
          animation-play-state: paused;
          transform: translateY(-10px);
        }
        @keyframes techStepFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .tech-step__bg-num {
          position: absolute;
          top: -22px;
          left: -12px;
          font-size: 148px;
          font-weight: 900;
          color: rgba(255,255,255,0.07);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          letter-spacing: -0.04em;
          transition: color 0.4s ease, transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          animation: techBgNumBreathe 5.5s ease-in-out infinite;
          animation-delay: calc(var(--si, 0) * 0.45s);
        }
        @keyframes techBgNumBreathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.04); }
        }
        .tech-step:hover .tech-step__bg-num {
          color: ${accentColor}26;
          transform: translateY(-4px) scale(1.06);
          animation-play-state: paused;
        }

        /* Floating sparkles around the steps strip */
        .tech-steps__sparkle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: ${accentColor};
          box-shadow: 0 0 12px ${accentColor}, 0 0 24px ${accentColor}66;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          top: calc(12% + (var(--spi, 0) * 7.5%));
          left: calc(5% + (var(--spi, 0) * 9.2%));
          animation: techStepSparkle 5s ease-in-out infinite;
          animation-delay: calc(var(--spi, 0) * 0.52s);
        }
        @keyframes techStepSparkle {
          0%, 100% { opacity: 0;   transform: scale(0)   translateY(0); }
          25%       { opacity: 0.9; transform: scale(1.5) translateY(-8px); }
          55%       { opacity: 0.35; transform: scale(0.9) translateY(-18px); }
          80%       { opacity: 0;   transform: scale(0)   translateY(-24px); }
        }

        /* Diagonal scan-line that traverses the section */
        .tech-steps__scan {
          position: absolute; inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .tech-steps__scan-beam {
          position: absolute;
          top: -20%; left: -30%;
          width: 160%; height: 2px;
          background: linear-gradient(
            to right,
            transparent 0%,
            ${accentColor}66 40%,
            ${accentColor} 50%,
            ${accentColor}66 60%,
            transparent 100%
          );
          filter: blur(2px);
          transform: rotate(-8deg);
          animation: techStepScan 9s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes techStepScan {
          0%   { transform: rotate(-8deg) translateY(0); opacity: 0; }
          15%  { opacity: 0.7; }
          85%  { opacity: 0.7; }
          100% { transform: rotate(-8deg) translateY(640px); opacity: 0; }
        }

        /* Pulsing dot with expanding rings */
        .tech-step__dot {
          position: relative;
          z-index: 2;
          display: inline-block;
          width: 14px; height: 14px;
          background: ${accentColor};
          border-radius: 50%;
          box-shadow:
            0 0 0 4px ${accentColor}26,
            0 0 22px ${accentColor}55,
            inset 0 0 6px rgba(255,255,255,0.4);
          transition: box-shadow 0.35s ease, transform 0.35s ease;
        }
        .tech-step:hover .tech-step__dot {
          transform: scale(1.18);
          box-shadow:
            0 0 0 5px ${accentColor}40,
            0 0 36px ${accentColor}aa,
            inset 0 0 8px rgba(255,255,255,0.55);
        }
        .tech-step__dot-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid ${accentColor};
          opacity: 0;
          animation: techDotRing 2.6s cubic-bezier(0.32, 0, 0.18, 1) infinite;
          animation-delay: calc(var(--si, 0) * 0.4s);
          pointer-events: none;
        }
        .tech-step__dot-ring--delay {
          animation-delay: calc(var(--si, 0) * 0.4s + 1.3s);
        }
        @keyframes techDotRing {
          0%   { transform: scale(1);   opacity: 0.85; }
          70%  { opacity: 0.05; }
          100% { transform: scale(4.2); opacity: 0; }
        }

        /* Connector line with traveling shimmer */
        .tech-step__line {
          position: absolute;
          top: calc(56px + 7px); left: 14px;
          height: 1px; right: -28px;
          background: linear-gradient(
            to right,
            ${accentColor}66 0%,
            ${accentColor}33 30%,
            rgba(255,255,255,0.05) 75%,
            transparent 100%
          );
          pointer-events: none;
          overflow: visible;
        }
        .tech-step__line-shimmer {
          position: absolute;
          top: -2px; bottom: -2px;
          left: 0;
          width: 56px;
          background: linear-gradient(
            to right,
            transparent 0%,
            ${accentColor}ee 50%,
            transparent 100%
          );
          filter: blur(2px);
          opacity: 0;
          animation: techLineShimmer 3.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          animation-delay: calc(var(--si, 0) * 0.55s + 0.4s);
        }
        @keyframes techLineShimmer {
          0%   { left: 0;                opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { left: calc(100% - 56px); opacity: 0; }
        }

        .tech-step__body { margin-top: 22px; position: relative; z-index: 1; }
        .tech-step__num {
          display: block;
          font-size: 11px; font-weight: 700;
          color: ${accentColor};
          letter-spacing: 0.22em;
          margin-bottom: 10px;
          transition: letter-spacing 0.35s ease, color 0.35s ease;
        }
        .tech-step:hover .tech-step__num {
          letter-spacing: 0.32em;
        }
        .tech-step__name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.4;
          letter-spacing: -0.005em;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tech-step:hover .tech-step__name {
          transform: translateX(4px);
        }

        @media (prefers-reduced-motion: reduce) {
          .tech-step,
          .tech-step__dot-ring,
          .tech-step__line-shimmer,
          .tech-step__bg-num,
          .tech-steps__sparkle,
          .tech-steps__scan-beam {
            animation: none !important;
          }
          .tech-steps__sparkle { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .tech-steps { padding: 72px 0 64px; }
          .tech-steps__track { padding: 20px 20px 44px; gap: 24px; }
          .tech-step { min-width: 240px; }
        }

        /* ─── Clients section ────────────────────────────── */
        .tc-clients {
          position: relative;
          padding: 72px 0 88px;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .tc-clients__orb {
          position: absolute; border-radius: 50%;
          filter: blur(110px); pointer-events: none;
        }
        .tc-clients__orb--l {
          top: 50%; left: -8%; transform: translateY(-50%);
          width: 520px; height: 520px;
          background: radial-gradient(circle, ${accentColor}10 0%, transparent 65%);
        }
        .tc-clients__orb--r {
          top: 50%; right: -8%; transform: translateY(-50%);
          width: 420px; height: 420px;
          background: radial-gradient(circle, ${accentColor}0c 0%, transparent 65%);
        }
        .tc-clients__head {
          text-align: center;
          margin-bottom: clamp(36px,4.5vw,64px);
          position: relative; z-index: 10;
          padding: 0 24px;
        }
        .tc-clients__eyebrow {
          display: inline-flex; align-items: center; gap: 18px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.32em; text-transform: uppercase;
          color: ${accentColor};
          margin-bottom: 20px;
        }
        .tc-clients__eyebrow-line {
          display: block; width: 48px; height: 1px;
          background: linear-gradient(to right, transparent, ${accentColor});
          opacity: 0.7;
        }
        .tc-clients__eyebrow-line--rev {
          background: linear-gradient(to left, transparent, ${accentColor});
        }
        .tc-clients__title {
          font-size: clamp(2rem, 6vw, 5.5rem);
          font-weight: 900; letter-spacing: -0.03em;
          line-height: 0.95; max-width: 800px;
          margin: 0 auto; color: white;
        }
        .tc-clients__cta {
          display: inline-flex; align-items: center; gap: 8px;
          font-weight: 700; font-size: 14px;
          padding: 14px 32px; border-radius: 999px;
          color: #000; letter-spacing: 0.04em;
          transition: opacity 0.2s, transform 0.2s;
        }
        .tc-clients__cta:hover { opacity: 0.85; transform: translateY(-2px); }

        /* ─── Logo marquee ───────────────────────────────── */
        .tc-mq {
          position: relative; overflow: hidden; padding: 10px 0;
        }
        .tc-mq__fade {
          position: absolute; top: 0; bottom: 0;
          width: 220px; z-index: 2; pointer-events: none;
        }
        .tc-mq__fade--l {
          left: 0;
          background: linear-gradient(to right, #080808 0%, transparent 100%);
        }
        .tc-mq__fade--r {
          right: 0;
          background: linear-gradient(to left, #080808 0%, transparent 100%);
        }
        .tc-mq__track {
          display: flex; gap: 20px;
          width: max-content;
          animation: tcMarqL 32s linear infinite;
          will-change: transform;
        }
        .tc-mq__track--rev {
          animation-name: tcMarqR;
          animation-duration: 26s;
        }
        .tc-mq:hover .tc-mq__track { animation-play-state: paused; }
        @keyframes tcMarqL {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tcMarqR {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .tc-logo-card {
          flex-shrink: 0;
          width: 176px; height: 112px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          display: flex; align-items: center; justify-content: center;
          padding: 14px;
          transition: border-color 0.4s, background 0.4s, transform 0.4s, box-shadow 0.4s;
          overflow: hidden;
          backdrop-filter: blur(2px);
        }
        .tc-logo-card:hover {
          border-color: ${accentColor}30;
          background: ${accentColor}08;
          transform: translateY(-5px) scale(1.04);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 24px ${accentColor}12;
        }
        .tc-logo-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          border-radius: 10px;
        }
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
      {clientLogos.length > 0 && (
        <section className="tc-clients">
          {/* Ambient orbs */}
          <div
            className="tc-clients__orb tc-clients__orb--l"
            aria-hidden="true"
          />
          <div
            className="tc-clients__orb tc-clients__orb--r"
            aria-hidden="true"
          />

          {/* Heading */}
          <div className="tc-clients__head">
            {ts?.ourClientsHeading && (
              <div className="tc-clients__eyebrow">
                <span className="tc-clients__eyebrow-line" aria-hidden="true" />
                {ts.ourClientsHeading}
                <span
                  className="tc-clients__eyebrow-line tc-clients__eyebrow-line--rev"
                  aria-hidden="true"
                />
              </div>
            )}
            {ts?.ourClientBigText && (
              <h3 className="tc-clients__title">
                {parse(decodeHtml(ts.ourClientBigText))}
              </h3>
            )}
          </div>

          {/* Row 1 — forward */}
          <div className="tc-mq mb-5">
            <div className="tc-mq__fade tc-mq__fade--l" aria-hidden="true" />
            <div className="tc-mq__fade tc-mq__fade--r" aria-hidden="true" />
            <div className="tc-mq__track">
              {[...clientLogos, ...clientLogos].map((logo, i) => (
                <div key={i} className="tc-logo-card">
                  <img
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    className="tc-logo-img"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — reverse */}
          <div className="tc-mq">
            <div className="tc-mq__fade tc-mq__fade--l" aria-hidden="true" />
            <div className="tc-mq__fade tc-mq__fade--r" aria-hidden="true" />
            <div className="tc-mq__track tc-mq__track--rev">
              {[...clientLogos, ...clientLogos].map((logo, i) => (
                <div key={i} className="tc-logo-card">
                  <img
                    src={logo.url}
                    alt={logo.alt || "Client logo"}
                    className="tc-logo-img"
                  />
                </div>
              ))}
            </div>
          </div>

          {ts?.cButton && (
            <div className="text-center mt-12 relative z-10">
              <Link
                href="/contact-us"
                className="tc-clients__cta"
                style={{ background: accentColor }}
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
        <section className="tech-steps">
          <div
            className="tech-steps__orb tech-steps__orb--l"
            aria-hidden="true"
          />
          <div
            className="tech-steps__orb tech-steps__orb--r"
            aria-hidden="true"
          />

          {/* Floating sparkles — inspired by home Winners section */}
          {[...Array(10)].map((_, i) => (
            <span
              key={`sp-${i}`}
              className="tech-steps__sparkle"
              style={{ "--spi": i } as React.CSSProperties}
              aria-hidden="true"
            />
          ))}

          {/* Diagonal scan-line that sweeps slowly across */}
          <div className="tech-steps__scan" aria-hidden="true">
            <span className="tech-steps__scan-beam" />
          </div>

          {(tp.fivetitle || tp.fivetext) && (
            <FadeIn className="tech-steps__head">
              <div className="tech-steps__eyebrow" aria-hidden="true">
                <span className="tech-steps__eyebrow-line" />
                <span className="tech-steps__eyebrow-mark">✦</span>
                <span className="tech-steps__eyebrow-line tech-steps__eyebrow-line--rev" />
              </div>
              {tp.fivetitle && (
                <div className="tech-steps__title">
                  {parse(decodeHtml(tp.fivetitle))}
                </div>
              )}
              {tp.fivetext && (
                /* WP-sourced HTML — trusted backend only */
                <div className="tech-steps__sub">
                  {parse(decodeHtml(tp.fivetext))}
                </div>
              )}
            </FadeIn>
          )}

          <div className="tech-steps__hint md:hidden" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7H12M8.5 3.5L12 7L8.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <SectionReveal className="tech-steps__track">
            {steps.map((step: any, i: number) => (
              <div
                key={i}
                className="tech-step"
                style={{ "--si": i } as React.CSSProperties}
              >
                <div className="tech-step__bg-num" aria-hidden="true">
                  <CountUpNumber
                    target={parseInt(step.number ?? "0") || 0}
                    duration={1600}
                  />
                </div>
                <span className="tech-step__dot" aria-hidden="true">
                  <span className="tech-step__dot-ring" />
                  <span className="tech-step__dot-ring tech-step__dot-ring--delay" />
                </span>
                {i < steps.length - 1 && (
                  <div className="tech-step__line" aria-hidden="true">
                    <span className="tech-step__line-shimmer" />
                  </div>
                )}
                <div className="tech-step__body">
                  <span className="tech-step__num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="tech-step__name">
                    {parse(decodeHtml(step.numtitle ?? ""))}
                  </div>
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
