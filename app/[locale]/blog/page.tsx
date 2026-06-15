import type { Metadata } from 'next'
import Link from 'next/link'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_BLOG_PAGE, GET_BLOG_POSTS, GET_THEME_SETTINGS, BLOG_PAGE_SIZE } from '@/lib/queries'
import type {
  GetBlogPageData,
  GetBlogPostsData,
  GetThemeSettingsData,
  BlogPageFields,
  BlogPostNode,
  BlogPostsConnection,
  ThemeOptions,
} from '@/lib/graphql-types'
import { GlowOrb, Eyebrow, GradientText, GrainOverlay, ShineImageCard } from '@/components/ui'
import { FadeIn } from '@/components/FadeIn'
import { BlogPostGrid } from '@/components/BlogPostGrid'
import { ContactCTA } from '@/components/ContactCTA'
import { stripHtml, formatPostDate } from '@/lib/text'
import { isLocale, defaultLocale, PAGE_URI } from '@/lib/i18n'

const BLOG_PAGE_QUERY: TypedDocumentNode<GetBlogPageData> = gql`
  ${GET_BLOG_PAGE}
`
const BLOG_POSTS_QUERY: TypedDocumentNode<GetBlogPostsData> = gql`
  ${GET_BLOG_POSTS}
`
const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

export const metadata: Metadata = { title: 'Blog | Triolla' }

async function getBlogPage(uri: string): Promise<BlogPageFields | null> {
  try {
    const { data } = await client.query({ query: BLOG_PAGE_QUERY, variables: { uri } })
    return data?.page?.template?.blogPageFields ?? null
  } catch {
    return null
  }
}

async function getInitialPosts(): Promise<BlogPostsConnection | null> {
  try {
    // First card is the featured spotlight; the rest seed the grid.
    const { data } = await client.query({
      query: BLOG_POSTS_QUERY,
      variables: { first: BLOG_PAGE_SIZE + 1, after: null },
    })
    return data?.posts ?? null
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

function FeaturedPost({ post }: { post: BlogPostNode }) {
  const title = post.title ? stripHtml(post.title) : null
  const href = post.uri ? `/${post.uri.replace(/^\/+|\/+$/g, '')}` : null
  const imgUrl = post.featuredImage?.node?.sourceUrl ?? null
  if (!title || !href || !imgUrl) return null
  const alt = post.featuredImage?.node?.altText || title
  const date = formatPostDate(post.date)

  return (
    <FadeIn className="blog-featured">
      <Link href={href} className="blog-featured__link" aria-label={title}>
        <div className="blog-featured__media">
          <ShineImageCard src={imgUrl} alt={alt} radius={28} imgScale={1.06} />
        </div>
        <div className="blog-featured__meta">
          {date && <span className="blog-featured__date">{date}</span>}
          <h2 className="blog-featured__title">{title}</h2>
          <span className="blog-featured__cue" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </div>
      </Link>
    </FadeIn>
  )
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale
  const [bp, postsConn, ts] = await Promise.all([getBlogPage(PAGE_URI.blog[loc]), getInitialPosts(), getThemeSettings()])

  const allPosts = postsConn?.nodes ?? []
  const featured = allPosts[0] ?? null
  const gridPosts = allPosts.slice(1)
  const gridPageInfo = postsConn?.pageInfo ?? { hasNextPage: false, endCursor: null }
  const loadMoreLabel = bp?.moreText ?? bp?.buttonText ?? null

  const overlayUrl = bp?.headerBgOverlayLayer?.node?.sourceUrl ?? null
  const heroTitle = bp?.headerTitle ?? null
  const heroLead = bp?.shortText ?? null
  const heroBold = bp?.boldText ?? null

  return (
    <main className="blog-root bg-[#080808] text-white overflow-x-clip relative pb-24 md:pb-32">
      <GrainOverlay />

      {/* ── HERO ── */}
      {(heroTitle || heroLead || heroBold) && (
        <section className="blog-hero">
          {overlayUrl && (
            <div className="blog-hero__bg" aria-hidden="true">
              <img src={overlayUrl} alt="" className="blog-hero__bg-img" />
            </div>
          )}
          {/* Centered hero orb: animation="none" because the orbPulse keyframe
              sets `transform: scale()`, which would override the Tailwind
              -translate-x-1/2 centering and shift the glow off-center. The
              hero's slow motion comes from the background-image zoom instead. */}
          <GlowOrb
            size={900}
            height={500}
            shape="ellipse"
            fade="70%"
            blur={90}
            color="rgba(250,204,21,0.12)"
            animation="none"
            className="top-[-8%] left-1/2 -translate-x-1/2 max-md:w-[560px] max-md:h-[320px]"
          />
          <div className="blog-hero__inner">
            <Eyebrow ornament="dot" align="center" style={{ '--eb-mb': '24px' } as React.CSSProperties}>
              Triolla
            </Eyebrow>
            {heroTitle && (
              <GradientText as="h1" animate className="blog-hero__title">
                {heroTitle}
              </GradientText>
            )}
            {heroBold && <p className="blog-hero__bold">{stripHtml(heroBold)}</p>}
            {heroLead && <p className="blog-hero__lead">{stripHtml(heroLead)}</p>}
          </div>
        </section>
      )}

      <div className="blog-body max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {featured && <FeaturedPost post={featured} />}
        <section className="blog-grid-section py-16 md:py-24">
          <BlogPostGrid initialPosts={gridPosts} initialPageInfo={gridPageInfo} loadMoreLabel={loadMoreLabel} />
        </section>
      </div>

      <ContactCTA ts={ts} />

      <style>{`
        .blog-hero {
          position: relative;
          overflow: hidden;
          padding: 150px 24px 70px;
          text-align: center;
        }
        .blog-hero__bg { position: absolute; inset: 0; z-index: 0; }
        .blog-hero__bg-img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.18; filter: grayscale(0.3);
          transform: scale(1.05);
          animation: blog-hero-zoom 18s ease-in-out infinite alternate;
        }
        @keyframes blog-hero-zoom { to { transform: scale(1.14); } }
        .blog-hero__inner { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; }
        .blog-hero__title {
          font-size: clamp(2.6rem, 9vw, 6rem);
          font-weight: 800; letter-spacing: -0.04em; line-height: 0.98;
          display: block;
        }
        .blog-hero__bold {
          margin: 26px auto 0; max-width: 760px;
          font-size: clamp(1.1rem, 2.4vw, 1.6rem); font-weight: 600; color: #fff;
        }
        .blog-hero__lead {
          margin: 16px auto 0; max-width: 680px;
          font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 300; line-height: 1.6;
          color: #9ca3af;
        }

        /* ── Featured spotlight ── */
        .blog-featured { padding-top: 56px; }
        .blog-featured__link {
          display: grid; grid-template-columns: 1fr; gap: 28px;
          text-decoration: none; color: #fff; align-items: center;
        }
        @media (min-width: 900px) {
          .blog-featured__link { grid-template-columns: 1.35fr 1fr; gap: 48px; }
        }
        .blog-featured__date {
          display: inline-block;
          font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #facc15; margin-bottom: 18px;
        }
        .blog-featured__title {
          font-size: clamp(1.8rem, 4.4vw, 3.2rem);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
          transition: color 0.25s ease;
        }
        .blog-featured__cue {
          display: inline-flex; margin-top: 28px; color: #facc15;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .blog-featured__link:hover .blog-featured__title { color: #facc15; }
        .blog-featured__link:hover .blog-featured__cue { transform: translateX(10px); }
      `}</style>
    </main>
  )
}
