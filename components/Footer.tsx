import Link from "next/link";
import { client } from "@/lib/apollo-client";
import { GET_FOOTER_DATA, GET_THEME_SETTINGS } from "@/lib/queries";
import { gql } from "@apollo/client";
import { SectionReveal } from "@/components/SectionReveal";

/* ── Types ──────────────────────────────────────────────── */

interface MenuItem {
  label: string;
  url: string;
}
interface WPMenu {
  name: string;
  slug: string;
  menuItems: { nodes: MenuItem[] };
}
interface FooterQueryResult {
  menus: { nodes: WPMenu[] };
}

interface MentionLogo {
  mentionLogo?: { node?: { sourceUrl?: string } } | null;
  mentionLogoLink?: string | null;
}

interface SocialItem {
  socialMediaLink?: string | null;
  socialMediaText?: string | null;
}

const MENU_COLUMNS = [
  {
    heading: "Product Design",
    slug: "product-menu",
    fallback: [
      {
        label: "Product UX & UI Design",
        url: "/services/product-ux-ui-design",
      },
      { label: "UX Research", url: "/services/ux-research" },
      { label: "Prototype", url: "/services/prototyping" },
      { label: "Digital Branding", url: "/branding-studio" },
      { label: "Front End Development", url: "/services/front-end-dev" },
    ],
  },
  {
    heading: "Case Studies",
    slug: "case-study-menu",
    fallback: [
      { label: "Mobile Apps", url: "/mobile-apps" },
      { label: "Fintech & Finance", url: "/fintech-finance" },
      { label: "IOT & Devices", url: "/device-iot" },
      { label: "SaaS", url: "/saas-platforms" },
      { label: "Gaming", url: "/gaming" },
      { label: "Medical", url: "/medical-healthcare" },
      { label: "Agritech", url: "/agritech" },
    ],
  },
  {
    heading: "Technology",
    slug: "technology-menu",
    fallback: [
      { label: "Dev & Technology", url: "/technology" },
      { label: "Front End", url: "/services/front-end-dev" },
      { label: "React.js", url: "/services/front-end-dev" },
      { label: "Vue.js", url: "/services/front-end-dev" },
      { label: "Back End", url: "/services/back-end-dev" },
      { label: "Node.js", url: "/services/back-end-dev" },
    ],
  },
  {
    heading: "About",
    slug: "company-menu",
    fallback: [
      { label: "About us", url: "/about-us" },
      { label: "Careers", url: "/careers" },
      { label: "Our Services", url: "/services" },
      { label: "Talk to us", url: "/contact-us" },
      {
        label: "Press",
        url: "https://www.themarker.com/labels/2021-04-05/ty-article-labels/0000017f-f88a-d044-adff-fbfb48ad0000",
      },
      { label: "Accessibility", url: "/accessibility-statement" },
    ],
  },
  {
    heading: "Our Blog",
    slug: "blog-menu",
    fallback: [
      { label: "All Blogs", url: "/blog" },
      { label: "Fintech & Finance", url: "/blog/the-fintech-ux-playbook/" },
      {
        label: "IOT & Devices",
        url: "/blog/designing-intuitive-and-secure-iot-products-for-the-future/",
      },
      {
        label: "SaaS",
        url: "/blog/the-3-most-common-pain-points-when-hiring-ui-ux-agency-for-a-saas-product/",
      },
      {
        label: "Gaming",
        url: "/blog/level-up-your-gaming-app-with-triollas-expert-ux-tips-boost-user-engagement-and-retention/",
      },
      {
        label: "Medical",
        url: "/blog/ux-in-medtech-when-trust-is-a-matter-of-life-and-death/",
      },
      {
        label: "Agritech",
        url: "/blog/designing-an-engaging-and-effective-agritech-app/",
      },
    ],
  },
];

const COL_HEADING_FIELDS = [
  "footmenuTitleOne",
  "footmenuTitleTwo",
  "footmenuTitleThree",
  "footmenuTitleFour",
  "footmenuTitleFive",
] as const;

/* ── Data fetching ──────────────────────────────────────── */

