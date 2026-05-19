"use client";

import { motion } from "motion/react";

// Actual WP homepage grid images (hometopimage1–9 from triolla.io)
const WP_IMAGES = [
  { src: "https://triolla.io/wp-content/uploads/2025/06/2.png",             alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/1.png",             alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/medicak-ipad.png",  alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/3.png",             alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/final_watch6.svg",  alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/6.png",             alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/Front-cloean-1.png",alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/88.png",            alt: "Portfolio work" },
  { src: "https://triolla.io/wp-content/uploads/2025/06/White-1.png",       alt: "Portfolio work" },
];

// Split into 3 columns for masonry effect
const COL1 = [0, 3, 6]; // indices
const COL2 = [1, 4, 7];
const COL3 = [2, 5, 8];

function MasonryColumn({ indices, delay }: { indices: number[]; delay: number }) {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      {indices.map((idx, i) => {
        const img = WP_IMAGES[idx];
        return (
          <motion.div
            key={img.src}
            className="portfolio-card group overflow-hidden rounded-2xl relative bg-[#0f0f0f]"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: delay + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-auto block"
            />
            {/* hover shine sweep */}
            <div className="portfolio-card__shine" aria-hidden="true" />
          </motion.div>
        );
      })}
    </div>
  );
}

export function PortfolioGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
      <MasonryColumn indices={COL1} delay={0} />
      <MasonryColumn indices={COL2} delay={0.08} />
      <MasonryColumn indices={COL3} delay={0.16} />
    </div>
  );
}
