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
  const { t, lang } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [pageRatio, setPageRatio] = useState(1 / Math.SQRT2);
  const [zoom, setZoom] = useState(1);

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
    <div className={`flex min-h-0 min-w-0 flex-col bg-white ${className}`}>
      <div ref={frameRef} className="min-h-0 flex-1 overflow-auto overscroll-contain" aria-label={lang === 'vi' ? 'Vùng xem bản vẽ' : 'Drawing viewport'}>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => onPageCount(numPages)}
        loading={<span role="status">{t.scene.loadingData}</span>}
        error={<a href={url} target="_blank" rel="noopener noreferrer" className="text-sm underline">PDF ↗</a>}
        className="grid min-h-full min-w-full w-max place-items-center"
      >
        {width > 0 && (
          <div role="img" aria-label={`PDF page ${pageNumber}`} onDoubleClick={() => setZoom(value => value === 1 ? 2 : 1)}>
          <Page
            pageNumber={pageNumber}
            width={Math.round(width * zoom)}
            devicePixelRatio={Math.min(window.devicePixelRatio || 1, 1.5)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onLoadSuccess={page => { const viewport = page.getViewport({ scale: 1 }); setPageRatio(viewport.width / viewport.height); }}
            className="[&_canvas]:block"
          />
          </div>
        )}
      </Document>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-stone-100 bg-white p-2 text-xs text-stone-800" role="group" aria-label={lang === 'vi' ? 'Phóng to PDF' : 'PDF zoom'}>
        <button type="button" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .5))} aria-label={lang === 'vi' ? 'Thu nhỏ PDF' : 'Zoom out PDF'} className="h-11 w-11 rounded-full border border-stone-200 disabled:opacity-40">−</button>
        <button type="button" onClick={() => setZoom(1)} className="min-h-11 px-2 tabular-nums" aria-label={lang === 'vi' ? 'Vừa khung PDF' : 'Fit PDF'}>{Math.round(zoom * 100)}%</button>
        <button type="button" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + .5))} aria-label={lang === 'vi' ? 'Phóng to PDF' : 'Zoom in PDF'} className="h-11 w-11 rounded-full border border-stone-200 disabled:opacity-40">+</button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 underline underline-offset-4">{lang === 'vi' ? 'PDF gốc ↗' : 'Original PDF ↗'}</a>
      </div>
    </div>
  );
}
