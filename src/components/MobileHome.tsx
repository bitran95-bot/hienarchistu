import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { urlFor } from '../sanityClient';
import { getResponsiveImageProps } from '../utils/image';
import { useTranslation } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ContactModal } from './ui/ContactModal';
import { FullscreenImageOverlay } from './ui/FullscreenImageOverlay';
import type { Project } from '../types';

/**
 * MobileHome — Trang chủ 2D dành riêng cho thiết bị di động.
 * 
 * Thay thế hoàn toàn Canvas 3D + Overlay trên mobile.
 * Giao diện đơn giản, mượt mà, tối ưu cho cảm ứng & hiệu năng.
 */
export const MobileHome = memo(function MobileHome() {
  const { projects, settings, isDataLoaded } = useStore();
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'home' | 'about'>('home');

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

  // Observe scroll for section transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.7;
      setActiveSection(scrollY > heroHeight ? 'about' : 'home');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const siteTitle = settings?.title || 'Hiên Archi Studio';

  return (
    <div className="min-h-screen bg-[#fdfbf7] overflow-x-hidden selection:bg-stone-300">

      {/* ━━━ HERO SECTION ━━━ */}
      <section id="mobile-hero" className="relative min-h-[100dvh] flex flex-col justify-center items-center px-6 pt-16 pb-24">
        {/* Decorative dots background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8 relative z-10"
        >
          <h1 className="font-heading font-bold text-[#2a2a2a] tracking-tighter leading-[0.85]">
            <span className="block text-[72px]">HIÊN</span>
            <span className="block text-[72px] ml-6">studio</span>
          </h1>
        </motion.div>

        {/* Hero description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-base text-stone-600 font-serif italic leading-relaxed max-w-sm relative z-10"
        >
          {settings?.heroDescription || "Hiên archi là một xưởng thiết kế kiến trúc nhỏ. Chúng tôi làm việc với con người và khí hậu bản địa để tạo nên những không gian sống mộc mạc, bình yên"}
        </motion.p>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400"
        >
          <span className="text-xs tracking-widest uppercase font-medium">Khám phá</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-stone-300 rounded-full flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-stone-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ━━━ ABOUT SECTION ━━━ */}
      <section id="mobile-about" className="px-6 py-16 bg-white/60">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-lg mx-auto"
        >
          <div className="w-12 h-[2px] bg-amber-700 mb-8" />
          <p className="text-xl font-serif italic text-[#2a2a2a] leading-relaxed mb-6">
            {settings?.aboutTitle || t.about.title}
          </p>
          <p className="text-base text-stone-600 leading-loose">
            {settings?.aboutText || t.about.text}
          </p>
        </motion.div>
      </section>

      {/* ━━━ PROJECTS SECTION ━━━ */}
      <section id="mobile-projects" className="px-5 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-[2px] bg-amber-700" />
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-[0.2em]">{t.nav.projects}</h2>
          </div>

          {!isDataLoaded ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-stone-200 rounded-2xl mb-3" />
                  <div className="h-5 bg-stone-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-stone-400 text-center py-12">Chưa có dự án nào.</p>
          ) : (
            <div className="space-y-8">
              {projects.map((project, idx) => {
                const imgProps = getResponsiveImageProps({
                  source: project.image,
                  aspectRatio: 4 / 3,
                  baseWidth: 600,
                  sizes: '100vw',
                  className: 'w-full h-full object-cover',
                  alt: project.name,
                  loading: idx < 3 ? 'eager' : 'lazy'
                });

                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="relative aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden shadow-sm active:shadow-lg transition-shadow">
                      {imgProps ? (
                        <img {...imgProps} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          Không có ảnh
                        </div>
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-white font-heading font-bold text-xl leading-tight mb-1" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                          {project.name}
                        </h3>
                        {project.generalInfo && (
                          <p className="text-white/80 text-xs line-clamp-1">{project.generalInfo}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="px-6 py-12 bg-[#2a2a2a] text-white/70">
        <div className="max-w-lg mx-auto text-center">
          <div className="font-heading font-bold text-white/90 text-xl mb-4 tracking-tighter">HIÊN studio</div>
          <p className="text-sm mb-6 font-serif italic">{settings?.heroDescription ? settings.heroDescription.slice(0, 80) + '...' : 'Kiến tạo không gian sống mộc mạc và chân thành.'}</p>
          <div className="flex items-center justify-center gap-6 text-sm mb-8">
            <a href={`tel:${(settings?.phone || '033 877 7017').replace(/ /g, '')}`} className="hover:text-amber-400 transition-colors">
              {settings?.phone || '033 877 7017'}
            </a>
            <span className="text-white/30">|</span>
            <a href={`mailto:${settings?.email || 'thaibao95arc@gmail.com'}`} className="hover:text-amber-400 transition-colors">
              Email
            </a>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} {siteTitle}</p>
        </div>
      </footer>

      {/* ━━━ FLOATING BOTTOM NAV ━━━ */}
      <nav 
        className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl px-5 py-3.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-center gap-5 text-xs font-medium text-[#444444] z-50 border border-stone-200/60" 
        aria-label="Mobile navigation"
      >
        <button 
          onClick={() => scrollToSection('mobile-about')} 
          className={`transition-colors whitespace-nowrap ${activeSection === 'about' ? 'text-amber-700' : 'hover:text-amber-700'}`}
        >
          {t.nav.story}
        </button>
        <button 
          onClick={() => scrollToSection('mobile-projects')} 
          className="hover:text-amber-700 transition-colors whitespace-nowrap"
        >
          {t.nav.projects}
        </button>
        <a href="/shop" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.library}</a>
        <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.contact}</button>
        <LanguageSwitcher />
      </nav>

      {/* ━━━ PROJECT DETAIL MODAL ━━━ */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
            
            {/* Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 top-0 bg-[#fdfbf7] overflow-y-auto overscroll-contain"
            >
              {/* Close button */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="sticky top-4 right-4 ml-auto mr-4 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur hover:bg-stone-100 rounded-full text-stone-600 transition-colors shadow-md"
              >
                ✕
              </button>

              {/* Hero image */}
              {selectedProject.image?.asset && (
                <div className="-mt-10 relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img 
                    src={urlFor(selectedProject.image).width(800).quality(85).auto('format').url()}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                    style={selectedProject.image.lqip ? { backgroundImage: `url(${selectedProject.image.lqip})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-3xl font-heading font-bold text-white leading-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {selectedProject.name}
                    </h2>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-6 pb-32">
                {!selectedProject.image?.asset && (
                  <h2 className="text-3xl font-heading font-bold text-[#2a2a2a] mb-6">
                    {selectedProject.name}
                  </h2>
                )}

                {selectedProject.generalInfo && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.15em] mb-3">Thông tin chung</h4>
                    <p className="text-base text-stone-700 whitespace-pre-wrap leading-relaxed">{selectedProject.generalInfo}</p>
                  </div>
                )}

                {selectedProject.content && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.15em] mb-3">Câu chuyện dự án</h4>
                    <p className="text-stone-600 whitespace-pre-wrap leading-[2] font-serif italic text-base pl-4 border-l-2 border-amber-700">{selectedProject.content}</p>
                  </div>
                )}

                {/* YouTube Video */}
                {selectedProject.youtubeLink && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.15em] mb-3">Video Dự Án</h4>
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

                {/* Gallery images */}
                {projectImages.length > 1 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-[0.15em] mb-3">Hình ảnh dự án</h4>
                    
                    {/* Main image viewer */}
                    <div 
                      className="relative aspect-[4/3] bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-3 cursor-pointer active:opacity-90 transition-opacity"
                      onClick={() => setFullscreenImage(urlFor(projectImages[activeImageIndex]).width(2000).quality(90).auto('format').url())}
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeImageIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          src={urlFor(projectImages[activeImageIndex]).width(1200).quality(85).auto('format').url()}
                          alt={`${selectedProject.name} image ${activeImageIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </AnimatePresence>
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                        {activeImageIndex + 1} / {projectImages.length}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory">
                      {projectImages.map((img, idx) => {
                        const thumbProps = getResponsiveImageProps({
                          source: img,
                          aspectRatio: 1,
                          baseWidth: 150,
                          sizes: '72px',
                          className: 'w-full h-full object-cover',
                          alt: `Thumbnail ${idx}`
                        });
                        return (
                          <div 
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden snap-start cursor-pointer transition-all duration-200 border-2 ${
                              activeImageIndex === idx 
                                ? 'border-amber-700 shadow-md scale-105' 
                                : 'border-transparent opacity-60'
                            }`}
                          >
                            {thumbProps && <img {...thumbProps} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View all projects link */}
                <a 
                  href="/projects" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-800 hover:text-amber-900 transition-colors mt-4"
                >
                  Xem tất cả dự án →
                </a>
              </div>
            </motion.div>
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
