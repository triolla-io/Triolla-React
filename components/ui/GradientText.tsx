import { ElementType, ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  /** Tag to render. Default span. */
  as?: ElementType
  animate?: boolean
  /** Full CSS gradient. Defaults to the white→accent→white diagonal. */
  gradient?: string
  /** background-size, e.g. "200% auto" or "220% auto". */
  backgroundSize?: string
  /** Shimmer duration in seconds. */
  duration?: number
  className?: string
  style?: React.CSSProperties
}

export function GradientText({
  children,
  as: Tag = 'span',
  animate = false,
  gradient,
  backgroundSize,
  duration,
  className = '',
  style,
}: GradientTextProps) {
  return (
    <Tag
      className={`gradient-text ${animate ? 'gradient-text--animate' : ''} ${className}`.trim()}
      style={
        {
          ...(gradient ? { '--gt-gradient': gradient } : {}),
          ...(backgroundSize ? { '--gt-size': backgroundSize } : {}),
          ...(duration !== undefined ? { '--gt-dur': `${duration}s` } : {}),
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  )
}
