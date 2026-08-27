"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanVisitAction, checkInVisitAction } from "../../lib/officer-actions";
import { VisitScanData } from "../../lib/types";
import { CheckCircle2, XCircle, Loader2, QrCode, User, Calendar, Users, Briefcase, CameraOff, ChevronLeft, ChevronRight } from "lucide-react";

// Module-level concurrency control to prevent React 18 Strict Mode double-camera bugs
let activeScannerPromise: Promise<Html5Qrcode | null> | null = null;
let stopRequested = false;

export default function ScannerClient() {
    const [scanResult, setScanResult] = useState<VisitScanData | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [manualInput, setManualInput] = useState("");
    const [paginatedVisits, setPaginatedVisits] = useState<import("../../lib/types").PaginatedVisitsResponse | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    
    // To prevent multiple API calls for the same QR code in rapid succession
    const lastScannedRef = useRef<string | null>(null);
    const isScanningRef = useRef(false);

    const fetchHistory = async (page: number = 1) => {
        setIsLoadingHistory(true);
        const { getTodayVisitsAction } = await import("../../lib/officer-actions");
        const result = await getTodayVisitsAction(page);
        if (result.success && result.data) {
            setPaginatedVisits(result.data);
        }
        setIsLoadingHistory(false);
    };

    useEffect(() => {
        fetchHistory(1);
    }, []);

    useEffect(() => {
        isScanningRef.current = isScanning;
    }, [isScanning]);

    useEffect(() => {
        if (!isCameraActive) return;

        let isMounted = true;
        stopRequested = false;
        const scannerId = "qr-reader";

        const onScanSuccess = async (decodedText: string) => {
            if (decodedText === lastScannedRef.current || isScanningRef.current) return;
            
            lastScannedRef.current = decodedText;
            setIsScanning(true);
            setError(null);
            setSuccessMessage(null);
            setScanResult(null);

            const result = await scanVisitAction(decodedText);
            
            if (result.success && result.data) {
                setScanResult(result.data);
            } else {
                setError(result.error || "Scan Gagal. QR Code tidak valid atau terjadi kesalahan server.");
            }
            
            setIsScanning(false);
            
            setTimeout(() => {
                lastScannedRef.current = null;
            }, 3000);
        };

        const onScanFailure = (_: unknown) => {
            // Ignore regular scan failures
        };

        const startScanner = async () => {
            // Make sure the element exists
            if (!document.getElementById(scannerId)) return null;

            const html5QrCode = new Html5Qrcode(scannerId);

            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanFailure
                );
                
                if (!isMounted || stopRequested) {
                    if (html5QrCode.getState() === 2) {
                        await html5QrCode.stop();
                    }
                    html5QrCode.clear();
                    return null;
                }
                
                return html5QrCode;
            } catch (err) {
                if (isMounted && !stopRequested) {
                    console.error("Error starting scanner", err);
                }
                return null;
            }
        };

        // Delay starting the scanner to avoid React 18 Strict Mode rapid mount/unmount race conditions
        // This ensures the first "ghost" mount is cancelled before it starts accessing the camera
        const startTimeoutId = setTimeout(() => {
            if (isMounted && !stopRequested) {
                activeScannerPromise = startScanner();
            }
        }, 300);

        return () => {
            isMounted = false;
            stopRequested = true;
            clearTimeout(startTimeoutId);
            
            if (activeScannerPromise) {
                activeScannerPromise = activeScannerPromise.then(async (scanner) => {
                    if (scanner) {
                        try {
                            if (scanner.getState() === 2) { // SCANNING
                                await scanner.stop();
                            }
                            scanner.clear();
                        } catch (e) {
                            console.error("Error stopping scanner", e);
                        }
                    }
                    return null;
                });
            }
        };
    }, [isCameraActive]);

    const handleCheckIn = async () => {
        if (!scanResult) return;
        
        setIsCheckingIn(true);
        setError(null);
        setSuccessMessage(null);
        
        const result = await checkInVisitAction(scanResult.id);
        
        if (result.success && result.data) {
            setScanResult(result.data);
            setSuccessMessage("Check-in Berhasil.");
            
            // Refresh history
            fetchHistory(1);
        } else {
            setError(result.error || "Check-in Gagal.");
        }
        
        setIsCheckingIn(false);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualInput.trim() || isScanning) return;
        
        setIsScanning(true);
        setError(null);
        setSuccessMessage(null);
        setScanResult(null);

        const result = await scanVisitAction(manualInput.trim());
        
        if (result.success && result.data) {
            setScanResult(result.data);
            setManualInput(""); // clear input on success
        } else {
            setError(result.error || "Pencarian Gagal. Kode tidak valid atau terjadi kesalahan server.");
        }
        
        setIsScanning(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Pemindaian Kunjungan</h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1">Scan QR Code tiket pengunjung untuk melakukan proses check-in.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scanner Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-800">Scan QR Code</h3>
                        </div>
                        <button 
                            onClick={() => setIsCameraActive(!isCameraActive)}
                            className={`text-xs px-3 py-1.5 border rounded-md shadow-sm font-medium transition-colors self-stretch sm:self-auto text-center ${
                                isCameraActive 
                                ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50" 
                                : "bg-gray-800 border-gray-800 text-white hover:bg-gray-900"
                            }`}
                        >
                            {isCameraActive ? "Stop Kamera" : "Aktifkan Kamera"}
                        </button>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-center items-center relative min-h-[300px]">
                        <style dangerouslySetInnerHTML={{__html: `
                            #qr-reader {
                                width: 100%;
                                border: none !important;
                                border-radius: 0.5rem;
                                overflow: hidden;
                            }
                            #qr-reader video {
                                border-radius: 0.5rem;
                                object-fit: cover;
                            }
                            #qr-reader__scan_region {
                                background-color: #f9fafb;
                                border-radius: 0.5rem;
                                overflow: hidden;
                            }
                        `}} />
                        <div id="qr-reader" className={`w-full h-full flex justify-center items-center ${!isCameraActive ? 'hidden' : ''}`}>
                        </div>
                        
                        {!isCameraActive && (
                            <div className="w-full h-full text-gray-400 flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <CameraOff className="w-12 h-12 mb-3 opacity-30" />
                                <p className="font-medium text-gray-500">Kamera Dinonaktifkan</p>
                            </div>
                        )}
                        {isScanning && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                                <Loader2 className="w-8 h-8 text-[#D29C29] animate-spin mb-3" />
                                <span className="font-medium text-gray-700">Memproses...</span>
                            </div>
                        )}
                        
                        {/* Manual Input Section */}
                        <div className="mt-5 pt-5 border-t border-gray-100 w-full">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Atau Masukkan Kode Manual</p>
                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    placeholder="Contoh: v-a1b2c3d4"
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#085C3B] focus:border-transparent"
                                />
                                <button 
                                    type="submit"
                                    disabled={isScanning || !manualInput.trim()}
                                    className="bg-[#085C3B] hover:bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Cari
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-800">Hasil Pemindaian</h3>
                        </div>
                        {scanResult && (
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider shadow-sm ${
                                scanResult.status === 'checked_in' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                scanResult.status === 'completed' ? 'bg-[#085C3B]/10 border-[#085C3B]/20 text-[#085C3B]' :
                                scanResult.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                'bg-gray-50 border-gray-200 text-gray-700'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                                    scanResult.status === 'checked_in' ? 'bg-blue-500' :
                                    scanResult.status === 'completed' ? 'bg-[#085C3B]' :
                                    scanResult.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                                    'bg-gray-500'
                                }`}></span>
                                {scanResult.status === 'checked_in' ? 'CHECKED IN' :
                                 scanResult.status === 'completed' ? 'SELESAI' :
                                 scanResult.status === 'pending' ? 'MENUNGGU KEDATANGAN' :
                                 scanResult.status}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 flex-grow">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Scan Gagal</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold mt-0.5">{successMessage}</p>
                            </div>
                        )}

                        {!scanResult && !error && !isScanning && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                <QrCode className="w-16 h-16 mb-4 opacity-50" />
                                <h4 className="text-lg font-medium text-gray-600">Belum ada tiket dipindai</h4>
                                <p className="text-sm mt-2 text-center max-w-xs">Data pengunjung akan tampil setelah QR Code berhasil dipindai.</p>
                            </div>
                        )}

                        {scanResult && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Data Pengunjung</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Nama Lengkap</p>
                                            <p className="font-medium text-gray-900 break-words">{scanResult.visitor?.name || "Tidak tersedia"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">NIK</p>
                                            <p className="font-medium text-gray-900 italic text-gray-400">Tersembunyi</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Nomor HP</p>
                                            <p className="font-medium text-gray-900 italic text-gray-400">Tersembunyi</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Email</p>
                                            <p className="font-medium text-gray-900 italic text-gray-400">Tersembunyi</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Detail Kunjungan</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <p>Tanggal Kunjungan</p>
                                            </div>
                                            <p className="font-medium text-gray-900">{scanResult.visit_date || "-"}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Briefcase className="w-4 h-4" />
                                                <p>Layanan / Keperluan</p>
                                            </div>
                                            <p className="font-medium text-gray-900">{scanResult.service?.name || "-"}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Users className="w-4 h-4" />
                                                <p>Jumlah Rombongan</p>
                                            </div>
                                            <p className="font-medium text-gray-900">{scanResult.group_size || 1} Orang</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Anggota Rombongan</h4>
                                    <div className="text-sm text-gray-600">
                                        <p className="italic text-gray-400">Detail nama anggota rombongan tidak ditampilkan</p>
                                    </div>
                                </div>

                                {scanResult.status === 'pending' && (
                                    <div className="pt-4">
                                        {(() => {
                                            if (!scanResult.visit_date) {
                                                return null; // Fallback if visit_date is mysteriously missing
                                            }

                                            // Get local date string YYYY-MM-DD
                                            const today = new Date();
                                            const year = today.getFullYear();
                                            const month = String(today.getMonth() + 1).padStart(2, '0');
                                            const day = String(today.getDate()).padStart(2, '0');
                                            const localTodayStr = `${year}-${month}-${day}`;
                                            
                                            const visitDateStr = scanResult.visit_date;

                                            if (visitDateStr > localTodayStr) {
                                                return (
                                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm text-center">
                                                        <p className="font-semibold mb-1">Tiket Belum Berlaku</p>
                                                        <p>Tiket belum dapat digunakan. Tanggal kunjungan: <strong>{visitDateStr}</strong>.</p>
                                                    </div>
                                                );
                                            } else if (visitDateStr < localTodayStr) {
                                                return (
                                                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm text-center">
                                                        <p className="font-semibold mb-1">Tiket Kadaluarsa</p>
                                                        <p>Tiket sudah melewati tanggal kunjungan (<strong>{visitDateStr}</strong>).</p>
                                                    </div>
                                                );
                                            } else {
                                                // Date matches today
                                                return (
                                                    <button
                                                        onClick={handleCheckIn}
                                                        disabled={isCheckingIn}
                                                        className="w-full bg-[#085C3B] hover:bg-primary text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center disabled:opacity-50"
                                                    >
                                                        {isCheckingIn ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                                Memproses...
                                                            </>
                                                        ) : (
                                                            "Check-in Sekarang"
                                                        )}
                                                    </button>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Today's Visits Section (History) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">Kunjungan Hari Ini</h3>
                    
                    {!isLoadingHistory && paginatedVisits && (
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <QrCode className="w-4 h-4" />
                                {paginatedVisits.meta.total} Tiket
                            </div>
                            <div className="bg-[#085C3B]/10 border border-[#085C3B]/20 text-[#085C3B] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm">
                                <Users className="w-4 h-4" />
                                {paginatedVisits.meta.total_people} Pengunjung
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-0 overflow-x-auto relative min-h-[200px]">
                    {isLoadingHistory ? (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-[#D29C29] animate-spin" />
                        </div>
                    ) : null}

                    {paginatedVisits && paginatedVisits.data.length > 0 ? (
                        <>
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">No. Tiket</th>
                                        <th scope="col" className="px-6 py-3">Nama Lengkap</th>
                                        <th scope="col" className="px-6 py-3">Layanan</th>
                                        <th scope="col" className="px-6 py-3 text-center">Jumlah Orang</th>
                                        <th scope="col" className="px-6 py-3 text-right">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedVisits.data.map((visit) => {
                                        const timeStr = visit.checked_in_at 
                                            ? new Date(visit.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
                                            : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                                        
                                        return (
                                            <tr key={visit.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    {visit.visit_number}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                    {visit.visitor?.name || "Tidak diketahui"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {visit.service?.name || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    <span className="bg-gray-100 text-gray-800 py-1 px-2.5 rounded-full text-xs">
                                                        {visit.group_size || 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-500">
                                                    {timeStr}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            
                            {/* Pagination Controls */}
                            {paginatedVisits.meta.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                    <span className="text-sm text-gray-600">
                                        Halaman <span className="font-semibold text-gray-900">{paginatedVisits.meta.current_page}</span> dari <span className="font-semibold text-gray-900">{paginatedVisits.meta.last_page}</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fetchHistory(paginatedVisits.meta.current_page - 1)}
                                            disabled={paginatedVisits.meta.current_page === 1 || isLoadingHistory}
                                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => fetchHistory(paginatedVisits.meta.current_page + 1)}
                                            disabled={paginatedVisits.meta.current_page === paginatedVisits.meta.last_page || isLoadingHistory}
                                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        !isLoadingHistory && (
                            <div className="p-12 flex flex-col items-center justify-center text-center text-gray-500">
                                <Users className="w-10 h-10 mb-3 opacity-20" />
                                <p className="font-medium text-gray-600">Belum ada kunjungan hari ini</p>
                                <p className="text-sm mt-1">Data kunjungan yang di-check-in akan muncul di sini.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
