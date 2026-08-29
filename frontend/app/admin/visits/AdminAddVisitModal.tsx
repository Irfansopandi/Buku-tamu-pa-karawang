"use client";

import { useState, useEffect, useRef } from "react";
import { Service, VisitPayload, ApiValidationError } from "../../../lib/types";
import { fetchServicesAction, checkNikAction, submitVisitAction } from "../../../lib/public-actions";
import { X, Loader2, PlusCircle, MinusCircle, User, Phone, Mail, CreditCard, Calendar, Briefcase, Users } from "lucide-react";
import Swal from "sweetalert2";

interface AdminAddVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminAddVisitModal({ isOpen, onClose, onSuccess }: AdminAddVisitModalProps) {
    const [fullName, setFullName] = useState("");
    const [nik, setNik] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [serviceId, setServiceId] = useState<number | "">("");
    const [visitDate, setVisitDate] = useState("");
    const [groupSize, setGroupSize] = useState<number>(1);
    const [members, setMembers] = useState<{name: string}[]>([]);
    
    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [isCheckingNik, setIsCheckingNik] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ApiValidationError>({});
    
    const lastCheckedNik = useRef<string>("");
    const isAutoFilled = useRef<boolean>(false);
    
    const [minDate, setMinDate] = useState("");

    useEffect(() => {
        if (!isOpen) return;
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

        const loadServices = async () => {
            setIsLoadingServices(true);
            const result = await fetchServicesAction();
            if (result.success && result.data) setServices(result.data);
            setIsLoadingServices(false);
        };
        loadServices();
        
        // Reset form
        setFullName("");
        setNik("");
        setPhone("");
        setEmail("");
        setServiceId("");
        setVisitDate("");
        setGroupSize(1);
        setMembers([]);
        setValidationErrors({});
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const checkNik = async () => {
            const cleanNik = nik.replace(/\D/g, '');
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
    }, [nik, isOpen]);

    const handleGroupSizeChange = (newSize: number) => {
        if (newSize < 1) return;
        setGroupSize(newSize);
        const expectedMembersCount = newSize - 1;
        if (members.length < expectedMembersCount) {
            const newMembers = [...members];
            for (let i = members.length; i < expectedMembersCount; i++) newMembers.push({ name: "" });
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
            setValidationErrors(prev => ({ ...prev, visit_date: ["Tanggal kunjungan tidak bisa pada hari Sabtu atau Minggu."] }));
            setVisitDate(selectedDate);
        } else {
            setValidationErrors(prev => { const newErrors = { ...prev }; delete newErrors.visit_date; return newErrors; });
            setVisitDate(selectedDate);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationErrors({});
        
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
        setIsSubmitting(false);

        if (result.success && result.data) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Data kunjungan berhasil ditambahkan!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            onSuccess();
        } else {
            if (result.status === 422 && result.validationErrors) {
                setValidationErrors(result.validationErrors);
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: result.error || 'Gagal menyimpan data.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
                    <h3 className="font-bold text-gray-900">Tambah Data Kunjungan</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form id="addVisitForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 flex justify-between">
                                    <span>NIK <span className="text-red-500">*</span></span>
                                    {isCheckingNik && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CreditCard className="h-4 w-4 text-gray-400" /></div>
                                    <input type="text" value={nik} onChange={e => { setNik(e.target.value.replace(/\D/g, '')); setValidationErrors(prev => { const n = {...prev}; delete n.nik; return n; }) }} maxLength={16} required placeholder="16 Digit NIK" className={`w-full pl-9 pr-3 py-2 border ${validationErrors.nik ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500`} />
                                </div>
                                {validationErrors.nik && <p className="text-red-500 text-xs mt-1">{validationErrors.nik[0]}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                                    <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); setValidationErrors(prev => { const n = {...prev}; delete n.full_name; return n; }) }} required placeholder="Nama Sesuai KTP" className={`w-full pl-9 pr-3 py-2 border ${validationErrors.full_name ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500`} />
                                </div>
                                {validationErrors.full_name && <p className="text-red-500 text-xs mt-1">{validationErrors.full_name[0]}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">No. WhatsApp <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                                    <input type="tel" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setValidationErrors(prev => { const n = {...prev}; delete n.phone; return n; }) }} required placeholder="Contoh: 0812345678" className={`w-full pl-9 pr-3 py-2 border ${validationErrors.phone ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500`} />
                                </div>
                                {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone[0]}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setValidationErrors(prev => { const n = {...prev}; delete n.email; return n; }) }} required placeholder="email@domain.com" className={`w-full pl-9 pr-3 py-2 border ${validationErrors.email ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500`} />
                                </div>
                                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email[0]}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Layanan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-4 w-4 text-gray-400" /></div>
                                    <select value={serviceId} onChange={e => { setServiceId(Number(e.target.value)); setValidationErrors(prev => { const n = {...prev}; delete n.service_id; return n; }) }} required disabled={isLoadingServices} className={`w-full pl-9 pr-3 py-2 border ${validationErrors.service_id ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white`}>
                                        <option value="" disabled>-- Pilih Layanan --</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                {validationErrors.service_id && <p className="text-red-500 text-xs mt-1">{validationErrors.service_id[0]}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Tanggal Kunjungan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-gray-400" /></div>
                                    <input type="date" value={visitDate} onChange={handleDateChange} min={minDate} required className={`w-full pl-9 pr-3 py-2 border ${validationErrors.visit_date ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white`} />
                                </div>
                                {validationErrors.visit_date && <p className="text-red-500 text-xs mt-1">{validationErrors.visit_date[0]}</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" /> Data Rombongan
                                </label>
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white h-8 shadow-sm">
                                    <button type="button" onClick={() => handleGroupSizeChange(groupSize - 1)} disabled={groupSize <= 1} className="px-2 hover:bg-gray-100 disabled:opacity-50 transition-colors border-r border-gray-200 text-gray-600"><MinusCircle className="w-4 h-4" /></button>
                                    <input type="number" min="1" value={groupSize} onChange={(e) => handleGroupSizeChange(Number(e.target.value) || 1)} className="w-10 text-center text-sm font-bold focus:outline-none" />
                                    <button type="button" onClick={() => handleGroupSizeChange(groupSize + 1)} className="px-2 hover:bg-gray-100 transition-colors border-l border-gray-200 text-gray-600"><PlusCircle className="w-4 h-4" /></button>
                                </div>
                            </div>
                            
                            {groupSize > 1 && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                    {members.map((member, index) => {
                                        const errorKey = `members.${index}.name`;
                                        const hasError = validationErrors[errorKey];
                                        return (
                                            <div key={index}>
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-white border border-gray-200 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{index + 1}</div>
                                                    <input type="text" value={member.name} onChange={e => { handleMemberNameChange(index, e.target.value); if (hasError) setValidationErrors(prev => { const n = {...prev}; delete n[errorKey]; return n; }) }} placeholder="Nama Anggota Rombongan" required className={`flex-grow px-3 py-1.5 border ${hasError ? 'border-red-300' : 'border-gray-200 focus:border-green-500'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white`} />
                                                </div>
                                                {hasError && <p className="text-red-500 text-xs ml-9 mt-1">{hasError[0]}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </form>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 flex-shrink-0">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Batal
                    </button>
                    <button type="submit" form="addVisitForm" disabled={isSubmitting} className="px-4 py-2 bg-[#085C3B] text-white text-sm font-medium rounded-xl hover:bg-[#06422a] transition-colors disabled:opacity-50 flex items-center gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Kunjungan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
