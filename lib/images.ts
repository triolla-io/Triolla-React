/**
 * Returns the WordPress media URL as-is (absolute triolla.io URL).
 * next/image remotePatterns allows triolla.io, so no proxy rewrite is needed.
 * Returns null when the input is null/undefined (component renders nothing).
 */
export function wpImg(url: string | null | undefined): string | null {
  if (!url) return null
  return url
}
