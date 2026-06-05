import { Suspense, useEffect, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Helmet } from 'react-helmet-async';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './store/useStore';

// Lazy load các component nặng để tăng tốc độ tải trang ban đầu (Code Splitting)
const Scene = lazy(() => import('./components/Scene').then(module => ({ default: module.Scene })));
const Overlay = lazy(() => import('./components/Overlay').then(module => ({ default: module.Overlay })));

function App() {
  const { fetchData, isDataLoaded, settings, projects } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Deep linking for projects
  useEffect(() => {
    if (isDataLoaded && projects && projects.length > 0) {
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
  }, [isDataLoaded, projects]);

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

      {/* Màn hình chờ */}
      <LoadingScreen started={isDataLoaded} />
      
      {/* Không gian 3D nền (Ban ngày sáng sủa) */}
      <ErrorBoundary>
      <div className="fixed inset-0 w-full h-full z-0 bg-[#fdfbf7]">
         <Canvas shadows camera={{ position: [0, 1.5, 18], fov: 40 }} dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : [1, 1.5]} gl={{ antialias: true }} style={{ touchAction: 'none' }}>
           <Suspense fallback={null}>
             <Scene />
           </Suspense>
         </Canvas>
      </div>
      </ErrorBoundary>

      {/* Lớp nội dung (Chỉ còn Modal và Header siêu nhỏ) */}
      <div className="relative z-30 w-full pointer-events-none">
         <Suspense fallback={null}>
            <Overlay />
         </Suspense>
      </div>
    </>
  );
}

export default App;

