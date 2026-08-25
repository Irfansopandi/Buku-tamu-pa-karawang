"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        section: "OVERVIEW",
        items: [
            { name: "Dashboard", href: "/admin/dashboard" },
        ]
    },
    {
        section: "MANAJEMEN",
        items: [
            { name: "Kunjungan", href: "/admin/visits" },
            { name: "Pengunjung", href: "/admin/visitors" },
            { name: "Layanan", href: "/admin/services" },
            { name: "Petugas", href: "/admin/officers" },
        ]
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-gray-900 border-r border-gray-800">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-white font-bold text-lg tracking-wider">
                                PA KARAWANG
                            </h1>
                        </div>
                        <nav className="mt-8 flex-1 px-3 space-y-8 bg-gray-900">
                            {navigation.map((group) => (
                                <div key={group.section}>
                                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {group.section}
                                    </h3>
                                    <div className="mt-3 space-y-1">
                                        {group.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={`${
                                                        isActive
                                                            ? "bg-gray-800 text-white"
                                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                                                >
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
