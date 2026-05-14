import Link from "next/link";
import { HeroHeadline } from "@/components/HeroHeadline";
import { SectionReveal } from "@/components/SectionReveal";
import { CountUpNumber } from "@/components/CountUpNumber";

// Portfolio images from WP media library
const PORTFOLIO = [
  { src: "https://triolla.io/wp-content/uploads/2025/11/Frame-2147224611.png",       label: "Product Design",   cols: "col-span-12 md:col-span-8" },
  { src: "https://triolla.io/wp-content/uploads/2025/10/Screenshot-2025-10-15-at-9.43.09.png", label: "UX Research",     cols: "col-span-6 md:col-span-4" },
  { src: "https://triolla.io/wp-content/uploads/2025/09/Screenshot-2025-09-01-at-17.14.33-min-scaled.png", label: "SaaS Platform",   cols: "col-span-6 md:col-span-6" },
  { src: "https://triolla.io/wp-content/uploads/2025/10/Screenshot-2025-10-21-at-11.15.11-scaled.png",     label: "Mobile App",      cols: "col-span-12 md:col-span-6" },
  { src: "https://triolla.io/wp-content/uploads/2025/11/Frame-2147224612.png",       label: "Motion Design",   cols: "col-span-4 md:col-span-3" },
  { src: "https://triolla.io/wp-content/uploads/2025/09/Screenshot-2025-09-16-at-11.02.54-scaled.png",     label: "Cybersecurity UI", cols: "col-span-8 md:col-span-9" },
];

