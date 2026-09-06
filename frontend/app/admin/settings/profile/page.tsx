"use client";

import { useState, useEffect } from "react";
import { getAdminProfileAction, updateAdminProfileAction, updateAdminPasswordAction } from "../../../../lib/admin-actions";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();

    // Profile State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Password State
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Show/Hide Password State
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoadingProfile(true);
        const result = await getAdminProfileAction();
        if (result.success && result.data) {
            setName(result.data.name || "");
            setEmail(result.data.email || "");
        }
        setIsLoadingProfile(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError(null);
        setIsSavingProfile(true);

        const result = await updateAdminProfileAction({ name, email });
        setIsSavingProfile(false);

        if (result.success) {
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: "#ffffff",
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: "success",
                title: "Profil berhasil diperbarui",
                iconColor: "#085C3B",
                customClass: {
                    popup: "border-l-4 border-[#085C3B] shadow-lg",
                    title: "text-[#1A1A1A] font-semibold text-sm"
                }
            });
            
            router.refresh();
        } else {
            setProfileError(result.error);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        
        if (newPassword.length < 6) {
            setPasswordError("Password baru harus minimal 6 karakter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Konfirmasi password tidak cocok.");
            return;
        }

        setIsSavingPassword(true);

        const result = await updateAdminPasswordAction({ 
            password: newPassword,
            password_confirmation: confirmPassword
        });
        
        setIsSavingPassword(false);

        if (result.success) {
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: "#ffffff",
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: "success",
                title: "Password berhasil diperbarui",
                iconColor: "#085C3B",
                customClass: {
                    popup: "border-l-4 border-[#085C3B] shadow-lg",
                    title: "text-[#1A1A1A] font-semibold text-sm"
                }
            });
            setNewPassword("");
            setConfirmPassword("");
        } else {
            setPasswordError(result.error);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-[#085C3B] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-7 h-7 text-[#085C3B]" />
                    Profil Admin
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kelola informasi profil dan kata sandi akun administrator Anda.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Edit Profile Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-800">Data Profil</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                        {profileError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                                {profileError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#085C3B] focus:border-[#085C3B] text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#085C3B] focus:border-[#085C3B] text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="w-full flex justify-center items-center gap-2 bg-[#085C3B] hover:bg-[#064a2f] text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
                            >
                                {isSavingProfile ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Simpan Profil
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-800">Ubah Password</h2>
                    </div>
                    <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                        {passwordError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                                {passwordError}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#085C3B] focus:border-[#085C3B] text-sm"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#085C3B] focus:border-[#085C3B] text-sm"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSavingPassword || !newPassword || !confirmPassword}
                                className="w-full flex justify-center items-center gap-2 bg-[#11522A] hover:bg-[#0a3119] text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-70"
                            >
                                {isSavingPassword ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> Perbarui Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
