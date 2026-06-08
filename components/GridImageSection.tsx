"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { GlowOrb } from "@/components/ui";

interface GridImageSectionProps {
  imageUrl?: string | null;
  imageMobileUrl?: string | null;
}

export function GridImageSection({ imageUrl, imageMobileUrl }: GridImageSectionProps) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const imgInnerRef = useRef<HTMLDivElement>(null);
  const frameRef    = useRef<HTMLDivElement>(null);

  /* Scroll-driven parallax ─────────────────────────── */
  useEffect(() => {
    const tick = () => {
      if (!sectionRef.current || !imgInnerRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh   = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const progress  = (vh - rect.top) / (vh + rect.height);
      const intensity = window.innerWidth < 768 ? -55 : -130;
      const translate = (progress - 0.5) * intensity;
      imgInnerRef.current.style.transform = `translateY(${translate}px)`;
    };
    window.addEventListener("scroll", tick, { passive: true });
    tick();
    return () => window.removeEventListener("scroll", tick);
  }, []);

  /* 3-D tilt on hover ──────────────────────────────── */
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    el.style.transition = "none";
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(1400px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateZ(8px)`;
  };
  const onLeave = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.transition = "transform 0.9s cubic-bezier(.23,1,.32,1)";
    el.style.transform  = "perspective(1400px) rotateY(0deg) rotateX(0deg) translateZ(0)";
  };

  if (!imageUrl) return null;

  return (
    <>
      <div className="gi-section" ref={sectionRef}>

        {/* ── ambient glow orbs ── */}
        <GlowOrb animation="none" size={680} fade="62%" blur={110} color="rgba(250,204,21,0.10)" className="top-[-35%] left-[-8%] opacity-[0.85]" />
        <GlowOrb animation="none" size={560} fade="62%" blur={110} color="rgba(251,146,60,0.07)" className="bottom-[-35%] right-[-6%] opacity-[0.85]" />
        <GlowOrb animation="none" size={420} fade="62%" blur={110} color="rgba(250,204,21,0.04)" className="top-[20%] left-[38%] opacity-[0.85]" />

        {/* ── entrance animation ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 72 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.05, ease: [0.23, 1, 0.32, 1] }}
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* ── 3-D tilt frame ── */}
          <div
            ref={frameRef}
            className="gi-frame"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            {/* pulsing border overlay */}
            <div className="gi-pulse" aria-hidden="true" />

            {/* grid texture faded to edges */}
            <div className="gi-grid" aria-hidden="true" />

            {/* corner L-brackets */}
            <div className="gi-corner gi-corner--tl" aria-hidden="true" />
            <div className="gi-corner gi-corner--tr" aria-hidden="true" />
            <div className="gi-corner gi-corner--bl" aria-hidden="true" />
            <div className="gi-corner gi-corner--br" aria-hidden="true" />

            {/* floating label pill */}
            <div className="gi-badge" aria-hidden="true">
              <span className="gi-badge__dot" />
              Selected Work
            </div>

            {/* image viewport */}
            <div className="gi-viewport">
              <div className="gi-img-inner" ref={imgInnerRef}>
                <picture>
                  {imageMobileUrl && (
                    <source media="(max-width: 640px)" srcSet={imageMobileUrl} />
                  )}
                  <img
                    src={imageUrl}
                    alt="Selected work — Triolla design portfolio"
                    className="gi-img"
                    loading="lazy"
                  />
                </picture>
              </div>

              {/* vignette + edge fades */}
              <div className="gi-vignette"     aria-hidden="true" />
              <div className="gi-fade gi-fade--top"    aria-hidden="true" />
              <div className="gi-fade gi-fade--bottom" aria-hidden="true" />
              <div className="gi-fade gi-fade--left"   aria-hidden="true" />
              <div className="gi-fade gi-fade--right"  aria-hidden="true" />

              {/* one-time shimmer sweep on entrance */}
              <div className="gi-shimmer" aria-hidden="true" />

              {/* horizontal scanlines */}
              <div className="gi-scanlines" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════
           GRID IMAGE — premium parallax showcase
        ═══════════════════════════════════════════════ */

        .gi-section {
          position: relative;
          max-width: 1400px;
          margin: 88px auto 0;
          padding: 0 16px;
        }
        @media (min-width: 1024px) { .gi-section { padding: 0 32px; } }

        /* ── outer frame ── */
        .gi-frame {
          position: relative;
          border-radius: 52px;
          overflow: hidden;
          background: #090909;
          border: 1px solid rgba(250,204,21,0.15);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 90px 220px rgba(0,0,0,0.78),
            inset 0 1px 0 rgba(255,255,255,0.04);
          will-change: transform;
          cursor: crosshair;
        }

        /* pulsing glow on border */
        .gi-pulse {
          position: absolute;
          inset: -1px;
          border-radius: 52px;
          pointer-events: none;
          z-index: 30;
          animation: giPulse 3.8s ease-in-out infinite;
        }
        @keyframes giPulse {
          0%,100% { box-shadow: 0 0 0 1px rgba(250,204,21,0.08), 0 0 30px rgba(250,204,21,0.03); }
          50%      { box-shadow: 0 0 0 1px rgba(250,204,21,0.32), 0 0 80px rgba(250,204,21,0.11); }
        }

        /* grid texture — visible at edges, transparent at center */
        .gi-grid {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 62px 62px;
          mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, transparent 40%, black 100%);
        }

        /* ── corner L-brackets ── */
        .gi-corner {
          position: absolute;
          width: 26px; height: 26px;
          z-index: 25;
          pointer-events: none;
        }
        .gi-corner::before,
        .gi-corner::after {
          content: '';
          position: absolute;
          border-radius: 2px;
        }
        .gi-corner::before {
          width: 100%; height: 1.5px; top: 0; left: 0;
          background: linear-gradient(to right, #facc15, rgba(250,204,21,0.3));
        }
        .gi-corner::after {
          width: 1.5px; height: 100%; top: 0; left: 0;
          background: linear-gradient(to bottom, #facc15, rgba(250,204,21,0.3));
        }
        .gi-corner--tl { top: 22px; left: 22px; }
        .gi-corner--tr { top: 22px; right: 22px; transform: scaleX(-1); }
        .gi-corner--bl { bottom: 22px; left: 22px; transform: scaleY(-1); }
        .gi-corner--br { bottom: 22px; right: 22px; transform: scale(-1,-1); }

        /* ── floating pill badge ── */
        .gi-badge {
          position: absolute;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 26;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 22px;
          border-radius: 999px;
          background: rgba(0,0,0,0.62);
          backdrop-filter: blur(18px) saturate(130%);
          -webkit-backdrop-filter: blur(18px) saturate(130%);
          border: 1px solid rgba(250,204,21,0.24);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          white-space: nowrap;
          box-shadow: 0 4px 28px rgba(0,0,0,0.45), 0 0 14px rgba(250,204,21,0.07);
        }
        .gi-badge__dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #facc15;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(250,204,21,0.95);
          animation: giDot 2.2s ease-in-out infinite;
        }
        @keyframes giDot {
          0%,100% { opacity: 1;   box-shadow: 0 0 10px rgba(250,204,21,0.95); }
          50%      { opacity: 0.3; box-shadow: 0 0 3px  rgba(250,204,21,0.25); }
        }

        /* ── image viewport ── */
        .gi-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
        }
        @media (min-width: 640px)  { .gi-viewport { aspect-ratio: 16 / 9; } }
        @media (min-width: 1024px) { .gi-viewport { aspect-ratio: 16 / 8; } }

        /* inner — extra height for parallax travel */
        .gi-img-inner {
          position: absolute;
          inset: -90px 0;
          will-change: transform;
        }

        .gi-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 22%;
          display: block;
        }

        /* vignette */
        .gi-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 95% 95% at 50% 50%, transparent 38%, rgba(9,9,9,0.55) 100%);
          pointer-events: none;
          z-index: 5;
        }

        /* edge fades */
        .gi-fade {
          position: absolute;
          pointer-events: none;
          z-index: 6;
        }
        .gi-fade--top    { top: 0; left: 0; right: 0; height: 28%; background: linear-gradient(to bottom, rgba(9,9,9,0.6), transparent); }
        .gi-fade--bottom { bottom: 0; left: 0; right: 0; height: 28%; background: linear-gradient(to top, rgba(9,9,9,0.6), transparent); }
        .gi-fade--left   { top: 0; left: 0; bottom: 0; width: 7%; background: linear-gradient(to right, rgba(9,9,9,0.45), transparent); }
        .gi-fade--right  { top: 0; right: 0; bottom: 0; width: 7%; background: linear-gradient(to left, rgba(9,9,9,0.45), transparent); }

        /* one-time shimmer sweep */
        .gi-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            108deg,
            transparent 22%,
            rgba(250,204,21,0.06) 40%,
            rgba(255,255,255,0.045) 50%,
            rgba(250,204,21,0.06) 60%,
            transparent 78%
          );
          background-size: 300% 100%;
          background-position: 260% 0;
          animation: giShimmer 2.4s 0.8s cubic-bezier(.23,1,.32,1) 1 forwards;
          pointer-events: none;
          z-index: 12;
        }
        @keyframes giShimmer {
          from { background-position: 260% 0; opacity: 1; }
          to   { background-position: -160% 0; opacity: 0; }
        }

        /* scanlines */
        .gi-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.045) 2px,
            rgba(0,0,0,0.045) 3px
          );
          pointer-events: none;
          z-index: 14;
        }

        /* ══════════════════════════════════════════
           MOBILE — full-bleed editorial billboard
        ══════════════════════════════════════════ */
        @media (max-width: 768px) {
          /* Full bleed: no horizontal padding, flush edges */
          .gi-section {
            padding: 0;
            margin-top: 48px;
            max-width: 100%;
            margin-left: 0;
            margin-right: 0;
          }

          /* Frameless cinematic look */
          .gi-frame {
            border-radius: 0;
            cursor: default;
          }

          /* Pulsing border adapts to rectangular frame */
          .gi-pulse {
            border-radius: 0;
          }

          /* Taller crop shows more image content on narrow screens */
          .gi-viewport {
            aspect-ratio: 4 / 3;
          }

          /* Less parallax travel headroom needed */
          .gi-img-inner {
            inset: -30px 0;
          }

          /* Reduce edge fades so image content is more visible */
          .gi-fade--top    { height: 16%; }
          .gi-fade--bottom { height: 16%; }
          .gi-fade--left   { width: 0; }
          .gi-fade--right  { width: 0; }

          /* Badge — moved to bottom for a cinematic caption feel */
          .gi-badge {
            top: auto;
            bottom: 18px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 9px;
            padding: 7px 16px;
            letter-spacing: 0.18em;
            gap: 8px;
          }

          /* Corner brackets — tighter to frame edges */
          .gi-corner { width: 20px; height: 20px; }
          .gi-corner--tl { top: 14px;    left: 14px; }
          .gi-corner--tr { top: 14px;    right: 14px; }
          .gi-corner--bl { bottom: 14px; left: 14px; }
          .gi-corner--br { bottom: 14px; right: 14px; }

          /* Grid texture more subtle on mobile */
          .gi-grid { opacity: 0.45; }
        }
      `}</style>
    </>
  );
}
