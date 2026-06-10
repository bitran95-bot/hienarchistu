import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface MobileNavProps {
  onContactClick: () => void;
}

export function MobileNav({ onContactClick }: MobileNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleStoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('scroll-to-about'));
    } else {
      navigate('/#about');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scroll-to-about'));
      }, 100);
    }
  };

  return (
    <nav 
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center space-x-5 text-xs font-medium text-[#444444] z-50 pointer-events-auto border border-stone-200/50" 
      aria-label="Mobile navigation"
    >
      <button onClick={handleStoryClick} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.story}</button>
      <Link to="/projects" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.projects}</Link>
      <Link to="/shop" className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.library}</Link>
      <button onClick={onContactClick} className="hover:text-amber-700 transition-colors whitespace-nowrap">{t.nav.contact}</button>
      <LanguageSwitcher />
    </nav>
  );
}
