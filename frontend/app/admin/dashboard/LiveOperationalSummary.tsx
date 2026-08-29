'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardStats } from '../../../lib/types';
import { TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats } from './actions';
import AnalyticsCharts from './AnalyticsCharts';

export default function LiveOperationalSummary({ initialStats }: { initialStats: DashboardStats }) {
    const [stats, setStats] = useState<DashboardStats>(initialStats);
    const [dailyFilter, setDailyFilter] = useState<string>('7d');
    const [monthlyFilter, setMonthlyFilter] = useState<string>('1y');
    const [isUpdating, setIsUpdating] = useState(false);
    
    // We use a ref to prevent double fetching on mount
    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
        } else {
            const fetchNow = async () => {
                const latestStats = await getDashboardStats(dailyFilter, monthlyFilter);
                if (latestStats) setStats(latestStats);
                setIsUpdating(false);
            };
            fetchNow();
        }

        const interval = setInterval(async () => {
            const latestStats = await getDashboardStats(dailyFilter, monthlyFilter);
            if (latestStats) {
                setStats(latestStats);
            }
        }, 10000); // 10 seconds polling

        return () => clearInterval(interval);
    }, [dailyFilter, monthlyFilter]);

    const handleDailyFilterChange = (newFilter: string) => {
        setIsUpdating(true);
        setDailyFilter(newFilter);
    };

    const handleMonthlyFilterChange = (newFilter: string) => {
        setIsUpdating(true);
        setMonthlyFilter(newFilter);
    };

    const kpiCards = [
        { 
            name: "Belum Scan (Orang)", 
            value: stats.pending_people_today, 
            unit: "Orang",
            icon: Users,
            iconColor: "text-[#D29C29] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#D29C29]",
            iconBorder: "border border-[#F2E1BF] group-hover:border-[#D29C29]",
            cardBg: "bg-gradient-to-br from-[#D29C29]/10 to-white",
            cardBorder: "border-[#F2E1BF] hover:border-[#D29C29] hover:ring-1 hover:ring-[#D29C29] hover:shadow-md"
        },
        { 
            name: "Kunjungan Aktif", 
            value: stats.active_visits, 
            unit: "Tiket",
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
            unit: "Tiket",
            icon: CheckCircle2,
            iconColor: "text-[#085C3B] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#085C3B]",
            iconBorder: "border border-[#CEDED8] group-hover:border-[#085C3B]",
            cardBg: "bg-gradient-to-br from-[#085C3B]/5 to-white",
            cardBorder: "border-[#CEDED8] hover:border-[#085C3B] hover:ring-1 hover:ring-[#085C3B] hover:shadow-md"
        },
        { 
            name: "Pengunjung Hadir", 
            value: stats.scanned_people_today, 
            unit: "Orang",
            icon: Users,
            iconColor: "text-[#085C3B] group-hover:text-white",
            iconBg: "bg-white group-hover:bg-[#085C3B]",
            iconBorder: "border border-[#CEDED8] group-hover:border-[#085C3B]",
            cardBg: "bg-gradient-to-br from-[#085C3B]/5 to-white",
            cardBorder: "border-[#CEDED8] hover:border-[#085C3B] hover:ring-1 hover:ring-[#085C3B] hover:shadow-md"
        },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards (Live) */}
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
                                        <div className="flex items-baseline mt-1 gap-1">
                                            <p className="text-3xl font-bold text-gray-900">
                                                {kpi.value}
                                            </p>
                                            <p className="text-sm font-medium text-gray-500">
                                                {kpi.unit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnalyticsCharts 
                analytics={stats.analytics} 
                dailyFilter={dailyFilter} 
                monthlyFilter={monthlyFilter} 
                onDailyFilterChange={handleDailyFilterChange} 
                onMonthlyFilterChange={handleMonthlyFilterChange} 
                isUpdating={isUpdating} 
            />

            {/* Operational Summary */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#085C3B]" />
                        <h3 className="text-lg font-bold text-gray-900">
                            Ringkasan Operasional <span suppressHydrationWarning className="text-sm font-normal text-gray-500 ml-1">({new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#085C3B] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#085C3B]"></span>
                        </span>
                        <span className="text-xs font-medium text-gray-500">Live</span>
                    </div>
                </div>
            
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* LEFT PANEL: SUDAH SCAN HARI INI */}
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#085C3B]" />
                            Sudah Scan Hari Ini
                        </h4>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#085C3B]/10 text-[#085C3B]">
                                {stats.completed_today} Tiket
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#085C3B]/10 text-[#085C3B]">
                                {stats.scanned_people_today} Orang
                            </span>
                        </div>
                    </div>
                    
                    {stats.recent_scanned && stats.recent_scanned.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                                        <th className="py-2 pr-4">No.</th>
                                        <th className="py-2 px-4">No. Antrian</th>
                                        <th className="py-2 px-4">Nama</th>
                                        <th className="py-2 px-4">Email / No. HP</th>
                                        <th className="py-2 px-4">Layanan</th>
                                        <th className="py-2 px-4 whitespace-nowrap">Orang</th>
                                        <th className="py-2 pl-4 whitespace-nowrap">Waktu Scan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_scanned.map((visit, index) => (
                                        <tr key={index} className="border-b border-gray-200 last:border-0 hover:bg-gray-100/50 transition-colors">
                                            <td className="py-3 pr-4 font-medium text-gray-900">{visit.sequence_number}</td>
                                            <td className="py-3 px-4 font-medium text-[#085C3B] whitespace-nowrap">{visit.visit_number}</td>
                                            <td className="py-3 px-4 text-gray-700">{visit.visitor_name}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-gray-900 font-medium">{visit.visitor_email || '-'}</span>
                                                    <span className="text-gray-500">{visit.visitor_phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 truncate max-w-[120px]">{visit.service_name}</td>
                                            <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{visit.people_count} Orang</td>
                                            <td className="py-3 pl-4 text-gray-500 whitespace-nowrap">{visit.checked_in_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                            <CheckCircle2 className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-sm font-medium text-gray-500">Belum ada kunjungan yang melakukan scan hari ini.</p>
                        </div>
                    )}
                    
                    <div className="mt-4 flex justify-center">
                        <Link href="/admin/visitors?tab=scanned" className="group text-sm font-semibold text-[#085C3B] hover:text-[#06422a] transition-colors flex items-center gap-1">
                            Lihat Semua <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
                        </Link>
                    </div>
                </div>

                {/* RIGHT PANEL: BELUM SCAN */}
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#D29C29]" />
                            Belum Scan
                        </h4>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D29C29]/10 text-[#D29C29]">
                                {stats.active_visits} Tiket
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D29C29]/10 text-[#D29C29]">
                                {stats.pending_people_today} Orang
                            </span>
                        </div>
                    </div>
                    
                    {stats.recent_pending && stats.recent_pending.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 font-medium">
                                        <th className="py-2 pr-4">No.</th>
                                        <th className="py-2 px-4">No. Antrian</th>
                                        <th className="py-2 px-4">Nama</th>
                                        <th className="py-2 px-4">Email / No. HP</th>
                                        <th className="py-2 px-4">Layanan</th>
                                        <th className="py-2 px-4 whitespace-nowrap">Orang</th>
                                        <th className="py-2 pl-4 whitespace-nowrap">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_pending.map((visit, index) => (
                                        <tr key={index} className="border-b border-gray-200 last:border-0 hover:bg-gray-100/50 transition-colors">
                                            <td className="py-3 pr-4 font-medium text-gray-900">{visit.sequence_number}</td>
                                            <td className="py-3 px-4 font-medium text-[#D29C29] whitespace-nowrap">{visit.visit_number}</td>
                                            <td className="py-3 px-4 text-gray-700">{visit.visitor_name}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-gray-900 font-medium">{visit.visitor_email || '-'}</span>
                                                    <span className="text-gray-500">{visit.visitor_phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 truncate max-w-[120px]">{visit.service_name}</td>
                                            <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{visit.people_count} Orang</td>
                                            <td className="py-3 pl-4 text-gray-500 whitespace-nowrap">{visit.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                            <Clock className="w-8 h-8 text-gray-300 mb-2" />
                            <p className="text-sm font-medium text-gray-500">Tidak ada kunjungan yang sedang menunggu scan.</p>
                        </div>
                    )}
                    
                    <div className="mt-4 flex justify-center">
                        <Link href="/admin/visitors?tab=pending" className="group text-sm font-semibold text-[#D29C29] hover:text-[#b8861e] transition-colors flex items-center gap-1">
                            Lihat Semua <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
