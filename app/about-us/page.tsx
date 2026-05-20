import { client } from "@/lib/apollo-client";
import { GET_ABOUT_PAGE } from "@/lib/queries";
import { gql } from "@apollo/client";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import { FadeIn } from "@/components/FadeIn";
import { FAQAccordion } from "@/components/FAQAccordion";
import { AboutImageCarousel } from "@/components/AboutImageCarousel";

async function getAboutData() {
  const { data } = await client.query<any>({
    query: gql`${GET_ABOUT_PAGE}`,
  });
  return data.page.template.aboutPage;
}

export default async function AboutUsPage() {
  const ap = await getAboutData();

  const faqItems: { faqQuestion: string; faqAnswer: string }[] = ap.faqItems ?? [];
  const clientLogos: { sourceUrl: string; name: string }[] = (ap.clientLogos ?? [])
    .map((l: any) => ({
      sourceUrl: l.logoImage?.node?.sourceUrl ?? "",
      name: l.logoName ?? "",
    }))
    .filter((l: { sourceUrl: string }) => l.sourceUrl);

  const heroColor = ap.headerBgColor || "#fed125";

  return (
    <main className="bg-[#080808] text-white overflow-hidden pb-32 relative">

      {/* Grain overlay */}
      <div aria-hidden="true" className="about-grain" />

      {/* ══ HERO ══ */}
      <section className="about-hero" style={{ backgroundColor: heroColor }}>
        {/* Dot grid texture */}
        <div className="about-hero__dots" aria-hidden="true" />

        {/* Decorative rings — wrapper handles position, inner handles rotation */}
        <div className="about-hero__ring-wrap" aria-hidden="true">
          <div className="about-hero__ring">
            <div className="about-hero__ring-inner" />
          </div>
        </div>

        {/* Editorial section index */}
        <div className="about-hero__index" aria-hidden="true">— 01 —</div>

        {ap.headerBgOverlayLayer?.node?.sourceUrl && (
          <div className="about-hero__layer" aria-hidden="true">
            <img src={ap.headerBgOverlayLayer.node.sourceUrl} alt="" />
          </div>
        )}

        {[...Array(8)].map((_, i) => (
          <div key={i} className="about-hero__spark" style={{ "--si": i } as React.CSSProperties} aria-hidden="true" />
        ))}

        <div className="about-hero__content">
          <div className="about-hero__top">
            <FadeIn yOffset={20} duration={0.7}>
              <div className="about-eyebrow about-eyebrow--dark">
                <span className="about-eyebrow__dot" />
                About Triolla
                <span className="about-eyebrow__dot" />
              </div>
            </FadeIn>
          </div>

          <FadeIn yOffset={70} delay={0.1} duration={1}>
            <h1 className="about-hero__title">{ap.headerTitle}</h1>
          </FadeIn>

          <FadeIn delay={0.22} duration={0.8}>
            <div className="about-hero__rule" aria-hidden="true" />
          </FadeIn>

          <div className="about-hero__meta">
            <div className="about-hero__meta-l">
              {ap.boldText && (
                <FadeIn yOffset={20} delay={0.32}>
                  <p className="about-hero__bold">{ap.boldText}</p>
                </FadeIn>
              )}
              {ap.shortText && (
                <FadeIn yOffset={16} delay={0.4}>
                  <p className="about-hero__short">{ap.shortText}</p>
                </FadeIn>
              )}
            </div>
            <div className="about-hero__meta-r">

              {ap.moreText && (
                <FadeIn yOffset={16} delay={0.46}>
                  <div
                    className="about-hero__more"
                    dangerouslySetInnerHTML={{ __html: ap.moreText }}
                  />
                </FadeIn>
              )}
              {ap.buttonText && (
                <FadeIn yOffset={20} delay={0.56}>
                  <Link href="/contact-us" className="about-hero__cta">
                    {ap.buttonText}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </FadeIn>
              )}
            </div>
          </div>
        </div>

        {/* Multi-point jagged cut into dark */}
        <div className="about-hero__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 75 L240 38 L480 82 L720 28 L960 72 L1200 32 L1440 65 L1440 100 L0 100 Z" fill="#080808" />
          </svg>
        </div>
      </section>

      {/* ══ CRAFTING SECTION ══ */}
      <section className="about-crafting">
        <div className="about-crafting__inner">
          <div className="about-crafting__visual">
            {ap.abtopleftImageTop?.node?.sourceUrl && (
              <div className="about-img-main">
                <img src={ap.abtopleftImageTop.node.sourceUrl} alt="" className="about-img-main__img" />
                <div className="about-img-main__shine" aria-hidden="true" />
              </div>
            )}
            <div className="about-img-row">
              {ap.leftImageTopThree?.node?.sourceUrl && (
                <div className="about-img-b">
                  <img src={ap.leftImageTopThree.node.sourceUrl} alt="" className="about-img-b__img" />
                </div>
              )}
              {ap.abtopleftImageTwo?.node?.sourceUrl && (
                <div className="about-img-c">
                  <img src={ap.abtopleftImageTwo.node.sourceUrl} alt="" className="about-img-c__img" />
                </div>
              )}
            </div>
          </div>

          <div className="about-crafting__text">
            <FadeIn yOffset={40}>
              <h2 className="about-crafting__title">{ap.toprightTitle}</h2>
              <div
                className="about-crafting__body"
                dangerouslySetInnerHTML={{ __html: ap.toprightext }}
              />
            </FadeIn>

            {(ap.imagesSection ?? []).length > 0 && (
              <div className="about-partners">
                {(ap.imagesSection ?? []).map((item: any, idx: number) => (
                  <FadeIn key={idx} delay={idx * 0.12} yOffset={20}>
                    <div className="about-partner">
                      <div className="about-partner__head">
                        {item.imageText && <span className="about-partner__label">{item.imageText}</span>}
                        {item.topimages?.node?.sourceUrl && (
                          <img src={item.topimages.node.sourceUrl} alt="" className="about-partner__logo" />
                        )}
                      </div>
                      <div
                        className="about-partner__body"
                        dangerouslySetInnerHTML={{ __html: item.topabtext }}
                      />
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="about-services">
        <div className="about-services__inner">
          <FadeIn className="about-svc__head">
            <h2 className="about-svc__title">{ap.servtitle}</h2>
            <div className="about-svc__sub" dangerouslySetInnerHTML={{ __html: ap.servtext }} />
          </FadeIn>

          <div className="about-svc__rows">
            {(ap.servlist ?? []).map((serv: any, i: number) => (
              <FadeIn key={i} delay={i * 0.08} yOffset={20}>
                <div className="about-srow">
                  <div className="about-srow__left">
                    <div className="about-srow__num">{(i + 1).toString().padStart(2, "0")}</div>
                    <h3 className="about-srow__cat">{serv.servlleftText}</h3>
                  </div>
                  <div className="about-srow__right">
                    <p className="about-srow__items">
                      {(serv.servrightList ?? []).map((item: any, j: number) => (
                        <span key={j}>
                          <Link
                            href={item.itemLink || "#"}
                            target={item.linkTarget || "_self"}
                            className="about-sitem"
                          >
                            {item.listItem}
                          </Link>
                          {j < (serv.servrightList?.length ?? 0) - 1 && (
                            <span className="about-sitem__sep" aria-hidden="true"> | </span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section className="about-why">
        <div className="about-why__orb-l" aria-hidden="true" />
        <div className="about-why__orb-r" aria-hidden="true" />

        <div className="about-why__inner">
          <div className="about-why__header">
            <FadeIn className="about-why__h-left">
              <h2
                className="about-why__title"
                dangerouslySetInnerHTML={{ __html: ap.abthretitle }}
              />
            </FadeIn>
            <FadeIn delay={0.12} className="about-why__h-right">
              <div
                className="about-why__sub"
                dangerouslySetInnerHTML={{ __html: ap.abtthretext }}
              />
              {ap.abthrebuttonText && (
                <Link href={ap.abthrebuttonLink || "#"} className="about-why__cta">
                  {ap.abthrebuttonText}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </FadeIn>
          </div>

          <SectionReveal className="about-why__grid">
            {(ap.abthrelist ?? []).map((item: any, i: number) => (
              <div key={i} className="about-card" style={{ "--ci": i } as React.CSSProperties}>
                <div className="about-card__ghost" aria-hidden="true">{(i + 1).toString().padStart(2, "0")}</div>
                {item.abthreimage?.node?.sourceUrl && (
                  <div className="about-card__icon-wrap">
                    <img src={item.abthreimage.node.sourceUrl} alt="" className="about-card__icon" />
                  </div>
                )}
                <h4
                  className="about-card__title"
                  dangerouslySetInnerHTML={{ __html: item.abteintitle }}
                />
                <p
                  className="about-card__body"
                  dangerouslySetInnerHTML={{ __html: item.abthreintext }}
                />
                <div className="about-card__bar" aria-hidden="true" />
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* ══ DESIGN PROCESS ══ */}
      <section className="about-process">
        <div className="about-process__inner">
          <FadeIn className="about-process__head">
            <h2
              className="about-process__title"
              dangerouslySetInnerHTML={{ __html: ap.uDesignHeading }}
            />
            <p
              className="about-process__sub"
              dangerouslySetInnerHTML={{ __html: ap.uSortText }}
            />
          </FadeIn>

          <div className="about-process__hint md:hidden" aria-hidden="true">
            <span>Swipe</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M8.5 3.5L12 7L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <SectionReveal className="about-process__track">
            {(ap.designType ?? []).map((item: any, i: number) => (
              <div key={i} className="about-pstep" style={{ "--pi": i } as React.CSSProperties}>
                <div className="about-pstep__ghost" aria-hidden="true">{(i + 1).toString().padStart(2, "0")}</div>
                <div className="about-pstep__dot" />
                <div className="about-pstep__line" aria-hidden="true" />
                <div className="about-pstep__body">
                  <span className="about-pstep__num">{(i + 1).toString().padStart(2, "0")}</span>
                  <h4
                    className="about-pstep__name"
                    dangerouslySetInnerHTML={{ __html: item.dName }}
                  />
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
            <FadeIn className="about-learn__head">
              <h2 className="about-learn__title">{ap.learntitle}</h2>
              <div
                className="about-learn__sub"
                dangerouslySetInnerHTML={{ __html: ap.learntext }}
              />
            </FadeIn>
            <AboutImageCarousel
              images={(ap.learnslider ?? []).map((s: any) => s.learnimage?.node?.sourceUrl ?? null)}
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
            <div className="about-marquee__fade about-marquee__fade--l" aria-hidden="true" />
            <div className="about-marquee__fade about-marquee__fade--r" aria-hidden="true" />
            <div className="about-marquee__track">
              {[...clientLogos, ...clientLogos].map((logo, i) => (
                <div key={i} className="about-logo-card">
                  <img src={logo.sourceUrl} alt={logo.name || "Client logo"} className="about-logo-card__img" />
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
              <div className="about-eyebrow">
                <span className="about-eyebrow__line" />
                Got Questions
                <span className="about-eyebrow__line" />
              </div>
              <h2 className="about-faq__title">Frequently Asked Questions</h2>
            </FadeIn>
            <FAQAccordion items={faqItems} />
          </div>
        </section>
      )}

      <style>{`

        /* ─── Grain ──────────────────────────── */
        .about-grain {
          position: fixed; inset: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.04; pointer-events: none; z-index: 9999;
          animation: grain 8s steps(10) infinite;
        }
        @keyframes grain {
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
          color: rgba(255,255,255,0.35);
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          margin-bottom: 28px;
        }
        .about-eyebrow--dark { color: rgba(0,0,0,0.45); }
        .about-eyebrow--center { display: flex; justify-content: center; }
        .about-eyebrow__line {
          display: block; width: 36px; height: 1px;
          background: currentColor; opacity: 0.6;
        }
        .about-eyebrow__dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: currentColor;
          animation: eyeDot 2.2s ease-in-out infinite;
        }
        @keyframes eyeDot { 0%,100%{opacity:1} 50%{opacity:0.25} }

        /* ─── HERO ───────────────────────────── */
        .about-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center;
          padding: 128px 24px 200px;
          overflow: hidden;
        }

        /* dot grid texture */
        .about-hero__dots {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(0,0,0,0.2) 1.2px, transparent 1.2px);
          background-size: 36px 36px;
          opacity: 0.55;
        }

        /* ring — wrapper handles translateY, inner handles rotation so transforms don't conflict */
        .about-hero__ring-wrap {
          position: absolute;
          top: 50%; right: -260px;
          transform: translateY(-50%);
          width: 920px; height: 920px;
          pointer-events: none; z-index: 0;
        }
        .about-hero__ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1px dashed rgba(0,0,0,0.11);
          animation: heroRingRotate 80s linear infinite;
        }
        .about-hero__ring-inner {
          position: absolute; inset: 112px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.07);
        }
        @keyframes heroRingRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* editorial section index */
        .about-hero__index {
          position: absolute; top: 48px; right: 72px; z-index: 2;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(0,0,0,0.2);
        }

        .about-hero__layer {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .about-hero__layer img {
          width: 100%; height: 100%; object-fit: cover;
          mix-blend-mode: multiply; opacity: 0.22;
        }
        .about-hero__spark {
          position: absolute; width: 6px; height: 6px;
          border-radius: 50%; background: rgba(0,0,0,0.2);
          animation: heroSpark 6s ease-in-out infinite;
          animation-delay: calc(var(--si) * 0.7s);
          top: calc(10% + var(--si) * 10%);
          left: calc(3% + var(--si) * 12%);
          pointer-events: none; z-index: 1;
        }
        @keyframes heroSpark {
          0%,100%{opacity:0;transform:scale(0) translateY(0)}
          40%{opacity:0.5;transform:scale(1.8) translateY(-18px)}
          70%{opacity:0.1;transform:scale(0.7) translateY(-30px)}
        }

        /* centered layout — same language as home page hero */
        .about-hero__content {
          position: relative; z-index: 2;
          max-width: 1100px; width: 100%;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .about-hero__top { margin-bottom: 36px; }

        .about-hero__title {
          font-size: clamp(3.8rem, 12vw, 148px);
          font-weight: 900; line-height: 0.87;
          letter-spacing: -0.055em; color: #0a0a0a;
          margin-bottom: 52px; word-break: break-word;
        }

        .about-hero__rule {
          width: 55%; max-width: 560px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.25), transparent);
          margin-bottom: 44px;
        }

        .about-hero__meta {
          display: flex; flex-direction: column;
          align-items: center; gap: 14px;
          max-width: 700px;
        }
        .about-hero__meta-l { display: flex; flex-direction: column; gap: 10px; align-items: center; }
        .about-hero__meta-r { display: flex; flex-direction: column; gap: 18px; align-items: center; }

        .about-hero__bold {
          font-size: clamp(1.1rem, 2vw, 1.5rem);
          font-weight: 700; color: rgba(0,0,0,0.74); line-height: 1.35;
        }
        .about-hero__short {
          font-size: 1rem; color: rgba(0,0,0,0.52); max-width: 580px; line-height: 1.72;
        }
        .about-hero__more {
          font-size: 0.92rem; color: rgba(0,0,0,0.42); line-height: 1.78; max-width: 580px;
        }
        .about-hero__cta {
          display: inline-flex; align-items: center; gap: 10px;
          background: #0a0a0a; color: #facc15;
          font-weight: 700; font-size: 15px;
          padding: 17px 36px; border-radius: 999px;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        .about-hero__cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 44px rgba(0,0,0,0.28);
        }
        .about-hero__wave {
          position: absolute; bottom: -1px; left: 0; right: 0;
          z-index: 3; line-height: 0;
        }
        .about-hero__wave svg { width: 100%; height: auto; display: block; }

        /* ─── CRAFTING ───────────────────────── */
        .about-crafting { padding: 96px 0 112px; position: relative; }
        .about-crafting__inner {
          max-width: 1400px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1.1fr 0.9fr;
          gap: 80px; align-items: start;
        }
        .about-crafting__visual { display: flex; flex-direction: column; gap: 20px; }
        .about-img-main {
          position: relative; border-radius: 24px;
          overflow: hidden; background: #111;
          box-shadow: 0 24px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .about-img-main__img {
          width: 100%; height: auto; object-fit: cover; display: block;
          transition: transform 0.8s cubic-bezier(.23,1,.32,1);
        }
        .about-img-main:hover .about-img-main__img { transform: scale(1.04); }
        .about-img-main__shine {
          position: absolute; inset: 0;
          background: linear-gradient(125deg, transparent 38%, rgba(250,204,21,0.06) 52%, transparent 64%);
          pointer-events: none;
        }
        .about-img-row {
          display: grid; grid-template-columns: 3fr 2fr;
          gap: 20px; align-items: end;
        }
        .about-img-b, .about-img-c {
          border-radius: 20px; overflow: hidden; background: #111;
          box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .about-img-b__img, .about-img-c__img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.8s cubic-bezier(.23,1,.32,1);
        }
        .about-img-b:hover .about-img-b__img,
        .about-img-c:hover .about-img-c__img { transform: scale(1.05); }
        .about-img-c { position: relative; top: -28px; }
        .about-crafting__text { padding-top: 32px; }
        .about-crafting__title {
          font-size: clamp(1.9rem, 3.8vw, 3.4rem);
          font-weight: 800; line-height: 1.08;
          letter-spacing: -0.03em; margin-bottom: 24px; color: #fff;
        }
        .about-crafting__body {
          font-size: 1.1rem; line-height: 1.78;
          color: #6b7280; margin-bottom: 52px;
        }
        .about-partners { border-top: 1px solid rgba(255,255,255,0.07); }
        .about-partner {
          padding: 28px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: padding-left 0.3s;
        }
        .about-partner:hover { padding-left: 6px; }
        .about-partner__head {
          display: flex; align-items: center; gap: 16px; margin-bottom: 12px;
        }
        .about-partner__label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
        .about-partner__logo {
          height: 38px; object-fit: contain;
          filter: brightness(10) opacity(0.55);
          transition: filter 0.3s;
        }
        .about-partner:hover .about-partner__logo { filter: brightness(10) opacity(0.9); }
        .about-partner__body { font-size: 0.9rem; color: #4b5563; line-height: 1.65; }

        /* ─── SERVICES ───────────────────────── */
        .about-services {
          position: relative;
          background: #f0eeea;
          padding: 120px 0 140px;
          overflow: hidden;
        }
        .about-services__inner {
          max-width: 960px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }
        .about-svc__head { text-align: center; margin-bottom: 80px; }
        .about-svc__title {
          font-size: clamp(2.8rem, 7vw, 6rem);
          font-weight: 900; letter-spacing: -0.04em; line-height: 1;
          color: #0a0a0a; margin-bottom: 18px;
        }
        .about-svc__sub {
          font-size: 1.05rem; color: #6b7280;
          max-width: 480px; margin: 0 auto; line-height: 1.7;
        }
        .about-svc__rows {}
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

        /* ─── WHY US ─────────────────────────── */
        .about-why {
          position: relative; background: #0a0a0a;
          padding: 112px 0 128px; overflow: hidden;
        }
        .about-why__orb-l {
          position: absolute; top: 5%; left: -8%;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 65%);
          filter: blur(100px); pointer-events: none;
        }
        .about-why__orb-r {
          position: absolute; bottom: -10%; right: -8%;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.03) 0%, transparent 65%);
          filter: blur(80px); pointer-events: none;
        }
        .about-why__inner {
          max-width: 1400px; margin: 0 auto; padding: 0 32px;
          position: relative; z-index: 2;
        }
        .about-why__header {
          display: flex; flex-direction: column; gap: 28px; margin-bottom: 80px;
          align-items: center; text-align: center;
        }
        .about-why__h-left { flex: 1; width: 100%; }
        .about-why__title {
          font-size: clamp(2.2rem, 5vw, 4.5rem);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
          max-width: 720px; margin: 0 auto;
        }
        .about-why__h-right { max-width: 520px; display: flex; flex-direction: column; gap: 24px; align-items: center; }
        .about-why__sub { font-size: 1.1rem; color: #6b7280; line-height: 1.75; text-align: center; }
        .about-why__cta {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1px solid #facc15; color: #facc15;
          font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 999px; width: fit-content;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .about-why__cta:hover { background: #facc15; color: #000; transform: translateY(-2px); }
        .about-why__grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;
        }
        .about-card {
          position: relative;
          background: rgba(14,14,14,0.9);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px; padding: 44px 28px 40px;
          display: flex; flex-direction: column; gap: 14px;
          overflow: hidden;
          transition: border-color 0.4s, transform 0.4s, box-shadow 0.4s;
          animation: cardRise 0.65s cubic-bezier(.23,1,.32,1) both;
          animation-delay: calc(var(--ci, 0) * 0.1s + 0.2s);
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(44px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .about-card:hover {
          border-color: rgba(250,204,21,0.22); transform: translateY(-7px);
          box-shadow: 0 28px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(250,204,21,0.08), 0 0 48px rgba(250,204,21,0.04);
        }
        .about-card__ghost {
          position: absolute; top: -14px; right: 10px;
          font-size: 108px; font-weight: 900;
          color: rgba(255,255,255,0.028); line-height: 1;
          pointer-events: none; user-select: none; transition: color 0.4s;
        }
        .about-card:hover .about-card__ghost { color: rgba(250,204,21,0.05); }
        .about-card__icon-wrap {
          width: 72px; height: 72px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 18px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          transition: background 0.35s, border-color 0.35s; flex-shrink: 0;
        }
        .about-card:hover .about-card__icon-wrap {
          background: rgba(250,204,21,0.07); border-color: rgba(250,204,21,0.18);
        }
        .about-card__icon {
          width: 44px; height: 44px; object-fit: contain; transition: transform 0.35s;
        }
        .about-card:hover .about-card__icon { transform: scale(1.1); }
        .about-card__title {
          font-size: 1.2rem;
          font-weight: 700; color: #fff; line-height: 1.3; margin-top: 6px;
        }
        .about-card__body { font-size: 0.88rem; color: #6b7280; line-height: 1.65; flex: 1; }
        .about-card__bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, #facc15, transparent);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.45s cubic-bezier(.23,1,.32,1);
        }
        .about-card:hover .about-card__bar { transform: scaleX(1); }

        /* ─── DESIGN PROCESS ─────────────────── */
        .about-process { padding: 112px 0 96px; overflow: hidden; }
        .about-process__inner { max-width: 1600px; margin: 0 auto; padding: 0 32px; }
        .about-process__head { text-align: center; margin-bottom: 80px; }
        .about-process__title {
          font-size: clamp(2rem, 6vw, 5.2rem);
          font-weight: 900; letter-spacing: -0.04em; line-height: 1.05; margin-bottom: 18px;
        }
        .about-process__sub {
          font-size: 1.1rem; color: #6b7280; max-width: 480px; margin: 0 auto; line-height: 1.7;
        }
        .about-process__hint {
          display: flex; align-items: center; gap: 8px;
          color: rgba(250,204,21,0.55); font-size: 10px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          margin-bottom: 20px; padding: 0 16px;
          animation: swipeHint 2s ease-in-out infinite;
        }
        @keyframes swipeHint {
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
        .about-learn__head { margin-bottom: 52px; text-align: center; }
        .about-learn__title {
          font-size: clamp(1.9rem, 4vw, 3.6rem);
          font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px;
        }
        .about-learn__sub {
          font-size: 1.1rem; color: #6b7280; max-width: 580px; margin: 0 auto; line-height: 1.7;
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
          .about-crafting__inner { grid-template-columns: 1fr; gap: 40px; }
          .about-crafting__text { padding-top: 0; }
        }
        @media (max-width: 768px) {
          .about-hero { padding: 96px 20px 160px; }
          .about-hero__title { font-size: clamp(3rem, 14vw, 72px); margin-bottom: 36px; }
          .about-hero__rule { margin-bottom: 28px; }
          .about-hero__index { right: 24px; top: 28px; }
          .about-hero__ring-wrap { width: 360px; height: 360px; right: -140px; }
          .about-crafting { padding: 64px 0 80px; }
          .about-crafting__inner { padding: 0 20px; gap: 40px; }
          .about-img-c { top: 0; }
          .about-services { padding: 80px 0 96px; }
          .about-services__inner { padding: 0 20px; }
          .about-srow { grid-template-columns: 1fr; gap: 8px; padding: 32px 0; }
          .about-srow__cat { font-size: 1.6rem; }
          .about-why { padding: 80px 0 96px; }
          .about-why__inner { padding: 0 20px; }
          .about-why__grid { grid-template-columns: 1fr; }
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