async function getFooterMenus(): Promise<WPMenu[]> {
  try {
    const { data } = await client.query<FooterQueryResult>({
      query: gql`
        ${GET_FOOTER_DATA}
      `,
    });
    return data?.menus?.nodes ?? [];
  } catch {
    return [];
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

/* ── Helpers ────────────────────────────────────────────── */

function isExternal(url: string): boolean {
  return url.startsWith("http") && !url.includes("triolla.io");
}

function toHref(url: string): string {
  if (isExternal(url)) return url;
  return url.replace(/^https?:\/\/triolla\.io/, "") || "/";
}

function NavLink({ label, url }: { label: string; url: string }) {
  const href = toHref(url);
  const cls = "footer-nav-link";
  return isExternal(url) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}

/* ── Social icon SVGs ───────────────────────────────────── */

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="15"
      height="15"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.995 0C4.47 0 0 4.475 0 10c0 5.525 4.47 10 9.995 10C15.52 20 20 15.525 20 10 20 4.475 15.52 0 9.995 0zm6.925 6H13.97c-.325-1.25-.78-2.45-1.38-3.56A8.495 8.495 0 0116.92 6zM10 2.035c.835 1.2 1.485 2.535 1.91 3.965H8.09C8.515 4.57 9.165 3.235 10 2.035zM2.26 12A8.01 8.01 0 012 10c0-.69.095-1.36.26-2h3.375C5.555 8.655 5.5 9.32 5.5 10c0 .68.055 1.345.14 2H2.26zM3.075 14h2.95c.325 1.25.78 2.45 1.38 3.565A8.477 8.477 0 013.075 14zm2.95-8H3.075A8.477 8.477 0 017.405 2.435C6.805 3.55 6.35 4.75 6.025 6zM10 17.965c-.83-1.2-1.48-2.535-1.91-3.965h3.82c-.43 1.43-1.08 2.765-1.91 3.965zM12.34 12H7.66A12.23 12.23 0 017.5 10c0-.68.065-1.345.16-2h4.68c.095.655.16 1.32.16 2 0 .68-.065 1.345-.16 2zm.255 5.56c.6-1.115 1.055-2.31 1.38-3.56h2.95a8.497 8.497 0 01-4.33 3.56zM14.36 12c.08-.655.14-1.32.14-2 0-.68-.055-1.345-.14-2h3.375c.165.64.265 1.31.265 2s-.1 1.36-.265 2H14.36z" />
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────── */

export default async function Footer() {
  const [ts, wpMenus] = await Promise.all([
    getThemeSettings(),
    getFooterMenus(),
  ]);

  const colHeadings: (string | null)[] = COL_HEADING_FIELDS.map(
    (field) => ts?.[field] ?? null,
  );

  const columns = MENU_COLUMNS.map((col, i) => {
    const wpMenu = wpMenus.find(
      (m) =>
        m.slug === col.slug ||
        m.slug === `footer-${col.slug}` ||
        m.name.toLowerCase().replace(/\s+/g, "-") === col.slug,
    );
    const items = wpMenu?.menuItems?.nodes?.length
      ? wpMenu.menuItems.nodes
      : col.fallback;
    return { heading: colHeadings[i] ?? col.heading, items };
  });

  const mentions: MentionLogo[] = ts?.mentionsLogos?.length
    ? ts.mentionsLogos
    : [];
  const socials: SocialItem[] = ts?.socialMenuItems?.length
    ? ts.socialMenuItems
    : [];

  const logoUrl: string = ts?.siteLogo?.node?.sourceUrl ?? "";
  const sqlinkUrl: string = ts?.sqlink ?? "";
  const emailAddress: string = ts?.emailAddress ?? "";
  const tlvLabel: string = ts?.tlvOfficesLabel ?? "";
  const tlvPhone: string = ts?.tlvOfficesPhone ?? "";
  const nyLabel: string = ts?.nyOfficesLabel ?? "";
  const nyPhone: string = ts?.nyOfficesPhone ?? "";
  const privacyText: string | null = ts?.footerPrivacyText ?? null;
  const privacyLink: string | null = ts?.footerPrivacyLink ?? null;
  const termText: string | null = ts?.footerTermText ?? null;
  const termLink: string | null = ts?.footerTermLink ?? null;
  const mentionsLabel: string = ts?.footerMentionsLabel ?? "";
  const fbLink: string = ts?.facebookLink ?? "";
  const igLink: string = ts?.instagramLink ?? "";
  const ttLink: string = ts?.tiktokLink ?? "";
  const liLink: string = ts?.linkedinLink ?? "";

  return (
    <footer className="bg-[#0f0f0f] text-white overflow-hidden">
      {/* ══════════════════════════════════════════
          MENTIONS STRIP
      ══════════════════════════════════════════ */}
      {mentions.length > 0 && (
        <div className="border-b border-white/5 py-5 md:py-8">
          <div className="w-[90%] mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10">
              {mentionsLabel && (
                <span className="footer-mentions-label shrink-0">{mentionsLabel}</span>
              )}
              <div className="flex overflow-x-auto sm:flex-wrap items-center justify-start sm:justify-start gap-5 md:gap-10 hide-scrollbar w-full sm:w-auto">
                {mentions.map((m, i) => {
                  const src = m.mentionLogo?.node?.sourceUrl;
                  if (!src) return null;
                  return (
                    <a
                      key={i}
                      href={m.mentionLogoLink ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-mention"
                    >
                      <img
                        src={src}
                        alt=""
                        className="footer-mention__img"
                        width={100}
                        height={36}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN NAV GRID
      ══════════════════════════════════════════ */}
      <div className="w-[90%] mx-auto py-10 md:py-16">
        <SectionReveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-x-5 md:gap-x-8 gap-y-10 md:gap-y-12">
          {[
            ...columns.map((col, i) => (
              <div key={i}>
                {col.heading && (
                  <h3 className="footer-col-heading">{col.heading}</h3>
                )}
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <NavLink label={item.label} url={item.url} />
                    </li>
                  ))}
                </ul>
              </div>
            )),
            ...(socials.length > 0
              ? [
                  <div key="social">
                    <h3 className="footer-col-heading">Social</h3>
                    <ul className="space-y-3">
                      {socials.map((s, i) => (
                        <li key={i}>
                          {s.socialMediaLink && s.socialMediaText ? (
                            <a
                              href={s.socialMediaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="footer-nav-link"
                            >
                              {s.socialMediaText}
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>,
                ]
              : []),
            <div key="contact">
              <h3 className="footer-col-heading">Talk to Us</h3>
              <div className="space-y-4">
                {emailAddress && (
                  <div>
                    <div className="footer-contact-label">Mail</div>
                    <a
                      href={`mailto:${emailAddress}`}
                      className="footer-nav-link"
                    >
                      {emailAddress}
                    </a>
                  </div>
                )}
                {tlvPhone && (
                  <div>
                    <div className="footer-contact-label">
                      {tlvLabel ?? "TLV Offices"}
                    </div>
                    <a
                      href={`tel:${tlvPhone.replace(/[^+\d]/g, "")}`}
                      className="footer-nav-link"
                    >
                      {tlvPhone}
                    </a>
                  </div>
                )}
                {nyPhone && (
                  <div>
                    <div className="footer-contact-label">
                      {nyLabel ?? "NY Offices"}
                    </div>
                    <a
                      href={`tel:${nyPhone.replace(/[^+\d]/g, "")}`}
                      className="footer-nav-link"
                    >
                      {nyPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>,
          ]}
        </SectionReveal>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div className="border-t border-white/5 py-4 md:py-6">
        <div className="w-[90%] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Left: logo */}
            <Link href="/">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Triolla"
                  width={92}
                  height={30}
                  className="h-7 w-auto brightness-0 invert"
                />
              ) : null}
            </Link>

            {/* Center: copyright + legal */}
            <p className="text-[#4b5563] text-sm text-center">
              All rights reserved to Triolla LTD
              {privacyText && privacyLink && (
                <>
                  {" | "}
                  <a href={privacyLink} className="footer-bottom-link">
                    {privacyText}
                  </a>
                </>
              )}
              {termText && termLink && (
                <>
                  {" | "}
                  <a href={termLink} className="footer-bottom-link">
                    {termText}
                  </a>
                </>
              )}
            </p>

            {/* Mobile social icons — premium round buttons */}
            <div className="flex items-center gap-3 md:hidden">
              {liLink && (
                <a
                  href={liLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <LinkedInIcon />
                </a>
              )}
              {ttLink && (
                <a
                  href={ttLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <TikTokIcon />
                </a>
              )}
              {igLink && (
                <a
                  href={igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <InstagramIcon />
                </a>
              )}
              {fbLink && (
                <a
                  href={fbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-yellow-400/30 transition-colors"
                >
                  <FacebookIcon />
                </a>
              )}
            </div>

            {/* Right: language + sqlink + social (desktop only) */}
            <div className="hidden md:flex items-center gap-5">
              <div className="footer-lang flex items-center gap-2">
                <GlobeIcon />
                <a
                  href="https://triolla.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-lang__opt footer-lang__opt--active"
                >
                  Eng
                </a>
                <span className="footer-lang__sep">/</span>
                <a
                  href="https://triolla.io/he/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-lang__opt"
                >
                  Heb
                </a>
              </div>
              {sqlinkUrl && (
                <a
                  href={sqlinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-sqlink"
                >
                  Part of
                  <img
                    src="https://triolla.io/wp-content/themes/triolla/images/sqlink_icon.png"
                    alt="Sqlink"
                    className="h-5 w-auto"
                  />
                </a>
              )}
              <div className="flex items-center gap-3">
                {liLink && (
                  <a
                    href={liLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="footer-social-icon"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {ttLink && (
                  <a
                    href={ttLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="footer-social-icon"
                  >
                    <TikTokIcon />
                  </a>
                )}
                {igLink && (
                  <a
                    href={igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="footer-social-icon"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {fbLink && (
                  <a
                    href={fbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="footer-social-icon"
                  >
                    <FacebookIcon />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        /* ── Mentions strip ────────────────────── */
        .footer-mentions-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4b5563;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 80px;
        }
        .footer-mention {
          display: flex;
          align-items: center;
          transition: transform 0.25s, opacity 0.25s;
          opacity: 0.45;
        }
        .footer-mention:hover {
          opacity: 0.85;
          transform: translateY(-2px);
        }
        .footer-mention__img {
          height: 30px;
          width: auto;
          max-width: 110px;
          object-fit: contain;
          filter: brightness(0) invert(1);
          transition: filter 0.25s;
        }
        .footer-mention:hover .footer-mention__img {
          filter: brightness(0) saturate(100%) invert(87%) sepia(63%) saturate(600%) hue-rotate(1deg) brightness(103%) contrast(102%);
        }

        /* ── Nav columns ───────────────────────── */
        .footer-col-heading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #facc15;
          margin-bottom: 20px;
        }
        .footer-nav-link {
          position: relative;
          display: inline-block;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: #facc15;
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .footer-nav-link:hover { color: #e5e7eb; }
        .footer-nav-link:hover::after { width: 100%; }

        /* ── Contact labels ────────────────────── */
        .footer-contact-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 4px;
        }

        /* ── Bottom bar ────────────────────────── */
        .footer-bottom-link {
          color: #4b5563;
          font-size: 13px;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-bottom-link:hover { color: #e5e7eb; }
        .footer-lang {
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #4b5563;
        }
        .footer-lang__opt {
          color: #4b5563;
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-lang__opt:hover,
        .footer-lang__opt--active { color: #e5e7eb; }
        .footer-lang__sep {
          color: #1f2937;
          font-size: 10px;
        }
        .footer-sqlink {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #374151;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s, opacity 0.2s;
          opacity: 0.6;
        }
        .footer-sqlink:hover { color: #9ca3af; opacity: 1; }
        .footer-social-icon {
          display: flex;
          align-items: center;
          color: #4b5563;
          transition: color 0.2s;
        }
        .footer-social-icon:hover { color: #e5e7eb; }

        /* ── Scrollbar hide ───────────────────── */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Mobile overrides ──────────────────── */
        @media (max-width: 768px) {
          .footer-col-heading {
            font-size: 10px;
            margin-bottom: 12px;
          }
          .footer-nav-link {
            font-size: 13px;
          }
          .footer-contact-label {
            font-size: 9px;
          }
          .footer-mention__img {
            height: 22px;
          }
          .footer-mentions-label {
            font-size: 9px;
          }
        }
      `}</style>
    </footer>
  );
}
