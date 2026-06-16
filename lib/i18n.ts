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
 * WordPress page URI per route, per locale, queried with `idType: URI`.
 * Verified live: en `/` and he `home-new-he` both resolve to
 * Template_HomePageNew with the homePage ACF field group.
 * Extend this map (keyed by a stable route id) as more pages are localized.
 */
export const PAGE_URI: Record<string, Record<Locale, string>> = {
  home: { en: '/', he: 'home-new-he' },
}
