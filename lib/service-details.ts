import { client } from '@/lib/apollo-client'
import { GET_SERVICES_PAGE, buildServiceDetailsQuery } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import type { ServiceDetail } from '@/components/ServiceDetailModal'
import type { GetServicesPageData, GetServiceDetailsData, ServicesPageFields } from '@/lib/graphql-types'

const SERVICES_PAGE_QUERY: TypedDocumentNode<GetServicesPageData> = gql`
  ${GET_SERVICES_PAGE}
`

/** Turn a WP link ("https://triolla.io/services/x/" or "/services/x") into a
 *  URI path ("services/x") suitable for `page(idType: URI)` — and for matching
 *  one link against another. Returns null if there's nothing usable. */
export function deriveUri(link: string): string | null {
  if (!link) return null
  let path = link
  try {
    path = new URL(link).pathname
  } catch {
    // already a relative path
  }
  const trimmed = path.replace(/^\/+|\/+$/g, '')
  return trimmed || null
}

/** Prefetch the detail pages for a list of `{ label, link }` menu items in one
 *  batched request and merge them onto the items by index. Any page that fails
 *  to resolve keeps `hasDetail: false`, so callers render it as a plain link —
 *  never a modal with fabricated content. The whole fetch is wrapped so a
 *  backend failure degrades every item to a plain link rather than throwing. */
export async function enrichServiceDetails(menu: Array<{ label?: string | null; link?: string | null }>): Promise<ServiceDetail[]> {
  const enriched: ServiceDetail[] = (menu ?? []).map((item) => ({
    label: item?.label ?? null,
    link: item?.link ?? null,
    title: null,
    image: null,
    altText: '',
    boldText: null,
    content: null,
    hasDetail: false,
  }))

  const queryable = enriched
    .map((e, index) => ({ e, index, uri: deriveUri(e.link ?? '') }))
    .filter((q): q is { e: ServiceDetail; index: number; uri: string } => !!q.uri)

  if (queryable.length === 0) return enriched

  try {
    const detailQuery: TypedDocumentNode<GetServiceDetailsData> = gql`
      ${buildServiceDetailsQuery(queryable.map((q) => q.uri))}
    `
    const { data } = await client.query({ query: detailQuery })
    queryable.forEach((q, i) => {
      const page = data?.[`s${i}`]
      if (!page) return // unresolved → stays a plain link
      const e = enriched[q.index]
      e.title = page.title ?? null
      e.image = page.featuredImage?.node?.sourceUrl ?? null
      e.altText = page.featuredImage?.node?.altText ?? ''
      e.boldText = page.template?.postFields?.topBoldText ?? null
      e.content = page.content ?? null
      e.hasDetail = true
    })
  } catch {
    return enriched // backend failure → all plain links
  }

  return enriched
}

/** Fetch the Services page ACF and return every service across Product,
 *  Branding and Engineering as a single flat, enriched `ServiceDetail[]`.
 *  This is the same set rendered as modals on `/services`, so consumers like
 *  the footer can match their own links against it and open the same modal
 *  instead of navigating to a page that no longer exists. Pass the locale's
 *  services page URI (e.g. `PAGE_URI.services[locale]`) — it's required by the
 *  query. On any failure it returns `[]`, so the footer keeps its plain links. */
export async function getAllServices(uri: string): Promise<ServiceDetail[]> {
  let sp: ServicesPageFields = {} as ServicesPageFields
  try {
    const { data } = await client.query({ query: SERVICES_PAGE_QUERY, variables: { uri } })
    sp = data?.page?.template?.servicePage ?? ({} as ServicesPageFields)
  } catch {
    return []
  }

  const menu = [
    ...(sp.prodrightMenu ?? []).map((i) => ({
      label: i?.prodmtitle ?? null,
      link: i?.prodmlink ?? null,
    })),
    ...(sp.brandrightMenu ?? []).map((i) => ({
      label: i?.rightmetitle ?? null,
      link: i?.rightmelink ?? null,
    })),
    { label: sp.devrightMenuToptitle ?? null, link: sp.devrightMenuToptitleLink ?? null },
    { label: sp.devrightMenuBottitle ?? null, link: sp.devrightMenuBottitleLink ?? null },
    { label: sp.rightMenuThreeTitle ?? null, link: sp.rightMenuThreeTitleLink ?? null },
  ]

  return enrichServiceDetails(menu)
}
