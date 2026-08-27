import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, QrCode, Download } from "lucide-react";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";

interface TicketCardProps {
    visitorCode: string;
    visitNumber: string;
    fullName: string;
    visitDate: string;
    qrDataUrl: string;
    onClose?: () => void;
    closeText?: string;
    isSearch?: boolean;
}

export default function TicketCard({
    visitorCode,
    visitNumber,
    fullName,
    visitDate,
    qrDataUrl,
    onClose,
    closeText = "SELESAI",
    isSearch = false
}: TicketCardProps) {
    const downloadPDF = async () => {
        const element = document.getElementById('success-card');
        if (!element) return;
        
        try {
            const dataUrl = await htmlToImage.toPng(element, { backgroundColor: '#ffffff', pixelRatio: 2 });
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgRatio = element.offsetHeight / element.offsetWidth;
            
            const margin = 15; // 15mm margin
            const maxPdfWidth = pageWidth - (margin * 2);
            const maxPdfHeight = pageHeight - (margin * 2);
            
            let finalWidth = maxPdfWidth;
            let finalHeight = finalWidth * imgRatio;
            
            // If the scaled height exceeds the page height, scale by height instead
            if (finalHeight > maxPdfHeight) {
                finalHeight = maxPdfHeight;
                finalWidth = finalHeight / imgRatio;
            }
            
            // Center the image horizontally
            const x = (pageWidth - finalWidth) / 2;
            const y = margin;
            
            pdf.addImage(dataUrl, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`Bukti_Registrasi_${visitorCode}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Maaf, terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.");
        }
    };

    return (
        <div className="w-full max-w-md flex flex-col gap-4 relative z-10 mx-auto">
            <div id="success-card" className="bg-white rounded-xl shadow-lg border border-gray-200 w-full p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                    <img src="/images/logo-pa.png" alt="Logo PA Karawang" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <h2 className="text-2xl font-black text-[#1A1A1A] mb-2 tracking-tight">
                    TIKET KUNJUNGAN
                </h2>
                <p className="text-gray-600 mb-8 text-sm">
                    Berikut adalah tiket digital kunjungan Anda.
                </p>
                
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 w-full flex flex-col items-center mb-4">
                    <div className="flex items-center gap-2 text-[#085C3B] font-bold mb-2">
                        <QrCode className="w-5 h-5" />
                        <span>QR CODE</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Tunjukkan QR Code ini saat kunjungan.</p>
                    
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
                        <Image src={qrDataUrl} alt="QR Code" width={180} height={180} className="rounded" />
                    </div>

                    <div className="w-full space-y-3 text-left border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Nama Pendaftar</span>
                            <span className="text-[13px] sm:text-base font-bold text-[#1A1A1A] truncate text-right" title={fullName}>{fullName || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Tanggal Kunjungan</span>
                            <span className="text-[13px] sm:text-base font-bold text-[#1A1A1A] whitespace-nowrap text-right tracking-tight sm:tracking-normal">
                                {visitDate ? new Date(visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Kode Visitor</span>
                            <span className="text-[13px] sm:text-base font-bold text-[#1A1A1A] font-mono whitespace-nowrap text-right">{visitorCode}</span>
                        </div>
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Nomor Antrean</span>
                            <span className="text-[13px] sm:text-base font-bold text-[#1A1A1A] font-mono whitespace-nowrap text-right tracking-tighter sm:tracking-normal">{visitNumber}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={downloadPDF}
                    className="w-full py-3.5 bg-white border-2 border-[#085C3B] text-[#085C3B] hover:bg-[#085C3B] hover:text-white rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 shadow-sm group"
                >
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    DOWNLOAD PDF
                </button>
                {onClose ? (
                    <button 
                        onClick={onClose}
                        className="w-full py-3.5 bg-[#085C3B] hover:bg-[#063D2A] text-white rounded-xl font-bold transition-colors flex justify-center items-center shadow-sm"
                    >
                        {closeText}
                    </button>
                ) : (
                    <Link 
                        href="/"
                        className="w-full py-3.5 bg-[#085C3B] hover:bg-[#063D2A] text-white rounded-xl font-bold transition-colors flex justify-center items-center shadow-sm"
                    >
                        {closeText}
                    </Link>
                )}
            </div>
        </div>
    );
}
