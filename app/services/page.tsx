import { client } from "@/lib/apollo-client";
import { GET_SERVICES_PAGE } from "@/lib/queries";
import { gql } from "@apollo/client";
import { SectionReveal } from "@/components/SectionReveal";
import { ClientLogoStrip } from "@/components/ClientLogoStrip";
import { FAQAccordion } from "@/components/FAQAccordion";

async function getServicesData() {
  const { data } = await client.query<any>({
    query: gql`${GET_SERVICES_PAGE}`,
  });
  return data.page.template.servicePage;
}

export default async function ServicesPage() {
  const sp = await getServicesData();

  const prodImages = [
    sp.prodleftImageOne?.node?.sourceUrl,
    sp.prodleftImageTwo?.node?.sourceUrl,
    sp.prodleftImageThree?.node?.sourceUrl,
    sp.prodleftImageFour?.node?.sourceUrl,
    sp.prodleftImageFive?.node?.sourceUrl,
    sp.prodleftImageSix?.node?.sourceUrl,
    sp.prodleftImageSeven?.node?.sourceUrl,
    sp.prodleftImageEight?.node?.sourceUrl,
    sp.prodleftImageNine?.node?.sourceUrl,
  ].filter(Boolean);

  const brandImages = [
    sp.brandimageOne?.node?.sourceUrl,
    sp.brandimageTwo?.node?.sourceUrl,
    sp.brandimageThree?.node?.sourceUrl,
    sp.brandimageFour?.node?.sourceUrl,
    sp.brandimageFive?.node?.sourceUrl,
    sp.brandimageSix?.node?.sourceUrl,
  ].filter(Boolean);

  const faqItems: { faqQuestion: string; faqAnswer: string }[] =
    sp.faqItems ?? [];
  const clientLogos: { sourceUrl: string; name: string }[] = (
    sp.clientLogos ?? []
  )
    .map((l: any) => ({
      sourceUrl: l.logoImage?.node?.sourceUrl ?? "",
      name: l.logoName ?? "",
    }))
    .filter((l: { sourceUrl: string }) => l.sourceUrl);

  return (
    <main className="overflow-hidden bg-[#1a1a1a] text-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* CSS background — no external SVG assets needed */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(ellipse at center, #facc15 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">

          <h4 className="text-[28px] font-medium mb-2">{sp.headerSubText}</h4>
          <h1 className="text-7xl md:text-[130px] font-bold tracking-tighter mb-8 leading-none">{sp.headerTitle}</h1>
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-[26px] font-bold mb-4 text-yellow-400">{sp.boldText}</div>
            <p className="text-[26px] leading-[1.3] text-gray-300 mb-8 max-w-3xl mx-auto">{sp.shortText}</p>
            {/* WP-sourced HTML — trusted backend only */}
            <div className="text-gray-400 leading-relaxed text-[17px] max-w-4xl mx-auto text-left" dangerouslySetInnerHTML={{ __html: sp.moreText }} />
          </div>
        </div>
      </section>

      {/* Product Design Section */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <SectionReveal className="mb-20">
          {[
            <h3 key="title" className="text-[60px] font-bold mb-6 text-white tracking-tighter">{sp.prodtitle}</h3>,
            /* WP-sourced HTML — trusted backend only */
            <div key="text" className="text-[22px] leading-relaxed text-gray-400 max-w-3xl" dangerouslySetInnerHTML={{ __html: sp.proddtxt }} />,
          ]}
        </SectionReveal>

        <div className="flex flex-col lg:flex-row-reverse gap-16">
          {/* Right Menu */}
          <div className="lg:w-1/4">
            <ul className="space-y-0 sticky top-32">
              {sp.prodrightMenu?.map((item: any) => (
                <li key={item.prodmtitle}>
                  <a href={item.prodmlink} className="text-[28px] font-bold text-gray-500 hover:text-white transition-colors block border-b border-white/10 py-6">
                    {item.prodmtitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Left Collage */}
          <div className="lg:w-3/4">
            <div className="flex flex-col gap-8">
              {/* Row 1 */}
              <div className="flex justify-end pr-10">
                <img src={prodImages[0] as string} alt="" className="rounded-2xl max-w-[330px] w-full shadow-2xl hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Row 2 */}
              <div className="flex gap-8 items-start">
                <img src={prodImages[1] as string} alt="" className="rounded-2xl w-[413px] shadow-2xl hover:scale-105 transition-transform duration-500" />
                <img src={prodImages[2] as string} alt="" className="rounded-2xl w-[424px] mt-20 shadow-2xl hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Row 3 */}
              <div className="flex gap-8 items-end relative -mt-10">
                <img src={prodImages[3] as string} alt="" className="rounded-2xl w-[282px] mb-20 shadow-2xl hover:scale-105 transition-transform duration-500" />
                <img src={prodImages[4] as string} alt="" className="rounded-2xl w-[293px] z-10 shadow-2xl hover:scale-105 transition-transform duration-500" />
                <img src={prodImages[5] as string} alt="" className="rounded-2xl w-[409px] -ml-20 shadow-2xl hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Row 4 (Small Icons) */}
              <div className="flex justify-start gap-6 mt-4 pl-32">
                <img src={prodImages[6] as string} alt="" className="w-[101px] h-[101px] rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300" />
                <img src={prodImages[7] as string} alt="" className="w-[101px] h-[101px] rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300" />
                <img src={prodImages[8] as string} alt="" className="w-[101px] h-[101px] rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branding Section */}
      <section className="py-32 bg-white text-black rounded-[4rem] max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative overflow-hidden">
        <SectionReveal className="mb-20 relative z-10">
          {[
            <h3 key="title" className="text-[60px] font-bold mb-6 tracking-tighter">{sp.brandtitle}</h3>,
            /* WP-sourced HTML — trusted backend only */
            <div key="text" className="text-[22px] leading-relaxed text-gray-600 max-w-3xl" dangerouslySetInnerHTML={{ __html: sp.brandtext }} />,
          ]}
        </SectionReveal>

        <div className="flex flex-col lg:flex-row-reverse gap-16 relative z-10">
          {/* Right Menu */}
          <div className="lg:w-1/4">
            <ul className="space-y-0 sticky top-32">
              {sp.brandrightMenu?.map((item: any) => (
                <li key={item.rightmetitle}>
                  <a href={item.rightmelink} className="text-[28px] font-bold text-gray-400 hover:text-black transition-colors block border-b border-black/10 py-6">
                    {item.rightmetitle}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Left Collage */}
          <div className="lg:w-3/4">
            <div className="flex flex-col gap-8">
              {/* Top Row */}
              <div className="flex gap-8 items-start">
                <img src={brandImages[0] as string} alt="" className="rounded-3xl w-[334px] shadow-2xl hover:scale-105 transition-transform duration-500" />
                <div className="flex flex-col gap-8 mt-10">
                  <img src={brandImages[1] as string} alt="" className="rounded-3xl w-[162px] shadow-xl hover:scale-105 transition-transform duration-500" />
                  <img src={brandImages[2] as string} alt="" className="rounded-3xl w-[608px] shadow-2xl hover:scale-105 transition-transform duration-500 -ml-20" />
                </div>
              </div>
              {/* Bottom Row */}
              <div className="flex gap-8 items-start -mt-10">
                <img src={brandImages[3] as string} alt="" className="rounded-3xl w-[259px] shadow-2xl hover:scale-105 transition-transform duration-500 mt-10" />
                <img src={brandImages[4] as string} alt="" className="rounded-3xl w-[339px] shadow-2xl hover:scale-105 transition-transform duration-500" />
                <img src={brandImages[5] as string} alt="" className="rounded-3xl w-[338px] shadow-2xl hover:scale-105 transition-transform duration-500 mt-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <SectionReveal className="mb-20 max-w-4xl">
          {[
            <h3 key="title" className="text-[60px] font-bold mb-6 text-white tracking-tighter">{sp.devtitle}</h3>,
            /* WP-sourced HTML — trusted backend only */
            <div key="text" className="text-[22px] leading-relaxed text-gray-400" dangerouslySetInnerHTML={{ __html: sp.devtext }} />,
          ]}
        </SectionReveal>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-16 relative">

          {/* Tech Lists (Left side in visual order) */}
          <div className="flex flex-col gap-16 z-20 w-full lg:w-1/3">
            <div>
              <h4 className="text-[28px] font-bold mb-6">
                <a href={sp.devrightMenuBottitleLink} className="hover:text-yellow-400 transition-colors">{sp.devrightMenuBottitle}</a>
              </h4>
              <ul className="space-y-4">
                {sp.rightMenuBotList?.map((item: any) => (
                  <li key={item.rightBottomMenuItem} className="text-[20px] font-medium text-gray-400">{item.rightBottomMenuItem}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[28px] font-bold mb-6">
                <a href={sp.rightMenuThreeTitleLink} className="hover:text-yellow-400 transition-colors">{sp.rightMenuThreeTitle}</a>
              </h4>
              <ul className="space-y-4">
                {sp.rightMenuThreeList?.map((item: any) => (
                  <li key={item.rightThreeMenuItem} className="text-[20px] font-medium text-gray-400">{item.rightThreeMenuItem}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Central/Right Image Collage */}
          <div className="relative z-10 w-full lg:w-2/3 flex justify-end">
            <img src={sp.devleftimage?.node?.sourceUrl} alt="Technology Stack" className="max-w-full lg:max-w-[800px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
          </div>

        </div>
      </section>

      {clientLogos.length > 0 && (
        <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <h3 className="text-[40px] font-bold mb-16 text-center tracking-tighter">
            Our Clients
          </h3>
          <ClientLogoStrip logos={clientLogos} />
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="py-24 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-[50px] font-bold mb-16 tracking-tighter">
            Frequently Asked Questions
          </h3>
          <FAQAccordion items={faqItems} />
        </section>
      )}
    </main>
  );
}
