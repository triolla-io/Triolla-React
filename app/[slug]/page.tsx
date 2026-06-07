import { client } from "@/lib/apollo-client";
import {
  GET_PORTFOLIO_PAGE,
  GET_PORTFOLIO_SLUGS,
  GET_THEME_SETTINGS,
} from "@/lib/queries";
import { gql } from "@apollo/client";
import { notFound } from "next/navigation";
import { PortfolioTemplate } from "@/components/PortfolioTemplate";

// Only slugs returned by generateStaticParams resolve here; any other slug 404s.
// Static route folders (about-us, services, technology) take Next.js precedence
// over this dynamic segment, so they are never reached by [slug].
export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PORTFOLIO_SLUGS}
      `,
    });
    const nodes: any[] = data?.pages?.nodes ?? [];
    return nodes
      .filter((n) => n?.template?.__typename === "Template_PortfolioPage")
      .map((n) => ({ slug: (n.uri ?? "").replace(/^\/+|\/+$/g, "") }))
      .filter((p) => p.slug.length > 0);
  } catch {
    // Build emits no portfolio routes rather than crashing.
    return [];
  }
}

async function getPortfolioData(slug: string) {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_PORTFOLIO_PAGE}
      `,
      variables: { uri: slug },
    });
    return data?.page?.template?.portfolioFields ?? null;
  } catch {
    return null;
  }
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

export default async function PortfolioSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pf, ts] = await Promise.all([
    getPortfolioData(slug),
    getThemeSettings(),
  ]);

  // Empty/failed fetch, or a page not actually on the portfolio template.
  if (!pf || Object.keys(pf).length === 0) notFound();

  return <PortfolioTemplate pf={pf} ts={ts} />;
}
