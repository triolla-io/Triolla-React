import Link from "next/link";
import parse from "html-react-parser";

function decodeHtml(html: string): string {
  return (html ?? "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'");
}

interface ClientsSectionProps {
  logos: { url: string; alt: string }[];
  heading?: string | null;
  bigText?: string | null;
  ctaText?: string | null;
  accentColor?: string;
}

export function ClientsSection({
  logos,
  heading,
  bigText,
  ctaText,
  accentColor = "#facc15",
}: ClientsSectionProps) {
  if (logos.length === 0) return null;

  const ac = accentColor;
  const duped = [...logos, ...logos];

  return (
    <section className="cs-clients">
      <style>{`
        .cs-clients {
          position: relative;
          padding: 72px 0 88px;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .cs-clients__orb {
          position: absolute; border-radius: 50%;
          filter: blur(110px); pointer-events: none;
        }
        .cs-clients__orb--l {
          top: 50%; left: -8%; transform: translateY(-50%);
          width: 520px; height: 520px;
          background: radial-gradient(circle, ${ac}10 0%, transparent 65%);
        }
        .cs-clients__orb--r {
          top: 50%; right: -8%; transform: translateY(-50%);
          width: 420px; height: 420px;
          background: radial-gradient(circle, ${ac}0c 0%, transparent 65%);
        }
        .cs-clients__head {
          text-align: center;
          margin-bottom: clamp(36px,4.5vw,64px);
          position: relative; z-index: 10;
          padding: 0 24px;
        }
        .cs-clients__eyebrow {
          display: inline-flex; align-items: center; gap: 18px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.32em; text-transform: uppercase;
          color: ${ac};
          margin-bottom: 20px;
        }
        .cs-clients__eyebrow-line {
          display: block; width: 48px; height: 1px;
          background: linear-gradient(to right, transparent, ${ac});
          opacity: 0.7;
        }
        .cs-clients__eyebrow-line--rev {
          background: linear-gradient(to left, transparent, ${ac});
        }
        .cs-clients__title {
          font-size: clamp(2rem, 6vw, 5.5rem);
          font-weight: 900; letter-spacing: -0.03em;
          line-height: 0.95; max-width: 800px;
          margin: 0 auto; color: white;
        }
        .cs-clients__cta {
          display: inline-flex; align-items: center; gap: 8px;
          font-weight: 700; font-size: 14px;
          padding: 14px 32px; border-radius: 999px;
          color: #000; letter-spacing: 0.04em;
          transition: opacity 0.2s, transform 0.2s;
        }
        .cs-clients__cta:hover { opacity: 0.85; transform: translateY(-2px); }

        /* ─── Marquee ─── */
        .cs-mq {
          position: relative; overflow: hidden; padding: 10px 0;
        }
        .cs-mq__fade {
          position: absolute; top: 0; bottom: 0;
          width: 220px; z-index: 2; pointer-events: none;
        }
        .cs-mq__fade--l {
          left: 0;
          background: linear-gradient(to right, #080808 0%, transparent 100%);
        }
        .cs-mq__fade--r {
          right: 0;
          background: linear-gradient(to left, #080808 0%, transparent 100%);
        }
        .cs-mq__track {
          display: flex; gap: 20px;
          width: max-content;
          animation: csMqFwd 32s linear infinite;
          will-change: transform;
        }
        .cs-mq__track--rev {
          animation-name: csMqRev;
          animation-duration: 26s;
        }
        .cs-mq:hover .cs-mq__track { animation-play-state: paused; }
        @keyframes csMqFwd {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes csMqRev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .cs-logo-card {
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
        .cs-logo-card:hover {
          border-color: ${ac}30;
          background: ${ac}08;
          transform: translateY(-5px) scale(1.04);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 24px ${ac}12;
        }
        .cs-logo-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          border-radius: 10px;
        }
        @media (max-width: 768px) {
          .cs-clients { padding: 52px 0 64px; }
          .cs-mq__fade { width: 100px; }
          .cs-logo-card { width: 136px; height: 88px; border-radius: 18px; }
        }
      `}</style>

      <div className="cs-clients__orb cs-clients__orb--l" aria-hidden="true" />
      <div className="cs-clients__orb cs-clients__orb--r" aria-hidden="true" />

      {(heading || bigText) && (
        <div className="cs-clients__head">
          {heading && (
            <div className="cs-clients__eyebrow">
              <span className="cs-clients__eyebrow-line" aria-hidden="true" />
              {heading}
              <span
                className="cs-clients__eyebrow-line cs-clients__eyebrow-line--rev"
                aria-hidden="true"
              />
            </div>
          )}
          {bigText && (
            <h3 className="cs-clients__title">
              {parse(decodeHtml(bigText))}
            </h3>
          )}
        </div>
      )}

      {/* Row 1 — forward */}
      <div className="cs-mq mb-5">
        <div className="cs-mq__fade cs-mq__fade--l" aria-hidden="true" />
        <div className="cs-mq__fade cs-mq__fade--r" aria-hidden="true" />
        <div className="cs-mq__track">
          {duped.map((logo, i) => (
            <div key={i} className="cs-logo-card">
              <img
                src={logo.url}
                alt={logo.alt || "Client logo"}
                className="cs-logo-img"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — reverse */}
      <div className="cs-mq">
        <div className="cs-mq__fade cs-mq__fade--l" aria-hidden="true" />
        <div className="cs-mq__fade cs-mq__fade--r" aria-hidden="true" />
        <div className="cs-mq__track cs-mq__track--rev">
          {duped.map((logo, i) => (
            <div key={i} className="cs-logo-card">
              <img
                src={logo.url}
                alt={logo.alt || "Client logo"}
                className="cs-logo-img"
              />
            </div>
          ))}
        </div>
      </div>

      {ctaText && (
        <div className="text-center mt-12 relative z-10">
          <Link
            href="/contact-us"
            className="cs-clients__cta"
            style={{ background: ac }}
          >
            {ctaText}
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
  );
}
