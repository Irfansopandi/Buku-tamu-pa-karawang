import { fetchApiServer } from "../../../lib/server-api";
import { DashboardStats } from "../../../lib/types";

export default async function AdminDashboardPage() {
    let stats: DashboardStats | null = null;
    let errorState = false;

    try {
        const response = await fetchApiServer("/api/admin/dashboard", "admin");
        stats = response.data as DashboardStats;
    } catch {
        errorState = true;
    }

    if (errorState || !stats) {
        return (
            <div className="bg-red-50 p-6 rounded-md border border-red-200">
                <h3 className="text-red-800 font-medium text-lg">Error loading dashboard</h3>
                <p className="text-red-600 mt-2">Could not connect to the Laravel API. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { name: "Kunjungan Hari Ini", value: stats.total_visits_today, color: "text-blue-600" },
                    { name: "Kunjungan Aktif", value: stats.active_visits, color: "text-orange-600" },
                    { name: "Selesai Hari Ini", value: stats.completed_today, color: "text-green-600" },
                    { name: "Kunjungan Bulan Ini", value: stats.total_visits_this_month, color: "text-purple-600" },
                ].map((kpi) => (
                    <div key={kpi.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {kpi.name}
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className={`text-3xl mt-1 font-semibold text-gray-900`}>
                                                {kpi.value}
                                            </div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Operational Summary */}
            <div className="bg-white shadow rounded-lg border border-gray-100">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Ringkasan Kunjungan</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Status Hari Ini</h4>
                            <div className="text-sm text-gray-700">
                                <p>Terdapat <span className="font-bold">{stats.active_visits}</span> kunjungan yang saat ini sedang aktif atau belum selesai, dari total <span className="font-bold">{stats.total_visits_today}</span> kunjungan hari ini.</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Penyelesaian</h4>
                            <div className="text-sm text-gray-700">
                                <p>Sebanyak <span className="font-bold">{stats.completed_today}</span> kunjungan telah diselesaikan hari ini.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
