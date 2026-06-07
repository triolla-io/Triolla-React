"use client";

import { useEffect } from "react";

/**
 * Forces a full page reload when the browser restores a page from the
 * Back/Forward Cache (bfcache). Without this, IntersectionObserver-based
 * animations (Framer Motion whileInView, useInView, native observers)
 * remain in their initial hidden state because the observers already
 * fired and disconnected before the page was frozen.
 *
 * This is the standard pattern recommended by web.dev/bfcache.
 */
export function BfcacheReloader() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
