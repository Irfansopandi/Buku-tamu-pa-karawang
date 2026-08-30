import { PaginatedVisitsResponse } from '@/lib/types';

interface ReportPrintViewProps {
    period: 'all' | 'day' | 'month';
    date: string;
    monthYear: string;
    activeTab: 'scanned' | 'pending';
    search: string;
    data: PaginatedVisitsResponse | null;
}

export default function ReportPrintView({ period, date, monthYear, activeTab, search, data }: ReportPrintViewProps) {
    if (!data) return null;

    const getPeriodText = () => {
        const formatOpts: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
        
        if (period === 'day') {
            return new Date(date).toLocaleDateString('id-ID', formatOpts);
        }
        if (period === 'month') {
            const [y, m] = monthYear.split('-');
            const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
            return dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        }
        if (period === 'all') {
            if (!data?.data || data.data.length === 0) return 'Semua Waktu';
            
            const dates = data.data
                .map(v => new Date(v.visit_date || '').getTime())
                .filter(t => !isNaN(t));
                
            if (dates.length === 0) return 'Semua Waktu';
            
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            const minStr = minDate.toLocaleDateString('id-ID', formatOpts);
            const maxStr = maxDate.toLocaleDateString('id-ID', formatOpts);
            
            if (minStr === maxStr) return minStr;
            return `${minStr} - ${maxStr}`;
        }
        return '-';
    };

    return (
        <div className="hidden print:block w-full text-black">
            {/* Header / Kop */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 border-b-[3px] border-black pb-4 mb-6">
                <div className="flex-shrink-0">
                    <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-20 h-20 object-contain mx-auto" />
                </div>
                <div className="text-center px-2">
                    <h1 className="text-xl font-bold uppercase tracking-wider">Pengadilan Agama Karawang</h1>
                    <h2 className="text-lg font-semibold mt-1">LAPORAN KUNJUNGAN</h2>
                    <p className="text-sm font-medium mt-1">{getPeriodText()}</p>
                </div>
                <div className="flex-shrink-0">
                    <img src="/images/logo-ma.png" alt="Logo Mahkamah Agung" className="w-20 h-20 object-contain mx-auto" />
                </div>
            </div>

            {/* Filter Context & Summary */}
            <div className="flex justify-between items-end mb-6 text-sm">
                <div>
                    <p><span className="font-semibold w-20 inline-block">Periode</span>: {period === 'all' ? 'Semua' : period === 'day' ? 'Harian' : 'Bulanan'}</p>
                    <p><span className="font-semibold w-20 inline-block">Waktu</span>: {getPeriodText()}</p>
                    <p><span className="font-semibold w-20 inline-block">Status</span>: {activeTab === 'scanned' ? 'Sudah Scan' : 'Belum Scan'}</p>
                    {search && (
                        <p><span className="font-semibold w-20 inline-block">Pencarian</span>: "{search}"</p>
                    )}
                </div>
                <div className="text-right border border-gray-300 p-3 rounded-lg bg-gray-50 print:bg-transparent">
                    <p className="font-bold">Ringkasan Total</p>
                    <p>Total Tiket: {data.meta.total}</p>
                    <p>Total Orang: {data.meta.total_people}</p>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 print:bg-gray-100">
                        <th className="border border-gray-300 px-2 py-2 text-left">No.</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">No. Antrian</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">Pengunjung</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">NIK</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">Email / No. HP</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">Layanan</th>
                        <th className="border border-gray-300 px-2 py-2 text-center">Org</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">Tgl Kunjungan</th>
                        <th className="border border-gray-300 px-2 py-2 text-left">Waktu Scan</th>
                    </tr>
                </thead>
                <tbody>
                    {data.data.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="border border-gray-300 px-2 py-4 text-center italic text-gray-500">
                                Tidak ada data kunjungan pada filter yang dipilih.
                            </td>
                        </tr>
                    ) : (
                        data.data.map((visit, idx) => {
                            const totalPeople = visit.group_size || (1 + (visit.members_count || 0));
                            return (
                                <tr key={visit.id} className="break-inside-avoid">
                                    <td className="border border-gray-300 px-2 py-2">{idx + 1}</td>
                                    <td className="border border-gray-300 px-2 py-2 font-semibold">{visit.visit_number}</td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        <div className="font-medium">{visit.visitor.name}</div>
                                        {visit.members && visit.members.length > 0 && (
                                            <div className="mt-0.5 space-y-0.5">
                                                {visit.members.map((member, i) => (
                                                    <div key={i} className="font-medium">{member.name}</div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">{visit.visitor.nik || '-'}</td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        <div>{visit.visitor.email || '-'}</div>
                                        <div className="text-gray-500">{visit.visitor.phone || '-'}</div>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">{visit.service?.name || '-'}</td>
                                    <td className="border border-gray-300 px-2 py-2 text-center">{totalPeople}</td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        {visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="border border-gray-300 px-2 py-2">
                                        {visit.checked_in_at ? new Date(visit.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
            
            <div className="mt-8 text-right text-sm">
                <p>Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
        </div>
    );
}
