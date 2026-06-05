import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import vi, { type Translations } from './vi';
import en from './en';

export type Language = 'vi' | 'en';

const translations: Record<Language, Translations> = { vi, en };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'vi',
  setLang: () => {},
  t: vi,
});

const STORAGE_KEY = 'hien-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'vi';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
    // Auto-detect từ trình duyệt — mặc định tiếng Việt nếu không phải English
    const browserLang = navigator.language?.slice(0, 2);
    return browserLang === 'en' ? 'en' : 'vi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    // Cập nhật lang attribute cho SEO
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
