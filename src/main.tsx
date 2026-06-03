import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n'
import './index.css'
import App from './App.tsx'

// Lazy load trang Shop và Download để không ảnh hưởng trang chính 3D
const ShopPage = lazy(() => import('./pages/ShopPage'))
const DownloadPage = lazy(() => import('./pages/DownloadPage'))

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
    <div className="text-stone-400 font-heading text-xl animate-pulse">Đang tải...</div>
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/shop" element={
              <Suspense fallback={<LoadingFallback />}>
                <ShopPage />
              </Suspense>
            } />
            <Route path="/download" element={
              <Suspense fallback={<LoadingFallback />}>
                <DownloadPage />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </HelmetProvider>
  </StrictMode>,
)
