import React from 'react'
import { wpImg } from '@/lib/images'
import { Eyebrow, Button } from '@/components/ui'
import { FadeIn } from '@/components/FadeIn'
import { type Locale, localizeHref } from '@/lib/i18n'

export interface ServiceSectionGroup {
  /** Optional column heading (e.g. "Front End Dev"). Omit for a plain list. */
  title?: string | null
  items: string[]
}

export interface ServiceSectionItem {
  /** Editorial index, e.g. "01". */
  number: string
  title: string
  description?: string | null
  image?: string | null
  groups: ServiceSectionGroup[]
}

interface ServiceSectionsProps {
  cards: ServiceSectionItem[]
  /** Small label above each service title (e.g. "Capabilities"). */
  eyebrow?: string
  ctaLabel?: string
  locale?: Locale
}

/**
 * Each service is its own full stacked section: centered eyebrow + oversized
 * title + description, then a two-zone body — a framed visual on one side and
 * the sub-services split into named columns with a CTA on the other. Direction
 * alternates per service for rhythm (desktop only). Mirrors the Outcrowd
 * services layout, kept on Triolla's yellow accent.
 */
export function ServiceSections({ cards, eyebrow = 'Capabilities', ctaLabel = 'View details', locale = 'en' }: ServiceSectionsProps) {
  if (!cards.length) return null

  const href = localizeHref('/contact-us', locale)

  return (
    <div className="svc-svcs">
      {cards.map((card, i) => (
        <section key={i} className={`svc-svc${i % 2 === 1 ? ' svc-svc--rev' : ''}`}>
          <FadeIn className="svc-svc__head" yOffset={24}>
            <Eyebrow
              align="center"
              color="rgba(255,255,255,0.6)"
              style={{ '--eb-size': '13px', '--eb-spacing': '0.04em', '--eb-mb': '18px' } as React.CSSProperties}
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="svc-svc__title">{card.title}</h2>
            {card.description && <p className="svc-svc__desc">{card.description}</p>}
          </FadeIn>

          <div className="svc-svc__body">
            <FadeIn className="svc-svc__media" yOffset={36} duration={0.8}>
              <div className="svc-svc__media-grid" aria-hidden="true" />
              {wpImg(card.image) && (
                <div className="svc-svc__media-inner">
                  <img src={wpImg(card.image) ?? ''} alt="" />
                </div>
              )}
            </FadeIn>

            <FadeIn className="svc-svc__detail" yOffset={28} delay={0.12}>
              <div className="svc-svc__groups">
                {card.groups.map((group, gi) => (
                  <div key={gi} className="svc-grp">
                    {group.title && <h3 className="svc-grp__title">{group.title}</h3>}
                    <ul className="svc-grp__list">
                      {group.items.map((item, ii) => (
                        <li key={ii}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Button href={href} variant="primary" className="svc-svc__cta" style={{ '--btn-pad': '15px 30px' } as React.CSSProperties}>
                {ctaLabel}
              </Button>
            </FadeIn>
          </div>
        </section>
      ))}

      <style>{`
        .svc-svc { padding: clamp(56px, 9vw, 120px) 32px; }
        .svc-svc__head { text-align: center; max-width: 920px; margin: 0 auto clamp(40px, 5vw, 76px); }
        .svc-svc__title {
          font-size: clamp(3.2rem, 12vw, 9rem); font-weight: 500;
          letter-spacing: -0.04em; line-height: 0.92; color: #fff;
        }
        .svc-svc__desc {
          font-size: clamp(1rem, 1.5vw, 1.3rem); color: rgba(255,255,255,0.42);
          line-height: 1.5; max-width: 580px; margin: clamp(18px, 2vw, 26px) auto 0;
        }

        .svc-svc__body {
          display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(32px, 5vw, 80px); align-items: center;
          max-width: 1300px; margin: 0 auto;
        }
        .svc-svc--rev .svc-svc__media { order: 2; }

        /* ── Visual panel ── */
        .svc-svc__media {
          position: relative; border-radius: 30px; overflow: hidden;
          background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06);
          aspect-ratio: 4 / 3; padding: clamp(20px, 3vw, 40px);
          display: flex; align-items: center; justify-content: center;
        }
        .svc-svc__media-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%);
        }
        .svc-svc__media-inner {
          position: relative; width: 100%; height: 100%;
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.55);
        }
        .svc-svc__media-inner img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(.23,1,.32,1);
        }
        .svc-svc__media:hover .svc-svc__media-inner img { transform: scale(1.04); }

        /* ── Sub-service columns ── */
        .svc-svc__groups {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(28px, 3vw, 52px) clamp(28px, 4vw, 56px);
          margin-bottom: clamp(32px, 4vw, 44px);
        }
        .svc-grp__title {
          font-size: 0.92rem; font-weight: 500; color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }
        .svc-grp__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 15px; }
        .svc-grp__list li {
          position: relative; padding-left: 22px;
          font-size: clamp(1rem, 1.2vw, 1.1rem); font-weight: 500; color: #fff; line-height: 1.2;
        }
        .svc-grp__list li::before {
          content: ''; position: absolute; left: 0; top: 0.42em;
          width: 6px; height: 6px; border-radius: 50%; background: #facc15;
        }
        .svc-svc__cta { display: inline-flex; }

        @media (max-width: 900px) {
          .svc-svc__body { grid-template-columns: 1fr; gap: 32px; }
          /* Always show the visual first on mobile, regardless of alternation */
          .svc-svc--rev .svc-svc__media { order: 0; }
        }
        @media (max-width: 768px) {
          .svc-svc { padding: 44px 18px; }
          .svc-svc__head { margin-bottom: 28px; }
          .svc-svc__title { font-size: clamp(2.8rem, 18vw, 4.5rem); }
          .svc-svc__media { border-radius: 22px; padding: 14px; aspect-ratio: 4 / 3; }
          .svc-svc__media-inner { border-radius: 14px; }
          .svc-svc__groups { gap: 26px 24px; margin-bottom: 30px; }
          .svc-svc__cta { width: 100%; justify-content: center; }
        }
        @media (max-width: 420px) {
          .svc-svc__groups { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
