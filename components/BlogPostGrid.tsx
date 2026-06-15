'use client'

import { useState, useTransition } from 'react'
import { SectionReveal } from '@/components/SectionReveal'
import { BlogPostCard } from '@/components/BlogPostCard'
import { loadMorePosts } from '@/app/[locale]/blog/actions'
import type { BlogPostNode, BlogPostsPageInfo } from '@/lib/graphql-types'

interface BlogPostGridProps {
  initialPosts: BlogPostNode[]
  initialPageInfo: BlogPostsPageInfo
  /** Load-More label from WP (moreText/buttonText); null → icon-only button. */
  loadMoreLabel: string | null
}

export function BlogPostGrid({ initialPosts, initialPageInfo, loadMoreLabel }: BlogPostGridProps) {
  const [posts, setPosts] = useState<BlogPostNode[]>(initialPosts)
  const [pageInfo, setPageInfo] = useState<BlogPostsPageInfo>(initialPageInfo)
  const [isPending, startTransition] = useTransition()

  const onLoadMore = () => {
    startTransition(async () => {
      const next = await loadMorePosts(pageInfo.endCursor)
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...next.nodes.filter((p: BlogPostNode) => !seen.has(p.id))]
      })
      setPageInfo(next.pageInfo)
    })
  }

  if (posts.length === 0) return null

  return (
    <div className="blog-grid-wrap">
      <SectionReveal className="blog-grid">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </SectionReveal>

      {pageInfo.hasNextPage && (
        <div className="blog-loadmore-wrap">
          <button
            type="button"
            className="blog-loadmore"
            onClick={onLoadMore}
            disabled={isPending}
            aria-label={loadMoreLabel ?? 'Load more posts'}
            aria-busy={isPending}
          >
            {loadMoreLabel ? <span>{loadMoreLabel}</span> : null}
            <svg
              className={isPending ? 'blog-loadmore__spin' : ''}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isPending ? <path d="M21 12a9 9 0 1 1-6.219-8.56" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
          </button>
        </div>
      )}

      <style>{`
        .blog-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px 28px;
        }
        @media (min-width: 640px) { .blog-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .blog-grid { grid-template-columns: repeat(3, 1fr); } }
        .blog-loadmore-wrap { display: flex; justify-content: center; margin-top: 64px; }
        .blog-loadmore {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #facc15;
          color: #080808;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.01em;
          padding: 16px 32px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .blog-loadmore:hover:not(:disabled) { background: #fde047; transform: translateY(-2px); }
        .blog-loadmore:disabled { opacity: 0.7; cursor: progress; }
        .blog-loadmore__spin { animation: blog-spin 0.8s linear infinite; }
        @keyframes blog-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
