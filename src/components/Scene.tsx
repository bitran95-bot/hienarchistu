import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Environment, ContactShadows, Sparkles, Html, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import { useStore } from '../store/useStore';
import { LoadingSpinner } from './3d/LoadingSpinner';
import { SplineModel } from './3d/SplineModel';
import { FallbackPhotoFrame } from './3d/FallbackPhotoFrame';
import { DecorativeLamp } from './3d/DecorativeLamp';
import { CursorLight } from './3d/CursorLight';
import { InteractiveProject } from './3d/InteractiveProject';

import { AboutSection } from './3d/AboutSection';
import { Bookshelf } from './3d/Bookshelf';
import { calculateProjectLayout } from '../utils/layout';
import type { GridData, GridLocation } from '../types';
import { useIsMobile } from '../hooks';

import { useCameraController } from './3d/hooks/useCameraController';
import { useHeroAnimations } from './3d/hooks/useHeroAnimations';

// --- Toàn bộ nội dung 3D được điều khiển bởi Scroll ---
function SceneContents() {
  const { gl } = useThree();
  const { modalOpen, activeProject, projects, settings } = useStore();
  const scroll = useScroll();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [perfQuality, setPerfQuality] = useState<'high' | 'low'>('high');

  // Tính toán Grid Layout
  const gridLayout = useMemo(() => calculateProjectLayout(projects || []), [projects]);

  const gridData = useMemo((): GridData => {
    if (gridLayout.length === 0) return { map: [], path: [] };
    const map = new Array<GridLocation | undefined>(projects.length);
    const path: GridLocation[] = [];
    
    gridLayout.forEach((p) => {
       const origIdx = projects.findIndex((op) => op._id === p._id);
       const loc: GridLocation = { gridRow: p.computedRow, computedX: p.computedX };
       if (origIdx >= 0) map[origIdx] = loc;
       path.push(loc);
    });
    
    return { map, path };
  }, [gridLayout, projects]);

  useEffect(() => {
    const handleScrollHome = () => {
      scroll.el.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleScrollAbout = () => {
      scroll.el.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' });
    };
    const handleScrollProjects = () => {
      scroll.el.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
    };
    
    window.addEventListener('scroll-to-home', handleScrollHome);
    window.addEventListener('scroll-to-about', handleScrollAbout);
    window.addEventListener('scroll-to-projects', handleScrollProjects);
    
    return () => {
      window.removeEventListener('scroll-to-home', handleScrollHome);
      window.removeEventListener('scroll-to-about', handleScrollAbout);
      window.removeEventListener('scroll-to-projects', handleScrollProjects);
    };
  }, [scroll]);

  // Cờ kiểm tra mobile (dùng hook tái sử dụng)
  const isMobileScreen = useIsMobile();

  // Sync dark mode state lên body element cho CSS selectors
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // Use Custom Hooks for Animations
  useCameraController(gridData, modalOpen, activeProject);
  useHeroAnimations();

  return (
    <>
      <PerformanceMonitor 
        onDecline={() => {
           setPerfQuality('low');
           gl.setPixelRatio(1);
        }}
        onIncline={() => {
           setPerfQuality('high');
           gl.setPixelRatio(window.devicePixelRatio || 1.5);
        }}
        flipflops={3}
        onFallback={() => {
           setPerfQuality('low');
           gl.setPixelRatio(0.75); // Cứu cánh cuối cùng nếu vẫn lag
        }}
      />
      {/* Môi trường HDRI: Tạo ánh sáng studio và phản xạ thực tế (rất mượt) */}
      <Suspense fallback={null}>
         <Environment preset={isDarkMode ? "night" : "city"} environmentIntensity={isDarkMode ? 0.1 : 0.8} />
      </Suspense>

      <ambientLight intensity={isDarkMode ? 0.05 : 0.4} color={isDarkMode ? "#222244" : "#ffffff"} />
      
      {/* Ánh sáng mặt trời chiếu vát tạo khối */}
      <directionalLight 
         position={[25, 15, 15]} 
         intensity={isDarkMode ? 0.1 : 1.5} 
         castShadow={!isMobileScreen}
         shadow-mapSize={[1024, 1024]} 
         shadow-camera-left={-25}
         shadow-camera-right={25}
         shadow-camera-top={25}
         shadow-camera-bottom={-25}
         color={isDarkMode ? "#555588" : "#fffcf2"}
         shadow-bias={-0.0001}
      />

      {/* Hiệu ứng Contact Shadows: Bóng đổ chân thật sát mặt kệ (AO) - frames={1} để tối ưu hiệu năng */}
      <ContactShadows position={[0, -3.89, -1]} opacity={0.65} scale={50} blur={2.5} far={4} resolution={isMobileScreen ? 256 : 512} color="#332211" frames={1} />
      
      <CursorLight isDarkMode={isDarkMode} />

      {/* Hiệu ứng hạt bụi bay lơ lửng / đom đóm (Chỉ bật khi quality high) */}
      {!isMobileScreen && perfQuality === 'high' && (
         <Sparkles 
            count={isDarkMode ? 60 : 20} 
            scale={[40, 25, 10]} 
            size={isDarkMode ? 6 : 1.5} 
            speed={isDarkMode ? 0.3 : 0.1} 
            opacity={isDarkMode ? 0.7 : 0.2} 
            position={[0, -8, 0]} 
            color={isDarkMode ? "#ffd199" : "#ffffff"} 
         />
      )}

      {/* --- CẤU TRÚC KỆ SÁCH & BỨC TƯỜNG --- */}
      <Suspense fallback={null}>
        <Bookshelf />
      </Suspense>

      {/* --- NỘI DUNG VĂN BẢN VẼ TRÊN TƯỜNG (Z = -2.5 để không bị lẹm vào tường Z=-2.6) --- */}

      {/* Màn 1: Hero (HTML Overlay theo mẫu) */}
      <Html fullscreen style={{ pointerEvents: 'none', zIndex: 10 }}>
        <div className="w-full h-full relative" style={{ pointerEvents: 'none' }}>
          {/* Chữ HIÊN studio đã được chuyển sang Overlay.tsx để cố định và hiệu ứng trượt */}
          
          {/* Đoạn miêu tả bên phải */}
          <div id="hero-desc" className="absolute w-full px-6 md:w-auto md:px-0 left-1/2 md:left-auto md:right-[20%] top-[45%] md:top-[50%] -translate-y-1/2 -translate-x-1/2 md:translate-x-0" style={{ maxWidth: '450px' }}>
            <p className="text-sm md:text-base text-[#333] font-serif italic leading-relaxed md:text-right text-center md:text-left" style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
              {settings?.heroDescription || "Hiên archi là một xưởng thiết kế kiến trúc nhỏ. Chúng tôi làm việc với con người và khí hậu bản địa để tạo nên những không gian sống mộc mạc, bình yên"}
            </p>
          </div>

          {/* Màn 2: About (HTML với hiệu ứng gõ phím) */}
          <AboutSection />
        </div>
      </Html>

      {/* --- CÁC MÔ HÌNH DỰ ÁN (PROJECTS) --- */}
      <group position={[0, -3.9, -1]}>
         
         {/* Phụ kiện trang trí */}
         <Suspense fallback={null}>
            <DecorativeLamp 
               position={isMobileScreen ? [-1.5, 0, -1] : [-5, 0, -1]} 
               scale={isMobileScreen ? 7 : 9} 
               isDarkMode={isDarkMode} 
               onToggle={() => setIsDarkMode(!isDarkMode)} 
            />
         </Suspense>
         
         {gridLayout.length === 0 ? (
                <InteractiveProject index={0} position={[0, 0, 0]} title="Đang tải dữ liệu..." isDarkMode={isDarkMode}>
                   <Suspense fallback={<LoadingSpinner />}>
                      <FallbackPhotoFrame project={{} as any} index={0} isDarkMode={isDarkMode} />
                   </Suspense>
                </InteractiveProject>
         ) : (
            gridLayout.map((project, index) => {
               const originalIndex = projects.findIndex((p) => p._id === project._id);
               const activeIdx = originalIndex !== -1 ? originalIndex : index;
               return (
                 <InteractiveProject 
                    key={project._id || index} 
                    index={activeIdx} 
                    position={[project.computedX, -project.computedRow * 4, 0]} 
                    title={project.name}
                    generalInfo={project.generalInfo}
                    isDarkMode={isDarkMode}
                 >
                    <Suspense fallback={<LoadingSpinner />}>
                      {project.modelFileUrl ? (
                        <SplineModel url={project.modelFileUrl} scale={0.8 * (project.modelScale || 1)} position={[0, 0, 0.25]} rotation={[0, 0, 0]} />
                      ) : (
                        <FallbackPhotoFrame project={project} index={activeIdx} isDarkMode={isDarkMode} />
                      )}
                    </Suspense>
                 </InteractiveProject>
               );
            })
         )}
      </group>

      {/* --- HIỆU ỨNG HẬU KỲ (POST-PROCESSING) (Tắt khi perf low) --- */}
      {perfQuality === 'high' && (
        <EffectComposer>
           <Bloom 
              luminanceThreshold={isDarkMode ? 0.2 : 0.8} 
              luminanceSmoothing={0.9} 
              intensity={isDarkMode ? 1.2 : 0.2} 
              opacity={1}
           />
           <Vignette eskil={false} offset={0.1} darkness={isDarkMode ? 0.6 : 0.25} />
        </EffectComposer>
      )}
    </>
  );
}

export function Scene() {
   const isMobile = useIsMobile();

   useEffect(() => {
     return () => { document.body.style.cursor = 'auto'; };
   }, []);
 
  return (
    <ScrollControls 
      horizontal={false} 
      pages={3} 
      damping={isMobile ? 0.05 : 0.2}
    >
      <SceneContents />
     </ScrollControls>
   );
}
