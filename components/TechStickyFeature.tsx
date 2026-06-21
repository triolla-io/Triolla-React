'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import parse from 'html-react-parser'
import { GlowOrb } from '@/components/ui'
import { wpImg } from '@/lib/images'

function decodeHtml(html: string): string {
  return (html ?? '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
}

interface ContentItem {
  threintitle: string | null
  threincontent: string | null
  tagList: string | null
}

interface ContentPanel {
  lftimage: { node: { sourceUrl: string } } | null
  threincontent: ContentItem[] | null
}

interface TechStickyFeatureProps {
  fourmidTitle: string | null
  fourtitleone: string | null
  fourtitletwo: string | null
  fourtext: string | null
  threeConent: ContentPanel[] | null
  threbottomText: string | null
  threbottomLinkText: string | null
  threbottomButtonLink: string | null
  accentColor: string
}

export function TechStickyFeature({
  threeConent,
  threbottomText,
  threbottomLinkText,
  threbottomButtonLink,
  accentColor,
}: TechStickyFeatureProps) {
  const panels = threeConent ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const [stmtVisible, setStmtVisible] = useState(false)
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const stmtRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    panelRefs.current.forEach((el, i) => {
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i)
        },
        { threshold: 0, rootMargin: '-38% 0px -38% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [panels.length])

  useEffect(() => {
    const el = stmtRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStmtVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!panels.length) return null

  const words = threbottomText?.split(' ') ?? []

  return (
    <>
      <style>{`
        /* ─── Image crossfade ───────────────────────── */
        .tsf-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%; object-fit: cover;
          transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 1.4s cubic-bezier(0.4,0,0.2,1);
        }
        .tsf-img-on  { opacity: 1; transform: scale(1.0); }
        .tsf-img-off { opacity: 0; transform: scale(1.06); }

        /* ─── Content items ─────────────────────────── */
        .tsf-item {
          transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.2,1,0.3,1);
        }
        .tsf-item-on  { opacity: 1; transform: none; }
        .tsf-item-off { opacity: 0; transform: translateY(28px); }

        /* ─── Tag pills ─────────────────────────────── */
        .tsf-tag {
          display: inline-flex; align-items: center;
          padding: 5px 15px; border-radius: 999px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: transform 0.2s;
        }
        .tsf-tag:hover { transform: translateY(-2px); }

        /* ─── Progress dot ──────────────────────────── */
        .tsf-dot {
          border-radius: 50%; border: none; padding: 0; cursor: pointer;
          transition: width 0.35s cubic-bezier(0.4,0,0.2,1),
                      height 0.35s cubic-bezier(0.4,0,0.2,1),
                      background 0.35s ease, box-shadow 0.35s ease;
        }

        /* ─── Accent bar ────────────────────────────── */
        @keyframes tsf-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .tsf-bar { transform-origin: left; animation: tsf-bar 0.5s ease-out forwards; }

        /* ─── Scan line on image ────────────────────── */
        @keyframes tsf-scan {
          0%,100% { transform: translateY(-100%); opacity: 0; }
          5%       { opacity: 0.35; }
          92%      { opacity: 0.35; }
          98%      { transform: translateY(100vh); opacity: 0; }
        }
        .tsf-scan {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, color-mix(in srgb, var(--accent) 33%, transparent), transparent);
          animation: tsf-scan 7s ease-in-out 1.5s infinite;
          pointer-events: none; z-index: 5;
        }

        /* ─── Wave transitions ──────────────────────── */

        /* ─── Statement section (cream) ─────────────── */
        .tsf-stmt {
          background: #F5F0E8;
          padding: clamp(72px, 10vw, 140px) clamp(24px, 6vw, 100px);
          position: relative;
          overflow: hidden;
        }
        .tsf-stmt__grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ─── Statement word animation ──────────────── */
        @keyframes tsf-word-rise {
          from { transform: translateY(44px); opacity: 0; }
          to   { transform: none; opacity: 1; }
        }
        .tsf-word {
          display: inline-block;
          /* visible by default — animation is enhancement only */
        }
        .tsf-word--go {
          animation: tsf-word-rise 0.72s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ─── Statement decorative lines ────────────── */
        @keyframes tsf-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .tsf-dline {
          transform-origin: left;
          animation: tsf-line 1.2s cubic-bezier(0.4,0,0.2,1) 0.2s both;
        }
        .tsf-dline-r { transform-origin: right; }

        /* ─── Statement CTA ─────────────────────────── */
        .tsf-stmt-cta {
          position: relative; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .tsf-stmt-cta::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(0,0,0,0.08); transform: scaleX(0);
          transform-origin: left; transition: transform 0.3s ease;
        }
        .tsf-stmt-cta:hover::before { transform: scaleX(1); }
        .tsf-stmt-cta:hover { transform: scale(1.04) translateY(-2px); }
        .tsf-stmt-cta:active { transform: scale(0.97); }

      `}</style>

      <section className="border-t border-white/[0.07]" style={{ '--accent': accentColor } as React.CSSProperties}>
        {/* ══════════════════════════════════════
            STICKY SPLIT LAYOUT
        ══════════════════════════════════════ */}
        <div className="lg:grid lg:grid-cols-[45fr_55fr]">
          {/* LEFT — sticky image */}
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen overflow-hidden">
              <div className="absolute inset-0">
                {panels.map((panel, i) =>
                  panel.lftimage?.node?.sourceUrl ? (
                    <Image
                      key={i}
                      src={wpImg(panel.lftimage.node.sourceUrl) ?? panel.lftimage.node.sourceUrl}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="45vw"
                      className={`tsf-img ${i === activeIndex ? 'tsf-img-on' : 'tsf-img-off'}`}
                    />
                  ) : null,
                )}
              </div>
              <div className="tsf-scan" aria-hidden="true" />
              {/* Right-edge fade */}
              <div
                className="absolute inset-y-0 right-0 w-40 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to right, transparent, #080808)',
                }}
                aria-hidden="true"
              />
              {/* Bottom fade */}
              <div
                className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-10"
                style={{
                  background: 'linear-gradient(to top, #080808, transparent)',
                }}
                aria-hidden="true"
              />
              {/* Progress dots */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
                {panels.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Panel ${i + 1}`}
                    onClick={() =>
                      panelRefs.current[i]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }
                    className="tsf-dot"
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
                style={{ fontSize: '88px', color: 'color-mix(in srgb, var(--accent) 13.3%, transparent)' }}
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
                  / {String(panels.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — scrollable panels */}
          <div>
            {panels.map((panel, i) => {
              const items = panel.threincontent ?? []
              const isActive = i === activeIndex
              return (
                <div
                  key={i}
                  ref={(el) => {
                    panelRefs.current[i] = el
                  }}
                  className="min-h-screen flex flex-col justify-center py-24 px-10 lg:px-16 relative border-b border-white/6 last:border-b-0"
                >
                  {/* Ghost number */}
                  <div
                    className="absolute top-0 right-0 font-black select-none pointer-events-none leading-[0.85] overflow-hidden"
                    style={{
                      fontSize: 'clamp(120px,20vw,240px)',
                      color: 'color-mix(in srgb, var(--accent) 2.7%, transparent)',
                    }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  {/* Mobile image */}
                  {panel.lftimage?.node?.sourceUrl && (
                    <div className="lg:hidden mb-10 rounded-[24px] overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
                      <Image src={wpImg(panel.lftimage.node.sourceUrl) ?? panel.lftimage.node.sourceUrl} alt="" fill sizes="100vw" className="object-cover" />
                    </div>
                  )}
                  <div className="relative z-10 max-w-[560px]">
                    {/* Panel index + accent bar */}
                    <div className="flex items-end gap-5 mb-10">
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
                        / {String(panels.length).padStart(2, '0')}
                      </span>
                      <div
                        className="h-[2px] flex-1 overflow-hidden rounded-full ml-2 mb-3"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        {isActive && <div className="tsf-bar h-full w-full rounded-full" style={{ background: 'var(--accent)' }} />}
                      </div>
                    </div>

                    {items.map((item, j) => (
                      <div
                        key={j}
                        className={`tsf-item ${j > 0 ? 'mt-12 pt-12 border-t border-white/6' : ''} ${isActive ? 'tsf-item-on' : 'tsf-item-off'}`}
                        style={{
                          transitionDelay: isActive ? `${j * 0.18}s` : '0s',
                        }}
                      >
                        {item.threintitle && (
                          <div
                            className="font-black tracking-[-0.03em] leading-[1.02] mb-6 text-white"
                            style={{ fontSize: 'clamp(30px,4.3vw,60px)' }}
                          >
                            {parse(decodeHtml(item.threintitle))}
                          </div>
                        )}
                        {item.threincontent && (
                          <div
                            className="leading-[1.85] mb-7"
                            style={{
                              fontSize: '18px',
                              color: 'rgba(255,255,255,0.55)',
                            }}
                          >
                            {parse(decodeHtml(item.threincontent))}
                          </div>
                        )}
                        {item.tagList && (
                          <div className="flex flex-wrap gap-2">
                            {item.tagList.split(',').map((tag, ti) => (
                              <span
                                key={ti}
                                className="tsf-tag"
                                style={{
                                  background: 'color-mix(in srgb, var(--accent) 6.25%, transparent)',
                                  color: 'var(--accent)',
                                  border: '1px solid color-mix(in srgb, var(--accent) 16.5%, transparent)',
                                }}
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════
            STATEMENT — cream section
        ══════════════════════════════════════ */}
        {threbottomText && (
          <>
            <div ref={stmtRef} className="tsf-stmt">
              <div className="tsf-stmt__grid" aria-hidden="true" />
              <GlowOrb
                size={800}
                height={600}
                color="color-mix(in srgb, var(--accent) 12.5%, transparent)"
                shape="ellipse"
                blur={80}
                animation="none"
                className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.35]"
              />

              <div className="relative z-10 max-w-[1400px] mx-auto">
                {/* Eyebrow lines */}
                {stmtVisible && (
                  <div className="flex items-center gap-6 mb-10">
                    <div
                      className="tsf-dline h-[1.5px] w-20 rounded-full"
                      style={{
                        background: 'linear-gradient(to right, transparent, var(--accent))',
                      }}
                    />
                    <span className="font-bold tracking-[0.4em] uppercase" style={{ fontSize: '12px', color: 'var(--accent)' }}>
                      Our Promise
                    </span>
                    <div
                      className="tsf-dline tsf-dline-r h-[1.5px] w-20 rounded-full"
                      style={{
                        background: 'linear-gradient(to left, transparent, var(--accent))',
                      }}
                    />
                  </div>
                )}

                {/* Giant statement — always visible */}
                <p className="font-black leading-none tracking-tighter" style={{ fontSize: 'clamp(44px,9vw,128px)', color: '#111' }}>
                  {words.map((word, wi) => {
                    const clean = word.toLowerCase().replace(/[.,!?;:]/g, '')
                    const isGold = clean === 'you' || (clean === 'for' && wi === words.length - 2)
                    return (
                      <span
                        key={wi}
                        className={`tsf-word ${stmtVisible ? 'tsf-word--go' : ''}`}
                        style={{
                          animationDelay: stmtVisible ? `${wi * 0.065}s` : undefined,
                          color: isGold ? 'var(--accent)' : '#111',
                          marginRight: '0.22em',
                          display: 'inline-block',
                        }}
                      >
                        {word}
                      </span>
                    )
                  })}
                </p>

                {/* Subtitle */}
                <p
                  className="mt-8 font-medium"
                  style={{
                    fontSize: 'clamp(15px,1.5vw,19px)',
                    color: 'rgba(0,0,0,0.45)',
                    animation: stmtVisible
                      ? `tsf-word-rise 0.7s cubic-bezier(0.16,1,0.3,1) ${words.length * 0.065 + 0.15}s both`
                      : undefined,
                  }}
                >
                  Senior engineers. Direct communication. Zero outsourcing.
                </p>

                {/* CTA */}
                {threbottomLinkText && threbottomButtonLink && (
                  <div
                    className="mt-14"
                    style={{
                      animation: stmtVisible
                        ? `tsf-word-rise 0.7s cubic-bezier(0.16,1,0.3,1) ${words.length * 0.065 + 0.35}s both`
                        : undefined,
                    }}
                  >
                    <a
                      href={threbottomButtonLink}
                      className="tsf-stmt-cta inline-flex items-center gap-3 font-bold uppercase tracking-[0.08em] rounded-full"
                      style={{
                        background: '#111',
                        color: '#F5F0E8',
                        padding: '18px 44px',
                        fontSize: '14px',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
                      }}
                    >
                      {threbottomLinkText}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3 8h10M9.5 4L13 8l-3.5 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  )
}
