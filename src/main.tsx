/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { I18nProvider } from './i18n'
import './index.css'
import 'virtual:pwa-register'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Lazy load trang phụ để không ảnh hưởng trang chính 3D
const ShopPage = lazy(() => import('./pages/ShopPage'))
const DownloadPage = lazy(() => import('./pages/DownloadPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-amber-700/20 border-t-amber-700 animate-spin" />
  </div>
)

// Page transition variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
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
          <Route path="/services" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <ServicesPage />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="*" element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <I18nProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </I18nProvider>
    </HelmetProvider>
  </StrictMode>,
)
