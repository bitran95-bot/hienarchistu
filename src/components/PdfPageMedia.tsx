import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslation } from '../i18n';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfPageMediaProps {
  url: string;
  pageNumber: number;
  onPageCount: (count: number) => void;
  className?: string;
}

/** Render a PDF page in the same contained frame as a project photo. */
export default function PdfPageMedia({ url, pageNumber, onPageCount, className = '' }: PdfPageMediaProps) {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [pageRatio, setPageRatio] = useState(1 / Math.SQRT2);

  useEffect(() => {
    const frameElement = frameRef.current;
    if (!frameElement) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setFrame({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(frameElement);
    return () => observer.disconnect();
  }, []);

  const width = Math.floor(Math.min(frame.width, frame.height * pageRatio));

  return (
    <div ref={frameRef} role="img" aria-label={`PDF page ${pageNumber}`} className={`flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-white ${className}`}>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => onPageCount(numPages)}
        loading={<span role="status">{t.scene.loadingData}</span>}
        error={<a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline">PDF ↗</a>}
        className="flex h-full w-full items-center justify-center"
      >
        {width > 0 && (
          <Page
            pageNumber={pageNumber}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onLoadSuccess={page => setPageRatio(page.view[2] / page.view[3])}
            className="max-h-full max-w-full [&_canvas]:!h-auto [&_canvas]:!max-h-full [&_canvas]:!max-w-full"
          />
        )}
      </Document>
    </div>
  );
}
