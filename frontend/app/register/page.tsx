"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { ApiError, Service, VisitPayload, Member } from "../../lib/types";
import QRCode from "qrcode";
import Image from "next/image";
import Link from "next/link";
import {
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    QrCode
} from "lucide-react";

type Step = 1 | 2 | 3;
type Status = 'form' | 'success';

export default function GuestFormPage() {
    // API State
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [serviceError, setServiceError] = useState<string | null>(null);

    // Form Flow State
    const [step, setStep] = useState<Step>(1);
    const [status, setStatus] = useState<Status>('form');
    
    // Submit State
    const [formLoading, setFormLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [apiValidationErrors, setApiValidationErrors] = useState<Record<string, string[]>>({});
    
    // Local Validation State
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const [successData, setSuccessData] = useState<{
        visitor_code: string;
        visit_number: string;
        qrDataUrl: string;
    } | null>(null);

    // Form Data
    const [fullName, setFullName] = useState("");
    const [nik, setNik] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    
    const [visitDate, setVisitDate] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [groupSize, setGroupSize] = useState("1");
    const [members, setMembers] = useState<Member[]>([]);

    // Time State for Header
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            setCurrentTime(formatter.format(now));
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await fetchApi('/api/services');
                setServices(response.data || []);
            } catch (_err: unknown) {
                setServiceError("Layanan tidak dapat dimuat. Silakan coba kembali.");
            } finally {
                setLoadingServices(false);
            }
        };
        loadServices();
    }, []);

    // Helper functions
    const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setGroupSize(val);

        const size = parseInt(val) || 1;
        const requiredMembers = Math.max(0, size - 1);
        
        setMembers((prevMembers) => {
            if (requiredMembers > prevMembers.length) {
                const newMembers = [...prevMembers];
                for (let i = prevMembers.length; i < requiredMembers; i++) {
                    newMembers.push({ name: "" });
                }
                return newMembers;
            } else if (requiredMembers < prevMembers.length) {
                return prevMembers.slice(0, requiredMembers);
            }
            return prevMembers;
        });
    };

    const handleMemberChange = (index: number, value: string) => {
        const newMembers = [...members];
        newMembers[index].name = value;
        setMembers(newMembers);
    };

    const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 16) {
            setNik(val);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        setPhone(val);
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validateStep1 = (): boolean => {
        const errors: Record<string, string> = {};
        
        if (!fullName.trim()) errors.full_name = "Nama lengkap wajib diisi.";
        if (!nik) {
            errors.nik = "NIK wajib diisi.";
        } else if (nik.length !== 16) {
            errors.nik = "NIK harus terdiri dari 16 digit.";
        }
        if (!phone) errors.phone = "Nomor HP wajib diisi.";
        if (email && !validateEmail(email)) {
            errors.email = "Masukkan alamat email yang valid.";
        } else if (!email) {
             errors.email = "Email wajib diisi.";
        }

        setLocalErrors(errors);
        
        if (Object.keys(errors).length > 0) {
            // Focus first error
            const firstErrorField = Object.keys(errors)[0];
            const el = document.getElementById(firstErrorField);
            if (el) el.focus();
            return false;
        }
        return true;
    };

    const validateStep2 = (): boolean => {
        const errors: Record<string, string> = {};
        
        const size = parseInt(groupSize);
        if (!groupSize || isNaN(size) || size < 1) {
            errors.group_size = "Jumlah rombongan wajib diisi.";
        }
        
        if (!visitDate) {
            errors.visit_date = "Tanggal kunjungan wajib dipilih.";
        } else {
             const today = new Date();
             today.setHours(0,0,0,0);
             const selected = new Date(visitDate);
             selected.setHours(0,0,0,0);
             
             const diffTime = today.getTime() - selected.getTime();
             const diffDays = diffTime / (1000 * 3600 * 24);
             
             if (diffDays < 0) {
                 errors.visit_date = "Tanggal kunjungan tidak boleh di masa depan.";
             } else if (diffDays > 2) {
                 errors.visit_date = "Tanggal kunjungan maksimal H-2 dari hari ini.";
             }
        }
        
        if (!serviceId) {
            errors.service_id = "Keperluan kunjungan wajib dipilih.";
        }

        members.forEach((member, idx) => {
            if (!member.name.trim()) {
                errors[`member_${idx}`] = `Nama anggota ${idx + 1} wajib diisi.`;
            }
        });

        setLocalErrors(errors);
        
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            const el = document.getElementById(firstErrorField);
            if (el) el.focus();
            return false;
        }
        return true;
    };

    const nextStep = () => {
        setLocalErrors({});
        setApiValidationErrors({});
        setSubmitError(null);

        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else if (step === 2) {
            if (validateStep2()) setStep(3);
        }
    };

    const prevStep = () => {
        setLocalErrors({});
        setApiValidationErrors({});
        setSubmitError(null);
        if (step > 1) setStep((s) => (s - 1) as Step);
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        setSubmitError(null);
        setApiValidationErrors({});
        setLocalErrors({});

        const payload: VisitPayload = {
            full_name: fullName,
            nik,
            phone,
            email,
            visit_date: visitDate,
            service_id: parseInt(serviceId),
            group_size: parseInt(groupSize) || 1,
            members: members.filter(m => m.name.trim() !== '')
        };

        try {
            const response = await fetchApi('/api/visits', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Generate QR Code containing ONLY qr_token
            const qrToken = response.data.qr_token;
            const qrDataUrl = await QRCode.toDataURL(qrToken, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#063D2A', // Dark Green for branding
                    light: '#ffffff'
                }
            });

            setSuccessData({
                visitor_code: response.data.visitor_code,
                visit_number: response.data.visit_number,
                qrDataUrl
            });
            
            setStatus('success');
            
            // Clear PII from memory
            setFullName("");
            setNik("");
            setPhone("");
            setEmail("");
            setMembers([]);

        } catch (err: unknown) {
            if (err instanceof ApiError) {
                if (err.status === 422 && err.errors) {
                    setApiValidationErrors(err.errors);
                    setStep(1); // Reset to beginning to show errors, or we can check which step has errors
                    
                    // Intelligent step routing based on errors
                    const hasStep1Errors = err.errors['full_name'] || err.errors['nik'] || err.errors['phone'] || err.errors['email'];
                    const hasStep2Errors = err.errors['visit_date'] || err.errors['service_id'] || err.errors['group_size'] || Object.keys(err.errors).some(k => k.startsWith('members'));
                    
                    if (hasStep1Errors) {
                        setStep(1);
                    } else if (hasStep2Errors) {
                        setStep(2);
                    }
                } else {
                    setSubmitError(err.message || "Registrasi tidak dapat diproses saat ini. Silakan coba kembali.");
                }
            } else {
                setSubmitError("Registrasi tidak dapat diproses saat ini. Silakan coba kembali.");
            }
        } finally {
            setFormLoading(false);
        }
    };

    const getErrorMsg = (field: string) => {
        if (localErrors[field]) return localErrors[field];
        if (apiValidationErrors[field]) return apiValidationErrors[field][0];
        return null;
    };

    // Mask NIK for review screen
    const maskedNik = nik.length === 16 ? `•••• •••• •••• ${nik.substring(12)}` : nik;

    const renderProgressIndicator = () => {
        return (
            <div className="w-full flex items-center justify-between md:justify-center md:gap-4 mb-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 
                        ${step > 1 || status === 'success' ? 'bg-[#085C3B] border-[#085C3B] text-white' : 
                          step === 1 ? 'bg-white border-[#085C3B] text-[#085C3B]' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                        {step > 1 || status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-[#1A1A1A]' : 'text-gray-400'} hidden md:block`}>DATA DIRI</span>
                </div>
                
                <div className={`h-px w-10 md:w-20 ${step >= 2 || status === 'success' ? 'bg-[#085C3B]' : 'bg-gray-300'}`}></div>
                
                {/* Step 2 */}
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 
                        ${step > 2 || status === 'success' ? 'bg-[#085C3B] border-[#085C3B] text-white' : 
                          step === 2 ? 'bg-white border-[#085C3B] text-[#085C3B]' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                        {step > 2 || status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-[#1A1A1A]' : 'text-gray-400'} hidden md:block`}>DETAIL KUNJUNGAN</span>
                </div>

                <div className={`h-px w-10 md:w-20 ${step >= 3 || status === 'success' ? 'bg-[#085C3B]' : 'bg-gray-300'}`}></div>
                
                {/* Step 3 */}
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 
                        ${status === 'success' ? 'bg-[#085C3B] border-[#085C3B] text-white' : 
                          step === 3 ? 'bg-white border-[#085C3B] text-[#085C3B]' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                        {status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step >= 3 ? 'text-[#1A1A1A]' : 'text-gray-400'} hidden md:block`}>PERIKSA DATA</span>
                </div>
            </div>
        );
    };

    if (status === 'success' && successData) {
        return (
            <div className="min-h-screen bg-[#11522A] flex flex-col font-sans">
                <main className="flex-grow flex items-center justify-center p-4 py-12 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none bg-repeat bg-left-top opacity-40" 
                         style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
                    </div>
                    <div className="bg-[#FAF7F2] rounded-xl shadow-sm border border-[#E8E1D5] w-full max-w-md p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[#E8F1EA] text-[#085C3B] rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">REGISTRASI BERHASIL</h2>
                        <p className="text-gray-600 mb-8 text-sm">Registrasi kunjungan Anda telah berhasil.</p>
                        
                        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-gray-200 w-full flex flex-col items-center mb-8">
                            <div className="flex items-center gap-2 text-[#085C3B] font-semibold mb-4">
                                <QrCode className="w-5 h-5" />
                                <span>QR CODE</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">Tunjukkan QR Code ini kepada petugas saat kunjungan.</p>
                            
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-6">
                                <Image src={successData.qrDataUrl} alt="QR Code" width={220} height={220} className="rounded" />
                            </div>

                            <div className="w-full space-y-3 text-left border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Kode Visitor</span>
                                    <span className="font-semibold text-[#1A1A1A] font-mono">{successData.visitor_code}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Nomor Antrean</span>
                                    <span className="font-semibold text-[#1A1A1A] font-mono">{successData.visit_number}</span>
                                </div>
                            </div>
                        </div>

                        <Link 
                            href="/"
                            className="w-full py-3.5 bg-[#085C3B] hover:bg-[#063D2A] text-white rounded-lg font-medium transition-colors flex justify-center items-center"
                        >
                            SELESAI
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#11522A] flex flex-col font-sans">
            <main className="flex-grow flex items-start justify-center p-4 py-12 sm:py-16 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-repeat bg-left-top opacity-40" 
                     style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
                </div>
                
                <Link href="/" className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-[#085C3B] font-semibold bg-white/70 px-4 py-2.5 rounded-lg shadow-sm backdrop-blur-md border border-[#085C3B]/20 transition-all z-20 group">
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="hidden sm:inline">Kembali ke Beranda</span>
                </Link>

                <div className="bg-[#FAF7F2] rounded-xl shadow-sm border border-[#E8E1D5] w-full max-w-2xl p-6 sm:p-10 z-10 relative">
                    
                    {renderProgressIndicator()}

                    {/* Step 1: DATA DIRI */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8 border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-[#1A1A1A]">DATA DIRI</h2>
                                <p className="text-sm text-gray-500 mt-1">Lengkapi informasi diri Anda untuk melakukan registrasi kunjungan.</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        id="full_name"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                            ${getErrorMsg('full_name') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                        aria-invalid={!!getErrorMsg('full_name')}
                                        aria-describedby={getErrorMsg('full_name') ? "err_full_name" : undefined}
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                    {getErrorMsg('full_name') && (
                                        <p id="err_full_name" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('full_name')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="nik" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">NIK <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        id="nik"
                                        value={nik}
                                        onChange={handleNikChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                            ${getErrorMsg('nik') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                        aria-invalid={!!getErrorMsg('nik')}
                                        aria-describedby={getErrorMsg('nik') ? "err_nik" : undefined}
                                        placeholder="16 digit angka NIK"
                                        maxLength={16}
                                        inputMode="numeric"
                                    />
                                    {getErrorMsg('nik') && (
                                        <p id="err_nik" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('nik')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nomor HP <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        id="phone"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                            ${getErrorMsg('phone') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                        aria-invalid={!!getErrorMsg('phone')}
                                        aria-describedby={getErrorMsg('phone') ? "err_phone" : undefined}
                                        placeholder="Contoh: 08123456789"
                                        inputMode="numeric"
                                    />
                                    {getErrorMsg('phone') && (
                                        <p id="err_phone" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('phone')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Email <span className="text-red-500">*</span></label>
                                    <input 
                                        type="email" 
                                        id="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                            ${getErrorMsg('email') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                        aria-invalid={!!getErrorMsg('email')}
                                        aria-describedby={getErrorMsg('email') ? "err_email" : undefined}
                                        placeholder="alamat@email.com"
                                    />
                                    {getErrorMsg('email') && (
                                        <p id="err_email" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('email')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button 
                                    onClick={nextStep}
                                    className="w-full sm:w-auto px-8 py-3 bg-[#085C3B] hover:bg-[#063D2A] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm group"
                                >
                                    <span>LANJUTKAN</span>
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: DETAIL KUNJUNGAN */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8 border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-[#1A1A1A]">DETAIL KUNJUNGAN</h2>
                                <p className="text-sm text-gray-500 mt-1">Tentukan informasi kunjungan Anda.</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="group_size" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Jumlah Rombongan <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        id="group_size"
                                        value={groupSize}
                                        onChange={handleGroupSizeChange}
                                        min="1"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                            ${getErrorMsg('group_size') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                        aria-invalid={!!getErrorMsg('group_size')}
                                        aria-describedby={getErrorMsg('group_size') ? "err_group_size" : undefined}
                                    />
                                    {getErrorMsg('group_size') && (
                                        <p id="err_group_size" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('group_size')}
                                        </p>
                                    )}
                                </div>
                                
                                {members.length > 0 && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                                        <h3 className="text-sm font-semibold text-[#1A1A1A]">Data Anggota Rombongan</h3>
                                        {members.map((member, idx) => (
                                            <div key={idx}>
                                                <label htmlFor={`member_${idx}`} className="block text-xs font-semibold text-gray-700 mb-1">Nama Anggota {idx + 1} <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    id={`member_${idx}`}
                                                    value={member.name}
                                                    onChange={e => handleMemberChange(idx, e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                                        ${getErrorMsg(`member_${idx}`) ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                                />
                                                {getErrorMsg(`member_${idx}`) && (
                                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {getErrorMsg(`member_${idx}`)}
                                                    </p>
                                                )}
                                                {getErrorMsg(`members.${idx}.name`) && (
                                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {getErrorMsg(`members.${idx}.name`)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="visit_date" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Tanggal Kunjungan <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input 
                                            type="date" 
                                            id="visit_date"
                                            value={visitDate}
                                            onChange={e => setVisitDate(e.target.value)}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                                ${getErrorMsg('visit_date') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                            aria-invalid={!!getErrorMsg('visit_date')}
                                            aria-describedby={getErrorMsg('visit_date') ? "err_visit_date" : undefined}
                                        />
                                        <Calendar className="w-5 h-5 absolute right-3 top-2.5 text-gray-400 pointer-events-none hidden md:block" />
                                    </div>
                                    {getErrorMsg('visit_date') && (
                                        <p id="err_visit_date" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('visit_date')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="service_id" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Keperluan / Layanan <span className="text-red-500">*</span></label>
                                    {loadingServices ? (
                                        <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm animate-pulse">
                                            Memuat layanan...
                                        </div>
                                    ) : serviceError ? (
                                        <div className="w-full px-4 py-2.5 border border-red-300 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> {serviceError}
                                        </div>
                                    ) : services.length === 0 ? (
                                        <div className="w-full px-4 py-2.5 border border-gray-300 bg-gray-50 text-gray-500 rounded-lg text-sm">
                                            Layanan belum tersedia.
                                        </div>
                                    ) : (
                                        <select 
                                            id="service_id"
                                            value={serviceId}
                                            onChange={e => setServiceId(e.target.value)}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm text-[#1A1A1A] bg-white transition-colors
                                                ${getErrorMsg('service_id') ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:border-[#085C3B] focus:ring-[#E8F1EA]'}`}
                                            aria-invalid={!!getErrorMsg('service_id')}
                                            aria-describedby={getErrorMsg('service_id') ? "err_service_id" : undefined}
                                        >
                                            <option value="">Pilih layanan</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    {getErrorMsg('service_id') && (
                                        <p id="err_service_id" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                                            <AlertCircle className="w-4 h-4" /> {getErrorMsg('service_id')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between gap-3">
                                <button 
                                    onClick={prevStep}
                                    className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                                    <span>KEMBALI</span>
                                </button>
                                <button 
                                    onClick={nextStep}
                                    className="w-full sm:w-auto px-8 py-3 bg-[#085C3B] hover:bg-[#063D2A] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm group"
                                >
                                    <span>LANJUTKAN</span>
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: PERIKSA DATA */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-8 border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-[#1A1A1A]">PERIKSA DATA</h2>
                                <p className="text-sm text-gray-500 mt-1">Pastikan informasi yang Anda masukkan sudah benar sebelum melakukan registrasi.</p>
                            </div>

                            {submitError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Section 1 */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-bold text-[#1A1A1A] text-sm">DATA DIRI</h3>
                                        <button onClick={() => setStep(1)} className="text-xs font-semibold text-[#085C3B] hover:underline px-2 py-1 rounded">UBAH</button>
                                    </div>
                                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                        <div>
                                            <span className="block text-xs text-gray-500 mb-0.5">Nama Lengkap</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{fullName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 mb-0.5">NIK</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{maskedNik}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 mb-0.5">Nomor HP</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{phone}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 mb-0.5">Email</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2 */}
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-bold text-[#1A1A1A] text-sm">DETAIL KUNJUNGAN</h3>
                                        <button onClick={() => setStep(2)} className="text-xs font-semibold text-[#085C3B] hover:underline px-2 py-1 rounded">UBAH</button>
                                    </div>
                                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                        <div>
                                            <span className="block text-xs text-gray-500 mb-0.5">Jumlah Rombongan</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{groupSize} Orang</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-500 mb-0.5">Tanggal Kunjungan</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{visitDate ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(visitDate)) : '-'}</span>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="block text-xs text-gray-500 mb-0.5">Keperluan</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{services.find(s => s.id.toString() === serviceId)?.name || '-'}</span>
                                        </div>
                                        {members.length > 0 && (
                                            <div className="sm:col-span-2 mt-2 pt-3 border-t border-gray-100">
                                                <span className="block text-xs text-gray-500 mb-1.5">Anggota Rombongan:</span>
                                                <ul className="text-sm text-[#1A1A1A] list-disc pl-5 space-y-1">
                                                    {members.map((m, i) => (
                                                        <li key={i}>{m.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between gap-3">
                                <button 
                                    onClick={prevStep}
                                    disabled={formLoading}
                                    className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                                    <span>KEMBALI</span>
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={formLoading}
                                    className="w-full sm:w-auto px-8 py-3 bg-[#085C3B] hover:bg-[#063D2A] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {formLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>MENGIRIM...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>KONFIRMASI & KIRIM</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
