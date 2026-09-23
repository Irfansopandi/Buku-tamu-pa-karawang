"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from "lucide-react";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
    pdfUrl: string;
    pdfWidth: number;
}

export default function PdfViewer({ pdfUrl, pdfWidth }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>();

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <Document 
            file={pdfUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="flex flex-col items-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary mb-2" /><p className="text-xs text-gray-500">Mempersiapkan dokumen...</p></div>}
            className="flex flex-col gap-2 p-2 w-full max-w-full items-center"
        >
            {Array.from(new Array(numPages || 0), (el, index) => (
                <Page 
                    key={`page_${index + 1}`} 
                    pageNumber={index + 1} 
                    width={pdfWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden"
                />
            ))}
        </Document>
    );
}
