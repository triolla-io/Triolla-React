import type { Metadata } from 'next'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { notFound } from 'next/navigation'
import { client } from '@/lib/apollo-client'
import { GET_POST_SLUGS, GET_POST_BY_URI, GET_BLOG_POSTS, GET_THEME_SETTINGS } from '@/lib/queries'
import type {
  GetPostSlugsData,
  GetPostByUriData,
  GetBlogPostsData,
  GetThemeSettingsData,
  SinglePost,
  BlogPostNode,
  ThemeOptions,
} from '@/lib/graphql-types'
import { BlogArticle } from '@/components/BlogArticle'
import { BlogPostCard } from '@/components/BlogPostCard'
import { SectionReveal } from '@/components/SectionReveal'
import { ContactCTA } from '@/components/ContactCTA'
import { stripHtml } from '@/lib/text'
import { isLocale, defaultLocale } from '@/lib/i18n'

const POST_SLUGS_QUERY: TypedDocumentNode<GetPostSlugsData> = gql`
  ${GET_POST_SLUGS}
`
const POST_BY_URI_QUERY: TypedDocumentNode<GetPostByUriData> = gql`
  ${GET_POST_BY_URI}
`
const BLOG_POSTS_QUERY: TypedDocumentNode<GetBlogPostsData> = gql`
  ${GET_BLOG_POSTS}
`
const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

// Only slugs from generateStaticParams resolve; anything else 404s.
export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const { data } = await client.query({ query: POST_SLUGS_QUERY })
    const nodes = data?.posts?.nodes ?? []
    return nodes.flatMap((n) => {
      const slug = (n?.uri ?? '').replace(/^\/?blog\//, '').replace(/^\/+|\/+$/g, '')
      return slug.length > 0 ? [{ slug }] : []
    })
  } catch {
    return []
  }
}

async function getPost(slug: string): Promise<SinglePost | null> {
  try {
    const { data } = await client.query({
      query: POST_BY_URI_QUERY,
      variables: { uri: `/blog/${slug}/` },
    })
    return data?.post ?? null
  } catch {
    return null
  }
}

async function getMorePosts(): Promise<BlogPostNode[]> {
  try {
    const { data } = await client.query({
      query: BLOG_POSTS_QUERY,
      variables: { first: 4, after: null },
    })
    return data?.posts?.nodes ?? []
  } catch {
    return []
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: post?.title ? `${stripHtml(post.title)} | Triolla` : 'Blog | Triolla' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [post, more, ts] = await Promise.all([getPost(slug), getMorePosts(), getThemeSettings()])

  if (!post || (!post.title && !post.content)) notFound()

  const currentUri = post.uri ? post.uri.replace(/^\/+|\/+$/g, '') : null
  const related = more.filter((p) => (p.uri ?? '').replace(/^\/+|\/+$/g, '') !== currentUri).slice(0, 3)

  return (
    <>
      <BlogArticle post={post} locale={loc} />

      {related.length > 0 && (
        <section className="bg-[#080808] text-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
            <div className="border-t border-white/10 pt-16 md:pt-24" />
            <SectionReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {related.map((p) => (
                <BlogPostCard key={p.id} post={p} />
              ))}
            </SectionReveal>
          </div>
        </section>
      )}

      <div className="bg-[#080808]">
        <ContactCTA ts={ts} />
      </div>
    </>
  )
}
