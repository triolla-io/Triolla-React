'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/** Read <link rel="alternate" hreflang="$lang"> from <head>, or null. */
function getAlternate(lang: string): string | null {
  if (typeof document === 'undefined') return null
  const el =
    document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`) ??
    document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hrefLang="${lang}"]`)
  if (!el) return null
  try { return new URL(el.href).pathname } catch { return null }
}

/** Watches <head> for hreflang changes (Next.js swaps them on navigation). */
function useAlternates(pathname: string) {
  const [alternates, setAlternates] = useState<{ en: string | null; he: string | null }>(
    () => ({ en: null, he: null }),
  )

  useEffect(() => {
    function read() {
      const en = getAlternate('en')
      const he = getAlternate('he')
      // Only update state when values actually change — prevents render loops
      setAlternates(prev => (prev.en === en && prev.he === he ? prev : { en, he }))
    }

    read()
    const mo = new MutationObserver(read)
    mo.observe(document.head, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [pathname])

  return alternates
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
