'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, m } from 'motion/react'
import { wpImg } from '@/lib/images'

export interface ChildItem {
  label: string
  url: string
}

export interface NavItem {
  label: string
  url: string
  children: ChildItem[]
}

export interface HeaderClientProps {
  logoUrl: string | null
  ticker: string | null
  navItems: NavItem[]
  mobileNavItems: NavItem[]
  menuPromoImage: string | null
  whatsappHref: string | null
  bookButtonText: string | null
  bookButtonHref: string | null
  contactButtonText: string | null
  contactButtonHref: string | null
}

function toHref(url: string): string {
  if (!url) return '/'
  if (url.startsWith('http') && !url.includes('triolla.io')) return url
  return url.replace(/^https?:\/\/triolla\.io/, '') || '/'
}

function makeLocalize(isHe: boolean) {
  return (url: string): string => {
    const path = toHref(url)
    if (!isHe || !path.startsWith('/') || path.startsWith('/he')) return path
    return path === '/' ? '/he' : `/he${path}`
  }
}

const PROMO_PANEL_WIDTH = 900

function DropdownItem({ item, pathname, isHe, menuPromoImage }: { item: NavItem; pathname: string; isHe: boolean; menuPromoImage: string | null }) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lp = makeLocalize(isHe)
  const href = lp(item.url)
  const isActive = href !== '/' && pathname.startsWith(href)

  // Content-driven: promo pane shows only for the large (>6-child) dropdown.
  const showPromo = Boolean(menuPromoImage) && item.children.length > 6

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect())
    setOpen(true)
  }

  const handleMouseLeave = () => {
    // 150ms grace period lets the cursor cross the gap between trigger and panel.
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div ref={buttonRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className={`flex items-center gap-1 text-[14px] font-medium transition-colors hover:text-yellow-400 ${
          isActive ? 'text-yellow-400' : 'text-white'
        }`}
      >
        {item.label}
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          className={`mt-px transition-transform duration-200 opacity-70 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        item.children.length > 0 &&
        rect &&
        createPortal(
          <m.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed"
            style={{
              zIndex: 9999,
              top: rect.bottom + 14,
              overflow: 'hidden',
              borderRadius: '26px',
              padding: '22px',
              background: 'rgba(11,11,11,0.82)',
              backdropFilter: 'blur(30px) saturate(150%)',
              WebkitBackdropFilter: 'blur(30px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 30px 80px -16px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.06)',
              ...(showPromo
                ? {
                    left: Math.max(
                      16,
                      Math.min(rect.left + rect.width / 2 - PROMO_PANEL_WIDTH / 2, window.innerWidth - PROMO_PANEL_WIDTH - 16),
                    ),
                    minWidth: Math.min(PROMO_PANEL_WIDTH, window.innerWidth - 32),
                    maxWidth: window.innerWidth - 32,
                  }
                : {
                    left: rect.left + rect.width / 2,
                    transform: 'translateX(-50%)',
                    minWidth: Math.min(item.children.length, 6) > 3 ? 480 : 280,
                  }),
            }}
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current)
              setOpen(true)
            }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gold top hairline */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.6), transparent)',
              }}
            />
            {/* Ambient gold glow */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-90px',
                left: showPromo ? 'auto' : '50%',
                right: showPromo ? '-60px' : 'auto',
                transform: showPromo ? 'none' : 'translateX(-50%)',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(250,204,21,0.10) 0%, transparent 65%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
              }}
            />

            {/* Content row */}
            <div
              className="relative"
              style={{
                zIndex: 1,
                display: 'flex',
                alignItems: 'stretch',
                gap: '28px',
              }}
            >
              {/* Links column */}
              <div style={showPromo ? { display: 'flex', flexDirection: 'column', justifyContent: 'center' } : undefined}>
                {/* Eyebrow — section name from WP */}
                <div className="flex items-center gap-2 px-3 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/35">{item.label}</span>
                </div>

                <div className={`grid gap-x-6 gap-y-0.5 ${item.children.length > 6 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {item.children.map((child, idx) => (
                    <m.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.06 + idx * 0.03,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={lp(child.url)}
                        onClick={() => setOpen(false)}
                        className="group relative flex items-center gap-3 rounded-xl pl-4 pr-3 py-2.5 transition-colors duration-200 hover:bg-white/5 whitespace-nowrap"
                      >
                        {/* Sliding gold rail */}
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-0 rounded-full bg-yellow-400 transition-all duration-300 ease-out group-hover:h-6 group-hover:shadow-[0_0_10px_rgba(250,204,21,0.7)]" />
                        {/* Decorative index */}
                        <span className="text-[10.5px] font-mono tabular-nums text-white/25 group-hover:text-yellow-400 transition-colors duration-200 w-4 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {/* Label */}
                        <span className="flex-1 text-[14px] font-medium text-white/70 group-hover:text-white transition-all duration-200 group-hover:translate-x-0.5">
                          {child.label}
                        </span>
                        {/* Reveal arrow */}
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                          className="text-yellow-400 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shrink-0"
                        >
                          <path
                            d="M3 11L11 3M11 3H5M11 3V9"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </m.div>
                  ))}
                </div>
              </div>

              {/* Promo pane — decorative only, no click target */}
              {showPromo && menuPromoImage && (
                <>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '1px',
                      alignSelf: 'stretch',
                      background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)',
                    }}
                  />
                  <m.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      width: '360px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        background: 'radial-gradient(circle at 50% 45%, rgba(250,204,21,0.35) 0%, transparent 65%)',
                        filter: 'blur(26px)',
                        transform: 'scale(1.2)',
                      }}
                    />
                    <m.img
                      src={wpImg(menuPromoImage) ?? ''}
                      alt=""
                      aria-hidden="true"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 'auto',
                        borderRadius: '18px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 28px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                      }}
                      animate={{ y: [0, -7, 0] }}
                      transition={{
                        duration: 4.5,
                        ease: 'easeInOut',
                        repeat: Infinity,
                      }}
                      whileHover={{ scale: 1.03 }}
                    />
                  </m.div>
                </>
              )}
            </div>
          </m.div>,
          document.body,
        )}
    </div>
  )
}

