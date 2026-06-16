const WP_ORIGIN = 'https://triolla.io'

/**
 * Convert an absolute WordPress media URL to a root-relative path so it
 * routes through Next.js's /wp-content rewrite proxy.
 *
 * https://triolla.io/wp-content/uploads/img.png  →  /wp-content/uploads/img.png
 *
 * In production the rewrite proxies server-side, keeping the browser request
 * on the same origin. In development this avoids cross-origin image blocks.
 * Returns null when the input is null/undefined (component renders nothing).
 */
export function wpImg(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith(WP_ORIGIN)) return url.slice(WP_ORIGIN.length)
  return url
}
