import React from 'react'
import type { Metadata } from 'next'
import { client } from '@/lib/apollo-client'
import { GET_CONTACT_PAGE, GET_THEME_SETTINGS } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { FadeIn } from '@/components/FadeIn'
import { WannaChatSection } from '@/components/WannaChatSection'
import { GlowOrb, Eyebrow } from '@/components/ui'
import type { GetContactPageData, GetThemeSettingsData, ContactFields, ThemeOptions } from '@/lib/graphql-types'

const CONTACT_PAGE_QUERY: TypedDocumentNode<GetContactPageData> = gql`
  ${GET_CONTACT_PAGE}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function getContactData(): Promise<{ title: string | null; fields: ContactFields | null }> {
  try {
    const { data } = await client.query({ query: CONTACT_PAGE_QUERY })
    return {
      title: data?.page?.title ?? null,
      fields: data?.page?.template?.contactFields ?? null,
    }
  } catch {
    return { title: null, fields: null }
  }
}

async function getThemeSettings(): Promise<ThemeOptions | null> {
  try {
    const { data } = await client.query({ query: THEME_SETTINGS_QUERY })
    return data?.themeSetting?.themeOptions ?? null
  } catch {
    return null
  }
}

export const metadata: Metadata = {
  title: 'Contact Us | Triolla',
  description: 'Get in touch with Triolla — product design & development for tech, gaming, medical, cyber, IoT and SaaS.',
}

export default async function ContactUsPage() {
  const [{ title, fields }, ts] = await Promise.all([getContactData(), getThemeSettings()])

  const contactItems = [
    ts?.cEmailLabel && ts?.cEmailAddress
      ? {
          label: ts.cEmailLabel,
          value: ts.cEmailAddress,
          href: `mailto:${ts.cEmailAddress}`,
        }
      : null,
    ts?.cTlvLabel && ts?.cTlvNumber
      ? {
          label: ts.cTlvLabel,
          value: ts.cTlvNumber,
          href: `tel:${ts.cTlvNumber.replace(/[^+\d]/g, '')}`,
        }
      : null,
    ts?.cNyLabel && ts?.cNyNumber
      ? {
          label: ts.cNyLabel,
          value: ts.cNyNumber,
          href: `tel:${ts.cNyNumber.replace(/[^+\d]/g, '')}`,
        }
      : null,
    ts?.cAddressLabel && ts?.cAddress ? { label: ts.cAddressLabel, value: ts.cAddress, href: undefined } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null)

  // Two-office detail straight from the Contact page ACF group.
  const offices = [
    fields?.addressTitle || fields?.address
      ? {
          title: fields?.addressTitle ?? null,
          address: fields?.address ?? null,
          phone: fields?.contactNumber ?? null,
        }
      : null,
    fields?.addressTitleCopy || fields?.addressCopy
      ? {
          title: fields?.addressTitleCopy ?? null,
          address: fields?.addressCopy ?? null,
          phone: fields?.contactNumberCopy ?? null,
        }
      : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null)

  const heroTitle = stripHtml(title ?? '')
  const heroLead = stripHtml(fields?.contactTitle ?? '')

  return (
    <main className="bg-[#080808] text-white overflow-x-clip relative pb-32">
      {/* ══ HERO ══ */}
      <section className="cu-hero">
        <GlowOrb
          size={900}
          height={480}
          shape="ellipse"
          fade="70%"
          blur={60}
          color="rgba(250,204,21,0.1)"
          className="top-[-10%] left-1/2 -translate-x-1/2 z-0"
        />
        <div className="cu-hero__grid" aria-hidden="true" />

        <div className="cu-hero__content">
          <FadeIn yOffset={20} duration={0.7}>
            <Eyebrow ornament="dot" style={{ '--eb-weight': '600', '--eb-mb': '26px' } as React.CSSProperties}>
              Contact
            </Eyebrow>
          </FadeIn>

          {heroTitle && (
            <FadeIn yOffset={50} delay={0.08} duration={0.9}>
              <h1 className="cu-hero__title">{heroTitle}</h1>
            </FadeIn>
          )}

          {heroLead && (
            <FadeIn yOffset={20} delay={0.18}>
              <p className="cu-hero__lead">{heroLead}</p>
            </FadeIn>
          )}

          {offices.length > 0 && (
            <FadeIn yOffset={24} delay={0.28}>
              <div className="cu-offices">
                {offices.map((o, i) => (
                  <div key={i} className="cu-office">
                    {o.title && <span className="cu-office__title">{o.title}</span>}
                    {o.address && <span className="cu-office__addr">{o.address}</span>}
                    {o.phone && (
                      <a href={`tel:${o.phone.replace(/[^+\d]/g, '')}`} className="cu-office__phone">
                        {o.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ══ FORM ══ */}
      <WannaChatSection
        contactItems={contactItems}
        leftHeading={
          ts?.cLeftHeading
            ? ts.cLeftHeading
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .trim()
            : null
        }
        formHeading={ts?.cContactFormHeading ? stripHtml(ts.cContactFormHeading) : null}
        submitLabel={ts?.cButton ?? null}
        callUsLabel={ts?.cCallUsLabel ?? null}
        fallbackEmail={ts?.cEmailAddress ?? null}
      />

      <style>{`
        .cu-hero {
          position: relative; overflow: hidden;
          padding: 160px 24px 40px;
          display: flex; justify-content: center;
        }
        .cu-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 40%, black 0%, transparent 100%);
        }
        .cu-hero__content {
          position: relative; z-index: 1;
          max-width: 900px; width: 100%; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .cu-hero__title {
          font-size: clamp(2.6rem, 9vw, 6rem);
          font-weight: 900; letter-spacing: -0.045em; line-height: 0.96;
          background: linear-gradient(135deg, #fff 40%, #facc15 55%, #fff 70%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cu-hero__lead {
          margin-top: 26px; max-width: 600px;
          font-size: clamp(1.05rem, 2vw, 1.4rem); font-weight: 300;
          color: rgba(255,255,255,0.5); line-height: 1.6;
        }
        .cu-offices {
          margin-top: 48px; display: flex; flex-wrap: wrap; justify-content: center;
          gap: 16px;
        }
        .cu-office {
          display: flex; flex-direction: column; gap: 5px; text-align: left;
          padding: 22px 26px; min-width: 240px;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 18px;
          background: rgba(255,255,255,0.02);
        }
        .cu-office__title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.24em;
          text-transform: uppercase; color: #facc15;
        }
        .cu-office__addr { font-size: 14.5px; color: rgba(255,255,255,0.7); }
        .cu-office__phone {
          font-size: 14.5px; color: rgba(255,255,255,0.5); transition: color 0.2s;
        }
        .cu-office__phone:hover { color: #facc15; }

        @media (max-width: 768px) {
          .cu-hero { padding: 120px 20px 24px; }
          .cu-office { min-width: 0; width: 100%; }
        }
      `}</style>
    </main>
  )
}
