import { motion } from 'framer-motion';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';
import { useStore } from '../../store/useStore';
import { withTimeout } from '../../utils/request';

interface ContactModalProps {
  /** Both entry variants include the same consultation form. */
  variant?: 'centered' | 'split';
  onClose: () => void;
  projectName?: string;
}

/** One consultation form for homepage, navigation and project viewers. */
export function ContactModal({ onClose, projectName }: ContactModalProps) {
  const { t, lang } = useTranslation();
  const { settings } = useStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previousFocus?.focus();
    };
  }, []);

  // All entry points share the same form and delivery feedback.
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [rateLimited, setRateLimited] = useState(false);
  const [emailDraft, setEmailDraft] = useState<{ name: string; email: string; message: string } | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState === 'sending') return;
    setFormState('sending');
    setRateLimited(false);

    const form = e.currentTarget;
    const formData = new FormData(form);
    setEmailDraft({
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      message: String(formData.get('message') || ''),
    });

    try {
      const { resp, data } = await withTimeout(async (signal) => {
        const resp = await fetch('/api/contact', {
          method: 'POST',
          signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            project: projectName || undefined,
            page: window.location.pathname,
            website: formData.get('website'),
          }),
        });
        const data: unknown = await resp.json();
        return { resp, data };
      });

      if (resp.ok && data && typeof data === 'object' && 'success' in data && data.success === true && !('mode' in data)) {
        setFormState('success');
        form.reset();
      } else {
        setRateLimited(resp.status === 429);
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }, [formState, projectName]);

  const phone = settings?.phone || '033 877 7017';
  const phoneTel = phone.replace(/ /g, '');
  const email = settings?.email || 'thaibao95arc@gmail.com';
  const emailDraftUrl = emailDraft
    ? `mailto:${email}?subject=${encodeURIComponent(`[Hiên Studio] Liên hệ từ ${emailDraft.name}`)}&body=${encodeURIComponent(`${emailDraft.message}\n\nNgười gửi: ${emailDraft.name}\nEmail: ${emailDraft.email}`)}`
    : `mailto:${email}`;
  const instagram = settings?.instagram || 'https://instagram.com/hien_arc';
  const igHandle = (() => {
    try { return new URL(instagram).pathname.replace(/\//g, ''); }
    catch { return instagram; }
  })();


  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
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
      <div className="sticky top-0 z-10 flex shrink-0 justify-between items-center bg-[#fdfbf7]/95 p-6 md:px-12 md:py-8 w-full">
        <div className="text-2xl md:text-3xl font-heading font-bold tracking-tighter text-[#2a2a2a]">HIÊN studio</div>
        <button
          ref={closeButtonRef}
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
      <div className="flex flex-col md:flex-row px-6 pb-12 pt-4 md:p-12 lg:px-24 gap-12 lg:gap-20 max-w-7xl mx-auto w-full">
        {/* Contact Info */}
        <div className="order-2 md:order-1 w-full min-w-0 md:w-1/2 flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl md:text-8xl font-heading font-bold leading-[0.9] text-[#2a2a2a] uppercase tracking-tighter"
          >
            {t.contact.headlineTop}<br />{t.contact.headlineBottom}
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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-1">{t.contact.phone}</h3>
              <a href={`tel:${phoneTel}`} className="text-2xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors">
                {phone}
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-1">Email</h3>
              <a href={`mailto:${email}`} className="break-all text-xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors">
                {email}
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] mb-1">Instagram</h3>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-2xl font-medium text-[#2a2a2a] hover:text-amber-700 transition-colors flex items-center gap-2 group w-fit motion-link">
                {igHandle}
                <span className="text-amber-700">↗</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* The form comes first on narrow screens. */}
          <div className="order-1 md:order-2 w-full min-w-0 md:w-1/2 flex flex-col justify-center">
            <motion.form
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              aria-busy={formState === 'sending'}
              className="space-y-6 bg-white/50 backdrop-blur-sm p-5 sm:p-8 rounded-2xl border border-stone-200/50 shadow-xl"
              onSubmit={handleSubmit}
            >
              <h3 className="text-2xl font-heading font-bold text-[#2a2a2a] mb-6">{t.contactForm.title}</h3>

              {projectName && <p className="text-sm text-stone-600">{lang === 'vi' ? 'Dự án tham khảo' : 'Reference project'}: <strong>{projectName}</strong></p>}
              <div hidden aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" autoComplete="off" tabIndex={-1} /></div>
              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm.name}</label>
                <input id="contact-name" name="name" autoComplete="name" required maxLength={100} disabled={formState === 'sending'} type="text" placeholder={t.contactForm.namePlaceholder} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a]" />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm.email}</label>
                <input id="contact-email" name="email" autoComplete="email" required maxLength={254} disabled={formState === 'sending'} type="email" placeholder={t.contactForm.emailPlaceholder} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a]" />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t.contactForm.message}</label>
                <textarea id="contact-message" name="message" defaultValue={projectName ? (lang === 'vi' ? `Tôi muốn được tư vấn một dự án tương tự ${projectName}.\n` : `I would like to discuss a project similar to ${projectName}.\n`) : ''} required maxLength={5000} disabled={formState === 'sending'} placeholder={t.contactForm.messagePlaceholder} rows={4} className="w-full bg-transparent border-b-2 border-stone-300 py-2 focus:border-amber-700 outline-none transition-colors text-[#2a2a2a] resize-none" />
              </div>

              {formState === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  ✅ {t.contactForm.success}
                </div>
              )}
              {formState === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                  <p>❌ {rateLimited ? t.contactForm.rateLimited : t.contactForm.error}</p>
                  <a href={emailDraftUrl} className="mt-2 inline-block font-semibold underline underline-offset-2">{t.contactForm.emailInstead} ↗</a>
                </div>
              )}

              <button
                type="submit"
                disabled={formState === 'sending'}
                className="w-full bg-[#2a2a2a] text-white py-4 font-bold tracking-widest uppercase text-sm hover:bg-amber-700 transition-colors rounded-lg mt-4 motion-link disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formState === 'sending' ? t.contactForm.sending : t.contactForm.send}
              </button>
            </motion.form>
          </div>
      </div>
    </motion.div>
  );
}
