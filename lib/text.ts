/** Strip HTML tags and decode the handful of entities WP emits, returning
 *  clean plain text. Shared by home + blog. Mirrors the original inline helper. */
export function stripHtml(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** Sanitize WordPress rich-text before rendering it as raw HTML.
 *  Strips layout-affecting attributes (class, id, style, data-*) and any
 *  <script>/<style> blocks, then unwraps <div>/<span> wrappers. This defuses
 *  content pasted from external apps (e.g. a chat-UI DOM dump with
 *  `position:absolute; inset:0` wrappers that break out and overlap the page)
 *  while preserving the real paragraphs and inline formatting. The proper fix
 *  is to clean the source field in WP — this keeps a bad paste from destroying
 *  the layout in the meantime. */
export function sanitizeWpHtml(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\s(?:class|id|style)\s*=\s*"[^"]*"/gi, '')
    .replace(/\s(?:class|id|style)\s*=\s*'[^']*'/gi, '')
    .replace(/\sdata-[\w-]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\sdata-[\w-]+\s*=\s*'[^']*'/gi, '')
    .replace(/<\/?(?:div|span)[^>]*>/gi, '')
    .trim()
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
