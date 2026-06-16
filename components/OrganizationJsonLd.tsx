import { gql } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_THEME_SETTINGS } from '@/lib/queries'
import { SITE_URL } from '@/lib/site'
import { JsonLd } from './JsonLd'

// Site-wide Organization + WebSite structured data, rendered once in the root
// layout. Social profiles, logo and contact details come from the WordPress
// themeSetting group — never hardcoded. Fields that WP doesn't return are
// omitted rather than faked, per the project's "render null on absence" rule.
const THEME_SETTINGS_QUERY = gql`
  ${GET_THEME_SETTINGS}
`

const WEBSITE_JSON_LD: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Triolla',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: ['en', 'he'],
}

// Only the subset of themeOptions consumed here; all optional since WP may
// return null for any field.
interface ImageNode {
  node?: { sourceUrl?: string | null } | null
}
interface OrgThemeOptions {
  linkedinLink?: string | null
  facebookLink?: string | null
  instagramLink?: string | null
  tiktokLink?: string | null
  siteLogo?: ImageNode | null
  footerLogo?: ImageNode | null
  emailAddress?: string | null
  cEmailAddress?: string | null
}

export async function OrganizationJsonLd() {
  let opt: OrgThemeOptions = {}
  try {
    const { data } = await client.query<{
      themeSetting?: { themeOptions?: OrgThemeOptions }
    }>({ query: THEME_SETTINGS_QUERY })
    opt = data?.themeSetting?.themeOptions ?? {}
  } catch {
    opt = {}
  }

  const sameAs = [
    opt.linkedinLink,
    opt.facebookLink,
    opt.instagramLink,
    opt.tiktokLink,
  ].filter((v): v is string => typeof v === 'string' && v.length > 0)

  // WP sourceUrl is already an absolute https URL — JSON-LD requires absolute.
  const logoUrl: string | null =
    opt.siteLogo?.node?.sourceUrl ?? opt.footerLogo?.node?.sourceUrl ?? null
  const logo = logoUrl && /^https?:\/\//.test(logoUrl) ? logoUrl : null
  const email: string | null = opt.emailAddress ?? opt.cEmailAddress ?? null

  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Triolla',
    url: SITE_URL,
    ...(logo ? { logo } : {}),
    ...(email ? { email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }

  return <JsonLd data={[organization, WEBSITE_JSON_LD]} />
}
