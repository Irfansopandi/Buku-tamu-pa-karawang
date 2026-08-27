"use client";

import { useActionState, useState } from "react";
import { loginOfficerAction } from "../../../lib/auth-actions";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const initialState = {
    error: "",
};

export default function OfficerLoginPage() {
    const [state, formAction, isPending] = useActionState(loginOfficerAction, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#11522A] flex flex-col font-sans">
            <main className="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-repeat bg-left-top opacity-40" 
                     style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
                </div>
                
                <Link href="/portal" className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-[#085C3B] font-semibold bg-white/70 px-4 py-2.5 rounded-lg shadow-sm backdrop-blur-md border border-[#085C3B]/20 transition-all z-20 group">
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="hidden sm:inline">Kembali ke Pilihan Portal</span>
                </Link>

                <div className="w-full max-w-md flex flex-col items-center relative z-10">
                    
                    <div className="bg-[#FAF7F2]/90 backdrop-blur-md rounded-xl shadow-xl border border-[#E8E1D5]/50 border-t-[6px] border-t-[#D29C29] w-full p-6 sm:p-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        <div className="flex flex-col items-center mb-8">
                            <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md mb-4" />
                            <h2 className="text-2xl font-bold text-[#1A1A1A] text-center">Portal Petugas</h2>
                            <p className="text-sm text-gray-500 mt-1 text-center">Buku Tamu Pengadilan Agama Karawang</p>
                        </div>

                        <form action={formAction} className="space-y-6">
                            {state?.error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative text-sm flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    <span>{state.error}</span>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#D29C29] focus:ring-[#D29C29]/20 text-sm text-[#1A1A1A] bg-white transition-colors"
                                        placeholder="Masukkan email petugas"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                                    Kata Sandi
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#D29C29] focus:ring-[#D29C29]/20 text-sm text-[#1A1A1A] bg-white transition-colors pr-10"
                                        placeholder="Masukkan kata sandi"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#D29C29] focus:outline-none transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#085C3B] hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#085C3B] disabled:opacity-50"
                                >
                                    {isPending ? "Sedang masuk..." : "Masuk"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
