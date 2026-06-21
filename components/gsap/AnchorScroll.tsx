'use client'

import { useEffect } from 'react'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { registerGsap } from '@/lib/gsap'

registerGsap()

/** Route in-page #hash anchor clicks through ScrollSmoother so native jumps
 *  don't fight the smoothed transform. No-op when no smoother exists. */
export function AnchorScroll() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      const smoother = ScrollSmoother.get()
      if (!smoother) return // native scroll handles it
      e.preventDefault()
      smoother.scrollTo(target as HTMLElement, true, 'top 80px')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
