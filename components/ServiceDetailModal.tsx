"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import parse, {
  type HTMLReactParserOptions,
  Element as ParserElement,
} from "html-react-parser";

/** One service, enriched server-side from its WP detail page.
 *  `hasDetail` is false when the page failed to resolve — such items render as
 *  a plain link instead of a modal trigger (never fabricated content). */
export interface ServiceDetail {
  label: string | null; // the trigger label (menu title / heading)
  link: string | null; // fallback href
  title: string | null; // WP page title — the modal headline
  image: string | null; // featured image sourceUrl
  altText: string;
  boldText: string | null; // ACF topBoldText (wysiwyg HTML)
  content: string | null; // WP post content (HTML)
  hasDetail: boolean;
}

/** Strip template chrome (forms, scripts, embeds) out of the WP content so only
 *  the clean article — headings, paragraphs, lists — is re-typeset. */
const DROP_TAGS = new Set([
  "script",
  "style",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "iframe",
  "noscript",
]);

const parseOptions: HTMLReactParserOptions = {
  replace: (node) => {
    if (node instanceof ParserElement && DROP_TAGS.has(node.name)) {
      return <></>;
    }
    return undefined;
  },
};

export function num(i: number) {
  return (i + 1).toString().padStart(2, "0");
}

interface UseServiceModalOptions {
  /** Optional gold CTA inside the modal footer — rendered only when a
   *  WP-sourced label is supplied. No hardcoded fallback string. */
  ctaText?: string | null;
  ctaLink?: string | null;
}

/**
 * Owns all modal state for one set of services: open/close, the gold-curtain
 * transition, reduced-motion handling, prev/next cycling (through resolved
 * detail pages only), keyboard nav, body scroll-lock and hero parallax.
 *
 * Returns:
 *  - `open(i)`            — open the modal for service index `i`
 *  - `setTriggerRef(i)`   — ref callback so focus can be restored on close
 *  - `modal`              — the portal element to render (null when closed)
 *
 * Each consuming section calls this hook independently, so prev/next cycles
 * within that section's own service list — matching the original behavior.
 */
