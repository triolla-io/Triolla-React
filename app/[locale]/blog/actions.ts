'use server'

import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_BLOG_POSTS, BLOG_PAGE_SIZE } from '@/lib/queries'
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
    return data?.posts ?? EMPTY
  } catch {
    return EMPTY
  }
}
