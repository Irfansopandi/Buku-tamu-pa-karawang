export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark text-white w-full py-8 mt-auto border-t-[6px] border-[#D29C29]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: MOBILE & TABLET LAYOUT */}
        <div className="flex flex-col lg:hidden w-full gap-6 items-center">
           <div className="flex flex-row justify-between sm:justify-center sm:gap-16 items-center w-full">
              {/* PA */}
              <div className="flex items-center gap-2 sm:gap-3">
                 <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
                 <span className="font-bold text-white text-[10px] sm:text-xs leading-tight tracking-wide">PENGADILAN AGAMA<br/>KARAWANG</span>
              </div>
              {/* MA */}
              <div className="flex items-center gap-2 sm:gap-3">
                 <span className="font-bold text-white text-[10px] sm:text-xs leading-tight text-right">Mahkamah Agung<br/>Republik Indonesia</span>
                 <img src="/images/logo-ma.png" alt="Logo Mahkamah Agung" className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-md" />
              </div>
           </div>
           
           <p className="text-gray-300 text-xs sm:text-[13.5px] text-center px-2 leading-relaxed">
             Memberikan pelayanan yang profesional, transparan, dan akuntabel untuk mewujudkan peradilan yang agung dan terpercaya.
           </p>
        </div>

        {/* TOP SECTION: DESKTOP LAYOUT */}
        <div className="hidden lg:flex flex-row items-start justify-between gap-12">
          
          {/* LEFT: Logo & Brand */}
          <div className="flex items-center gap-4 w-1/3">
            <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-16 h-16 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-xl leading-tight tracking-wide">
                PENGADILAN AGAMA<br/>KARAWANG
              </span>
            </div>
          </div>

          {/* CENTER: Description */}
          <div className="w-[1px] bg-white/20 h-20 self-center"></div>
          
          <div className="flex flex-col w-1/3 text-left px-4">
             <p className="text-gray-300 text-[13.5px] leading-relaxed">
               Memberikan pelayanan yang profesional, transparan, dan akuntabel untuk mewujudkan peradilan yang agung dan terpercaya.
             </p>
          </div>

          {/* RIGHT: Mahkamah Agung */}
          <div className="w-[1px] bg-white/20 h-20 self-center"></div>

          <div className="flex items-center gap-4 w-1/3 justify-end">
            <img src="/images/logo-ma.png" alt="Logo Mahkamah Agung" className="w-16 h-16 object-contain drop-shadow-md" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-[17px] leading-snug">
                Mahkamah Agung<br/>Republik Indonesia
              </span>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Copyright & Social */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9.5px] sm:text-xs md:text-[13px] text-gray-400 whitespace-nowrap">
            &copy; {currentYear} Pengadilan Agama Karawang. All rights reserved.
          </p>
          
          <div className="flex gap-4">
            {/* WhatsApp / Phone */}
            <a href="https://wa.me/6285175005301" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#D29C29] hover:text-white transition-colors cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/PengadilanAgamaKarawang" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#D29C29] hover:text-white transition-colors cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/pa.karawang" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#D29C29] hover:text-white transition-colors cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/c/PengadilanAgamaKarawang" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#D29C29] hover:text-white transition-colors cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
