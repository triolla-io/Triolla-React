/** Strip HTML tags and decode the handful of entities WP emits, returning
 *  clean plain text. Shared by home + blog. Mirrors the original inline helper. */
export function stripHtml(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .trim()
}

/** WordPress returns every article in both languages as separate post nodes
 *  (distinct IDs, identical date). The GraphQL schema exposes no language field
 *  or filter, so the only reliable discriminator is the URI: Hebrew posts live
 *  under `/he/…`, English (the default) under `/blog/…`. Until i18n lands, the
 *  blog is English-only — keep every node whose URI is NOT under `/he/`, so each
 *  article appears once. Exclusion (rather than requiring `/blog/`) keeps any
 *  unprefixed English URI by default. */
export function filterEnglishPosts<T extends { uri?: string | null }>(nodes: T[]): T[] {
  return nodes.filter((p) => !/^\/?he(\/|$)/.test(p.uri ?? ''))
}

/** Format a WP ISO date string as e.g. "14 Jun 2026". Returns null when the
 *  input is missing or unparseable — callers hide the date rather than guess.
 *  `timeZone: 'UTC'` is required: BlogPostCard is rendered inside the client
 *  BlogPostGrid, so the same date is formatted on the server (SSR) and the
 *  client (hydration). Without a fixed zone, a post timestamped near midnight
 *  formats to a different day across timezones and triggers a hydration error. */
export function formatPostDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d)
}
