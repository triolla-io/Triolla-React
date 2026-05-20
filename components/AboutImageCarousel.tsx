"use client";

import { useRef } from "react";
import { motion } from "motion/react";

interface AboutImageCarouselProps {
  images: (string | null)[];
}

export function AboutImageCarousel({ images }: AboutImageCarouselProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const validImages = images.filter((src): src is string => !!src);
  if (validImages.length === 0) return null;

  return (
    <div className="aic-root" ref={constraintsRef}>
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        className="aic-track"
      >
        {validImages.map((src, i) => (
          <div key={i} className="aic-slide">
            <img src={src} alt="" className="aic-slide__img" draggable={false} />
            <div className="aic-slide__shine" aria-hidden="true" />
          </div>
        ))}
      </motion.div>

      {/* drag hint */}
      <div className="aic-hint" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 10H17M12 5L17 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Drag</span>
      </div>

      <style>{`
        .aic-root {
          position: relative;
          overflow: hidden;
          cursor: grab;
          border-radius: 24px;
        }
        .aic-root:active { cursor: grabbing; }
        .aic-track {
          display: flex;
          gap: 16px;
          width: max-content;
          padding: 0 4px 0 0;
        }
        .aic-slide {
          position: relative;
          width: 340px;
          height: 400px;
          flex-shrink: 0;
          border-radius: 20px;
          overflow: hidden;
          background: #111;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
        }
        .aic-slide__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          display: block;
          transition: transform 0.7s cubic-bezier(.23,1,.32,1);
        }
        .aic-slide:hover .aic-slide__img { transform: scale(1.04); }
        .aic-slide__shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 40%, rgba(250,204,21,0.05) 55%, transparent 65%);
          pointer-events: none;
        }
        .aic-hint {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 8px 14px;
          border-radius: 999px;
          pointer-events: none;
          animation: aicHintFade 1.5s ease-in-out 1.5s both;
        }
        @keyframes aicHintFade {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @media (max-width: 768px) {
          .aic-slide { width: 260px; height: 320px; }
        }
      `}</style>
    </div>
  );
}
