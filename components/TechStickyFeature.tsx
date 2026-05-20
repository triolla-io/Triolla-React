"use client";

import { useRef, useState, useEffect } from "react";

interface ContentItem {
  threintitle: string | null;
  threincontent: string | null;
  tagList: string | null;
}

interface ContentPanel {
  lftimage: { node: { sourceUrl: string } } | null;
  threincontent: ContentItem[] | null;
}

interface TechStickyFeatureProps {
  fourmidTitle: string | null;
  fourtitleone: string | null;
  fourtitletwo: string | null;
  fourtext: string | null;
  threeConent: ContentPanel[] | null;
  threbottomText: string | null;
  threbottomLinkText: string | null;
  threbottomButtonLink: string | null;
  accentColor: string;
}

export function TechStickyFeature({
  fourmidTitle,
  fourtitleone,
  fourtitletwo,
  fourtext,
  threeConent,
  threbottomText,
  threbottomLinkText,
  threbottomButtonLink,
  accentColor,
}: TechStickyFeatureProps) {
  const panels = threeConent ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(i); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (!panels.length) return null;

  return (
    <section className="py-28 border-t border-white/[0.07]">
      <style>{`
        .tsf-tag {
          display: inline-block;
          padding: 4px 14px;
          border-radius: 999px;
          border: 1px solid ${accentColor}4d;
          color: ${accentColor};
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          background: ${accentColor}0d;
        }
        .tsf-img-crossfade {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.45s ease;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Section header */}
        {fourmidTitle && (
          <h2 className="text-[clamp(36px,5vw,72px)] font-black tracking-[-0.03em] leading-tight mb-10">
            {fourmidTitle}
          </h2>
        )}

        {(fourtitleone ?? fourtitletwo) && (
          <div className="flex flex-wrap gap-10 mb-6">
            {fourtitleone && (
              <span className="text-sm font-bold tracking-widest uppercase text-gray-500">
                {fourtitleone}
              </span>
            )}
            {fourtitletwo && (
              <span className="text-sm font-bold tracking-widest uppercase text-gray-500">
                {fourtitletwo}
              </span>
            )}
          </div>
        )}

        {fourtext && (
          <p className="text-[16px] leading-[1.85] text-gray-400 max-w-2xl mb-16">{fourtext}</p>
        )}

        {/* Split layout */}
        <div className="lg:flex lg:gap-16 items-start">
          {/* Left — sticky image */}
          <div className="lg:w-[45%] lg:sticky lg:top-[120px] lg:self-start mb-10 lg:mb-0">
            <div className="relative">
              {/* Gold glow orb behind image */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "90%",
                  height: "90%",
                  borderRadius: "50%",
                  filter: "blur(120px)",
                  opacity: 0.12,
                  background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Image container with cross-fade */}
              <div
                className="relative rounded-[28px] overflow-hidden"
                style={{ aspectRatio: "3/4" }}
              >
                {panels.map((panel, i) =>
                  panel.lftimage?.node?.sourceUrl ? (
                    <img
                      key={i}
                      src={panel.lftimage.node.sourceUrl}
                      alt=""
                      className="tsf-img-crossfade"
                      style={{ opacity: activeIndex === i ? 1 : 0 }}
                    />
                  ) : null
                )}
              </div>
            </div>
          </div>

          {/* Right — scrollable content panels */}
          <div className="lg:w-[55%]">
            {panels.map((panel, i) => (
              <div
                key={i}
                ref={(el) => { panelRefs.current[i] = el; }}
                className="py-16 border-b border-white/[0.07] last:border-b-0"
              >
                {(panel.threincontent ?? []).map((item, j) => (
                  <div key={j} className={j > 0 ? "mt-10" : ""}>
                    {item.threintitle && (
                      <h3 className="text-[clamp(22px,2.8vw,38px)] font-bold tracking-tight text-white mb-4">
                        {item.threintitle}
                      </h3>
                    )}
                    {item.threincontent && (
                      <p className="text-[16px] leading-[1.85] text-gray-400 mb-5">
                        {item.threincontent}
                      </p>
                    )}
                    {item.tagList && (
                      <div className="flex flex-wrap gap-2">
                        {item.tagList.split(",").map((tag, ti) => (
                          <span key={ti} className="tsf-tag">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        {threbottomText && threbottomLinkText && threbottomButtonLink && (
          <div className="mt-20 text-center">
            <p className="text-xl font-semibold text-white mb-6">{threbottomText}</p>
            <a
              href={threbottomButtonLink}
              className="inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.06em] uppercase px-7 py-3.5 rounded-full transition-opacity hover:opacity-80"
              style={{ background: accentColor, color: "#000" }}
            >
              {threbottomLinkText}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
