import { ReactNode } from "react";

interface ShineImageCardProps {
  src: string;
  alt: string;
  /** Border radius in px. Default 20. */
  radius?: number;
  /** Diagonal shine angle, e.g. "105deg" | "128deg" | "135deg". */
  shineAngle?: string;
  /** Image zoom scale on hover. Default 1.07. */
  imgScale?: number;
  /** Content shown in the bottom gradient overlay (revealed on hover). */
  overlay?: ReactNode;
  /** Static tag/badge content (always visible). */
  badge?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ShineImageCard({
  src,
  alt,
  radius,
  shineAngle,
  imgScale,
  overlay,
  badge,
  className = "",
  style,
}: ShineImageCardProps) {
  return (
    <div
      className={`shine-card ${className}`.trim()}
      style={
        {
          ...(radius !== undefined ? { "--sc-radius": `${radius}px` } : {}),
          ...(shineAngle ? { "--sc-shine-angle": shineAngle } : {}),
          ...(imgScale !== undefined ? { "--sc-img-scale": String(imgScale) } : {}),
          ...style,
        } as React.CSSProperties
      }
    >
      <img src={src} alt={alt} className="shine-card__img" />
      <div className="shine-card__shine" aria-hidden="true" />
      {overlay != null && <div className="shine-card__overlay">{overlay}</div>}
      {badge != null && badge}
    </div>
  );
}
