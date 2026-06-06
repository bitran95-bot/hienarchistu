import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useStore } from '../store/useStore';

export function SubpageNavigation() {
  const { t } = useTranslation();
  const { settings } = useStore();
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#contact') {
      setContactOpen(true);
    }
  }, []);

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
          <div className="hidden md:flex items-center justify-center space-x-12 text-sm font-medium text-[#444444] w-1/3">
            <a href="/#about" className="hover:text-amber-700 transition-colors">{t.nav.story}</a>
            <Link to="/projects" className="hover:text-amber-700 transition-colors">{t.nav.projects}</Link>
            <Link to="/shop" className="hover:text-amber-700 transition-colors">{t.nav.library}</Link>
            <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors">{t.nav.contact}</button>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex w-1/3 justify-end text-sm text-[#888888]">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Floating Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center space-x-5 text-xs font-medium text-[#444444] z-50 pointer-events-auto border border-stone-200/50">
        <a href="/#about" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.story}</a>
        <Link to="/projects" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.projects}</Link>
        <Link to="/shop" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.library}</Link>
        <button onClick={() => setContactOpen(true)} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.contact}</button>
        <LanguageSwitcher />
      </div>

      {/* CONTACT FULLPAGE MODAL */}
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
          <div className="flex-1 flex flex-col md:flex-row px-6 pb-12 pt-4 md:p-12 lg:p-24 gap-12 lg:gap-24 h-full max-w-7xl mx-auto w-full">
             {/* Left side: Info */}
             <div className="w-full md:w-1/2 flex flex-col justify-center">
                <motion.h2 
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -50 }}
                   transition={{ delay: 0.2, duration: 0.5 }}
                   className="text-6xl md:text-8xl font-heading font-bold leading-[0.9] text-[#2a2a2a] uppercase tracking-tighter"
                >
                   Let's<br/>Talk.
                </motion.h2>
                <motion.p 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ delay: 0.3 }}
                   className="mt-6 md:mt-8 text-base md:text-xl text-stone-600 font-serif italic max-w-md border-l-4 border-amber-700 pl-4 mb-10"
                >
                   {t.contact.quote}
                </motion.p>
                
                <div className="space-y-6">
                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">{t.contact.phone}</h3>
                      <a href={`tel:${settings?.phone?.replace(/ /g, '') || '0338777017'}`} className="text-2xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors">
                         {settings?.phone || '033 877 7017'}
                      </a>
                   </motion.div>
                   
                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Email</h3>
                      <a href={`mailto:${settings?.email || 'thaibao95arc@gmail.com'}`} className="text-2xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors break-all">
                         {settings?.email || 'thaibao95arc@gmail.com'}
                      </a>
                   </motion.div>

                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Instagram</h3>
                      <a href={settings?.instagram || "https://instagram.com/hien.archi"} target="_blank" rel="noopener noreferrer" className="text-2xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors flex items-center gap-2 group w-fit">
                         {settings?.instagram ? (() => { try { return new URL(settings.instagram).pathname.replace(/\//g, ''); } catch(e) { return settings.instagram; }})() : 'hien.archi'}
                         <span className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-amber-700">↗</span>
                      </a>
                   </motion.div>
                </div>
             </div>

             {/* Right side: Contact Form */}
             <div className="w-full md:w-1/2 flex flex-col justify-center">
                <motion.form 
                   initial={{ opacity: 0, y: 50 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   transition={{ delay: 0.4 }}
                   className="space-y-6 bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-stone-200/50 shadow-xl"
                   onSubmit={(e) => {
                     e.preventDefault();
                     alert(t.contactForm?.success || "Thành công!");
                   }}
                >
                   <h3 className="text-2xl font-heading font-bold text-[#2a2a2a] mb-6">{t.contactForm?.title || "Gửi tin nhắn"}</h3>
                   
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm?.name || "Họ và tên"}</label>
                      <input required type="text" placeholder={t.contactForm?.namePlaceholder || "Nguyễn Văn A"} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a]" />
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm?.email || "Email"}</label>
                      <input required type="email" placeholder={t.contactForm?.emailPlaceholder || "email@example.com"} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a]" />
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm?.message || "Tin nhắn"}</label>
                      <textarea required placeholder={t.contactForm?.messagePlaceholder || "Mô tả yêu cầu..."} rows={4} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a] resize-none"></textarea>
                   </div>
                   
                   <button type="submit" className="w-full bg-[#2a2a2a] text-white py-4 font-bold tracking-widest uppercase text-sm hover:bg-amber-700 transition-colors rounded-lg mt-4">
                      {t.contactForm?.send || "Gửi tin nhắn"}
                   </button>
                </motion.form>
             </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
