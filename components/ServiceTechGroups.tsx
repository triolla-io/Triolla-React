'use client'

import { SectionReveal } from '@/components/SectionReveal'
import { Reveal } from '@/components/gsap/Reveal'
import { useServiceModal, type ServiceDetail } from '@/components/ServiceDetailModal'

export interface TechGroup {
  /** Detail fetched from the heading's WP link. `hasDetail` decides whether the
   *  heading is a modal trigger, a plain link, or plain text. `label` is the
   *  heading text. */
  detail: ServiceDetail
  /** Optional sub-copy under the heading (only the first group has one today). */
  copy: string | null
  chips: string[]
}

interface ServiceTechGroupsProps {
  groups: TechGroup[]
  ctaText?: string | null
  ctaLink?: string | null
}

/**
 * Engineering lists. Each group heading whose WP link resolved to a detail page
 * opens the shared fullscreen modal (instead of navigating); otherwise it stays
 * a plain link or plain text. The chips below are never links. prev/next cycles
 * through the resolved headings, mirroring the menu sections.
 */
export function ServiceTechGroups({ groups, ctaText, ctaLink }: ServiceTechGroupsProps) {
  const services = groups.map((g) => g.detail)
  const { open, setTriggerRef, modal } = useServiceModal(services, {
    ctaText,
    ctaLink,
  })

  return (
    <>
      <SectionReveal className="svc-dev__lists">
        {groups.map((g, i) => {
          const { detail, copy, chips } = g
          if (!detail.label) return null
          return (
            <div key={i} className="svc-tech-group">
              <h4 className="svc-tech-group__title">
                {detail.hasDetail ? (
                  <button
                    type="button"
                    ref={setTriggerRef(i)}
                    className="svc-tech-link svc-tech-link--btn"
                    onClick={() => open(i)}
                    aria-haspopup="dialog"
                  >
                    {detail.label}
                  </button>
                ) : detail.link ? (
                  <a href={detail.link} className="svc-tech-link">
                    {detail.label}
                  </a>
                ) : (
                  detail.label
                )}
              </h4>
              {copy && <p className="svc-tech-group__sub">{copy}</p>}
              {chips.length > 0 && (
                <Reveal stagger={0.05} className="svc-tech-chips">
                  {chips.map((chip, c) => (
                    <span key={c} className="svc-tech-chip">
                      {chip}
                    </span>
                  ))}
                </Reveal>
              )}
            </div>
          )
        })}
      </SectionReveal>

      {modal}

      <style>{`
        /* Heading trigger reuses .svc-tech-link verbatim. Reset the native
           button box AND force display:inline — .svc-tech-link sets no display,
           so a <button> would otherwise default to inline-block (extra baseline
           gap / different box) instead of matching the original inline <a>. */
        button.svc-tech-link--btn {
          appearance: none; -webkit-appearance: none;
          display: inline;
          background: none; border: 0; padding: 0; margin: 0;
          font: inherit; color: inherit; letter-spacing: inherit;
          text-align: inherit; cursor: pointer;
        }
      `}</style>
    </>
  )
}
