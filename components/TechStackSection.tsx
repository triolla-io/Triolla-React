"use client";

import { useRef, useEffect, useState } from "react";

interface TechImage {
  url: string | null;
  title: string | null;
}

interface TechStackSectionProps {
  titleOne: string | null;
  titleTwo: string | null;
  text: string | null;
  midTitle: string | null;
  images: TechImage[];
  accentColor: string;
}

function stripHtmlTags(html: string): string {
  return (html ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function TechStackSection({
  titleOne,
  titleTwo,
  text,
  midTitle,
  images,
  accentColor,
}: TechStackSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const validImages = images.filter((img) => img.url);
  const plainText = text ? stripHtmlTags(text) : null;
  const cleanMidTitle = (midTitle ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&amp;/g, "&")
    .trim();

  const count = validImages.length;
  const countStr = String(count).padStart(2, "0");

  return (
    <>
      <section ref={sectionRef} className="tss-root">
        {/* Ambient layers */}
        <div className="tss-orb tss-orb--tr" aria-hidden="true" />
        <div className="tss-orb tss-orb--bl" aria-hidden="true" />
        <div className="tss-dots" aria-hidden="true" />

        {/* Editorial corner markers */}
        <div className="tss-marker tss-marker--tl" aria-hidden="true">
          <span className="tss-marker__num">04</span>
          <span className="tss-marker__line" />
        </div>
        <div className="tss-marker tss-marker--tr" aria-hidden="true">
          <span className="tss-marker__line tss-marker__line--rev" />
          <span className="tss-marker__dot" />
        </div>

        <div className="tss-inner">
          {/* ── Centered header ── */}
          <div className={`tss-head ${visible ? "tss-head--on" : ""}`}>
            {cleanMidTitle && (
              <div className="tss-eyebrow">
                <span className="tss-eyebrow__line" aria-hidden="true" />
                <span className="tss-eyebrow__mark" aria-hidden="true">
                  ✦
                </span>
                <span className="tss-eyebrow__text">{cleanMidTitle}</span>
                <span className="tss-eyebrow__mark" aria-hidden="true">
                  ✦
                </span>
                <span
                  className="tss-eyebrow__line tss-eyebrow__line--rev"
                  aria-hidden="true"
                />
              </div>
            )}

            {(titleOne || titleTwo) && (
              <h2 className="tss-title">
                {titleOne && (
                  <span className="tss-title__line">{titleOne}</span>
                )}
                {titleTwo && (
                  <span className="tss-title__line tss-title__line--accent">
                    {titleTwo}
                  </span>
                )}
              </h2>
            )}

            {plainText && <p className="tss-desc">{plainText}</p>}
          </div>

          {/* ── Tech tile stage ── */}
          {validImages.length > 0 && (
            <div className="tss-stage">
              <div className="tss-stage__glow" aria-hidden="true" />
              <div className="tss-grid">
                {validImages.map((img, i) => (
                  <div
                    key={i}
                    className={`tss-card ${visible ? "tss-card--on" : ""}`}
                    style={
                      {
                        "--ci": i,
                        transitionDelay: visible ? `${0.15 + i * 0.07}s` : "0s",
                      } as React.CSSProperties
                    }
                  >
                    <div className="tss-card__float">
                      <div className="tss-card__face-wrap">
                        <span className="tss-card__halo" aria-hidden="true" />
                        <div className="tss-card__face">
                          <span
                            className="tss-card__corner tss-card__corner--tl"
                            aria-hidden="true"
                          />
                          <span
                            className="tss-card__corner tss-card__corner--br"
                            aria-hidden="true"
                          />
                          <img
                            src={img.url!}
                            alt={img.title ?? ""}
                            className="tss-card__img"
                          />
                        </div>
                      </div>
                      {img.title && (
                        <span className="tss-card__label">
                          {stripHtmlTags(img.title)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Closing counter ── */}
          {/* {count > 0 && (
            <div className={`tss-foot ${visible ? "tss-foot--on" : ""}`}>
              <span className="tss-foot__line" aria-hidden="true" />
              <div className="tss-foot__counter">
                <span className="tss-foot__num">{countStr}</span>
                <span className="tss-foot__slash" aria-hidden="true">
                  /
                </span>
                <span className="tss-foot__meta">
                  <span className="tss-foot__label">Technologies</span>
                  <span className="tss-foot__sub">powering our craft</span>
                </span>
              </div>
              <span
                className="tss-foot__line tss-foot__line--rev"
                aria-hidden="true"
              />
            </div>
          )} */}
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════
           TECH STACK — Editorial Atlas
        ═══════════════════════════════════════════ */
        .tss-root {
          position: relative;
          padding: clamp(88px, 9vw, 130px) 0 clamp(96px, 10vw, 140px);
          background: #080808;
          border-top: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }

        /* ── Ambient orbs (matches page hero/steps language) ── */
        .tss-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
        }
        .tss-orb--tr {
          top: -8%; right: -8%;
          width: 620px; height: 620px;
          background: radial-gradient(circle, ${accentColor}14 0%, transparent 65%);
          animation: tssOrbPulse 12s ease-in-out infinite;
        }
        .tss-orb--bl {
          bottom: -10%; left: -8%;
          width: 480px; height: 480px;
          background: radial-gradient(circle, ${accentColor}0c 0%, transparent 65%);
          animation: tssOrbPulse 15s ease-in-out infinite reverse;
        }
        @keyframes tssOrbPulse {
          0%,100% { opacity: 1;   transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.08); }
        }

        /* ── Dot grid with radial mask ── */
        .tss-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px);
          background-size: 44px 44px;
          -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 45%, black 30%, transparent 100%);
                  mask-image: radial-gradient(ellipse 70% 55% at 50% 45%, black 30%, transparent 100%);
        }

        /* ── Editorial corner markers ── */
        .tss-marker {
          position: absolute; z-index: 4;
          display: flex; align-items: center; gap: 14px;
          pointer-events: none;
        }
        .tss-marker--tl { top: 28px; left: clamp(24px, 5vw, 80px); }
        .tss-marker--tr { top: 28px; right: clamp(24px, 5vw, 80px); }
        .tss-marker__num {
          font-size: 11px; font-weight: 900;
          letter-spacing: 0.36em;
          font-variant-numeric: tabular-nums;
          color: ${accentColor};
        }
        .tss-marker__line {
          display: block; width: 64px; height: 1px;
          background: linear-gradient(to right, ${accentColor}66, transparent);
        }
        .tss-marker__line--rev {
          width: 56px;
          background: linear-gradient(to left, transparent, rgba(255,255,255,0.28));
        }
        .tss-marker__dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${accentColor};
          box-shadow: 0 0 12px ${accentColor}aa;
        }

        /* ── Inner container ── */
        .tss-inner {
          position: relative; z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 80px);
        }

        /* ── HEADER ── */
        .tss-head {
          text-align: center;
          max-width: 780px;
          margin: 0 auto clamp(64px, 8vw, 96px);
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.2,1,0.3,1);
        }
        .tss-head--on { opacity: 1; transform: none; }

        .tss-eyebrow {
          display: inline-flex; align-items: center; gap: 16px;
          margin-bottom: 28px;
        }
        .tss-eyebrow__line {
          display: block; width: clamp(40px, 7vw, 72px); height: 1px;
          background: linear-gradient(to right, transparent, ${accentColor}aa);
        }
        .tss-eyebrow__line--rev {
          background: linear-gradient(to left, transparent, ${accentColor}aa);
        }
        .tss-eyebrow__mark {
          color: ${accentColor};
          font-size: 13px; line-height: 1;
        }
        .tss-eyebrow__text {
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.36em; text-transform: uppercase;
          color: ${accentColor};
          white-space: nowrap;
        }

        .tss-title {
          font-size: clamp(40px, 6.4vw, 88px);
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 0.98;
          margin-bottom: 30px;
        }
        .tss-title__line { display: block; color: #fff; }
        .tss-title__line--accent {
          background: linear-gradient(135deg, #fff 38%, ${accentColor} 58%, #fff 78%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: tssShimmer 7s linear infinite;
          font-style: italic;
        }
        @keyframes tssShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        .tss-desc {
          font-size: clamp(16px, 1.3vw, 18px);
          line-height: 1.78;
          color: rgba(255,255,255,0.82);
          max-width: 600px;
          margin: 0 auto;
          font-weight: 400;
        }

        /* ── STAGE & GRID ── */
        .tss-stage {
          position: relative;
          margin: 0 auto clamp(64px, 7vw, 96px);
          max-width: 1000px;
        }
        .tss-stage__glow {
          position: absolute;
          top: 50%; left: 50%;
          width: 85%; aspect-ratio: 2 / 1;
          transform: translate(-50%, -50%);
          background: radial-gradient(ellipse at center, ${accentColor}1a 0%, transparent 62%);
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
        }

        .tss-grid {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(16px, 2vw, 30px);
        }

        .tss-card {
          position: relative;
          opacity: 0;
          transform: scale(0.78) translateY(36px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,1,0.3,1);
        }
        .tss-card--on { opacity: 1; transform: none; }

        .tss-card__float {
          display: flex; flex-direction: column; align-items: center;
          gap: 14px;
          animation: tssCardFloat calc(6s + (var(--ci, 0) * 0.5s)) ease-in-out infinite;
          animation-delay: calc(var(--ci, 0) * 0.4s);
        }
        @keyframes tssCardFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }

        .tss-card__face-wrap {
          position: relative;
          width: 100%;
          max-width: 134px;
          margin: 0 auto;
        }

        .tss-card__halo {
          position: absolute;
          inset: -28%;
          border-radius: 50%;
          background: radial-gradient(circle, ${accentColor}26 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.5s ease, transform 0.5s ease;
          pointer-events: none;
          filter: blur(24px);
          z-index: 0;
        }

        .tss-card__face {
          position: relative;
          z-index: 1;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.025));
          border: 1px solid rgba(255,255,255,0.16);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(18px, 2vw, 24px);
          box-shadow:
            0 12px 40px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.14),
            inset 0 -1px 0 rgba(0,0,0,0.3);
          transition:
            border-color 0.4s,
            box-shadow 0.4s,
            transform 0.4s,
            background 0.4s;
          overflow: hidden;
        }
        /* Diagonal shine sweep on hover (echoes .portfolio-card__shine) */
        .tss-card__face::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 38%,
            rgba(255,255,255,0.16) 50%,
            transparent 62%
          );
          background-size: 220% 100%;
          background-position: 220% 0;
          transition: background-position 0.85s cubic-bezier(0.23, 1, 0.32, 1);
          pointer-events: none;
        }
        .tss-card__face-wrap:hover .tss-card__face::after {
          background-position: -220% 0;
        }

        /* Editorial corner brackets, revealed on hover */
        .tss-card__corner {
          position: absolute;
          width: 11px; height: 11px;
          border: 1px solid ${accentColor};
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.23,1,0.32,1);
          pointer-events: none;
        }
        .tss-card__corner--tl {
          top: 8px; left: 8px;
          border-right: 0; border-bottom: 0;
        }
        .tss-card__corner--br {
          bottom: 8px; right: 8px;
          border-left: 0; border-top: 0;
        }

        .tss-card__face-wrap:hover .tss-card__halo {
          opacity: 1; transform: scale(1.18);
        }
        .tss-card__face-wrap:hover .tss-card__face {
          background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
          border-color: ${accentColor}77;
          box-shadow:
            0 0 0 1px ${accentColor}44,
            0 22px 56px rgba(0,0,0,0.65),
            0 0 56px ${accentColor}33,
            inset 0 1px 0 rgba(255,255,255,0.22);
          transform: scale(1.08) translateY(-6px);
        }
        .tss-card__face-wrap:hover .tss-card__corner {
          opacity: 0.9;
        }
        .tss-card__face-wrap:hover .tss-card__corner--tl { transform: translate(-3px, -3px); }
        .tss-card__face-wrap:hover .tss-card__corner--br { transform: translate(3px, 3px); }

        .tss-card__img {
          position: relative; z-index: 1;
          width: 100%; height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.45));
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tss-card__face-wrap:hover .tss-card__img {
          transform: scale(1.1);
        }

        .tss-card__label {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,0.86);
          text-align: center;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-shadow: 0 1px 14px rgba(0,0,0,0.6);
          transition: color 0.3s, letter-spacing 0.3s;
          max-width: 100%;
          line-height: 1.3;
        }
        .tss-card__float:hover .tss-card__label {
          color: ${accentColor};
          letter-spacing: 0.12em;
        }

        /* ── FOOTER COUNTER ── */
        .tss-foot {
          display: flex; align-items: center; justify-content: center;
          gap: clamp(20px, 3vw, 36px);
          max-width: 760px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.8s ease 0.4s,
            transform 0.8s cubic-bezier(0.2,1,0.3,1) 0.4s;
        }
        .tss-foot--on { opacity: 1; transform: none; }

        .tss-foot__line {
          flex: 1; height: 1px;
          min-width: 40px;
          background: linear-gradient(to right, transparent, ${accentColor}55 60%, rgba(255,255,255,0.1));
        }
        .tss-foot__line--rev {
          background: linear-gradient(to left, transparent, ${accentColor}55 60%, rgba(255,255,255,0.1));
        }

        .tss-foot__counter {
          display: inline-flex; align-items: center; gap: 18px;
          white-space: nowrap;
        }
        .tss-foot__num {
          font-size: clamp(52px, 5.5vw, 72px);
          font-weight: 900;
          letter-spacing: -0.045em;
          line-height: 0.88;
          background: linear-gradient(180deg, #fff 0%, ${accentColor} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums;
        }
        .tss-foot__slash {
          color: ${accentColor}88;
          font-weight: 300;
          font-size: 40px;
          transform: translateY(-6px);
          line-height: 1;
        }
        .tss-foot__meta {
          display: flex; flex-direction: column; gap: 4px;
          text-align: left;
        }
        .tss-foot__label {
          font-size: 13px; font-weight: 800;
          color: rgba(255,255,255,0.96);
          letter-spacing: 0.22em; text-transform: uppercase;
        }
        .tss-foot__sub {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .tss-grid { grid-template-columns: repeat(4, 1fr); }
          .tss-card__face-wrap { max-width: 120px; }
        }
        @media (max-width: 900px) {
          .tss-marker--tl, .tss-marker--tr { top: 20px; }
          .tss-marker__line { width: 36px; }
          .tss-marker__line--rev { width: 32px; }
          .tss-grid { grid-template-columns: repeat(3, 1fr); }
          .tss-card__face-wrap { max-width: 110px; }
        }
        @media (max-width: 640px) {
          .tss-marker { display: none; }
          .tss-eyebrow { gap: 10px; }
          .tss-eyebrow__line { width: 30px; }
          .tss-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .tss-card__face-wrap { max-width: 100px; }
          .tss-card__face { padding: 14px; border-radius: 18px; }
          .tss-card__label { font-size: 11px; }
          .tss-foot { flex-direction: column; gap: 18px; }
          .tss-foot__line { width: 100%; max-width: 260px; }
          .tss-foot__num { font-size: 52px; }
          .tss-foot__slash { font-size: 32px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tss-orb,
          .tss-card__float,
          .tss-title__line--accent {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
