import AdminVisitsTable from "./AdminVisitsTable";
import { ClipboardList, Plus } from "lucide-react";

export const metadata = {
    title: 'Manajemen Kunjungan - Admin PA Karawang',
};

export default function AdminVisitsPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardList className="w-7 h-7 text-[#085C3B]" />
                        Manajemen Kunjungan
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola dan pantau seluruh data kunjungan yang terdaftar pada sistem.
                    </p>
                </div>
            </div>

            <AdminVisitsTable />
        </div>
    );
}
