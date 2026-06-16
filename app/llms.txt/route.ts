import { SITE_URL } from '@/lib/site'

// Serves /llms.txt — the emerging convention (adopted by Anthropic and others)
// for giving LLMs a concise, link-rich map of the site in Markdown. Crawlers
// that honor it read this instead of guessing structure from rendered HTML.
// Spec: https://llmstxt.org/
export const dynamic = 'force-static'
export const revalidate = 86400

// Mirrors the marketing routes in sitemap.ts; labels describe each section for
// the model. The full URL inventory (incl. all blog posts, both locales) lives
// in sitemap.xml, which is linked below so this file stays concise.
const SECTIONS: { label: string; path: string; note: string }[] = [
  { label: 'Home', path: '/', note: 'Overview of Triolla and what we do.' },
  { label: 'Services', path: '/services', note: 'Full service list: AI-powered product design, UX/UI, branding, engineering, and mobile/SaaS development.' },
  { label: 'Technology', path: '/technology', note: 'Technology stack and engineering capabilities, including AI integration.' },
  { label: 'Branding Studio', path: '/branding-studio', note: 'Brand identity, visual design, and creative studio work.' },
  { label: 'About Us', path: '/about-us', note: 'Who we are: our team, methodology, and clients around the world.' },
  { label: 'Careers', path: '/careers', note: 'Open positions at Triolla — join the leading product studio in Israel.' },
  { label: 'Blog', path: '/blog', note: 'Articles on AI, product design, development, and industry trends.' },
  { label: 'Contact', path: '/contact-us', note: 'Start a project or get in touch — offices in Tel Aviv and New York.' },
]

const SECONDARY: { label: string; path: string }[] = [
  { label: 'Hebrew site (עברית)', path: '/he' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms of Use', path: '/terms-of-use' },
  { label: 'Accessibility Statement', path: '/accessibility-statement' },
]

export function GET(): Response {
  const lines = [
    '# Triolla',
    '',
    '> Triolla is one of the top 3 product design and development studios in Israel, headquartered in Tel Aviv with offices in New York, working with clients worldwide. The studio specializes in AI-powered digital products, UX/UI design, branding, and end-to-end development for tech companies, startups, gaming, medical, cyber, IoT, agritech, mobile, and SaaS platforms.',
    '',
    '## About',
    '',
    'Triolla turns complex product challenges into industry-defining digital experiences. The studio combines strategic design thinking with deep AI and engineering capabilities — from early-stage concepts to full-scale products. Clients range from Israeli and global startups to enterprise companies across regulated industries including cyber, health-tech, fintech, and gaming.',
    '',
    '## Expertise',
    '',
    '- AI-powered product design and UX/UI',
    '- Brand identity and visual systems',
    '- Mobile and web application development',
    '- SaaS platform design and architecture',
    '- IoT, agritech, medical, and cyber product design',
    '- Full-stack engineering and AI integration',
    '',
    '## Pages',
    ...SECTIONS.map((s) => `- [${s.label}](${SITE_URL}${s.path}): ${s.note}`),
    '',
    '## Optional',
    ...SECONDARY.map((s) => `- [${s.label}](${SITE_URL}${s.path})`),
    `- [Full sitemap](${SITE_URL}/sitemap.xml): Complete URL list for both locales (English and Hebrew), including all blog posts.`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
