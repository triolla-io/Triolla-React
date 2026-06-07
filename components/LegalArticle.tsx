import parse, {
  type HTMLReactParserOptions,
  Element as ParserElement,
} from "html-react-parser";

/** Strip interactive/script chrome from WP content — only the readable article
 *  (headings, paragraphs, lists, links) survives. Same allowlist approach the
 *  service-detail modal uses, kept consistent across the site. */
const DROP_TAGS = new Set([
  "script",
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "iframe",
  "noscript",
]);

const parseOptions: HTMLReactParserOptions = {
  replace: (node) => {
    if (node instanceof ParserElement && DROP_TAGS.has(node.name)) {
      return <></>;
    }
    return undefined;
  },
};

interface LegalArticleProps {
  title: string | null;
  content: string | null;
  /** Small uppercase eyebrow above the title (e.g. "Legal"). */
  eyebrow?: string | null;
}

/**
 * Renders a simple WP content page (privacy policy, terms, etc.) as a clean,
 * brand-styled article. Content is sanitized WP HTML. Returns null when there's
 * nothing to show — never substitutes placeholder copy.
 */
export function LegalArticle({ title, content, eyebrow }: LegalArticleProps) {
  if (!title && !content) return null;

  return (
    <main className="legal-root bg-[#080808] text-white overflow-x-clip relative">
      {/* Glow orb (brand hero accent) */}
      <div className="legal-orb" aria-hidden="true" />

      <article className="legal-inner">
        <header className="legal-head">
          {eyebrow && <p className="legal-eyebrow">{eyebrow}</p>}
          {title && <h1 className="legal-title">{title}</h1>}
          <div className="legal-rule" aria-hidden="true" />
        </header>

        {content && (
          /* WP-sourced HTML — trusted backend, sanitized via DROP_TAGS */
          <div className="legal-prose">{parse(content, parseOptions)}</div>
        )}
      </article>

      <style>{`
        .legal-root { padding: 0 0 120px; }
        .legal-orb {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 900px; height: 460px; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse at center, rgba(250,204,21,0.07) 0%, transparent 70%);
          filter: blur(40px);
        }
        .legal-inner {
          position: relative; z-index: 1;
          max-width: 820px; margin: 0 auto;
          padding: 140px 24px 0;
        }
        .legal-head { margin-bottom: 48px; }
        .legal-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.28em;
          text-transform: uppercase; color: #facc15; margin-bottom: 18px;
        }
        .legal-title {
          font-size: clamp(2.4rem, 7vw, 4.5rem);
          font-weight: 900; letter-spacing: -0.04em; line-height: 1.02;
          color: #fff;
        }
        .legal-rule {
          width: 64px; height: 2px; margin-top: 28px;
          background: linear-gradient(to right, #facc15, rgba(250,204,21,0));
          border-radius: 2px;
        }

        /* ── Prose ── */
        .legal-prose { color: rgba(255,255,255,0.7); font-size: 1.02rem; line-height: 1.85; }
        .legal-prose h1, .legal-prose h2 {
          font-size: clamp(1.5rem, 3.4vw, 2.1rem); font-weight: 800; color: #fff;
          letter-spacing: -0.02em; line-height: 1.2; margin: 2.4em 0 0.8em;
        }
        .legal-prose h3, .legal-prose h4 {
          font-size: clamp(1.2rem, 2.6vw, 1.5rem); font-weight: 700; color: #fff;
          letter-spacing: -0.01em; line-height: 1.25; margin: 2em 0 0.7em;
        }
        .legal-prose p { margin: 0 0 1.4em; }
        .legal-prose ul, .legal-prose ol { margin: 0 0 1.5em; padding-left: 1.4em; }
        .legal-prose li { margin: 0 0 0.6em; }
        .legal-prose a {
          color: #facc15; text-decoration: underline; text-underline-offset: 3px;
          word-break: break-word;
        }
        .legal-prose a:hover { color: #fbbf24; }
        .legal-prose strong, .legal-prose b { color: rgba(255,255,255,0.92); }
        .legal-prose h1 b, .legal-prose h2 b, .legal-prose h3 b { color: inherit; font-weight: inherit; }
        .legal-prose table { width: 100%; border-collapse: collapse; margin: 0 0 1.6em; }
        .legal-prose th, .legal-prose td {
          border: 1px solid rgba(255,255,255,0.12); padding: 10px 14px; text-align: left;
        }
        .legal-prose img { max-width: 100%; height: auto; border-radius: 12px; }

        @media (max-width: 768px) {
          .legal-inner { padding: 104px 20px 0; }
          .legal-head { margin-bottom: 36px; }
        }
      `}</style>
    </main>
  );
}
