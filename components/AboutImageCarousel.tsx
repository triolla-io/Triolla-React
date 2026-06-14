'use client'

import React from 'react'
import { ShineImageCard, GlowOrb } from '@/components/ui'

interface AboutImageCarouselProps {
  images: (string | null)[]
}

export function AboutImageCarousel({ images }: AboutImageCarouselProps) {
  const validImages = images.filter((src): src is string => !!src)
  if (validImages.length === 0) return null

  return (
    <div className="aic-root" style={{ '--accent': '#facc15' } as React.CSSProperties}>
      <style>{`
        .aic-root {
          position: relative;
          overflow: hidden;
        }

        /* Floating sparkles */
        .aic-sparkle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 12px var(--accent), 0 0 24px color-mix(in srgb, var(--accent) 40%, transparent);
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          top: calc(12% + (var(--spi, 0) * 7.5%));
          left: calc(5% + (var(--spi, 0) * 9.2%));
          animation: aicSparkle 5s ease-in-out infinite;
          animation-delay: calc(var(--spi, 0) * 0.52s);
        }
        @keyframes aicSparkle {
          0%, 100% { opacity: 0;    transform: scale(0)   translateY(0); }
          25%       { opacity: 0.9; transform: scale(1.5) translateY(-8px); }
          55%       { opacity: 0.35; transform: scale(0.9) translateY(-18px); }
          80%       { opacity: 0;   transform: scale(0)   translateY(-24px); }
        }

        /* Diagonal scan-line */
        .aic-scan {
          position: absolute; inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .aic-scan-beam {
          position: absolute;
          top: -20%; left: -30%;
          width: 160%; height: 2px;
          background: linear-gradient(
            to right,
            transparent 0%,
            color-mix(in srgb, var(--accent) 40%, transparent) 40%,
            var(--accent) 50%,
            color-mix(in srgb, var(--accent) 40%, transparent) 60%,
            transparent 100%
          );
          filter: blur(2px);
          transform: rotate(-8deg);
          animation: aicScan 9s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes aicScan {
          0%   { transform: rotate(-8deg) translateY(0); opacity: 0; }
          15%  { opacity: 0.7; }
          85%  { opacity: 0.7; }
          100% { transform: rotate(-8deg) translateY(640px); opacity: 0; }
        }

        /* Scroll hint */
        .aic-hint {
          display: flex;
          align-items: center; gap: 8px;
          color: color-mix(in srgb, var(--accent) 66.7%, transparent);
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          max-width: 1600px;
          margin: 0 auto 12px;
          padding: 0 clamp(24px, 5vw, 80px);
          animation: aicSwipeHint 2s ease-in-out infinite;
        }
        @keyframes aicSwipeHint {
          0%,100% { opacity: 0.5; transform: translateX(0); }
          50%      { opacity: 1;   transform: translateX(6px); }
        }

        /* Scroll track */
        .aic-track {
          display: flex;
          gap: 28px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          scroll-padding-left: clamp(24px, 5vw, 80px);
          position: relative; z-index: 2;
          padding: 24px clamp(24px, 5vw, 80px) 52px;
        }
        .aic-track::-webkit-scrollbar { display: none; }

        /* Card wrapper with float animation */
        .aic-card {
          flex-shrink: 0;
          scroll-snap-align: start;
          animation: aicFloat calc(6.5s + (var(--si, 0) * 0.45s)) ease-in-out infinite;
          animation-delay: calc(var(--si, 0) * 0.35s);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .aic-card:hover {
          animation-play-state: paused;
          transform: translateY(-10px);
        }
        @keyframes aicFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .aic-card,
          .aic-sparkle,
          .aic-scan-beam { animation: none !important; }
          .aic-sparkle { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .aic-track { padding: 20px 20px 44px; gap: 24px; scroll-padding-left: 20px; }
          .aic-hint { padding: 0 20px; }
        }
      `}</style>

      <GlowOrb size={460} blur={110} color="color-mix(in srgb, var(--accent) 6.25%, transparent)" className="top-[35%] left-[-8%]" />
      <GlowOrb size={380} blur={110} color="color-mix(in srgb, var(--accent) 3.9%, transparent)" className="bottom-[6%] right-[-6%]" />

      {/* Floating sparkles */}
      {[...Array(10)].map((_, i) => (
        <span key={`sp-${i}`} className="aic-sparkle" style={{ '--spi': i } as React.CSSProperties} aria-hidden="true" />
      ))}

      {/* Diagonal scan-line */}
      <div className="aic-scan" aria-hidden="true">
        <span className="aic-scan-beam" />
      </div>

      {/* Scroll hint — mobile only */}
      <div className="aic-hint md:hidden" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7H12M8.5 3.5L12 7L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Scroll
      </div>

      <div className="aic-track">
        {validImages.map((src, i) => (
          <div key={i} className="aic-card" style={{ '--si': i } as React.CSSProperties}>
            <ShineImageCard
              src={src}
              alt=""
              radius={20}
              shineAngle="135deg"
              imgScale={1.04}
              style={
                {
                  '--sc-lift': '0px',
                  '--sc-scale': '1',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                } as React.CSSProperties
              }
              className="w-[340px] h-[400px] max-md:w-[260px] max-md:h-[320px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
