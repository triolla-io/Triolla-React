"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import parse from "html-react-parser";


interface FAQItem {
  faqQuestion: string;
  faqAnswer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className = "" }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={className}>
      {items.map((item, i) => (
        <div key={i} className="border-b border-white/10">
          <button
            className="w-full flex justify-between items-center py-6 text-left gap-4"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="text-[22px] font-semibold">
              {item.faqQuestion}
            </span>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
              >
                {/* Content is from trusted WP backend only — same pattern as moreText, toprightext, devtext throughout this codebase */}
                <div className="text-gray-400 text-[18px] leading-relaxed pb-6">
                  {parse(item.faqAnswer)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
