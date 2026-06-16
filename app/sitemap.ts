import type { MetadataRoute } from 'next'
import { gql } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_POST_SLUGS } from '@/lib/queries'
import { SITE_URL } from '@/lib/site'

// Dynamic sitemap covering both locales (EN at the clean root, HE under /he/).
// Static marketing routes are listed explicitly because they map 1:1 to known
// Next.js routes; blog posts are pulled live from WordPress. Every entry
// declares hreflang `alternates.languages` so engines and LLM crawlers can pair
// the EN ↔ HE versions — the canonical HE blog slug comes from WPML, not a
// naive /he prefix. Revalidate hourly so new posts surface without a rebuild.
export const revalidate = 3600

// Canonical EN route → its HE counterpart. These are the headless Next.js
// routes that are known to exist (HE pages are served at the same path under
// /he/ via the [locale] segment). Portfolio/service-detail pages use bespoke
// routing and are intentionally omitted here to avoid emitting URLs that
// redirect; add them once their canonical paths are settled.
const STATIC_ROUTES: { en: string; he: string; priority: number }[] = [
  { en: '/', he: '/he', priority: 1.0 },
  { en: '/about-us', he: '/he/about-us', priority: 0.8 },
  { en: '/services', he: '/he/services', priority: 0.9 },
  { en: '/technology', he: '/he/technology', priority: 0.8 },
  { en: '/branding-studio', he: '/he/branding-studio', priority: 0.8 },
  { en: '/careers', he: '/he/careers', priority: 0.7 },
  { en: '/contact-us', he: '/he/contact-us', priority: 0.7 },
  { en: '/blog', he: '/he/blog', priority: 0.8 },
  { en: '/privacy-policy', he: '/he/privacy-policy', priority: 0.3 },
  { en: '/terms-of-use', he: '/he/terms-of-use', priority: 0.3 },
  { en: '/accessibility-statement', he: '/he/accessibility-statement', priority: 0.3 },
]

const POST_SLUGS_QUERY = gql`
  ${GET_POST_SLUGS}
`

interface PostSlugNode {
  uri: string | null
  translations?: { href: string | null; locale: string | null }[] | null
}

/** Turn a WP href/uri into a clean, absolute-path-only Next.js route. */
function toPath(value: string | null): string | null {
  if (!value) return null
  const path = value.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '')
  return path.startsWith('/') ? path : `/${path}`
}

async function getPostEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data } = await client.query<{ posts?: { nodes?: PostSlugNode[] } }>({
      query: POST_SLUGS_QUERY,
    })
    const nodes: PostSlugNode[] = data?.posts?.nodes ?? []

    return nodes.flatMap((node) => {
      const self = toPath(node.uri)
      if (!self) return []

      const trans = node.translations ?? []
      const enHref = trans.find((t) => t.locale?.startsWith('en'))?.href
      const heHref = trans.find((t) => t.locale?.startsWith('he'))?.href
      // Fall back to the node's own uri for its language when no translation row.
      const enPath = toPath(enHref ?? null) ?? (self.startsWith('/he/') ? null : self)
      const hePath = toPath(heHref ?? null) ?? (self.startsWith('/he/') ? self : null)

      const languages: Record<string, string> = {}
      if (enPath) languages.en = `${SITE_URL}${enPath}`
      if (hePath) languages.he = `${SITE_URL}${hePath}`

      return [{
        url: `${SITE_URL}${self}`,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: Object.keys(languages).length ? { languages } : undefined,
      }]
    })
  } catch {
    // Hide the dynamic section on backend failure rather than break the sitemap.
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.en}`,
    changeFrequency: 'weekly',
    priority: r.priority,
    alternates: {
      languages: {
        en: `${SITE_URL}${r.en}`,
        he: `${SITE_URL}${r.he}`,
      },
    },
  }))

  const postEntries = await getPostEntries()
  return [...staticEntries, ...postEntries]
}
