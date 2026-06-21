import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_POST_SLUGS_PAGE } from '@/lib/queries'
import type { GetPostSlugsPageData, PostSlugNode } from '@/lib/graphql-types'

const POST_SLUGS_PAGE_QUERY: TypedDocumentNode<GetPostSlugsPageData> = gql`
  ${GET_POST_SLUGS_PAGE}
`

/**
 * Fetch EVERY published post's slug/uri across all pages.
 *
 * WPGraphQL silently caps `posts(first:)` at 100, so a single query only ever
 * returns the 100 most-recent posts. The footer blog menu links to older posts
 * that fall outside that window; with `dynamicParams = false` on the blog route
 * those links 404'd. Walk the Relay cursor until the connection is exhausted so
 * static params (and the sitemap) cover the entire archive. On any failure the
 * caller gets whatever pages resolved before the error (possibly empty).
 */
export async function fetchAllPostSlugs(): Promise<PostSlugNode[]> {
  const all: PostSlugNode[] = []
  let after: string | null = null
  // Hard ceiling guards against a backend that never reports hasNextPage:false.
  for (let page = 0; page < 100; page++) {
    // Explicit TData generic fixes the return type independently of the args —
    // without it, `after` (reassigned from this query's own result below) feeds
    // a self-referential inference cycle that collapses `data` to `any`.
    const variables: { after: string | null } = { after }
    const { data } = await client.query<GetPostSlugsPageData>({ query: POST_SLUGS_PAGE_QUERY, variables })
    const conn = data?.posts
    if (!conn) break
    all.push(...(conn.nodes ?? []))
    if (!conn.pageInfo?.hasNextPage) break
    after = conn.pageInfo.endCursor ?? null
    if (!after) break
  }
  return all
}
