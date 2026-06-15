'use client'

import { useRef, useState, useEffect } from 'react'
import { m } from 'motion/react'
import parse from 'html-react-parser'
import { FadeIn } from './FadeIn'
import { GlowOrb, Eyebrow } from '@/components/ui'

function decodeHtml(html: string): string {
  return (html ?? '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
}

interface Step {
  number?: string
  numtitle: string
}

interface AnimatedStepsProps {
  steps: Step[]
  title?: string | null
  subtext?: string | null
  accentColor?: string
}

export default function AnimatedSteps({ steps, title, subtext, accentColor = '#facc15' }: AnimatedStepsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const cardWidth = el.scrollWidth / steps.length
      const idx = Math.round(el.scrollLeft / cardWidth)
      setActiveStep(Math.min(idx, steps.length - 1))
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [steps.length])

  if (steps.length === 0) return null

  return (
    <section className="tech-steps" style={{ '--accent': accentColor } as React.CSSProperties}>
      <style>{`
        /* ─── Steps section ─────────────────────── */
        .tech-steps {
          position: relative;
          padding: 96px 0 88px;
          border-top: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
        }
        .section-head {
          position: relative; z-index: 2;
          text-align: center;
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
          margin-bottom: clamp(40px, 5vw, 64px);
        }
        .section-head__title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -0.028em;
          line-height: 1.04;
          margin-bottom: 18px;
          color: #fff;
        }
        .section-head__title span { color: var(--accent); }
        .section-head__sub {
          color: rgba(255,255,255,0.5);
          font-size: 17px;
          line-height: 1.78;
        }
        .section-head__sub p { margin-bottom: 6px; }
        .section-head__sub p:last-child { margin-bottom: 0; }
        .tech-steps__hint {
          align-items: center; gap: 8px;
          color: color-mix(in srgb, var(--accent) 66.7%, transparent);
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
        .tech-steps__scroll-wrap {
          display: flex;
          gap: 28px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          scroll-padding-left: clamp(24px, 5vw, 80px);
          position: relative; z-index: 2;
          padding: 24px clamp(24px, 5vw, 80px) 52px;
        }
        .tech-steps__scroll-wrap::-webkit-scrollbar { display: none; }

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
          color: color-mix(in srgb, var(--accent) 14.9%, transparent);
          transform: translateY(-4px) scale(1.06);
          animation-play-state: paused;
        }

        /* Floating sparkles around the steps strip */
        .tech-steps__sparkle {
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
            color-mix(in srgb, var(--accent) 40%, transparent) 40%,
            var(--accent) 50%,
            color-mix(in srgb, var(--accent) 40%, transparent) 60%,
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
          background: var(--accent);
          border-radius: 50%;
          box-shadow:
            0 0 0 4px color-mix(in srgb, var(--accent) 14.9%, transparent),
            0 0 22px color-mix(in srgb, var(--accent) 33.3%, transparent),
            inset 0 0 6px rgba(255,255,255,0.4);
          transition: box-shadow 0.35s ease, transform 0.35s ease;
        }
        .tech-step:hover .tech-step__dot {
          transform: scale(1.18);
          box-shadow:
            0 0 0 5px color-mix(in srgb, var(--accent) 25%, transparent),
            0 0 36px color-mix(in srgb, var(--accent) 66.7%, transparent),
            inset 0 0 8px rgba(255,255,255,0.55);
        }
        .tech-step__dot-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid var(--accent);
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
            color-mix(in srgb, var(--accent) 40%, transparent) 0%,
            color-mix(in srgb, var(--accent) 20%, transparent) 30%,
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
            color-mix(in srgb, var(--accent) 93.3%, transparent) 50%,
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
          color: var(--accent);
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
          .tech-steps__scroll-wrap { padding: 20px 20px 44px; gap: 24px; scroll-padding-left: 20px; }
          .tech-step { min-width: 240px; }
        }
      `}</style>

      <GlowOrb size={460} blur={110} color="color-mix(in srgb, var(--accent) 6.25%, transparent)" className="top-[35%] left-[-8%]" />
      <GlowOrb size={380} blur={110} color="color-mix(in srgb, var(--accent) 3.9%, transparent)" className="bottom-[6%] right-[-6%]" />

      {/* Floating sparkles */}
      {[...Array(10)].map((_, i) => (
        <span key={`sp-${i}`} className="tech-steps__sparkle" style={{ '--spi': i } as React.CSSProperties} aria-hidden="true" />
      ))}

      {/* Diagonal scan-line */}
      <div className="tech-steps__scan" aria-hidden="true">
        <span className="tech-steps__scan-beam" />
      </div>

      {(title || subtext) && (
        <FadeIn className="section-head">
          <Eyebrow
            ornament="mark"
            align="center"
            color="var(--accent)"
            style={
              {
                '--eb-gap': '16px',
                '--eb-size': '10px',
                '--eb-spacing': '0.25em',
                '--eb-line-w': '56px',
                '--eb-line-bg': 'linear-gradient(to right, transparent, var(--accent))',
              } as React.CSSProperties
            }
          >
            {''}
          </Eyebrow>
          {title && <h2 className="section-head__title">{parse(decodeHtml(title))}</h2>}
          {subtext && <div className="section-head__sub">{parse(decodeHtml(subtext))}</div>}
        </FadeIn>
      )}

      <div className="tech-steps__hint md:hidden" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7H12M8.5 3.5L12 7L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="tech-steps__scroll-wrap" ref={scrollRef}>
        {steps.map((step, i) => (
          <div key={i} className="tech-step" style={{ '--si': i } as React.CSSProperties}>
            <div className="tech-step__bg-num" aria-hidden="true">
              {parseInt(step.number ?? String(i + 1)) || i + 1}
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
              <span className="tech-step__num">{String(i + 1).padStart(2, '0')}</span>
              <div className="tech-step__name">{parse(decodeHtml(step.numtitle ?? ''))}</div>
            </div>
          </div>
        ))}
      </div>
      {steps.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 md:hidden" aria-hidden="true">
          {steps.map((_, i) => (
            <m.span
              key={i}
              animate={{
                width: i === activeStep ? 16 : 6,
                backgroundColor: i === activeStep ? '#facc15' : 'rgba(255,255,255,0.25)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ height: 6, borderRadius: 999, display: 'block' }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
