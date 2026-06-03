import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n'
import './index.css'
import App from './App.tsx'

// Lazy load trang Shop để không ảnh hưởng đến tốc độ tải trang chính 3D
const ShopPage = lazy(() => import('./pages/ShopPage'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/shop" element={
              <Suspense fallback={
                <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
                  <div className="text-stone-400 font-heading text-xl animate-pulse">Đang tải...</div>
                </div>
              }>
                <ShopPage />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </HelmetProvider>
  </StrictMode>,
)
