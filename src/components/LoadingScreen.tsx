import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

// Plain React: mobile and route fallbacks do not import the 3D runtime.
export function LoadingScreen({ started, progress }: { started: boolean; progress?: number }) {
  const { t, lang } = useTranslation();
  if (started) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfbf7]"
    >
      {/* Khung viền mỏng manh mộc mạc */}
      <div role="status" className="flex flex-col items-center max-w-sm w-full px-8">
        <p className="text-3xl md:text-5xl font-serif text-[#333] mb-8 tracking-widest uppercase">
          Hiên <span className="text-[#8b7355] lowercase italic">archi</span>
        </p>
        
        {/* Thanh progress bar mộc mạc */}
        <div className="w-full h-[2px] bg-[#e5d3b3] relative overflow-hidden rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-[#8b7355] transition-all duration-300 ease-out"
            style={{ width: progress === undefined ? '50%' : `${progress}%` }}
          />
        </div>
        
        {/* Text % */}
        <div className="mt-4 flex justify-between w-full text-xs text-[#666] font-sans tracking-widest uppercase">
          <span>{t.loading.text}</span>
          {progress !== undefined && <span>{Math.round(progress)}%</span>}
        </div>
      </div>
      <Link to="/projects" className="mt-8 text-sm text-amber-800 underline underline-offset-4">
        {lang === 'vi' ? 'Xem danh sách dự án' : 'View project list'}
      </Link>
    </div>
  );
}