export function HeaderClient({
  logoUrl,
  ticker,
  navItems,
  mobileNavItems,
  menuPromoImage,
  whatsappHref,
  bookButtonText,
  bookButtonHref,
  contactButtonText,
  contactButtonHref,
}: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTickerDismissed, setIsTickerDismissed] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const pathname = usePathname()
  const isHe = pathname === '/he' || pathname.startsWith('/he/')
  const lp = makeLocalize(isHe)

  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      if (window.scrollY < 40) {
        setIsScrolling(false)
        if (scrollTimer) clearTimeout(scrollTimer)
        return
      }
      setIsScrolling(true)
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => setIsScrolling(false), 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full pointer-events-none">
      {/* Ticker — full width, above the pill */}
      {ticker && !isTickerDismissed && (
        <div className="pointer-events-auto bg-yellow-400 text-black py-1.5 md:py-2 px-10 text-center text-[11px] md:text-[13px] font-medium relative flex items-center justify-center">
          <span>{ticker}</span>
          <button
            type="button"
            className="absolute right-4 text-black hover:opacity-60 transition-opacity"
            aria-label="Close"
            onClick={() => setIsTickerDismissed(true)}
          >
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
              <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Floating pill nav */}
      <div className="pointer-events-auto flex justify-center px-4 pt-4">
        <m.div
          initial={{ maxWidth: 920 }}
          animate={{ maxWidth: isScrolling ? 340 : 920 }}
          transition={{ type: 'spring', stiffness: 120, damping: 28, mass: 1 }}
          className="relative w-full flex items-center bg-[#0a0a0a] text-white rounded-full border border-white/10 shadow-2xl shadow-black/40 px-5 h-[54px] overflow-hidden"
        >
          {/* Logo — always visible */}
          <Link href={isHe ? '/he' : '/'} className="shrink-0 flex items-center">
            {logoUrl ? (
              <img src={wpImg(logoUrl) ?? ''} alt="Triolla" className="h-5 w-auto brightness-0 invert" />
            ) : (
              <span className="text-[18px] font-bold tracking-tight text-white lowercase">triolla</span>
            )}
          </Link>

          {/* Nav + all buttons — fade out while scrolling, always mounted */}
          <m.div
            animate={{ opacity: isScrolling ? 0 : 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ pointerEvents: isScrolling ? 'none' : 'auto' }}
            className="hidden lg:flex items-center gap-6 flex-1 min-w-0"
          >
            <nav className="flex items-center gap-6 flex-1 min-w-0 whitespace-nowrap ml-6">
              {navItems.map((item, i) => {
                const href = lp(item.url)
                if (item.children.length > 0) {
                  return <DropdownItem key={`nav-${item.label}-${i}`} item={item} pathname={pathname} isHe={isHe} menuPromoImage={menuPromoImage} />
                }
                const isActive = pathname === href
                return (
                  <Link
                    key={`nav-${item.label}-${i}`}
                    href={href}
                    className={`relative text-[14px] font-medium transition-colors hover:text-yellow-400 ${
                      isActive ? 'text-yellow-400' : 'text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-yellow-400 rounded-full" />}
                  </Link>
                )
              })}
            </nav>

            {/* WhatsApp + Book buttons */}
            <div className="flex items-center gap-2.5 ml-auto shrink-0">
              <div className="flex items-center gap-2.5">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#1fb958] transition-colors shrink-0"
                    aria-label="WhatsApp"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                )}
                {bookButtonHref && bookButtonText && (
                  <a
                    href={lp(bookButtonHref)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white rounded-full px-5 py-[7px] text-[13px] font-semibold hover:bg-blue-500 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11 2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1V1a1 1 0 0 1 2 0v1h4V1a1 1 0 0 1 2 0v1zM4 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4z"
                      />
                    </svg>
                    {bookButtonText}
                  </a>
                )}
              </div>
            </div>
          </m.div>

          {/* Contact us — always visible, anchored to right edge */}
          {contactButtonHref && contactButtonText && (
            <Link
              href={lp(contactButtonHref)}
              className="hidden lg:block shrink-0 ml-2.5 bg-yellow-400 text-black rounded-full px-5 py-[7px] text-[13px] font-semibold hover:bg-yellow-300 transition-colors whitespace-nowrap"
            >
              {contactButtonText}
            </Link>
          )}

          {/* Mobile: WhatsApp + hamburger */}
          <div className="lg:hidden flex items-center gap-2 ml-auto">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#1fb958] transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-yellow-400 p-2 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </m.div>
      </div>

      {/* Mobile menu — full-screen vault overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto lg:hidden fixed inset-0 z-9999 bg-[#080808] flex flex-col overflow-hidden"
          >
            {/* Grain overlay */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-50%',
                width: '200%',
                height: '200%',
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                backgroundSize: '200px 200px',
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Gold ambient orb — top right */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '360px',
                height: '360px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(250,204,21,0.12) 0%, transparent 65%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            {/* Gold ambient orb — bottom left */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '-60px',
                left: '-60px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 65%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Header row */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
              <Link href={isHe ? '/he' : '/'} onClick={() => setIsMobileMenuOpen(false)}>
                {logoUrl ? (
                  <img src={wpImg(logoUrl) ?? ''} alt="Triolla" className="h-5 w-auto brightness-0 invert" />
                ) : (
                  <span className="text-[18px] font-bold tracking-tight text-white lowercase">triolla</span>
                )}
              </Link>
              <m.button
                initial={{ rotate: 0 }}
                animate={{ rotate: 90 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/25 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </m.button>
            </div>

            {/* Gold hairline */}
            <div className="relative z-10 mx-6 h-px bg-linear-to-r from-yellow-400/30 via-yellow-400/10 to-transparent shrink-0" />

            {/* Nav items */}
            <nav className="relative z-10 flex-1 overflow-y-auto px-6 pt-8 pb-4">
              <m.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
                  },
                }}
                className="flex flex-col gap-1"
              >
                {mobileNavItems.map((item, i) => {
                  const href = lp(item.url)
                  const isActive = pathname === href
                  return (
                    <m.div
                      key={`mobile-${item.label}-${i}`}
                      variants={{
                        hidden: { opacity: 0, x: 30 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: {
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        },
                      }}
                    >
                      <div className="flex items-center gap-0 group">
                        {/* Gold left bar */}
                        <m.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            delay: 0.15 + i * 0.07,
                            duration: 0.35,
                            ease: 'easeOut',
                          }}
                          style={{ transformOrigin: 'top' }}
                          className={`w-[3px] rounded-full mr-4 self-stretch ${isActive ? 'bg-yellow-400' : 'bg-yellow-400/0 group-hover:bg-yellow-400/40'} transition-colors duration-200`}
                        />
                        <Link
                          href={href}
                          className={`py-3 flex-1 text-[clamp(1.5rem,7vw,2.2rem)] font-extrabold leading-tight tracking-[-0.02em] transition-colors duration-200 ${
                            isActive ? 'text-yellow-400' : 'text-white/90 hover:text-white'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </div>
                      {item.children.length > 0 && (
                        <div className="ml-7 mb-3 flex flex-wrap gap-2">
                          {item.children.map((child) => (
                            <Link
                              key={`${child.url}-${child.label}`}
                              href={lp(child.url)}
                              className="text-[12px] text-white/40 hover:text-white/70 transition-colors bg-white/5 hover:bg-white/8 px-3 py-1.5 rounded-full"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </m.div>
                  )
                })}
              </m.div>
            </nav>

            {/* Bottom CTA section */}
            <div
              className="relative z-10 shrink-0 px-6 pb-8"
              style={{
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
              }}
            >
              {/* Gold divider */}
              <div className="h-px bg-linear-to-r from-transparent via-yellow-400/20 to-transparent mb-6" />
              <div className="flex flex-col gap-3">
                {contactButtonHref && contactButtonText && (
                  <Link
                    href={lp(contactButtonHref)}
                    className="flex items-center justify-center h-14 rounded-2xl bg-yellow-400 text-black font-bold text-[15px] tracking-tight hover:bg-yellow-300 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {contactButtonText}
                  </Link>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {bookButtonHref && bookButtonText && (
                    <a
                      href={lp(bookButtonHref)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center h-12 rounded-2xl bg-blue-600 text-white font-semibold text-[13px] hover:bg-blue-500 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {bookButtonText}
                    </a>
                  )}
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#25D366] text-white font-semibold text-[13px] hover:bg-[#1fb958] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
