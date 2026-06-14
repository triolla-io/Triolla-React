'use client'

import Link from 'next/link'
import { useFooterModal } from '@/components/FooterServiceModal'

function isExternal(url: string): boolean {
  return url.startsWith('http') && !url.includes('triolla.io')
}

function toHref(url: string): string {
  if (isExternal(url)) return url
  return url.replace(/^https?:\/\/triolla\.io/, '') || '/'
}

/**
 * Footer navigation link. When `serviceIndex` is set, the target is a service
 * whose page now lives only as the shared detail modal, so the link renders as
 * a `<button>` that opens that modal (styled identically to a link via
 * `.footer-nav-link`). Otherwise it renders a normal internal/external link.
 */
export function FooterNavLink({ label, url, serviceIndex }: { label: string; url: string; serviceIndex: number | null }) {
  const modal = useFooterModal()
  const cls = 'footer-nav-link'

  if (serviceIndex != null && modal) {
    return (
      <button
        type="button"
        ref={modal.setTriggerRef(serviceIndex)}
        className={`${cls} footer-nav-link--btn`}
        onClick={() => modal.open(serviceIndex)}
        aria-haspopup="dialog"
      >
        {label}
      </button>
    )
  }

  const href = toHref(url)
  return isExternal(url) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {label}
    </Link>
  )
}
