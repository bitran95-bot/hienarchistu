import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useTranslation } from '../../i18n';
import { useStore } from '../../store/useStore';

interface ContactModalProps {
  /** 'centered' = homepage single-column | 'split' = subpage two-column with form */
  variant?: 'centered' | 'split';
  onClose: () => void;
}

/**
 * Contact modal dùng chung cho cả trang chính (Overlay) và subpages (SubpageNavigation).
 * - variant='centered': chỉ hiển thị thông tin liên hệ, giữa trang.
 * - variant='split': hai cột — bên trái thông tin, bên phải form gửi email qua API.
 */
export function ContactModal({ variant = 'centered', onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const { settings } = useStore();

  // Form state (only used in 'split' variant)
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });

      if (resp.ok) {
        setFormState('success');
        form.reset();
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }, []);

  const phone = settings?.phone || '033 877 7017';
  const phoneTel = phone.replace(/ /g, '');
  const email = settings?.email || 'thaibao95arc@gmail.com';
  const instagram = settings?.instagram || 'https://instagram.com/hien.archi';
  const igHandle = (() => {
    try { return new URL(instagram).pathname.replace(/\//g, ''); }
    catch { return instagram; }
  })();

  const isCentered = variant === 'centered';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      className="fixed inset-0 z-[110] bg-[#fdfbf7] pointer-events-auto flex flex-col overflow-y-auto"
      style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.contact}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 md:p-12 w-full">
        <div className="text-2xl md:text-3xl font-heading font-bold tracking-tighter text-[#2a2a2a]">HIÊN studio</div>
        <button
          onClick={onClose}
          className="text-2xl font-medium hover:text-amber-700 transition-colors flex items-center gap-2 md:gap-3 group"
          aria-label={t.contact.close}
        >
          <span className="uppercase text-xs md:text-sm tracking-widest font-bold hidden md:inline">{t.contact.close}</span>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#2a2a2a] group-hover:border-amber-700 flex items-center justify-center transition-colors">
            <span className="mb-1 text-xl md:text-2xl leading-none" aria-hidden="true">×</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 flex ${isCentered ? 'flex-col' : 'flex-col md:flex-row'} px-6 pb-12 pt-4 md:p-12 lg:p-24 ${isCentered ? '' : 'gap-12 lg:gap-24'} h-full ${isCentered ? 'max-w-4xl' : 'max-w-7xl'} mx-auto w-full ${isCentered ? 'justify-center' : ''}`}>
        {/* Contact Info */}
        <div className={`${isCentered ? 'w-full' : 'w-full md:w-1/2'} flex flex-col justify-center ${isCentered ? 'items-center text-center' : ''}`}>
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl md:text-8xl font-heading font-bold leading-[0.9] text-[#2a2a2a] uppercase tracking-tighter"
          >
            Let's<br />Talk.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 md:mt-${isCentered ? '10' : '8'} text-${isCentered ? 'lg md:text-2xl' : 'base md:text-xl'} text-stone-600 font-serif italic ${isCentered ? 'max-w-2xl mb-12 md:mb-16' : 'max-w-md border-l-4 border-amber-700 pl-4 mb-10'}`}
          >
            {t.contact.quote}
          </motion.p>

          <div className={`${isCentered ? 'space-y-10 flex flex-col items-center' : 'space-y-6'}`}>
            <motion.div initial={{ opacity: 0, [isCentered ? 'y' : 'x']: 20 }} animate={{ opacity: 1, [isCentered ? 'y' : 'x']: 0 }} transition={{ delay: 0.4 }}>
              <h3 className={`text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-${isCentered ? '2' : '1'}`}>{t.contact.phone}</h3>
              <a href={`tel:${phoneTel}`} className={`text-${isCentered ? '3xl md:text-5xl' : '2xl'} font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors`}>
                {phone}
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, [isCentered ? 'y' : 'x']: 20 }} animate={{ opacity: 1, [isCentered ? 'y' : 'x']: 0 }} transition={{ delay: 0.5 }}>
              <h3 className={`text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-${isCentered ? '2' : '1'}`}>Email</h3>
              <a href={`mailto:${email}`} className={`text-${isCentered ? '3xl md:text-5xl' : '2xl'} font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors break-all`}>
                {email}
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, [isCentered ? 'y' : 'x']: 20 }} animate={{ opacity: 1, [isCentered ? 'y' : 'x']: 0 }} transition={{ delay: 0.6 }}>
              <h3 className={`text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-${isCentered ? '2' : '1'}`}>Instagram</h3>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className={`text-${isCentered ? '3xl md:text-5xl' : '2xl'} font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors flex items-center ${isCentered ? 'justify-center' : ''} gap-2 ${isCentered ? 'md:gap-4' : ''} group ${isCentered ? 'w-fit mx-auto' : 'w-fit'}`}>
                {igHandle}
                <span className={`transform group-hover:translate-x-${isCentered ? '2' : '1'} group-hover:-translate-y-${isCentered ? '2' : '1'} transition-transform text-amber-700`}>↗</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Contact Form — split variant only */}
        {!isCentered && (
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <motion.form
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6 bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-stone-200/50 shadow-xl"
              onSubmit={handleSubmit}
            >
              <h3 className="text-2xl font-heading font-bold text-[#2a2a2a] mb-6">{t.contactForm.title}</h3>

              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm.name}</label>
                <input id="contact-name" name="name" required type="text" placeholder={t.contactForm.namePlaceholder} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a]" />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm.email}</label>
                <input id="contact-email" name="email" required type="email" placeholder={t.contactForm.emailPlaceholder} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a]" />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm.message}</label>
                <textarea id="contact-message" name="message" required placeholder={t.contactForm.messagePlaceholder} rows={4} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a] resize-none" />
              </div>

              {formState === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  ✅ {t.contactForm.success}
                </div>
              )}
              {formState === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  ❌ {t.contactForm.error}
                </div>
              )}

              <button
                type="submit"
                disabled={formState === 'sending'}
                className="w-full bg-[#2a2a2a] text-white py-4 font-bold tracking-widest uppercase text-sm hover:bg-amber-700 transition-colors rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formState === 'sending' ? t.contactForm.sending : t.contactForm.send}
              </button>
            </motion.form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
