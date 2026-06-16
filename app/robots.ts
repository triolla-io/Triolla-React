import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Explicitly welcomes AI/LLM crawlers (ClaudeBot, GPTBot, PerplexityBot,
// Google-Extended, …) alongside traditional search bots so the site is
// readable by generative engines. The `*` rule already allows everything; the
// named AI agents are listed so the intent is unambiguous and resistant to any
// future tightening of a shared default.
export default function robots(): MetadataRoute.Robots {
  const aiBots = [
    'ClaudeBot',
    'anthropic-ai',
    'Claude-Web',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'cohere-ai',
    'Bytespider',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...aiBots.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
