"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { loginAdminAction, loginOfficerAction } from "../../lib/auth-actions";
import { Eye, EyeOff, ShieldCheck, UserCog, ChevronDown } from "lucide-react";
import AdminToast from "../../components/admin/AdminToast";
import { Suspense } from "react";
import { useFormStatus } from "react-dom";

const initialState = {
    error: "",
};

// Client wrapper for submit button
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-[#085C3B] hover:bg-[#064A2F] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#085C3B] disabled:opacity-50"
        >
            {pending ? "Sedang masuk..." : "Masuk"}
        </button>
    );
}

export default function LoginPage() {
    const [role, setRole] = useState<"admin" | "officer">("admin");
    
    // We bind the role to a hidden input so the action can read it, or we just dynamically select the action
    // But useActionState expects a single action. Let's create a client-side wrapper.
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        if (role === "admin") {
            return loginAdminAction(prevState, formData);
        } else {
            return loginOfficerAction(prevState, formData);
        }
    }, initialState);

    const [showPassword, setShowPassword] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Controlled inputs to prevent disappearing on error
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleOptions = [
        { value: "admin", label: "Admin", icon: ShieldCheck },
        { value: "officer", label: "Petugas", icon: UserCog },
    ];

    const selectedOption = roleOptions.find((opt) => opt.value === role) || roleOptions[0];

    return (
        <div className="min-h-screen bg-[#11522A] flex flex-col font-sans">
            <Suspense fallback={null}>
                <AdminToast />
            </Suspense>
            <main className="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-repeat bg-left-top opacity-40" 
                     style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
                </div>
                
                <div className="w-full max-w-md flex flex-col items-center relative z-10">
                    
                    <div className="bg-[#FAF7F2]/90 backdrop-blur-md rounded-xl shadow-xl border border-[#E8E1D5]/50 border-t-[6px] border-t-[#D29C29] w-full p-6 sm:p-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        
                        <div className="flex flex-col items-center mb-8">
                            <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md mb-4" />
                            <h2 className="text-2xl font-bold text-[#1A1A1A] text-center">Portal Akses</h2>
                            <p className="text-sm text-gray-500 mt-1 text-center">Buku Tamu Pengadilan Agama Karawang</p>
                        </div>

                        <form action={formAction} className="space-y-6">
                            {state?.error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative text-sm flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    <span>{state.error}</span>
                                </div>
                            )}

                            <input type="hidden" name="role" value={role} />

                            {/* Custom Dropdown Role */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                                    Pilih Peran 
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-3 border border-[#085C3B] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#085C3B]/20 transition-all text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <selectedOption.icon className="w-5 h-5 text-gray-400" />
                                        <span className="text-[#1A1A1A] font-medium">{selectedOption.label}</span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-[#085C3B] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {roleOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setRole(option.value as "admin" | "officer");
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                                            >
                                                <div className="bg-gray-100 p-2 rounded-md">
                                                    <option.icon className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <span className="text-[#1A1A1A] font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#D29C29] focus:ring-[#D29C29]/20 text-sm text-[#1A1A1A] bg-white transition-colors"
                                        placeholder="Masukkan alamat email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                                    Kata Sandi
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#D29C29] focus:ring-[#D29C29]/20 text-sm text-[#1A1A1A] bg-white transition-colors pr-10"
                                        placeholder="Masukkan kata sandi"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#D29C29] focus:outline-none transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
