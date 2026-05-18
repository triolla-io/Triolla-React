"use client";

import { useState, useRef } from "react";

interface ContactItem {
  label: string;
  value: string;
  href?: string;
}

interface WannaChatSectionProps {
  contactItems: ContactItem[];
  leftHeading?: string | null;
  formHeading?: string | null;
  submitLabel?: string | null;
  callUsLabel?: string | null;
}

const FORM_FIELDS = [
  { key: "name",  type: "text",  label: "Full Name",    required: true  },
  { key: "phone", type: "tel",   label: "Phone",        required: false },
  { key: "email", type: "email", label: "Email",        required: true  },
] as const;

export function WannaChatSection({ contactItems, leftHeading, formHeading, submitLabel, callUsLabel }: WannaChatSectionProps) {
  const [fields, setFields] = useState({ name: "", phone: "", email: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (status !== "idle") return;
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
      setFields({ name: "", phone: "", email: "" });
      setTimeout(() => setStatus("idle"), 3500);
    }, 1600);
  };

  /* 3-D tilt on the form card */
  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "none";
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(10px)`;
  };
  const onCardLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.65s cubic-bezier(.23,1,.32,1)";
    card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)";
  };

  return (
    <>
      <section className="wc-root">
        <div className="wc-card">
          {/* ── background layers ── */}
          <div className="wc-orb wc-orb--a" />
          <div className="wc-orb wc-orb--b" />
          <div className="wc-orb wc-orb--c" />
          <div className="wc-grid" />

          {/* floating particles */}
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="wc-dot" style={{ "--i": i } as React.CSSProperties} />
          ))}

          {/* ── layout ── */}
          <div className="wc-layout">

            {/* LEFT — heading + info */}
            <div className="wc-left">
              {leftHeading && (
                <h2 className="wc-heading">
                  {leftHeading.split("\n").map((line, i) => (
                    <span key={i} className={i === 0 ? "wc-heading__white" : "wc-heading__gold"}>
                      {line}
                    </span>
                  ))}
                </h2>
              )}

              <div className="wc-rule" />

              {contactItems.length > 0 && (
                <div className="wc-info">
                  {callUsLabel && <p className="wc-info__eyebrow">{callUsLabel}</p>}
                  {contactItems.map((item, i) => (
                    <div key={i} className="wc-item">
                      <span className="wc-item__lbl">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="wc-item__val wc-item__val--link">{item.value}</a>
                      ) : (
                        <span className="wc-item__val">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — form card */}
            <div className="wc-right">
              <div
                ref={cardRef}
                className="wc-form"
                onMouseMove={onCardMove}
                onMouseLeave={onCardLeave}
              >
                <div className="wc-form__glow" />
                <div className="wc-form__sweep" />

                {/* corner decoration */}
                <div className="wc-corner" aria-hidden="true">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                    <path d="M60 0 L60 60 L0 60" stroke="rgba(250,204,21,0.12)" strokeWidth="1" fill="none"/>
                    <path d="M60 12 L60 60 L12 60" stroke="rgba(250,204,21,0.07)" strokeWidth="1" fill="none"/>
                    <path d="M60 24 L60 60 L24 60" stroke="rgba(250,204,21,0.04)" strokeWidth="1" fill="none"/>
                  </svg>
                </div>

                {formHeading && <h3 className="wc-form__kicker">{formHeading}</h3>}

                <div className="wc-fields">
                  {FORM_FIELDS.map((f) => {
                    const val = fields[f.key];
                    const up  = focused === f.key || val.length > 0;
                    return (
                      <div key={f.key} className={`wc-field${up ? " wc-field--up" : ""}`}>
                        <label className="wc-field__lbl" htmlFor={`wc-${f.key}`}>
                          {f.label}{f.required && <i className="wc-req">*</i>}
                        </label>
                        <input
                          id={`wc-${f.key}`}
                          type={f.type}
                          className="wc-field__inp"
                          value={val}
                          onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                          onFocus={() => setFocused(f.key)}
                          onBlur={() => setFocused(null)}
                          autoComplete={f.key}
                        />
                        <span className="wc-field__bar" />
                      </div>
                    );
                  })}

                </div>

                <button
                  type="button"
                  className={`wc-btn${status === "sending" ? " wc-btn--busy" : ""}${status === "sent" ? " wc-btn--done" : ""}`}
                  onClick={handleSubmit}
                  disabled={status !== "idle"}
                  aria-live="polite"
                >
                  <span className="wc-btn__sweep" />
                  <span className="wc-btn__txt">
                    {status === "sent" ? "✓" : status === "sending" ? "…" : (submitLabel ?? "")}
                  </span>
                  {status === "idle" && (
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
                      <path d="M2 8.5H15M11 4L15.5 8.5L11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {status === "sent" && (
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
                      <path d="M2.5 9L7 13.5L14.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {status === "sending" && <span className="wc-btn__spin" />}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════
           WANNA CHAT — premium contact section
        ═══════════════════════════════════════════════ */

        .wc-root {
          margin-top: 96px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 16px;
          padding-right: 16px;
        }
        @media (min-width: 1024px) {
          .wc-root { padding-left: 32px; padding-right: 32px; }
        }

        /* ── outer card ── */
        .wc-card {
          position: relative;
          overflow: hidden;
          border-radius: 52px;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(250,204,21,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(251,146,60,0.04) 0%, transparent 50%),
            #090909;
          border: 1px solid rgba(250,204,21,0.1);
          box-shadow:
            0 70px 160px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.04),
            inset 0 -1px 0 rgba(0,0,0,0.3);
        }

        /* ── orbs ── */
        .wc-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(96px);
        }
        .wc-orb--a {
          top: -25%; left: -10%;
          width: 720px; height: 720px;
          background: radial-gradient(circle, rgba(250,204,21,0.11) 0%, transparent 60%);
          animation: wcFloat 13s ease-in-out infinite;
        }
        .wc-orb--b {
          bottom: -20%; right: -8%;
          width: 560px; height: 560px;
          background: radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 60%);
          animation: wcFloat 17s ease-in-out infinite reverse;
        }
        .wc-orb--c {
          top: 35%; left: 42%;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 60%);
          animation: wcFloat 22s ease-in-out infinite;
        }
        @keyframes wcFloat {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.8; }
          33%      { transform: translate(24px,-18px) scale(1.06); opacity: 1; }
          66%      { transform: translate(-12px,22px) scale(0.97); opacity: 0.85; }
        }

        /* ── grid texture ── */
        .wc-grid {
          position: absolute;
          inset: 0;
          border-radius: 52px;
          background-image:
            linear-gradient(rgba(250,204,21,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.016) 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: radial-gradient(ellipse 90% 80% at 18% 50%, black 0%, transparent 100%);
        }

        /* ── floating particles ── */
        .wc-dot {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #facc15;
          opacity: 0;
          top:  calc(6%  + var(--i) * 10%);
          left: calc(2%  + var(--i) * 7%);
          animation: wcDotRise calc(5s + var(--i) * 1.6s) ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.85s);
        }
        @keyframes wcDotRise {
          0%   { opacity: 0; transform: translateY(0)   scale(0); }
          20%  { opacity: 0.55; transform: translateY(-28px)  scale(1); }
          70%  { opacity: 0.1; transform: translateY(-80px)  scale(0.6); }
          100% { opacity: 0; transform: translateY(-130px) scale(0); }
        }

        /* ── layout ── */
        .wc-layout {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 56px;
          padding: 68px 40px;
        }
        @media (min-width: 900px) {
          .wc-layout {
            flex-direction: row;
            align-items: flex-start;
            padding: 92px 88px;
            gap: 80px;
          }
        }

        /* ─────────────────────────────────────────────
           LEFT COLUMN
        ───────────────────────────────────────────── */
        .wc-left { flex: 1; min-width: 0; }

        /* heading — content from WP cLeftHeading, split into two lines */
        .wc-heading {
          display: flex;
          flex-direction: column;
          font-size: clamp(2.4rem, 5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -0.04em;
          margin-bottom: 36px;
        }
        .wc-heading__white {
          display: block;
          color: #fff;
        }
        .wc-heading__gold {
          display: block;
          background: linear-gradient(128deg, #facc15 0%, #fbbf24 40%, #f59e0b 70%, #facc15 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: wcGoldMove 5s linear infinite;
        }
        @keyframes wcGoldMove {
          0%   { background-position: 220% center; }
          100% { background-position: -20% center; }
        }

        /* horizontal rule */
        .wc-rule {
          width: 56px; height: 2px;
          background: linear-gradient(to right, rgba(250,204,21,0.8), rgba(250,204,21,0));
          border-radius: 2px;
          margin-bottom: 38px;
        }

        /* contact info */
        .wc-info { display: flex; flex-direction: column; gap: 22px; }
        .wc-info__eyebrow {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        .wc-item {
          position: relative;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .wc-item::before {
          content: '';
          position: absolute;
          left: 0; top: 3px; bottom: 3px;
          width: 2px;
          border-radius: 2px;
          background: rgba(250,204,21,0.25);
          transition: background 0.25s, box-shadow 0.25s;
        }
        .wc-item:hover::before {
          background: #facc15;
          box-shadow: 0 0 8px rgba(250,204,21,0.5);
        }
        .wc-item__lbl {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
        }
        .wc-item__val {
          font-size: 15.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.62);
          transition: color 0.22s;
        }
        .wc-item__val--link:hover { color: #facc15; }

        /* ─────────────────────────────────────────────
           RIGHT COLUMN — form card
        ───────────────────────────────────────────── */
        .wc-right {
          flex: 0 0 auto;
          width: 100%;
        }
        @media (min-width: 900px) {
          .wc-right { width: 460px; }
        }

        .wc-form {
          position: relative;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(250,204,21,0.13);
          border-radius: 30px;
          padding: 46px 38px;
          overflow: hidden;
          will-change: transform;
          transition: border-color 0.4s, box-shadow 0.4s;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.035),
            0 28px 80px rgba(0,0,0,0.4);
        }
        .wc-form:hover,
        .wc-form:focus-within {
          border-color: rgba(250,204,21,0.24);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04),
            0 32px 100px rgba(0,0,0,0.45),
            0 0 60px rgba(250,204,21,0.04);
        }

        /* inner corner-glow on focus */
        .wc-form__glow {
          position: absolute;
          top: -80px; right: -80px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.09) 0%, transparent 65%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.45s;
        }
        .wc-form:focus-within .wc-form__glow { opacity: 1; }

        /* hover sweep */
        .wc-form__sweep {
          position: absolute;
          inset: 0;
          border-radius: 30px;
          background: linear-gradient(120deg, transparent 28%, rgba(250,204,21,0.032) 50%, transparent 72%);
          background-size: 300% 100%;
          background-position: 250% 0;
          transition: background-position 0.85s ease;
          pointer-events: none;
        }
        .wc-form:hover .wc-form__sweep { background-position: -100% 0; }

        /* corner decoration */
        .wc-corner {
          position: absolute;
          bottom: 0; right: 0;
          pointer-events: none;
        }

        /* form heading — content from WP cContactFormHeading */
        .wc-form__kicker {
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: #fff;
          margin-bottom: 36px;
          position: relative;
        }

        /* ── floating-label fields ── */
        .wc-fields {
          display: flex;
          flex-direction: column;
          gap: 34px;
          margin-bottom: 36px;
          position: relative;
        }

        .wc-field {
          position: relative;
          padding-top: 22px;
        }
        .wc-field__lbl {
          position: absolute;
          top: 22px; left: 0;
          font-size: 15px;
          color: rgba(255,255,255,0.28);
          pointer-events: none;
          transform-origin: top left;
          transition: transform 0.28s cubic-bezier(.23,1,.32,1), color 0.28s;
          will-change: transform;
        }
        .wc-field--up .wc-field__lbl,
        .wc-field:focus-within .wc-field__lbl {
          transform: translateY(-22px) scale(0.7);
          color: #facc15;
        }
        .wc-req {
          font-style: normal;
          color: #facc15;
          margin-left: 1px;
        }

        .wc-field__inp {
          display: block;
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 2px 0 13px;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          outline: none;
          font-family: inherit;
          transition: border-color 0.28s;
        }
.wc-field__inp::placeholder { color: transparent; }
        .wc-field:focus-within .wc-field__inp { border-color: rgba(250,204,21,0.14); }

        /* animated golden bar */
        .wc-field__bar {
          display: block;
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1.5px;
          background: linear-gradient(90deg, #facc15, #fbbf24);
          box-shadow: 0 0 10px rgba(250,204,21,0.55);
          border-radius: 1px;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.36s cubic-bezier(.23,1,.32,1);
        }
        .wc-field:focus-within .wc-field__bar { transform: scaleX(1); }

        /* ── submit button ── */
        .wc-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: #facc15;
          color: #000;
          font-size: 14.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 19px 28px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: background 0.3s, transform 0.3s cubic-bezier(.23,1,.32,1), box-shadow 0.3s;
          user-select: none;
        }
        .wc-btn__sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 15%, rgba(255,255,255,0.24) 50%, transparent 85%);
          transform: translateX(-130%);
          transition: transform 0.65s ease;
          border-radius: inherit;
        }
        .wc-btn:hover .wc-btn__sweep { transform: translateX(130%); }
        .wc-btn:hover:not(:disabled) {
          background: #fff;
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(250,204,21,0.5), 0 4px 16px rgba(0,0,0,0.14);
        }
        .wc-btn:active:not(:disabled) { transform: translateY(-1px); }
        .wc-btn--done {
          background: #16a34a !important;
          color: #fff !important;
          box-shadow: 0 12px 36px rgba(22,163,74,0.4) !important;
        }
        .wc-btn--busy { opacity: 0.72; cursor: wait; }
        .wc-btn__txt { position: relative; z-index: 1; }

        .wc-btn__spin {
          position: relative;
          z-index: 1;
          width: 17px; height: 17px;
          border: 2.5px solid rgba(0,0,0,0.22);
          border-top-color: #000;
          border-radius: 50%;
          animation: wcSpin 0.72s linear infinite;
          flex-shrink: 0;
        }
        @keyframes wcSpin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
