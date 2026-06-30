import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import { getResponsiveImageProps } from '../utils/image';
import { getYoutubeEmbedUrl } from '../utils/youtube';
import { useEscapeKey, useProjectImages, useIsMobile } from '../hooks';
import { useTranslation } from '../i18n';
import type { Project } from '../types';
import { SubpageNavigation } from '../components/SubpageNavigation';
import { FullscreenImageOverlay, ProjectCardSkeleton } from '../components/ui';
import { Document, Page as PdfPage, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { projects, isDataLoaded, fetchData } = useStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [numPdfPages, setNumPdfPages] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isMobile = useIsMobile();

  // Back to top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);



  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.generalInfo || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  // Project images (shared hook)
  const projectImages = useProjectImages(selectedProject);

  useEffect(() => {
     setActiveImageIndex(0);
     setNumPdfPages(null);
  }, [selectedProject]);

  // Helper cho Youtube URL (shared utility)

  useEffect(() => {
    if (!isDataLoaded) {
      fetchData();
    }
  }, [fetchData, isDataLoaded]);

  // Handle escape key to close modal or fullscreen image
  const handleEscape = useCallback(() => {
    if (fullscreenImage) setFullscreenImage(null);
    else setSelectedProject(null);
  }, [fullscreenImage]);
  useEscapeKey(handleEscape);

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
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif italic text-[#2a2a2a] mb-4">
            {t.projectsPage.title}
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8">
            {t.projectsPage.subtitle}
          </p>

          {/* Search + View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1 w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={t.projectsPage.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-stone-600'}`}
                title="Lưới"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-amber-700 text-white' : 'text-stone-400 hover:text-stone-600'}`}
                title="Danh sách"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </motion.div>

          {searchQuery && (
            <p className="text-sm text-stone-400 mt-3">
              {filteredProjects.length} kết quả cho &ldquo;<strong className="text-stone-600">{searchQuery}</strong>&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* Projects Grid / List */}
      <section className="pb-24 px-4 min-h-[50vh]">
        <div className="max-w-7xl mx-auto">
          {!isDataLoaded ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden p-3">
                  <ProjectCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🏡</div>
              <h3 className="text-xl font-heading font-bold text-stone-400 mb-2">
                {projects.length === 0 ? t.projectsPage.noProjects : t.projectsPage.noMatch}
              </h3>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mt-4 text-sm text-amber-700 underline">{t.projectsPage.clearSearch}</button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const imgProps = getResponsiveImageProps({
                  source: project.image, aspectRatio: 4/3, baseWidth: 800,
                  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
                  className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700',
                  alt: project.name, loading: 'lazy'
                });
                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 flex flex-col"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      {imgProps ? <img {...imgProps} /> : <div className="w-full h-full flex items-center justify-center text-stone-300">Không có ảnh</div>}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-heading font-bold text-[#2a2a2a] text-xl mb-3 group-hover:text-amber-800 transition-colors">{project.name}</h3>
                      {project.generalInfo && <p className="text-sm text-stone-500 mb-4 line-clamp-3">{project.generalInfo}</p>}
                      <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center text-sm font-medium text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Xem chi tiết</span><span>→</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* List view */
            <motion.div layout className="flex flex-col divide-y divide-stone-100">
              <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const imgProps = getResponsiveImageProps({
                  source: project.image, aspectRatio: 4/3, baseWidth: 300,
                  sizes: '120px',
                  className: 'w-full h-full object-cover',
                  alt: project.name, loading: 'lazy'
                });
                return (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group flex items-center gap-5 py-5 cursor-pointer hover:bg-amber-50/50 px-2 rounded-xl transition-colors"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="shrink-0 w-24 h-18 aspect-[4/3] bg-stone-100 rounded-xl overflow-hidden">
                      {imgProps ? <img {...imgProps} /> : <div className="w-full h-full bg-stone-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-[#2a2a2a] text-lg group-hover:text-amber-800 transition-colors truncate">{project.name}</h3>
                      {project.generalInfo && <p className="text-sm text-stone-500 line-clamp-2 mt-1">{project.generalInfo}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Xem →</span>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 w-12 h-12 bg-[#2a2a2a] text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:bg-amber-700 transition-colors"
            title="Lên đầu trang"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>
          </motion.button>
        )}
      </AnimatePresence>



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
