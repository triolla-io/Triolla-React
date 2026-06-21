'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { registerGsap } from '@/lib/gsap'

registerGsap()

/** After client navigation, reset scroll position and recompute triggers/effects
 *  for the new page's content. */
export function RouteRefresh() {
  const pathname = usePathname()
  useEffect(() => {
    const smoother = ScrollSmoother.get()
    if (smoother) {
      smoother.scrollTo(0, false)
      smoother.effects('[data-speed],[data-lag]', {})
    } else {
      window.scrollTo(0, 0)
    }
    ScrollTrigger.refresh()
  }, [pathname])
  return null
}
