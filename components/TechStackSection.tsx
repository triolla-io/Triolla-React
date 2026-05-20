"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cleanMidTitle = (midTitle || "").replace(/<br\s*\/?>/gi, "\n").replace(/&amp;/g, "&");

  const validImages = images.filter((img) => img.url);

  return (
    <>
      <section ref={sectionRef} className="ts-root">
        <div className="ts-wrap">
          {/* ── Header ── */}
          <div className="ts-header">
            <h2 className="ts-title">
              {titleOne && <span className="block text-white">{titleOne}</span>}
              {titleTwo && (
                <span className="block ts-gradient-text">{titleTwo}</span>
              )}
            </h2>
            {text && (
              <div
                className="ts-desc"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            )}
          </div>

          {/* ── Circular Tech Stack ── */}
          <div className="ts-circle-wrapper">
            <div className={`ts-circle ${visible ? "ts-circle--visible" : ""}`}>
              {/* Glowing ring */}
              <div className="ts-ring" />
              <div className="ts-ring-glow" />

              {/* Center Text */}
              <div className="ts-center-text">
                {cleanMidTitle.split("\n").map((line, i) => (
                  <span key={i} className="block">
                    {line.trim()}
                  </span>
                ))}
              </div>

              {/* Orbiting Icons */}
              {validImages.map((img, i) => {
                const total = validImages.length;
                const angleDeg = (i / total) * 360 - 90; // Start at top
                const angleRad = (angleDeg * Math.PI) / 180;
                const radius = 220; // Circle radius
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;

                return (
                  <div
                    key={i}
                    className="ts-icon-wrap"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      transitionDelay: visible ? `${i * 0.1}s` : "0s",
                    }}
                  >
                    <div className="ts-icon">
                      <img src={img.url!} alt={img.title || ""} />
                    </div>
                    {img.title && (
                      <span className="ts-icon-label">{img.title}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════
           TECH STACK SECTION — Circular Design
        ═══════════════════════════════════════════════ */

        .ts-root {
          padding: 100px 0;
          position: relative;
          overflow: hidden;
          background: #080808;
        }

        .ts-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── Header ── */
        .ts-header {
          text-align: center;
          max-width: 800px;
          margin-bottom: 80px;
          position: relative;
          z-index: 10;
        }

        .ts-title {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .ts-gradient-text {
          background: linear-gradient(90deg, #4F46E5, #9333EA, #EAB308, #F59E0B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ts-desc {
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.6);
        }
        .ts-desc p { margin: 0; }
        .ts-desc strong {
          color: #fff;
          font-weight: 700;
        }

        /* ── Circular Layout ── */
        .ts-circle-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 60px 0;
        }

        .ts-circle {
          position: relative;
          width: 440px;
          height: 440px;
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 1s ease-out, transform 1s ease-out;
        }

        .ts-circle--visible {
          opacity: 1;
          transform: scale(1);
        }

        /* Glowing ring */
        .ts-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-right-color: rgba(255, 255, 255, 0.3);
          border-bottom-color: rgba(255, 255, 255, 0.3);
          animation: tsSpin 20s linear infinite;
        }

        .ts-ring-glow {
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        @keyframes tsSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Center Text */
        .ts-center-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          line-height: 1.2;
          color: #fff;
          z-index: 10;
        }

        /* Orbiting Icons */
        .ts-icon-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transform-origin: center;
        }

        .ts-circle--visible .ts-icon-wrap {
          opacity: 1;
          animation: tsFloat 6s ease-in-out infinite;
        }

        .ts-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }

        .ts-icon:hover {
          transform: scale(1.15);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .ts-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ts-icon-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          text-transform: capitalize;
        }

        @keyframes tsFloat {
          0%, 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); }
          50% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) - 8px)) scale(1.05); }
        }

        /* Inject CSS variables for transform in JS */
        .ts-icon-wrap[style*="translate("] {
          /* Extract the calculated translation and assign to variables to preserve it during animation */
        }

        /* Better animation strategy: */
        .ts-circle--visible .ts-icon-wrap {
          /* We apply animation to an inner element instead to preserve the JS transform */
          animation: none;
        }

        .ts-icon-inner {
          animation: tsFloatInner 6s ease-in-out infinite;
        }
        
        .ts-icon-wrap:nth-child(even) .ts-icon {
          animation: tsFloatInner 5s ease-in-out infinite reverse;
        }
        .ts-icon-wrap:nth-child(odd) .ts-icon {
          animation: tsFloatInner 6s ease-in-out infinite;
        }

        @keyframes tsFloatInner {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .ts-circle {
            width: 280px;
            height: 280px;
          }
          .ts-center-text {
            font-size: 20px;
          }
          .ts-icon {
            width: 48px;
            height: 48px;
            padding: 8px;
          }
          .ts-icon-label {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}