export function useServiceModal(
  services: ServiceDetail[],
  { ctaText, ctaLink }: UseServiceModalOptions = {}
) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const triggerRefs = useRef<Array<HTMLElement | null>>([]);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  // Indices of services that actually have a detail modal, in display order —
  // prev/next cycles only through these (plain links are skipped).
  const detailIndices = services
    .map((s, i) => (s.hasDetail ? i : -1))
    .filter((i) => i >= 0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const isOpen = activeIndex !== null;

  const close = useCallback(() => {
    const restore = lastIndexRef.current;
    const finish = () => {
      setActiveIndex(null);
      setClosing(false);
      // Restore focus to the trigger that opened the modal.
      if (restore != null) triggerRefs.current[restore]?.focus();
    };
    if (reduceMotion) {
      finish();
      return;
    }
    setClosing(true);
    window.setTimeout(finish, 560);
  }, [reduceMotion]);

  const open = useCallback((i: number) => {
    lastIndexRef.current = i;
    setClosing(false);
    setActiveIndex(i);
  }, []);

  const goRelative = useCallback(
    (dir: 1 | -1) => {
      if (activeIndex == null || detailIndices.length === 0) return;
      const pos = detailIndices.indexOf(activeIndex);
      const nextPos =
        (pos + dir + detailIndices.length) % detailIndices.length;
      const nextIndex = detailIndices[nextPos];
      lastIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      // Reset scroll + parallax for the incoming service.
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      if (heroMediaRef.current)
        heroMediaRef.current.style.transform = "translate3d(0,0,0)";
    },
    [activeIndex, detailIndices]
  );

  // Body scroll-lock + keyboard handling while open.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") goRelative(1);
      else if (e.key === "ArrowLeft") goRelative(-1);
    };
    document.addEventListener("keydown", onKey);

    // Focus the close button once the panel is in the DOM.
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [isOpen, close, goRelative]);

  // Subtle hero parallax on scroll (skipped under reduced motion).
  const onScroll = useCallback(() => {
    if (reduceMotion || !scrollRef.current || !heroMediaRef.current) return;
    const y = scrollRef.current.scrollTop;
    heroMediaRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
  }, [reduceMotion]);

  const setTriggerRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      triggerRefs.current[i] = el;
    },
    []
  );

  const active = activeIndex != null ? services[activeIndex] : null;
  const showCta = !!(ctaText && ctaText.trim());

  const modal =
    isOpen && active && typeof document !== "undefined"
      ? createPortal(
          <div
            className={`svcm-overlay${closing ? " svcm-overlay--closing" : ""}${
              reduceMotion ? " svcm-overlay--reduced" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={active.title ?? active.label ?? "Service details"}
          >
            {/* Backdrop — click to close */}
            <div className="svcm-backdrop" aria-hidden="true" onClick={close} />

            {/* Gold curtain wipe */}
            <div className="svcm-curtain" aria-hidden="true" />

            {/* Grain carried in from the page for continuity */}
            <div className="svcm-grain" aria-hidden="true" />

            <div className="svcm-panel">
              {/* Sticky top bar */}
              <div className="svcm-bar">
                <span className="svcm-bar__index">— {num(activeIndex!)} —</span>
                {active.label && (
                  <span className="svcm-bar__eyebrow">{active.label}</span>
                )}
                <button
                  type="button"
                  ref={closeBtnRef}
                  className="svcm-close"
                  onClick={close}
                  aria-label="Close"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>

              {/* Scrollable content — keyed so reveals replay on prev/next */}
              <div
                className="svcm-scroll"
                ref={scrollRef}
                onScroll={onScroll}
                key={activeIndex}
              >
                {/* Hero stage */}
                {active.image && (
                  <div className="svcm-hero">
                    <div className="svcm-hero__media" ref={heroMediaRef}>
                      <img
                        src={active.image}
                        alt={active.altText}
                        className="svcm-hero__img"
                      />
                    </div>
                    <div className="svcm-hero__scrim" aria-hidden="true" />
                    <div className="svcm-hero__ghost" aria-hidden="true">
                      {num(activeIndex!)}
                    </div>
                  </div>
                )}

                <div className="svcm-article">
                  {active.title && (
                    <h2
                      className="svcm-title"
                      style={{ animationDelay: "0.12s" }}
                    >
                      {active.title}
                    </h2>
                  )}

                  {active.boldText && (
                    <div className="svcm-lead" style={{ animationDelay: "0.2s" }}>
                      {/* WP-sourced HTML — trusted backend only */}
                      {parse(active.boldText, parseOptions)}
                    </div>
                  )}

                  {active.content && (
                    <div className="svcm-body" style={{ animationDelay: "0.28s" }}>
                      {/* WP-sourced HTML — trusted backend only */}
                      {parse(active.content, parseOptions)}
                    </div>
                  )}

                  {/* Footer nav */}
                  <div className="svcm-footer">
                    {detailIndices.length > 1 && (
                      <div className="svcm-nav">
                        <button
                          type="button"
                          className="svcm-nav__btn"
                          onClick={() => goRelative(-1)}
                        >
                          <span aria-hidden="true">←</span> Prev
                        </button>
                        <button
                          type="button"
                          className="svcm-nav__btn"
                          onClick={() => goRelative(1)}
                        >
                          Next <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    )}
                    {showCta && ctaLink && (
                      <a href={ctaLink} className="svcm-cta">
                        {ctaText}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              /* ─── Overlay shell ─────────────────────────── */
              .svcm-overlay {
                position: fixed; inset: 0; z-index: 10000;
                display: flex; align-items: stretch; justify-content: center;
              }
              .svcm-backdrop {
                position: absolute; inset: 0;
                background: rgba(4,4,4,0.72);
                backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
                opacity: 0; animation: svcmBackdropIn 0.5s ease forwards;
              }
              @keyframes svcmBackdropIn { to { opacity: 1; } }

              /* Gold curtain sweeps up, then retracts to reveal the panel */
              .svcm-curtain {
                position: absolute; inset: 0; z-index: 2; transform-origin: bottom;
                background: linear-gradient(180deg, #fde047 0%, #facc15 55%, #eab308 100%);
                animation: svcmCurtain 0.92s cubic-bezier(.16,1,.3,1) forwards;
                pointer-events: none;
              }
              @keyframes svcmCurtain {
                0%   { transform: scaleY(0); transform-origin: bottom; }
                45%  { transform: scaleY(1); transform-origin: bottom; }
                46%  { transform: scaleY(1); transform-origin: top; }
                100% { transform: scaleY(0); transform-origin: top; }
              }
              .svcm-grain {
                position: absolute; inset: 0; z-index: 6; pointer-events: none;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
                background-size: 200px 200px; opacity: 0.05;
              }

              /* ─── Panel ─────────────────────────────────── */
              .svcm-panel {
                position: relative; z-index: 4;
                width: 100%; max-width: 1100px;
                background: #080808; color: #fff;
                display: flex; flex-direction: column;
                box-shadow: 0 0 120px rgba(0,0,0,0.8);
                opacity: 0;
                animation: svcmPanelIn 0.7s cubic-bezier(.16,1,.3,1) 0.42s forwards;
              }
              @keyframes svcmPanelIn {
                from { opacity: 0; transform: translateY(28px); }
                to   { opacity: 1; transform: translateY(0); }
              }

              .svcm-bar {
                position: sticky; top: 0; z-index: 5;
                display: flex; align-items: center; gap: 16px;
                padding: 18px 28px;
                background: rgba(8,8,8,0.82);
                backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                border-bottom: 1px solid rgba(255,255,255,0.07);
              }
              .svcm-bar__index {
                font-size: 10px; font-weight: 700; letter-spacing: 0.26em;
                text-transform: uppercase; color: #facc15;
              }
              .svcm-bar__eyebrow {
                font-size: 10px; font-weight: 700; letter-spacing: 0.24em;
                text-transform: uppercase; color: rgba(255,255,255,0.32);
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
              }
              .svcm-close {
                margin-left: auto; flex-shrink: 0;
                width: 40px; height: 40px; border-radius: 50%;
                display: grid; place-items: center; cursor: pointer;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.7); font-size: 15px;
                transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s;
              }
              .svcm-close:hover {
                color: #000; background: #facc15; border-color: #facc15;
                transform: rotate(90deg);
              }

              .svcm-scroll {
                overflow-y: auto; overflow-x: hidden;
                max-height: 100vh;
                scrollbar-width: thin; scrollbar-color: rgba(250,204,21,0.4) transparent;
              }
              .svcm-scroll::-webkit-scrollbar { width: 8px; }
              .svcm-scroll::-webkit-scrollbar-thumb {
                background: rgba(250,204,21,0.32); border-radius: 8px;
              }

              /* ─── Hero stage ───────────────────────────── */
              .svcm-hero {
                position: relative; height: 60vh; min-height: 340px;
                overflow: hidden; background: #0a0a0a;
              }
              .svcm-hero__media { position: absolute; inset: -8% 0; will-change: transform; }
              .svcm-hero__img {
                width: 100%; height: 100%; object-fit: cover; display: block;
                transform: scale(1.08);
                animation: svcmHeroIn 1.3s cubic-bezier(.16,1,.3,1) 0.5s both;
              }
              @keyframes svcmHeroIn { to { transform: scale(1); } }
              .svcm-hero__scrim {
                position: absolute; inset: 0;
                background: linear-gradient(to bottom, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.35) 55%, #080808 100%);
              }
              .svcm-hero__ghost {
                position: absolute; bottom: -0.18em; right: 2%;
                font-size: clamp(120px, 22vw, 300px); font-weight: 900; line-height: 1;
                color: rgba(250,204,21,0.05); letter-spacing: -0.06em;
                pointer-events: none; user-select: none;
              }

              /* ─── Article ──────────────────────────────── */
              .svcm-article { padding: 48px 28px 80px; }
              .svcm-title {
                font-size: clamp(2.2rem, 6vw, 4.4rem);
                font-weight: 900; line-height: 0.96; letter-spacing: -0.045em;
                max-width: 16ch; margin: 0 auto 28px; text-align: center;
                background: linear-gradient(135deg, #fff 38%, #facc15 52%, #fff 68%);
                background-size: 200% auto;
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: svcmShimmer 6s linear infinite, svcmReveal 0.7s cubic-bezier(.16,1,.3,1) both;
              }
              @keyframes svcmShimmer {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
              }
              .svcm-lead {
                max-width: 760px; margin: 0 auto 44px; text-align: center;
                font-size: clamp(1.25rem, 2.6vw, 1.85rem);
                font-weight: 700; line-height: 1.32; color: rgba(255,255,255,0.92);
                animation: svcmReveal 0.7s cubic-bezier(.16,1,.3,1) both;
              }
              .svcm-lead p { margin: 0 0 0.5em; }
              .svcm-lead p:last-child { margin-bottom: 0; }

              .svcm-body {
                max-width: 720px; margin: 0 auto;
                counter-reset: svcmstep;
                animation: svcmReveal 0.7s cubic-bezier(.16,1,.3,1) both;
              }
              @keyframes svcmReveal {
                from { opacity: 0; transform: translateY(24px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              .svcm-body p {
                font-size: 1.08rem; line-height: 1.85;
                color: rgba(255,255,255,0.66); margin: 0 0 1.5em;
              }
              .svcm-body h2, .svcm-body h4 {
                font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800;
                color: #fff; letter-spacing: -0.02em; line-height: 1.18;
                margin: 2.4em 0 0.8em;
              }
              /* Process steps — auto-numbered gold markers */
              .svcm-body h3 {
                counter-increment: svcmstep;
                position: relative; padding-left: 64px;
                min-height: 44px; display: flex; align-items: center;
                font-size: clamp(1.25rem, 2.6vw, 1.7rem); font-weight: 800;
                color: #fff; letter-spacing: -0.02em; line-height: 1.22;
                margin: 2.6em 0 0.9em;
              }
              .svcm-body h3::before {
                content: counter(svcmstep, decimal-leading-zero);
                position: absolute; left: 0; top: 50%; transform: translateY(-50%);
                width: 44px; height: 44px; border-radius: 50%;
                display: grid; place-items: center;
                font-size: 0.82rem; font-weight: 800; letter-spacing: 0.02em;
                color: #080808; background: #facc15;
                box-shadow: 0 6px 22px rgba(250,204,21,0.28);
              }
              .svcm-body ul, .svcm-body ol {
                margin: 0 0 1.6em; padding-left: 1.4em;
                color: rgba(255,255,255,0.66);
              }
              .svcm-body li { font-size: 1.05rem; line-height: 1.7; margin: 0 0 0.6em; }
              .svcm-body ol { list-style: none; counter-reset: svcmli; padding-left: 0; }
              .svcm-body ol > li {
                position: relative; padding-left: 38px; counter-increment: svcmli;
              }
              .svcm-body ol > li::before {
                content: counter(svcmli); position: absolute; left: 0; top: 0.05em;
                font-size: 0.78rem; font-weight: 800; color: #facc15;
                border: 1px solid rgba(250,204,21,0.4); border-radius: 50%;
                width: 24px; height: 24px; display: grid; place-items: center;
              }
              .svcm-body a { color: #facc15; text-decoration: underline; text-underline-offset: 3px; }
              .svcm-body img { max-width: 100%; height: auto; border-radius: 16px; margin: 1.5em 0; }
              .svcm-body strong { color: rgba(255,255,255,0.9); }

              /* ─── Footer ───────────────────────────────── */
              .svcm-footer {
                max-width: 720px; margin: 64px auto 0;
                padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.1);
                display: flex; align-items: center; justify-content: space-between;
                gap: 24px; flex-wrap: wrap;
              }
              .svcm-nav { display: flex; gap: 12px; }
              .svcm-nav__btn {
                display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
                padding: 11px 20px; border-radius: 999px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: rgba(255,255,255,0.7);
                font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
                transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s;
              }
              .svcm-nav__btn:hover {
                color: #facc15; border-color: rgba(250,204,21,0.4);
                background: rgba(250,204,21,0.07); transform: translateY(-2px);
              }
              .svcm-cta {
                display: inline-flex; align-items: center; gap: 10px;
                background: #facc15; color: #000; font-weight: 700; font-size: 14px;
                padding: 13px 28px; border-radius: 999px;
                box-shadow: 0 4px 24px rgba(250,204,21,0.24);
                transition: background 0.2s, transform 0.25s, box-shadow 0.25s;
              }
              .svcm-cta:hover {
                background: #fff; transform: translateY(-3px);
                box-shadow: 0 14px 44px rgba(250,204,21,0.3);
              }

              /* ─── Exit ─────────────────────────────────── */
              .svcm-overlay--closing .svcm-backdrop { animation: svcmBackdropOut 0.5s ease forwards; }
              @keyframes svcmBackdropOut { to { opacity: 0; } }
              .svcm-overlay--closing .svcm-panel { animation: svcmPanelOut 0.42s cubic-bezier(.7,0,.84,0) forwards; }
              @keyframes svcmPanelOut {
                to { opacity: 0; transform: translateY(32px); }
              }
              .svcm-overlay--closing .svcm-curtain {
                animation: svcmCurtainOut 0.56s cubic-bezier(.16,1,.3,1) forwards;
              }
              @keyframes svcmCurtainOut {
                0%   { transform: scaleY(0); transform-origin: top; }
                100% { transform: scaleY(1); transform-origin: top; }
              }

              /* ─── Reduced motion ───────────────────────── */
              .svcm-overlay--reduced .svcm-curtain { display: none; }
              .svcm-overlay--reduced .svcm-backdrop,
              .svcm-overlay--reduced .svcm-panel,
              .svcm-overlay--reduced .svcm-hero__img,
              .svcm-overlay--reduced .svcm-title,
              .svcm-overlay--reduced .svcm-lead,
              .svcm-overlay--reduced .svcm-body {
                animation: none !important; opacity: 1 !important; transform: none !important;
              }

              @media (max-width: 768px) {
                .svcm-hero { height: 42vh; min-height: 240px; }
                .svcm-article { padding: 36px 20px 64px; }
                .svcm-footer { flex-direction: column-reverse; align-items: stretch; }
                .svcm-nav { justify-content: space-between; }
                .svcm-cta { justify-content: center; }
              }
            `}</style>
          </div>,
          document.body
        )
      : null;

  return { open, setTriggerRef, modal };
}
