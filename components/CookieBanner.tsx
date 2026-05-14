"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const cookiePreference = localStorage.getItem("triolla_cookie_consent");
    if (!cookiePreference) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("triolla_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("triolla_cookie_consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto bg-[#1a1a1a] text-white rounded-lg shadow-2xl p-6 pointer-events-auto border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 transform transition-all translate-y-0 opacity-100">
        
        <div className="flex-1 text-[14px] leading-relaxed text-gray-300">
          <p>
            This website uses cookies to improve the user experience and display tailored content. 
            By continuing to use the website, you agree to the <Link href="/privacy-policy" className="text-yellow-400 hover:underline">privacy policy</Link>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 shrink-0">
          <button 
            onClick={handleAccept}
            className="px-6 py-2 bg-yellow-400 text-black font-medium rounded hover:bg-yellow-500 transition-colors"
          >
            Accept
          </button>
          <button 
            onClick={handleReject}
            className="px-6 py-2 bg-transparent border border-white/20 text-white font-medium rounded hover:bg-white/10 transition-colors"
          >
            Reject
          </button>
          <button 
            className="px-6 py-2 bg-transparent border border-white/20 text-white font-medium rounded hover:bg-white/10 transition-colors"
          >
            Settings
          </button>
        </div>
        
      </div>
    </div>
  );
}
