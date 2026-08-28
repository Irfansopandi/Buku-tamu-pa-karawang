"use client";

import { useState, useEffect } from "react";
import { User, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export default function AdminHeader({ adminName = "Admin" }: { adminName?: string }) {
    const [currentTime, setCurrentTime] = useState<string>("");
    const pathname = usePathname();
    const { toggleSidebar } = useSidebar();

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
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Determine page title based on current route
    const getPageTitle = () => {
        if (pathname.includes('/dashboard')) return "Dashboard";
        if (pathname.includes('/visits')) return "Manajemen Kunjungan";
        if (pathname.includes('/visitors')) return "Data Pengunjung";
        if (pathname.includes('/services')) return "Layanan";
        if (pathname.includes('/officers')) return "Petugas";
        return "Admin Portal";
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 z-10 relative">
            <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8 h-20 items-center">
                
                {/* LEFT: Hamburger & Title */}
                <div className="flex-1 flex items-center gap-4">
                    <button 
                        type="button" 
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 text-[#085C3B] bg-emerald-50 rounded-lg focus:outline-none"
                    >
                        <span className="sr-only">Buka menu sidebar</span>
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                        {getPageTitle()}
                    </h2>
                </div>
                
                <div className="flex items-center h-full py-3">
                    {/* RIGHT 1: Date / Time */}
                    <div className="hidden lg:flex items-center gap-3 pr-4 sm:pr-5">
                        <div className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                        </div>
                        <div className="text-xs font-medium leading-[1.3] text-left text-gray-500">
                            {currentTime ? (
                                <>
                                    <div className="text-gray-900 font-bold">{currentTime.split('|')[0]}</div>
                                    <div>{currentTime.split('|')[1]} WIB</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-gray-900 font-bold">Memuat waktu...</div>
                                    <div>-</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT 2: User Profile */}
                    <div className="flex items-center gap-3 border-l border-gray-200 pl-4 sm:pl-5 h-full">
                        <div className="flex flex-col text-right justify-center">
                            <span className="text-sm font-bold text-gray-900">{adminName}</span>
                            <span className="text-[11px] text-[#D29C29] font-medium">Administrator</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#11522A] to-[#085C3B] flex items-center justify-center text-white shadow-sm ring-2 ring-white border border-[#085C3B]/20">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
