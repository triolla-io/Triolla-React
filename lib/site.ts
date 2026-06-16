// Canonical public origin of the live Next.js site. Used for absolute URLs in
// robots.txt, sitemap.xml, llms.txt and JSON-LD — all of which LLM crawlers
// (ClaudeBot, GPTBot, PerplexityBot, …) and search engines require to be
// absolute. Override per-environment with NEXT_PUBLIC_SITE_URL; defaults to the
// brand domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://triolla.io').replace(/\/$/, '')

/** Join an internal path onto SITE_URL, returning an absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
