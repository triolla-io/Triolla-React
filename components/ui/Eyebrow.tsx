import { ReactNode } from "react";

type Ornament = "none" | "dot" | "line" | "mark";

interface EyebrowProps {
  children: ReactNode;
  /** Symmetric ornaments on both sides of the label. */
  ornament?: Ornament;
  align?: "start" | "center";
  pill?: boolean;
  /** Override label color (defaults to var(--accent)). e.g. "rgba(0,0,0,0.45)". */
  color?: string;
  /** Per-instance CSS-var overrides (size, spacing, gap, line width, etc.). */
  style?: React.CSSProperties;
  className?: string;
}

function Ornaments({ kind }: { kind: Ornament }) {
  if (kind === "dot") return <span className="eyebrow__dot" aria-hidden="true" />;
  if (kind === "line") return <span className="eyebrow__line" aria-hidden="true" />;
  if (kind === "mark") return <span className="eyebrow__mark" aria-hidden="true">✦</span>;
  return null;
}

export function Eyebrow({
  children,
  ornament = "none",
  align = "start",
  pill = false,
  color,
  style,
  className = "",
}: EyebrowProps) {
  const cls = [
    "eyebrow",
    align === "center" ? "eyebrow--center" : "",
    pill ? "eyebrow--pill" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={cls}
      style={{ ...(color ? ({ "--eb-color": color } as React.CSSProperties) : {}), ...style }}
    >
      <Ornaments kind={ornament} />
      {children}
      <Ornaments kind={ornament} />
    </div>
  );
}
