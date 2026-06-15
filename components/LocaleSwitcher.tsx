'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'

/** Read <link rel="alternate" hreflang="$lang"> from <head>, or null.
 *  Next.js renders the attribute as hrefLang (camelCase), which browsers
 *  normalise to hreflang (lowercase) in the DOM — both selectors are tried. */
function getAlternate(lang: string): string | null {
  if (typeof document === 'undefined') return null
  const el =
    document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`) ??
    document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hrefLang="${lang}"]`)
  if (!el) return null
  try { return new URL(el.href).pathname } catch { return null }
}

/** Tiny external store that re-subscribes on every pathname change. */
function useAlternates(pathname: string) {
  return useSyncExternalStore(
    (cb) => {
      // Re-read on any <head> mutation (Next.js swaps hreflang tags on navigation)
      const mo = new MutationObserver(cb)
      mo.observe(document.head, { childList: true, subtree: true })
      return () => mo.disconnect()
    },
    () => ({ en: getAlternate('en'), he: getAlternate('he'), _path: pathname }),
    () => ({ en: null, he: null, _path: pathname }),
  )
}

export function LocaleSwitcher() {
  const pathname = usePathname()
  const isHe = pathname === '/he' || pathname.startsWith('/he/')

  // Fallback: simple prefix add/remove (works for all fixed-slug pages)
  const enFallback = isHe ? (pathname === '/he' ? '/' : pathname.slice(3)) : pathname
  const heFallback = isHe ? pathname : pathname === '/' ? '/he' : `/he${pathname}`

  const { en, he } = useAlternates(pathname)

  const enHref = en ?? enFallback
  const heHref = he ?? heFallback

  return (
    <>
      <Link href={enHref} className={`footer-lang__opt${!isHe ? ' footer-lang__opt--active' : ''}`}>
        Eng
      </Link>
      <span className="footer-lang__sep">/</span>
      <Link href={heHref} className={`footer-lang__opt${isHe ? ' footer-lang__opt--active' : ''}`}>
        Heb
      </Link>
    </>
  )
}
