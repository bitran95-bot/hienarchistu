import { useState } from 'react';
import { Document, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function MobilePdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [activePage, setActivePage] = useState(0);

  return (
    <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="flex h-full w-full flex-col">
      {!numPages ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-amber-700" />
        </div>
      ) : (
        <>
          <div className="group relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
            <PdfPage
              pageNumber={activePage + 1}
              height={window.innerHeight * 0.4}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="flex max-h-full max-w-full items-center justify-center [&_canvas]:!h-full [&_canvas]:!max-w-full [&_canvas]:!object-contain [&_canvas]:!w-auto"
            />
          </div>
          {numPages > 1 && (
            <div className="custom-scrollbar mt-4 flex h-24 shrink-0 gap-3 overflow-x-auto px-1 pb-2 pt-1">
              {Array.from({ length: numPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setActivePage(index)}
                  aria-label={`PDF page ${index + 1}`}
                  className={`flex h-full shrink-0 aspect-[1/1.4] items-center justify-center overflow-hidden rounded-lg border-2 bg-white transition-all duration-300 ${activePage === index ? 'scale-105 border-amber-700 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <PdfPage pageNumber={index + 1} height={100} renderTextLayer={false} renderAnnotationLayer={false} />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Document>
  );
}
