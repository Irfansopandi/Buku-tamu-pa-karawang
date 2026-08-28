"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Service, VisitPayload, ApiValidationError } from "@/lib/types";
import { fetchServicesAction, checkNikAction, submitVisitAction } from "@/lib/public-actions";
import TicketCard from "./TicketCard";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { User, CreditCard, Phone, Mail, Calendar, Users, Briefcase, PlusCircle, MinusCircle, AlertCircle, Loader2, ChevronDown, CheckCircle2, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function RegistrationForm() {
    const router = useRouter();
    // Form State
    const [currentStep, setCurrentStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [nik, setNik] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [serviceId, setServiceId] = useState<number | "">("");
    const [visitDate, setVisitDate] = useState("");
    const [groupSize, setGroupSize] = useState<number>(1);
    const [members, setMembers] = useState<{name: string}[]>([]);
    
    // UI State
    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [isCheckingNik, setIsCheckingNik] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ApiValidationError>({});
    const [globalError, setGlobalError] = useState<string | null>(null);
    
    // Success State
    const [successData, setSuccessData] = useState<{
        visitorCode: string;
        visitNumber: string;
        qrDataUrl: string;
    } | null>(null);

    // Refs for optimization
    const lastCheckedNik = useRef<string>("");
    const isAutoFilled = useRef<boolean>(false);
    const serviceDropdownRef = useRef<HTMLDivElement>(null);
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
                setIsServiceDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Setup initial Date limits (Jakarta timezone)
    const [minDate, setMinDate] = useState("");
    
    useEffect(() => {
        const initDate = () => {
            const today = new Date();
            const jakartaStr = today.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
            const jakartaDate = new Date(jakartaStr);
            const yyyy = jakartaDate.getFullYear();
            const mm = String(jakartaDate.getMonth() + 1).padStart(2, '0');
            const dd = String(jakartaDate.getDate()).padStart(2, '0');
            setMinDate(`${yyyy}-${mm}-${dd}`);
        };
        initDate();
    }, []);

    // Fetch services on mount
    useEffect(() => {
        const loadServices = async () => {
            setIsLoadingServices(true);
            const result = await fetchServicesAction();
            if (result.success && result.data) {
                setServices(result.data);
            }
            setIsLoadingServices(false);
        };
        loadServices();
    }, []);

    // NIK validation and auto-fill
    useEffect(() => {
        const checkNik = async () => {
            const cleanNik = nik.replace(/\D/g, ''); // only digits
            if (cleanNik.length === 16 && cleanNik !== lastCheckedNik.current) {
                lastCheckedNik.current = cleanNik;
                setIsCheckingNik(true);
                const result = await checkNikAction(cleanNik);
                if (result.success && result.data) {
                    setFullName(result.data.full_name || "");
                    setPhone(result.data.phone || "");
                    setEmail(result.data.email || "");
                    isAutoFilled.current = true;
                } else if (isAutoFilled.current) {
                    setFullName("");
                    setPhone("");
                    setEmail("");
                    isAutoFilled.current = false;
                }
                setIsCheckingNik(false);
            } else if (cleanNik.length < 16) {
                if (isAutoFilled.current) {
                    setFullName("");
                    setPhone("");
                    setEmail("");
                    isAutoFilled.current = false;
                }
                lastCheckedNik.current = "";
            }
        };
        
        const timeoutId = setTimeout(checkNik, 500);
        return () => clearTimeout(timeoutId);
    }, [nik]);

    // Group size handler
    const handleGroupSizeChange = (newSize: number) => {
        if (newSize < 1) return;
        setGroupSize(newSize);
        
        const expectedMembersCount = newSize - 1;
        
        if (members.length < expectedMembersCount) {
            const newMembers = [...members];
            for (let i = members.length; i < expectedMembersCount; i++) {
                newMembers.push({ name: "" });
            }
            setMembers(newMembers);
        } else if (members.length > expectedMembersCount) {
            setMembers(members.slice(0, expectedMembersCount));
        }
    };

    const handleMemberNameChange = (index: number, value: string) => {
        const newMembers = [...members];
        newMembers[index].name = value;
        setMembers(newMembers);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (!selectedDate) {
            setVisitDate("");
            return;
        }
        
        const dateObj = new Date(selectedDate);
        const day = dateObj.getDay();
        
        if (day === 0 || day === 6) {
            setValidationErrors(prev => ({
                ...prev,
                visit_date: ["Tanggal kunjungan tidak bisa pada hari Sabtu atau Minggu."]
            }));
            setVisitDate(selectedDate);
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.visit_date;
                return newErrors;
            });
            setVisitDate(selectedDate);
        }
    };

    const validateStep1 = () => {
        const localErrors: ApiValidationError = {};
        const cleanNik = nik.replace(/\D/g, '');
        if (cleanNik.length !== 16) {
            localErrors.nik = ["NIK harus berisi tepat 16 digit angka."];
        }
        if (!fullName.trim()) {
            localErrors.full_name = ["Nama lengkap wajib diisi."];
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) {
            localErrors.phone = ["Nomor WhatsApp wajib diisi."];
        }
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
            localErrors.email = ["Alamat email tidak valid."];
        }

        if (Object.keys(localErrors).length > 0) {
            setValidationErrors(localErrors);
            return false;
        }
        setValidationErrors({});
        return true;
    };

    const validateStep2 = () => {
        const localErrors: ApiValidationError = {};
        if (!serviceId) {
            localErrors.service_id = ["Layanan kunjungan harus dipilih."];
        }
        if (!visitDate) {
            localErrors.visit_date = ["Tanggal kunjungan wajib diisi."];
        } else {
            const dateObj = new Date(visitDate);
            const day = dateObj.getDay();
            if (day === 0 || day === 6) {
                localErrors.visit_date = ["Tanggal kunjungan tidak bisa pada hari Sabtu atau Minggu."];
            }
        }
        
        let membersValid = true;
        if (groupSize > 1) {
            members.forEach((m, idx) => {
                if (!m.name.trim()) {
                    localErrors[`members.${idx}.name`] = ["Nama anggota wajib diisi."];
                    membersValid = false;
                }
            });
        }

        if (Object.keys(localErrors).length > 0) {
            setValidationErrors(localErrors);
            return false;
        }
        setValidationErrors({});
        return true;
    };

    const [isStepTransition, setIsStepTransition] = useState(false);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
                scrollToTop();
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                setIsStepTransition(true);
                setCurrentStep(3);
                scrollToTop();
                setTimeout(() => setIsStepTransition(false), 500);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            scrollToTop();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (currentStep !== 3) return; 

        setIsSubmitting(true);
        setGlobalError(null);

        const payload: VisitPayload = {
            full_name: fullName,
            nik: nik.replace(/\D/g, ''),
            phone: phone.replace(/\D/g, ''),
            email,
            group_size: groupSize,
            members: groupSize > 1 ? members : [],
            visit_date: visitDate,
            service_id: Number(serviceId)
        };

        const result = await submitVisitAction(payload);

        if (result.success && result.data) {
            try {
                const qrUrl = await QRCode.toDataURL(result.data.qr_token, {
                    width: 300,
                    margin: 1,
                    errorCorrectionLevel: 'M',
                    color: { dark: '#000000', light: '#ffffff' }
                });

                setSuccessData({
                    visitorCode: result.data.visitor_code,
                    visitNumber: result.data.visit_number,
                    qrDataUrl: qrUrl
                });
                scrollToTop();
            } catch (_qrError) {
                setGlobalError("Kunjungan berhasil dicatat, namun gagal membuat gambar QR Code.");
                setIsSubmitting(false);
            }
        } else {
            if (result.status === 429) {
                setGlobalError("Terlalu banyak permintaan, mohon tunggu sebentar.");
            } else if (result.status === 422 && result.validationErrors) {
                setValidationErrors(result.validationErrors);
                setGlobalError("Silakan periksa kembali data isian Anda.");
            } else {
                setGlobalError(result.error || "Gagal memproses pendaftaran. Silakan coba lagi.");
            }
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="flex justify-center items-center py-10 px-4">
                <TicketCard 
                    visitorCode={successData.visitorCode}
                    visitNumber={successData.visitNumber}
                    fullName={fullName}
                    visitDate={visitDate}
                    qrDataUrl={successData.qrDataUrl}
                    closeText="KEMBALI KE BERANDA"
                    isSearch={false}
                    onClose={() => router.push("/")}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* BACK BUTTON */}
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Kembali ke Beranda
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden">
                <div className="bg-primary-dark px-6 sm:px-8 py-8 sm:py-10 text-white relative overflow-hidden rounded-t-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary opacity-20 rounded-full blur-2xl pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col justify-center h-full">
                        <h2 className="text-[22px] leading-tight sm:text-3xl font-extrabold mb-1 sm:mb-2 tracking-tight">
                            Registrasi Kunjungan
                        </h2>
                        <p className="text-gray-100 text-[13px] sm:text-base leading-relaxed opacity-95 max-w-2xl">
                            Mohon lengkapi data diri dan keperluan kunjungan Anda.
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8 md:p-10">
                    
                    {/* STEPPER UI */}
                    <div className="mb-8">
                        {/* Mobile Stepper */}
                        <div className="sm:hidden mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Langkah {currentStep} dari 3</p>
                            <h3 className="text-lg font-bold text-primary-dark">
                                {currentStep === 1 && "Data Diri"}
                                {currentStep === 2 && "Detail Kunjungan"}
                                {currentStep === 3 && "Konfirmasi"}
                            </h3>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                                <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Desktop Stepper */}
                        <div className="hidden sm:flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-gray-200 before:z-0">
                            {[
                                { num: 1, label: "Data Diri", icon: <User className="w-5 h-5" /> },
                                { num: 2, label: "Detail Kunjungan", icon: <Calendar className="w-5 h-5" /> },
                                { num: 3, label: "Konfirmasi", icon: <CheckCircle2 className="w-5 h-5" /> }
                            ].map((step) => (
                                <div key={step.num} className="relative z-10 flex flex-col items-center bg-white px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border-2 
                                        ${currentStep > step.num ? 'bg-primary border-primary text-white' : 
                                          currentStep === step.num ? 'bg-white border-primary text-primary' : 
                                          'bg-white border-gray-300 text-gray-400'}`}>
                                        {currentStep > step.num ? <Check className="w-5 h-5" /> : step.icon}
                                    </div>
                                    <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {globalError && (
                        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <h3 className="font-semibold text-red-800">Terdapat Kesalahan</h3>
                                <p className="text-sm mt-1">{globalError}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* STEP 1: DATA DIRI */}
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><User className="w-5 h-5" /></span>
                                    Data Pengunjung Utama
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="nik" className="text-sm font-bold text-gray-700 flex justify-between items-center">
                                            <span>Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span></span>
                                            <div className="w-4 h-4 flex-shrink-0 ml-2">
                                                {isCheckingNik && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                            </div>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input 
                                                id="nik"
                                                type="text" 
                                                value={nik}
                                                onChange={(e) => {
                                                    setNik(e.target.value.replace(/\D/g, ''));
                                                    if (validationErrors.nik) {
                                                        setValidationErrors(prev => { const n = {...prev}; delete n.nik; return n; });
                                                    }
                                                }}
                                                maxLength={16}
                                                placeholder="16 Digit Angka NIK"
                                                required={currentStep === 1}
                                                className={`w-full pl-10 pr-4 py-3 border ${(validationErrors.nik || (nik.length > 0 && nik.length < 16)) ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-xl focus:outline-none focus:ring-2 shadow-sm text-sm`}
                                            />
                                            
                                            {/* Error Message placed absolutely so it doesn't affect the grid layout gap */}
                                            <div className="absolute -bottom-5 left-0 w-full">
                                                {validationErrors.nik ? (
                                                    <p className="text-red-500 text-[11px] sm:text-xs font-medium truncate">{validationErrors.nik[0]}</p>
                                                ) : nik.length > 0 && nik.length < 16 ? (
                                                    <p className="text-red-500 text-[11px] sm:text-xs font-medium truncate">
                                                        NIK harus 16 digit (kurang {16 - nik.length} digit).
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="fullName" className="text-sm font-bold text-gray-700">Nama Lengkap Sesuai KTP <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input 
                                                id="fullName"
                                                type="text" 
                                                value={fullName}
                                                onChange={(e) => {
                                                    setFullName(e.target.value);
                                                    if (validationErrors.full_name) {
                                                        setValidationErrors(prev => { const n = {...prev}; delete n.full_name; return n; });
                                                    }
                                                }}
                                                maxLength={100}
                                                placeholder="Contoh: Budi Santoso"
                                                required={currentStep === 1}
                                                className={`w-full pl-10 pr-4 py-3 border ${validationErrors.full_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-xl focus:outline-none focus:ring-2 shadow-sm text-sm`}
                                            />
                                        </div>
                                        {validationErrors.full_name && (
                                            <p className="text-red-500 text-xs font-medium mt-1">{validationErrors.full_name[0]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-bold text-gray-700">Nomor WhatsApp / HP <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input 
                                                id="phone"
                                                type="tel" 
                                                value={phone}
                                                onChange={(e) => {
                                                    setPhone(e.target.value.replace(/\D/g, ''));
                                                    if (validationErrors.phone) {
                                                        setValidationErrors(prev => { const n = {...prev}; delete n.phone; return n; });
                                                    }
                                                }}
                                                maxLength={20}
                                                placeholder="Contoh: 08123456789"
                                                required={currentStep === 1}
                                                className={`w-full pl-10 pr-4 py-3 border ${validationErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-xl focus:outline-none focus:ring-2 shadow-sm text-sm`}
                                            />
                                        </div>
                                        {validationErrors.phone && (
                                            <p className="text-red-500 text-xs font-medium mt-1">{validationErrors.phone[0]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-bold text-gray-700">Alamat Email <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input 
                                                id="email"
                                                type="email" 
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (validationErrors.email) {
                                                        setValidationErrors(prev => { const n = {...prev}; delete n.email; return n; });
                                                    }
                                                }}
                                                maxLength={150}
                                                placeholder="Contoh: email@domain.com"
                                                required={currentStep === 1}
                                                className={`w-full pl-10 pr-4 py-3 border ${validationErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-xl focus:outline-none focus:ring-2 shadow-sm text-sm`}
                                            />
                                        </div>
                                        {validationErrors.email && (
                                            <p className="text-red-500 text-xs font-medium mt-1">{validationErrors.email[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DETAIL KUNJUNGAN */}
                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><Calendar className="w-5 h-5" /></span>
                                    Detail Kunjungan
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Keperluan Layanan <span className="text-red-500">*</span></label>
                                        <div className="relative" ref={serviceDropdownRef}>
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => !isLoadingServices && setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                                                disabled={isLoadingServices}
                                                className={`w-full pl-10 pr-10 py-3 border ${validationErrors.service_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-primary hover:border-gray-400'} ${isServiceDropdownOpen ? 'border-primary ring-2 ring-primary/20' : ''} rounded-xl focus:outline-none text-sm text-left flex items-center justify-between transition-colors bg-white shadow-sm font-medium ${!serviceId ? 'text-gray-500' : 'text-gray-900'} disabled:opacity-70 disabled:cursor-not-allowed`}
                                            >
                                                <span className="truncate">
                                                    {serviceId ? services.find(s => s.id === serviceId)?.name : "-- Pilih Layanan --"}
                                                </span>
                                            </button>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                                                {isLoadingServices ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                                                )}
                                            </div>

                                            {isServiceDropdownOpen && !isLoadingServices && (
                                                <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                    <ul className="max-h-60 overflow-y-auto p-2 space-y-1" role="listbox">
                                                        {services.map(s => (
                                                            <li key={s.id} role="option" aria-selected={serviceId === s.id}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setServiceId(s.id);
                                                                        setIsServiceDropdownOpen(false);
                                                                        if (validationErrors.service_id) {
                                                                            setValidationErrors(prev => { const n = {...prev}; delete n.service_id; return n; });
                                                                        }
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group active:scale-[0.99]
                                                                        ${serviceId === s.id ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'text-gray-700 hover:bg-primary/10 hover:text-primary active:bg-primary/20 font-medium'}`}
                                                                >
                                                                    <span className="truncate pr-2 whitespace-normal leading-snug">{s.name}</span>
                                                                    {serviceId === s.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        {validationErrors.service_id && (
                                            <p className="text-red-500 text-xs font-medium mt-1">{validationErrors.service_id[0]}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="visitDate" className="text-sm font-bold text-gray-700">Tanggal Kunjungan <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Calendar className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input 
                                                id="visitDate"
                                                type="date" 
                                                value={visitDate}
                                                onChange={handleDateChange}
                                                min={minDate}
                                                required={currentStep === 2}
                                                className={`w-full pl-10 pr-4 py-3 border ${validationErrors.visit_date ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-xl focus:outline-none focus:ring-2 shadow-sm text-sm bg-white`}
                                            />
                                        </div>
                                        {validationErrors.visit_date && (
                                            <p className="text-red-500 text-xs font-medium mt-1">{validationErrors.visit_date[0]}</p>
                                        )}
                                        <div className="mt-2 bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                                            <div className="font-semibold mb-1 flex items-center gap-1.5">
                                                <AlertCircle className="w-3.5 h-3.5" /> Informasi Layanan:
                                            </div>
                                            <ul className="list-disc pl-5 space-y-0.5 opacity-90">
                                                <li>Tidak beroperasi pada hari Sabtu, Minggu & Libur Nasional.</li>
                                                <li>Senin - Kamis: 08.00 - 16.30 WIB</li>
                                                <li>Jumat: 07.30 - 16.30 WIB</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-5 mt-2 gap-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><Users className="w-5 h-5" /></span>
                                        Data Rombongan
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <label htmlFor="groupSize" className="text-sm font-bold text-gray-700 whitespace-nowrap">Total Orang:</label>
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white h-10 shadow-sm">
                                            <button 
                                                type="button" 
                                                onClick={() => handleGroupSizeChange(groupSize - 1)}
                                                disabled={groupSize <= 1}
                                                className="px-3 h-full hover:bg-gray-100 disabled:opacity-50 transition-colors border-r border-gray-200 text-gray-600"
                                            >
                                                <MinusCircle className="w-4 h-4" />
                                            </button>
                                            <input 
                                                id="groupSize"
                                                type="number"
                                                min="1"
                                                value={groupSize}
                                                onChange={(e) => handleGroupSizeChange(Number(e.target.value) || 1)}
                                                className="w-14 text-center text-sm font-bold focus:outline-none appearance-none"
                                                style={{ MozAppearance: 'textfield' }}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => handleGroupSizeChange(groupSize + 1)}
                                                className="px-3 h-full hover:bg-gray-100 transition-colors border-l border-gray-200 text-gray-600"
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {groupSize > 1 && (
                                    <div className="bg-gray-50/80 p-5 sm:p-6 rounded-xl border border-gray-200 shadow-inner space-y-4">
                                        <p className="text-sm text-gray-600 mb-4 font-medium flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-accent" />
                                            Silakan lengkapi nama anggota rombongan Anda (Tidak termasuk pengunjung utama).
                                        </p>
                                        {members.map((member, index) => {
                                            const errorKey = `members.${index}.name`;
                                            const hasError = validationErrors[errorKey];
                                            return (
                                                <div key={index} className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm flex-shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) => {
                                                                handleMemberNameChange(index, e.target.value);
                                                                if (hasError) {
                                                                    setValidationErrors(prev => { const n = {...prev}; delete n[errorKey]; return n; });
                                                                }
                                                            }}
                                                            placeholder="Nama Anggota Rombongan"
                                                            required={currentStep === 2}
                                                            className={`flex-grow px-4 py-2.5 border ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'} rounded-xl focus:outline-none focus:ring-2 shadow-sm text-sm bg-white`}
                                                        />
                                                    </div>
                                                    {hasError && (
                                                        <p className="text-red-500 text-xs font-medium ml-11 mt-1">{hasError[0]}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: KONFIRMASI REVIEW */}
                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                                    <span className="bg-primary/10 text-primary p-1.5 rounded-lg"><CheckCircle2 className="w-5 h-5" /></span>
                                    Konfirmasi Kunjungan
                                </h3>
                                
                                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-5 sm:p-6 space-y-6">
                                        
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Data Pengunjung</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">NIK</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{nik}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Nama Lengkap</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{fullName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">No. WhatsApp</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Detail Kunjungan</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Keperluan Layanan</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{services.find(s => s.id === serviceId)?.name || "-"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Tanggal Kunjungan</p>
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        {visitDate ? new Date(visitDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Jumlah Orang</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{groupSize} Orang</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Anggota Rombongan</h4>
                                            {groupSize > 1 ? (
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {members.map((m, idx) => (
                                                        <li key={idx} className="text-sm font-semibold text-gray-900">{m.name}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm italic text-gray-500">Tidak ada anggota rombongan</p>
                                            )}
                                        </div>
                                        
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Pastikan semua data sudah benar sebelum mengirimkan pendaftaran.
                                </p>
                            </div>
                        )}

                        {/* NAVIGATION BUTTONS */}
                        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    Kembali
                                </button>
                            ) : (
                                <div className="hidden sm:block"></div>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full sm:w-auto bg-primary-dark hover:bg-primary text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary-dark/20 transition-colors"
                                >
                                    Selanjutnya
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isStepTransition}
                                    className="w-full sm:w-auto bg-primary-dark hover:bg-primary text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary-dark/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2 flex-shrink-0" />
                                            <span className="whitespace-nowrap text-sm sm:text-base">Sedang Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="whitespace-nowrap text-sm sm:text-base">DAPATKAN TIKET KUNJUNGAN</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
