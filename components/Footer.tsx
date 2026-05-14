import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-20 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mentions / Logos */}
        <div className="flex flex-col md:flex-row items-center border-b border-white/10 pb-10 mb-10">
          <div className="text-[15px] font-medium text-gray-400 mb-6 md:mb-0 md:w-32">Mentions:</div>
          <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12 flex-1">
            {/* Logos placeholders */}
            <div className="text-gray-400 text-xl font-bold opacity-50">13TV</div>
            <div className="text-gray-400 text-xl font-bold opacity-50">BIZPORTAL</div>
            <div className="text-gray-400 text-xl font-bold opacity-50">THEMARKER</div>
            <div className="text-gray-400 text-xl font-bold opacity-50">GLOBES</div>
            <div className="text-gray-400 text-xl font-bold opacity-50">MAKO</div>
          </div>
        </div>

        {/* Footer Menus */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          
          {/* Column 1: Product Design */}
          <div>
            <h3 className="text-yellow-400 font-medium text-[15px] mb-6">Product Design</h3>
            <ul className="space-y-4">
              <li><Link href="/services/product-ux-ui-design" className="text-gray-300 hover:text-white text-[14px]">Product UX & UI Design</Link></li>
              <li><Link href="/services/ux-research" className="text-gray-300 hover:text-white text-[14px]">UX Research</Link></li>
              <li><Link href="/services/prototyping" className="text-gray-300 hover:text-white text-[14px]">Prototype</Link></li>
              <li><Link href="/branding-studio" className="text-gray-300 hover:text-white text-[14px]">Digital Branding</Link></li>
              <li><Link href="/services/front-end-dev" className="text-gray-300 hover:text-white text-[14px]">Front End Development</Link></li>
            </ul>
          </div>

          {/* Column 2: Case studies */}
          <div>
            <h3 className="text-yellow-400 font-medium text-[15px] mb-6">Case studies</h3>
            <ul className="space-y-4">
              <li><Link href="/mobile-apps" className="text-gray-300 hover:text-white text-[14px]">Mobile Apps</Link></li>
              <li><Link href="/fintech-finance" className="text-gray-300 hover:text-white text-[14px]">Fintech & Finance</Link></li>
              <li><Link href="/device-iot" className="text-gray-300 hover:text-white text-[14px]">IOT & Devices</Link></li>
              <li><Link href="/saas-platforms" className="text-gray-300 hover:text-white text-[14px]">SaaS</Link></li>
              <li><Link href="/gaming" className="text-gray-300 hover:text-white text-[14px]">Gaming</Link></li>
              <li><Link href="/medical-healthcare" className="text-gray-300 hover:text-white text-[14px]">Medical</Link></li>
              <li><Link href="/agritech" className="text-gray-300 hover:text-white text-[14px]">Agritech</Link></li>
            </ul>
          </div>

          {/* Column 3: Technology */}
          <div>
            <h3 className="text-yellow-400 font-medium text-[15px] mb-6">Technology</h3>
            <ul className="space-y-4">
              <li><Link href="/technology" className="text-gray-300 hover:text-white text-[14px]">Dev & Technology</Link></li>
              <li><Link href="/services/front-end-dev" className="text-gray-300 hover:text-white text-[14px]">Front End</Link></li>
              <li><span className="text-gray-400 text-[14px]">React.js</span></li>
              <li><span className="text-gray-400 text-[14px]">Vue.js</span></li>
              <li><Link href="/services/back-end-dev" className="text-gray-300 hover:text-white text-[14px]">Back End</Link></li>
              <li><span className="text-gray-400 text-[14px]">Node.js</span></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div>
            <h3 className="text-yellow-400 font-medium text-[15px] mb-6">About</h3>
            <ul className="space-y-4">
              <li><Link href="/about-us" className="text-gray-300 hover:text-white text-[14px]">About us</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-white text-[14px]">Careers</Link></li>
              <li><Link href="/services" className="text-gray-300 hover:text-white text-[14px]">Our Services</Link></li>
              <li><Link href="/contact-us" className="text-gray-300 hover:text-white text-[14px]">Talk to us</Link></li>
              <li><Link href="/press" className="text-gray-300 hover:text-white text-[14px]">Press</Link></li>
            </ul>
          </div>

          {/* Column 5: Our Blog */}
          <div>
            <h3 className="text-yellow-400 font-medium text-[15px] mb-6">Our Blog</h3>
            <ul className="space-y-4">
              <li><Link href="/blog" className="text-gray-300 hover:text-white text-[14px]">All Blogs</Link></li>
              <li><Link href="/blog/fintech" className="text-gray-300 hover:text-white text-[14px]">Fintech & Finance</Link></li>
              <li><Link href="/blog/iot" className="text-gray-300 hover:text-white text-[14px]">IOT & Devices</Link></li>
              <li><Link href="/blog/saas" className="text-gray-300 hover:text-white text-[14px]">SaaS</Link></li>
              <li><Link href="/blog/gaming" className="text-gray-300 hover:text-white text-[14px]">Gaming</Link></li>
            </ul>
          </div>

        </div>

        {/* Contact Info Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-t border-white/10 pt-10 pb-10 gap-8">
          
          <div className="flex gap-4">
            <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
              <span className="sr-only">Facebook</span>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://linkedin.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            <div>
              <div className="text-gray-500 text-[13px] uppercase tracking-wider mb-2">Mail</div>
              <a href="mailto:contact@triolla.io" className="text-[15px] font-medium hover:text-yellow-400">contact@triolla.io</a>
            </div>
            <div>
              <div className="text-gray-500 text-[13px] uppercase tracking-wider mb-2">TLV Offices</div>
              <a href="tel:+972737443322" className="text-[15px] font-medium hover:text-yellow-400">+972-73-744-3322</a>
            </div>
            <div>
              <div className="text-gray-500 text-[13px] uppercase tracking-wider mb-2">NY Offices</div>
              <a href="tel:+14086277350" className="text-[15px] font-medium hover:text-yellow-400">+1408-627-7350</a>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/10 pt-8 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <span className="text-white font-bold text-xl tracking-tighter">TRIOLLA</span>
            <span className="hidden md:inline">|</span>
            <p>All rights reserved to Triolla LTD</p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms Of Use</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
