import React from 'react'
import Image from 'next/image'
import parse from 'html-react-parser'
import { GlowOrb, Eyebrow, Marquee, Button } from '@/components/ui'
import { wpImg } from '@/lib/images'
import { type Locale, localizeHref } from '@/lib/i18n'

function decodeHtml(html: string): string {
  return (html ?? '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
}

interface ClientsSectionProps {
  logos: { url: string; alt: string }[]
  heading?: string | null
  bigText?: string | null
  ctaText?: string | null
  accentColor?: string
  locale?: Locale
}

export function ClientsSection({ logos, heading, bigText, ctaText, accentColor = '#facc15', locale = 'en' }: ClientsSectionProps) {
  if (logos.length === 0) return null

  const ac = accentColor

  return (
    <section className="cs-clients" style={{ '--accent': ac } as React.CSSProperties}>
      <style>{`
        .cs-clients {
          position: relative;
          padding: 72px 0 88px;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .cs-clients__head {
          text-align: center;
          margin-bottom: clamp(36px,4.5vw,64px);
          position: relative; z-index: 10;
          padding: 0 24px;
        }
        .cs-clients__title {
          font-size: clamp(2rem, 6vw, 5.5rem);
          font-weight: 900; letter-spacing: -0.03em;
          line-height: 0.95; max-width: 800px;
          margin: 0 auto; color: white;
        }
        .cs-logo-card {
          flex-shrink: 0;
          width: clamp(120px, 18vw, 176px);
          height: clamp(76px, 11.5vw, 112px);
          border-radius: clamp(16px, 3vw, 24px);
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(10px, 1.5vw, 14px);
          position: relative;
          transition: border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease;
          overflow: hidden;
          backdrop-filter: blur(2px);
        }
        /* Inset radial glow — revealed on hover via pseudo-element, zero overflow */
        .cs-logo-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .cs-logo-card:hover {
          border-color: color-mix(in srgb, var(--accent) 28%, transparent);
          background: color-mix(in srgb, var(--accent) 3.5%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 16%, transparent);
        }
        .cs-logo-card:hover::after { opacity: 1; }
        .cs-logo-img {
          width: 100%; height: 100%;
          object-fit: contain; object-position: center;
          border-radius: 10px;
          transition: opacity 0.35s ease;
        }
        .cs-logo-card:hover .cs-logo-img { opacity: 0.9; }
        @media (max-width: 768px) {
          .cs-clients { padding: 32px 0 36px; }
        }
      `}</style>

      <GlowOrb
        size={520}
        blur={110}
        color="color-mix(in srgb, var(--accent) 6.25%, transparent)"
        className="top-1/2 left-[-8%] -translate-y-1/2"
      />
      <GlowOrb
        size={420}
        blur={110}
        color="color-mix(in srgb, var(--accent) 4.7%, transparent)"
        className="top-1/2 right-[-8%] -translate-y-1/2"
      />

      {(heading || bigText) && (
        <div className="cs-clients__head">
          {heading && (
            <Eyebrow
              ornament="line"
              color="var(--accent)"
              style={
                {
                  '--eb-gap': '18px',
                  '--eb-size': '11px',
                  '--eb-line-w': '48px',
                  '--eb-line-bg': 'linear-gradient(to right, transparent, var(--accent))',
                  '--eb-line-opacity': '0.7',
                  '--eb-mb': '20px',
                } as React.CSSProperties
              }
            >
              {heading}
            </Eyebrow>
          )}
          {bigText && <h3 className="cs-clients__title">{parse(decodeHtml(bigText))}</h3>}
        </div>
      )}

      {/* Row 1 — forward */}
      <Marquee
        items={logos}
        repeat={2}
        speed={32}
        direction="left"
        pauseOnHover
        fade
        fadeColor="#080808"
        className="mb-5"
        renderItem={(logo, i) => (
          <div key={i} className="cs-logo-card">
            <Image src={wpImg(logo.url) ?? logo.url} alt={logo.alt || 'Client logo'} fill className="cs-logo-img" sizes="176px" />
          </div>
        )}
      />

      {/* Row 2 — reverse */}
      <Marquee
        items={logos}
        repeat={2}
        speed={26}
        direction="right"
        pauseOnHover
        fade
        fadeColor="#080808"
        renderItem={(logo, i) => (
          <div key={i} className="cs-logo-card">
            <Image src={wpImg(logo.url) ?? logo.url} alt={logo.alt || 'Client logo'} fill className="cs-logo-img" sizes="176px" />
          </div>
        )}
      />

      {ctaText && (
        <div className="text-center mt-12 relative z-10">
          <Button
            variant="primary"
            href={localizeHref('/contact-us', locale)}
            style={{ '--btn-pad': '14px 32px', background: 'var(--accent)' } as React.CSSProperties}
          >
            {ctaText}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8H14M10.5 4L14 8L10.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Button>
        </div>
      )}
    </section>
  )
}
