import { Suspense, useEffect, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './store/useStore';
import { useIsMobile } from './hooks';

// Lazy load các component nặng để tăng tốc độ tải trang ban đầu (Code Splitting)
// Desktop: 3D Canvas + Overlay (chỉ load khi ở desktop)
const DesktopCanvas = lazy(() => import('./components/DesktopCanvas'));
const Overlay = lazy(() => import('./components/Overlay').then(module => ({ default: module.Overlay })));
// Mobile: Giao diện 2D nhẹ nhàng, tối ưu cho cảm ứng (chỉ load khi ở mobile)
const MobileHome = lazy(() => import('./components/MobileHome').then(module => ({ default: module.MobileHome })));

function App() {
  const { fetchData, isDataLoaded, settings, projects } = useStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Deep linking for projects (chỉ desktop vì mobile không có 3D bookshelf)
  useEffect(() => {
    if (!isMobile && isDataLoaded && projects && projects.length > 0) {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const idx = projects.findIndex(p => 
          p._id === hash || 
          p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === hash
        );
        if (idx !== -1) {
          useStore.getState().setActiveProject(idx);
          useStore.getState().setModalOpen(true);
        }
      }
    }
  }, [isDataLoaded, projects, isMobile]);

  const siteTitle = settings?.title || "Hiên Archi Studio";
  const siteDesc = settings?.heroDescription || "Studio thiết kế kiến trúc và nội thất, nơi kiến tạo không gian sống mộc mạc và chân thành.";
  const siteUrl = "https://hienarchi.studio";
  const ogImage = `${siteUrl}/favicon.svg`;

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
        <Suspense fallback={<LoadingScreen started={false} />}>
          <MobileHome />
        </Suspense>
      ) : (
        /* ━━━ DESKTOP: Trải nghiệm 3D kệ sách immersive ━━━ */
        <>
          {/* Màn hình chờ */}
          <LoadingScreen started={isDataLoaded} />
          
          {/* Không gian 3D nền (Ban ngày sáng sủa) */}
          <ErrorBoundary>
          <div className="fixed inset-0 w-full h-full z-0 bg-[#fdfbf7]">
            <Suspense fallback={null}>
              <DesktopCanvas />
            </Suspense>
          </div>
          </ErrorBoundary>

          {/* Lớp nội dung (Header + Modals — z-40 để nằm trên R3F scroll container) */}
          <div className="relative z-40 w-full pointer-events-none isolate">
            <Suspense fallback={null}>
                <Overlay />
            </Suspense>
          </div>
        </>
      )}
    </>
  );
}

export default App;
