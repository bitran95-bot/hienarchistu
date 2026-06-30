import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n'
import './index.css'
import 'virtual:pwa-register'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load trang phụ để không ảnh hưởng trang chính 3D
const ShopPage = lazy(() => import('./pages/ShopPage'))
const DownloadPage = lazy(() => import('./pages/DownloadPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-amber-700/20 border-t-amber-700 animate-spin" />
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
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ShopPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/download" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <DownloadPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="/projects" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <ProjectsPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="*" element={
              <Suspense fallback={<LoadingFallback />}>
                <NotFoundPage />
              </Suspense>
            } />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </HelmetProvider>
  </StrictMode>,
)

