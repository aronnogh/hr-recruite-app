// components/ui/PdfViewer.js
"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Import react-pdf styles - these are external and should remain as is.
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
        // Main container applying Material You background, shadow, border, and responsive padding
        <div className="pdf-container bg-surface-container-low p-4 sm:p-6 rounded-xl shadow-md border border-outline-variant overflow-hidden">
            <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                // Material You styled loading message
                loading={
                    <p className="md-typescale-body-large text-on-surface-variant text-center py-10">
                        Loading PDF...
                    </p>
                }
                // Material You styled error message
                error={
                    <p className="md-typescale-body-large text-error text-center py-10">
                        Failed to load PDF file.
                    </p>
                }
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderTextLayer={true}
                        // Add margin-bottom for spacing between pages.
                        // react-pdf renders content into canvas, so direct styling of content is limited.
                        className="mb-4 bg-surface-container-highest rounded-lg shadow-sm" // Add background and shadow to individual pages
                    />
                ))}
            </Document>
        </div>
    );
}