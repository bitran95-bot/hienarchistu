import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';

export function RecoveryMessage({ onRetry, scene = false, fullScreen = false }: {
  onRetry?: () => void;
  scene?: boolean;
  fullScreen?: boolean;
}) {
  const { lang } = useTranslation();
  const vi = lang === 'vi';
  return (
    <div role="alert" className={fullScreen
      ? 'fixed inset-0 z-[60] flex items-center justify-center bg-[#fdfbf7] p-6 text-center'
      : 'rounded-2xl bg-[#fdfbf7] px-6 py-12 text-center'}>
      <div className="mx-auto max-w-md space-y-5">
        <h2 className="text-2xl font-heading text-stone-800">
          {scene
            ? (vi ? 'Không thể tải không gian 3D' : 'The 3D space could not load')
            : (vi ? 'Chưa tải được nội dung' : 'Content could not load')}
        </h2>
        <p className="text-stone-600">
          {scene
            ? (vi ? 'Bạn vẫn có thể xem hình ảnh và thông tin trong danh sách dự án.' : 'You can still explore images and details in our project list.')
            : (vi ? 'Vui lòng kiểm tra kết nối rồi thử lại.' : 'Please check your connection and try again.')}
        </p>
        {onRetry && <button onClick={onRetry} className="rounded-xl bg-amber-800 px-6 py-3 text-white">
          {vi ? 'Thử lại' : 'Try again'}
        </button>}
        {scene && <Link to="/projects" className="block rounded-xl bg-amber-800 px-6 py-3 text-white">
          {vi ? 'Xem danh sách dự án' : 'View project list'}
        </Link>}
      </div>
    </div>
  );
}
