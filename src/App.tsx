import { Suspense, useEffect, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Helmet } from 'react-helmet-async';
import { LoadingScreen } from './components/LoadingScreen';
import { useStore } from './store/useStore';

// Lazy load các component nặng để tăng tốc độ tải trang ban đầu (Code Splitting)
const Scene = lazy(() => import('./components/Scene').then(module => ({ default: module.Scene })));
const Overlay = lazy(() => import('./components/Overlay').then(module => ({ default: module.Overlay })));

function App() {
  const { fetchData, isDataLoaded, settings } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const siteTitle = settings?.title || "Hiên Archi Studio";
  const siteDesc = settings?.heroDescription || "Studio thiết kế kiến trúc và nội thất, nơi kiến tạo không gian sống mộc mạc và chân thành.";

  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDesc} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDesc} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Màn hình chờ */}
      <LoadingScreen started={isDataLoaded} />
      
      {/* Không gian 3D nền (Ban ngày sáng sủa) */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#fdfbf7]">
         <Canvas shadows camera={{ position: [0, 1.5, 18], fov: 40 }} dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : [1, 1.5]} gl={{ antialias: true }} style={{ touchAction: 'pan-y' }}>
           <Suspense fallback={null}>
             <Scene />
           </Suspense>
         </Canvas>
      </div>

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

