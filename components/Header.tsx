import { client } from "@/lib/apollo-client";
import { GET_THEME_SETTINGS, GET_PRIMARY_MENU } from "@/lib/queries";
import { gql } from "@apollo/client";
import { HeaderClient } from "./HeaderClient";
import type { NavItem } from "./HeaderClient";

interface FlatMenuItem {
  databaseId: number;
  label: string;
  url: string | null;
  parentDatabaseId: number | null;
}

async function getThemeSettings() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_THEME_SETTINGS}
      `,
    });
    return data?.themeSetting?.themeOptions ?? null;
  } catch {
    return null;
  }
}

function buildNavTree(flat: FlatMenuItem[]): NavItem[] {
  const roots = flat.filter((item) => !item.parentDatabaseId);
  return roots.map((item) => {
    const directChildren = flat.filter(
      (c) => c.parentDatabaseId === item.databaseId,
    );
    const children: { label: string; url: string }[] = [];

    for (const child of directChildren) {
      const grandchildren = flat.filter(
        (gc) => gc.parentDatabaseId === child.databaseId,
      );
      if (grandchildren.length > 0) {
        // Intermediate grouping node — flatten its children up into the dropdown
        for (const gc of grandchildren) {
          children.push({ label: gc.label, url: gc.url || "#" });
        }
      } else if (child.url && child.url !== "#") {
        children.push({ label: child.label, url: child.url });
      }
    }

    return { label: item.label, url: item.url || "#", children };
  });
}

async function getPrimaryMenu(): Promise<{
  nav: NavItem[];
  mobile: NavItem[];
}> {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PRIMARY_MENU}
      `,
    });
    const flatNav: FlatMenuItem[] = data?.primaryMenu?.menuItems?.nodes ?? [];
    return { nav: buildNavTree(flatNav), mobile: buildNavTree(flatNav) };
  } catch {
    return { nav: [], mobile: [] };
  }
}

export default async function Header() {
  const [ts, menus] = await Promise.all([getThemeSettings(), getPrimaryMenu()]);

  const whatsappHref = ts?.whatsappNumber
    ? `https://wa.me/${ts.whatsappNumber}${ts.whatsappMessage ? `?text=${encodeURIComponent(ts.whatsappMessage)}` : ""}`
    : "https://wa.me/+972525956644";

  const nav = menus.nav.length > 0 ? menus.nav : [];
  const mobile = menus.mobile.length > 0 ? menus.mobile : nav;

  return (
    <HeaderClient
      logoUrl={ts?.siteLogo?.node?.sourceUrl ?? null}
      ticker={ts?.newsTicker ?? null}
      navItems={nav}
      mobileNavItems={mobile}
      menuPromoImage={ts?.menuBackgroundImage?.node?.sourceUrl ?? null}
      whatsappHref={whatsappHref}
      bookButtonText={ts?.bookButton ?? "Book a Call"}
      bookButtonHref={
        ts?.bookButtonLink ??
        "https://calendly.com/triolla/pitangoux-introductory-meeting-clone"
      }
      contactButtonText={ts?.contactButton ?? "Contact Us"}
      contactButtonHref={ts?.contactButtonLink ?? "/contact-us"}
    />
  );
}
