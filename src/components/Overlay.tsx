import { AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import { useEscapeKey } from '../hooks';
import { useStore } from '../store/useStore';
const DesktopProjectViewer = lazy(() => import('./DesktopProjectViewer').then(m => ({ default: m.DesktopProjectViewer })));
import { LanguageSwitcher } from './LanguageSwitcher';
import { ContactModal } from './ui/ContactModal';
import { MobileNav } from './ui/MobileNav';
import { useTranslation } from '../i18n';
import { Link, useNavigate } from 'react-router-dom';
import { projectSlug } from '../utils/projectSlug';

export const Overlay = memo(function Overlay() {
  const { modalOpen, setModalOpen, activeProject, projects, isDarkMode } = useStore();
  const [contactOpen, setContactOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAboutActive, setIsAboutActive] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Track about section visibility from R3F scroll position
  useEffect(() => {
    const handleAboutVisible = (e: Event) => {
      setIsAboutActive((e as CustomEvent).detail?.visible ?? false);
    };
    window.addEventListener('about-section-visible', handleAboutVisible);
    return () => window.removeEventListener('about-section-visible', handleAboutVisible);
  }, []);

  // Track scroll để thêm glassmorphism header
  useEffect(() => {
    const handleScroll: EventListener = () => {
      const scrollEl = document.querySelector('[data-scroll-container]') as HTMLElement || document.documentElement;
      setIsScrolled(scrollEl.scrollTop > 60 || window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Lắng nghe cả scroll của R3F ScrollControls (dùng custom event)
    const scrollEl = document.querySelector('.overflow-auto, [style*="overflow"]');
    scrollEl?.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      scrollEl?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Escape key handler cho modals
  const handleClose = useCallback(() => {
    if (contactOpen) setContactOpen(false);
    else if (modalOpen) setModalOpen(false);
  }, [contactOpen, modalOpen, setModalOpen]);

  useEscapeKey(handleClose);

  const currentDetail = projects[activeProject] || null;

  // Deep linking sync
  useEffect(() => {
    if (modalOpen && currentDetail) {
      window.history.replaceState(null, '', `#${projectSlug(currentDetail)}`);
    } else if (!modalOpen && window.location.hash && !['#about', '#contact'].includes(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [modalOpen, currentDetail]);

  // removed isMobileScreen state that was causing unused error
  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className={`fixed top-0 left-0 w-full h-1 z-[120] transition-opacity duration-300 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-200'} ${modalOpen || contactOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

      <header 
        className={`fixed top-0 left-0 w-full px-6 md:px-12 py-5 md:py-6 flex justify-between items-center z-50 pointer-events-auto transition-all duration-500 ${
          isScrolled
            ? `${isDarkMode ? 'bg-[#171819]/90 border-b border-white/10' : 'bg-[#fdfbf7]/85 border-b border-[#1a1a1a]/8'} backdrop-blur-md shadow-sm py-3 md:py-4`
            : 'bg-transparent'
        }`}
      >
        <div className="w-1/3 hidden md:block">
        </div>
        <div className={`hidden md:flex items-center justify-center space-x-8 lg:space-x-10 text-sm font-medium w-1/3 ${isDarkMode ? 'text-stone-200' : 'text-[#444444]'}`}>
          <button onClick={() => { navigate('/#about'); window.dispatchEvent(new CustomEvent('scroll-to-about')); }} className={`hover:text-amber-700 transition-colors ${isAboutActive ? 'text-amber-700' : ''}`}>{t.nav.story}</button>
          <Link to="/services" className="hover:text-amber-700 transition-colors">{t.nav.services}</Link>
          <Link to="/projects" className="hover:text-amber-700 transition-colors">{t.nav.projects}</Link>
          <Link to="/shop" className="hover:text-amber-700 transition-colors">{t.nav.library}</Link>
          <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors">{t.nav.contact}</button>
        </div>
        <div className="w-full md:w-1/3 flex justify-end text-sm text-[#888888]">
          <LanguageSwitcher dark={isDarkMode} />
        </div>
      </header>

      {/* Floating Bottom Nav for Mobile */}
      <MobileNav onContactClick={() => setContactOpen(true)} />

      {/* Cùng một bố cục desktop cho dự án mở từ không gian 3D và danh sách. */}
      <AnimatePresence>
      {modalOpen && currentDetail && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#e5dfd5]/90 backdrop-blur-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        }>
          <DesktopProjectViewer
            key={currentDetail._id}
            project={currentDetail}
            onClose={() => setModalOpen(false)}
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
