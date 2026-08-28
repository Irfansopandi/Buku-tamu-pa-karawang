"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { logoutAdminAction } from "../../lib/auth-actions";
import Swal, { SweetAlertResult } from "sweetalert2";
import { 
    LogOut, 
    Loader2, 
    LayoutDashboard, 
    ClipboardList, 
    Users, 
    Briefcase, 
    UserCog 
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navigation = [
    {
        section: "OVERVIEW",
        items: [
            { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        section: "MANAJEMEN",
        items: [
            { name: "Kunjungan", href: "/admin/visits", icon: ClipboardList },
            { name: "Pengunjung", href: "/admin/visitors", icon: Users },
            { name: "Layanan", href: "/admin/services", icon: Briefcase },
            { name: "Petugas", href: "/admin/officers", icon: UserCog },
        ]
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { isCollapsed } = useSidebar();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: "Apakah Anda yakin ingin keluar dari portal admin?",
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
                    logoutAdminAction();
                });
            }
        });
    };

    return (
        <>
            <div className={`hidden md:flex md:flex-shrink-0 shadow-lg relative z-20 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="flex flex-col w-full">
                    <div className="flex flex-col h-0 flex-1 bg-[#11522A] border-r border-[#085C3B]">
                        <div className="flex-1 flex flex-col pb-4">
                            
                            {/* Logo & Title Section */}
                            <div className="h-20 flex flex-col justify-center px-4 flex-shrink-0">
                                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                    <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-10 h-10 object-contain drop-shadow-md flex-shrink-0" />
                                    {!isCollapsed && (
                                        <div className="flex flex-col items-start whitespace-nowrap overflow-hidden">
                                            <h1 className="text-white font-bold text-[15px] tracking-wider leading-tight">
                                                PA KARAWANG
                                            </h1>
                                            <p className="text-[#D29C29] text-[11px] font-bold tracking-widest uppercase mt-1 leading-tight">
                                                Admin Panel
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <hr className="border-[#D29C29]/40 m-0" />

                            {/* Navigation */}
                            <nav className={`flex-1 bg-[#11522A] ${isCollapsed ? 'px-2 pt-4' : 'px-4 pt-8 space-y-8'}`}>
                                {navigation.map((group, index) => (
                                    <div key={group.section} className={isCollapsed && index > 0 ? 'mt-3' : ''}>
                                        {/* Divider for collapsed state (only between sections) */}
                                        {isCollapsed && index > 0 && (
                                            <hr className="border-[#D29C29]/50 mb-3" />
                                        )}

                                        {!isCollapsed && (
                                            <h3 className="px-3 text-xs font-bold text-[#D29C29] uppercase tracking-wider mb-3 opacity-90">
                                                {group.section}
                                            </h3>
                                        )}
                                        
                                        <div className={`${isCollapsed ? 'mt-0' : 'mt-3'} space-y-1.5`}>
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href;
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={`relative group ${
                                                            isActive
                                                                ? "bg-[#085C3B] text-white shadow-sm ring-1 ring-white/10"
                                                                : "text-emerald-100 hover:bg-[#085C3B]/60 hover:text-white"
                                                        } flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'} text-sm font-medium rounded-lg transition-all duration-200`}
                                                    >
                                                        <Icon className={`${isCollapsed ? '' : 'mr-3'} flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-emerald-200 group-hover:text-white'}`} aria-hidden="true" />
                                                        {!isCollapsed && <span>{item.name}</span>}
                                                        
                                                        {/* Instant Tooltip for collapsed state */}
                                                        {isCollapsed && (
                                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[100] whitespace-nowrap pointer-events-none">
                                                                {item.name}
                                                                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                                            </div>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </div>
                        
                        {/* Logout Button Section at Bottom */}
                        <div className={`flex-shrink-0 flex border-t border-[#085C3B] ${isCollapsed ? 'p-2 justify-center' : 'p-4'}`}>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isPending || isLoggingOut}
                                className={`relative group w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-all shadow-md hover:shadow-lg ${isCollapsed ? 'p-3' : 'px-4 py-2.5'}`}
                            >
                                <LogOut className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>{(isPending || isLoggingOut) ? "Mengeluarkan..." : "Keluar Aplikasi"}</span>}
                                
                                {/* Instant Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-red-700 text-white text-xs font-bold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[100] whitespace-nowrap pointer-events-none">
                                        Keluar Aplikasi
                                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-red-700"></div>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Page Loading Overlay (Portaled to body to cover Sidebar) */}
            {mounted && isLoggingOut && createPortal(
                <div className="fixed inset-0 z-[99999] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#11522A] animate-spin mb-4" />
                    <p className="text-[#11522A] font-semibold tracking-wide animate-pulse">Mengeluarkan sesi...</p>
                </div>,
                document.body
            )}
        </>
    );
}
