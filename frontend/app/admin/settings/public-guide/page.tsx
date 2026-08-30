"use client";

import { useState, useTransition, useEffect } from "react";
import { getSettingsAction, updatePublicGuideAction } from "../actions";
import Swal from "sweetalert2";
import { Loader2, Image as ImageIcon, Video, MonitorPlay, UploadCloud, Save } from "lucide-react";

export default function PublicGuideSettingsPage() {
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    
    // Form State
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoType, setVideoType] = useState<'upload' | 'youtube'>('youtube');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        async function fetchSettings() {
            const data = await getSettingsAction();
            if (data.welcome_image) setImagePreview(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + data.welcome_image);
            if (data.welcome_video_type) setVideoType(data.welcome_video_type as 'upload' | 'youtube');
            if (data.welcome_video_url) {
                if (data.welcome_video_type === 'youtube') {
                    setVideoUrl(data.welcome_video_url);
                }
            }
            setIsLoading(false);
        }
        fetchSettings();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran gambar maksimal 5MB', 'error');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran video maksimal 50MB', 'error');
                return;
            }
            setVideoFile(file);
        }
    };

    const handleSubmitImage = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData();
        formData.append('form_type', 'image');
        if (imageFile) formData.append('welcome_image', imageFile);

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

    const handleSubmitVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData();
        formData.append('form_type', 'video');
        formData.append('welcome_video_type', videoType);
        
        if (videoType === 'upload' && videoFile) {
            formData.append('welcome_video_file', videoFile);
        } else if (videoType === 'youtube' && videoUrl) {
            formData.append('welcome_video_url', videoUrl);
        }

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
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panduan Publik</h1>
                <p className="text-sm text-gray-500 mt-1">Atur gambar dan video panduan yang akan muncul di halaman awal pengunjung (Welcome Modal).</p>
            </div>

            <div className="space-y-8">
                {/* Image Section */}
                <form onSubmit={handleSubmitImage} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Gambar Infografis</h2>
                            <p className="text-xs text-gray-500">Maks 5MB. Format: JPG, PNG, WEBP</p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Gambar</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-emerald-500 transition-colors bg-gray-50">
                                    <div className="space-y-2 text-center">
                                        <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none px-2 py-1 shadow-sm border border-gray-200">
                                                <span>Upload a file</span>
                                                <input id="welcome_image" name="welcome_image" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                                {errors.welcome_image && (
                                    <p className="mt-2 text-sm text-red-600">{errors.welcome_image[0]}</p>
                                )}
                            </div>
                            <div className="w-full md:w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                                <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-gray-400 text-sm text-center">Belum ada gambar</div>
                                    )}
                                </div>
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
                                    <span>Simpan Gambar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Video Section */}
                <form onSubmit={handleSubmitVideo} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <Video className="w-5 h-5 text-red-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Video Panduan</h2>
                            <p className="text-xs text-gray-500">Disarankan menggunakan YouTube untuk menghemat penyimpanan server.</p>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex gap-4 mb-6">
                            <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all flex-1 ${videoType === 'youtube' ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="videoType" value="youtube" className="sr-only" checked={videoType === 'youtube'} onChange={() => setVideoType('youtube')} />
                                <MonitorPlay className="w-5 h-5" /> Link YouTube
                            </label>
                            <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all flex-1 ${videoType === 'upload' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="videoType" value="upload" className="sr-only" checked={videoType === 'upload'} onChange={() => setVideoType('upload')} />
                                <UploadCloud className="w-5 h-5" /> Upload File (MP4)
                            </label>
                        </div>

                        {videoType === 'youtube' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Video YouTube</label>
                                <input 
                                    type="url" 
                                    value={videoUrl || ''}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="Contoh: https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">Pastikan video bersifat Publik atau Unlisted.</p>
                                {errors.welcome_video_url && (
                                    <p className="mt-2 text-sm text-red-600">{errors.welcome_video_url[0]}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File Video</label>
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/webm"
                                    onChange={handleVideoFileChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                <div className="flex justify-between mt-2">
                                    <p className="text-xs text-gray-500">Format MP4, WEBM.</p>
                                    <p className="text-xs font-semibold text-red-600">Maks. 50 MB</p>
                                </div>
                                {videoFile && (
                                    <p className="text-sm text-emerald-600 mt-2">Terpilih: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                                )}
                                {errors.welcome_video_file && (
                                    <p className="mt-2 text-sm text-red-600">{errors.welcome_video_file[0]}</p>
                                )}
                            </div>
                        )}
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
                                    <span>Simpan Video</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
