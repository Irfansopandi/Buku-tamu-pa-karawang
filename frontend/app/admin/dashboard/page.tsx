import { fetchApiServer } from "../../../lib/server-api";
import { DashboardStats } from "../../../lib/types";
import { Users, UserCheck, Clock, CalendarDays, TrendingUp, AlertCircle } from "lucide-react";
import { cookies } from "next/headers";

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

    const kpiCards = [
        { 
            name: "Kunjungan Hari Ini", 
            value: stats.total_visits_today, 
            icon: Users,
            iconColor: "text-[#085C3B] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#085C3B]",
            iconBorder: "border border-[#CEDED8] group-hover:border-[#085C3B]",
            cardBg: "bg-gradient-to-br from-[#085C3B]/5 to-white",
            cardBorder: "border-[#CEDED8] hover:border-[#085C3B] hover:ring-1 hover:ring-[#085C3B] hover:shadow-md"
        },
        { 
            name: "Kunjungan Aktif", 
            value: stats.active_visits, 
            icon: Clock,
            iconColor: "text-[#D29C29] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#D29C29]",
            iconBorder: "border border-[#F2E1BF] group-hover:border-[#D29C29]",
            cardBg: "bg-gradient-to-br from-[#D29C29]/10 to-white",
            cardBorder: "border-[#F2E1BF] hover:border-[#D29C29] hover:ring-1 hover:ring-[#D29C29] hover:shadow-md"
        },
        { 
            name: "Selesai Hari Ini", 
            value: stats.completed_today, 
            icon: UserCheck,
            iconColor: "text-[#085C3B] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#085C3B]",
            iconBorder: "border border-[#CEDED8] group-hover:border-[#085C3B]",
            cardBg: "bg-gradient-to-br from-[#085C3B]/5 to-white",
            cardBorder: "border-[#CEDED8] hover:border-[#085C3B] hover:ring-1 hover:ring-[#085C3B] hover:shadow-md"
        },
        { 
            name: "Kunjungan Bulan Ini", 
            value: stats.total_visits_this_month, 
            icon: CalendarDays,
            iconColor: "text-[#D29C29] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#D29C29]",
            iconBorder: "border border-[#F2E1BF] group-hover:border-[#D29C29]",
            cardBg: "bg-gradient-to-br from-[#D29C29]/10 to-white",
            cardBorder: "border-[#F2E1BF] hover:border-[#D29C29] hover:ring-1 hover:ring-[#D29C29] hover:shadow-md"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Hi! {greeting}, {adminName}</h1>
                    <p className="mt-2 text-sm text-gray-500">Selamat datang di Panel Admin. Berikut adalah ringkasan aktivitas kunjungan dan operasional hari ini.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.name} className={`${kpi.cardBg} overflow-hidden rounded-2xl border ${kpi.cardBorder} relative group transition-all duration-300 cursor-default`}>
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-xl ${kpi.iconBg} ${kpi.iconBorder} shadow-sm transition-all duration-300`}>
                                        <Icon className={`w-6 h-6 ${kpi.iconColor} transition-colors duration-300`} />
                                     </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-gray-600 truncate transition-colors duration-300 group-hover:text-gray-900">
                                            {kpi.name}
                                        </p>
                                        <div className="flex items-baseline mt-1">
                                            <p className="text-3xl font-bold text-gray-900">
                                                {kpi.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Operational Summary */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#085C3B]" />
                    <h3 className="text-lg font-bold text-gray-900">Ringkasan Operasional</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-[#FAF7F2] to-white p-5 rounded-xl border border-[#E8E1D5]/50 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#D29C29]/10 rounded-full blur-2xl"></div>
                            <h4 className="text-sm font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#D29C29]"></span>
                                Status Hari Ini
                            </h4>
                            <div className="text-sm text-gray-600 leading-relaxed relative z-10">
                                <p>Terdapat <span className="font-bold text-[#1A1A1A] text-base mx-1">{stats.active_visits}</span> kunjungan yang saat ini sedang <span className="text-[#D29C29] font-medium">aktif</span> atau belum selesai, dari total <span className="font-bold text-[#1A1A1A] text-base mx-1">{stats.total_visits_today}</span> kunjungan hari ini.</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50/50 to-white p-5 rounded-xl border border-emerald-100/50 relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#085C3B]/10 rounded-full blur-2xl"></div>
                            <h4 className="text-sm font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#085C3B]"></span>
                                Penyelesaian
                            </h4>
                            <div className="text-sm text-gray-600 leading-relaxed relative z-10">
                                <p>Sebanyak <span className="font-bold text-[#1A1A1A] text-base mx-1">{stats.completed_today}</span> kunjungan telah <span className="text-[#085C3B] font-medium">diselesaikan</span> pada hari ini.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
