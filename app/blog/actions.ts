'use server'

import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_BLOG_POSTS, BLOG_PAGE_SIZE } from '@/lib/queries'
import { filterEnglishPosts } from '@/lib/text'
import type { GetBlogPostsData, BlogPostsConnection } from '@/lib/graphql-types'

const BLOG_POSTS_QUERY: TypedDocumentNode<GetBlogPostsData> = gql`
  ${GET_BLOG_POSTS}
`

const EMPTY: BlogPostsConnection = { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] }

export async function loadMorePosts(after: string | null): Promise<BlogPostsConnection> {
  try {
    const { data } = await client.query({
      query: BLOG_POSTS_QUERY,
      variables: { first: BLOG_PAGE_SIZE, after },
      fetchPolicy: 'no-cache',
    })
    const conn = data?.posts ?? EMPTY
    // Paginate on the raw connection (cursor/hasNextPage stay accurate), but
    // render English only — Hebrew nodes are dropped per page until i18n lands.
    return { pageInfo: conn.pageInfo, nodes: filterEnglishPosts(conn.nodes) }
  } catch {
    return EMPTY
  }
}
