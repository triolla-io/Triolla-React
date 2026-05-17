import Link from "next/link";
import { client } from "@/lib/apollo-client";
import { GET_FOOTER_DATA } from "@/lib/queries";
import { gql } from "@apollo/client";

/* ── Types ──────────────────────────────────────────────── */

interface MenuItem { label: string; url: string; }
interface WPMenu  { name: string; slug: string; menuItems: { nodes: MenuItem[] }; }
interface FooterQueryResult { menus: { nodes: WPMenu[] }; }

/* ── Static data (sourced from live WP footer.html) ──────── */

const CONTACT = {
  email:    "Fun@triolla.io",
  phoneTlv: "+972-73-744-3322",
  phoneNy:  "+1408-627-7350",
  whatsapp: "https://wa.me/+972525956644?text=שלום, הייתי רוצה לשמוע עוד פרטים...",
  calendly: "https://calendly.com/triolla/pitangoux-introductory-meeting-clone",
};

const SOCIALS = [
  { name: "Facebook",  url: "https://www.facebook.com/triollaofficial" },
  { name: "LinkedIn",  url: "https://www.linkedin.com/company/triolla-official/" },
  { name: "Instagram", url: "https://www.instagram.com/triollaofficial/" },
  { name: "TikTok",    url: "https://www.tiktok.com/@triolla.io" },
  { name: "Dribbble",  url: "https://dribbble.com/Triolla" },
  { name: "Behance",   url: "https://www.behance.net/asaf8ac9" },
];

const MENTIONS = [
  { name: "13TV",      url: "https://13tv.co.il/item/special/recommended/economy/k2fy3-902776824/",                                                               logo: "https://triolla.io/wp-content/uploads/2025/05/logo_736.svg" },
  { name: "BizPortal", url: "https://www.bizportal.co.il/BizTech/news/article/20015580",                                                                           logo: "https://triolla.io/wp-content/uploads/2025/05/logo_biz_735.svg" },
  { name: "TheMarker", url: "https://www.themarker.com/labels/2021-04-05/ty-article-labels/0000017f-f88a-d044-adff-fbfb48ad0000",                                  logo: "https://triolla.io/wp-content/uploads/2025/05/logo_marker_731.svg" },
  { name: "Globes",    url: "https://www.globes.co.il/news/article.aspx?did=1001450720",                                                                           logo: "https://triolla.io/wp-content/uploads/2025/05/logo_732.svg" },
  { name: "PC.co.il",  url: "https://www.pc.co.il/featured/420350/",                                                                                               logo: "https://triolla.io/wp-content/uploads/2025/05/logo_733.svg" },
  { name: "Mako",      url: "https://www.mako.co.il/special-articles/Article-c2a83bbe7224d71026.htm",                                                              logo: "https://triolla.io/wp-content/uploads/2025/05/logo_mako_734.svg" },
];

const SQLINK = {
  url:  "https://www.sqlink.com/",
  logo: "https://triolla.io/wp-content/themes/triolla/images/sqlink_icon.png",
};

