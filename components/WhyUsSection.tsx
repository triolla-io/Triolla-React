import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";

interface WhyUsCard {
  abteintitle?: string | null;
  abthreintext?: string | null;
  abthreimage?: { node?: { sourceUrl?: string | null } | null } | null;
}

interface WhyUsSectionProps {
  title: string;
  text: string;
  cards: WhyUsCard[];
  ctaText?: string | null;
  ctaLink?: string | null;
}

function stripHtml(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function WhyUsSection({ title, text, cards, ctaText, ctaLink }: WhyUsSectionProps) {
  if (!title && !(cards?.length > 0)) return null;

  const cleanTitle = stripHtml(title);
  const cleanText = stripHtml(text);

  return (
    <section className="why-section py-16 md:py-24 mx-2 md:mx-4 lg:mx-10 px-5 md:px-8 lg:px-24 mb-16 md:mb-32 relative overflow-hidden">
      <div className="why-section__orb" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between mb-20 gap-10">
          {cleanTitle && (
            <div>
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold max-w-2xl leading-tight">
                {cleanTitle}
              </h3>
            </div>
          )}
          {cleanText && (
            <p className="text-base md:text-xl text-gray-400 max-w-xl leading-relaxed mt-4 lg:mt-10 lg:self-end">
              {cleanText}
            </p>
          )}
        </div>

        <SectionReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {cards.map((card, i) => (
            <div key={i} className="service-card group">
              <div className="service-card__icon-wrap">
                {card.abthreimage?.node?.sourceUrl ? (
                  <img
                    src={card.abthreimage.node.sourceUrl}
                    alt=""
                    className="service-card__icon-img"
                  />
                ) : (
                  <svg
                    className="service-card__icon-img text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                    />
                  </svg>
                )}
              </div>
              <h5 className="text-xl font-bold mb-3 mt-8 leading-snug text-center">
                {stripHtml(card.abteintitle ?? "")}
              </h5>
              <p className="text-gray-400 leading-relaxed text-sm text-center">
                {stripHtml(card.abthreintext ?? "")}
              </p>
            </div>
          ))}
        </SectionReveal>

        {ctaText && (
          <div className="mt-12 md:mt-20 flex justify-center px-4 md:px-0">
            <Link
              href={ctaLink || "/contact-us"}
              className="btn-outline-gold w-full md:w-auto justify-center"
            >
              {ctaText}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.5 9H14.5M10.5 5L14.5 9L10.5 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .why-section {
          background: #0a0a0a;
          border-radius: 48px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .why-section__orb {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%);
          filter: blur(60px);
          pointer-events: none;
        }

        .service-card {
          position: relative;
          background: #111;
          padding: 40px 28px 36px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          height: 100%;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .service-card:hover {
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .service-card__icon-wrap {
          width: 160px; height: 160px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .service-card:hover .service-card__icon-wrap {
          transform: scale(1.05);
        }
        .service-card__icon-img {
          width: 160px;
          height: 160px;
          object-fit: contain;
        }

        .btn-outline-gold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #facc15;
          color: #facc15;
          font-weight: 600;
          font-size: 16px;
          padding: 14px 32px;
          border-radius: 999px;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        .btn-outline-gold:hover {
          background: #facc15;
          color: #000;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .why-section__orb {
            width: 300px; height: 300px;
            top: -10%; right: -15%;
          }
          .service-card {
            padding: 28px 20px 24px;
            border-radius: 20px;
          }
          .service-card__icon-wrap {
            width: 110px; height: 110px;
          }
          .service-card__icon-img {
            width: 110px; height: 110px;
          }
          .btn-outline-gold {
            padding: 14px 24px;
            font-size: 15px;
          }
        }
      `}</style>
    </section>
  );
}
