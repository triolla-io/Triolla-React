'use client'

import { useRef, useState } from 'react'
import parse from 'html-react-parser'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GlowOrb, GradientText } from '@/components/ui'
import { Reveal } from '@/components/gsap/Reveal'
import { registerGsap, Q_DESKTOP } from '@/lib/gsap'

registerGsap()

interface FAQItem {
  faqQuestion: string
  faqAnswer: string
}

interface FAQSectionProps {
  heading?: string | null
  subtext?: string | null
  items: FAQItem[]
}

export function FAQSection({ heading, subtext, items }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  // Pin the heading column beside the scrolling list (CSS sticky breaks under
  // ScrollSmoother). Desktop+motion only; below lg the heading is in normal flow.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(Q_DESKTOP, () => {
        const section = sectionRef.current
        const heading = headingRef.current
        if (!section || !heading) return
        const st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: heading,
          pinSpacing: false,
          anticipatePin: 1,
        })
        return () => st.kill()
      })
    },
    { scope: sectionRef },
  )

  if (!items.length) return null

  return (
    <>
      <section className="fq-root">
        <div className="fq-card">
          <GlowOrb
            animation="none"
            size={640}
            fade="60%"
            blur={100}
            color="rgba(250,204,21,0.09)"
            className="top-[-20%] right-[-8%] opacity-[0.85]"
          />
          <GlowOrb
            animation="none"
            size={500}
            fade="60%"
            blur={100}
            color="rgba(251,146,60,0.06)"
            className="bottom-[-15%] left-[-6%] opacity-[0.85]"
          />
          <GlowOrb
            animation="none"
            size={320}
            fade="60%"
            blur={100}
            color="rgba(250,204,21,0.03)"
            className="top-[50%] left-[30%] opacity-[0.85]"
          />
          <div className="fq-grid" />

          <div ref={sectionRef} className="fq-layout">
            {/* LEFT — heading column (ScrollTrigger pin on desktop, not CSS sticky) */}
            <div ref={headingRef} className="fq-col-left">
              <div className="fq-left-inner">
                {heading && <h2 className="fq-heading">{heading}</h2>}
                {subtext && <p className="fq-subtext">{subtext}</p>}
                <div className="fq-rule" />
                <GradientText as="span" gradient="linear-gradient(128deg,#facc15,#f59e0b)" className="fq-count" aria-hidden="true">
                  {String(items.length).padStart(2, '0')}
                  <span className="fq-count__label">questions</span>
                </GradientText>
              </div>
              <div className="fq-deco" aria-hidden="true">
                ?
              </div>
            </div>

            {/* RIGHT — accordion (rows cascade in on enter) */}
            <Reveal as="div" stagger={0.06} className="fq-col-right">
              {items.map((item, i) => {
                const isOpen = open === i
                return (
                  <div key={i} className={`fq-item${isOpen ? ' fq-item--open' : ''}`}>
                    <button
                      type="button"
                      className="fq-item__btn"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      <span className="fq-item__num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="fq-item__q">{item.faqQuestion}</span>
                      <span className="fq-item__icon" aria-hidden="true">
                        <span className="fq-item__icon-h" />
                        <span className="fq-item__icon-v" />
                      </span>
                    </button>

                    {/* CSS grid-rows expand — no JS height measurement, no scroll-anchor jump */}
                    <div className="fq-item__panel" data-open={isOpen}>
                      <div className="fq-item__panel-inner">
                        <div className="fq-item__ans">{parse(item.faqAnswer)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </Reveal>
          </div>
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════
           FAQ SECTION — premium accordion
        ═══════════════════════════════════════════════ */

        .fq-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }
        @media (min-width: 1024px) { .fq-root { padding: 0 32px; } }

        /* outer card */
        .fq-card {
          position: relative;
          overflow: hidden;
          border-radius: 52px;
          background:
            radial-gradient(ellipse at 100% 0%,   rgba(250,204,21,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at   0% 100%, rgba(251,146,60,0.04) 0%, transparent 50%),
            #090909;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow:
            0 60px 140px rgba(0,0,0,0.65),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        /* grid texture */
        .fq-grid {
          position: absolute;
          inset: 0;
          border-radius: 52px;
          background-image:
            linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 85% 80% at 85% 50%, black 0%, transparent 100%);
        }

        /* layout */
        .fq-layout {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 52px;
          padding: 72px 40px;
        }
        @media (min-width: 900px) {
          .fq-layout {
            flex-direction: row;
            align-items: flex-start;
            padding: 88px 88px;
            gap: 72px;
          }
        }

        /* left column */
        .fq-col-left {
          flex: 0 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 900px) {
          .fq-col-left {
            width: 290px;
            overflow: visible;
          }
        }

        .fq-left-inner { position: relative; z-index: 2; }

        .fq-heading {
          font-size: clamp(2rem, 3.6vw, 3.2rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: #fff;
          margin-bottom: 18px;
        }

        .fq-subtext {
          font-size: 0.97rem;
          line-height: 1.78;
          color: rgba(255,255,255,0.36);
          max-width: 260px;
          margin-bottom: 32px;
        }

        .fq-rule {
          width: 40px; height: 2px;
          background: linear-gradient(to right, rgba(250,204,21,0.8), transparent);
          border-radius: 2px;
          margin-bottom: 24px;
        }

        .fq-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 2.6rem;
          font-weight: 900;
          letter-spacing: -0.04em;
        }
        .fq-count__label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          -webkit-text-fill-color: rgba(255,255,255,0.22);
        }

        /* decorative "?" */
        .fq-deco {
          position: absolute;
          bottom: -30px;
          right: -16px;
          font-size: 200px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.06em;
          color: rgba(250,204,21,0.045);
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        /* right column */
        .fq-col-right {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          /* stop the browser from yanking the viewport when an item above
             this one collapses/expands — kills the "whole screen jump" */
          overflow-anchor: none;
        }

        /* collapsible answer panel — grid-rows trick animates to natural
           height with zero layout thrash (smooth every time) */
        .fq-item__panel {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition:
            grid-template-rows 0.42s cubic-bezier(.23,1,.32,1),
            opacity           0.3s ease;
          overflow-anchor: none;
        }
        .fq-item__panel[data-open="true"] {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .fq-item__panel-inner {
          min-height: 0;
          overflow: hidden;
        }
        @media (prefers-reduced-motion: reduce) {
          .fq-item__panel { transition: none; }
        }

        /* accordion item card */
        .fq-item {
          position: relative;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.022);
          overflow: hidden;
          transition:
            border-color 0.35s cubic-bezier(.23,1,.32,1),
            background   0.35s,
            box-shadow   0.35s;
        }
        .fq-item::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #facc15, #f59e0b);
          border-radius: 3px 0 0 3px;
          transform: scaleY(0);
          transform-origin: top center;
          transition: transform 0.42s cubic-bezier(.23,1,.32,1);
        }
        .fq-item:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
        }
        .fq-item--open {
          border-color: rgba(250,204,21,0.22);
          background: rgba(250,204,21,0.028);
          box-shadow:
            0 0 0 1px rgba(250,204,21,0.06),
            0 16px 56px rgba(0,0,0,0.35),
            0 0 48px rgba(250,204,21,0.05);
        }
        .fq-item--open::before { transform: scaleY(1); }

        /* button row */
        .fq-item__btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 22px 22px;
          text-align: start;
          background: none;
          border: none;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        /* number */
        .fq-item__num {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.18);
          min-width: 22px;
          transition: color 0.3s;
        }
        .fq-item--open .fq-item__num { color: #facc15; }

        /* question */
        .fq-item__q {
          flex: 1;
          font-size: 17px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          line-height: 1.45;
          transition: color 0.25s;
        }
        .fq-item:hover .fq-item__q { color: rgba(255,255,255,0.92); }
        .fq-item--open .fq-item__q  { color: #fff; }

        /* plus/minus circle */
        .fq-item__icon {
          flex-shrink: 0;
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.13);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: border-color 0.35s, box-shadow 0.35s;
        }
        .fq-item:hover .fq-item__icon { border-color: rgba(255,255,255,0.24); }
        .fq-item--open .fq-item__icon {
          border-color: #facc15;
          box-shadow: 0 0 16px rgba(250,204,21,0.45), 0 0 4px rgba(250,204,21,0.2);
        }

        .fq-item__icon-h,
        .fq-item__icon-v {
          position: absolute;
          border-radius: 2px;
          background: rgba(255,255,255,0.5);
          transition:
            transform  0.38s cubic-bezier(.23,1,.32,1),
            opacity    0.3s,
            background 0.3s;
        }
        .fq-item__icon-h { width: 12px; height: 1.5px; }
        .fq-item__icon-v { width: 1.5px; height: 12px; }

        .fq-item--open .fq-item__icon-h,
        .fq-item--open .fq-item__icon-v { background: #facc15; }
        .fq-item--open .fq-item__icon-v { transform: scaleY(0); opacity: 0; }

        /* answer body */
        .fq-item__ans {
          padding: 4px 22px 24px 56px;
          font-size: 15px;
          line-height: 1.85;
          color: rgba(255,255,255,0.42);
        }
        .fq-item__ans p            { margin: 0 0 10px; }
        .fq-item__ans p:last-child  { margin-bottom: 0; }
        .fq-item__ans a            { color: #facc15; text-decoration: none; border-bottom: 1px solid rgba(250,204,21,0.3); transition: border-color 0.2s; }
        .fq-item__ans a:hover      { border-color: #facc15; }
        .fq-item__ans strong       { color: rgba(255,255,255,0.68); font-weight: 600; }

        /* ══════════════════════════════════════════
           RTL overrides
        ══════════════════════════════════════════ */
        [dir="rtl"] .fq-item::before {
          left: auto;
          right: 0;
          border-radius: 0 3px 3px 0;
        }
        [dir="rtl"] .fq-item__ans {
          padding: 4px 56px 24px 22px;
        }
        [dir="rtl"] .fq-rule {
          background: linear-gradient(to left, rgba(250,204,21,0.8), transparent);
        }
        [dir="rtl"] .fq-deco {
          right: auto;
          left: -16px;
        }

        /* ══════════════════════════════════════════
           MOBILE — compact premium accordion
        ══════════════════════════════════════════ */
        @media (max-width: 768px) {
          /* Card corners proportional to mobile width */
          .fq-card { border-radius: 24px; }
          .fq-grid { border-radius: 24px; }

          /* Layout: tighter, more breathing room for content */
          .fq-layout {
            padding: 40px 20px 44px;
            gap: 32px;
          }

          /* Left column: streamlined on mobile */
          .fq-col-left { overflow: hidden; }

          .fq-heading {
            font-size: clamp(1.8rem, 7vw, 2.8rem);
            margin-bottom: 12px;
          }
          .fq-subtext {
            font-size: 0.875rem;
            max-width: 100%;
            margin-bottom: 24px;
          }
          .fq-count { font-size: 2rem; }
          .fq-count__label { font-size: 0.65rem; }

          /* Hide the huge decorative "?" on mobile — wastes space */
          .fq-deco { display: none; }

          /* Accordion items — touch-friendly, compact */
          .fq-item { border-radius: 16px; }
          .fq-item__btn {
            padding: 16px 14px;
            gap: 12px;
          }
          .fq-item__q {
            font-size: 14.5px;
            line-height: 1.4;
          }
          .fq-item__num { font-size: 10px; }

          /* Icon circle slightly smaller but still tappable */
          .fq-item__icon {
            width: 30px; height: 30px;
            flex-shrink: 0;
          }

          /* Answer body: left-align with minimal indent on mobile */
          .fq-item__ans {
            padding: 4px 14px 20px 14px;
            font-size: 13.5px;
            line-height: 1.75;
          }

          /* Reduce item gap slightly */
          .fq-col-right { gap: 8px; }
        }
      `}</style>
    </>
  )
}
