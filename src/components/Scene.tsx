import { useEffect, useState, useMemo, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Environment, ContactShadows, Sparkles, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import { useStore } from '../store/useStore';
import { LoadingSpinner, ModelUnavailable } from './3d/LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { SplineModel } from './3d/SplineModel';
import { FallbackPhotoFrame } from './3d/FallbackPhotoFrame';
import { DecorativeLamp } from './3d/DecorativeLamp';
import { CursorLight } from './3d/CursorLight';
import { InteractiveProject } from './3d/InteractiveProject';
import { ProjectVisibility } from './3d/ProjectVisibility';
import { useReducedMotion } from 'framer-motion';

import { Bookshelf } from './3d/Bookshelf';
import { calculateProjectLayout } from '../utils/layout';
import type { GridData, GridLocation } from '../types';
import { useIsMobile } from '../hooks';

import { useCameraController } from './3d/hooks/useCameraController';
import { useHeroAnimations } from './3d/hooks/useHeroAnimations';
import { useLocation } from 'react-router-dom';

// --- Toàn bộ nội dung 3D được điều khiển bởi Scroll ---
function SceneContents() {
  const reducedMotion = useReducedMotion();
  const { gl } = useThree();
  const { modalOpen, activeProject, projects, isDataLoaded, isDarkMode, toggleDarkMode } = useStore();
  const scroll = useScroll();
  const { hash } = useLocation();
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

  useEffect(() => {
    if (hash !== '#about') return;
    const frame = requestAnimationFrame(() => {
      scroll.el.scrollTo({ top: window.innerHeight * 0.4, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, scroll]);

  // Cờ kiểm tra mobile (dùng hook tái sử dụng)
  const isMobileScreen = useIsMobile();

  // Body dark-mode class is now synced by Zustand toggleDarkMode action

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
           gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        }}
        flipflops={3}
        onFallback={() => {
           setPerfQuality('low');
           gl.setPixelRatio(0.75); // Cứu cánh cuối cùng nếu vẫn lag
        }}
      />
      {/* Giữ cùng HDRI khi đổi ngày/đêm để cảnh không bị Suspense ngắt render. */}
      <Suspense fallback={null}>
         <Environment preset="city" environmentIntensity={isDarkMode ? 0.03 : 0.8} />
      </Suspense>

      <ambientLight intensity={isDarkMode ? 0.05 : 0.4} color={isDarkMode ? "#222244" : "#ffffff"} />
      
      {/* Ảnh nền nhận nắng từ phía trên bên trái; mô hình cùng hướng sáng đó. */}
      <directionalLight 
         position={[-25, 18, 15]}
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
      {!isMobileScreen && !reducedMotion && perfQuality === 'high' && (
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

      {/* --- CÁC MÔ HÌNH DỰ ÁN (PROJECTS) --- */}
      <group position={[0, -3.9, -1]}>
         
         {/* Phụ kiện trang trí */}
         <Suspense fallback={null}>
            <DecorativeLamp 
               position={isMobileScreen ? [-1.5, 0, -1] : [-5, 0, -1]} 
               scale={isMobileScreen ? 7 : 9} 
               isDarkMode={isDarkMode} 
               onToggle={toggleDarkMode} 
            />
         </Suspense>

         
         {!isDataLoaded ? null : gridLayout.length === 0 ? (
                <InteractiveProject index={0} position={[0, 0, 0]}>
                   <Suspense fallback={<LoadingSpinner />}>
                      <FallbackPhotoFrame project={{}} index={0} isDarkMode={isDarkMode} />
                   </Suspense>
                </InteractiveProject>
         ) : (
            gridLayout.map((project, index) => {
               const originalIndex = projects.findIndex((p) => p._id === project._id);
               const activeIdx = originalIndex !== -1 ? originalIndex : index;
               return (
                 <ProjectVisibility key={project._id || index} position={[project.computedX, -project.computedRow * 4, 0]} night={isDarkMode}>
                 <InteractiveProject 
                    index={activeIdx} 
                    position={[project.computedX, -project.computedRow * 4, 0]} 
                 >
                    <ErrorBoundary fallback={<ModelUnavailable project={project} />}>
                      <Suspense fallback={<LoadingSpinner project={project} />}>
                        {project.modelFileUrl ? (
                          <SplineModel url={project.modelFileUrl} scale={0.8 * (project.modelScale || 1)} position={[0, 0, 0.25]} rotation={[0, 0, 0]} />
                        ) : (
                          <FallbackPhotoFrame project={project} index={activeIdx} isDarkMode={isDarkMode} />
                        )}
                      </Suspense>
                    </ErrorBoundary>
                 </InteractiveProject>
                 </ProjectVisibility>
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
