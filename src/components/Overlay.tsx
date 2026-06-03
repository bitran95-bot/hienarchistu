import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, memo } from 'react';
import { useStore } from '../store/useStore';
import { MagazineViewer } from './MagazineViewer';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../i18n';
import type { Project } from '../types';

export const Overlay = memo(function Overlay() {
  const { modalOpen, setModalOpen, activeProject, setActiveProject, projects, settings } = useStore();
  const [contactOpen, setContactOpen] = useState(false);
  const { t } = useTranslation();

  // Escape key handler cho modals
  const handleClose = useCallback(() => {
    if (contactOpen) setContactOpen(false);
    else if (modalOpen) setModalOpen(false);
  }, [contactOpen, modalOpen, setModalOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  const fallbackProjects: Partial<Project>[] = [
    { name: "Nhà bên Hiên", generalInfo: "Đang cập nhật..." },
    { name: "Sài Gòn Pavilion", generalInfo: "Đang cập nhật..." }
  ];

  const actualProjects = (projects && projects.length > 0) ? projects : fallbackProjects;
  const currentDetail = actualProjects[activeProject] || actualProjects[0];
  
  const handlePrev = () => {
    setActiveProject((activeProject - 1 + actualProjects.length) % actualProjects.length);
  };

  const handleNext = () => {
    setActiveProject((activeProject + 1) % actualProjects.length);
  };

  // removed isMobileScreen state that was causing unused error
  return (
    <>
      {/* Logo lớn bắt đầu ở giữa và cuộn về góc */}
      <div 
        id="main-logo"
        className={`fixed z-[100] cursor-pointer flex flex-col items-start font-heading font-bold tracking-tighter left-1/2 md:left-[25%] -translate-x-1/2 -translate-y-1/2 ${modalOpen || contactOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        style={{ 
           top: '40%', 
           color: '#2a2a2a', 
           textShadow: '2px 10px 15px rgba(0,0,0,0.15)',
           transition: 'color 0.3s ease, opacity 0.3s ease',
           opacity: (modalOpen || contactOpen) ? 0 : 1,
        }}
        onClick={() => {
           window.dispatchEvent(new CustomEvent('scroll-to-home'));
        }}
        onMouseEnter={(e) => {
           e.currentTarget.style.color = '#b45309';
        }}
        onMouseLeave={(e) => {
           e.currentTarget.style.color = '#2a2a2a';
        }}
      >
        <div style={{ fontSize: 'clamp(50px, 18vw, 176px)', lineHeight: '0.8', paddingLeft: '0px' }}>HIÊN</div>
        <div style={{ fontSize: 'clamp(50px, 18vw, 176px)', lineHeight: '0.8', paddingLeft: 'clamp(20px, 8vw, 80px)' }}>studio</div>
      </div>

      <header className="fixed top-0 left-0 w-full px-6 md:px-12 py-6 md:py-8 flex justify-between items-center z-50 pointer-events-auto">
        <div className="w-1/3 hidden md:block"></div>
        <div className="hidden md:flex items-center justify-center space-x-12 text-sm font-medium text-[#444444] w-1/3">
          <button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-about'))} className="hover:text-amber-700 transition-colors">{t.nav.story}</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-projects'))} className="hover:text-amber-700 transition-colors">{t.nav.projects}</button>
          <a href="/shop" target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 transition-colors">{t.nav.library}</a>
          <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors">{t.nav.contact}</button>
        </div>
        <div className="w-full md:w-1/3 flex justify-end text-sm text-[#888888]">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center space-x-5 text-xs font-medium text-[#444444] z-50 pointer-events-auto border border-stone-200/50">
        <button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-about'))} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.story}</button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-projects'))} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.projects}</button>
        <a href="/shop" target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.library}</a>
        <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.contact}</button>
        <LanguageSwitcher />
      </div>

      {/* DETAIL MODAL FULLSCREEN - NOW MAGAZINE VIEWER */}
      <AnimatePresence>
      {modalOpen && currentDetail && (
        <MagazineViewer 
          key={currentDetail._id || activeProject}
          project={currentDetail}
          currentIndex={activeProject}
          totalIndex={actualProjects.length}
          onClose={() => setModalOpen(false)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      </AnimatePresence>

      {/* CONTACT FULLPAGE */}
      <AnimatePresence>
      {contactOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
          className="fixed inset-0 z-[110] bg-[#fdfbf7] pointer-events-auto flex flex-col overflow-y-auto"
          style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 md:p-12 w-full">
             <div className="text-2xl md:text-3xl font-heading font-bold tracking-tighter text-[#2a2a2a]">HIÊN studio</div>
             <button 
               onClick={() => setContactOpen(false)}
               className="text-2xl font-medium hover:text-amber-700 transition-colors flex items-center gap-2 md:gap-3 group"
             >
               <span className="uppercase text-xs md:text-sm tracking-widest font-bold hidden md:inline">{t.contact.close}</span>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#2a2a2a] group-hover:border-amber-700 flex items-center justify-center transition-colors">
                  <span className="mb-1 text-xl md:text-2xl leading-none">×</span>
               </div>
             </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col md:flex-row px-6 pb-12 pt-4 md:p-12 lg:p-24 gap-12 lg:gap-24 h-full max-w-7xl mx-auto w-full items-center">
             {/* Left side: Huge Title */}
             <div className="w-full md:w-1/2 flex flex-col justify-center">
                <motion.h2 
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -50 }}
                   transition={{ delay: 0.2, duration: 0.5 }}
                   className="text-6xl md:text-8xl lg:text-[9rem] font-heading font-bold leading-[0.9] text-[#2a2a2a] uppercase tracking-tighter text-center md:text-left"
                >
                   Let's<br/>Talk.
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ delay: 0.4 }}
                   className="mt-6 md:mt-8 text-base md:text-2xl text-stone-600 font-serif italic max-w-md border-l-4 border-amber-700 pl-4 md:pl-6"
                >
                   {t.contact.quote}
                </motion.p>
             </div>

             {/* Right side: Contact Details */}
             <div className="w-full md:w-1/2 flex flex-col justify-center space-y-10 md:space-y-16">
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: 0.3, type: "spring" }}>
                   <h3 className="text-xs md:text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 md:mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> {t.contact.phone}
                   </h3>
                   <a href={`tel:${settings?.phone?.replace(/ /g, '') || '0338777017'}`} className="text-3xl md:text-5xl lg:text-6xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors inline-block">
                      {settings?.phone || '033 877 7017'}
                   </a>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: 0.4, type: "spring" }}>
                   <h3 className="text-xs md:text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 md:mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Email
                   </h3>
                   <a href={`mailto:${settings?.email || 'thaibao95arc@gmail.com'}`} className="text-xl md:text-4xl lg:text-5xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors inline-block break-all">
                      {settings?.email || 'thaibao95arc@gmail.com'}
                   </a>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: 0.5, type: "spring" }}>
                   <h3 className="text-xs md:text-sm font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 md:mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-stone-300 inline-block"></span> Instagram
                   </h3>
                   <a href={settings?.instagram || "https://instagram.com/hien.archi"} target="_blank" rel="noopener noreferrer" className="text-2xl md:text-4xl lg:text-5xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors inline-flex items-center gap-4 group">
                      {settings?.instagram ? (() => { try { return new URL(settings.instagram).pathname.replace(/\//g, ''); } catch(e) { return settings.instagram; }})() : 'hien.archi'}
                      <span className="inline-block transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform text-amber-700">↗</span>
                   </a>
                </motion.div>
             </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
});
