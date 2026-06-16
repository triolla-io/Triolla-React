import Image from 'next/image'
import Link from 'next/link'
import { GlowOrb } from '@/components/ui'
import { ReadingProgress } from '@/components/ReadingProgress'
import { WpContent } from '@/lib/wp-content'
import { stripHtml, formatPostDate } from '@/lib/text'
import type { SinglePost } from '@/lib/graphql-types'
import { wpImg } from '@/lib/images'
import { type Locale, localizeHref } from '@/lib/i18n'

export function BlogArticle({ post, locale = 'en' }: { post: SinglePost; locale?: Locale }) {
  const title = post.title ? stripHtml(post.title) : null
  const date = formatPostDate(post.date)
  const imgUrl = post.featuredImage?.node?.sourceUrl ?? null
  const imgAlt = post.featuredImage?.node?.altText || title || ''
  const intro = post.postFields?.topBoldText ? stripHtml(post.postFields.topBoldText) : null
  const content = post.content ?? null

  return (
    <main className="article-root bg-[#080808] text-white overflow-x-clip relative">
      <ReadingProgress />

      <GlowOrb
        size={900}
        height={460}
        shape="ellipse"
        fade="70%"
        blur={40}
        color="rgba(250,204,21,0.07)"
        className="top-0 left-1/2 -translate-x-1/2 z-0"
      />

      <article className="article-inner">
        <header className="article-head">
          <Link href={localizeHref('/blog', locale)} className="article-back" aria-label="Back to blog">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          {date && <p className="article-date">{date}</p>}
          {title && <h1 className="article-title">{title}</h1>}
          <div className="article-rule" aria-hidden="true" />
        </header>

        {imgUrl && (
          <figure className="article-hero-img">
            <Image src={wpImg(imgUrl) ?? imgUrl} alt={imgAlt} width={1200} height={630} className="w-full h-auto" />
          </figure>
        )}

        {intro && <p className="article-intro">{intro}</p>}

        {content && (
          <div className="article-prose">
            <WpContent html={content} />
          </div>
        )}
      </article>

      <style>{`
        .article-root { padding: 0 0 100px; }
        .article-inner {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto;
          padding: 130px 24px 0;
        }
        .article-head { margin-bottom: 40px; }
        .article-back {
          display: inline-flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14); color: #9ca3af;
          margin-bottom: 30px; transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .article-back:hover { color: #fff; border-color: #facc15; transform: translateX(-3px); }
        .article-date {
          font-size: 12px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: #facc15; margin-bottom: 18px;
        }
        .article-title {
          font-size: clamp(2.1rem, 6vw, 4rem);
          font-weight: 900; letter-spacing: -0.04em; line-height: 1.04; color: #fff;
        }
        .article-rule {
          width: 64px; height: 2px; margin-top: 26px;
          background: linear-gradient(to right, #facc15, rgba(250,204,21,0));
          border-radius: 2px;
        }
        .article-hero-img { margin: 0 0 44px; }
        .article-hero-img img {
          width: 100%; height: auto; border-radius: 24px; display: block;
          box-shadow: 0 30px 80px -30px rgba(0,0,0,0.8);
        }
        .article-intro {
          font-size: clamp(1.2rem, 2.6vw, 1.6rem);
          font-weight: 500; line-height: 1.55; color: #fff;
          padding-left: 22px; border-left: 3px solid #facc15;
          margin: 0 0 44px;
        }

        /* ── Prose (matches LegalArticle) ── */
        .article-prose { color: rgba(255,255,255,0.7); font-size: 1.05rem; line-height: 1.85; }
        .article-prose h1, .article-prose h2 {
          font-size: clamp(1.5rem, 3.4vw, 2.1rem); font-weight: 800; color: #fff;
          letter-spacing: -0.02em; line-height: 1.2; margin: 2.4em 0 0.8em;
        }
        .article-prose h3, .article-prose h4 {
          font-size: clamp(1.2rem, 2.6vw, 1.5rem); font-weight: 700; color: #fff;
          letter-spacing: -0.01em; line-height: 1.25; margin: 2em 0 0.7em;
        }
        .article-prose p { margin: 0 0 1.4em; }
        .article-prose ul, .article-prose ol { margin: 0 0 1.5em; padding-left: 1.4em; }
        .article-prose li { margin: 0 0 0.6em; }
        .article-prose a {
          color: #facc15; text-decoration: underline; text-underline-offset: 3px; word-break: break-word;
        }
        .article-prose a:hover { color: #fbbf24; }
        .article-prose strong, .article-prose b { color: rgba(255,255,255,0.92); }
        .article-prose h1 b, .article-prose h2 b, .article-prose h3 b { color: inherit; font-weight: inherit; }
        .article-prose table { width: 100%; border-collapse: collapse; margin: 0 0 1.6em; }
        .article-prose th, .article-prose td {
          border: 1px solid rgba(255,255,255,0.12); padding: 10px 14px; text-align: left;
        }
        .article-prose img { max-width: 100%; height: auto; border-radius: 12px; }

        @media (max-width: 768px) {
          .article-inner { padding: 104px 20px 0; }
        }
      `}</style>
    </main>
  )
}
