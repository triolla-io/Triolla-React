import { ReactNode } from "react";

interface MarqueeProps<T> {
  items: T[];
  /** How many times to repeat `items` for a seamless loop (2 minimum). */
  repeat?: number;
  /** Animation duration in seconds. */
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  /** Edge fade masks (gradient to a solid bg color). */
  fade?: boolean;
  /** Solid color the fade masks blend to. Default "#080808". */
  fadeColor?: string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

export function Marquee<T>({
  items,
  repeat = 2,
  speed = 40,
  direction = "left",
  pauseOnHover = false,
  fade = false,
  fadeColor,
  renderItem,
  className = "",
}: MarqueeProps<T>) {
  const duped = Array.from({ length: repeat }).flatMap(() => items);
  return (
    <div
      className={`marquee ${pauseOnHover ? "marquee--pause" : ""} ${className}`.trim()}
      style={
        {
          ...(fadeColor ? { "--mq-fade-color": fadeColor } : {}),
        } as React.CSSProperties
      }
    >
      {fade && <div className="marquee__fade marquee__fade--l" aria-hidden="true" />}
      {fade && <div className="marquee__fade marquee__fade--r" aria-hidden="true" />}
      <div
        className={`marquee__track ${direction === "right" ? "marquee__track--rev" : ""}`.trim()}
        style={{ "--mq-dur": `${speed}s` } as React.CSSProperties}
      >
        {duped.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
}
