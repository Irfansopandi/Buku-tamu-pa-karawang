"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { ApiError, Service, VisitPayload, Member } from "../../lib/types";
import QRCode from "qrcode";
import Image from "next/image";

export default function GuestFormPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [serviceError, setServiceError] = useState<string | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    const [successData, setSuccessData] = useState<{
        visitor_code: string;
        visit_number: string;
        qrDataUrl: string;
    } | null>(null);

    // Form state
    const [fullName, setFullName] = useState("");
    const [nik, setNik] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [groupSize, setGroupSize] = useState("1");
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await fetchApi('/api/services');
                setServices(response.data || []);
            } catch (err: unknown) {
                if (err instanceof ApiError) {
                    setServiceError(err.message);
                } else if (err instanceof Error) {
                    setServiceError(err.message);
                } else {
                    setServiceError("Failed to load services");
                }
            } finally {
                setLoadingServices(false);
            }
        };

        loadServices();
    }, []);

    const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
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
        const val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
        if (val.length <= 16) {
            setNik(val);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, ''); // Numbers only
        setPhone(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setSubmitError(null);
        setValidationErrors({});

        const payload: VisitPayload = {
            full_name: fullName,
            nik,
            phone,
            email,
            visit_date: visitDate,
            service_id: parseInt(serviceId),
            group_size: parseInt(groupSize) || 1,
            members
        };

        try {
            const response = await fetchApi('/api/visits', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Generate QR Code containing ONLY qr_token
            const qrToken = response.data.qr_token;
            const qrDataUrl = await QRCode.toDataURL(qrToken, {
                width: 256,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            setSuccessData({
                visitor_code: response.data.visitor_code,
                visit_number: response.data.visit_number,
                qrDataUrl
            });
            
            // Clear form state, avoiding PII caching
            setFullName("");
            setNik("");
            setPhone("");
            setEmail("");
            setVisitDate("");
            setServiceId("");
            setGroupSize("1");
            setMembers([]);

        } catch (err: unknown) {
            if (err instanceof ApiError) {
                if (err.status === 422 && err.errors) {
                    setValidationErrors(err.errors);
                    setSubmitError(err.message);
                } else {
                    setSubmitError(err.message);
                }
            } else if (err instanceof Error) {
                setSubmitError(err.message);
            } else {
                setSubmitError("An unexpected error occurred");
            }
        } finally {
            setFormLoading(false);
        }
    };

    const getErrorForField = (field: string) => {
        return validationErrors[field] ? validationErrors[field][0] : null;
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                    <h2 className="text-2xl font-semibold text-green-600 mb-2">Visit Created Successfully</h2>
                    <p className="text-gray-600 mb-6">Please save this QR Code for check-in.</p>
                    
                    <div className="flex justify-center mb-6">
                        <Image src={successData.qrDataUrl} alt="QR Code" width={200} height={200} className="border p-2 rounded-md" />
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-4 space-y-2 mb-6 text-left">
                        <div>
                            <span className="text-sm text-gray-500 block">Visitor Code</span>
                            <span className="font-mono font-medium text-gray-900">{successData.visitor_code}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Visit Number</span>
                            <span className="font-mono font-medium text-gray-900">{successData.visit_number}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setSuccessData(null)}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Register Another Visit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Buku Tamu</h1>
                        <h2 className="text-lg text-gray-600">Pengadilan Agama Karawang</h2>
                    </div>

                    {submitError && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{submitError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Identity Section */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                            <h3 className="text-md font-medium text-gray-900 border-b pb-2">Visitor Identity</h3>
                            
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="full_name" required value={fullName} onChange={e => setFullName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {getErrorForField('full_name') && <p className="mt-1 text-sm text-red-600">{getErrorForField('full_name')}</p>}
                            </div>

                            <div>
                                <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK (16 Digits)</label>
                                <input type="text" id="nik" required value={nik} onChange={handleNikChange} minLength={16} maxLength={16}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {getErrorForField('nik') && <p className="mt-1 text-sm text-red-600">{getErrorForField('nik')}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" id="phone" required value={phone} onChange={handlePhoneChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {getErrorForField('phone') && <p className="mt-1 text-sm text-red-600">{getErrorForField('phone')}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {getErrorForField('email') && <p className="mt-1 text-sm text-red-600">{getErrorForField('email')}</p>}
                            </div>
                        </div>

                        {/* Visit Details Section */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-4">
                            <h3 className="text-md font-medium text-gray-900 border-b pb-2">Visit Details</h3>

                            <div>
                                <label htmlFor="service_id" className="block text-sm font-medium text-gray-700">Service</label>
                                {loadingServices ? (
                                    <p className="mt-1 text-sm text-gray-500">Loading services...</p>
                                ) : serviceError ? (
                                    <p className="mt-1 text-sm text-red-600">{serviceError}</p>
                                ) : services.length === 0 ? (
                                    <p className="mt-1 text-sm text-gray-500">No services available.</p>
                                ) : (
                                    <select id="service_id" required value={serviceId} onChange={e => setServiceId(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option value="">-- Select a Service --</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                )}
                                {getErrorForField('service_id') && <p className="mt-1 text-sm text-red-600">{getErrorForField('service_id')}</p>}
                            </div>

                            <div>
                                <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700">Visit Date</label>
                                <input type="date" id="visit_date" required value={visitDate} onChange={e => setVisitDate(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {getErrorForField('visit_date') && <p className="mt-1 text-sm text-red-600">{getErrorForField('visit_date')}</p>}
                            </div>

                            <div>
                                <label htmlFor="group_size" className="block text-sm font-medium text-gray-700">Group Size</label>
                                <input type="number" id="group_size" required min="1" value={groupSize} onChange={handleGroupSizeChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {getErrorForField('group_size') && <p className="mt-1 text-sm text-red-600">{getErrorForField('group_size')}</p>}
                            </div>

                            {members.map((member, idx) => (
                                <div key={idx} className="pt-2">
                                    <label htmlFor={`member_${idx}`} className="block text-sm font-medium text-gray-700">Member {idx + 1} Name</label>
                                    <input type="text" id={`member_${idx}`} required value={member.name} onChange={e => handleMemberChange(idx, e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                    {getErrorForField(`members.${idx}.name`) && <p className="mt-1 text-sm text-red-600">{getErrorForField(`members.${idx}.name`)}</p>}
                                </div>
                            ))}
                        </div>

                        <div>
                            <button type="submit" disabled={formLoading || loadingServices}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                {formLoading ? 'Submitting...' : 'Register Visit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
