'use client'

import { Reveal } from '@/components/gsap/Reveal'
import { useServiceModal, num, type ServiceDetail } from '@/components/ServiceDetailModal'

export type { ServiceDetail }

interface ServiceModalMenuProps {
  services: ServiceDetail[]
  /** Optional gold CTA inside the modal footer — rendered only when a
   *  WP-sourced label is supplied. No hardcoded fallback string. */
  ctaText?: string | null
  ctaLink?: string | null
  /** Matches the section theme: "dark" (Product) keeps white text, "light"
   *  (Branding, cream bg) flips to dark text. The modal overlay itself is
   *  identical in both cases. */
  variant?: 'dark' | 'light'
}

/**
 * Numbered service menu. Each item with a resolved WP detail page becomes a
 * `<button>` that opens the shared fullscreen modal; unresolved items fall back
 * to a plain link (never fabricated content). The list styling tracks the host
 * section via `variant`; the modal itself comes from `useServiceModal`.
 */
export function ServiceModalMenu({ services, ctaText, ctaLink, variant = 'dark' }: ServiceModalMenuProps) {
  const { open, setTriggerRef, modal } = useServiceModal(services, {
    ctaText,
    ctaLink,
  })

  const light = variant === 'light'
  const itemCls = `svc-menu-item${light ? ' svc-menu-item--light' : ''}`
  const numCls = `svc-menu-item__num${light ? ' svc-menu-item__num--dark' : ''}`
  const titleCls = `svc-menu-item__title${light ? ' svc-menu-item__title--dark' : ''}`

  return (
    <>
      <Reveal as="ul" stagger={0.08} yOffset={18} className="svc-menu-list">
        {services.map((s, i) => (
          <li key={i} className={itemCls}>
            <span className={numCls}>{num(i)}</span>
            {s.hasDetail ? (
              <button
                type="button"
                ref={setTriggerRef(i)}
                className={`${titleCls} svc-menu-item__title--btn`}
                onClick={() => open(i)}
                aria-haspopup="dialog"
              >
                {s.label}
              </button>
            ) : s.link ? (
              <a href={s.link} className={titleCls}>
                {s.label}
              </a>
            ) : (
              <span className={titleCls}>{s.label}</span>
            )}
          </li>
        ))}
      </Reveal>

      {modal}

      <style>{`
        /* Menu trigger buttons reuse .svc-menu-item__title verbatim — reset
           only the native button box so the list looks identical to the
           original <a>/<span> rendering (the class keeps display:block, font,
           color, etc.). Always rendered, so triggers look right whether or not
           a modal is open. */
        button.svc-menu-item__title--btn {
          background: none; border: 0; padding: 0; margin: 0;
          width: 100%; text-align: left; cursor: pointer;
          font: inherit; appearance: none;
        }
        button.svc-menu-item__title--btn:hover { color: #facc15; }
        button.svc-menu-item__title--dark.svc-menu-item__title--btn:hover { color: #555; }
      `}</style>
    </>
  )
}
