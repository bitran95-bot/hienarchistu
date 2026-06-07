import React, { useState, useEffect, type ReactNode } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { urlFor } from '../sanityClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import type { Project } from '../types';
import { useIsMobile } from '../hooks';

interface PageProps {
  children: ReactNode;
  number?: string;
}

// Component wrapper for each page
const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div className="page bg-[#fdfbf7] shadow-xl overflow-hidden border-r border-stone-200" ref={ref} style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      <div className="h-full w-full flex flex-col p-8 md:p-12 relative overflow-y-auto">
        {props.children}
        {props.number && (
           <div className="absolute bottom-4 left-0 w-full text-center text-xs font-serif text-stone-400">
             - {props.number} -
           </div>
        )}
      </div>
    </div>
  );
});

interface MagazineViewerProps {
  project: Partial<Project> & { _id?: string; name?: string };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalIndex: number;
}

export function MagazineViewer({ project, onClose, onNext, onPrev, currentIndex, totalIndex }: MagazineViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  
  const isMobile = useIsMobile();
  // Layout Landscape: chiều ngang rộng hơn chiều cao
  const pageWidth = isMobile ? window.innerWidth * 0.9 : 1000;
  const pageHeight = isMobile ? window.innerHeight * 0.6 : 650;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev]);

  // Prepare gallery images
  const groupedGallery: any[][] = [];
  let pageConfigs: string[] = [];
  
  // Hash function for pseudo-random grouping
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    return Math.abs(hash);
  };

  if (project.magazinePages && project.magazinePages.length > 0) {
    project.magazinePages.forEach((page: any) => {
      groupedGallery.push(page.images || []);
      pageConfigs.push(page.layout || 'col');
    });
  } else {
    const gallery = project.gallery || [];
    if (gallery && gallery.length > 0) {
       let i = 0;
       const seed = hashString(project._id || project.name || "default");
       while (i < gallery.length) {
          const randomVal = (seed + i * 17) % 100;
          let chunkSize = 1;
          if (randomVal > 70 && i + 2 < gallery.length) chunkSize = 3;
          else if (randomVal > 30 && i + 1 < gallery.length) chunkSize = 2;
          
          groupedGallery.push(gallery.slice(i, i + chunkSize));
          const configVal = (seed + i * 23) % 3;
          pageConfigs.push(configVal === 0 ? 'col' : (configVal === 1 ? 'row' : 'mixed'));
          i += chunkSize;
       }
    }
  }
  
  // Front Cover image
  const coverImageUrl = project.image?.asset 
    ? urlFor(project.image as any).width(1600).quality(100).auto('format').url() 
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&auto=format&fit=crop";

  const pages = [
    <Page key="cover">
       <div className="absolute inset-0 z-0">
          <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-12 left-8 right-8 text-white">
             <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-2 tracking-tighter" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
               {project.name}
             </h1>
             <p className="text-white/90 font-serif italic" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>Ấn phẩm kiến trúc Hiên studio</p>
          </div>
       </div>
    </Page>,

    <Page key="inside-cover" number="2">
       <div className="h-full flex flex-col items-center justify-center text-stone-400 font-serif italic text-sm">
          <p className="text-2xl font-heading font-bold text-stone-300 mb-4">HIÊN studio</p>
          <p>Designed with passion.</p>
       </div>
    </Page>,

    <Page key="info" number="3">
       <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#2a2a2a] mb-6 tracking-tighter">Về dự án</h2>
       <div className="text-base md:text-lg text-[#333] leading-relaxed whitespace-pre-wrap mb-8 font-medium">
           {project.generalInfo || "Thông tin chung dự án đang được cập nhật..."}
       </div>
       {project.content && (
          <>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-stone-300 inline-block"></span> Chi tiết
            </h3>
            <p className="font-serif italic text-sm md:text-base text-[#555] leading-relaxed pl-4 border-l-2 border-amber-700 whitespace-pre-wrap pb-12">
              {project.content}
            </p>
          </>
       )}
    </Page>,

    project.youtubeLink ? (
       <Page key="video" number="4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#2a2a2a] mb-6 tracking-tighter">Video Thực Tế</h2>
          <div className="w-full aspect-video rounded-md overflow-hidden shadow-lg border border-stone-200 bg-black">
             <iframe 
               className="w-full h-full"
               src={project.youtubeLink
                .replace("watch?v=", "embed/")
                .replace("youtu.be/", "www.youtube-nocookie.com/embed/")
                .replace("youtube.com", "youtube-nocookie.com")} 
               title="YouTube video player" 
               frameBorder="0" 
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
               allowFullScreen
             ></iframe>
          </div>
       </Page>
    ) : (
       <Page key="video-alt" number="4">
          <div className="h-full flex flex-col items-center justify-center text-stone-400 font-serif italic text-sm">
             <p className="text-xl">Thư viện ảnh</p>
             <p className="mt-2 text-stone-300">Lật sang trang kế tiếp →</p>
          </div>
       </Page>
    )
  ];

  groupedGallery.forEach((group: any[], groupIdx: number) => {
     const layoutType = pageConfigs[groupIdx];
     pages.push(
        <Page key={`gallery-page-${groupIdx}`} number={String(5 + groupIdx)}>
          {layoutType === 'full' && group.length >= 1 ? (
             <div 
               className="absolute inset-0 z-0 bg-[#fdfbf7] flex items-center justify-center cursor-zoom-in" 
               onClick={() => setSelectedImage(urlFor(group[0]).quality(85).auto('format').url())}
             >
               <img 
                 src={urlFor(group[0]).quality(85).auto('format').url()} 
                 alt={`Gallery ${groupIdx}`} 
                 className="w-full h-full object-contain" 
               />
             </div>
          ) : (
             <div className={`flex-1 min-h-0 w-full flex gap-4 overflow-hidden relative z-10 ${
                group.length === 1 ? 'items-center justify-center' :
                layoutType === 'col' ? 'flex-col items-center justify-center' : 
                layoutType === 'row' ? 'flex-row items-center justify-center' : 
                'flex-col md:flex-row items-center justify-center flex-wrap'
             }`}>
                {group.map((img: any, idx: number) => {
                   const fullSrc = urlFor(img).quality(85).auto('format').url();
                   return (
                      <div 
                        key={idx} 
                        className={`relative group cursor-zoom-in flex items-center justify-center overflow-hidden shadow-md border border-stone-200/50 bg-white ${
                          group.length === 1 ? 'w-full h-full' : 'flex-1 min-h-0 min-w-[40%]'
                        }`}
                        onClick={() => setSelectedImage(fullSrc)}
                      >
                        <img 
                          src={fullSrc} 
                          alt={`Gallery ${groupIdx}-${idx}`} 
                          className="w-full h-full object-contain p-2" 
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                   );
                })}
             </div>
          )}
       </Page>
     );
  });

  if (groupedGallery.length % 2 !== 0) {
     pages.push(
        <Page key="end" number={String(5 + groupedGallery.length)}>
           <div className="h-full flex flex-col items-center justify-center text-stone-400 font-serif italic text-sm">
              <p className="text-2xl font-heading text-stone-300">The End.</p>
           </div>
        </Page>
     );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-auto bg-[#e5dfd5]/90 backdrop-blur-md"
      onClick={(e) => {
         // Đóng tạp chí nếu click vào vùng nền (backdrop)
         if (e.target === e.currentTarget) {
            onClose();
         }
      }}
    >
      {/* Controls */}
      <div className="absolute top-6 w-full px-6 flex justify-between items-center z-50 pointer-events-none">
         <div className="flex items-center gap-4 text-[#2a2a2a] pointer-events-auto">
            <button onClick={onPrev} aria-label="Previous project" className="w-10 h-10 rounded-full border border-[#2a2a2a]/30 flex items-center justify-center hover:bg-[#2a2a2a]/10 transition-colors">
               ←
            </button>
            <span className="text-sm font-medium">{currentIndex + 1} / {totalIndex}</span>
            <button onClick={onNext} aria-label="Next project" className="w-10 h-10 rounded-full border border-[#2a2a2a]/30 flex items-center justify-center hover:bg-[#2a2a2a]/10 transition-colors">
               →
            </button>
         </div>
         <button onClick={onClose} aria-label="Close viewer" className="w-10 h-10 rounded-full border border-[#2a2a2a]/30 text-[#2a2a2a] flex items-center justify-center hover:bg-[#2a2a2a]/10 transition-colors text-xl pointer-events-auto bg-white/50">
            ×
         </button>
      </div>

      {/* PDF Viewer if available */}
      {project.pdfFileUrl ? (
        <div className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex items-center justify-center pointer-events-none p-4 md:p-8">
          <div 
             className="pointer-events-auto w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col items-center justify-center"
             style={{ aspectRatio: isMobile ? 'auto' : `${pageWidth * 2} / ${pageHeight}` }}
          >
             {!numPages && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                </div>
             )}
             <Document 
                 file={project.pdfFileUrl} 
                 onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                 className="w-full h-full flex items-center justify-center"
                 loading={null}
             >
                 {numPages && (
                     /* @ts-ignore */
                     <HTMLFlipBook
                       width={pageWidth}
                       height={pageHeight}
                       size="stretch"
                       minWidth={300}
                       maxWidth={1500}
                       minHeight={300}
                       maxHeight={1000}
                       maxShadowOpacity={0.6}
                       showCover={true}
                       usePortrait={isMobile}
                       mobileScrollSupport={true}
                       className="magazine-flipbook shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                     >
                         {Array.from(new Array(numPages), (_, index) => (
                             <Page key={`pdf-page-${index}`} number={String(index + 1)}>
                                 <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#fdfbf7]">
                                     <PdfPage 
                                         pageNumber={index + 1} 
                                         width={isMobile ? pageWidth : pageWidth}
                                         renderTextLayer={false} 
                                         renderAnnotationLayer={false} 
                                         className="w-full h-full flex items-center justify-center [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:!object-contain"
                                     />
                                 </div>
                             </Page>
                         ))}
                     </HTMLFlipBook>
                 )}
             </Document>
          </div>
        </div>
      ) : (
        /* Magazine Container */
        <div className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex items-center justify-center pointer-events-none p-4 md:p-8">
          <div 
             className="pointer-events-auto w-full h-full max-w-[95vw] max-h-[90vh] flex items-center justify-center"
             style={{ aspectRatio: isMobile ? 'auto' : `${pageWidth * 2} / ${pageHeight}` }}
          >
            {/* @ts-ignore */}
            <HTMLFlipBook
              width={pageWidth}
              height={pageHeight}
              size="stretch"
              minWidth={300}
              maxWidth={1500}
              minHeight={300}
              maxHeight={1000}
              maxShadowOpacity={0.6}
              showCover={true}
              usePortrait={isMobile}
              mobileScrollSupport={true}
              className="magazine-flipbook shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {pages}
            </HTMLFlipBook>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
