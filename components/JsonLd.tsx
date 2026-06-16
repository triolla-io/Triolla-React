'use client'

import { useEffect, useRef } from 'react'

// Injects a JSON-LD <script> for Schema.org structured data. LLMs and search
// engines parse this for reliable, machine-readable facts about a page instead
// of inferring them from prose.
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const scriptRef = useRef<HTMLScriptElement>(null)

  useEffect(() => {
    if (scriptRef.current) {
      scriptRef.current.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
    }
  }, [data])

  return <script ref={scriptRef} type="application/ld+json" />
}
