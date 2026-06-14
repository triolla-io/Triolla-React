// Shared easing curves, deduped from per-component cubic-bezier literals.
// Use with `motion` transitions: transition={{ ease: EASE.smooth }}.
// CSS equivalents live in app/globals.css as --ease-* @theme tokens.
export const EASE = {
  smooth: [0.23, 1, 0.32, 1] as const, // ~42 uses — default transform/scale/lift
  bounce: [0.16, 1, 0.3, 1] as const, // ~11 uses — modal/header reveals
  standard: [0.4, 0, 0.2, 1] as const, // ~10 uses — geometric/rotation
  symmetric: [0.2, 1, 0.3, 1] as const, // ~4 uses  — tech stack reveals
} as const

export type EaseName = keyof typeof EASE
