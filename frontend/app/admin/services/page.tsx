import { LayoutList } from 'lucide-react';
import AdminServicesTable from './AdminServicesTable';

export const metadata = {
    title: 'Manajemen Layanan - Admin PA Karawang',
    description: 'Kelola daftar layanan yang tersedia untuk pengunjung.',
};

export default function ServicesPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <LayoutList className="w-7 h-7 text-[#085C3B]" />
                        Daftar Layanan
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Atur layanan yang tersedia pada halaman pendaftaran pengunjung.
                    </p>
                </div>
            </div>

            <AdminServicesTable />
        </div>
    );
}
