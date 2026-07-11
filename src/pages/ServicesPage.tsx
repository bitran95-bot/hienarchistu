import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { SubpageNavigation } from '../components/SubpageNavigation';
import { ContactModal } from '../components/ui/ContactModal';

export default function ServicesPage() {
  const { t } = useTranslation();
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

  // Keyboard navigation for steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length]);

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

  // Short summary descriptions for the monograph columns
  const getStepSummary = (id: string) => {
    switch (id) {
      case '01':
        return 'Khởi đầu bằng việc lắng nghe sâu sắc nhu cầu, khảo sát hiện trạng và phân tích ngân sách đầu tư.';
      case '02':
        return 'Chuyển hóa ý tưởng thành mặt bằng sơ phác 2D và định hướng phong cách kiến trúc qua Moodboard.';
      case '03':
        return 'Thống nhất phương án thiết kế sơ bộ, chi phí thực hiện và ký kết hợp đồng chính thức.';
      case '04':
        return 'Dựng phối cảnh 3D trực quan hóa không gian thực tế với đầy đủ ánh sáng, màu sắc và vật liệu.';
      case '05':
        return 'Chi tiết hóa kỹ thuật, lựa chọn vật liệu cao cấp và khai triển bộ hồ sơ thi công chuẩn xác.';
      case '06':
        return 'Giám sát tác giả nghiêm ngặt, đảm bảo từng chi tiết thi công đều tuân thủ thiết kế và tiêu chuẩn.';
      default:
        return '';
    }
  };

  // Framer motion variants for staggered animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] selection:bg-stone-300 text-[#1a1a1a] font-sans">
      <Helmet>
        <title>{`${t.servicesPage.title} | Hiên Archi Studio`}</title>
        <meta name="description" content={t.servicesPage.subtitle} />
        <meta property="og:title" content={`${t.servicesPage.title} | Hiên Archi Studio`} />
        <meta property="og:description" content={t.servicesPage.subtitle} />
        <meta property="og:type" content="website" />
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#1a1a1a] mb-4 leading-tight">
            {t.servicesPage.title}
          </h1>
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl font-normal leading-relaxed">
            {t.servicesPage.subtitle}
          </p>
        </motion.div>
      </header>

      {/* Monograph Horizontal Column Layout (Áp dụng đúng layout như ảnh mẫu: Top line -> Number -> Icon -> Serif Title -> Summary Text) */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className="group text-left relative flex flex-col justify-start focus:outline-none transition-all duration-300"
              >
                {/* Top divider line */}
                <div
                  className={`w-full transition-all duration-300 mb-6 ${
                    isSelected
                      ? 'h-[2px] bg-[#1a1a1a]'
                      : 'h-[1px] bg-stone-200/80 group-hover:bg-stone-400 group-hover:h-[2px]'
                  }`}
                />

                {/* Step Number */}
                <span
                  className={`font-serif text-xl sm:text-2xl mb-4 transition-colors ${
                    isSelected ? 'text-[#1a1a1a] font-bold' : 'text-stone-300 font-normal group-hover:text-stone-500'
                  }`}
                >
                  {step.id}
                </span>

                {/* Minimalist Icon */}
                <div
                  className={`mb-4 transition-colors ${
                    isSelected ? 'text-[#1a1a1a]' : 'text-stone-500 group-hover:text-[#1a1a1a]'
                  }`}
                >
                  {getStepIcon(step.id)}
                </div>

                {/* Step Title (Serif/Clean monograph style) */}
                <h3
                  className={`text-base sm:text-lg font-serif font-bold tracking-tight mb-2 transition-colors ${
                    isSelected ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/80 group-hover:text-[#1a1a1a]'
                  }`}
                >
                  {step.title.split('(')[0].trim()}
                </h3>

                {/* Summary Text (Neat sans-serif font) */}
                <p className="text-xs sm:text-sm text-stone-600 font-sans font-normal leading-relaxed line-clamp-3">
                  {getStepSummary(step.id)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Detailed Content Panel with Staggered Entrance Animations (Hiệu ứng xuất hiện từng chi tiết) */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="py-8 border-t border-stone-200/80"
          >
            {/* Top Info: Step Number & Title & Duration */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-10 border-b border-stone-200/60 mb-12"
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-stone-400 block mb-2">
                  Giai đoạn {currentStep.id} / 0{steps.length}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-[#1a1a1a]">
                  {currentStep.title}
                </h2>
              </div>
              <div className="flex items-baseline gap-2 md:text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                  {t.servicesPage.duration}:
                </span>
                <span className="text-base sm:text-lg font-sans font-bold text-[#1a1a1a]">
                  {currentStep.duration}
                </span>
              </div>
            </motion.div>

            {/* Staggered Content Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start mb-16">
              {currentStep.details.map((detail, dIdx) => (
                <motion.div key={dIdx} variants={itemVariants} className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                    {detail.label} —
                  </h4>
                  <p className="text-stone-700 font-sans font-normal text-base sm:text-lg leading-relaxed">
                    {detail.text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Staggered Deliverable Section (Sản phẩm bàn giao - tối giản không viền hộp) */}
            <motion.div
              variants={itemVariants}
              className="pt-8 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4"
            >
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-stone-400 shrink-0">
                {t.servicesPage.deliverable} —
              </span>
              <p className="text-base sm:text-xl font-sans font-bold text-[#1a1a1a] sm:text-right max-w-3xl leading-relaxed">
                {currentStep.deliverable}
              </p>
            </motion.div>

            {/* Step Navigation Footer inside Panel */}
            <motion.div
              variants={itemVariants}
              className="mt-16 pt-8 border-t border-stone-200/60 flex items-center justify-between text-xs sm:text-sm font-sans font-medium text-stone-400"
            >
              <button
                onClick={() =>
                  setActiveStepIndex((prev) => (prev > 0 ? prev - 1 : steps.length - 1))
                }
                className="hover:text-[#1a1a1a] transition-colors flex items-center gap-2 py-2 group"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                <span>Giai đoạn trước</span>
              </button>
              <span className="text-stone-300 font-mono text-xs hidden sm:inline">
                Dùng phím mũi tên ⬅ ➡ để di chuyển
              </span>
              <button
                onClick={() =>
                  setActiveStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : 0))
                }
                className="hover:text-[#1a1a1a] transition-colors flex items-center gap-2 py-2 group"
              >
                <span>Giai đoạn tiếp theo</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Minimalist Philosophy Statement (Font chữ ngay ngắn, tối giản) */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-stone-200/60 text-center">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">
          Triết Lý Đồng Hành
        </h3>
        <p className="text-xl sm:text-2xl font-sans font-normal text-[#1a1a1a] leading-relaxed max-w-3xl mx-auto">
          &ldquo;Quy trình thiết kế không chỉ là những bản vẽ kỹ thuật, mà là hành trình thấu hiểu và kiến tạo không gian sống bền vững, thích ứng với tự nhiên và tôn trọng bản sắc của gia chủ.&rdquo;
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
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 md:bottom-8 right-6 w-11 h-11 bg-[#1a1a1a] text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-stone-800 transition-colors border border-white/10"
            title="Lên đầu trang"
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
