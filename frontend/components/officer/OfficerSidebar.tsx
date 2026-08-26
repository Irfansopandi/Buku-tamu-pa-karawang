"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        section: "OVERVIEW",
        items: [
            { name: "Dashboard", href: "/officer/dashboard" },
        ]
    }
];

export default function OfficerSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-blue-900 border-r border-blue-800">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-white font-bold text-lg tracking-wider">
                                PA KARAWANG
                            </h1>
                        </div>
                        <div className="px-4 mt-2">
                            <span className="text-blue-200 text-xs font-medium bg-blue-800 px-2 py-1 rounded-md">
                                Officer Panel
                            </span>
                        </div>
                        <nav className="mt-8 flex-1 px-3 space-y-8 bg-blue-900">
                            {navigation.map((group) => (
                                <div key={group.section}>
                                    <h3 className="px-3 text-xs font-semibold text-blue-300 uppercase tracking-wider">
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
                                                            ? "bg-blue-800 text-white"
                                                            : "text-blue-100 hover:bg-blue-800 hover:text-white"
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