const MENU_COLUMNS = [
  {
    heading: "Product Design",
    slug: "product-menu",
    fallback: [
      { label: "Product UX & UI Design",  url: "/services/product-ux-ui-design" },
      { label: "UX Research",             url: "/services/ux-research" },
      { label: "Prototype",               url: "/services/prototyping" },
      { label: "Digital Branding",        url: "/branding-studio" },
      { label: "Front End Development",   url: "/services/front-end-dev" },
    ],
  },
  {
    heading: "Case Studies",
    slug: "case-study-menu",
    fallback: [
      { label: "Mobile Apps",       url: "/mobile-apps" },
      { label: "Fintech & Finance", url: "/fintech-finance" },
      { label: "IOT & Devices",     url: "/device-iot" },
      { label: "SaaS",              url: "/saas-platforms" },
      { label: "Gaming",            url: "/gaming" },
      { label: "Medical",           url: "/medical-healthcare" },
      { label: "Agritech",          url: "/agritech" },
    ],
  },
  {
    heading: "Technology",
    slug: "technology-menu",
    fallback: [
      { label: "Dev & Technology", url: "/technology" },
      { label: "Front End",        url: "/services/front-end-dev" },
      { label: "React.js",         url: "/services/front-end-dev" },
      { label: "Vue.js",           url: "/services/front-end-dev" },
      { label: "Back End",         url: "/services/back-end-dev" },
      { label: "Node.js",          url: "/services/back-end-dev" },
    ],
  },
  {
    heading: "About",
    slug: "company-menu",
    fallback: [
      { label: "About us",           url: "/about-us" },
      { label: "Careers",            url: "/careers" },
      { label: "Our Services",       url: "/services" },
      { label: "Talk to us",         url: "/contact-us" },
      { label: "Press",              url: "https://www.themarker.com/labels/2021-04-05/ty-article-labels/0000017f-f88a-d044-adff-fbfb48ad0000" },
      { label: "Accessibility",      url: "/accessibility-statement" },
    ],
  },
  {
    heading: "Our Blog",
    slug: "blog-menu",
    fallback: [
      { label: "All Blogs",         url: "/blog" },
      { label: "Fintech & Finance", url: "/blog/the-fintech-ux-playbook/" },
      { label: "IOT & Devices",     url: "/blog/designing-intuitive-and-secure-iot-products-for-the-future/" },
      { label: "SaaS",              url: "/blog/the-3-most-common-pain-points-when-hiring-ui-ux-agency-for-a-saas-product/" },
      { label: "Gaming",            url: "/blog/level-up-your-gaming-app-with-triollas-expert-ux-tips-boost-user-engagement-and-retention/" },
      { label: "Medical",           url: "/blog/ux-in-medtech-when-trust-is-a-matter-of-life-and-death/" },
      { label: "Agritech",          url: "/blog/designing-an-engaging-and-effective-agritech-app/" },
    ],
  },
];

/* ── Data fetching ──────────────────────────────────────── */

async function getFooterMenus(): Promise<WPMenu[]> {
  try {
    const { data } = await client.query<FooterQueryResult>({
      query: gql`${GET_FOOTER_DATA}`,
    });
    return data?.menus?.nodes ?? [];
  } catch {
    return [];
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
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
  ) : (
    <Link href={href} className={cls}>{label}</Link>
  );
}

/* ── Social icon SVGs ───────────────────────────────────── */

function FacebookIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function DribbbleIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
    </svg>
  );
}

