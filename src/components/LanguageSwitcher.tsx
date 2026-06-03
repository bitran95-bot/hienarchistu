import { useTranslation } from '../i18n';

/**
 * Nút chuyển đổi ngôn ngữ VI/EN — nhỏ gọn, đẹp, hoạt hình mượt.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useTranslation();

  const toggle = () => setLang(lang === 'vi' ? 'en' : 'vi');

  return (
    <button
      onClick={toggle}
      className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 border ${
        lang === 'vi'
          ? 'bg-white/80 text-[#444] border-stone-200 hover:border-amber-700'
          : 'bg-amber-700/10 text-amber-800 border-amber-200 hover:border-amber-700'
      } backdrop-blur-sm ${className}`}
      aria-label={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <span className={`transition-opacity duration-200 ${lang === 'vi' ? 'opacity-100' : 'opacity-40'}`}>VI</span>
      <span className="text-stone-300">|</span>
      <span className={`transition-opacity duration-200 ${lang === 'en' ? 'opacity-100' : 'opacity-40'}`}>EN</span>
    </button>
  );
}
