import Link from 'next/link'
import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline'

interface CommonProps {
  children: ReactNode
  variant?: Variant
  className?: string
  style?: React.CSSProperties
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
  const { children, variant = 'primary', className = '', style } = props
  const cls = `btn ${VARIANT_CLASS[variant]} ${className}`.trim()

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} style={style}>
        {children}
      </Link>
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _c, variant: _v, className: _cn, style: _s, href: _h, ...rest } = props
  return (
    <button className={cls} style={style} {...rest}>
      {children}
    </button>
  )
}
