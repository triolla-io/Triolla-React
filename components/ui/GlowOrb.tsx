type OrbAnimation = "none" | "pulse" | "pulse-rev" | "drift" | "drift-rev";

interface GlowOrbProps {
  /** CSS width, e.g. 900 (px) or "60vw". */
  size: number | string;
  /** CSS height; defaults to `size` (circle). Pass a different value for an ellipse. */
  height?: number | string;
  /** Full gradient inner color incl. alpha, e.g. "rgba(250,204,21,0.14)"
   *  or accent-driven "color-mix(in srgb, var(--accent) 14%, transparent)". */
  color: string;
  shape?: "circle" | "ellipse";
  /** Transparent stop, e.g. "65%" or "70%". */
  fade?: string;
  /** blur() radius in px. Many orbs use 0; some use 60–110. */
  blur?: number;
  animation?: OrbAnimation;
  /** Animation duration in seconds. */
  duration?: number;
  /** Tailwind positioning utilities, e.g. "bottom-[-10%] left-1/2 -translate-x-1/2". */
  className?: string;
}

const ANIM_CLASS: Record<OrbAnimation, string> = {
  none: "",
  pulse: "glow-orb--pulse",
  "pulse-rev": "glow-orb--pulse-rev",
  drift: "glow-orb--drift",
  "drift-rev": "glow-orb--drift-rev",
};

const px = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export function GlowOrb({
  size,
  height,
  color,
  shape = "circle",
  fade = "65%",
  blur = 0,
  animation = "none",
  duration,
  className = "",
}: GlowOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={`glow-orb ${ANIM_CLASS[animation]} ${className}`}
      style={
        {
          "--orb-w": px(size),
          "--orb-h": px(height ?? size),
          "--orb-color": color,
          "--orb-shape": shape,
          "--orb-fade": fade,
          "--orb-blur": `${blur}px`,
          ...(duration !== undefined ? { "--orb-dur": `${duration}s` } : {}),
        } as React.CSSProperties
      }
    />
  );
}
