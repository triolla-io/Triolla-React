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

const FALLBACK_NAV: MenuItem[] = [
  { label: "Portfolio", url: "/portfolio" },
  { label: "Services", url: "/services" },
  { label: "Technology", url: "/technology" },
  { label: "The Company", url: "/about-us" },
];

export default async function Header() {
  const [ts, menus] = await Promise.all([getThemeSettings(), getPrimaryMenu()]);

  const whatsappHref = ts?.whatsappNumber
    ? `https://wa.me/${ts.whatsappNumber}${ts.whatsappMessage ? `?text=${encodeURIComponent(ts.whatsappMessage)}` : ""}`
    : "https://wa.me/+972525956644";

  const nav = menus.nav.length > 0 ? menus.nav : FALLBACK_NAV;
  const mobile = menus.mobile.length > 0 ? menus.mobile : nav;

  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={nav}
      mobileNavItems={mobile}
      whatsappHref={whatsappHref}
      bookButtonText={ts?.bookButton ?? "Book a Call"}
      bookButtonHref={ts?.bookButtonLink ?? "https://calendly.com/triolla/pitangoux-introductory-meeting-clone"}
      contactButtonText={ts?.contactButton ?? "Contact Us"}
      contactButtonHref={ts?.contactButtonLink ?? "/contact-us"}
    />
  );
}
