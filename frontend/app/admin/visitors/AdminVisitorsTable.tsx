"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAdminVisits } from '../visits/actions';
import { PaginatedVisitsResponse } from '@/lib/types';
import { Search, Calendar, ChevronLeft, ChevronRight, Activity, Clock, Eye, X, ChevronDown } from 'lucide-react';
import { VisitScanData } from '@/lib/types';

function AdminVisitorsTableContent({ initialTab = 'scanned' }: { initialTab?: 'scanned' | 'pending' }) {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    
    const [data, setData] = useState<PaginatedVisitsResponse | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [period, setPeriod] = useState<'all' | 'day' | 'month'>('day');
    const [activeTab, setActiveTab] = useState<'scanned' | 'pending'>(
        (tabParam === 'scanned' || tabParam === 'pending') ? tabParam : initialTab
    );
    const [selectedVisit, setSelectedVisit] = useState<VisitScanData | null>(null);
    
    // Default to today in local timezone
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }).slice(0, 10);
    const monthStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }).slice(0, 7);
    
    const [date, setDate] = useState(todayStr);
    const [monthYear, setMonthYear] = useState(monthStr);
    const [page, setPage] = useState(1);
    
    const [isUpdating, setIsUpdating] = useState(true);
    const [isError, setIsError] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Sync tab with URL
    useEffect(() => {
        if (tabParam === 'scanned' || tabParam === 'pending') {
            setActiveTab(tabParam);
            setPage(1);
        }
    }, [tabParam]);

    // Handle search change separately to reset page immediately
    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const fetchVisitors = async () => {
        setIsUpdating(true);
        setIsError(false);
        try {
            const params: any = {
                page,
                per_page: 10,
                search: debouncedSearch,
            };
            
            if (activeTab === 'scanned') {
                params.scanned_only = true;
            } else {
                params.status = 'pending';
            }
            
            if (period === 'day' && date) {
                params.date = date;
            } else if (period === 'month' && monthYear) {
                const [y, m] = monthYear.split('-');
                params.year = y;
                params.month = m;
            }

            const res = await getAdminVisits(params);
            
            if (res) {
                if (page > res.meta.last_page && res.meta.last_page > 0) {
                    setPage(res.meta.last_page);
                } else {
                    setData(res);
                }
            } else {
                setIsError(true);
            }
        } catch (error) {
            setIsError(true);
        } finally {
            setIsUpdating(false);
        }
    };

    // Effect for dependencies changes
    useEffect(() => {
        fetchVisitors();
    }, [debouncedSearch, period, date, monthYear, page, activeTab]);

    // Polling effect
    useEffect(() => {
        const interval = setInterval(() => {
            fetchVisitors();
        }, 10000);
        return () => clearInterval(interval);
    }, [debouncedSearch, period, date, monthYear, page, activeTab]);

    const handlePeriodChange = (newPeriod: 'all' | 'day' | 'month') => {
        setPeriod(newPeriod);
        setPage(1);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'checked_in': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'checked_in': return 'Check-in';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header, Search & Filters */}
                <div className="p-6 border-b border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-900">Data Pengunjung</h2>
                            {isUpdating ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Memperbarui...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Live
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari Nama / NIK / No. Antrian..."
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none hover:border-green-400 transition-colors bg-white"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-auto">
                                    <select 
                                        value={period}
                                        onChange={(e) => handlePeriodChange(e.target.value as any)}
                                        className="appearance-none block w-full sm:w-auto py-2 pl-3 pr-9 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none cursor-pointer hover:border-green-400 transition-colors bg-white"
                                    >
                                        <option value="all">Semua</option>
                                        <option value="day">Hari</option>
                                        <option value="month">Bulan</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>

                                {period === 'day' && (
                                    <input 
                                        type="date"
                                        value={date}
                                        onChange={(e) => { setDate(e.target.value); setPage(1); }}
                                        className="block w-full sm:w-auto py-2 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none hover:border-green-400 transition-colors bg-white"
                                    />
                                )}

                                {period === 'month' && (
                                    <input 
                                        type="month"
                                        value={monthYear}
                                        onChange={(e) => { setMonthYear(e.target.value); setPage(1); }}
                                        className="block w-full sm:w-auto py-2 px-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none hover:border-green-400 transition-colors bg-white"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                    <button
                        onClick={() => { setActiveTab('scanned'); setPage(1); }}
                        className={`group py-2.5 px-4 font-medium text-sm rounded-xl transition-all duration-200 flex items-center gap-2 ${
                            activeTab === 'scanned' 
                            ? 'bg-[#085C3B] text-white shadow-md shadow-[#085C3B]/20 ring-1 ring-[#085C3B]' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50 hover:border-[#085C3B]/30 hover:text-[#085C3B] shadow-sm'
                        }`}
                    >
                        Sudah Scan
                        {data?.summary && (
                            <span className={`py-0.5 px-2 rounded-full text-xs font-semibold transition-colors ${activeTab === 'scanned' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-[#085C3B]/10 group-hover:text-[#085C3B]'}`}>
                                {data.summary.scanned.tickets} Tiket • {data.summary.scanned.people} Orang
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setActiveTab('pending'); setPage(1); }}
                        className={`group py-2.5 px-4 font-medium text-sm rounded-xl transition-all duration-200 flex items-center gap-2 ${
                            activeTab === 'pending' 
                            ? 'bg-[#D29C29] text-white shadow-md shadow-[#D29C29]/20 ring-1 ring-[#D29C29]' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-yellow-50 hover:border-[#D29C29]/30 hover:text-[#D29C29] shadow-sm'
                        }`}
                    >
                        Belum Scan
                        {data?.summary && (
                            <span className={`py-0.5 px-2 rounded-full text-xs font-semibold transition-colors ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-[#D29C29]/10 group-hover:text-[#D29C29]'}`}>
                                {data.summary.pending.tickets} Tiket • {data.summary.pending.people} Orang
                            </span>
                        )}
                    </button>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isError ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-red-500 font-medium">Data pengunjung gagal dimuat.</p>
                            <button onClick={() => fetchVisitors()} className="mt-2 text-sm text-blue-600 hover:underline">Silakan coba kembali.</button>
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Activity className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="font-bold text-gray-600 mb-1">Belum Ada Pengunjung</p>
                            <p className="text-sm">Belum ada pengunjung pada {activeTab === 'scanned' ? 'status Sudah Scan' : 'status Belum Scan'} untuk filter saat ini.</p>
                        </div>
                    ) : data ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No.</th>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Tiket</th>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Pengunjung</th>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIK</th>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email / No. HP</th>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Layanan</th>
                                    <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Orang</th>
                                    <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {activeTab === 'scanned' ? 'Waktu Scan' : 'Waktu Reservasi'}
                                    </th>
                                    <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 relative">
                                {/* Overlay loading subtle if updating but data exists */}
                                {isUpdating && (
                                    <tr className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-10 pointer-events-none"></tr>
                                )}
                                {data.data.map((visit, idx) => {
                                    // Nomor Urut Chronological
                                    const rowNumber = data.meta.total - ((data.meta.current_page - 1) * data.meta.per_page) - idx;
                                    // Perhitungan total rombongan = group_size dari backend atau 1 + members_count
                                    const totalPeople = visit.group_size || (1 + (visit.members_count || 0));
                                    
                                    return (
                                        <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{rowNumber}</td>
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-gray-900">{visit.visit_number}</span>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="font-medium text-gray-900 whitespace-normal break-words max-w-[150px]">{visit.visitor.name}</div>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {visit.visitor.nik || '-'}
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-gray-900 font-medium">{visit.visitor.email || '-'}</span>
                                                    <span className="text-gray-500">{visit.visitor.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                                                    {visit.service?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                                                {totalPeople} Org
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {activeTab === 'scanned' 
                                                    ? (visit.checked_in_at ? new Date(visit.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-')
                                                    : (visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')
                                                }
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => setSelectedVisit(visit)}
                                                        className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : null}
                </div>

                {/* Pagination */}
                {data && data.meta.total > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan <span className="font-medium text-gray-900">{(data.meta.current_page - 1) * data.meta.per_page + 1}</span> hingga <span className="font-medium text-gray-900">{Math.min(data.meta.current_page * data.meta.per_page, data.meta.total)}</span> dari <span className="font-medium text-gray-900">{data.meta.total}</span> visitors
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1 || isUpdating}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="text-sm font-medium text-gray-700 px-2">
                                {page} / {data.meta.last_page}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(data.meta.last_page, page + 1))}
                                disabled={page === data.meta.last_page || isUpdating}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail Kunjungan */}
            {selectedVisit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-gray-900">Detail Pengunjung</h3>
                            <button onClick={() => setSelectedVisit(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">No. Antrian / Tiket</p>
                                    <p className="font-bold text-gray-900">{selectedVisit.visit_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(selectedVisit.status)}`}>
                                        {getStatusLabel(selectedVisit.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Pengunjung</p>
                                    <p className="font-medium text-gray-900">{selectedVisit.visitor.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">NIK</p>
                                    <p className="font-medium text-gray-900">{selectedVisit.visitor.nik || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Email</p>
                                    <p className="font-medium text-gray-900">{selectedVisit.visitor.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">No. HP</p>
                                    <p className="font-medium text-gray-900">{selectedVisit.visitor.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Layanan</p>
                                    <p className="font-medium text-gray-900">{selectedVisit.service?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Total Rombongan</p>
                                    <p className="font-medium text-gray-900">{selectedVisit.group_size || (1 + (selectedVisit.members_count || 0))} Orang</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Waktu Scan</p>
                                    <p className="font-medium text-[#085C3B] flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {selectedVisit.checked_in_at ? new Date(selectedVisit.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </p>
                                </div>
                                {selectedVisit.checked_in_at && (
                                    <div className="col-span-1">
                                        <p className="text-gray-500 mb-1">Tanggal Scan</p>
                                        <p className="font-medium text-gray-900">{new Date(selectedVisit.checked_in_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                )}
                            </div>

                            {/* Render Members List if exist */}
                            {selectedVisit.members && selectedVisit.members.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-gray-500 mb-2 text-sm">Daftar Anggota Rombongan</p>
                                    <ul className="space-y-2">
                                        {selectedVisit.members.map((member, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                                                <span className="font-bold text-gray-500 w-5 text-right">{i + 1}.</span>
                                                <span className="font-medium text-gray-900">{member.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setSelectedVisit(null)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function AdminVisitorsTable({ initialTab = 'scanned' }: { initialTab?: 'scanned' | 'pending' }) {
    return (
        <Suspense fallback={<div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085C3B]"></div></div>}>
            <AdminVisitorsTableContent initialTab={initialTab} />
        </Suspense>
    );
}
