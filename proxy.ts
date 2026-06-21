import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n'

const NON_DEFAULT_LOCALES = locales.filter((l) => l !== defaultLocale)

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // A non-default locale (e.g. /he, /he/...) is served as-is.
  const isNonDefaultLocale = NON_DEFAULT_LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (isNonDefaultLocale) return NextResponse.next()

  // Redirect a visible default-locale prefix (/en, /en/...) to the clean path.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || '/'
    return NextResponse.redirect(url)
  }

  // Everything else is the default locale: rewrite to /en/... internally,
  // keeping the visible URL prefix-free.
  const url = req.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Skip Next internals, API routes, and files with an extension (assets).
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
