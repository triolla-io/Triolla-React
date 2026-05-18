"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  xOffset?: number;
  className?: string;
  viewportMargin?: string;
  viewportOnce?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  yOffset = 40,
  xOffset = 0,
  className = "",
  viewportMargin = "-100px",
  viewportOnce = true,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: viewportOnce, margin: viewportMargin }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
