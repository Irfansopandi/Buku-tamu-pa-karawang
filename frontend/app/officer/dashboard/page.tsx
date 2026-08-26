export default function OfficerDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">Officer Dashboard</h1>
            
            {/* Unavailable State: Dashboard Metrics */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                            Dashboard Metrics Not Available
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>
                                The Laravel backend API does not currently provide endpoints for Officer dashboard metrics (e.g., total visits, active visits, completed visits). 
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unavailable State: Current Visits & Queue */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Current Visits & Queue
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                Belum ada kunjungan atau data antrian yang dapat ditampilkan. API officer saat ini tidak menyediakan endpoint untuk daftar kunjungan atau antrian (Visit list / Queue endpoints are missing in API).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Empty State visual */}
            <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada antrian aktif</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Sistem saat ini belum mendudukung daftar kunjungan untuk Officer.
                </p>
            </div>
        </div>
    );
}
