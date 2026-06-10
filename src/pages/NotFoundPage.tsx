import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';

export default function NotFoundPage() {
  const { lang } = useTranslation();
  const isVi = lang === 'vi';

  return (
    <>
      <Helmet>
        <title>{isVi ? 'Không tìm thấy trang — Hiên Archi Studio' : 'Page Not Found — Hiên Archi Studio'}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center px-6 text-center"
           style={{ backgroundImage: 'radial-gradient(#d5d5d5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <h1 className="text-[120px] md:text-[180px] font-heading font-bold text-stone-200 leading-none select-none">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#2a2a2a] -mt-4 mb-4">
            {isVi ? 'Trang không tồn tại' : 'Page not found'}
          </h2>
          <p className="text-stone-500 font-serif italic mb-8 leading-relaxed">
            {isVi 
              ? 'Trang bạn tìm kiếm có thể đã được di chuyển hoặc không còn tồn tại.'
              : 'The page you\'re looking for may have been moved or no longer exists.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/"
              className="bg-[#2a2a2a] hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              {isVi ? '← Về trang chủ' : '← Back to home'}
            </Link>
            <Link 
              to="/projects"
              className="bg-white hover:bg-stone-100 text-[#2a2a2a] px-8 py-3 rounded-xl font-semibold transition-colors border border-stone-200"
            >
              {isVi ? 'Xem Dự Án' : 'View Projects'}
            </Link>
          </div>
        </motion.div>

        {/* Footer brand */}
        <div className="absolute bottom-8 text-stone-300 font-heading font-bold text-sm tracking-widest">
          HIÊN studio
        </div>
      </div>
    </>
  );
}
