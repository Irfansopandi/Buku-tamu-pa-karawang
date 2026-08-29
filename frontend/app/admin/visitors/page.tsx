import { Users } from 'lucide-react';
import AdminVisitorsTable from './AdminVisitorsTable';

export const metadata = {
    title: 'Manajemen Pengunjung - Admin PA Karawang',
    description: 'Kelola data pengunjung yang telah melakukan scan/check-in.',
};

export default function VisitorsPage({ searchParams }: { searchParams: { tab?: string } }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-7 h-7 text-[#085C3B]" />
                        Data Pengunjung
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Pantau data pengunjung yang telah melakukan scan tiket dan check-in.
                    </p>
                </div>
            </div>

            <AdminVisitorsTable 
                key={searchParams.tab || 'scanned'} 
                initialTab={searchParams.tab === 'pending' ? 'pending' : 'scanned'} 
            />
        </div>
    );
}
