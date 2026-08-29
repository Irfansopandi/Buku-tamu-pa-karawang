import { UserCog } from 'lucide-react';
import AdminOfficersTable from './AdminOfficersTable';

export const metadata = {
    title: 'Manajemen Petugas - Admin PA Karawang',
    description: 'Kelola akun petugas yang menangani scan pengunjung.',
};

export default function OfficersPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserCog className="w-7 h-7 text-[#085C3B]" />
                        Daftar Petugas
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Atur akun petugas yang berwenang untuk melakukan verifikasi tiket pengunjung.
                    </p>
                </div>
            </div>

            <AdminOfficersTable />
        </div>
    );
}
