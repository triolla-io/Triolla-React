import { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'

interface SectionHeadingProps {
  /** Eyebrow label content (string or nodes). Omit to skip the eyebrow. */
  eyebrow?: ReactNode
  eyebrowOrnament?: 'none' | 'dot' | 'line' | 'mark'
  eyebrowColor?: string
  /** Title — accepts already-parsed nodes (e.g. parse(decodeHtml(...))). */
  title?: ReactNode
  /** Subtitle/lead — accepts parsed nodes. */
  subtitle?: ReactNode
  /** Dark text variant for light/cream backgrounds. */
  dark?: boolean
  className?: string
  style?: React.CSSProperties
}

export function SectionHeading({
  eyebrow,
  eyebrowOrnament = 'line',
  eyebrowColor,
  title,
  subtitle,
  dark = false,
  className = '',
  style,
}: SectionHeadingProps) {
  const darkVars = dark ? ({ '--sh-title-color': '#0a0a0a', '--sh-sub-color': '#4b5563' } as React.CSSProperties) : {}
  return (
    <div className={`section-head ${className}`.trim()} style={{ ...darkVars, ...style }}>
      {eyebrow != null && (
        <Eyebrow ornament={eyebrowOrnament} align="center" color={eyebrowColor ?? (dark ? 'rgba(0,0,0,0.45)' : undefined)}>
          {eyebrow}
        </Eyebrow>
      )}
      {title != null && <h2 className="section-head__title">{title}</h2>}
      {subtitle != null && <div className="section-head__sub">{subtitle}</div>}
    </div>
  )
}
