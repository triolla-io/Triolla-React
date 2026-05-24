import { client } from "@/lib/apollo-client";
import { GET_ABOUT_PAGE } from "@/lib/queries";
import { gql } from "@apollo/client";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import { FadeIn } from "@/components/FadeIn";
import { FAQAccordion } from "@/components/FAQAccordion";
import { AboutImageCarousel } from "@/components/AboutImageCarousel";
import { WhyUsSection } from "@/components/WhyUsSection";
import parse from "html-react-parser";

function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function getAboutData() {
  try {
    const { data } = await client.query<any>({
      query: gql`
        ${GET_ABOUT_PAGE}
      `,
    });
    return data?.page?.template?.aboutPage ?? {};
  } catch {
    return {};
  }
}

export default async function AboutUsPage() {
  const ap = await getAboutData();

  const faqItems: { faqQuestion: string; faqAnswer: string }[] =
    ap.faqItems ?? [];
  const clientLogos: { sourceUrl: string; name: string }[] = (
    ap.clientLogos ?? []
  )
    .map((l: any) => ({
      sourceUrl: l.logoImage?.node?.sourceUrl ?? "",
      name: l.logoName ?? "",
    }))
    .filter((l: { sourceUrl: string }) => l.sourceUrl);

  const heroTitle = stripHtml(ap.headerTitle ?? "");

  // Showcase images for the carousel directly below the hero
  const showcaseImages = [
    ap.abtopleftImageTop?.node?.sourceUrl,
    ap.abtopleftImageTwo?.node?.sourceUrl,
    ap.leftImageTopThree?.node?.sourceUrl,
  ].filter(Boolean) as string[];

  // Category strip at bottom of hero — derived from why-us card titles
  const heroStripWords = (ap.abthrelist ?? [])
    .map((c: any) => stripHtml(c.abteintitle ?? ""))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-32 relative">
      {/* Grain overlay */}
      <div aria-hidden="true" className="about-grain" />

      {/* ══ HERO ══ */}
      <section className="about-hero">
        <div
          className="about-hero__orb about-hero__orb--gold"
          aria-hidden="true"
        />
        <div
          className="about-hero__orb about-hero__orb--amber"
          aria-hidden="true"
        />
        <div className="about-hero__grid" aria-hidden="true" />

        {/* Corner frame brackets */}
        <div
          className="about-hero__corner about-hero__corner--tl"
          aria-hidden="true"
        />
        <div
          className="about-hero__corner about-hero__corner--tr"
          aria-hidden="true"
        />
        <div
          className="about-hero__corner about-hero__corner--bl"
          aria-hidden="true"
        />
        <div
          className="about-hero__corner about-hero__corner--br"
          aria-hidden="true"
        />

        {/* Ghost number */}
        <div className="about-hero__ghost" aria-hidden="true">
          01
        </div>

        {/* Editorial section index */}
        <div className="about-hero__index" aria-hidden="true">
          — ABOUT —
        </div>

        {ap.headerBgOverlayLayer?.node?.sourceUrl && (
          <div className="about-hero__layer" aria-hidden="true">
            <img src={ap.headerBgOverlayLayer.node.sourceUrl} alt="" />
          </div>
        )}

        <div className="about-hero__content">
          {ap.headerSubText && (
            <FadeIn yOffset={20} duration={0.7}>
              <div className="about-eyebrow about-eyebrow--gold">
                <span className="about-eyebrow__dot" />
                {ap.headerSubText}
                <span className="about-eyebrow__dot" />
              </div>
            </FadeIn>
          )}

          {heroTitle && (
            <FadeIn yOffset={70} delay={0.1} duration={1}>
              <h1 className="about-hero__title">{heroTitle}</h1>
            </FadeIn>
          )}

          <FadeIn delay={0.22} duration={0.8}>
            <div className="about-hero__rule" aria-hidden="true" />
          </FadeIn>

          <div className="about-hero__meta">
            <div className="about-hero__meta-l">
              {ap.boldText && (
                <FadeIn yOffset={16} delay={0.32}>
                  <p className="about-hero__bold">{ap.boldText}</p>
                </FadeIn>
              )}
              {ap.shortText && (
                <FadeIn yOffset={14} delay={0.4}>
                  <p className="about-hero__short">{ap.shortText}</p>
                </FadeIn>
              )}
            </div>
            <div className="about-hero__meta-r">
              {ap.moreText && (
                <FadeIn yOffset={14} delay={0.46}>
                  <p className="about-hero__more">{parse(ap.moreText)}</p>
                </FadeIn>
              )}
              {ap.buttonText && (
                <FadeIn yOffset={20} delay={0.56}>
                  <Link href="/contact-us" className="about-hero__cta">
                    {ap.buttonText}
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
                  </Link>
                </FadeIn>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="about-scroll-cue" aria-hidden="true">
          <div className="about-scroll-cue__line" />
          <span className="about-scroll-cue__label">Scroll</span>
        </div>

        {/* Scrolling category strip — derived from why-us titles */}
        {heroStripWords.length > 0 && (
          <div className="about-hero__strip" aria-hidden="true">
            <div className="about-hero__strip-track">
              {[
                ...heroStripWords,
                ...heroStripWords,
                ...heroStripWords,
                ...heroStripWords,
              ].map((w, i) => (
                <span key={i} className="about-hero__strip-item">
                  {w}
                  <span className="about-hero__strip-dot">✦</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══ SHOWCASE CAROUSEL (below hero) ══ */}
      {showcaseImages.length > 0 && (
        <section className="about-showcase">
          <div className="about-showcase__orb" aria-hidden="true" />

          <FadeIn yOffset={40} duration={0.9}>
            <div className="about-showcase__stage">
              <div className="about-showcase__card about-showcase__card--left">
                <img
                  src={showcaseImages[1] ?? showcaseImages[0]}
                  alt=""
                  className="about-showcase__img"
                />
                <div className="about-showcase__shine" aria-hidden="true" />
              </div>

              <div className="about-showcase__card about-showcase__card--main">
                <img
                  src={showcaseImages[0]}
                  alt=""
                  className="about-showcase__img"
                />
                <div className="about-showcase__shine" aria-hidden="true" />
                <span className="about-showcase__tag">— Inside Triolla —</span>
              </div>

              <div className="about-showcase__card about-showcase__card--right">
                <img
                  src={showcaseImages[2] ?? showcaseImages[0]}
                  alt=""
                  className="about-showcase__img"
                />
                <div className="about-showcase__shine" aria-hidden="true" />
              </div>

              {/* Decorative spark dots */}
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="about-showcase__spark"
                  style={{ "--si": i } as React.CSSProperties}
                  aria-hidden="true"
                />
              ))}
            </div>
          </FadeIn>

          {/* Auto-scroll caption ticker */}
          <div className="about-showcase__ticker" aria-hidden="true">
            <div className="about-showcase__ticker-track">
              {[...Array(8)].map((_, i) => (
                <span key={i} className="about-showcase__ticker-item">
                  Studio
                  <span className="about-showcase__ticker-dot">✦</span>
                  Craft
                  <span className="about-showcase__ticker-dot">✦</span>
                  Process
                  <span className="about-showcase__ticker-dot">✦</span>
                  People
                  <span className="about-showcase__ticker-dot">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CRAFTING SECTION ══ */}
      <section className="about-crafting">
        <div className="about-crafting__inner">
          <FadeIn yOffset={40}>
            <div className="about-section-head">
              <div className="about-eyebrow about-eyebrow--center about-eyebrow--gold">
                <span className="about-eyebrow__line about-eyebrow__line--gold" />
                — 02 —
                <span className="about-eyebrow__line about-eyebrow__line--gold" />
              </div>
              {ap.toprightTitle && (
                <h2 className="about-section-title">{ap.toprightTitle}</h2>
              )}
              {ap.toprightext && (
                /* WP-sourced HTML — trusted backend only */
                <div className="about-section-sub">{parse(ap.toprightext)}</div>
              )}
            </div>
          </FadeIn>

          {(ap.imagesSection ?? []).length > 0 && (
            <div className="about-partners">
              {(ap.imagesSection ?? []).map((item: any, idx: number) => (
                <FadeIn key={idx} delay={idx * 0.12} yOffset={20}>
                  <div className="about-partner">
                    <div className="about-partner__head">
                      {item.imageText && (
                        <span className="about-partner__label">
                          {item.imageText}
                        </span>
                      )}
                      {item.topimages?.node?.sourceUrl && (
                        <img
                          src={item.topimages.node.sourceUrl}
                          alt=""
                          className="about-partner__logo"
                        />
                      )}
                    </div>
                    {item.topabtext && (
                      /* WP-sourced HTML — trusted backend only */
                      <div className="about-partner__body">
                        {parse(item.topabtext)}
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        {/* Wave: dark → cream */}
        <div className="about-wave-down" aria-hidden="true">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 55 L180 22 L360 68 L540 18 L720 60 L900 20 L1080 58 L1260 24 L1440 52 L1440 90 L0 90 Z"
              fill="#f0eeea"
            />
          </svg>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="about-services">
        <div className="about-services__dots" aria-hidden="true" />
        <div className="about-services__inner">
          <FadeIn className="about-section-head">
            <div className="about-eyebrow about-eyebrow--center about-eyebrow--dark-text">
              <span className="about-eyebrow__line about-eyebrow__line--dark" />
              — 03 —
              <span className="about-eyebrow__line about-eyebrow__line--dark" />
            </div>
            {ap.servtitle && (
              <h2 className="about-section-title about-section-title--dark">
                {ap.servtitle}
              </h2>
            )}
            {ap.servtext && (
              /* WP-sourced HTML — trusted backend only */
              <div className="about-section-sub about-section-sub--dark">
                {parse(ap.servtext)}
              </div>
            )}
          </FadeIn>

          <div className="about-svc__rows">
            {(ap.servlist ?? []).map((serv: any, i: number) => (
              <FadeIn key={i} delay={i * 0.08} yOffset={20}>
                <div className="about-srow">
                  <div className="about-srow__left">
                    <div className="about-srow__num">
                      {(i + 1).toString().padStart(2, "0")}
                    </div>
                    <h3 className="about-srow__cat">{serv.servlleftText}</h3>
                  </div>
                  <div className="about-srow__right">
                    <p className="about-srow__items">
                      {(serv.servrightList ?? []).map(
                        (item: any, j: number) => (
                          <span key={j}>
                            <Link
                              href={item.itemLink || "#"}
                              target={item.linkTarget || "_self"}
                              className="about-sitem"
                            >
                              {item.listItem}
                            </Link>
                            {j < (serv.servrightList?.length ?? 0) - 1 && (
                              <span
                                className="about-sitem__sep"
                                aria-hidden="true"
                              >
                                {" "}
                                |{" "}
                              </span>
                            )}
                          </span>
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Wave: cream → dark */}
        <div className="about-wave-down" aria-hidden="true">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 55 L180 22 L360 68 L540 18 L720 60 L900 20 L1080 58 L1260 24 L1440 52 L1440 90 L0 90 Z"
              fill="#080808"
            />
          </svg>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <WhyUsSection
        title={ap.abthretitle ?? ""}
        text={ap.abtthretext ?? ""}
        cards={ap.abthrelist ?? []}
        ctaText={ap.abthrebuttonText}
        ctaLink={ap.abthrebuttonLink}
      />

      {/* ══ DESIGN PROCESS ══ */}
      <section className="about-process">
        <div className="about-process__inner">
          <FadeIn className="about-section-head">
            <div className="about-eyebrow about-eyebrow--center about-eyebrow--gold">
              <span className="about-eyebrow__line about-eyebrow__line--gold" />
              — 04 —
              <span className="about-eyebrow__line about-eyebrow__line--gold" />
            </div>
            {ap.uDesignHeading && (
              /* WP-sourced HTML — trusted backend only */
              <h2 className="about-section-title">
                {parse(ap.uDesignHeading)}
              </h2>
            )}
            {ap.uSortText && (
              /* WP-sourced HTML — trusted backend only */
              <div className="about-section-sub">{parse(ap.uSortText)}</div>
            )}
          </FadeIn>

          <div className="about-process__hint md:hidden" aria-hidden="true">
            <span>Swipe</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7H12M8.5 3.5L12 7L8.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <SectionReveal className="about-process__track">
            {(ap.designType ?? []).map((item: any, i: number) => (
              <div
                key={i}
                className="about-pstep"
                style={{ "--pi": i } as React.CSSProperties}
              >
                <div className="about-pstep__ghost" aria-hidden="true">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <div className="about-pstep__dot" />
                <div className="about-pstep__line" aria-hidden="true" />
                <div className="about-pstep__body">
                  <span className="about-pstep__num">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  {/* WP-sourced HTML — trusted backend only */}
                  <h4 className="about-pstep__name">{parse(item.dName)}</h4>
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* ══ LEARN ══ */}
      {(ap.learnslider ?? []).length > 0 && (
        <section className="about-learn">
          <div className="about-learn__orb" aria-hidden="true" />
          <div className="about-learn__inner">
            <FadeIn className="about-section-head">
              <div className="about-eyebrow about-eyebrow--center about-eyebrow--gold">
                <span className="about-eyebrow__line about-eyebrow__line--gold" />
                — 05 —
                <span className="about-eyebrow__line about-eyebrow__line--gold" />
              </div>
              {ap.learntitle && (
                <h2 className="about-section-title">{ap.learntitle}</h2>
              )}
              {ap.learntext && (
                /* WP-sourced HTML — trusted backend only */
                <div className="about-section-sub">{parse(ap.learntext)}</div>
              )}
            </FadeIn>
            <AboutImageCarousel
              images={(ap.learnslider ?? []).map(
                (s: any) => s.learnimage?.node?.sourceUrl ?? null,
              )}
            />
          </div>
        </section>
      )}

      {/* ══ CLIENTS ══ */}
      {clientLogos.length > 0 && (
        <section className="about-clients">
          <FadeIn className="about-clients__head">
            <h2 className="about-clients__title">Our Clients</h2>
          </FadeIn>
          <div className="about-marquee">
            <div
              className="about-marquee__fade about-marquee__fade--l"
              aria-hidden="true"
            />
            <div
              className="about-marquee__fade about-marquee__fade--r"
              aria-hidden="true"
            />
            <div className="about-marquee__track">
              {[...clientLogos, ...clientLogos].map((logo, i) => (
                <div key={i} className="about-logo-card">
                  <img
                    src={logo.sourceUrl}
                    alt={logo.name || "Client logo"}
                    className="about-logo-card__img"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ FAQ ══ */}
      {faqItems.length > 0 && (
        <section className="about-faq">
          <div className="about-faq__inner">
            <FadeIn>
              <div className="about-eyebrow about-eyebrow--gold">
                <span className="about-eyebrow__line about-eyebrow__line--gold" />
                Got Questions
                <span className="about-eyebrow__line about-eyebrow__line--gold" />
              </div>
              <h2 className="about-faq__title">Frequently Asked Questions</h2>
            </FadeIn>
            <FAQAccordion items={faqItems} />
          </div>
        </section>
      )}

      <style>{`

        /* ─── Text selection ─────────────────── */
        ::selection { background: #fed125; color: #000; }
        .about-services ::selection { background: #0a0a0a; color: #fff; }

        /* ─── Grain ──────────────────────────── */
        .about-grain {
          position: fixed; inset: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.04; pointer-events: none; z-index: 9999;
          animation: aboutGrain 8s steps(10) infinite;
        }
        @keyframes aboutGrain {
          0%   { transform: translate(0,0); }
          10%  { transform: translate(-5%,-10%); }
          20%  { transform: translate(-15%,5%); }
          30%  { transform: translate(7%,-25%); }
          40%  { transform: translate(-5%,25%); }
          50%  { transform: translate(-15%,10%); }
          60%  { transform: translate(15%,0%); }
          70%  { transform: translate(0%,15%); }
          80%  { transform: translate(3%,35%); }
          90%  { transform: translate(-10%,10%); }
          100% { transform: translate(0,0); }
        }

        /* ─── Eyebrow ────────────────────────── */
        .about-eyebrow {
          display: inline-flex; align-items: center; gap: 14px;
          color: rgba(255,255,255,0.3);
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.32em; text-transform: uppercase;
          margin-bottom: 24px;
        }
        .about-eyebrow--center { display: flex; justify-content: center; }
        .about-eyebrow--gold { color: #facc15; }
        .about-eyebrow--dark-text { color: rgba(0,0,0,0.45); }
        .about-eyebrow__dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: currentColor;
          animation: aboutDot 2.2s ease-in-out infinite;
        }
        @keyframes aboutDot { 0%,100%{opacity:1} 50%{opacity:0.22} }
        .about-eyebrow__line {
          display: block; width: 32px; height: 1px;
          background: currentColor; opacity: 0.55;
        }
        .about-eyebrow__line--dark { background: rgba(0,0,0,0.35); opacity: 1; }
        .about-eyebrow__line--gold { background: #facc15; opacity: 0.7; }

        /* ─── HERO (dark, services-style) ─────── */
        .about-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 128px 24px 164px;
          overflow: hidden;
        }
        .about-hero__orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .about-hero__orb--gold {
          bottom: -12%; left: 50%; transform: translateX(-50%);
          width: 900px; height: 480px;
          background: radial-gradient(ellipse at center, rgba(250,204,21,0.14) 0%, transparent 70%);
          animation: aboutOrbGold 9s ease-in-out infinite;
        }
        @keyframes aboutOrbGold { 0%,100%{opacity:0.85} 50%{opacity:0.5} }
        .about-hero__orb--amber {
          top: -8%; left: -12%;
          width: 640px; height: 640px;
          background: radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 65%);
          animation: aboutOrbAmber 13s ease-in-out infinite alternate;
        }
        @keyframes aboutOrbAmber {
          from { opacity: 0.6; transform: translate(0,0); }
          to   { opacity: 1; transform: translate(24px,18px); }
        }
        .about-hero__grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 50%, black 0%, transparent 100%);
        }
        .about-hero__corner {
          position: absolute; width: 28px; height: 28px;
          pointer-events: none; z-index: 2;
        }
        .about-hero__corner--tl { top: 88px; left: 48px; border-top: 1.5px solid rgba(250,204,21,0.32); border-left: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__corner--tr { top: 88px; right: 48px; border-top: 1.5px solid rgba(250,204,21,0.32); border-right: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__corner--bl { bottom: 168px; left: 48px; border-bottom: 1.5px solid rgba(250,204,21,0.32); border-left: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__corner--br { bottom: 168px; right: 48px; border-bottom: 1.5px solid rgba(250,204,21,0.32); border-right: 1.5px solid rgba(250,204,21,0.32); }
        .about-hero__ghost {
          position: absolute; top: 50%; right: -2%; transform: translateY(-52%);
          font-size: clamp(180px, 26vw, 400px); font-weight: 900; line-height: 1;
          color: rgba(250,204,21,0.026); pointer-events: none; user-select: none;
          letter-spacing: -0.06em; z-index: 0;
        }
        .about-hero__index {
          position: absolute; top: 52px; right: 72px; z-index: 3;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(255,255,255,0.17);
        }
        .about-hero__layer {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .about-hero__layer img {
          width: 100%; height: 100%; object-fit: cover; mix-blend-mode: screen; opacity: 0.08;
        }
        .about-hero__content {
          position: relative; z-index: 2;
          max-width: 1100px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .about-hero__title {
          font-size: clamp(3.6rem, 11vw, 128px);
          font-weight: 900; line-height: 0.88;
          letter-spacing: -0.055em;
          background: linear-gradient(135deg, #fff 38%, #facc15 52%, #fff 68%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; color: transparent;
          animation: aboutShimmer 6s linear infinite;
          margin-bottom: 48px; word-break: break-word;
        }
        @keyframes aboutShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .about-hero__rule {
          width: 52%; max-width: 540px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(250,204,21,0.38), transparent);
          margin-bottom: 44px;
        }
        .about-hero__meta {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px; max-width: 680px;
        }
        .about-hero__meta-l { display: flex; flex-direction: column; gap: 10px; align-items: center; }
        .about-hero__meta-r { display: flex; flex-direction: column; gap: 18px; align-items: center; }
        .about-hero__bold { font-size: clamp(1rem,1.9vw,1.4rem); font-weight: 700; color: rgba(255,255,255,0.88); line-height: 1.35; }
        .about-hero__short { font-size: 1rem; color: rgba(255,255,255,0.46); line-height: 1.74; max-width: 560px; }
        .about-hero__more { font-size: 0.9rem; color: rgba(255,255,255,0.32); line-height: 1.8; max-width: 560px; }
        .about-hero__cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: #facc15; color: #000; font-weight: 700; font-size: 15px;
          padding: 16px 34px; border-radius: 999px;
          transition: background 0.22s, transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 4px 28px rgba(250,204,21,0.24);
        }
        .about-hero__cta:hover { background: #fff; transform: translateY(-3px); box-shadow: 0 14px 48px rgba(250,204,21,0.3); }
        .about-scroll-cue {
          position: absolute; bottom: 72px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          z-index: 4; pointer-events: none;
        }
        .about-scroll-cue__line {
          width: 1px; height: 44px;
          background: linear-gradient(to bottom, transparent, rgba(250,204,21,0.55));
          animation: aboutScrollPulse 2s ease-in-out infinite;
        }
        .about-scroll-cue__label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.26); }
        @keyframes aboutScrollPulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.1)} }
        .about-hero__strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
          height: 52px; overflow: hidden;
          display: flex; align-items: center;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.6); backdrop-filter: blur(12px);
        }
        .about-hero__strip-track {
          display: flex; align-items: center; white-space: nowrap;
          animation: aboutStrip 44s linear infinite;
        }
        .about-hero__strip-item {
          display: inline-flex; align-items: center; gap: 14px; padding: 0 28px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .about-hero__strip-dot { color: #facc15; font-size: 7px; }
        @keyframes aboutStrip { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* ─── SHOWCASE (carousel below hero) ─── */
        .about-showcase {
          position: relative;
          padding: 96px 0 80px;
          overflow: hidden;
        }
        .about-showcase__orb {
          position: absolute; top: 10%; left: 50%; transform: translateX(-50%);
          width: 1100px; height: 600px;
          background: radial-gradient(ellipse at center, rgba(250,204,21,0.05) 0%, transparent 65%);
          filter: blur(100px); pointer-events: none; z-index: 0;
        }
        .about-showcase__stage {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr;
          gap: 28px;
          align-items: center;
          perspective: 1400px;
        }
        .about-showcase__card {
          position: relative;
          border-radius: 26px;
          overflow: hidden;
          background: #111;
          box-shadow: 0 26px 80px rgba(0,0,0,0.68), 0 0 0 1px rgba(255,255,255,0.05);
          transition: transform 0.7s cubic-bezier(.23,1,.32,1), box-shadow 0.7s;
          will-change: transform;
        }
        .about-showcase__card--left {
          aspect-ratio: 3 / 4;
          transform: rotate(-3.2deg) translateY(20px);
          animation: scFloatL 7s ease-in-out infinite;
        }
        .about-showcase__card--main {
          aspect-ratio: 4 / 3;
          transform: rotate(0.3deg);
          z-index: 2;
          box-shadow: 0 40px 100px rgba(0,0,0,0.72), 0 0 0 1px rgba(250,204,21,0.1);
          animation: scFloatM 8s ease-in-out infinite;
        }
        .about-showcase__card--right {
          aspect-ratio: 3 / 4;
          transform: rotate(2.6deg) translateY(28px);
          animation: scFloatR 7.5s ease-in-out infinite;
        }
        @keyframes scFloatL {
          0%,100% { transform: rotate(-3.2deg) translateY(20px); }
          50%      { transform: rotate(-2.4deg) translateY(8px); }
        }
        @keyframes scFloatM {
          0%,100% { transform: rotate(0.3deg) translateY(0); }
          50%      { transform: rotate(-0.4deg) translateY(-10px); }
        }
        @keyframes scFloatR {
          0%,100% { transform: rotate(2.6deg) translateY(28px); }
          50%      { transform: rotate(1.8deg) translateY(14px); }
        }
        .about-showcase__card:hover {
          transform: rotate(0deg) translateY(-8px) scale(1.025);
          box-shadow: 0 48px 120px rgba(0,0,0,0.78), 0 0 0 1px rgba(250,204,21,0.18);
          animation-play-state: paused;
          z-index: 3;
        }
        .about-showcase__img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.85s cubic-bezier(.23,1,.32,1);
        }
        .about-showcase__card:hover .about-showcase__img { transform: scale(1.06); }
        .about-showcase__shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(128deg, transparent 36%, rgba(250,204,21,0.06) 50%, transparent 62%);
        }
        .about-showcase__tag {
          position: absolute; bottom: 14px; left: 14px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.72);
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(10px);
          padding: 6px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .about-showcase__spark {
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #facc15;
          opacity: 0;
          animation: scSpark 5s ease-in-out infinite;
          animation-delay: calc(var(--si) * 0.7s);
          top: calc(15% + var(--si) * 12%);
          left: calc(8% + var(--si) * 14%);
          z-index: 1;
          pointer-events: none;
        }
        @keyframes scSpark {
          0%,100% { opacity: 0; transform: scale(0) translateY(0); }
          40%      { opacity: 0.85; transform: scale(1.6) translateY(-12px); }
          70%      { opacity: 0.25; transform: scale(0.7) translateY(-22px); }
        }

        /* Ticker */
        .about-showcase__ticker {
          margin-top: 60px;
          overflow: hidden;
          padding: 14px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,10,0.5);
          backdrop-filter: blur(8px);
        }
        .about-showcase__ticker-track {
          display: flex;
          width: max-content;
          animation: scTicker 38s linear infinite;
        }
        .about-showcase__ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding: 0 18px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
        }
        .about-showcase__ticker-dot {
          color: #facc15;
          font-size: 8px;
        }
        @keyframes scTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ─── Shared section heads ───────────── */
        .about-section-head { text-align: center; margin-bottom: 72px; }
        .about-section-title {
          font-size: clamp(2.2rem, 5.5vw, 4.8rem);
          font-weight: 900; letter-spacing: -0.04em; line-height: 1;
          color: #fff; margin-bottom: 18px;
        }
        .about-section-title--dark { color: #0a0a0a; }
        .about-section-sub { font-size: 1.05rem; color: #6b7280; max-width: 620px; margin: 0 auto; line-height: 1.74; }
        .about-section-sub--dark { color: #4b5563; }

        /* ─── Wave transitions ───────────────── */
        .about-wave-down { position: relative; line-height: 0; z-index: 2; margin-top: 64px; }
        .about-wave-down svg { width: 100%; display: block; }

        /* ─── CRAFTING ───────────────────────── */
        .about-crafting { padding: 96px 0 0; position: relative; }
        .about-crafting__inner {
          max-width: 1100px; margin: 0 auto; padding: 0 32px;
        }
        .about-partners {
          margin-top: 64px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .about-partner {
          padding: 32px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: padding-left 0.32s cubic-bezier(.23,1,.32,1);
          position: relative;
        }
        .about-partner::before {
          content: ''; position: absolute; left: -12px; top: 0; bottom: 0; width: 3px;
          background: #facc15; transform: scaleY(0); transform-origin: top;
          transition: transform 0.4s cubic-bezier(.23,1,.32,1);
        }
        .about-partner:hover { padding-left: 12px; }
        .about-partner:hover::before { transform: scaleY(1); }
        .about-partner__head {
          display: flex; align-items: center; gap: 16px; margin-bottom: 12px;
        }
        .about-partner__label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .about-partner__logo {
          height: 36px; object-fit: contain;
          filter: brightness(10) opacity(0.55);
          transition: filter 0.3s;
        }
        .about-partner:hover .about-partner__logo { filter: brightness(10) opacity(0.9); }
        .about-partner__body { font-size: 0.95rem; color: #6b7280; line-height: 1.7; }

        /* ─── SERVICES ───────────────────────── */
        .about-services {
          position: relative;
          background: #f0eeea;
          padding: 96px 0 0;
          overflow: hidden;
        }
        .about-services__dots {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.13) 1.2px, transparent 1.2px);
          background-size: 36px 36px; opacity: 0.5;
        }
        .about-services__inner {
          max-width: 1000px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }
        .about-srow {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 60px; align-items: start;
          padding: 48px 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          position: relative;
          transition: background 0.3s;
        }
        .about-srow::before {
          content: '';
          position: absolute; left: -32px; top: 0; bottom: 0; width: 3px;
          background: #facc15;
          transform: scaleY(0); transform-origin: top;
          transition: transform 0.4s cubic-bezier(.23,1,.32,1);
        }
        .about-srow:hover::before { transform: scaleY(1); }
        .about-srow:first-child { border-top: 1px solid rgba(0,0,0,0.1); }
        .about-srow__left { display: flex; flex-direction: column; gap: 4px; padding-top: 2px; }
        .about-srow__num {
          font-size: 11px; font-weight: 700; color: rgba(0,0,0,0.25);
          letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6px;
        }
        .about-srow__cat {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 800; color: #0a0a0a;
          line-height: 1.1; letter-spacing: -0.02em;
        }
        .about-srow__right { padding-top: 6px; }
        .about-srow__items { margin: 0; }
        .about-sitem {
          color: #444;
          font-size: 1.05rem;
          font-weight: 400;
          line-height: 1.8;
          transition: color 0.2s;
          text-decoration: none;
        }
        .about-sitem:hover { color: #0a0a0a; }
        .about-sitem__sep {
          color: rgba(0,0,0,0.22);
          font-weight: 300;
          user-select: none;
        }

        /* ─── DESIGN PROCESS ─────────────────── */
        .about-process { padding: 112px 0 96px; overflow: hidden; }
        .about-process__inner { max-width: 1600px; margin: 0 auto; padding: 0 32px; }
        .about-process__hint {
          display: flex; align-items: center; gap: 8px;
          color: rgba(250,204,21,0.55); font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          margin-bottom: 20px; padding: 0 16px;
          animation: aboutSwipeHint 2s ease-in-out infinite;
        }
        @keyframes aboutSwipeHint {
          0%,100%{opacity:0.5;transform:translateX(0)}
          50%{opacity:1;transform:translateX(6px)}
        }
        .about-process__track {
          display: flex; overflow-x: auto; gap: 28px;
          padding: 20px 16px 52px;
          scrollbar-width: none; -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
        }
        .about-process__track::-webkit-scrollbar { display: none; }
        .about-pstep {
          flex-shrink: 0; min-width: 280px; scroll-snap-align: start;
          position: relative; padding-top: 56px; padding-right: 12px;
        }
        .about-pstep__ghost {
          position: absolute; top: -22px; left: -10px;
          font-size: 128px; font-weight: 900;
          color: rgba(255,255,255,0.026); line-height: 1;
          pointer-events: none; user-select: none;
        }
        .about-pstep__dot {
          width: 14px; height: 14px; background: #facc15; border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(250,204,21,0.14), 0 0 22px rgba(250,204,21,0.32);
          position: relative; z-index: 2;
        }
        .about-pstep__line {
          position: absolute;
          top: calc(56px + 7px); left: 7px; height: 1px; right: -28px;
          background: linear-gradient(to right, rgba(250,204,21,0.32), rgba(255,255,255,0.05) 75%, transparent);
        }
        .about-pstep__body { margin-top: 22px; }
        .about-pstep__num {
          display: block; font-size: 11px; font-weight: 700;
          color: #facc15; letter-spacing: 0.18em; margin-bottom: 8px;
        }
        .about-pstep__name {
          font-size: 1.15rem;
          font-weight: 700; color: #fff; line-height: 1.35;
        }

        /* ─── LEARN ──────────────────────────── */
        .about-learn {
          position: relative; background: #0a0a0a;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 112px 0 80px; overflow: hidden;
        }
        .about-learn__orb {
          position: absolute; top: -8%; left: -4%;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 65%);
          filter: blur(90px); pointer-events: none;
        }
        .about-learn__inner {
          max-width: 1600px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }

        /* ─── CLIENTS ────────────────────────── */
        .about-clients { padding: 96px 0; }
        .about-clients__head { text-align: center; margin-bottom: 52px; }
        .about-clients__title {
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 800; letter-spacing: -0.03em;
        }
        .about-marquee { position: relative; overflow: hidden; padding: 8px 0; }
        .about-marquee__fade {
          position: absolute; top: 0; bottom: 0; width: 180px; z-index: 2; pointer-events: none;
        }
        .about-marquee__fade--l { left: 0; background: linear-gradient(to right, #080808, transparent); }
        .about-marquee__fade--r { right: 0; background: linear-gradient(to left, #080808, transparent); }
        .about-marquee__track {
          display: flex; gap: 16px;
          animation: aboutMarquee 32s linear infinite; width: max-content;
        }
        .about-marquee:hover .about-marquee__track { animation-play-state: paused; }
        @keyframes aboutMarquee {
          0%{transform:translateX(0)} 100%{transform:translateX(-50%)}
        }
        .about-logo-card {
          flex-shrink: 0; width: 160px; height: 100px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
          display: flex; align-items: center; justify-content: center; padding: 12px;
          transition: border-color 0.35s, background 0.35s, transform 0.35s;
        }
        .about-logo-card:hover {
          border-color: rgba(250,204,21,0.18); background: rgba(250,204,21,0.03);
          transform: translateY(-4px) scale(1.03);
        }
        .about-logo-card__img { width: 100%; height: 100%; object-fit: contain; }

        /* ─── FAQ ────────────────────────────── */
        .about-faq {
          padding: 112px 0 80px; border-top: 1px solid rgba(255,255,255,0.04);
        }
        .about-faq__inner { max-width: 880px; margin: 0 auto; padding: 0 32px; }
        .about-faq__title {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 60px;
        }

        /* ─── RESPONSIVE ─────────────────────── */
        @media (max-width: 1100px) {
          .about-showcase__stage {
            grid-template-columns: 1fr;
            gap: 20px;
            max-width: 520px;
          }
          .about-showcase__card--left,
          .about-showcase__card--right {
            aspect-ratio: 4 / 3;
          }
          .about-showcase__card--left { transform: rotate(-1.6deg); animation: none; }
          .about-showcase__card--main { transform: rotate(0deg); animation: none; }
          .about-showcase__card--right { transform: rotate(1.4deg); animation: none; }
        }
        @media (max-width: 768px) {
          .about-hero { padding: 96px 20px 148px; }
          .about-hero__corner { display: none; }
          .about-hero__ghost { font-size: clamp(110px, 38vw, 180px); }
          .about-hero__index { right: 20px; top: 30px; }
          .about-showcase { padding: 64px 0 56px; }
          .about-showcase__stage { padding: 0 20px; }
          .about-showcase__ticker { margin-top: 40px; }
          .about-crafting { padding-top: 64px; }
          .about-crafting__inner { padding: 0 20px; }
          .about-services { padding: 80px 0 0; }
          .about-services__inner { padding: 0 20px; }
          .about-srow { grid-template-columns: 1fr; gap: 8px; padding: 32px 0; }
          .about-srow__cat { font-size: 1.6rem; }
          .about-process { padding: 80px 0 64px; }
          .about-process__inner { padding: 0 20px; }
          .about-pstep { min-width: 220px; }
          .about-learn { padding: 80px 0 64px; }
          .about-learn__inner { padding: 0 20px; }
          .about-faq { padding: 80px 0 64px; }
          .about-faq__inner { padding: 0 20px; }
        }
      `}</style>
    </main>
  );
}
