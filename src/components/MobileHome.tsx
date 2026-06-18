import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import { getResponsiveImageProps } from '../utils/image';
import { ContactModal } from './ui/ContactModal';
import { FullscreenImageOverlay } from './ui/FullscreenImageOverlay';
import type { Project } from '../types';

/**
 * MobileHome — Trang chủ 2D tối giản, phong cách editorial
 */
export const MobileHome = memo(function MobileHome() {
  const { projects, settings, isDataLoaded } = useStore();
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenImage) setFullscreenImage(null);
        else if (selectedProject) setSelectedProject(null);
        else if (contactOpen) setContactOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage, selectedProject, contactOpen]);

  // Reset image index when project changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProject]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Project images for detail view
  const projectImages = useMemo(() => {
    if (!selectedProject) return [];
    let images: any[] = [];
    if (selectedProject.image?.asset) images.push(selectedProject.image);
    const hasMagazinePages = selectedProject.magazinePages && selectedProject.magazinePages.length > 0;
    const hasGallery = selectedProject.gallery && selectedProject.gallery.length > 0;
    if (hasMagazinePages) {
      selectedProject.magazinePages?.forEach(page => {
        if (page.images) images = [...images, ...page.images];
      });
    } else if (hasGallery) {
      images = [...images, ...(selectedProject.gallery || [])];
    }
    return images;
  }, [selectedProject]);

  // Youtube embed helper
  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
    else if (url.includes('shorts/')) videoId = url.split('shorts/')[1].split('?')[0];
    else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="min-h-screen bg-[#f1efe7] text-[#1a1a1a] overflow-x-hidden selection:bg-[#d8d3c5] font-sans">

      {/* ━━━ HERO SECTION ━━━ */}
      <section className="relative min-h-[100dvh] flex flex-col px-8 pt-12 pb-12">
        
        {/* Header / Meta */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-between items-start mb-16"
        >
          <div className="flex items-start gap-1">
            <span className="text-[44px] font-extrabold leading-[0.8] tracking-tighter">{day}</span>
            <span className="text-[11px] font-bold leading-tight uppercase tracking-wide mt-1">
              {month}<br/>
              {year}
            </span>
          </div>
          <button onClick={() => setContactOpen(true)} className="p-2 -mr-2 outline-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-[#1a1a1a]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </motion.div>

        {/* Main Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-[48px] sm:text-[56px] font-black leading-[1.05] tracking-tight">
            Hiên<br/>
            <span className="inline-flex items-center">
              studio
              <span className="inline-block w-16 sm:w-24 h-[1.5px] bg-[#1a1a1a] ml-4 align-middle" />
            </span>
          </h1>
        </motion.div>

        {/* Quote & Author */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-12 flex-grow"
        >
          <p className="text-[14px] font-medium leading-[1.7] max-w-[280px] text-[#1a1a1a]/90">
            '{settings?.heroDescription || "Hiên archi là một xưởng thiết kế kiến trúc nhỏ. Chúng tôi làm việc với con người và khí hậu bản địa để tạo nên những không gian sống mộc mạc, bình yên."}'
          </p>
          <p className="text-[13px] font-bold mt-6 tracking-wide">
            Thái Bảo / Hiên Archi
          </p>
        </motion.div>

        {/* Footer Meta */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-auto pt-8"
        >
          <div className="w-16 h-[1.5px] bg-[#1a1a1a]/30 mb-5" />
          <div className="flex justify-between items-end">
            <div className="text-[10px] font-semibold text-[#1a1a1a]/60 leading-tight uppercase tracking-wider">
              portfolio by<br/>
              <span className="text-[11px] font-bold text-[#1a1a1a]">Hiên Studio</span>
            </div>
            <div className="text-[10px] font-semibold text-[#1a1a1a]/60 leading-tight uppercase tracking-wider text-right">
              based in<br/>
              <span className="text-[11px] font-bold text-[#1a1a1a]">Vietnam</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator - absolute bottom center */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.5, duration: 1 }}
           className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
           <button onClick={() => scrollToSection('mobile-projects')} className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2">Cuộn</span>
              <div className="w-[1px] h-8 bg-[#1a1a1a] origin-top animate-pulse" />
           </button>
        </motion.div>
      </section>

      {/* ━━━ PROJECTS SECTION ━━━ */}
      <section id="mobile-projects" className="px-8 py-20 bg-[#ebe6db]">
        <div className="mb-16 flex items-center">
          <h2 className="text-[32px] font-black tracking-tight uppercase">Dự án</h2>
          <div className="w-full h-[1.5px] bg-[#1a1a1a] ml-6 opacity-20" />
        </div>

        {!isDataLoaded ? (
          <div className="space-y-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#e0dbd0] mb-4" />
                <div className="h-5 bg-[#e0dbd0] w-2/3 mb-2" />
                <div className="h-4 bg-[#e0dbd0] w-1/3" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-[#1a1a1a]/50 text-sm font-medium">Chưa có dự án nào.</p>
        ) : (
          <div className="space-y-20">
            {projects.map((project, idx) => {
              const imgProps = getResponsiveImageProps({
                source: project.image,
                aspectRatio: 4 / 5,
                baseWidth: 600,
                sizes: '100vw',
                className: 'w-full h-full object-cover transition-transform duration-700 hover:scale-105',
                alt: project.name,
                loading: idx < 2 ? 'eager' : 'lazy'
              });

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative aspect-[4/5] bg-[#e0dbd0] mb-6 overflow-hidden">
                    {imgProps ? (
                      <img {...imgProps} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]/30 text-sm font-medium">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="pr-4">
                      <h3 className="text-xl font-bold leading-tight tracking-tight mb-2">
                        {project.name}
                      </h3>
                      {project.generalInfo && (
                        <p className="text-[13px] font-medium text-[#1a1a1a]/60 line-clamp-2 leading-relaxed">
                          {project.generalInfo}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-full border border-[#1a1a1a]/20 flex items-center justify-center rotate-45 group-hover:bg-[#1a1a1a] group-hover:text-[#f1efe7] transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="px-8 py-16 bg-[#1a1a1a] text-[#f1efe7]">
        <div className="mb-12">
          <h2 className="text-[32px] font-black tracking-tight mb-6">HIÊN<br/>studio</h2>
          <p className="text-[13px] font-medium text-white/60 max-w-[250px] leading-relaxed">
            {settings?.heroDescription ? settings.heroDescription.slice(0, 100) + '...' : 'Kiến tạo không gian sống mộc mạc và chân thành.'}
          </p>
        </div>
        
        <div className="w-full h-[1px] bg-white/10 mb-8" />
        
        <div className="flex flex-col gap-4 text-[13px] font-bold tracking-wide uppercase">
          <a href={`tel:${(settings?.phone || '033 877 7017').replace(/ /g, '')}`} className="flex items-center justify-between py-2 border-b border-white/5">
            <span>Điện thoại</span>
            <span className="text-white/60 font-medium">{settings?.phone || '033 877 7017'}</span>
          </a>
          <a href={`mailto:${settings?.email || 'thaibao95arc@gmail.com'}`} className="flex items-center justify-between py-2 border-b border-white/5">
            <span>Email</span>
            <span className="text-white/60 font-medium lowercase tracking-normal">{settings?.email || 'thaibao95arc@gmail.com'}</span>
          </a>
          <a href="/shop" className="flex items-center justify-between py-2 border-b border-white/5">
            <span>Thư viện</span>
            <span className="text-white/60 font-medium">Xem sản phẩm →</span>
          </a>
        </div>
        
        <div className="mt-16 text-[10px] font-semibold text-white/40 tracking-widest uppercase text-center">
          © {new Date().getFullYear()} HIÊN STUDIO. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* ━━━ PROJECT DETAIL MODAL ━━━ */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#f1efe7] overflow-y-auto overscroll-contain"
          >
            {/* Header Sticky */}
            <div className="sticky top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-4 bg-[#f1efe7]/90 backdrop-blur-md border-b border-[#1a1a1a]/10">
              <span className="text-[11px] font-bold tracking-widest uppercase">Chi tiết dự án</span>
              <button 
                onClick={() => setSelectedProject(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] text-[#f1efe7]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-8">
              <h2 className="text-[36px] font-black leading-[1.05] tracking-tight mb-6">
                {selectedProject.name}
              </h2>

              {/* Hero image for detail view */}
              {selectedProject.image?.asset && (
                <div className="aspect-[4/3] bg-[#e0dbd0] mb-10">
                  <img 
                    src={urlFor(selectedProject.image).width(800).quality(85).auto('format').url()}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                    style={selectedProject.image.lqip ? { backgroundImage: `url(${selectedProject.image.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  />
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-1 gap-10 mb-12">
                {selectedProject.generalInfo && (
                  <div>
                    <h4 className="text-[10px] font-bold text-[#1a1a1a]/50 uppercase tracking-[0.2em] mb-3">Thông tin chung</h4>
                    <p className="text-[14px] font-medium leading-relaxed text-[#1a1a1a] whitespace-pre-wrap">
                      {selectedProject.generalInfo}
                    </p>
                  </div>
                )}

                {selectedProject.content && (
                  <div>
                    <h4 className="text-[10px] font-bold text-[#1a1a1a]/50 uppercase tracking-[0.2em] mb-3">Câu chuyện</h4>
                    <div className="pl-4 border-l-[1.5px] border-[#1a1a1a]">
                      <p className="text-[14px] font-medium leading-relaxed text-[#1a1a1a]/80 whitespace-pre-wrap">
                        {selectedProject.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube Video */}
              {selectedProject.youtubeLink && (
                <div className="mb-12">
                  <h4 className="text-[10px] font-bold text-[#1a1a1a]/50 uppercase tracking-[0.2em] mb-3">Video</h4>
                  <div className="aspect-video w-full bg-[#e0dbd0]">
                    <iframe 
                      className="w-full h-full"
                      src={getYoutubeEmbedUrl(selectedProject.youtubeLink)}
                      title="YouTube video"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Gallery images */}
              {projectImages.length > 1 && (
                <div className="mb-12">
                  <h4 className="text-[10px] font-bold text-[#1a1a1a]/50 uppercase tracking-[0.2em] mb-3">Thư viện ảnh</h4>
                  
                  {/* Main image viewer */}
                  <div 
                    className="relative aspect-[4/5] bg-[#e0dbd0] mb-4 cursor-pointer"
                    onClick={() => setFullscreenImage(urlFor(projectImages[activeImageIndex]).width(2000).quality(90).auto('format').url())}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={urlFor(projectImages[activeImageIndex]).width(1000).quality(85).auto('format').url()}
                        alt={`${selectedProject.name} image ${activeImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {projectImages.map((img, idx) => {
                      const thumbProps = getResponsiveImageProps({
                        source: img,
                        aspectRatio: 1,
                        baseWidth: 150,
                        sizes: '80px',
                        className: 'w-full h-full object-cover',
                        alt: `Thumb ${idx}`
                      });
                      return (
                        <div 
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`shrink-0 w-20 h-20 snap-start cursor-pointer transition-all duration-300 ${
                            activeImageIndex === idx 
                              ? 'ring-2 ring-[#1a1a1a] ring-offset-2 ring-offset-[#f1efe7] opacity-100' 
                              : 'opacity-40 hover:opacity-80'
                          }`}
                        >
                          {thumbProps && <img {...thumbProps} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━ CONTACT MODAL ━━━ */}
      <AnimatePresence>
        {contactOpen && (
          <ContactModal variant="centered" onClose={() => setContactOpen(false)} />
        )}
      </AnimatePresence>

      {/* ━━━ FULLSCREEN IMAGE ━━━ */}
      <FullscreenImageOverlay 
        selectedImage={fullscreenImage} 
        onClose={() => setFullscreenImage(null)} 
      />
    </div>
  );
});
