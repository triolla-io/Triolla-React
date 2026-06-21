'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

// Mount gate via useSyncExternalStore: server snapshot is false, client snapshot
// is true, so the first client render matches SSR (null) and the portal mounts
// on hydration. Avoids react-hooks/set-state-in-effect and mirrors the consent
// store's useSyncExternalStore pattern.
const emptySubscribe = () => () => {}

/** Renders children into document.body (outside #smooth-content) once mounted.
 *  SSR-safe: returns null until mounted so server and first client render match. */
export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
  return mounted ? createPortal(children, document.body) : null
}
