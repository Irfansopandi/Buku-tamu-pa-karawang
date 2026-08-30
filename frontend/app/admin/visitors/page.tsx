import { Users } from 'lucide-react';
import AdminVisitorsTable from './AdminVisitorsTable';

export const metadata = {
    title: 'Manajemen Pengunjung - Admin PA Karawang',
    description: 'Kelola data pengunjung yang telah melakukan scan/check-in.',
};

export default function VisitorsPage({ searchParams }: { searchParams: { tab?: string } }) {
    return (
        <AdminVisitorsTable 
            key={searchParams.tab || 'scanned'} 
            initialTab={searchParams.tab === 'pending' ? 'pending' : 'scanned'} 
        />
    );
}
