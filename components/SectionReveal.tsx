"use client";

import { motion, useInView } from "motion/react";
import { useRef, ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode | ReactNode[];
  className?: string;
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function SectionReveal({
  children,
  className = "",
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // amount: 0 → fires as soon as any pixel is visible, including elements
  // already in viewport at mount time (fixes whileInView race on SPA navigation)
  const isInView = useInView(ref, { once: true, amount: 0 });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
    >
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
