import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import { useStore } from '../store/useStore';
const MagazineViewer = lazy(() => import('./MagazineViewer').then(m => ({ default: m.MagazineViewer })));
import { LanguageSwitcher } from './LanguageSwitcher';
import { ContactModal } from './ui/ContactModal';
import { MobileNav } from './ui/MobileNav';
import { useTranslation } from '../i18n';

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

  // Deep linking sync
  useEffect(() => {
    if (modalOpen && actualProjects[activeProject]) {
      const slug = actualProjects[activeProject].name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      window.history.replaceState(null, '', `#${slug}`);
    } else if (!modalOpen && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [modalOpen, activeProject, actualProjects]);

  // removed isMobileScreen state that was causing unused error
  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className={`fixed top-0 left-0 w-full h-1 bg-stone-200 z-[120] transition-opacity duration-300 ${modalOpen || contactOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div id="scroll-progress-bar" className="h-full bg-amber-700" style={{ width: '0%' }} />
      </div>

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
          <a href="/projects" className="hover:text-amber-700 transition-colors">{t.nav.projects}</a>
          <a href="/shop" target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 transition-colors">{t.nav.library}</a>
          <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors">{t.nav.contact}</button>
        </div>
        <div className="w-full md:w-1/3 flex justify-end text-sm text-[#888888]">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Floating Bottom Nav for Mobile */}
      <MobileNav onContactClick={() => setContactOpen(true)} />

      {/* DETAIL MODAL FULLSCREEN - NOW MAGAZINE VIEWER */}
      <AnimatePresence>
      {modalOpen && currentDetail && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#e5dfd5]/90 backdrop-blur-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        }>
          <MagazineViewer 
            key={currentDetail._id || activeProject}
            project={currentDetail}
            currentIndex={activeProject}
            totalIndex={actualProjects.length}
            onClose={() => setModalOpen(false)}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </Suspense>
      )}
      </AnimatePresence>

      {/* CONTACT FULLPAGE */}
      <AnimatePresence>
        {contactOpen && (
          <ContactModal variant="centered" onClose={() => setContactOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
});