export default function Home() {
  return (
    <main className="bg-[#1a1a1a] text-white overflow-hidden pb-32">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center pt-32 pb-16 px-4 overflow-hidden">

        {/* CSS background glow — no external assets needed */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Radial yellow glow from bottom center */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(ellipse at center, #facc15 0%, transparent 70%)" }}
          />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Top right corner accent */}
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.03]"
            style={{ background: "radial-gradient(circle at top right, #facc15 0%, transparent 60%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="text-yellow-400 font-medium tracking-widest uppercase mb-6 text-sm">Product UX/UI design for</div>

          <HeroHeadline
            headline="Creative Design Attracts People. Smart UX Makes Them Stay"
            subtext="Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups"
            headlineClassName="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px]"
            subtextClassName="text-xl md:text-3xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed"
          />

          {/* Floating badge — top left */}
          <div
            className="absolute top-12 -left-4 lg:-left-16 hidden md:flex items-center gap-3 bg-black/80 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-sm"
            style={{ animation: "floatA 6s ease-in-out infinite" }}
          >
            <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10.06 5.17L14.66 5.85L11.33 9.1L12.12 13.69L8 11.52L3.88 13.69L4.67 9.1L1.34 5.85L5.94 5.17L8 1Z" fill="black" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest leading-none mb-0.5">Global Award</div>
              <div className="text-[15px] font-bold text-white leading-none">#1 Product Design 2025</div>
            </div>
          </div>

          {/* Floating badge — top right */}
          <div
            className="absolute top-36 -right-4 lg:-right-16 hidden md:flex items-center gap-3 bg-black/80 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-sm"
            style={{ animation: "floatB 7s ease-in-out infinite" }}
          >
            <div className="w-9 h-9 bg-[#111] rounded-xl border border-white/10 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="9" width="2.5" height="6" rx="1" fill="#facc15"/>
                <rect x="5" y="6" width="2.5" height="9" rx="1" fill="#facc15"/>
                <rect x="9" y="3" width="2.5" height="12" rx="1" fill="#facc15"/>
                <rect x="13" y="1" width="2.5" height="14" rx="1" fill="#facc15"/>
              </svg>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest leading-none mb-0.5">Delivered</div>
              <div className="text-[15px] font-bold text-white leading-none">150+ Products Shipped</div>
            </div>
          </div>

          {/* Floating badge — bottom left */}
          <div
            className="absolute bottom-16 -left-4 lg:-left-8 hidden md:flex items-center gap-3 bg-yellow-400 rounded-2xl px-4 py-3 shadow-2xl"
            style={{ animation: "floatC 8s ease-in-out infinite" }}
          >
            <div className="w-7 h-7 bg-black/20 rounded-lg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="black" strokeWidth="1.5"/>
                <path d="M7 4V7.5L9 9" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="text-[11px] text-black/60 uppercase tracking-widest leading-none mb-0.5">Experience</div>
              <div className="text-[15px] font-black text-black leading-none">10+ Years</div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS keyframe animations injected via style tag */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-12px) rotate(0deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-16px) rotate(-0.5deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(0.5deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }
      `}</style>

      {/* Portfolio Grid — WP images */}
      <section className="relative z-20 max-w-[1600px] mx-auto px-4 -mt-10 mb-32">
        <SectionReveal className="grid grid-cols-12 gap-4 md:gap-6">
          {PORTFOLIO.map((item) => (
            <div className={`${item.cols} group`} key={item.src}>
              <div className="overflow-hidden rounded-3xl h-full shadow-2xl min-h-[220px] relative bg-[#111]">
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ minHeight: "220px" }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-end p-6 opacity-0 group-hover:opacity-100">
                  <span className="bg-yellow-400 text-black text-sm font-bold px-3 py-1.5 rounded-full">{item.label}</span>
                </div>
              </div>
            </div>
          ))}
        </SectionReveal>
      </section>

      {/* About Section */}
      <section className="py-24 bg-black rounded-[4rem] mx-4 md:mx-10 px-8 lg:px-24 mb-32 shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between mb-20 gap-10">
            <h3 className="text-5xl md:text-6xl font-bold max-w-2xl leading-tight">
              Why startups<br /> and global high-tech partner with us...
            </h3>
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed mt-4 lg:mt-0">
              Thanks to our exceptionally talented & experienced product designers, we provide customized UX/UI and product design services to most industries: Fintech, Cyber, Medical, Agro & Gaming.
            </p>
          </div>

          <SectionReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Design a new product",          body: "Design and develop an industry-leading product",          icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
              { title: "Improve an existing product",   body: "Upgrade and redesign your product to become a category leader", icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" },
              { title: "First Steps for Start-ups",     body: "Take your vision from concept to launch",                  icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { title: "Product consulting",            body: "Accelerate your strategic planning process",               icon: "M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" },
            ].map((card, i) => (
              <div key={i} className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group relative overflow-hidden">
                <div className="mb-10 flex justify-center h-[160px] items-center">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-yellow-400/20 transition-all duration-500">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                  </div>
                </div>
                <h5 className="text-2xl font-bold mb-4">{card.title}</h5>
                <p className="text-gray-400 text-lg leading-relaxed">{card.body}</p>
              </div>
            ))}
          </SectionReveal>

          <div className="mt-20 flex justify-center">
            <Link href="/contact-us" className="inline-block border border-yellow-400 text-yellow-400 rounded-full px-10 py-4 text-xl font-medium hover:bg-yellow-400 hover:text-black transition-all">
              Partner with us
            </Link>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section id="winners-section" className="py-24 bg-[#111] max-w-[1400px] mx-auto rounded-[3rem] px-8 border border-white/10 mb-32">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-16">Global winners in Product UX/UI Design 2025</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1a] p-10 rounded-3xl text-center border border-white/5 hover:-translate-y-2 transition-transform">
              <div className="text-yellow-400 text-6xl font-black mb-4">#<CountUpNumber target={1} duration={800} /></div>
              <div className="text-2xl font-bold">Health & Medical</div>
              <div className="text-gray-500 mt-2">Design Awards</div>
            </div>
            <div className="bg-[#1a1a1a] p-10 rounded-3xl text-center border border-white/5 hover:-translate-y-2 transition-transform">
              <div className="text-yellow-400 text-6xl font-black mb-4">#<CountUpNumber target={1} duration={800} /></div>
              <div className="text-2xl font-bold">Cybersecurity</div>
              <div className="text-gray-500 mt-2">UX Excellence</div>
            </div>
            <div className="bg-[#1a1a1a] p-10 rounded-3xl text-center border border-white/5 hover:-translate-y-2 transition-transform">
              <div className="text-yellow-400 text-6xl font-black mb-4">#<CountUpNumber target={2} duration={1000} /></div>
              <div className="text-2xl font-bold">Fintech & Finance</div>
              <div className="text-gray-500 mt-2">Global UI Awards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Process Timeline */}
      <section className="py-24 max-w-[1600px] mx-auto overflow-hidden px-4">
        <div className="text-center mb-24">
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter">Our unique Design Process</h3>
          <p className="text-xl text-gray-400 mt-6">A proven methodology for creating outstanding digital products.</p>
        </div>

        <SectionReveal className="flex overflow-x-auto pb-16 hide-scrollbar gap-10 px-10 snap-x">
          {[
            { step: "01", title: "Kickoff meeting",           text: "Understanding your vision, goals, and target audience." },
            { step: "02", title: "Research & Discovery",      text: "Market analysis, competitor review, and user needs." },
            { step: "03", title: "User Interviews",           text: "Gathering qualitative data directly from your users." },
            { step: "04", title: "Information Architecture",  text: "Structuring the product logic and navigation flow." },
            { step: "05", title: "Wireframing",               text: "Creating low-fidelity layouts for core screens." },
            { step: "06", title: "Design Concept",            text: "Establishing the visual language and moodboard." },
            { step: "07", title: "UI Design",                 text: "Applying the visual concept to the wireframes." },
            { step: "08", title: "Prototyping",               text: "Building interactive models for user testing." },
            { step: "09", title: "Detailed Design",           text: "Finalizing all screens and creating the Design System." },
          ].map((item, i) => (
            <div key={i} className="min-w-[300px] shrink-0 snap-center relative pt-10">
              <div className="absolute top-0 left-0 text-[120px] font-black text-white/5 leading-none z-0 -mt-10 -ml-4">{item.step}</div>
              <div className="relative z-10">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mb-6" />
                <div className="h-1 w-full bg-white/10 absolute top-2 left-4 -z-10" />
                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                <p className="text-gray-400 text-lg leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </SectionReveal>
      </section>

      {/* Contact Section */}
      <section className="mt-24 max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="bg-[#111] rounded-[3rem] border border-white/10 p-10 lg:p-20 overflow-hidden relative shadow-2xl">
          {/* CSS background instead of broken SVG */}
          <div
            className="absolute inset-0 z-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(135deg, #facc15 0%, transparent 50%)",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h3 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Wanna Chat?</h3>
              <p className="text-xl text-gray-300 mb-10 max-w-md">Leave your details and we will get back to you as soon as possible.</p>

              <form className="space-y-6">
                <SectionReveal className="space-y-6">
                  {[
                    <div key="name"><input type="text" placeholder="Name*" className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors" /></div>,
                    <div key="email"><input type="email" placeholder="Email*" className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors" /></div>,
                    <div key="phone"><input type="text" placeholder="Phone" className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors" /></div>,
                    <div key="msg"><textarea placeholder="Message" rows={3} className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors resize-none" /></div>,
                  ]}
                </SectionReveal>
                <button type="button" className="bg-yellow-400 text-black font-bold text-xl px-12 py-4 rounded-full hover:bg-white transition-colors w-full md:w-auto">
                  Send Message
                </button>
              </form>
            </div>

            <div className="md:w-1/3 flex flex-col gap-10">
              <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="text-gray-400 uppercase tracking-widest text-sm mb-2">Email Us</div>
                <a href="mailto:contact@triolla.io" className="text-2xl font-medium hover:text-yellow-400 transition-colors">contact@triolla.io</a>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="text-gray-400 uppercase tracking-widest text-sm mb-2">Call Us (TLV)</div>
                <a href="tel:+972737443322" className="text-2xl font-medium hover:text-yellow-400 transition-colors">+972-73-744-3322</a>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="text-gray-400 uppercase tracking-widest text-sm mb-2">Drop By</div>
                <div className="text-xl font-medium text-gray-300">Yigal Alon St 98, Tel Aviv-Yafo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
