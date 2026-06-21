/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRef, useState, useEffect } from 'react'
import parse from 'html-react-parser'
import { wpImg } from '@/lib/images'
import { sanitizeWpHtml, stripHtml } from '@/lib/text'

interface PortfolioShowcaseProps {
  items: any[]
  accentColor: string
  isRtl?: boolean
}

/**
 * Sticky split-screen case-study scroller — image pinned on the LEFT,
 * copy scrolls on the RIGHT. The left image crossfades as each right-hand
 * panel enters the centre of the viewport (IntersectionObserver driven).
 * Mirrors the "WOW" scroll on the technology page (see TechStickyFeature).
 */
export function PortfolioShowcase({ items, accentColor, isRtl = false }: PortfolioShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    panelRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i)
        },
        { threshold: 0, rootMargin: '-42% 0px -42% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [items.length])

  if (!items.length) return null

  return (
    <section className="relative" style={{ '--accent': accentColor } as React.CSSProperties}>
      <style>{`
        /* ─── Image crossfade (left, sticky) ───────── */
        .ps-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1),
                      transform 1.5s cubic-bezier(0.4,0,0.2,1);
        }
        .ps-img-on  { opacity: 1; transform: scale(1.0); }
        .ps-img-off { opacity: 0; transform: scale(1.07); }

        /* ─── Scan line sweeping the image ─────────── */
        @keyframes ps-scan {
          0%,100% { transform: translateY(-100%); opacity: 0; }
          5%      { opacity: 0.32; }
          92%     { opacity: 0.32; }
          98%     { transform: translateY(100vh); opacity: 0; }
        }
        .ps-scan {
          position: absolute; left: 0; right: 0; height: 1px; z-index: 5;
          background: linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 33%, transparent), transparent);
          animation: ps-scan 7s ease-in-out 1.5s infinite;
          pointer-events: none;
        }

        /* ─── Panel content reveal (anti-gravity) ──── */
        /* Mobile: always visible — sticky split-screen only applies on lg+ */
        .ps-item { transition: opacity 0.55s cubic-bezier(0.23,1,0.32,1), transform 0.55s cubic-bezier(0.23,1,0.32,1); }
        .ps-item-on  { opacity: 1; transform: none; }
        .ps-item-off { opacity: 1; transform: none; }
        @media (min-width: 1024px) {
          .ps-item-off { opacity: 0; transform: translateY(24px); }
        }

        /* ─── Tag pills ────────────────────────────── */
        .ps-tag {
          display: inline-flex; align-items: center;
          padding: 6px 16px; border-radius: 999px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          background: color-mix(in srgb, var(--accent) 7%, transparent);
          color: var(--accent);
          border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .ps-tag:hover {
          transform: translateY(-2px);
          background: color-mix(in srgb, var(--accent) 14%, transparent);
        }

        /* ─── Progress dots ────────────────────────── */
        .ps-dot {
          border-radius: 50%; border: none; padding: 0; cursor: pointer;
          transition: width 0.35s cubic-bezier(0.4,0,0.2,1),
                      height 0.35s cubic-bezier(0.4,0,0.2,1),
                      background 0.35s ease, box-shadow 0.35s ease;
        }

        /* ─── Accent progress bar ──────────────────── */
        @keyframes ps-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .ps-bar { transform-origin: left; animation: ps-bar 0.5s ease-out forwards; }

        /* ─── Reset WordPress float/inline images in body text ── */
        .ps-body img {
          float: none !important;
          position: static !important;
          display: block;
          max-width: 100%;
          height: auto;
          margin: 12px 0;
        }
      `}</style>

      <div className="lg:grid lg:grid-cols-[48fr_52fr]" style={{ borderTop: 'none', direction: 'ltr' }}>
        {/* ═══ LEFT — sticky crossfading image ═══ */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen overflow-hidden bg-[#0b0b0b]">
            <div className="absolute inset-0">
              {items.map((item, i) =>
                item.pImage?.node?.sourceUrl ? (
                  <img
                    key={i}
                    src={wpImg(item.pImage.node.sourceUrl) ?? ''}
                    alt=""
                    aria-hidden="true"
                    className={`ps-img ${i === activeIndex ? 'ps-img-on' : 'ps-img-off'}`}
                  />
                ) : null,
              )}
            </div>

            <div className="ps-scan" aria-hidden="true" />

            {/* Right-edge fade into the page */}
            <div
              className="absolute inset-y-0 right-0 w-40 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to right, transparent, #080808)',
              }}
              aria-hidden="true"
            />
            {/* Bottom + top vignette */}
            <div
              className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to top, #080808, transparent)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 top-0 h-24 pointer-events-none z-10"
              style={{
                background: 'linear-gradient(to bottom, rgba(8,8,8,0.6), transparent)',
              }}
              aria-hidden="true"
            />

            {/* Progress dots */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Case study ${i + 1}`}
                  onClick={() =>
                    panelRefs.current[i]?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                  className="ps-dot"
                  style={{
                    width: i === activeIndex ? '10px' : '5px',
                    height: i === activeIndex ? '10px' : '5px',
                    background: i === activeIndex ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                    boxShadow:
                      i === activeIndex ? '0 0 14px var(--accent), 0 0 28px color-mix(in srgb, var(--accent) 33%, transparent)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Panel counter */}
            <div
              className="absolute left-6 bottom-8 font-black tabular-nums select-none pointer-events-none leading-none z-20"
              style={{
                fontSize: '88px',
                color: 'color-mix(in srgb, var(--accent) 13.3%, transparent)',
              }}
              aria-hidden="true"
            >
              {String(activeIndex + 1).padStart(2, '0')}
              <span
                className="block"
                style={{
                  fontSize: '16px',
                  color: 'color-mix(in srgb, var(--accent) 33%, transparent)',
                  letterSpacing: '0.3em',
                  fontWeight: 800,
                }}
              >
                / {String(items.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT — scrollable text panels ═══ */}
        <div>
          {items.map((item, i) => {
            const isActive = i === activeIndex
            const tags: any[] = item.pTags ?? []
            return (
              <div
                key={i}
                ref={(el) => {
                  panelRefs.current[i] = el
                }}
                className="min-h-screen flex flex-col justify-center py-10 md:py-24 px-5 sm:px-8 lg:px-16 relative overflow-hidden"
              >
                {/* Ghost number */}
                <div
                  className="absolute top-0 inset-e-0 font-black select-none pointer-events-none leading-[0.85] overflow-hidden"
                  style={{
                    fontSize: 'clamp(120px,20vw,240px)',
                    color: 'color-mix(in srgb, var(--accent) 2.7%, transparent)',
                  }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Mobile image */}
                {item.pImage?.node?.sourceUrl && (
                  <div
                    className="lg:hidden mb-6 rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: '16/10',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    <img
                      src={wpImg(item.pImage.node.sourceUrl) ?? ''}
                      alt={stripHtml(item.pTitle ?? '')}
                      className="w-full h-full object-cover"
                      loading={i < 2 ? 'eager' : 'lazy'}
                    />
                  </div>
                )}

                <div className="relative z-10 max-w-[560px]" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                  {/* Index + accent bar */}
                  <div className="flex items-end gap-4 mb-5 md:mb-9">
                    <span
                      className="font-black tabular-nums leading-none"
                      style={{
                        fontSize: '56px',
                        color: 'white',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="font-bold tabular-nums leading-none pb-2"
                      style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.18em',
                      }}
                    >
                      / {String(items.length).padStart(2, '0')}
                    </span>
                    <div className="h-[2px] flex-1 overflow-hidden rounded-full ml-2 mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {isActive && <div className="ps-bar h-full w-full rounded-full" style={{ background: 'var(--accent)' }} />}
                    </div>
                  </div>

                  <div className={`ps-item ${isActive ? 'ps-item-on' : 'ps-item-off'}`}>
                    {/* Client logo */}
                    {item.pLogo?.node?.sourceUrl && (
                      <img
                        src={wpImg(item.pLogo.node.sourceUrl) ?? ''}
                        alt=""
                        className="h-11 object-contain self-start mb-7"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    )}

                    {/* Title */}
                    {item.pTitle && (
                      <h3
                        className="font-black tracking-[-0.03em] leading-[1.04] mb-6 text-white"
                        style={{ fontSize: 'clamp(28px,4vw,54px)' }}
                      >
                        {item.pTitle}
                      </h3>
                    )}

                    {/* Body */}
                    {item.sortText && (
                      <div
                        className="ps-body leading-[1.85] mb-8"
                        style={{
                          fontSize: '18px',
                          color: 'rgba(255,255,255,0.55)',
                          overflow: 'hidden',
                        }}
                      >
                        {parse(sanitizeWpHtml(item.sortText))}
                      </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2.5">
                        {tags.map((tag: any, ti: number) => (
                          <span key={ti} className="ps-tag">
                            {tag.tagName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
