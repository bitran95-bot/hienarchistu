import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import { getResponsiveImageProps } from '../utils/image';
import type { Project } from '../types';
import { SubpageNavigation } from '../components/SubpageNavigation';
import { FullscreenImageOverlay } from '../components/ui/FullscreenImageOverlay';
import { Document, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useIsMobile } from '../hooks';

// Self-host PDF worker để tránh phụ thuộc CDN bên ngoài (thống nhất với MagazineViewer)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function ProjectsPage() {
  const { projects, isDataLoaded, fetchData } = useStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [numPdfPages, setNumPdfPages] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const projectImages = useMemo(() => {
    if (!selectedProject) return [];
    
    let images: any[] = [];
    
    if (selectedProject.image?.asset) {
       images.push(selectedProject.image);
    }

    const hasMagazinePages = selectedProject.magazinePages && selectedProject.magazinePages.length > 0;
    const hasGallery = selectedProject.gallery && selectedProject.gallery.length > 0;
    
    if (hasMagazinePages) {
       selectedProject.magazinePages?.forEach(page => {
         if (page.images) {
           images = [...images, ...page.images];
         }
       });
    } else if (hasGallery) {
       images = [...images, ...(selectedProject.gallery || [])];
    }
    
    return images;
  }, [selectedProject]);

  useEffect(() => {
     setActiveImageIndex(0);
     setNumPdfPages(null);
  }, [selectedProject]);

  // Helper cho Youtube URL
  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
    else if (url.includes('shorts/')) videoId = url.split('shorts/')[1].split('?')[0];
    else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  useEffect(() => {
    if (!isDataLoaded) {
      fetchData();
    }
  }, [fetchData, isDataLoaded]);

  // Handle escape key to close modal or fullscreen image
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenImage) setFullscreenImage(null);
        else setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] selection:bg-stone-300">
      <Helmet>
        <title>Dự án | Hiên Archi Studio</title>
        <meta name="description" content="Khám phá các dự án thiết kế kiến trúc và nội thất mộc mạc, gần gũi với tự nhiên của Hiên Archi Studio." />
        <meta property="og:title" content="Dự án | Hiên Archi Studio" />
        <meta property="og:description" content="Khám phá các dự án thiết kế kiến trúc và nội thất mộc mạc, gần gũi với tự nhiên của Hiên Archi Studio." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
      </Helmet>

      <SubpageNavigation />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif italic text-[#2a2a2a] mb-6"
          >
            Các Dự Án Của Chúng Tôi
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-500 max-w-2xl mx-auto"
          >
            Nơi lưu giữ những nếp nhà yên lành, những không gian mộc mạc và chân thành mà Hiên đã may mắn được đồng hành.
          </motion.p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 px-4 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {!isDataLoaded ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse text-stone-400 font-heading">Đang tải dự án...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-stone-400 mt-20">
              Chưa có dự án nào được đăng tải.
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {projects.map((project, idx) => {
                const imgProps = getResponsiveImageProps({
                  source: project.image,
                  aspectRatio: 4 / 3,
                  baseWidth: 800,
                  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
                  className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",
                  alt: project.name,
                  loading: 'lazy'
                });

                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 flex flex-col"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      {imgProps ? (
                        <img {...imgProps} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          Không có ảnh
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-heading font-bold text-[#2a2a2a] text-xl mb-3 group-hover:text-amber-800 transition-colors">
                        {project.name}
                      </h3>
                      {project.generalInfo && (
                        <p className="text-sm text-stone-500 mb-4 line-clamp-3">
                          {project.generalInfo}
                        </p>
                      )}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center text-sm font-medium text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Xem chi tiết</span>
                        <span>→</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-[100dvh] max-w-none bg-[#fdfbf7] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-stone-100 rounded-full text-stone-600 transition-colors shadow-sm"
              >
                ✕
              </button>

              {/* Left Side: Content */}
              <div className="w-full md:w-2/5 h-1/2 md:h-full overflow-y-auto p-6 md:p-10 custom-scrollbar border-r border-stone-200 order-2 md:order-1">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-[#2a2a2a] mb-8 border-b border-stone-200 pb-6">
                  {selectedProject.name}
                </h2>

                {selectedProject.generalInfo && (
                  <div className="mb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Thông tin chung</h4>
                    <p className="text-lg text-stone-600 whitespace-pre-wrap leading-relaxed">{selectedProject.generalInfo}</p>
                  </div>
                )}

                {selectedProject.content && (
                  <div className="mb-12">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Câu chuyện dự án</h4>
                    <p className="text-stone-700 whitespace-pre-wrap leading-[2.5] font-handwriting text-lg">{selectedProject.content}</p>
                  </div>
                )}

                {selectedProject.youtubeLink && (
                  <div className="mt-10 pb-10">
                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Video Dự Án</h4>
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md">
                      <iframe 
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(selectedProject.youtubeLink)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Slideshow / PDF Viewer */}
              <div className="w-full md:w-3/5 h-1/2 md:h-full relative shrink-0 bg-stone-100 flex flex-col p-4 md:p-6 order-1 md:order-2">
                {selectedProject.pdfFileUrl ? (
                   <Document 
                       file={selectedProject.pdfFileUrl}
                       onLoadSuccess={({ numPages }) => setNumPdfPages(numPages)}
                       className="w-full h-full flex flex-col"
                   >
                     {!numPdfPages ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-700"></div>
                        </div>
                     ) : (
                        <>
                          <div className="w-full flex-1 relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex items-center justify-center p-2 group cursor-pointer">
                             <PdfPage 
                                 pageNumber={activeImageIndex + 1} 
                                 height={isMobile ? window.innerHeight * 0.4 : window.innerHeight * 0.7}
                                 renderTextLayer={false} 
                                 renderAnnotationLayer={false}
                                 className="max-w-full max-h-full flex items-center justify-center [&_canvas]:!w-auto [&_canvas]:!h-full [&_canvas]:!max-w-full [&_canvas]:!object-contain"
                             />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none"></div>
                          </div>
                          {numPdfPages > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1 h-24 md:h-32 shrink-0">
                               {Array.from(new Array(numPdfPages), (_, idx) => (
                                 <div 
                                   key={idx}
                                   onClick={() => setActiveImageIndex(idx)}
                                   className={`shrink-0 aspect-[1/1.4] h-full rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 bg-white flex items-center justify-center ${activeImageIndex === idx ? 'border-amber-700 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                 >
                                    <PdfPage 
                                        pageNumber={idx + 1} 
                                        height={100}
                                        renderTextLayer={false} 
                                        renderAnnotationLayer={false}
                                    />
                                 </div>
                               ))}
                            </div>
                          )}
                        </>
                     )}
                   </Document>
                ) : projectImages.length > 0 ? (
                  <>
                    <div className="w-full flex-1 relative bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group cursor-pointer" onClick={() => setFullscreenImage(urlFor(projectImages[activeImageIndex]).width(2000).quality(90).auto('format').url())}>
                       <AnimatePresence mode="wait">
                         <motion.img 
                           key={activeImageIndex}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.3 }}
                           {...getResponsiveImageProps({
                             source: projectImages[activeImageIndex],
                             baseWidth: 1600,
                             sizes: '(max-width: 768px) 100vw, 60vw',
                             className: "w-full h-full object-contain",
                             alt: `${selectedProject.name} image ${activeImageIndex + 1}`
                           })}
                         />
                       </AnimatePresence>
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                         <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-opacity">Phóng to</span>
                       </div>
                    </div>
                    
                    {projectImages.length > 1 && (
                      <div className="mt-4 flex gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1 h-24 md:h-32 shrink-0">
                         {projectImages.map((img, idx) => {
                           const thumbProps = getResponsiveImageProps({
                             source: img,
                             aspectRatio: 1,
                             baseWidth: 200,
                             sizes: '100px',
                             className: "w-full h-full object-cover",
                             alt: `Thumbnail ${idx}`
                           });
                           return (
                             <div 
                               key={idx}
                               onClick={() => setActiveImageIndex(idx)}
                               className={`shrink-0 aspect-square h-full rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${activeImageIndex === idx ? 'border-amber-700 opacity-100 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                             >
                               {thumbProps && <img {...thumbProps} />}
                             </div>
                           );
                         })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                     Không có hình ảnh
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Viewer */}
      <FullscreenImageOverlay 
        selectedImage={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </div>
  );
}
