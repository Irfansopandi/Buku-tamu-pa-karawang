"use client";

import { useState, useEffect } from "react";
import { getSettingsAction } from "@/app/admin/settings/actions";
import { Loader2, Download, FileText, ExternalLink } from "lucide-react";
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('./PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
      <p className="text-xs text-gray-500">Memuat penampil dokumen...</p>
    </div>
  )
});

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pdfWidth, setPdfWidth] = useState<number>(300);

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettingsAction();
      setSettings(data || {});
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Calculate width for mobile PDF
      if (typeof window !== 'undefined') {
          setPdfWidth(Math.min(window.innerWidth - 32, 600));
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const baseUrl = apiUrl.replace('/api', '');
    return baseUrl + (path.startsWith('/') ? path : '/' + path);
  };

  const pdfUrl = settings.welcome_pdf ? getFullUrl(settings.welcome_pdf) : '';
  const proxiedPdfUrl = pdfUrl ? `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}` : '';

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
            title="Lihat Buku Panduan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:h-[90vh] max-w-5xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Close Button */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-black/50 text-white hover:bg-black/80 rounded-full backdrop-blur-md transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Content (PDF Viewer) */}
            <div 
                className="flex-1 w-full bg-gray-100 relative flex flex-col justify-center items-center overflow-y-auto"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                 {isLoading ? (
                     <div className="flex flex-col items-center gap-3">
                         <Loader2 className="w-10 h-10 animate-spin text-primary" />
                         <p className="text-gray-500 font-medium">Memuat Panduan...</p>
                     </div>
                 ) : pdfUrl ? (
                     <>
                         {/* Desktop View (Iframe/Object) */}
                         <div className="hidden md:block w-full h-full">
                             <object 
                                data={`${pdfUrl}#toolbar=0`} 
                                type="application/pdf" 
                                className="w-full h-full"
                             >
                                <embed 
                                    src={`${pdfUrl}#toolbar=0`} 
                                    type="application/pdf" 
                                    className="w-full h-full"
                                />
                             </object>
                         </div>
                         
                         {/* Mobile View (React PDF) */}
                         <div className="md:hidden w-full h-full flex flex-col items-center">
                             <PdfViewer pdfUrl={proxiedPdfUrl} pdfWidth={pdfWidth} />
                         </div>
                     </>
                 ) : (
                     <div className="text-center p-6 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <p className="font-bold text-lg text-gray-600 mb-1">Buku Panduan</p>
                        <p className="text-sm">Buku panduan belum diunggah oleh Admin.</p>
                     </div>
                 )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
               <div className="text-sm text-gray-600 hidden sm:block">
                   Gunakan opsi scroll untuk melihat seluruh halaman panduan.
               </div>
               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                   {pdfUrl && (
                       <a 
                         href={pdfUrl}
                         download="Buku_Panduan_Digital.pdf"
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 md:py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                       >
                         <Download className="w-4 h-4" />
                         UNDUH PDF
                       </a>
                   )}
                   <button 
                     onClick={() => setIsOpen(false)}
                     className="w-full sm:w-auto bg-primary-dark text-white px-6 py-3 md:py-2.5 rounded-lg text-sm font-semibold hover:bg-primary transition-colors shadow-sm"
                   >
                      MENGERTI & TUTUP
                   </button>
               </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
