import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { OG_IMAGE_URL, pageUrl } from '../config/site';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { SubpageNavigation } from '../components/SubpageNavigation';
import { RevealHeading } from '../components/ui/EditorialMotion';
import { ContactModal } from '../components/ui/ContactModal';

export default function ServicesPage() {
  const { t, lang } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const steps = t.servicesPage.steps;
  const currentStep = steps[activeStepIndex];

  // Minimalist outline SVG icons for each step
  const getStepIcon = (id: string) => {
    switch (id) {
      case '01':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        );
      case '02':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.5L5 20m8.5-13.5L19 20M8 15h8" />
          </svg>
        );
      case '03':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6l-8 4 8 4 8-4-8-4zm0 6l-8 4 8 4 8-4-8-4z" />
          </svg>
        );
      case '04':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        );
      case '05':
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        );
      case '06':
      default:
        return (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        );
    }
  };

  const renderDetails = (step: typeof currentStep) => (
    <motion.div key={step.id} initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .3 }} className="py-6">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <div><p className="mb-2 text-xs uppercase tracking-widest text-stone-500">{t.servicesPage.step} {step.id} / 06</p>
          <h2 className="text-2xl font-serif font-bold md:text-4xl">{step.title}</h2></div>
        <p className="text-sm text-stone-600">{t.servicesPage.duration}: <strong>{step.duration}</strong></p>
      </div>
      <svg viewBox="0 0 480 110" aria-hidden="true" className="mb-8 h-24 w-full max-w-lg text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.2">
        <motion.path key={step.id} d="M8 90H472 M50 89V35L160 8 270 35V89 M70 89V42L160 20 250 42V89 M100 89V55H145V89 M180 89V55H225V89 M290 89V42H425V89 M305 55H410V77H305Z"
          initial={{ pathLength: reducedMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reducedMotion ? 0 : .5 }} />
      </svg>
      <div className="grid gap-6 md:grid-cols-2 md:gap-12">
        {step.details.map(detail => <div key={detail.label}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">{detail.label}</h3>
          <p className="text-base leading-relaxed text-stone-700">{detail.text}</p>
        </div>)}
      </div>
      <div className="mt-8 border-t border-stone-200 pt-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500">{t.servicesPage.deliverable}</h3>
        <p className="font-medium leading-relaxed">{step.deliverable}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#fcfbf9] selection:bg-stone-300 text-[#1a1a1a] font-sans">
      <Helmet>
        <title>{`${t.servicesPage.title} | Hiên Archi Studio`}</title>
        <meta name="description" content={t.servicesPage.subtitle} />
        <link rel="canonical" href={pageUrl('/services')} />
        <meta property="og:title" content={`${t.servicesPage.title} | Hiên Archi Studio`} />
        <meta property="og:description" content={t.servicesPage.subtitle} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl('/services')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${t.servicesPage.title} | Hiên Archi Studio`} />
        <meta name="twitter:description" content={t.servicesPage.subtitle} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
      </Helmet>

      <SubpageNavigation />

      {/* Minimalist Header */}
      <header className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pb-8 border-b border-stone-200/60"
        >
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-stone-400 block mb-3">
            {t.servicesPage.step} 01 — 06
          </span>
          <RevealHeading as="h1" className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#1a1a1a] mb-4 leading-tight">
            {t.servicesPage.title}
          </RevealHeading>
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed">
            {t.servicesPage.subtitle}
          </p>
        </motion.div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-12 md:px-12">
        <div className="mb-10 max-w-3xl text-base leading-relaxed text-stone-600">
          <p>{lang === 'vi' ? 'Từ định hướng kiến trúc, tổ chức không gian đến thiết kế nội thất và hồ sơ kỹ thuật. Phạm vi công việc, sản phẩm bàn giao và tiến độ sẽ được thống nhất theo nhu cầu của từng dự án.' : 'From architectural direction and spatial planning to interiors and technical documentation. Scope, deliverables and schedule are agreed around the needs of each project.'}</p>
        </div>
        <div className="lg:hidden">
          {steps.map((step, idx) => <div key={step.id} className="border-t border-stone-300">
            <button id={`step-trigger-${step.id}`} type="button" aria-expanded={activeStepIndex === idx}
              aria-controls={`step-panel-${step.id}`} onClick={() => {
                setActiveStepIndex(idx);
                requestAnimationFrame(() => document.getElementById(`step-trigger-${step.id}`)?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' }));
              }}
              className="flex w-full scroll-mt-24 items-center gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-amber-700">
              <span className="text-sm text-stone-500">{step.id}</span>
              <span className="flex-1 font-serif text-lg">{step.title}</span><span aria-hidden="true">{activeStepIndex === idx ? '−' : '+'}</span>
            </button>
            <div id={`step-panel-${step.id}`} role="region" aria-labelledby={`step-trigger-${step.id}`} hidden={activeStepIndex !== idx}>
              {activeStepIndex === idx && renderDetails(step)}
            </div>
          </div>)}
        </div>
        <div className="hidden lg:block">
          <div className="grid grid-cols-6 gap-8" aria-label={t.servicesPage.title}>
            {steps.map((step, idx) => <button type="button" key={step.id} aria-pressed={activeStepIndex === idx}
              aria-controls="desktop-step-detail" onClick={() => setActiveStepIndex(idx)}
              onKeyDown={event => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                event.preventDefault();
                const next = (idx + (event.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length;
                setActiveStepIndex(next);
                (event.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
              }} className="group relative flex flex-col items-start border-t border-stone-200 py-5 text-left focus-visible:outline-2 focus-visible:outline-amber-700">
              <motion.span aria-hidden="true" className="absolute -top-px left-0 h-px w-full origin-left bg-stone-900" initial={false} animate={{ scaleX: activeStepIndex === idx ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : .35 }} />
              <span className="mb-4 font-serif text-xl">{step.id}</span>
              <span className="mb-4">{getStepIcon(step.id)}</span>
              <span className="mb-3 font-serif text-lg font-semibold">{step.title.split('(')[0]}</span>
              <span className="text-sm leading-relaxed text-stone-600">{step.summary}</span>
            </button>)}
          </div>
          <div id="desktop-step-detail" className="mt-10 border-t border-stone-200" aria-live="polite">{renderDetails(currentStep)}</div>
        </div>
      </section>

      {/* Minimalist Philosophy Statement (Font chữ ngay ngắn, tối giản) */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-stone-200/60 text-center">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">
          {lang === 'vi' ? 'Triết lý đồng hành' : 'Our approach'}
        </h3>
        <p className="text-xl sm:text-2xl font-sans font-normal text-[#1a1a1a] leading-relaxed max-w-3xl mx-auto">
          {lang === 'vi' ? 'Quy trình thiết kế là hành trình thấu hiểu và kiến tạo không gian sống bền vững, thích ứng với tự nhiên và tôn trọng bản sắc của gia chủ.' : 'Design begins with understanding people: creating lasting spaces that respond to nature and reflect the identity of those who live in them.'}
        </p>
      </section>

      {/* Minimalist CTA Section */}
      <section className="py-20 px-6 md:px-12 bg-[#1a1a1a] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight mb-4 leading-tight">
            {t.servicesPage.ctaTitle}
          </h2>
          <p className="text-stone-400 text-base sm:text-lg mb-10 font-sans font-normal leading-relaxed">
            {t.servicesPage.ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setContactOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-stone-200 text-[#1a1a1a] font-sans font-bold text-sm tracking-wide transition-all duration-300 shadow-md"
            >
              {t.servicesPage.ctaButton}
            </button>
            <Link
              to="/projects"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white font-sans font-bold text-sm tracking-wide border border-white/20 transition-all duration-300"
            >
              {t.servicesPage.exploreProjects}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-[#121212] border-t border-white/5 text-stone-500 text-center text-xs font-mono">
        <p>© {new Date().getFullYear()} Hiên Archi Studio. All rights reserved.</p>
      </footer>

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
            className="fixed bottom-24 md:bottom-8 right-6 w-11 h-11 bg-[#1a1a1a] text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-stone-800 transition-colors border border-white/10"
            title={t.nav.backToTop}
            aria-label={t.nav.backToTop}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {contactOpen && <ContactModal variant="centered" onClose={() => setContactOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
