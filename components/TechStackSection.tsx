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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
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

  return (
    <>
      <section ref={sectionRef} className="tss-root">

        {/* Ambient background */}
        <div className="tss-dots" aria-hidden="true" />
        <div className="tss-glow" aria-hidden="true" />

        <div className="tss-inner">

          {/* ── LEFT: text content ── */}
          <div className={`tss-left ${visible ? "tss-left--on" : ""}`}>

            {cleanMidTitle && (
              <div className="tss-eyebrow">
                <span className="tss-eyebrow__dot" />
                {cleanMidTitle}
              </div>
            )}

            {(titleOne || titleTwo) && (
              <h2 className="tss-title">
                {titleOne && <span className="block text-white">{titleOne}</span>}
                {titleTwo && <span className="block tss-title--accent">{titleTwo}</span>}
              </h2>
            )}

            {plainText && (
              <p className="tss-desc">{plainText}</p>
            )}

            {validImages.length > 0 && (
              <div className="tss-badge">
                <span className="tss-badge__num">{validImages.length}</span>
                <span className="tss-badge__text">Technologies</span>
              </div>
            )}
          </div>

          {/* ── RIGHT: icon grid ── */}
          {validImages.length > 0 && (
            <div className="tss-right">
              <div className="tss-grid">
                {validImages.map((img, i) => {
                  const floatDur = 5 + (i % 4) * 0.8;
                  const floatDelay = i * 0.25;
                  return (
                    <div
                      key={i}
                      className={`tss-card ${visible ? "tss-card--on" : ""}`}
                      style={{ transitionDelay: visible ? `${i * 0.06}s` : "0s" }}
                    >
                      {/* Float wrapper — keeps positioning separate from float animation */}
                      <div
                        className={`tss-card__float ${visible ? "tss-card__float--on" : ""}`}
                        style={{
                          "--fdur": `${floatDur}s`,
                          "--fdel": `${floatDelay}s`,
                          "--fdir": i % 2 === 0 ? "normal" : "reverse",
                        } as React.CSSProperties}
                      >
                        <div className="tss-card__face">
                          <img src={img.url!} alt={img.title ?? ""} className="tss-card__img" />
                        </div>
                        {img.title && (
                          <span className="tss-card__label">{img.title}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════
           TECH STACK — Two-column
        ═══════════════════════════════════════════ */
        .tss-root {
          position: relative;
          padding: 80px 0 96px;
          background: #080808;
          border-top: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
        }

        .tss-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        .tss-glow {
          position: absolute;
          right: -5%; top: 50%; transform: translateY(-50%);
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, ${accentColor}0e 0%, transparent 60%);
          filter: blur(100px); pointer-events: none;
        }

        /* ── Inner grid ── */
        .tss-inner {
          position: relative; z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 80px);
          display: grid;
          grid-template-columns: 42% 1fr;
          gap: clamp(48px, 6vw, 100px);
          align-items: center;
        }

        /* ── LEFT ── */
        .tss-left {
          opacity: 0;
          transform: translateX(-28px);
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.2,1,0.3,1);
        }
        .tss-left--on { opacity: 1; transform: none; }

        .tss-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.32em; text-transform: uppercase;
          color: ${accentColor};
          margin-bottom: 24px;
        }
        .tss-eyebrow__dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: currentColor;
          animation: tssDot 2.2s ease-in-out infinite;
        }
        @keyframes tssDot { 0%,100%{opacity:1} 50%{opacity:0.18} }

        .tss-title {
          font-size: clamp(34px, 5vw, 68px);
          font-weight: 900; letter-spacing: -0.03em;
          line-height: 1.05; margin-bottom: 24px;
        }
        .tss-title--accent {
          background: linear-gradient(135deg, #fff 0%, ${accentColor} 55%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .tss-desc {
          font-size: 17px; line-height: 1.88;
          color: rgba(255,255,255,0.48);
          margin-bottom: 36px; max-width: 420px;
        }

        .tss-badge {
          display: flex; align-items: baseline; gap: 12px;
          padding-top: 36px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .tss-badge__num {
          font-size: 64px; font-weight: 900;
          letter-spacing: -0.04em; line-height: 1;
          color: ${accentColor};
        }
        .tss-badge__text {
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        /* ── RIGHT grid ── */
        .tss-right {
          display: flex; align-items: center; justify-content: center;
        }

        .tss-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          width: 100%;
        }

        /* Card outer — handles appear transition */
        .tss-card {
          display: flex; justify-content: center;
          opacity: 0;
          transform: scale(0.75) translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.2,1,0.3,1);
        }
        .tss-card--on { opacity: 1; transform: none; }

        /* Card float wrapper — handles float animation without conflicting with outer */
        .tss-card__float { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .tss-card__float--on {
          animation: tssFloat var(--fdur, 5s) ease-in-out var(--fdel, 0s) infinite;
          animation-direction: var(--fdir, normal);
        }
        @keyframes tssFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-9px); }
        }

        /* Card face */
        .tss-card__face {
          width: 76px; height: 76px; border-radius: 22px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          display: flex; align-items: center; justify-content: center;
          padding: 15px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .tss-card__face:hover {
          border-color: ${accentColor}44;
          box-shadow: 0 0 0 1px ${accentColor}22, 0 12px 48px rgba(0,0,0,0.6), 0 0 32px ${accentColor}1a;
          transform: scale(1.12);
        }

        .tss-card__img { width: 100%; height: 100%; object-fit: contain; }

        .tss-card__label {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.38); text-align: center;
          white-space: nowrap; letter-spacing: 0.03em;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .tss-inner {
            grid-template-columns: 1fr;
            gap: 52px;
          }
          .tss-left { transform: none; }
          .tss-left--on { opacity: 1; transform: none; }
          .tss-glow { right: 50%; transform: translate(50%, -50%); }
          .tss-grid { grid-template-columns: repeat(4, 1fr); }
          .tss-badge__num { font-size: 48px; }
        }
        @media (max-width: 600px) {
          .tss-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .tss-card__face { width: 60px; height: 60px; border-radius: 16px; padding: 11px; }
          .tss-badge__num { font-size: 40px; }
        }
      `}</style>
    </>
  );
}
