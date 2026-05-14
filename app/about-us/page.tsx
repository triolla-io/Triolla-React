import { client } from "@/lib/apollo-client";
import { GET_ABOUT_PAGE } from "@/lib/queries";
import { gql } from "@apollo/client";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import { ClientLogoStrip } from "@/components/ClientLogoStrip";
import { FAQAccordion } from "@/components/FAQAccordion";
import { LearnCarousel } from "@/components/LearnCarousel";

async function getAboutData() {
  const { data } = await client.query<any>({
    query: gql`${GET_ABOUT_PAGE}`,
  });
  return data.page.template.aboutPage;
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

  return (
    <main className="bg-[#1a1a1a] text-white overflow-hidden pb-32">
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex flex-col items-center pt-32 pb-16 px-4"
        style={{ backgroundColor: ap.headerBgColor || '#fed125' }}
      >
        {/* Background Vectors */}
        <div className="absolute top-0 left-0 w-full overflow-hidden z-0 pointer-events-none opacity-50">
          <img src={ap.headerBgOverlayLayer?.node?.sourceUrl || "/assets/_cas/4ef0569f809629c3e2a0f04e359ac9d5cd08dd4d12bfb77f95809b7b559970cd.svg"} alt="" className="w-full mix-blend-screen" />
        </div>
        
        <SectionReveal className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px] text-black">
            {ap.headerTitle}
          </h1>
          <div className="text-[26px] font-bold mb-4 text-black">{ap.boldText}</div>
          <p className="text-[26px] leading-[1.3] text-black/80 mb-8 max-w-3xl mx-auto">
            {ap.shortText}
          </p>
          <div className="text-black/70 leading-relaxed text-[17px] max-w-4xl mx-auto text-center" dangerouslySetInnerHTML={{ __html: ap.moreText }} />
        </SectionReveal>
      </section>

      {/* Crafting Digital Products Section */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-20 mt-10">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Side: Images */}
          <div className="lg:w-[55%] flex flex-col gap-6">
            <div className="w-full">
              <img src={ap.abtopleftImageTop?.node?.sourceUrl} alt="" className="w-full h-auto rounded-3xl object-cover hover:scale-[1.02] transition-transform duration-500 shadow-xl" />
            </div>
            <div className="flex gap-6 w-full">
              <div className="w-[60%]">
                <img src={ap.leftImageTopThree?.node?.sourceUrl} alt="" className="w-full h-auto rounded-3xl object-cover hover:scale-[1.02] transition-transform duration-500 shadow-xl" />
              </div>
              <div className="w-[40%] flex items-end">
                <img src={ap.abtopleftImageTwo?.node?.sourceUrl} alt="" className="w-full h-auto rounded-3xl object-cover hover:scale-[1.02] transition-transform duration-500 shadow-xl" />
              </div>
            </div>
          </div>

          {/* Right Side: Text and Part Of Logos */}
          <div className="lg:w-[45%] flex flex-col justify-center pt-10">
            <div className="mb-16">
              <h3 className="text-[40px] md:text-[50px] font-bold mb-6 tracking-tighter leading-[1.1]">{ap.toprightTitle}</h3>
              <div className="text-[20px] leading-relaxed text-gray-400" dangerouslySetInnerHTML={{ __html: ap.toprightext }} />
            </div>
            
            <div className="flex flex-col gap-12">
              {ap.imagesSection?.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col border-t border-white/10 pt-10">
                  <div className="flex items-center gap-4 mb-6">
                    {item.imageText && (
                      <span className="text-gray-500 font-medium uppercase tracking-widest text-sm">{item.imageText}</span>
                    )}
                    <img src={item.topimages?.node?.sourceUrl} alt="" className="h-[45px] object-contain" />
                  </div>
                  <div className="text-gray-400 text-[18px] leading-relaxed" dangerouslySetInnerHTML={{ __html: item.topabtext }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-[#111] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-20 text-center">
            <h3 className="text-[60px] font-bold mb-6 tracking-tighter">{ap.servtitle}</h3>
            <div className="text-[22px] leading-relaxed text-gray-400 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: ap.servtext }} />
          </div>
          
          <SectionReveal className="flex flex-col gap-12">
            {(ap.servlist ?? []).map((serv: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row border-b border-white/10 pb-12 last:border-b-0 last:pb-0">
                <div className="md:w-1/3 text-[32px] font-bold text-white mb-6 md:mb-0">
                  {serv.servlleftText}
                </div>
                <div className="md:w-2/3">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {serv.servrightList?.map((item: any, idx: number) => (
                      <li key={idx}>
                        <Link href={item.itemLink || '#'} target={item.linkTarget || '_self'} className="text-[20px] text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-3 group">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-yellow-400 transition-colors"></span>
                          {item.listItem}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* Why Startups Partner With Us */}
      <section className="py-32 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between mb-24 gap-10">
          <h3 className="text-[50px] md:text-[60px] font-bold max-w-2xl leading-tight tracking-tighter" dangerouslySetInnerHTML={{ __html: ap.abthretitle }} />
          <div className="lg:w-1/3 flex flex-col justify-center">
            <div className="text-[20px] leading-relaxed text-gray-400 mb-8" dangerouslySetInnerHTML={{ __html: ap.abtthretext }} />
            {ap.abthrebuttonText && (
              <div>
                <Link href={ap.abthrebuttonLink || '#'} className="inline-block border border-yellow-400 text-yellow-400 rounded-full px-10 py-4 text-xl font-medium hover:bg-yellow-400 hover:text-black transition-all">
                  {ap.abthrebuttonText}
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <SectionReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(ap.abthrelist ?? []).map((item: any, i: number) => (
            <div key={i} className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src={item.abthreimage?.node?.sourceUrl} alt="" className="w-64 h-64 object-contain" />
              </div>
              <div className="mb-12 h-20">
                <img src={item.abthreimage?.node?.sourceUrl} alt="" className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h5 className="text-2xl font-bold mb-4 relative z-10" dangerouslySetInnerHTML={{ __html: item.abteintitle }} />
              <p className="text-gray-400 text-lg leading-relaxed relative z-10" dangerouslySetInnerHTML={{ __html: item.abthreintext }} />
            </div>
          ))}
        </SectionReveal>
      </section>

      {/* Design Process */}
      <section className="py-24 max-w-[1600px] mx-auto overflow-hidden px-4">
        <div className="text-center mb-24">
          <h3 className="text-[50px] md:text-[70px] font-bold tracking-tighter" dangerouslySetInnerHTML={{ __html: ap.uDesignHeading }} />
          <p className="text-xl text-gray-400 mt-6 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: ap.uSortText }} />
        </div>
        
        <div className="flex overflow-x-auto pb-16 hide-scrollbar gap-10 px-10 snap-x">
          {ap.designType?.map((item: any, i: number) => (
            <div key={i} className="min-w-[300px] shrink-0 snap-center relative pt-10 group">
              <div className="absolute top-0 left-0 text-[120px] font-black text-white/5 group-hover:text-yellow-400/10 transition-colors leading-none z-0 -mt-10 -ml-4">
                {(i + 1).toString().padStart(2, '0')}
              </div>
              <div className="relative z-10">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mb-6 group-hover:scale-150 transition-transform"></div>
                <div className="h-1 w-full bg-white/10 absolute top-2 left-4 -z-10"></div>
                <h4 className="text-2xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: item.dName }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learn Explore Grow Slider */}
      <section className="py-32 bg-[#111] border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h3 className="text-[60px] font-bold mb-6 tracking-tighter">{ap.learntitle}</h3>
            <div className="text-[22px] leading-relaxed text-gray-400 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: ap.learntext }} />
          </div>
          
          <LearnCarousel slides={ap.learnslider ?? []} />
        </div>
      </section>

      {clientLogos.length > 0 && (
        <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
