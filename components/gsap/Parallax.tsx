'use client'

interface ParallaxProps {
  /** ScrollSmoother data-speed: 1 = normal, <1 slower, >1 faster, 'auto' = fit. */
  speed?: number | 'auto'
  /** ScrollSmoother data-lag: seconds to "catch up". */
  lag?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function Parallax({ speed, lag, className, style, children }: ParallaxProps) {
  const attrs: Record<string, string> = {}
  if (speed != null) attrs['data-speed'] = String(speed)
  if (lag != null) attrs['data-lag'] = String(lag)
  return (
    <div className={className} style={style} {...attrs}>
      {children}
    </div>
  )
}
