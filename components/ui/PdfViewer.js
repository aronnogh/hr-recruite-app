// components/ui/PdfViewer.js
"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Point to the worker file we copied to the public directory
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export default function PdfViewer({ fileUrl }) {
    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    return (
        <div className="pdf-container bg-gray-700 p-4 rounded-lg border border-gray-600">
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p className="text-center text-white">Loading PDF...</p>}
                error={<p className="text-center text-red-500">Failed to load PDF file.</p>}
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <Page 
                        key={`page_${index + 1}`} 
                        pageNumber={index + 1}
                        renderTextLayer={true}
                        className="mb-4"
                    />
                ))}
            </Document>
        </div>
    );
}