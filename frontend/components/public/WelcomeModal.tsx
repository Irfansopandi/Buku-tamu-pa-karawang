"use client";

import { useState, useEffect } from "react";
import { getSettingsAction } from "@/app/admin/settings/actions";
import { Loader2 } from "lucide-react";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettingsAction();
      setSettings(data || {});
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Check if the modal has been shown in this session
    const hasSeenModal = sessionStorage.getItem("hasSeenWelcomeModal");
    
    // Only show automatically if they haven't seen it in this session
    if (!hasSeenModal) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenWelcomeModal", "true");
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Helper to get embed URL for YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        let videoId = '';
        if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v') || '';
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : '';
    } catch (e) {
        return '';
    }
  };

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    return apiUrl.replace('/api', '') + path;
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90] flex flex-col items-center gap-3">
        {/* Button Wrapper */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(true)}
            className="relative w-12 h-12 md:w-14 md:h-14 bg-primary-dark text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30 group"
            aria-label="Lihat Panduan"
            title="Lihat Panduan Penggunaan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-black/50 text-white hover:bg-black/80 rounded-full backdrop-blur-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row w-full h-[80vh] md:h-[500px]">
              
              {/* Left: Image Tutorial */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[#FEF9F0] p-6 sm:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-200">
                 <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-[#e8f1ea] text-primary-dark font-bold text-xs rounded-full mb-2">PANDUAN</span>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Cara Menggunakan<br/>Buku Tamu Digital</h3>
                 </div>
                 
                 <div className="w-full flex-grow relative bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : settings.welcome_image ? (
                        <img src={getFullUrl(settings.welcome_image)} alt="Panduan" className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center p-4">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                           <p className="text-gray-500 text-sm font-medium">Gambar Tutorial / Infografis</p>
                           <p className="text-gray-400 text-xs mt-1">Belum ada gambar panduan.</p>
                        </div>
                    )}
                 </div>
              </div>

              {/* Right: Video Tutorial */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black relative flex flex-col justify-center items-center">
                 {isLoading ? (
                     <Loader2 className="w-8 h-8 animate-spin text-white" />
                 ) : settings.welcome_video_type === 'youtube' && settings.welcome_video_url ? (
                     <iframe 
                        src={getYouTubeEmbedUrl(settings.welcome_video_url)} 
                        title="Video Panduan" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full"
                     ></iframe>
                 ) : settings.welcome_video_type === 'upload' && settings.welcome_video_url ? (
                     <video 
                        src={getFullUrl(settings.welcome_video_url)} 
                        controls 
                        className="w-full h-full object-contain"
                     ></video>
                 ) : (
                     <div className="w-full h-full flex items-center justify-center relative">
                        <div className="text-center p-6 text-white z-10">
                           <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                           </div>
                           <p className="font-bold text-lg mb-1">Video Panduan</p>
                           <p className="text-gray-300 text-sm">Belum ada video panduan.</p>
                        </div>
                        <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
                     </div>
                 )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button 
                 onClick={() => setIsOpen(false)}
                 className="bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary transition-colors"
               >
                  MENGERTI & TUTUP
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
