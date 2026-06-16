import { client } from '@/lib/apollo-client'
import { GET_THEME_SETTINGS, GET_PRIMARY_MENU } from '@/lib/queries'
import { gql } from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { HeaderClient } from './HeaderClient'
import type { NavItem } from './HeaderClient'
import type { GetThemeSettingsData, GetPrimaryMenuData, MenuItemNode, ThemeOptions } from '@/lib/graphql-types'

const THEME_SETTINGS_QUERY: TypedDocumentNode<GetThemeSettingsData> = gql`
  ${GET_THEME_SETTINGS}
`

const PRIMARY_MENU_QUERY: TypedDocumentNode<GetPrimaryMenuData> = gql`
  ${GET_PRIMARY_MENU}
`

async function getThemeSettings(): Promise<ThemeOptions | null> {
  try {
    const { data } = await client.query({ query: THEME_SETTINGS_QUERY })
    return data?.themeSetting?.themeOptions ?? null
  } catch {
    return null
  }
}

function buildNavTree(flat: MenuItemNode[]): NavItem[] {
  const roots = flat.filter((item) => !item.parentDatabaseId)
  return roots.map((item) => {
    const directChildren = flat.filter((c) => c.parentDatabaseId === item.databaseId)
    const children: { label: string; url: string }[] = []

    for (const child of directChildren) {
      const grandchildren = flat.filter((gc) => gc.parentDatabaseId === child.databaseId)
      if (grandchildren.length > 0) {
        // Intermediate grouping node — flatten its children up into the dropdown
        for (const gc of grandchildren) {
          children.push({ label: gc.label || '', url: gc.url || '#' })
        }
      } else if (child.url && child.url !== '#') {
        children.push({ label: child.label || '', url: child.url })
      }
    }

    return { label: item.label || '', url: item.url || '#', children }
  })
}

async function getPrimaryMenu(): Promise<{
  nav: NavItem[]
  mobile: NavItem[]
}> {
  try {
    const { data } = await client.query({ query: PRIMARY_MENU_QUERY })
    const flatNav: MenuItemNode[] = data?.primaryMenu?.menuItems?.nodes ?? []
    return { nav: buildNavTree(flatNav), mobile: buildNavTree(flatNav) }
  } catch {
    return { nav: [], mobile: [] }
  }
}

async function getHebrewMenu(): Promise<{ nav: NavItem[]; mobile: NavItem[] }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL ?? 'https://triolla.io'}/wp-json/triolla/v1/menu/header-menu-he/he`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return { nav: [], mobile: [] }
    const items: { id: number; label: string; url: string; parentId: number }[] = await res.json()
    const mapped: MenuItemNode[] = items.map((item) => ({
      databaseId: item.id,
      label: item.label,
      url: item.url,
      parentDatabaseId: item.parentId || null,
    }))
    const nav = buildNavTree(mapped)
    return { nav, mobile: nav }
  } catch {
    return { nav: [], mobile: [] }
  }
}

export default async function Header({ locale }: { locale?: string }) {
  const isHe = locale === 'he'
  const [ts, menus, localizedTs] = await Promise.all([
    getThemeSettings(),
    isHe ? getHebrewMenu() : getPrimaryMenu(),
    isHe ? fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL ?? 'https://triolla.io'}/wp-json/triolla/v1/theme-options/he`,
      { next: { revalidate: 3600 } }
    ).then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null),
  ])

  const whatsappHref = ts?.whatsappNumber
    ? `https://wa.me/${ts.whatsappNumber}${ts.whatsappMessage ? `?text=${encodeURIComponent(ts.whatsappMessage)}` : ''}`
    : 'https://wa.me/+972525956644'

  const nav = menus.nav.length > 0 ? menus.nav : []
  const mobile = menus.mobile.length > 0 ? menus.mobile : nav

  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={nav}
      mobileNavItems={mobile}
      menuPromoImage={ts?.menuBackgroundImage?.node?.sourceUrl ?? null}
      whatsappHref={whatsappHref}
      bookButtonText={localizedTs?.bookButton ?? ts?.bookButton ?? 'Book a Call'}
      bookButtonHref={localizedTs?.bookButtonLink ?? ts?.bookButtonLink ?? 'https://calendly.com/triolla/pitangoux-introductory-meeting-clone'}
      contactButtonText={localizedTs?.contactButton ?? ts?.contactButton ?? 'Contact Us'}
      contactButtonHref={localizedTs?.contactButtonLink ?? ts?.contactButtonLink ?? '/contact-us'}
    />
  )
}
