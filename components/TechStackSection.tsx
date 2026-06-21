'use client'

import { useRef, useEffect, useState } from 'react'
import parse from 'html-react-parser'
import { GlowOrb, Eyebrow, GradientText } from '@/components/ui'
import { wpImg } from '@/lib/images'
import { stripHtml } from '@/lib/text'

function decodeHtml(html: string): string {
  return (html ?? '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
}

interface TechImage {
  url: string | null
  title: string | null
}

interface TechStackSectionProps {
  titleOne: string | null
  titleTwo: string | null
  text: string | null
  midTitle: string | null
  images: TechImage[]
  accentColor: string
}

export function TechStackSection({ titleOne, titleTwo, text, midTitle, images, accentColor }: TechStackSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.08 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const validImages = images.filter((img) => img.url)
  const plainText = text ? stripHtml(text) : null
  const cleanMidTitle = (midTitle ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&amp;/g, '&')
    .trim()

  return (
    <>
      <section ref={sectionRef} className="tss-root" style={{ '--accent': accentColor } as React.CSSProperties}>
        {/* Ambient layers */}
        {/* tss-orb--tr: circle, 620px, ${accentColor}14 = 7.8%, blur 110, pulse 12s */}
        <GlowOrb
          size={620}
          color="color-mix(in srgb, var(--accent) 7.8%, transparent)"
          shape="circle"
          fade="65%"
          blur={110}
          animation="none"
          className="top-[-8%] right-[-8%]"
        />
        {/* tss-orb--bl: circle, 480px, ${accentColor}0c = 4.7%, blur 110, pulse-rev 15s */}
        <GlowOrb
          size={480}
          color="color-mix(in srgb, var(--accent) 4.7%, transparent)"
          shape="circle"
          fade="65%"
          blur={110}
          animation="none"
          className="bottom-[-10%] left-[-8%]"
        />
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
          <div className={`tss-head ${visible ? 'tss-head--on' : ''}`}>
            {cleanMidTitle && (
              <Eyebrow
                ornament="mark"
                align="center"
                style={
                  {
                    '--eb-gap': '16px',
                    '--eb-line-w': 'clamp(40px, 7vw, 72px)',
                    '--eb-line-bg': 'linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 67%, transparent))',
                    '--eb-mb': '28px',
                    '--eb-spacing': '0.36em',
                    '--eb-weight': '800',
                  } as React.CSSProperties
                }
              >
                {cleanMidTitle}
              </Eyebrow>
            )}

            {(titleOne || titleTwo) && (
              <h2 className="tss-title">
                {titleOne && <span className="tss-title__line">{parse(decodeHtml(titleOne))}</span>}
                {titleTwo && (
                  <GradientText
                    as="span"
                    animate
                    duration={7}
                    gradient="linear-gradient(135deg, #fff 38%, var(--accent) 58%, #fff 78%)"
                    className="tss-title__line italic"
                  >
                    {parse(decodeHtml(titleTwo))}
                  </GradientText>
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
                    className={`tss-card ${visible ? 'tss-card--on' : ''}`}
                    style={
                      {
                        '--ci': i,
                        transitionDelay: visible ? `${0.15 + i * 0.07}s` : '0s',
                      } as React.CSSProperties
                    }
                  >
                    <div className="tss-card__float">
                      <div className="tss-card__face-wrap">
                        <span className="tss-card__halo" aria-hidden="true" />
                        <div className="tss-card__face">
                          <span className="tss-card__corner tss-card__corner--tl" aria-hidden="true" />
                          <span className="tss-card__corner tss-card__corner--br" aria-hidden="true" />
                          <img src={wpImg(img.url) ?? ''} alt={img.title ?? ''} className="tss-card__img" />
                        </div>
                      </div>
                      {img.title && <span className="tss-card__label">{stripHtml(img.title)}</span>}
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
          color: var(--accent);
        }
        .tss-marker__line {
          display: block; width: 64px; height: 1px;
          background: linear-gradient(to right, color-mix(in srgb, var(--accent) 40%, transparent), transparent);
        }
        .tss-marker__line--rev {
          width: 56px;
          background: linear-gradient(to left, transparent, rgba(255,255,255,0.28));
        }
        .tss-marker__dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 67%, transparent);
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

        .tss-title {
          font-size: clamp(40px, 6.4vw, 88px);
          font-weight: 900;
          letter-spacing: -0.035em;
          line-height: 0.98;
          margin-bottom: 30px;
        }
        .tss-title__line { display: block; color: #fff; }

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
          background: radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 10.2%, transparent) 0%, transparent 62%);
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
          background: radial-gradient(circle, color-mix(in srgb, var(--accent) 14.9%, transparent) 0%, transparent 60%);
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
          border: 1px solid var(--accent);
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
          border-color: color-mix(in srgb, var(--accent) 47%, transparent);
          box-shadow:
            0 0 0 1px color-mix(in srgb, var(--accent) 27%, transparent),
            0 22px 56px rgba(0,0,0,0.65),
            0 0 56px color-mix(in srgb, var(--accent) 20%, transparent),
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
          color: var(--accent);
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
          background: linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 33%, transparent) 60%, rgba(255,255,255,0.1));
        }
        .tss-foot__line--rev {
          background: linear-gradient(to left, transparent, color-mix(in srgb, var(--accent) 33%, transparent) 60%, rgba(255,255,255,0.1));
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
          background: linear-gradient(180deg, #fff 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums;
        }
        .tss-foot__slash {
          color: color-mix(in srgb, var(--accent) 53%, transparent);
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
          .tss-card__float {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}
