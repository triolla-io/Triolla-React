import Link from 'next/link'
import { ShineImageCard } from '@/components/ui'
import { stripHtml, formatPostDate } from '@/lib/text'
import type { BlogPostNode } from '@/lib/graphql-types'

export function BlogPostCard({ post }: { post: BlogPostNode }) {
  const title = post.title ? stripHtml(post.title) : null
  const href = post.uri ? `/${post.uri.replace(/^\/+|\/+$/g, '')}` : null
  const imgUrl = post.featuredImage?.node?.sourceUrl ?? null

  // No title / no link / no image → nothing to show. Never substitute copy.
  if (!title || !href || !imgUrl) return null

  const alt = post.featuredImage?.node?.altText || title
  const date = formatPostDate(post.date)

  return (
    <Link href={href} className="blog-card" aria-label={title}>
      <ShineImageCard
        src={imgUrl}
        alt={alt}
        radius={16}
        imgScale={1.08}
        badge={date ? <span className="blog-card__date">{date}</span> : undefined}
      />
      <h3 className="blog-card__title">{title}</h3>
      <span className="blog-card__cue" aria-hidden="true">
        <svg
          width="22"
          height="22"
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

      <style>{`
        .blog-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-decoration: none;
          color: #fff;
        }
        .blog-card__date {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #080808;
          background: #facc15;
          padding: 6px 11px;
          border-radius: 999px;
        }
        .blog-card__title {
          font-size: clamp(1.15rem, 2.2vw, 1.45rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.22;
          color: #fff;
          transition: color 0.25s ease;
        }
        .blog-card__cue {
          display: inline-flex;
          align-items: center;
          color: #facc15;
          transform: translateX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blog-card:hover .blog-card__title { color: #facc15; }
        .blog-card:hover .blog-card__cue { transform: translateX(8px); }
      `}</style>
    </Link>
  )
}
