import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-[#1a1a1a] text-white overflow-hidden pb-32">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center pt-32 pb-16 px-4">
        {/* Background Vectors */}
        <div className="absolute top-0 left-0 w-full overflow-hidden z-0 pointer-events-none opacity-50">
          <img src="/assets/_cas/4ef0569f809629c3e2a0f04e359ac9d5cd08dd4d12bfb77f95809b7b559970cd.svg" alt="" className="w-full mix-blend-screen" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="text-yellow-400 font-medium tracking-widest uppercase mb-6">Product UX/UI design for</div>
          <h1 className="text-6xl md:text-[80px] lg:text-[110px] leading-[0.9] font-bold tracking-tighter mb-8 max-w-[1200px]">
            Creative Design Attracts People. Smart UX Makes Them Stay
          </h1>
          <h2 className="text-xl md:text-3xl font-light text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Product Design for Tech, Gaming, Medical, Cyber, IoT, Agritech, Mobile, SaaS Platforms & Startups
          </h2>
          
          {/* Floating elements */}
          <div className="absolute top-10 -left-20 animate-bounce hidden md:block">
            <img src="/assets/_cas/c12200bbaef70d6c4172232af406c8c65a51b6a6ed0fb25336bebf2c82202c3e.svg" width={215} height={95} alt="" />
          </div>
          <div className="absolute top-40 -right-20 animate-pulse hidden md:block">
            <img src="/assets/_cas/ea54d41f480c438d81e5870a5d2dd48bca3fcdfbea532135f4881de1204c0267.svg" width={263} height={105} alt="" />
          </div>
          <div className="absolute bottom-10 left-10 animate-bounce hidden md:block" style={{animationDelay: "1s"}}>
            <img src="/assets/_cas/b9d0ce99f3dd1aaa5d585e0346a72da13696d666f56d3506310298f8fbc48a28.svg" width={116} height={107} alt="" />
          </div>
        </div>
      </section>

      {/* Top Images Grid */}
      <section className="relative z-20 max-w-[1600px] mx-auto px-4 -mt-10 mb-32">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* We use specific col-spans to replicate the masonry/collage effect */}
          <div className="col-span-12 md:col-span-8 group">
            <div className="overflow-hidden rounded-3xl h-full shadow-2xl">
              <img src="/assets/_cas/dbafd28f5c215be69c2e9df8d5082b2305fdbdb9b7ef57d0ba501f15f1b5e4d9.png" alt="Portfolio 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          <div className="col-span-6 md:col-span-4 group">
            <div className="overflow-hidden rounded-3xl h-full shadow-2xl">
              <img src="/assets/_cas/b01fe1033998d549a717476b217e996cee12a68bf1e77b395d752e4161a8f198.png" alt="Portfolio 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          <div className="col-span-6 md:col-span-6 group">
            <div className="overflow-hidden rounded-3xl h-full shadow-2xl">
              <img src="/assets/_cas/2a0c99244b1ec517c3f418fa6c3538d265a5407e835010b876fb907a1b0b5834.png" alt="Portfolio 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 group">
            <div className="overflow-hidden rounded-3xl h-full shadow-2xl">
              <img src="/assets/_cas/55f6613ba859efb19c13690ecc9d532bab6d999e5d3763d154aee3a4f8620661.png" alt="Portfolio 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
          <div className="col-span-4 md:col-span-3 group">
            <div className="overflow-hidden rounded-3xl h-full shadow-2xl flex items-center justify-center bg-black/20 p-8 border border-white/10">
              <img src="/assets/_cas/7025e36ac63a538399742e0db8c9ff5f24c3e911093fec7e69fa1478d9aa65fb.svg" alt="Icon 5" className="w-full max-w-[200px] object-contain group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
          <div className="col-span-8 md:col-span-9 group">
            <div className="overflow-hidden rounded-3xl h-full shadow-2xl">
              <img src="/assets/_cas/71dfdd689e0c8ea6e59a8436c7d00cc0ebcf61d9a45dd296a08aff4c73b386d8.png" alt="Portfolio 6" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1 */}
            <div className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group">
              <div className="mb-10 flex justify-center h-[200px] items-center">
                <img src="/assets/_cas/d39c84b6ba3b658ab44dcf8808504bacd111c0a00775b55c2a8f594481ffedee.svg" alt="Design" className="group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h5 className="text-2xl font-bold mb-4">Design a<br /> new product</h5>
              <p className="text-gray-400 text-lg leading-relaxed">Design and develop an<br /> industry-leading product</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group">
              <div className="mb-10 flex justify-center h-[200px] items-center">
                <img src="/assets/_cas/4be177d98f2f20a4fc1f749b154f4f2e1a88d73ee2aefcb073fde372765700d1.svg" alt="Improve" className="group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h5 className="text-2xl font-bold mb-4">Improve an existing product</h5>
              <p className="text-gray-400 text-lg leading-relaxed">Upgrade and redesign your product to become a category leader</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group">
              <div className="mb-10 flex justify-center h-[200px] items-center">
                <img src="/assets/_cas/6437fb8d80773a14441b5f5b82195b7d0debc3629e41d613dc042b1c4e35a943.svg" alt="Startups" className="group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h5 className="text-2xl font-bold mb-4">First Steps for Start-ups</h5>
              <p className="text-gray-400 text-lg leading-relaxed">Take your vision from<br /> concept to launch</p>
            </div>
            
            {/* Card 4 */}
            <div className="bg-[#111] p-8 rounded-3xl border border-white/10 hover:border-yellow-400/50 transition-colors group">
              <div className="mb-10 flex justify-center h-[200px] items-center">
                <img src="/assets/_cas/ebf72d2cfa95509bb0b9ed3fab52ca74b3093ba1cb1fef9fdda441e8061c18f9.svg" alt="Consulting" className="group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h5 className="text-2xl font-bold mb-4">Product consulting</h5>
              <p className="text-gray-400 text-lg leading-relaxed">Accelerate your strategic<br /> planning process</p>
            </div>
            
          </div>
          
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
              <div className="text-yellow-400 text-6xl font-black mb-4">#1</div>
              <div className="text-2xl font-bold">Health & Medical</div>
              <div className="text-gray-500 mt-2">Design Awards</div>
            </div>
            <div className="bg-[#1a1a1a] p-10 rounded-3xl text-center border border-white/5 hover:-translate-y-2 transition-transform">
              <div className="text-yellow-400 text-6xl font-black mb-4">#1</div>
              <div className="text-2xl font-bold">Cybersecurity</div>
              <div className="text-gray-500 mt-2">UX Excellence</div>
            </div>
            <div className="bg-[#1a1a1a] p-10 rounded-3xl text-center border border-white/5 hover:-translate-y-2 transition-transform">
              <div className="text-yellow-400 text-6xl font-black mb-4">#2</div>
              <div className="text-2xl font-bold">Fintech & Finance</div>
              <div className="text-gray-500 mt-2">Global UI Awards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Design Process Timeline */}
      <section className="py-24 max-w-[1600px] mx-auto overflow-hidden px-4">
        <div className="text-center mb-24">
          <h3 className="text-5xl md:text-7xl font-bold tracking-tighter">Our unique Design Process</h3>
          <p className="text-xl text-gray-400 mt-6">A proven methodology for creating outstanding digital products.</p>
        </div>
        
        {/* Timeline Scroll Container */}
        <div className="flex overflow-x-auto pb-16 hide-scrollbar gap-10 px-10 snap-x">
          
          {[
            { step: '01', title: 'Kickoff meeting', text: 'Understanding your vision, goals, and target audience.' },
            { step: '02', title: 'Research & Discovery', text: 'Market analysis, competitor review, and user needs.' },
            { step: '03', title: 'User Interviews', text: 'Gathering qualitative data directly from your users.' },
            { step: '04', title: 'Information Architecture', text: 'Structuring the product logic and navigation flow.' },
            { step: '05', title: 'Wireframing', text: 'Creating low-fidelity layouts for core screens.' },
            { step: '06', title: 'Design Concept', text: 'Establishing the visual language and moodboard.' },
            { step: '07', title: 'UI Design', text: 'Applying the visual concept to the wireframes.' },
            { step: '08', title: 'Prototyping', text: 'Building interactive models for user testing.' },
            { step: '09', title: 'Detailed Design', text: 'Finalizing all screens and creating the Design System.' },
          ].map((item, i) => (
            <div key={i} className="min-w-[300px] shrink-0 snap-center relative pt-10">
              <div className="absolute top-0 left-0 text-[120px] font-black text-white/5 leading-none z-0 -mt-10 -ml-4">{item.step}</div>
              <div className="relative z-10">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mb-6"></div>
                <div className="h-1 w-full bg-white/10 absolute top-2 left-4 -z-10"></div>
                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                <p className="text-gray-400 text-lg leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
          
        </div>
      </section>

      {/* Bottom Contact Section */}
      <section className="mt-24 max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="bg-[#111] rounded-[3rem] border border-white/10 p-10 lg:p-20 overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 z-0 opacity-30">
            <img src="/assets/_cas/5ddb217d172e57eb7a038ad1d83f266e438aa46b369741df58a9c11e44af1dcc.svg" alt="" className="w-full h-full object-cover" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h3 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">Wanna Chat?</h3>
              <p className="text-xl text-gray-300 mb-10 max-w-md">Leave your details and we will get back to you as soon as possible.</p>
              
              <form className="space-y-6">
                <div>
                  <input type="text" placeholder="Name*" className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors" />
                </div>
                <div>
                  <input type="email" placeholder="Email*" className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors" />
                </div>
                <div>
                  <input type="text" placeholder="Phone" className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors" />
                </div>
                <div>
                  <textarea placeholder="Message" rows={3} className="w-full bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-yellow-400 transition-colors resize-none"></textarea>
                </div>
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
