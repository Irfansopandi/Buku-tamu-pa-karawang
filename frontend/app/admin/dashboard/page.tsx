import { fetchApiServer } from "../../../lib/server-api";
import { DashboardStats } from "../../../lib/types";
import { Users, UserCheck, Clock, AlertCircle } from "lucide-react";
import { cookies } from "next/headers";
import LiveOperationalSummary from "./LiveOperationalSummary";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Dashboard - Admin PA Karawang',
    description: 'Dashboard Admin PA Karawang',
};

export default async function AdminDashboardPage() {
    let stats: DashboardStats | null = null;
    let errorState = false;

    try {
        const response = await fetchApiServer("/api/admin/dashboard", "admin");
        stats = response.data as DashboardStats;
    } catch {
        errorState = true;
    }

    const cookieStore = await cookies();
    const adminName = cookieStore.get("admin_name")?.value || "Admin";
    
    // Dynamic Greeting based on WIB (Asia/Jakarta)
    const hourStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false });
    const hour = parseInt(hourStr, 10);
    let greeting = "Selamat Malam";
    if (hour >= 5 && hour < 11) greeting = "Selamat Pagi";
    else if (hour >= 11 && hour < 15) greeting = "Selamat Siang";
    else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";

    const dateStr = new Date().toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    if (errorState || !stats) {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex items-start space-x-4 shadow-sm">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                <div>
                    <h3 className="text-red-800 font-semibold text-lg">Gagal memuat dashboard</h3>
                    <p className="text-red-600 mt-1">Tidak dapat terhubung ke server API. Silakan coba beberapa saat lagi.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Hi! {greeting}, {adminName}</h1>
                    <p className="mt-2 text-sm text-gray-500">Selamat datang di Panel Admin. Berikut adalah ringkasan aktivitas kunjungan dan operasional pada hari {dateStr}.</p>
                </div>
            </div>

            {/* Dashboard Content (Live) */}
            <LiveOperationalSummary initialStats={stats} />
        </div>
    );
}