function BehanceIcon() {
  return (
    <svg width="18" height="16" fill="currentColor" viewBox="0 0 24 16" aria-hidden="true">
      <path d="M7.443 5.35c.639 0 1.23.05 1.77.198.54.099 1.031.297 1.42.545.389.248.687.595.883 1.039.196.444.294.98.294 1.607 0 .694-.147 1.29-.441 1.735-.295.444-.737.84-1.326 1.186.787.198 1.376.595 1.77 1.186.393.59.589 1.285.589 2.127 0 .694-.147 1.29-.442 1.784-.295.494-.687.889-1.18 1.186-.492.297-1.031.544-1.67.694-.638.148-1.277.248-1.917.248H0V5.35h7.443zm-.344 5.302c.54 0 .982-.148 1.326-.395.344-.248.491-.644.491-1.136 0-.294-.05-.544-.147-.74-.1-.199-.246-.346-.44-.445-.196-.1-.393-.198-.64-.248-.246-.05-.491-.05-.786-.05H2.556v3.014h4.543zm.197 5.5c.295 0 .59-.05.835-.099.246-.05.491-.148.687-.297.196-.148.344-.346.491-.594.099-.248.197-.545.197-.89 0-.693-.196-1.186-.59-1.484-.393-.297-.884-.445-1.473-.445H2.556v3.81h4.74zM16.935 11.5c.344.347.835.543 1.47.543.393 0 .786-.099 1.13-.297.344-.198.54-.445.638-.693h2.358c-.393 1.14-.983 1.982-1.769 2.525-.786.545-1.77.79-2.949.79-.786 0-1.523-.099-2.162-.346-.638-.248-1.18-.595-1.622-1.039-.442-.445-.786-.98-1.032-1.584-.246-.595-.343-1.29-.343-1.982 0-.693.099-1.387.343-1.982.245-.594.59-1.14 1.032-1.584.442-.444.984-.79 1.622-1.038.64-.248 1.375-.347 2.162-.347.886 0 1.67.148 2.308.494.638.347 1.18.793 1.622 1.387.44.593.736 1.237.884 1.98.098.742.098 1.533 0 2.225h-6.995c.05.79.294 1.384.637 1.731zm3.21-4.857c-.295-.346-.786-.494-1.425-.494-.393 0-.737.05-1.031.198-.295.148-.491.297-.688.494-.196.198-.295.396-.344.594-.099.198-.099.395-.147.544h4.29c-.098-.644-.394-1.09-.655-1.336zM15.167 4.9H20.7V3.566h-5.533V4.9z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <rect x="1" y="2.5" width="14" height="13" rx="2" />
      <path strokeLinecap="round" d="M1 6.5h14M5 1v3M11 1v3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.16.813-2.14 1.963-2.338C5.42 3.793 6.75 3.5 8 3.5c1.25 0 2.58.293 3.787.5 1.15.198 1.963 1.178 1.963 2.338v1.104c0 .88-.51 1.68-1.307 2.052l-1.298.606a.75.75 0 00-.384.964 9.003 9.003 0 004.172 4.172.75.75 0 00.964-.384l.606-1.298A2.25 2.25 0 0118.552 12h1.104c1.16 0 2.14.813 2.338 1.963.207 1.207.5 2.537.5 3.787 0 1.25-.293 2.58-.5 3.787-.198 1.15-1.178 1.963-2.338 1.963H18a15.75 15.75 0 01-15.75-15.75V6.338z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M9.995 0C4.47 0 0 4.475 0 10c0 5.525 4.47 10 9.995 10C15.52 20 20 15.525 20 10 20 4.475 15.52 0 9.995 0zm6.925 6H13.97c-.325-1.25-.78-2.45-1.38-3.56A8.495 8.495 0 0116.92 6zM10 2.035c.835 1.2 1.485 2.535 1.91 3.965H8.09C8.515 4.57 9.165 3.235 10 2.035zM2.26 12A8.01 8.01 0 012 10c0-.69.095-1.36.26-2h3.375C5.555 8.655 5.5 9.32 5.5 10c0 .68.055 1.345.14 2H2.26zM3.075 14h2.95c.325 1.25.78 2.45 1.38 3.565A8.477 8.477 0 013.075 14zm2.95-8H3.075A8.477 8.477 0 017.405 2.435C6.805 3.55 6.35 4.75 6.025 6zM10 17.965c-.83-1.2-1.48-2.535-1.91-3.965h3.82c-.43 1.43-1.08 2.765-1.91 3.965zM12.34 12H7.66A12.23 12.23 0 017.5 10c0-.68.065-1.345.16-2h4.68c.095.655.16 1.32.16 2 0 .68-.065 1.345-.16 2zm.255 5.56c.6-1.115 1.055-2.31 1.38-3.56h2.95a8.497 8.497 0 01-4.33 3.56zM14.36 12c.08-.655.14-1.32.14-2 0-.68-.055-1.345-.14-2h3.375c.165.64.265 1.31.265 2s-.1 1.36-.265 2H14.36z"/>
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────── */

export default async function Footer() {
  const wpMenus = await getFooterMenus();

  const columns = MENU_COLUMNS.map((col) => {
    const wpMenu = wpMenus.find(
      (m) =>
        m.slug === col.slug ||
        m.slug === `footer-${col.slug}` ||
        m.name.toLowerCase().replace(/\s+/g, "-") === col.slug
    );
    const items =
      wpMenu?.menuItems?.nodes?.length ? wpMenu.menuItems.nodes : col.fallback;
    return { heading: col.heading, items };
  });

  return (
    <footer className="bg-[#0f0f0f] text-white overflow-hidden">

      {/* ══════════════════════════════════════════
          MOBILE CTA BAR (Talk to us — mobile only)
      ══════════════════════════════════════════ */}
      <div className="footmob-cta lg:hidden border-b border-white/5 py-5 px-4">
        <h5 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Talk to us</h5>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-3">
            <a href={CONTACT.calendly} target="_blank" rel="noopener noreferrer"
              className="footer-btn-primary text-sm px-4 py-2">
              <CalendarIcon /> Book a Call
            </a>
            <Link href="/contact-us" className="footer-btn-outline text-sm px-4 py-2">Contact Us</Link>
          </div>
          <div className="flex gap-2">
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <WhatsAppIcon />
            </a>
            <a href={`tel:${CONTACT.phoneTlv.replace(/-/g, "")}`}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <PhoneIcon />
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <div className="footer-cta-band relative overflow-hidden border-b border-white/5">
        <div className="footer-cta-grid" aria-hidden="true" />
        <div className="footer-cta-orb footer-cta-orb--1" aria-hidden="true" />
        <div className="footer-cta-orb footer-cta-orb--2" aria-hidden="true" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="footer-eyebrow">
              <span className="footer-eyebrow__dot" />
              Let&apos;s work together
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mt-4 leading-[0.95]">
              Ready to build something{" "}
              <span className="footer-cta-accent">extraordinary?</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            <a
              href={CONTACT.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-btn-primary"
            >
              <CalendarIcon />
              Book a Call
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-btn-ghost"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <Link href="/contact-us" className="footer-btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MENTIONS STRIP
      ══════════════════════════════════════════ */}
      <div className="border-b border-white/5 py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <span className="footer-mentions-label">Featured In</span>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 md:gap-10">
              {MENTIONS.map((m) => (
                <a
                  key={m.name}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-mention"
                  aria-label={m.name}
                >
                  <img
                    src={m.logo}
                    alt={m.name}
                    className="footer-mention__img"
                    width={100}
                    height={36}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN NAV GRID
      ══════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-12">

          {/* 5 WP-driven nav columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="footer-col-heading">{col.heading}</h3>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <NavLink label={item.label} url={item.url} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social + Contact column */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="footer-col-heading">Social</h3>
            <ul className="space-y-3 mb-10">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-nav-link"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="footer-col-heading">Talk to Us</h3>
            <div className="space-y-4">
              <div>
                <div className="footer-contact-label">Mail</div>
                <a href={`mailto:${CONTACT.email}`} className="footer-nav-link">
                  {CONTACT.email}
                </a>
              </div>
              <div>
                <div className="footer-contact-label">TLV Offices</div>
                <a href={`tel:${CONTACT.phoneTlv.replace(/-/g, "")}`} className="footer-nav-link">
                  {CONTACT.phoneTlv}
                </a>
              </div>
              <div>
                <div className="footer-contact-label">NY Offices</div>
                <a href={`tel:${CONTACT.phoneNy.replace(/[-+]/g, "")}`} className="footer-nav-link">
                  {CONTACT.phoneNy}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Main row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            {/* Left: logo */}
            <Link href="/">
              <img
                src="https://triolla.io/wp-content/uploads/2025/05/triolla.svg"
                alt="Triolla"
                width={92}
                height={30}
                className="h-7 w-auto brightness-0 invert"
              />
            </Link>

            {/* Center: copyright + legal inline */}
            <p className="text-[#4b5563] text-sm text-center">
              All rights reserved to Triolla LTD
              {" | "}
              <Link href="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
              {" | "}
              <Link href="/terms-of-use" className="footer-bottom-link">Terms of Use</Link>
            </p>

            {/* Mobile social icons */}
            <div className="flex items-center gap-3 md:hidden">
              <a href="https://www.tiktok.com/@triolla.io" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TikTokIcon />
              </a>
              <a href="https://www.instagram.com/triollaofficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/triollaofficial" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
            </div>

            {/* Right: globe + language + sqlink + social (desktop) */}
            <div className="hidden md:flex items-center gap-5">
              <div className="footer-lang flex items-center gap-2">
                <GlobeIcon />
                <a href="https://triolla.io/" target="_blank" rel="noopener noreferrer" className="footer-lang__opt footer-lang__opt--active">Eng</a>
                <span className="footer-lang__sep">/</span>
                <a href="https://triolla.io/he/" target="_blank" rel="noopener noreferrer" className="footer-lang__opt">Heb</a>
              </div>
              <a href={SQLINK.url} target="_blank" rel="noopener noreferrer" className="footer-sqlink">
                Part of
                <img src={SQLINK.logo} alt="Sqlink" className="h-5 w-auto" />
              </a>
              <div className="flex items-center gap-3">
                <a href="https://www.linkedin.com/company/triolla-official/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-icon">
                  <LinkedInIcon />
                </a>
                <a href="https://www.tiktok.com/@triolla.io" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer-social-icon">
                  <TikTokIcon />
                </a>
                <a href="https://www.instagram.com/triollaofficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-icon">
                  <InstagramIcon />
                </a>
                <a href="https://www.facebook.com/triollaofficial" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-icon">
                  <FacebookIcon />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STYLES
      ══════════════════════════════════════════ */}
      <style>{`
        /* ── CTA band ──────────────────────────── */
        .footer-cta-band {
          background: #0a0a0a;
        }
        .footer-cta-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 90% 80% at 50% 50%, black 0%, transparent 100%);
          pointer-events: none;
        }
        .footer-cta-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .footer-cta-orb--1 {
          top: -30%;
          right: 10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 65%);
        }
        .footer-cta-orb--2 {
          bottom: -30%;
          left: 5%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%);
        }

        /* ── CTA eyebrow ───────────────────────── */
        .footer-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #facc15;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }
        .footer-eyebrow__dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #facc15;
          box-shadow: 0 0 6px rgba(250,204,21,0.8);
          animation: footerDotBlink 2.4s ease-in-out infinite;
        }
        @keyframes footerDotBlink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }

        /* ── CTA headline accent ───────────────── */
        .footer-cta-accent {
          background: linear-gradient(90deg, #facc15 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── CTA buttons ───────────────────────── */
        .footer-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #facc15;
          color: #000;
          font-weight: 700;
          font-size: 15px;
          padding: 13px 24px;
          border-radius: 999px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .footer-btn-primary:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(250,204,21,0.28);
        }
        .footer-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.75);
          font-weight: 600;
          font-size: 15px;
          padding: 13px 24px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .footer-btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-2px);
        }
        .footer-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          font-size: 15px;
          padding: 13px 24px;
          border-radius: 999px;
          transition: border-color 0.2s, color 0.2s, transform 0.2s;
          white-space: nowrap;
        }
        .footer-btn-outline:hover {
          border-color: rgba(255,255,255,0.4);
          color: #fff;
          transform: translateY(-2px);
        }

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

        /* ── Nav links with underline slide-in ─── */
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
        .footer-nav-link:hover {
          color: #e5e7eb;
        }
        .footer-nav-link:hover::after {
          width: 100%;
        }

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
        .footer-bottom-link:hover {
          color: #e5e7eb;
        }
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
        .footer-lang__opt--active {
          color: #e5e7eb;
        }
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
        .footer-sqlink:hover {
          color: #9ca3af;
          opacity: 1;
        }
        .footer-social-icon {
          display: flex;
          align-items: center;
          color: #4b5563;
          transition: color 0.2s;
        }
        .footer-social-icon:hover {
          color: #e5e7eb;
        }
      `}</style>

    </footer>
  );
}
