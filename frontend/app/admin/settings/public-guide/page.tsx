"use client";

import { useState, useTransition, useEffect } from "react";
import { getSettingsAction, updatePublicGuideAction } from "../actions";
import Swal from "sweetalert2";
import { Loader2, FileText, UploadCloud, Save, MonitorPlay } from "lucide-react";

export default function PublicGuideSettingsPage() {
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    
    // Form State
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        async function fetchSettings() {
            const data = await getSettingsAction();
            if (data.tutorial_youtube_url) {
                setYoutubeUrl(data.tutorial_youtube_url);
            }
            setIsLoading(false);
        }
        fetchSettings();
    }, []);

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran file PDF maksimal 10MB', 'error');
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSubmitPdf = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!pdfFile) {
             Swal.fire('Peringatan', 'Silakan pilih file PDF terlebih dahulu', 'warning');
             return;
        }

        const formData = new FormData();
        formData.append('form_type', 'pdf');
        formData.append('welcome_pdf', pdfFile);

        startTransition(async () => {
            const result = await updatePublicGuideAction(formData);
            if (result.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: result.message,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    Swal.fire('Gagal', result.message, 'error');
                }
            }
        });
    };

    const handleSubmitYoutube = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!youtubeUrl) {
             Swal.fire('Peringatan', 'URL YouTube tidak boleh kosong', 'warning');
             return;
        }

        const formData = new FormData();
        formData.append('form_type', 'youtube');
        formData.append('tutorial_youtube_url', youtubeUrl);

        startTransition(async () => {
            const result = await updatePublicGuideAction(formData);
            if (result.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: result.message,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            } else {
                if (result.errors) {
                    setErrors(result.errors);
                } else {
                    Swal.fire('Gagal', result.message, 'error');
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#11522A]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Buku Panduan Publik</h1>
                <p className="text-sm text-gray-500 mt-1">Unggah file PDF buku panduan yang akan muncul di modal panduan untuk pengunjung.</p>
            </div>

            <div className="space-y-8">
                {/* PDF Section */}
                <form onSubmit={handleSubmitPdf} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-red-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">File Buku Panduan (PDF)</h2>
                            <p className="text-xs text-gray-500">Maksimal ukuran file: 10MB.</p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex flex-col gap-6">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih File PDF</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-red-500 transition-colors bg-gray-50">
                                    {pdfFile ? (
                                        <div className="space-y-2 text-center flex flex-col items-center">
                                            <FileText className="mx-auto h-10 w-10 text-emerald-500" />
                                            <p className="text-sm font-semibold text-gray-900">{pdfFile.name}</p>
                                            <p className="text-xs text-gray-500">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            <div className="flex text-sm text-gray-600 justify-center mt-2">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none px-3 py-1 shadow-sm border border-gray-200">
                                                    <span>Ganti File PDF</span>
                                                    <input id="welcome_pdf" name="welcome_pdf" type="file" className="sr-only" accept="application/pdf" onChange={handlePdfChange} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center flex flex-col items-center">
                                            <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none px-4 py-1.5 shadow-sm border border-gray-200">
                                                    <span>Pilih File PDF</span>
                                                    <input id="welcome_pdf" name="welcome_pdf" type="file" className="sr-only" accept="application/pdf" onChange={handlePdfChange} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">Maks 10MB. Hanya format PDF (.pdf)</p>
                                        </div>
                                    )}
                                </div>
                                {errors.welcome_pdf && (
                                    <p className="mt-2 text-sm text-red-600">{errors.welcome_pdf[0]}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#11522A] hover:bg-[#085C3B] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Simpan Buku Panduan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* YouTube URL Section */}
                <form onSubmit={handleSubmitYoutube} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <MonitorPlay className="w-5 h-5 text-red-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Video Cara Berkunjung</h2>
                            <p className="text-xs text-gray-500">Video YouTube ini akan ditampilkan di halaman utama (Beranda).</p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL Video YouTube</label>
                            <input 
                                type="url" 
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="Contoh: https://www.youtube.com/watch?v=..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">Pastikan video bersifat Publik atau Unlisted.</p>
                            {errors.tutorial_youtube_url && (
                                <p className="mt-2 text-sm text-red-600">{errors.tutorial_youtube_url[0]}</p>
                            )}
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#11522A] hover:bg-[#085C3B] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Simpan URL Video</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
