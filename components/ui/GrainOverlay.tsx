interface GrainOverlayProps {
  /** Overlay opacity. Defaults to the canonical 0.04. */
  opacity?: number
}

export function GrainOverlay({ opacity }: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className="grain"
      style={opacity !== undefined ? ({ '--grain-opacity': String(opacity) } as React.CSSProperties) : undefined}
    />
  )
}
