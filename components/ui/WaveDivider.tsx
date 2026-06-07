interface WaveDividerProps {
  /** Fill color = the background color of the section BELOW the wave. */
  to: string;
  /** Top margin in px. Default 64. */
  marginTop?: number;
  className?: string;
}

const WAVE_PATH =
  "M0 55 L180 22 L360 68 L540 18 L720 60 L900 20 L1080 58 L1260 24 L1440 52 L1440 90 L0 90 Z";

export function WaveDivider({ to, marginTop, className = "" }: WaveDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`wave-divider ${className}`.trim()}
      style={marginTop !== undefined ? ({ "--wave-mt": `${marginTop}px` } as React.CSSProperties) : undefined}
    >
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d={WAVE_PATH} fill={to} />
      </svg>
    </div>
  );
}
