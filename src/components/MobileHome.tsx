import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getResponsiveImageProps } from '../utils/image';
import { useEscapeKey } from '../hooks';
import { ContactModal } from './ui/ContactModal';
import { RecoveryMessage } from './ui/RecoveryMessage';
import { LanguageSwitcher } from './LanguageSwitcher';
import { projectPath } from '../utils/projectSlug';
import { useTranslation } from '../i18n';

/**
 * MobileHome — Trang chủ 2D tối giản, phong cách editorial
 */
export const MobileHome = memo(function MobileHome() {
  const { projects, settings, isDataLoaded, error, fetchData } = useStore();
  const [contactOpen, setContactOpen] = useState(false);
  const { t, lang } = useTranslation();
  const { hash } = useLocation();

  const handleEscape = useCallback(() => {
    if (contactOpen) setContactOpen(false);
  }, [contactOpen]);
  useEscapeKey(handleEscape);

  useEffect(() => {
    if (hash !== '#about') return;
    const frame = requestAnimationFrame(() => document.getElementById('about')?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, []);

  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = currentDate.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'long' });
  const year = currentDate.getFullYear();
  const intro = lang === 'vi' ? settings?.heroDescription || t.mobile.introFallback : t.mobile.introFallback;

  return (
    <div className="min-h-screen bg-[#f1efe7] text-[#1a1a1a] overflow-x-hidden selection:bg-[#d8d3c5] font-sans">

      {/* ━━━ HERO SECTION ━━━ */}
      <section
        className="relative min-h-[100dvh] flex flex-col px-8 pt-12 pb-12"
        style={{
          backgroundImage: 'linear-gradient(rgba(241,239,231,0.38), rgba(241,239,231,0.55)), url(/textures/sunlit-wall-highres.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: '36% center',
        }}
      >
        
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
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => setContactOpen(true)} className="text-xs font-bold uppercase tracking-wider border-b border-[#1a1a1a] pb-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700">
              {t.nav.contact} <span aria-hidden="true">↗</span>
            </button>
          </div>
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
          className="mb-12 flex-grow flex flex-col items-start"
        >
          <div id="about" className="w-[85%] max-w-[320px] scroll-mt-12">
            <p 
              className="text-[14px] font-medium leading-[1.7] text-[#1a1a1a]/90 text-justify"
              style={{ textWrap: 'pretty' }}
            >
              '{intro}'
            </p>
            <p className="text-[13px] font-bold mt-6 tracking-wide text-left">
              {t.mobile.architect}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => scrollToSection('mobile-projects')} className="rounded-full bg-[#1a1a1a] px-5 py-3 text-xs font-bold text-[#f1efe7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
              {t.mobile.viewProjects} <span aria-hidden="true">↗</span>
            </button>
            <button onClick={() => setContactOpen(true)} className="rounded-full border border-[#1a1a1a] px-5 py-3 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
              {t.nav.contact}
            </button>
          </div>
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
            <button 
              onClick={() => scrollToSection('mobile-projects')}
              className="text-[10px] font-semibold text-[#1a1a1a]/60 leading-tight uppercase tracking-wider text-left hover:opacity-70 transition-opacity"
            >
              {t.mobile.portfolioBy}<br/>
              <span className="text-[11px] font-bold text-[#1a1a1a] underline decoration-[#1a1a1a]/30 underline-offset-2">Hiên Studio</span>
            </button>
            <a 
              href="https://maps.app.goo.gl/tMetdduMktGKcSf76" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-[#1a1a1a]/60 leading-tight uppercase tracking-wider text-right hover:opacity-70 transition-opacity"
            >
              {t.mobile.basedIn}<br/>
              <span className="text-[11px] font-bold text-[#1a1a1a] underline decoration-[#1a1a1a]/30 underline-offset-2">Vietnam</span>
            </a>
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
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2">{t.mobile.scroll}</span>
              <div className="w-[1px] h-8 bg-[#1a1a1a] origin-top animate-pulse" />
           </button>
        </motion.div>
      </section>

      {/* ━━━ PROJECTS SECTION ━━━ */}
      <section id="mobile-projects" className="px-8 py-20 bg-[#ebe6db]">
        <div className="mb-16 flex items-center">
          <h2 className="text-[32px] font-black tracking-tight uppercase">{t.nav.projects}</h2>
          <div className="w-full h-[1.5px] bg-[#1a1a1a] ml-6 opacity-20" />
        </div>

        {error ? <RecoveryMessage onRetry={() => void fetchData()} /> : !isDataLoaded ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#e0dbd0] mb-2" />
                <div className="h-3 bg-[#e0dbd0] w-2/3 mb-1" />
                <div className="h-3 bg-[#e0dbd0] w-1/3" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-[#1a1a1a]/50 text-sm font-medium">{t.mobile.noProjects}</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {projects.map((project, idx) => {
              const imgProps = getResponsiveImageProps({
                source: project.image,
                aspectRatio: 4 / 5,
                baseWidth: 300,
                sizes: '(max-width: 768px) 33vw, 200px',
                className: 'w-full h-full object-cover transition-transform duration-700 hover:scale-105',
                alt: project.name,
                loading: idx < 6 ? 'eager' : 'lazy'
              });

              return (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: (idx % 3) * 0.1 }}
                >
                  <Link
                    to={projectPath(project)}
                    state={{ returnTo: '/' }}
                    aria-label={`${t.projectDetail.viewDetail}: ${project.name}`}
                    className="group flex flex-col rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-700"
                  >
                  <div className="relative aspect-[4/5] bg-[#e0dbd0] mb-2 overflow-hidden">
                    {imgProps ? (
                      <img {...imgProps} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]/30 text-[10px] font-medium">
                        {t.mobile.noImage}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[11px] sm:text-[13px] font-bold leading-tight tracking-tight line-clamp-2">
                      {project.name}
                    </h3>
                  </div>
                  </Link>
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
            {intro.length > 100 ? `${intro.slice(0, 100)}...` : intro}
          </p>
        </div>
        
        <div className="w-full h-[1px] bg-white/10 mb-8" />
        
        <div className="flex flex-col gap-4 text-[13px] font-bold tracking-wide uppercase">
          <a href={`tel:${(settings?.phone || '033 877 7017').replace(/ /g, '')}`} className="flex items-center justify-between py-2 border-b border-white/5">
            <span>{t.contact.phone}</span>
            <span className="text-white/60 font-medium">{settings?.phone || '033 877 7017'}</span>
          </a>
          <a href={`mailto:${settings?.email || 'thaibao95arc@gmail.com'}`} className="flex items-center justify-between py-2 border-b border-white/5">
            <span>Email</span>
            <span className="text-white/60 font-medium lowercase tracking-normal">{settings?.email || 'thaibao95arc@gmail.com'}</span>
          </a>
          <Link to="/services" className="flex items-center justify-between py-2 border-b border-white/5">
            <span>{t.nav.services}</span>
            <span className="text-white/60 font-medium">{t.mobile.viewProcess} →</span>
          </Link>
          <Link to="/shop" className="flex items-center justify-between py-2 border-b border-white/5">
            <span>{t.nav.library}</span>
            <span className="text-white/60 font-medium">{t.mobile.viewProducts} →</span>
          </Link>
        </div>
        
        <div className="mt-16 text-[10px] font-semibold text-white/40 tracking-widest uppercase text-center">
          © {new Date().getFullYear()} HIÊN STUDIO. {t.mobile.rights}
        </div>
      </footer>

      {/* ━━━ CONTACT MODAL ━━━ */}
      <AnimatePresence>
        {contactOpen && (
          <ContactModal variant="centered" onClose={() => setContactOpen(false)} />
        )}
      </AnimatePresence>

    </div>
  );
});
