"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface NavItem {
  label: string;
  url: string;
}

export interface HeaderClientProps {
  logoUrl: string | null;
  ticker: string | null;
  navItems: NavItem[];
  mobileNavItems: NavItem[];
  whatsappHref: string | null;
  bookButtonText: string | null;
  bookButtonHref: string | null;
  contactButtonText: string | null;
  contactButtonHref: string | null;
}

export function HeaderClient({
  logoUrl,
  ticker,
  navItems,
  mobileNavItems,
  whatsappHref,
  bookButtonText,
  bookButtonHref,
  contactButtonText,
  contactButtonHref,
}: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTickerDismissed, setIsTickerDismissed] = useState(false);
  const pathname = usePathname();

  function toHref(url: string): string {
    if (!url) return "/";
    if (url.startsWith("http") && !url.includes("triolla.io")) return url;
    return url.replace(/^https?:\/\/triolla\.io/, "") || "/";
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      {/* Ticker */}
      {ticker && !isTickerDismissed && (
        <div className="bg-yellow-400 text-black py-2 px-4 text-center text-[13px] font-medium relative flex items-center justify-center">
          <span>{ticker}</span>
          <button
            className="absolute right-4 text-black hover:opacity-70"
            aria-label="Close"
            onClick={() => setIsTickerDismissed(true)}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L12 12M12 1L1 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[90px]">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Triolla"
                  className="h-9 w-auto brightness-0 invert"
                />
              ) : null}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-10">
            {navItems.map(({ label, url }) => {
              const href = toHref(url);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative text-[15px] font-medium transition-colors hover:text-yellow-400 ${pathname === href ? "text-yellow-400" : ""}`}
                >
                  {label}
                  {pathname === href && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-6">
            {contactButtonHref && contactButtonText && (
              <Link
                href={toHref(contactButtonHref)}
                className="border border-white/30 rounded-full px-8 py-[10px] text-[15px] font-medium hover:bg-white hover:text-black transition-all"
              >
                {contactButtonText}
              </Link>
            )}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-[45px] h-[45px] bg-[#25D366] rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}
            {bookButtonHref && bookButtonText && (
              <a
                href={toHref(bookButtonHref)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[15px] font-medium hover:text-yellow-400 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.61418 2.45849V3.07326C8.60311 3.6185 7.72211 3.92927 7.44361 3.33357C7.40611 3.25295 7.38767 3.16372 7.38582 3.07326V2.45849H5.5439C5.07112 2.43572 4.75451 1.81725 5.07973 1.44124C5.19162 1.31201 5.282 1.24186 5.5439 1.22894C6.15746 1.22894 6.77164 1.22709 7.38582 1.2234V0.614775C7.38767 0.514467 7.3975 0.481851 7.41656 0.422158C7.49771 0.175386 7.74056 0 8.0123 0C8.33998 0.0129232 8.6068 0.258464 8.61418 0.614775V1.21601C9.84192 1.20863 11.0703 1.20186 12.2986 1.20801V0.614775C12.3048 0.286157 12.5446 0.014154 12.9005 0C12.9085 0 12.9165 0 12.9245 0C13.2528 0.0129232 13.5196 0.258464 13.5264 0.614775V1.21909C13.7465 1.22217 13.9666 1.22586 14.1861 1.22955C15.1273 1.25909 15.9647 2.06956 15.9825 3.05049C16.0058 6.7533 16.0058 10.4567 15.9825 14.1601C15.9653 15.1109 15.1433 15.9626 14.1633 15.9811C10.0546 16.0063 5.94536 16.0063 1.8367 15.9811C0.890528 15.9632 0.0359654 15.1571 0.0175216 14.1601C-0.00584054 10.4567 -0.00584054 6.7533 0.0175216 3.05049C0.0347358 2.09294 0.854255 1.2357 1.8576 1.22894H2.47362V0.614775C2.47547 0.514467 2.48469 0.481851 2.50436 0.422158C2.58551 0.175386 2.82836 0 3.09948 0C3.42778 0.0129232 3.6946 0.258464 3.70136 0.614775V3.07326C3.69091 3.61788 2.83512 3.92311 2.54186 3.35572C2.49698 3.26895 2.47547 3.17234 2.47362 3.07326V2.45602C2.26336 2.45479 2.05372 2.45479 1.84407 2.45849C1.53237 2.46833 1.2551 2.74156 1.24526 3.05788C1.17702 6.75514 1.17641 10.4549 1.24526 14.1521C1.2551 14.4648 1.52807 14.7417 1.84407 14.7515C5.9472 14.8278 10.0528 14.8278 14.1559 14.7515C14.4676 14.7417 14.7449 14.4684 14.7547 14.1521C14.823 10.4549 14.823 6.75514 14.7547 3.05788C14.7449 2.73972 14.4615 2.46033 14.1387 2.45849H13.5264V3.07326C13.5159 3.61296 12.6577 3.91758 12.3669 3.55572C12.3226 3.26895 12.3005 3.17234 12.2986 3.07326V2.45849H8.61418ZM3.08719 12.293C3.42655 12.293 3.70136 12.5687 3.70136 12.9078C3.70136 13.2469 3.42655 13.5226 3.08719 13.5226C2.74843 13.5226 2.47362 13.2469 2.47362 12.9078C2.47362 12.5687 2.74843 12.293 3.08719 12.293ZM5.5439 12.293C5.88265 12.293 6.15746 12.5687 6.15746 12.9078C6.15746 13.2469 5.88265 13.5226 5.5439 13.5226C5.20453 13.5226 4.92972 13.2469 4.92972 12.9078C4.92972 12.5687 5.20453 12.293 5.5439 12.293ZM8 12.293C8.33875 12.293 8.61418 12.5687 8.61418 12.9078C8.61418 13.2469 8.33875 13.5226 8 13.5226C7.66125 13.5226 7.38582 13.2469 7.38582 12.9078C7.38582 12.5687 7.66125 12.293 8 12.293ZM3.08719 9.83456C3.42655 9.83456 3.70136 10.1096 3.70136 10.4493C3.70136 10.7884 3.42655 11.0635 3.08719 11.0635C2.74843 11.0635 2.47362 10.7884 2.47362 10.4493C2.47362 10.1096 2.74843 9.83456 3.08719 9.83456ZM5.5439 9.83456C5.88265 9.83456 6.15746 10.1096 6.15746 10.4493C6.15746 10.7884 5.88265 11.0635 5.5439 11.0635C5.20453 11.0635 4.92972 10.7884 4.92972 10.4493C4.92972 10.1096 5.20453 9.83456 5.5439 9.83456ZM8 9.83456C8.33875 9.83456 8.61418 10.1096 8.61418 10.4493C8.61418 10.7884 8.33875 11.0635 8 11.0635C7.66125 11.0635 7.38582 10.7884 7.38582 10.4493C7.38582 10.1096 7.66125 9.83456 8 9.83456ZM10.4561 9.83456C10.7949 9.83456 11.0703 10.1096 11.0703 10.4493C11.0703 10.7884 10.7949 11.0635 10.4561 11.0635C10.1173 11.0635 9.84192 10.7884 9.84192 10.4493C9.84192 10.1096 10.1173 9.83456 10.4561 9.83456ZM12.9122 9.83456C13.2516 9.83456 13.5264 10.1096 13.5264 10.4493C13.5264 10.7884 13.2516 11.0635 12.9122 11.0635C12.5734 11.0635 12.2986 10.7884 12.2986 10.4493C12.2986 10.1096 12.5734 9.83456 12.9122 9.83456ZM5.5439 7.37607C5.88265 7.37607 6.15746 7.65115 6.15746 7.99023C6.15746 8.32993 5.88265 8.60501 5.5439 8.60501C5.20453 8.60501 4.92972 8.32993 4.92972 7.99023C4.92972 7.65115 5.20453 7.37607 5.5439 7.37607ZM8 7.37607C8.33875 7.37607 8.61418 7.65115 8.61418 7.99023C8.61418 8.32993 8.33875 8.60501 8 8.60501C7.66125 8.60501 7.38582 8.32993 7.38582 7.99023C7.38582 7.65115 7.66125 7.37607 8 7.37607ZM10.4561 7.37607C10.7949 7.37607 11.0703 7.65115 11.0703 7.99023C11.0703 8.32993 10.7949 8.60501 10.4561 8.60501C10.1173 8.60501 9.84192 8.32993 9.84192 7.99023C9.84192 7.65115 10.1173 7.37607 10.4561 7.37607ZM12.9122 7.37607C13.2516 7.37607 13.5264 7.65115 13.5264 7.99023C13.5264 8.32993 13.2516 8.60501 12.9122 8.60501C12.5734 8.60501 12.2986 8.32993 12.2986 7.99023C12.2986 7.65115 12.5734 7.37607 12.9122 7.37607Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span>{bookButtonText}</span>
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-yellow-400 p-2"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden absolute top-full left-0 w-full bg-black border-t border-white/10 p-4 shadow-xl"
          >
            <nav className="flex flex-col space-y-4">
              {mobileNavItems.map(({ label, url }) => {
                const href = toHref(url);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-lg font-medium transition-colors hover:text-yellow-400 ${pathname === href ? "text-yellow-400" : ""}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              <hr className="border-white/20" />
              {contactButtonHref && contactButtonText && (
                <Link
                  href={toHref(contactButtonHref)}
                  className="text-center bg-white text-black py-2 rounded-full font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {contactButtonText}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
