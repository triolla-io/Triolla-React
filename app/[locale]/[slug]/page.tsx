import { client } from '@/lib/apollo-client'
import { GET_PORTFOLIO_PAGE, GET_PORTFOLIO_SLUGS, GET_THEME_SETTINGS } from '@/lib/queries'
import { defaultLocale } from '@/lib/i18n'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { notFound } from 'next/navigation'
import { PortfolioTemplate } from '@/components/PortfolioTemplate'
import type { GetPortfolioSlugsData, GetPortfolioPageData, GetThemeSettingsData, PortfolioFields, ThemeOptions } from '@/lib/graphql-types'

const PORTFOLIO_SLUGS_QUERY: TypedDocumentNode<GetPortfolioSlugsData> = gql`
  ${GET_PORTFOLIO_SLUGS}
`

const PORTFOLIO_PAGE_QUERY: TypedDocumentNode<GetPortfolioPageData> = gql`
  ${GET_PORTFOLIO_PAGE}
`

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

// Only slugs returned by generateStaticParams resolve here; any other slug 404s.
// Static route folders (about-us, services, technology) take Next.js precedence
// over this dynamic segment, so they are never reached by [slug].
export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const { data } = await client.query({ query: PORTFOLIO_SLUGS_QUERY })
    const nodes = data?.pages?.nodes ?? []

    const params: { locale: string; slug: string }[] = []

    nodes.forEach((n: { uri?: string | null; template?: { __typename: string } | null }) => {
      if (n?.template?.__typename !== 'Template_PortfolioPage') return
      // Strip leading/trailing slashes → "startups-tech" or "he/startups-tech"
      const uri = (n.uri ?? '').replace(/^\/+|\/+$/g, '')
      if (!uri) return

      // Hebrew pages have URI like "he/startups-tech" or "he/אפליקציות-מובייל"
      if (uri.startsWith('he/')) {
        const slug = uri.slice(3) // remove "he/" prefix
        if (slug) params.push({ locale: 'he', slug })
      } else {
        params.push({ locale: defaultLocale, slug: uri })
      }
    })

    return params
  } catch {
    return []
  }
}

// Reconstruct the WordPress URI from locale + slug
function buildUri(slug: string, locale: string): string {
  return locale === 'he' ? `he/${slug}` : slug
}

async function getPortfolioData(slug: string, locale: string): Promise<PortfolioFields | null> {
  try {
    const { data } = await client.query({
      query: PORTFOLIO_PAGE_QUERY,
      variables: { uri: buildUri(slug, locale) },
    })
    return data?.page?.template?.portfolioFields ?? null
  } catch {
    return null
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

export default async function PortfolioSlugPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug, locale } = await params
  const [pf, ts] = await Promise.all([getPortfolioData(slug, locale), getThemeSettings()])

  // Empty/failed fetch, or a page not actually on the portfolio template.
  if (!pf || Object.keys(pf).length === 0) notFound()

  return <PortfolioTemplate pf={pf} ts={ts} locale={locale} />
}
