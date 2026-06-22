import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline'

interface CommonProps {
  children: ReactNode
  variant?: Variant
  className?: string
  style?: React.CSSProperties
  /** Adds the radial ink-fill hover layer (pair with <Magnetic> for cursor
   *  origin). Reduced-motion users keep the plain colour-swap hover. */
  explode?: boolean
}

type ButtonAsLink = CommonProps & { href: string }
type ButtonAsButton = CommonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>
type ButtonProps = ButtonAsLink | ButtonAsButton

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn--primary',
  ghost: 'btn--ghost',
  outline: 'btn--outline',
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', className = '', style, explode = false } = props
  const cls = `btn ${VARIANT_CLASS[variant]}${explode ? ' btn--explode' : ''} ${className}`.trim()
  const inner = explode ? (
    <>
      <span className="btn__ink" aria-hidden="true" />
      <span className="btn__label">{children}</span>
    </>
  ) : (
    children
  )

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} style={style}>
        {inner}
      </Link>
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _c, variant: _v, className: _cn, style: _s, href: _h, explode: _e, ...rest } = props
  return (
    <button type="button" className={cls} style={style} {...rest}>
      {inner}
    </button>
  )
}
