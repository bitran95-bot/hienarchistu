import { Suspense, useEffect, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Overlay } from './components/Overlay';
import { MobileHome } from './components/MobileHome';
import { InlineLoadingIndicator } from './components/ui/InlineLoadingIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './store/useStore';
import { useIsMobile } from './hooks';
import { RecoveryMessage } from './components/ui/RecoveryMessage';
import { SITE_URL, OG_IMAGE_URL } from './config/site';
import { projectPath, projectSlug } from './utils/projectSlug';
import { useTranslation } from './i18n';

// Lazy load các component nặng để tăng tốc độ tải trang ban đầu (Code Splitting)
// Keep the page content independent of the optional desktop 3D runtime.
const DesktopCanvas = lazy(() => import('./components/DesktopCanvas'));

function App() {
  const { fetchData, isDataLoaded, settings, projects, error } = useStore();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Redirect legacy homepage hashes to the permanent project URL.
  useEffect(() => {
    if (isDataLoaded && projects.length > 0) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const project = projects.find(p => p._id === hash || projectSlug(p) === hash);
        if (project) navigate(projectPath(project), { replace: true, state: { returnTo: '/' } });
      }
    }
  }, [isDataLoaded, projects, navigate]);

  const siteTitle = settings?.title || "Hiên Archi Studio";
  const siteDesc = settings?.heroDescription || "Studio thiết kế kiến trúc và nội thất, nơi kiến tạo không gian sống mộc mạc và chân thành.";
  const siteUrl = SITE_URL;
  const ogImage = OG_IMAGE_URL;

  // JSON-LD Structured Data cho SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": siteTitle,
    "description": siteDesc,
    "url": siteUrl,
    "telephone": settings?.phone || "033 877 7017",
    "email": settings?.email || "thaibao95arc@gmail.com",
    "image": ogImage,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN"
    },
    "sameAs": [
      settings?.instagram || "https://instagram.com/hien.archi"
    ],
    "priceRange": "$$",
    "openingHours": "Mo-Sa 08:00-18:00",
    "@graph": [{
      "@type": "WebSite",
      "name": siteTitle,
      "url": siteUrl
    }]
  };

  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDesc} />
        <link rel="canonical" href={siteUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content="vi_VN" />
        <meta property="og:site_name" content="Hiên Archi Studio" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDesc} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {isMobile ? (
        /* ━━━ MOBILE: Giao diện 2D thuần, không load Three.js ━━━ */
        <MobileHome />
      ) : (
        /* ━━━ DESKTOP: Trải nghiệm 3D kệ sách immersive ━━━ */
        <>
          {/* Không gian 3D nền (Ban ngày sáng sủa) */}
          <div className="fixed inset-0 w-full h-full z-0 bg-white">
            <ErrorBoundary fallback={<div className="fixed bottom-6 right-6 z-20 max-w-sm"><RecoveryMessage scene /></div>}>
              <Suspense fallback={isDataLoaded && !error ? <InlineLoadingIndicator className="fixed bottom-6 right-6" /> : null}>
                <DesktopCanvas />
              </Suspense>
            </ErrorBoundary>
          </div>

          {error ? (
            <div className="fixed bottom-6 right-6 z-20 max-w-sm"><RecoveryMessage onRetry={() => void fetchData()} /></div>
          ) : !isDataLoaded ? (
            <InlineLoadingIndicator label={t.scene.loadingData} className="fixed bottom-6 right-6 z-20" />
          ) : null}

          {/* Lớp nội dung (Header + Modals — z-40 để nằm trên R3F scroll container) */}
          <div className="relative z-40 w-full pointer-events-none isolate">
            <Overlay />
          </div>
        </>
      )}
    </>
  );
}

export default App;
