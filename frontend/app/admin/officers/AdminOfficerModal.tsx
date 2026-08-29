"use client";

import { useState, useEffect } from "react";
import { OfficerUser } from "@/lib/types";
import { X, Check, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

interface AdminOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (officerData: Partial<OfficerUser> & { password?: string }) => Promise<void>;
    officer?: OfficerUser | null;
}

export default function AdminOfficerModal({ isOpen, onClose, onSave, officer }: AdminOfficerModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (officer) {
                setName(officer.name);
                setEmail(officer.email);
                setIsActive(officer.is_active);
            } else {
                setName("");
                setEmail("");
                setIsActive(true);
            }
            setPassword("");
            setShowPassword(false);
        }
    }, [isOpen, officer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Password is required for new officer, optional for edit
        if (!officer && password.length < 6) {
            Swal.fire({
                icon: "error",
                title: "Validasi Gagal",
                text: "Password minimal 6 karakter.",
                confirmButtonColor: "#085C3B"
            });
            return;
        }

        if (officer && password && password.length < 6) {
            Swal.fire({
                icon: "error",
                title: "Validasi Gagal",
                text: "Password baru minimal 6 karakter.",
                confirmButtonColor: "#085C3B"
            });
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                name,
                email,
                is_active: isActive,
                ...(password ? { password } : {})
            });
            
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            
            Toast.fire({
                icon: "success",
                title: officer ? "Data petugas berhasil diperbarui!" : "Petugas baru berhasil ditambahkan!"
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
                        {officer ? 'Edit Data Petugas' : 'Tambah Petugas Baru'}
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
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            disabled={isSaving}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#085C3B]/20 focus:border-[#085C3B] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="Contoh: Budi Santoso"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Alamat Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            disabled={isSaving}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#085C3B]/20 focus:border-[#085C3B] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="budi@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            {officer ? 'Password Baru' : 'Password'} {officer ? '' : <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required={!officer}
                                minLength={6}
                                disabled={isSaving}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#085C3B]/20 focus:border-[#085C3B] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 pr-12"
                                placeholder={officer ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
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
                            Jika dinonaktifkan, petugas tidak akan bisa login ke dalam sistem.
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
                            disabled={isSaving}
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
