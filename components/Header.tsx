import { client } from "@/lib/apollo-client";
import { GET_THEME_SETTINGS, GET_PRIMARY_MENU } from "@/lib/queries";
import { gql } from "@apollo/client";
import { HeaderClient } from "./HeaderClient";

interface MenuItem {
  label: string;
  url: string;
}

async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    });
    return data?.themeSetting?.themeSetting ?? null;
  } catch {
    return null;
  }
}

async function getPrimaryMenu(): Promise<{
  nav: MenuItem[];
  mobile: MenuItem[];
}> {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PRIMARY_MENU}
      `,
    });
    const nav: MenuItem[] = data?.primaryMenu?.menuItems?.nodes ?? [];
    const mobile: MenuItem[] = data?.mobileMenu?.menuItems?.nodes?.length
      ? data.mobileMenu.menuItems.nodes
      : nav;
    return { nav, mobile };
  } catch {
    return { nav: [], mobile: [] };
  }
}

export default async function Header() {
  const [ts, menus] = await Promise.all([getThemeSettings(), getPrimaryMenu()]);

  const whatsappHref = ts?.whatsappNumber
    ? `https://wa.me/${ts.whatsappNumber}${ts.whatsappMessage ? `?text=${encodeURIComponent(ts.whatsappMessage)}` : ""}`
    : null;

  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={menus.nav}
      mobileNavItems={menus.mobile}
      whatsappHref={whatsappHref}
      bookButtonText={ts?.bookButton ?? null}
      bookButtonHref={ts?.bookButtonLink ?? null}
      contactButtonText={ts?.contactButton ?? null}
      contactButtonHref={ts?.contactButtonLink ?? null}
    />
  );
}
