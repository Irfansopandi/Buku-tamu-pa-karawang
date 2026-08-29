"use client";

import { useState, useEffect } from "react";
import { getAdminServices, createAdminService, updateAdminService, deleteAdminService } from "./actions";
import { Service } from "@/lib/types";
import { Plus, Edit2, Trash2, LayoutList, RefreshCcw, ToggleLeft, ToggleRight } from "lucide-react";
import Swal from "sweetalert2";
import AdminServiceModal from "./AdminServiceModal";

export default function AdminServicesTable() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const data = await getAdminServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAdd = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleSave = async (serviceData: Partial<Service>) => {
        if (selectedService) {
            await updateAdminService(selectedService.id, serviceData);
        } else {
            await createAdminService(serviceData);
        }
        await fetchServices();
    };

    const handleDelete = (service: Service) => {
        Swal.fire({
            title: 'Hapus Layanan?',
            html: `Apakah Anda yakin ingin menghapus layanan <b>${service.name}</b>?<br/>Tindakan ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Show page loader instead of SweetAlert button loader
                setIsDeleting(true);
                try {
                    await deleteAdminService(service.id);
                    await fetchServices();
                    
                    const Toast = Swal.mixin({
                        toast: true,
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                    Toast.fire({
                        icon: 'success',
                        title: 'Layanan berhasil dihapus!'
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Menghapus',
                        text: error instanceof Error ? error.message : 'Terjadi kesalahan.',
                        confirmButtonColor: '#085C3B'
                    });
                } finally {
                    setIsDeleting(false);
                }
            }
        });
    };

    const handleToggleStatus = async (service: Service) => {
        setIsLoading(true);
        try {
            await updateAdminService(service.id, { 
                name: service.name,
                sort_order: service.sort_order,
                is_active: !service.is_active 
            });
            await fetchServices();
            
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: 'success',
                title: `Layanan berhasil di${!service.is_active ? 'aktifkan' : 'nonaktifkan'}!`
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengubah Status',
                text: error instanceof Error ? error.message : 'Terjadi kesalahan.',
                confirmButtonColor: '#085C3B'
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Page Loader (for deletion) */}
            {isDeleting && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-3"></div>
                    <p className="text-sm font-medium text-gray-700">Menghapus layanan...</p>
                </div>
            )}

            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <LayoutList className="w-5 h-5 text-[#085C3B]" />
                    <h2 className="text-lg font-bold text-gray-900">Daftar Layanan</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchServices}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-[#085C3B] hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin text-[#085C3B]' : ''}`} />
                    </button>
                    <button 
                        onClick={handleAdd}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-[#085C3B] text-white text-sm font-semibold rounded-xl hover:bg-[#06422a] transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Layanan
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#085C3B] mb-4"></div>
                        <p className="text-sm font-medium">Memuat data layanan...</p>
                    </div>
                ) : services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                        <LayoutList className="w-12 h-12 text-gray-200 mb-3" />
                        <p className="text-sm font-medium text-gray-500">Belum ada layanan yang ditambahkan.</p>
                        <button 
                            onClick={handleAdd}
                            className="mt-4 text-sm font-semibold text-[#085C3B] hover:underline"
                        >
                            + Tambah Layanan Pertama
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 font-semibold">
                                <th className="py-3 px-6 w-20">Urutan</th>
                                <th className="py-3 px-6">Nama Layanan</th>
                                <th className="py-3 px-6 w-32">Status</th>
                                <th className="py-3 px-6 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
                                            {service.sort_order}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        {service.name}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                            service.is_active
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {service.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(service)}
                                                className={`p-1.5 rounded-lg transition-colors ${service.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title={service.is_active ? "Nonaktifkan" : "Aktifkan"}
                                                disabled={isLoading}
                                            >
                                                {service.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                                disabled={isLoading}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AdminServiceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                service={selectedService}
                existingServices={services}
            />
        </div>
    );
}
