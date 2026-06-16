import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import { BfcacheReloader } from '@/components/BfcacheReloader'
import { MotionProvider } from '@/components/MotionProvider'
import { OrganizationJsonLd } from '@/components/OrganizationJsonLd'
import { locales, defaultLocale, isLocale, dir, htmlLang } from '@/lib/i18n'
import { SITE_URL } from '@/lib/site'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  // metadataBase makes the relative `alternates`/canonical paths on child pages
  // resolve to absolute URLs — required for correct hreflang and OG tags that
  // crawlers and LLMs rely on.
  metadataBase: new URL(SITE_URL),
  title: 'Triolla | Product Design & Development',
  description: 'Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const loc = isLocale(locale) ? locale : defaultLocale

  return (
    <html lang={htmlLang[loc]} dir={dir[loc]} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F5F5F5] text-black selection:bg-yellow-400 selection:text-black pb-[env(safe-area-inset-bottom)]">
        <MotionProvider>
          <Header locale={loc} />
          <main className="grow">{children}</main>
          <Footer locale={loc} />
          <CookieBanner />
        </MotionProvider>
        <BfcacheReloader />
        <OrganizationJsonLd />
      </body>
    </html>
  )
}
