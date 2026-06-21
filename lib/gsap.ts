'use client'

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

let registered = false

/** Register GSAP plugins + project eases exactly once (client only). */
export function registerGsap(): void {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText, CustomEase)
  ScrollTrigger.config({ ignoreMobileResize: true })
  // Mirror lib/motion.ts EASE: cubic-bezier(x1,y1,x2,y2) -> "M0,0 C x1,y1 x2,y2 1,1"
  CustomEase.create('smooth', 'M0,0 C0.23,1 0.32,1 1,1')
  CustomEase.create('bounce', 'M0,0 C0.16,1 0.3,1 1,1')
  CustomEase.create('standard', 'M0,0 C0.4,0 0.2,1 1,1')
  CustomEase.create('symmetric', 'M0,0 C0.2,1 0.3,1 1,1')
  registered = true
}

/** Animate reveals only when the user allows motion. */
export const Q_MOTION = '(prefers-reduced-motion: no-preference)'
/** Smoothing + heavy scenes are desktop-only. */
export const Q_DESKTOP = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
export const SMOOTH_AMOUNT = 1.2
