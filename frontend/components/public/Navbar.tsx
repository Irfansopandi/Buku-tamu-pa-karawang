"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      };
      
      const datePart = now.toLocaleDateString('id-ID', dateOptions);
      const timePart = now.toLocaleTimeString('en-GB', timeOptions);
      
      setCurrentTime(`${datePart}|${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/40 backdrop-blur-lg shadow-sm border-b border-gray-200' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LEFT: Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base leading-tight tracking-wide">
                PENGADILAN AGAMA <br className="block sm:hidden" /> KARAWANG
              </span>
            </div>
          </div>

          {/* RIGHT: Date / Time */}
          <div className={`flex items-center gap-2 sm:gap-4 border-l pl-3 sm:pl-4 py-1 transition-colors duration-300 ${isScrolled ? 'border-gray-400' : 'border-gray-200'}`}>
            <div className={`hidden sm:block transition-colors duration-300 ${isScrolled ? 'text-gray-700' : 'text-gray-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            </div>
            <div className={`text-[10px] sm:text-xs font-medium leading-[1.3] w-auto whitespace-nowrap text-right sm:text-left transition-colors duration-300 ${isScrolled ? 'text-gray-700' : 'text-gray-500'}`}>
              {currentTime ? (
                <>
                  <div className="text-gray-900 font-bold">{currentTime.split('|')[0]}</div>
                  <div>{currentTime.split('|')[1]}</div>
                </>
              ) : (
                <>
                  <div className="text-gray-900 font-bold">Memuat waktu...</div>
                  <div>-</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
