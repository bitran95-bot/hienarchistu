import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ContactModal } from './ui/ContactModal';

export function SubpageNavigation() {
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (window.location.hash === '#contact') {
      setContactOpen(true);
    }
  }, []);

  const navLinkClass = (path: string) =>
    `hover:text-amber-700 transition-colors relative ${
      location.pathname === path
        ? 'text-amber-700 after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1.5px] after:bg-amber-700 after:rounded-full'
        : ''
    }`;

  return (
    <>
      {/* Header - Desktop */}
      <header className="sticky top-0 z-50 bg-[#fdfbf7]/90 backdrop-blur-lg border-b border-stone-200/50">
        <div className="px-6 md:px-12 py-4 md:py-6 flex justify-between items-center w-full">
          {/* Logo (Left) */}
          <div className="w-full md:w-1/3 flex justify-start">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="font-heading font-bold text-[#2a2a2a] leading-none group-hover:text-amber-700 transition-colors">
                <span className="text-2xl">HIÊN</span>
                <span className="text-lg ml-1">studio</span>
              </div>
            </Link>
          </div>
          
          {/* Menu (Center - Desktop Only) */}
          <nav className="hidden md:flex items-center justify-center space-x-12 text-sm font-medium text-[#444444] w-1/3" aria-label="Main navigation">
            <a href="/#about" className="hover:text-amber-700 transition-colors">{t.nav.story}</a>
            <Link to="/projects" className={navLinkClass('/projects')}>{t.nav.projects}</Link>
            <Link to="/shop" className={navLinkClass('/shop')}>{t.nav.library}</Link>
            <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors">{t.nav.contact}</button>
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex w-1/3 justify-end text-sm text-[#888888]">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Floating Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center space-x-5 text-xs font-medium text-[#444444] z-50 pointer-events-auto border border-stone-200/50" aria-label="Mobile navigation">
        <a href="/#about" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.story}</a>
        <Link to="/projects" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.projects}</Link>
        <Link to="/shop" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.library}</Link>
        <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.contact}</button>
        <LanguageSwitcher />
      </nav>

      {/* CONTACT FULLPAGE MODAL */}
      <AnimatePresence>
        {contactOpen && (
          <ContactModal variant="split" onClose={() => setContactOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
