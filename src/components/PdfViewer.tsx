// src/components/PdfViewer.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { LoaderCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Configure the worker to use a CDN-hosted ES Module build
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer() {
  const originalPdfUrl = "https://web.quaxicron.com/download/cat.pdf";

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
          setPageWidth(Math.min(window.innerWidth * 0.8, 800));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  
  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Catalogue...</p>
    </div>
  );

  const ErrorMessage = () => (
     <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-destructive/10 rounded-lg">
        <p className="mb-4 text-destructive font-semibold">Could not load the PDF.</p>
        <p className="mb-4 text-muted-foreground">The file may be unavailable or your connection may be limited.</p>
        <Button asChild>
            <a href={originalPdfUrl} target="_blank" rel="noopener noreferrer">
                Try Opening in New Tab
            </a>
        </Button>
    </div>
  )

  return (
    <div className="w-full max-w-4xl bg-card/80 border rounded-lg shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
             <Button
                variant="outline"
                disabled={pageNumber <= 1}
                onClick={previousPage}
            >
                <ChevronLeft className="mr-2" />
                Previous
            </Button>
             {numPages && (
                 <p className="text-sm font-medium text-muted-foreground">
                    Page {pageNumber} of {numPages}
                </p>
             )}
             <Button
                variant="outline"
                disabled={!numPages || pageNumber >= numPages}
                onClick={nextPage}
            >
               Next
               <ChevronRight className="ml-2" />
            </Button>
        </div>
        <div className="flex justify-center p-4">
           <Document 
              file={originalPdfUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<LoadingSpinner />}
              error={<ErrorMessage />}
              className="flex justify-center"
            >
                <div className="max-w-full overflow-x-auto">
                   <Page 
                     pageNumber={pageNumber}
                     renderAnnotationLayer={false}
                     renderTextLayer={false}
                     loading={<Skeleton className="h-[800px] w-[566px]"/>}
                     width={pageWidth}
                   />
                </div>
            </Document>
        </div>
    </div>
  );
}
