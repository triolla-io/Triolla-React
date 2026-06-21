import type { Metadata } from 'next'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { notFound } from 'next/navigation'
import { client } from '@/lib/apollo-client'
import { GET_POST_BY_URI, GET_BLOG_POSTS, GET_THEME_SETTINGS } from '@/lib/queries'
import { fetchAllPostSlugs } from '@/lib/posts'
import type {
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
import { JsonLd } from '@/components/JsonLd'
import { stripHtml } from '@/lib/text'
import { isLocale, defaultLocale } from '@/lib/i18n'
import { blogPostingSchema, breadcrumbSchema } from '@/lib/jsonld'

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

/**
 * Derive the route (locale + slug) from a WordPress post URI.
 * WPML serves Hebrew posts under `/he/blog/<slug>/`; English under `/blog/<slug>/`.
 */
function derivePostRoute(uri: string | null): { locale: string; slug: string } | null {
  if (!uri) return null
  const trimmed = uri.replace(/^\/+|\/+$/g, '')
  if (trimmed.startsWith('he/blog/')) {
    const slug = trimmed.slice('he/blog/'.length)
    return slug.length > 0 ? { locale: 'he', slug } : null
  }
  if (trimmed.startsWith('blog/')) {
    const slug = trimmed.slice('blog/'.length)
    return slug.length > 0 ? { locale: defaultLocale, slug } : null
  }
  return null
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
    const nodes = await fetchAllPostSlugs()
    return nodes.flatMap((n) => {
      const route = derivePostRoute(n?.uri ?? null)
      return route ? [route] : []
    })
  } catch {
    return []
  }
}

/**
 * Resolve a (locale, slug) route to its WordPress databaseId, then fetch the
 * post by databaseId. Fetching by databaseId is the only reliable way to get
 * the Hebrew variant: `/he/blog/...` URIs don't resolve via idType: URI, and
 * shared slugs collide with their English counterpart.
 */
async function getPost(locale: string, slug: string): Promise<SinglePost | null> {
  try {
    const target = decodeSlug(slug)
    const nodes = await fetchAllPostSlugs()
    const match = nodes.find((n) => {
      const route = derivePostRoute(n?.uri ?? null)
      return route?.locale === locale && decodeSlug(route.slug) === target
    })
    if (match?.databaseId == null) return null

    const { data } = await client.query({
      query: POST_BY_URI_QUERY,
      variables: { id: String(match.databaseId), idType: 'DATABASE_ID' },
    })
    return data?.post ?? null
  } catch {
    return null
  }
}

async function getMorePosts(language: string): Promise<BlogPostNode[]> {
  try {
    const { data } = await client.query({
      query: BLOG_POSTS_QUERY,
      variables: { first: 4, after: null, language },
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

async function findAlternateBlogPath(locale: string, slug: string): Promise<{ en: string; he: string }> {
  const target = decodeSlug(slug)
  try {
    const nodes = await fetchAllPostSlugs()
    const node = nodes.find((n) => {
      const route = derivePostRoute(n?.uri ?? null)
      return route?.locale === locale && decodeSlug(route.slug) === target
    })
    if (!node) return { en: `/blog/${slug}`, he: `/he/blog/${slug}` }

    const trans = node.translations ?? []
    const enTrans = trans.find((t) => t.locale === 'en_US' || t.locale === 'en')
    const heTrans = trans.find((t) => t.locale === 'he_IL' || t.locale === 'he')

    const enPath = enTrans?.href
      ? enTrans.href.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '')
      : locale === 'en' ? `/blog/${slug}` : null
    const hePath = heTrans?.href
      ? heTrans.href.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '')
      : locale === 'he' ? `/he/blog/${slug}` : null

    return {
      en: enPath ?? `/blog/${slug}`,
      he: hePath ?? `/he/blog/${slug}`,
    }
  } catch {
    return { en: `/blog/${slug}`, he: `/he/blog/${slug}` }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [post, altPaths] = await Promise.all([getPost(loc, slug), findAlternateBlogPath(loc, slug)])
  const title = post?.title ? `${stripHtml(post.title)} | Triolla` : 'Blog | Triolla'
  const description = post?.postFields?.topBoldText
    ? stripHtml(post.postFields.topBoldText)
    : post?.content
    ? stripHtml(post.content).slice(0, 160).trimEnd()
    : undefined
  const ogImage = post?.featuredImage?.node?.sourceUrl ?? undefined
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { languages: { en: altPaths.en, he: altPaths.he } },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      locale: loc === 'he' ? 'he_IL' : 'en_US',
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [post, more, ts] = await Promise.all([getPost(loc, slug), getMorePosts(loc), getThemeSettings()])

  if (!post || (!post.title && !post.content)) notFound()

  const currentUri = post.uri ? post.uri.replace(/^\/+|\/+$/g, '') : null
  const related = more.filter((p) => (p.uri ?? '').replace(/^\/+|\/+$/g, '') !== currentUri).slice(0, 3)

  const postingSchema = blogPostingSchema({
    title: post.title,
    content: post.content,
    date: post.date,
    uri: post.uri,
    imageUrl: post.featuredImage?.node?.sourceUrl ?? null,
  })
  const crumbLabel = post.title ? stripHtml(post.title) : 'Article'
  const crumbPath = post.uri ? `/${post.uri.replace(/^\/+|\/+$/g, '')}` : `/blog/${slug}`
  const blogPath = loc === 'he' ? '/he/blog' : '/blog'
  const crumbSchema = breadcrumbSchema(
    [
      { name: 'Blog', path: blogPath },
      { name: crumbLabel, path: crumbPath },
    ],
    loc === 'he' ? 'דף הבית' : 'Home',
  )

  return (
    <>
      {postingSchema && <JsonLd data={[postingSchema, crumbSchema]} />}
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
