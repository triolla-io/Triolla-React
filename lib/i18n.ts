// Locale configuration for the bilingual (EN default, HE under /he/) site.
// Hebrew content lives in the SAME WordPress install; pages are addressed by
// their Hebrew slug via the existing WPGraphQL endpoint. Add a route's Hebrew
// slug to PAGE_URI as it gets localized.

export const locales = ['en', 'he'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** HTML `dir` attribute per locale. */
export const dir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  he: 'rtl',
}

/** HTML `lang` attribute per locale. */
export const htmlLang: Record<Locale, string> = {
  en: 'en',
  he: 'he',
}

/**
 * Prefix an internal path with `/he` when the locale is Hebrew.
 * Strips the triolla.io domain from WordPress-sourced URLs first.
 * External links (not starting with `/`) are returned unchanged.
 */
export function localizeHref(path: string, locale: Locale): string {
  // Strip WP domain if present
  const clean = path.replace(/^https?:\/\/triolla\.io/, '') || '/'
  if (locale === 'en' || !clean.startsWith('/') || clean.startsWith('/he')) return clean
  return clean === '/' ? '/he' : `/he${clean}`
}

/**
 * WordPress page URI per route, per locale, queried with `idType: URI`.
 * Verified live: en `/` and he `home-new-he` both resolve to
 * Template_HomePageNew with the homePage ACF field group.
 * Extend this map (keyed by a stable route id) as more pages are localized.
 */
export const PAGE_URI: Record<string, Record<Locale, string>> = {
  home:            { en: '/',                        he: 'home-new-he' },
  aboutUs:         { en: 'about-us',                 he: 'about' },
  services:        { en: 'services',                 he: 'השירותים-שלנו' },
  contactUs:       { en: 'contact-us',               he: 'צור-קשר' },
  careers:         { en: 'careers',                  he: 'קריירה' },
  technology:      { en: 'technology',               he: 'technology' },
  brandingStudio:  { en: 'branding-studio',          he: 'מיתוג-וסטודיו' },
  blog:            { en: '/blog/',                   he: 'בלוג' },
  privacyPolicy:   { en: 'privacy-policy',           he: 'מדיניות-פרטיות' },
  accessibility:   { en: 'accessibility-statement',  he: 'הצהרת-נגישות' },
  termsOfUse:      { en: 'terms-of-use',             he: 'תנאי-שימוש' },
}

/** Returns a locale-prefixed path: `/he/contact-us` for Hebrew, `/contact-us` for English. */
export function localizeHref(path: string, locale: Locale): string {
  if (locale === 'he') return `/he${path.startsWith('/') ? path : `/${path}`}`
  return path.startsWith('/') ? path : `/${path}`
}
