"use client";

import { useTransition, useState } from "react";
import { logoutOfficerAction } from "../../lib/auth-actions";
import { LogOut, Loader2 } from "lucide-react";
import Swal, { SweetAlertResult } from "sweetalert2";

export default function OfficerHeader() {
    const [isPending, startTransition] = useTransition();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: "Apakah Anda yakin ingin keluar dari sesi petugas?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#085C3B',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result: SweetAlertResult) => {
            if (result.isConfirmed) {
                setIsLoggingOut(true);
                startTransition(() => {
                    logoutOfficerAction();
                });
            }
        });
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
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

                    {/* RIGHT: Page Name & Logout */}
                    <div className="flex items-center gap-3 sm:gap-6 border-l border-gray-200 pl-3 sm:pl-6 py-2">
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs text-gray-500 font-medium">Sistem Buku Tamu</span>
                            <span className="text-sm font-bold text-[#D29C29]">Halaman Petugas</span>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isPending}
                            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold disabled:opacity-50 transition-colors shadow-sm border border-red-100 hover:border-red-600"
                            title="Keluar dari sesi"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">{isPending ? "Keluar..." : "Keluar"}</span>
                        </button>
                    </div>

                </div>
            </div>
            
            {/* Mobile indicator for page name */}
            <div className="sm:hidden bg-[#FAF7F2] w-full py-1.5 px-4 text-center border-b border-gray-200">
                <span className="text-[11px] font-bold text-[#D29C29] tracking-wide uppercase">Halaman Petugas - Buku Tamu</span>
            </div>

            {/* Full Page Loading Overlay */}
            {isLoggingOut && (
                <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#085C3B] animate-spin mb-4" />
                    <p className="text-[#085C3B] font-semibold tracking-wide animate-pulse">Mengeluarkan sesi...</p>
                </div>
            )}
        </header>
    );
}
