"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";
import WelcomeModal from "@/components/public/WelcomeModal";

export default function LandingPage() {
  const [searchNik, setSearchNik] = useState("");
  const [searchState, setSearchState] = useState<"default" | "loading" | "error" | "not_found" | "found">("default");

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchNik || searchNik.length < 16) {
      setSearchState("error");
      return;
    }
    
    setSearchState("loading");
    
    // Simulate API call that will always fail because the endpoint does not exist
    setTimeout(() => {
      setSearchState("not_found");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <WelcomeModal />
      <Navbar />

      <main className="flex-grow flex flex-col">
        
        {/* HERO SECTION */}
        <section className="relative w-full h-[650px] lg:h-[750px] overflow-hidden bg-[#FEF9F0]">
          {/* Subtle Batik Background Pattern on Left Side */}
          <div className="absolute inset-0 w-full lg:w-[65%] pointer-events-none bg-repeat bg-left-top" 
               style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
          </div>
          
          {/* Full bleed Building Image on Right Side */}
          <div 
             className="absolute top-0 right-0 w-full lg:w-[60%] h-full pointer-events-none"
             style={{ 
               WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)', 
               maskImage: 'linear-gradient(to right, transparent 0%, black 40%)' 
             }}
          >
             <img src="/images/gedung.jpg" alt="Gedung PA Karawang" className="w-full h-full object-cover object-left" />
             {/* Wash overlay to ensure text readability on mobile while keeping building visible */}
             <div className="absolute inset-0 bg-gradient-to-r from-[#FEF9F0]/95 via-[#FEF9F0]/60 to-[#FEF9F0]/10 lg:hidden"></div>
             
             {/* Subtle fade to ensure text readability on desktop without completely hiding the blended edge */}
             <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#FEF9F0]/90 via-[#FEF9F0]/50 to-transparent w-3/5"></div>
          </div>
          
          {/* Global Subtle fade from bottom for seamless transition to the next section */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
             <div className="w-full lg:w-1/2 flex flex-col pt-8 pb-32">
                <div className="inline-block mb-1">
                   <h1 className="text-base md:text-lg font-bold text-[#D29C29] tracking-widest uppercase">
                     Selamat Datang di
                   </h1>
                </div>
                <h2 className="text-5xl sm:text-[4.5rem] lg:text-7xl font-extrabold text-primary-dark leading-[1.05] tracking-tight">
                   BUKU TAMU <br />
                   DIGITAL
                </h2>
              
              <div className="h-1 w-16 bg-[#D29C29] mt-2 rounded-full"></div>

              <h2 className="text-[22px] font-bold text-gray-900 mt-1">
                Pengadilan Agama Karawang
              </h2>
              
              <p className="text-gray-800 font-medium text-[15px] leading-relaxed mb-4 max-w-[420px]">
                Registrasikan kunjungan Anda dengan mudah dan dapatkan tiket digital untuk proses pelayanan yang lebih cepat dan nyaman.
              </p>
              
              <div>
                <Link href="/register" className="inline-flex items-center justify-between bg-primary-dark text-white pl-6 pr-2 py-2 rounded-full hover:bg-primary transition-all shadow-lg shadow-primary-dark/20 group w-fit gap-6">
                  <span className="text-sm font-semibold tracking-wide">MULAI REGISTRASI</span>
                  <div className="w-9 h-9 rounded-full bg-[#D29C29] flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* OVERLAPPING SECTION (Marquee + Search Card) */}
        <div className="relative z-20 -mt-20 sm:-mt-32 mb-24">
           
           {/* FULL WIDTH MARQUEE */}
           <div className="w-full flex items-center h-12 sm:h-14 mb-4 relative">
              <style>{`
                 @keyframes marquee {
                   0% { transform: translate(0, 0); }
                   100% { transform: translate(-100%, 0); }
                 }
                 .animate-marquee {
                   display: inline-block;
                   padding-left: 100%;
                   animation: marquee 30s linear infinite;
                 }
              `}</style>
              <div className="flex-shrink-0 flex items-center pl-4 sm:pl-8 pr-0 h-full z-10 relative">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary-dark animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
              </div>
              <div className="flex-grow overflow-hidden flex items-center h-full">
                 <div className="animate-marquee whitespace-nowrap text-primary-dark text-sm sm:text-base font-semibold tracking-wide">
                    Waspada Penipuan! Pengadilan Agama Karawang tidak memungut biaya selain yang diatur dalam PNBP. Pastikan Anda mendapatkan informasi resmi hanya melalui saluran komunikasi kami. Pendaftaran layanan dibuka pukul 08:00 WIB.
                 </div>
              </div>
           </div>

           {/* SEARCH TICKET CARD */}
           <section className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center justify-between">
                 
                 <div className="flex items-center gap-4 md:w-1/2 md:border-r md:border-gray-200 md:pr-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-[#e8f1ea] rounded-2xl text-primary-dark">
                       {/* Clipboard Search Icon */}
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4a2 2 0 0 1 2 2v2"/><path d="M14 6v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/><path d="M4 10V6a2 2 0 0 1 2-2"/><path d="M4 14v6a2 2 0 0 0 2 2h4"/><path d="M22 22l-4.5-4.5"/><circle cx="13" cy="13" r="4.5"/></svg>
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-gray-900 mb-1">SUDAH MELAKUKAN REGISTRASI?</h3>
                       <p className="text-gray-500 text-[13px] leading-relaxed">Temukan kembali tiket kunjungan Anda<br className="hidden sm:block"/> menggunakan NIK.</p>
                    </div>
                 </div>

                 <div className="w-full md:w-1/2 flex-shrink-0 md:pl-6">
                     <form onSubmit={handleSearchTicket} className="flex flex-col w-full">
                        <label htmlFor="search_nik" className="text-sm font-bold text-gray-900 mb-2">Masukkan NIK</label>
                        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
                           <input 
                              type="text" 
                              id="search_nik"
                              value={searchNik}
                              onChange={(e) => setSearchNik(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Contoh: 3275123456789012"
                              className={`flex-grow min-w-0 px-4 py-2.5 border ${searchState === 'error' ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-lg focus:outline-none focus:ring-2 shadow-sm text-gray-900 text-sm`}
                              maxLength={16}
                           />
                           
                           <button 
                              type="submit" 
                              disabled={searchState === 'loading'}
                              className="bg-primary-dark text-white px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary transition-colors flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                           >
                              {searchState === 'loading' ? (
                                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                  <span className="hidden sm:inline">CARI TIKET</span>
                                </>
                              )}
                           </button>
                        </div>
                        {searchState === 'error' && <span className="text-red-500 text-xs mt-1.5">NIK harus 16 digit angka.</span>}
                     </form>
                 </div>
              </div>

              {/* SEARCH RESULT CONTAINER */}
              {searchState === 'not_found' && (
                 <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span className="text-sm font-medium">Tiket kunjungan tidak ditemukan.</span>
                 </div>
              )}
            </div>
         </section>
        </div>


        {/* CARA BERKUNJUNG SECTION */}
        <section className="py-12 bg-transparent">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 flex flex-col items-center">
                 <h2 className="text-2xl font-bold text-primary-dark">CARA BERKUNJUNG</h2>
                 <div className="w-12 h-1 bg-accent mt-3 rounded-full"></div>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap justify-between items-start relative gap-y-8 md:gap-0">
                 {/* Connecting Line (Desktop) */}
                 <div className="hidden md:flex absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-gray-300 z-0 justify-around">
                    <div className="w-4 h-4 flex items-center justify-center -mt-2.5 text-accent">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <div className="w-4 h-4 flex items-center justify-center -mt-2.5 text-accent">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                    <div className="w-4 h-4 flex items-center justify-center -mt-2.5 text-accent">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                 </div>

                 {/* Step 1 */}
                 <div className="flex flex-col items-center text-center w-1/2 md:w-1/4 px-1 sm:px-2 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e8f1ea] rounded-full flex items-center justify-center text-primary-dark mb-4 sm:mb-5 border border-primary/20">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                       <div className="bg-primary-dark text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[9px] sm:text-[10px]">1</div>
                       <h4 className="text-xs sm:text-sm font-bold text-primary-dark">Registrasi</h4>
                    </div>
                    <p className="text-gray-500 text-[11px] sm:text-[13px] leading-relaxed">Isi data diri dan detail<br className="hidden lg:block"/> kunjungan Anda.</p>
                 </div>

                 {/* Step 2 */}
                 <div className="flex flex-col items-center text-center w-1/2 md:w-1/4 px-1 sm:px-2 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e8f1ea] rounded-full flex items-center justify-center text-primary-dark mb-4 sm:mb-5 border border-primary/20">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                       <div className="bg-primary-dark text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[9px] sm:text-[10px]">2</div>
                       <h4 className="text-xs sm:text-sm font-bold text-primary-dark">Konfirmasi</h4>
                    </div>
                    <p className="text-gray-500 text-[11px] sm:text-[13px] leading-relaxed">Periksa kembali data<br className="hidden lg:block"/> dan konfirmasi.</p>
                 </div>

                 {/* Step 3 */}
                 <div className="flex flex-col items-center text-center w-1/2 md:w-1/4 px-1 sm:px-2 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e8f1ea] rounded-full flex items-center justify-center text-primary-dark mb-4 sm:mb-5 border border-primary/20">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                       <div className="bg-primary-dark text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[9px] sm:text-[10px]">3</div>
                       <h4 className="text-xs sm:text-sm font-bold text-primary-dark">Dapatkan QR</h4>
                    </div>
                    <p className="text-gray-500 text-[11px] sm:text-[13px] leading-relaxed">Simpan tiket digital<br className="hidden lg:block"/> berupa QR Code.</p>
                 </div>

                 {/* Step 4 */}
                 <div className="flex flex-col items-center text-center w-1/2 md:w-1/4 px-1 sm:px-2 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e8f1ea] rounded-full flex items-center justify-center text-primary-dark mb-4 sm:mb-5 border border-primary/20">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                       <div className="bg-primary-dark text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[9px] sm:text-[10px]">4</div>
                       <h4 className="text-xs sm:text-sm font-bold text-primary-dark">Petugas</h4>
                    </div>
                    <p className="text-gray-500 text-[11px] sm:text-[13px] leading-relaxed">Tunjukkan QR untuk<br className="hidden lg:block"/> proses pelayanan.</p>
                 </div>

              </div>
           </div>
        </section>


        {/* CONTACT / SERVICE INFO SECTION */}
        <section className="py-12 mb-8">
           <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-primary-dark text-white rounded-2xl shadow-lg px-8 py-10 lg:p-12">
                 <div className="flex flex-col lg:flex-row justify-between w-full gap-8 lg:gap-0">
                    
                     <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-accent">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          <h4 className="font-semibold text-sm text-white">Alamat</h4>
                       </div>
                       <p className="text-gray-300 text-xs leading-relaxed pl-7">
                          Jl. Ahmad Yani No.53 By-Pass Karawang<br/>Jawa Barat 41315
                       </p>
                    </div>

                    <div className="hidden lg:block w-px bg-white/20"></div>

                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-accent">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          <h4 className="font-semibold text-sm text-white">Telepon</h4>
                       </div>
                       <p className="text-gray-300 text-xs leading-relaxed pl-7">
                          Tlp: 0267-402230<br/>Fax: 0267-8454531
                       </p>
                    </div>

                    <div className="hidden lg:block w-px bg-white/20"></div>

                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-accent">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          <h4 className="font-semibold text-sm text-white">Email</h4>
                       </div>
                       <p className="text-gray-300 text-xs leading-relaxed pl-7">
                          tabayun.pakarawang@gmail.com<br/>infopengaduan.53@gmail.com
                       </p>
                    </div>

                    <div className="hidden lg:block w-px bg-white/20"></div>

                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-accent">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <h4 className="font-semibold text-sm text-white">Jam Layanan</h4>
                       </div>
                       <div className="text-gray-300 text-xs leading-relaxed pl-7">
                          <div className="mb-2">
                             <strong className="text-white font-semibold">Senin s/d Kamis:</strong><br/>
                             08.00 - 16.30 <br className="hidden sm:block lg:hidden" />
                             <span className="whitespace-nowrap">(Istirahat: 12.00 - 13.00)</span>
                          </div>
                          <div>
                             <strong className="text-white font-semibold">Jum'at:</strong><br/>
                             07.30 - 16.30 <br className="hidden sm:block lg:hidden" />
                             <span className="whitespace-nowrap">(Istirahat: 11.30 - 13.00)</span>
                          </div>
                       </div>
                    </div>

                 </div>
              </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
