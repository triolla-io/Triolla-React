import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import { BfcacheReloader } from '@/components/BfcacheReloader'
import { MotionProvider } from '@/components/MotionProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Triolla | Product Design & Development',
  description: 'Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F5F5F5] text-black selection:bg-yellow-400 selection:text-black pb-[env(safe-area-inset-bottom)]">
        <Header />
        <main className="grow">
          <MotionProvider>{children}</MotionProvider>
        </main>
        <Footer />
        <CookieBanner />
        <BfcacheReloader />
      </body>
    </html>
  )
}
