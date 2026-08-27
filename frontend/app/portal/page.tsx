import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCog } from "lucide-react";

export default function PortalSelectionPage() {
    return (
        <div className="min-h-screen bg-[#11522A] flex flex-col font-sans">
            <main className="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
                {/* Batik Background */}
                <div className="absolute inset-0 pointer-events-none bg-repeat bg-left-top opacity-40" 
                     style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
                </div>
                


                <div className="w-full max-w-3xl flex flex-col items-center relative z-10">
                    
                    <div className="bg-[#FAF7F2]/90 backdrop-blur-md rounded-xl shadow-xl border border-[#E8E1D5]/50 border-t-[6px] border-t-[#D29C29] w-full p-8 sm:p-12 overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        <div className="flex flex-col items-center mb-10">
                            <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] text-center mb-2">Pilih Portal Akses</h2>
                            <p className="text-sm sm:text-base text-gray-600 text-center max-w-md">
                                Silakan pilih portal yang sesuai dengan hak akses Anda pada Sistem Buku Tamu Pengadilan Agama Karawang.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-2xl mx-auto">
                            
                            {/* Admin Portal Card */}
                            <Link href="/admin/login" className="group flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#085C3B]/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-[#085C3B]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#E8F1EA] text-[#085C3B] rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#085C3B] group-hover:text-white transition-colors duration-300 relative z-10">
                                    <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 relative z-10">Portal Admin</h3>
                                <p className="text-[10px] sm:text-xs text-gray-500 text-center leading-relaxed relative z-10 hidden sm:block">
                                    Akses khusus untuk administrator sistem untuk mengelola data, melihat laporan, dan pengaturan aplikasi.
                                </p>
                            </Link>

                            {/* Officer Portal Card */}
                            <Link href="/officer/login" className="group flex flex-col items-center p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#D29C29]/50 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-[#D29C29]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FFF8E7] text-[#D29C29] rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#D29C29] group-hover:text-white transition-colors duration-300 relative z-10">
                                    <UserCog className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 relative z-10">Portal Petugas</h3>
                                <p className="text-[10px] sm:text-xs text-gray-500 text-center leading-relaxed relative z-10 hidden sm:block">
                                    Akses khusus untuk petugas keamanan / resepsionis untuk memverifikasi kedatangan tamu.
                                </p>
                            </Link>
                            
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
