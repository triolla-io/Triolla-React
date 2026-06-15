'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LocaleSwitcher() {
  const pathname = usePathname()

  const isHe = pathname === '/he' || pathname.startsWith('/he/')
  const enHref = isHe ? (pathname === '/he' ? '/' : pathname.slice(3)) : pathname
  const heHref = isHe ? pathname : pathname === '/' ? '/he' : `/he${pathname}`

  return (
    <>
      <Link
        href={enHref}
        className={`footer-lang__opt${!isHe ? ' footer-lang__opt--active' : ''}`}
      >
        Eng
      </Link>
      <span className="footer-lang__sep">/</span>
      <Link
        href={heHref}
        className={`footer-lang__opt${isHe ? ' footer-lang__opt--active' : ''}`}
      >
        Heb
      </Link>
    </>
  )
}
