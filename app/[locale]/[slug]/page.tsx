import type { Metadata } from 'next'
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

/**
 * Derive the route (locale + slug) from a WordPress page URI.
 * WPML serves Hebrew pages under a `/he/` path prefix, so any URI starting
 * with `/he/` is the Hebrew translation; everything else is English.
 *   "/startups-tech/"  → { locale: 'en', slug: 'startups-tech' }
 *   "/he/סייבר/"       → { locale: 'he', slug: 'סייבר' }
 */
function deriveRoute(uri: string | null): { locale: string; slug: string } | null {
  if (!uri) return null
  const trimmed = uri.replace(/^\/+|\/+$/g, '')
  if (trimmed.startsWith('he/')) {
    const slug = trimmed.slice(3)
    return slug.length > 0 ? { locale: 'he', slug } : null
  }
  return trimmed.length > 0 ? { locale: defaultLocale, slug: trimmed } : null
}

/** Hebrew slugs arrive percent-encoded from the route; normalize for comparison. */
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export async function generateStaticParams() {
  try {
    const { data } = await client.query({ query: PORTFOLIO_SLUGS_QUERY })
    const nodes = data?.pages?.nodes ?? []
    return nodes.flatMap((n) => {
      if (n?.template?.__typename !== 'Template_PortfolioPage') return []
      const route = deriveRoute(n.uri)
      return route ? [route] : []
    })
  } catch {
    return []
  }
}

/**
 * Given the current (locale, slug), return the alternate-locale path using
 * the WPML `translations[].href` field on the same node.
 */
async function findAlternatePortfolioPath(locale: string, slug: string): Promise<{ en: string; he: string }> {
  const target = decodeSlug(slug)
  try {
    const { data } = await client.query({ query: PORTFOLIO_SLUGS_QUERY })
    const nodes = data?.pages?.nodes ?? []
    const node = nodes.find((n) => {
      if (n?.template?.__typename !== 'Template_PortfolioPage') return false
      const route = deriveRoute(n.uri)
      return route?.locale === locale && decodeSlug(route.slug) === target
    })
    if (!node) return { en: `/${slug}`, he: `/he/${slug}` }

    const trans = node.translations ?? []
    const enTrans = trans.find((t) => t.locale === 'en_US' || t.locale === 'en')
    const heTrans = trans.find((t) => t.locale === 'he_IL' || t.locale === 'he')

    // Derive path from translation href (strip domain) or current node uri
    const enPath = enTrans?.href
      ? enTrans.href.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '')
      : locale === 'en' ? `/${slug}` : null
    const hePath = heTrans?.href
      ? heTrans.href.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '')
      : locale === 'he' ? `/he/${slug}` : null

    return {
      en: enPath ?? `/${slug}`,
      he: hePath ?? `/he/${slug}`,
    }
  } catch {
    return { en: `/${slug}`, he: `/he/${slug}` }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const paths = await findAlternatePortfolioPath(locale, slug)
  return {
    alternates: {
      languages: { en: paths.en, he: paths.he },
    },
  }
}

/**
 * Resolve a (locale, slug) route to its WordPress databaseId.
 * Fetching by databaseId is the only reliable way to get the Hebrew variant:
 * shared slugs (e.g. "startups-tech" exists in both languages) collide under
 * idType: URI and would otherwise return the English page.
 */
async function resolveDatabaseId(locale: string, slug: string): Promise<number | null> {
  try {
    const target = decodeSlug(slug)
    const { data } = await client.query({ query: PORTFOLIO_SLUGS_QUERY })
    const nodes = data?.pages?.nodes ?? []
    const match = nodes.find((n) => {
      if (n?.template?.__typename !== 'Template_PortfolioPage') return false
      const route = deriveRoute(n.uri)
      return route?.locale === locale && decodeSlug(route.slug) === target
    })
    return match?.databaseId ?? null
  } catch {
    return null
  }
}

async function getPortfolioData(locale: string, slug: string): Promise<PortfolioFields | null> {
  try {
    const id = await resolveDatabaseId(locale, slug)
    if (id == null) return null
    const { data } = await client.query({
      query: PORTFOLIO_PAGE_QUERY,
      variables: { id: String(id), idType: 'DATABASE_ID' },
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
  const { locale, slug } = await params
  const [pf, ts] = await Promise.all([getPortfolioData(locale, slug), getThemeSettings()])

  // Empty/failed fetch, or a page not actually on the portfolio template.
  if (!pf || Object.keys(pf).length === 0) notFound()

  return <PortfolioTemplate pf={pf} ts={ts} locale={locale} />
}
