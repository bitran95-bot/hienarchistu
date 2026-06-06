import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { SubpageNavigation } from '../components/SubpageNavigation';

type DownloadState = 'loading' | 'ready' | 'expired' | 'error';

export default function DownloadPage() {
  const { lang } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [state, setState] = useState<DownloadState>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (!sessionId) {
      setState('error');
      setErrorMsg(lang === 'vi' ? 'Không tìm thấy thông tin thanh toán.' : 'Payment information not found.');
      return;
    }

    // Verify payment và lấy download link
    fetch(`/api/download?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setProductName(data.productName || '');
          setState('ready');
        } else {
          setState('error');
          setErrorMsg(data.message || data.error || 'Unknown error');
        }
      })
      .catch(() => {
        setState('error');
        setErrorMsg(lang === 'vi' ? 'Không thể kết nối server.' : 'Could not connect to server.');
      });
  }, [sessionId, lang]);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const isVi = lang === 'vi';

  return (
    <>
      <Helmet>
        <title>{isVi ? 'Tải sản phẩm — Hiên Archi Studio' : 'Download — Hiên Archi Studio'}</title>
      </Helmet>

      <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
        <SubpageNavigation />

        {/* CONTENT */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full text-center"
          >
            {/* LOADING */}
            {state === 'loading' && (
              <div className="space-y-6">
                <div className="w-16 h-16 mx-auto border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin" />
                <h2 className="text-xl font-heading font-bold text-stone-600">
                  {isVi ? 'Đang xác minh thanh toán...' : 'Verifying payment...'}
                </h2>
                <p className="text-stone-400">
                  {isVi ? 'Vui lòng đợi trong giây lát' : 'Please wait a moment'}
                </p>
              </div>
            )}

            {/* READY TO DOWNLOAD */}
            {state === 'ready' && (
              <div className="space-y-8">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-bold text-[#2a2a2a] mb-2">
                    {isVi ? 'Thanh toán thành công!' : 'Payment successful!'}
                  </h2>
                  {productName && (
                    <p className="text-lg text-stone-500">{productName}</p>
                  )}
                </div>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-3 bg-amber-700 hover:bg-amber-800 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-amber-700/20 hover:shadow-amber-700/30"
                >
                  <span className="text-2xl">📥</span>
                  {isVi ? 'Tải xuống ngay' : 'Download now'}
                </button>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800 space-y-2">
                  <p className="font-semibold">⚠️ {isVi ? 'Lưu ý quan trọng' : 'Important notice'}</p>
                  <ul className="text-left space-y-1 text-amber-700">
                    <li>• {isVi
                      ? 'Link tải chỉ sử dụng được 1 lần và hết hạn sau 30 phút.'
                      : 'Download link is single-use and expires in 30 minutes.'
                    }</li>
                    <li>• {isVi
                      ? 'Nếu gặp vấn đề, vui lòng liên hệ qua email hoặc Instagram.'
                      : 'If you encounter issues, please contact us via email or Instagram.'
                    }</li>
                  </ul>
                </div>
              </div>
            )}

            {/* EXPIRED */}
            {state === 'expired' && (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">⏱️</span>
                </div>
                <h2 className="text-2xl font-heading font-bold text-stone-600">
                  {isVi ? 'Link đã hết hạn' : 'Link has expired'}
                </h2>
                <p className="text-stone-400">
                  {isVi
                    ? 'Link tải đã hết hạn hoặc đã được sử dụng. Vui lòng liên hệ hỗ trợ.'
                    : 'The download link has expired or already been used. Please contact support.'
                  }
                </p>
                <Link to="/shop" className="inline-block bg-stone-200 hover:bg-stone-300 text-stone-700 px-8 py-3 rounded-xl font-semibold transition-colors">
                  {isVi ? 'Quay lại cửa hàng' : 'Back to shop'}
                </Link>
              </div>
            )}

            {/* ERROR */}
            {state === 'error' && (
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">❌</span>
                </div>
                <h2 className="text-2xl font-heading font-bold text-stone-600">
                  {isVi ? 'Có lỗi xảy ra' : 'Something went wrong'}
                </h2>
                <p className="text-stone-400">{errorMsg}</p>
                <Link to="/shop" className="inline-block bg-stone-200 hover:bg-stone-300 text-stone-700 px-8 py-3 rounded-xl font-semibold transition-colors">
                  {isVi ? 'Quay lại cửa hàng' : 'Back to shop'}
                </Link>
              </div>
            )}
          </motion.div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-stone-200/50 py-8 text-center text-sm text-stone-400">
          © {new Date().getFullYear()} Hiên Archi Studio
        </footer>
      </div>
    </>
  );
}
