"use client";

import { motion } from "motion/react";

interface HeroHeadlineProps {
  headline: string;
  subtext?: string;
  headlineClassName?: string;
  headlineStyle?: React.CSSProperties;
  subtextClassName?: string;
}

export function HeroHeadline({
  headline,
  subtext,
  headlineClassName = "",
  headlineStyle,
  subtextClassName = "",
}: HeroHeadlineProps) {
  const words = headline.split(" ");

  return (
    <>
      <h1 className={headlineClassName} style={headlineStyle}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        ))}
      </h1>
      {subtext && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: words.length * 0.08 + 0.4 }}
          className={subtextClassName}
        >
          {subtext}
        </motion.p>
      )}
    </>
  );
}
