"use client";

import { useState, useEffect } from "react";
import { Service } from "@/lib/types";
import { X, Check } from "lucide-react";
import Swal from "sweetalert2";

interface AdminServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (serviceData: Partial<Service>) => Promise<void>;
    service?: Service | null;
    existingServices: Service[];
}

export default function AdminServiceModal({ isOpen, onClose, onSave, service, existingServices }: AdminServiceModalProps) {
    const [name, setName] = useState("");
    const [sortOrder, setSortOrder] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Validation state
    const [sortOrderError, setSortOrderError] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            if (service) {
                setName(service.name);
                setSortOrder(service.sort_order);
                setIsActive(service.is_active);
            } else {
                setName("");
                // Auto-suggest next sort order
                const maxSort = existingServices.length > 0 
                    ? Math.max(...existingServices.map(s => s.sort_order)) 
                    : 0;
                setSortOrder(maxSort + 1);
                setIsActive(true);
            }
            setSortOrderError("");
        }
    }, [isOpen, service, existingServices]);

    // Validate sort order whenever it changes
    useEffect(() => {
        if (isOpen) {
            const isDuplicate = existingServices.some(s => s.sort_order === sortOrder && s.id !== service?.id);
            if (isDuplicate) {
                setSortOrderError("Nomor urut ini sudah digunakan oleh layanan lain.");
            } else {
                setSortOrderError("");
            }
        }
    }, [sortOrder, existingServices, service, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (sortOrderError) return; // Don't submit if validation fails

        setIsSaving(true);
        try {
            await onSave({
                name,
                sort_order: sortOrder,
                is_active: isActive
            });
            
            // SweetAlert Top-End Toast
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            
            Toast.fire({
                icon: "success",
                title: service ? "Layanan berhasil diperbarui!" : "Layanan baru berhasil ditambahkan!"
            });
            
            onClose();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Gagal Menyimpan",
                text: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.",
                confirmButtonColor: "#085C3B"
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isSaving ? onClose : undefined}></div>
            
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {service ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                    </h3>
                    <button 
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nama Layanan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            disabled={isSaving}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#085C3B]/20 focus:border-[#085C3B] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Contoh: PTSP / Pendaftaran Perkara"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Urutan Tampil (Sort Order) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            disabled={isSaving}
                            value={sortOrder || ""}
                            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 ${
                                sortOrderError 
                                ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-2 focus:ring-[#085C3B]/20 focus:border-[#085C3B]'
                            }`}
                        />
                        {sortOrderError && (
                            <p className="mt-1.5 text-sm text-red-500 font-medium">
                                {sortOrderError}
                            </p>
                        )}
                        <p className="mt-1.5 text-xs text-gray-500">
                            Menentukan urutan layanan ini saat ditampilkan di dropdown.
                        </p>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    disabled={isSaving}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#085C3B] peer-disabled:opacity-50"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                Status Aktif
                            </span>
                        </label>
                        <p className="mt-1.5 text-xs text-gray-500">
                            Jika dinonaktifkan, layanan ini tidak akan bisa dipilih oleh pengunjung.
                        </p>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !!sortOrderError}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-[#085C3B] hover:bg-[#06422a] rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[110px] justify-center"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
