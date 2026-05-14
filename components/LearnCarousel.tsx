"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface Slide {
  learntext: string;
  learnimage?: { node?: { sourceUrl?: string } };
  learnvideo?: { node?: { mediaItemUrl?: string } };
}

interface LearnCarouselProps {
  slides: Slide[];
}

export function LearnCarousel({ slides }: LearnCarouselProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        className="flex gap-8 cursor-grab active:cursor-grabbing pb-16 px-10"
        style={{ width: "max-content" }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-[220px] md:w-[260px] shrink-0 group">
            <div className="rounded-3xl overflow-hidden relative aspect-3/4 mb-8 bg-black">
              <img
                src={slide.learnimage?.node?.sourceUrl}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100 pointer-events-none"
              />
              {slide.learnvideo?.node?.mediaItemUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center pl-2 shadow-2xl group-hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5V19L19 12L8 5Z" fill="black" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <h4 className="text-2xl font-bold group-hover:text-yellow-400 transition-colors line-clamp-2">
              {slide.learntext}
            </h4>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
