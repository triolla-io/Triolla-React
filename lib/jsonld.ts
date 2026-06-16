// Schema.org / JSON-LD builder helpers.
// Every function returns a plain object suitable for <JsonLd data={...} />.
// All fields are null-safe: callers pass whatever WP returned and we omit
// missing fields rather than emit null/undefined into the schema.

import { SITE_URL } from './site'

// ─── Utilities ────────────────────────────────────────────────────────────────

function strip(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function excerpt(html: string | null | undefined, max = 160): string | null {
  const text = strip(html)
  if (!text) return null
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function abs(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  path: string
}

/**
 * Build a BreadcrumbList from an ordered list of { name, path } pairs.
 * Home is prepended automatically with the site-appropriate label.
 */
export function breadcrumbSchema(
  items: BreadcrumbItem[],
  homeLabel = 'Home',
): Record<string, unknown> {
  const all = [{ name: homeLabel, path: '/' }, ...items]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  }
}

// ─── WebPage ──────────────────────────────────────────────────────────────────

export function webPageSchema(opts: {
  path: string
  name: string | null
  description?: string | null
  type?: string
}): Record<string, unknown> | null {
  if (!opts.name) return null
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'WebPage',
    '@id': `${abs(opts.path)}#webpage`,
    url: abs(opts.path),
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

// ─── BlogPosting ──────────────────────────────────────────────────────────────

export function blogPostingSchema(opts: {
  title: string | null
  content: string | null
  date: string | null
  uri: string | null
  imageUrl: string | null
}): Record<string, unknown> | null {
  if (!opts.title) return null
  const url = opts.uri ? abs(`/${opts.uri.replace(/^\/+|\/+$/g, '')}`) : null
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url ? `${url}#article` : undefined,
    headline: strip(opts.title),
    ...(opts.date ? { datePublished: opts.date } : {}),
    ...(url ? { url } : {}),
    ...(opts.imageUrl ? { image: abs(opts.imageUrl) } : {}),
    ...(opts.content ? { description: excerpt(opts.content) } : {}),
    author: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Triolla',
    },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export function serviceSchema(opts: {
  name: string | null
  description?: string | null
  path: string
  serviceType?: string
}): Record<string, unknown> | null {
  if (!opts.name) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${abs(opts.path)}#service`,
    name: opts.name,
    url: abs(opts.path),
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.serviceType ? { serviceType: opts.serviceType } : {}),
    provider: { '@id': `${SITE_URL}/#organization` },
  }
}

// ─── JobPosting ───────────────────────────────────────────────────────────────

export function jobPostingSchema(opts: {
  title: string | null
  description: string | null
  applyEmail?: string | null
}): Record<string, unknown> | null {
  if (!opts.title) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: opts.title,
    ...(opts.description ? { description: opts.description } : {}),
    hiringOrganization: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Triolla',
    },
    ...(opts.applyEmail
      ? { applicationContact: { '@type': 'ContactPoint', email: opts.applyEmail } }
      : {}),
  }
}
