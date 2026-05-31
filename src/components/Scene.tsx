import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Environment, ContactShadows, Scroll, Sparkles } from '@react-three/drei';
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

// --- Toàn bộ nội dung 3D được điều khiển bởi Scroll ---
function SceneContents() {
  const { modalOpen, activeProject, projects, settings } = useStore();
  const scroll = useScroll();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Tính toán Grid Layout
  const gridData = useMemo(() => {
    if (!projects || projects.length === 0) return { map: [], path: [] };
    const photoProjects = projects.filter((p: any) => !p.modelFileUrl);
    const modelProjects = projects.filter((p: any) => p.modelFileUrl);
    const map = new Array(projects.length);
    const path: any[] = [];
    let r = 0, c = 0;
    
    photoProjects.forEach((p: any) => {
       const origIdx = projects.findIndex((op: any) => op === p);
       const loc = { gridRow: r, gridCol: c };
       if (origIdx >= 0) map[origIdx] = loc;
       path.push(loc);
       c++; if (c >= 5) { c = 0; r++; }
    });
    if (c > 0) { r++; c = 0; }
    modelProjects.forEach((p: any) => {
       const origIdx = projects.findIndex((op: any) => op === p);
       const loc = { gridRow: r, gridCol: c };
       if (origIdx >= 0) map[origIdx] = loc;
       path.push(loc);
       c++; if (c >= 5) { c = 0; r++; }
    });
    return { map, path };
  }, [projects]);

  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, 0));
  // Cache các DOM element để tránh gọi document.getElementById mỗi frame (Performance Tweak)
  const logoRef = useRef<HTMLElement | null>(null);
  const heroDescRef = useRef<HTMLElement | null>(null);

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

  useFrame((state) => {
    const s = scroll.offset; // 0 to 1

    // 1. Chuyển động Camera (Cinematic Camera)
    const zoomT = THREE.MathUtils.smoothstep(s, 0.25, 0.45); // Camera hạ xuống rất sớm
    const panT = THREE.MathUtils.smoothstep(s, 0.45, 1.0);  // Trượt ngang kéo dài

    // 2. Parallax góc nhìn lắc nhẹ theo chuột
    const parallaxX = state.pointer.x * 1.2;
    const parallaxY = state.pointer.y * 1.2;

    // 3. Tính toán vị trí theo Grid Layout
    let gridX = 0;
    let gridY = 0;
    
    if (gridData.path.length > 0) {
       const totalItems = gridData.path.length;
       const currentIndex = panT * Math.max(0, totalItems - 1);
       const floorIdx = Math.floor(currentIndex);
       const ceilIdx = Math.min(Math.ceil(currentIndex), totalItems - 1);
       const fraction = currentIndex - floorIdx;

       const p1 = gridData.path[floorIdx];
       const p2 = gridData.path[ceilIdx];

       gridX = THREE.MathUtils.lerp(p1.gridCol * 4, p2.gridCol * 4, fraction);
       gridY = THREE.MathUtils.lerp(-p1.gridRow * 4, -p2.gridRow * 4, fraction);
    }

    const isMobileCam = state.size.width < 768;

    const camY = THREE.MathUtils.lerp(1.5, -2.5 + gridY, zoomT) + parallaxY;
    // Tăng khoảng cách Z trên mobile để người dùng có thể thấy tổng quan rộng hơn, không bị ngợp
    const camZ = THREE.MathUtils.lerp(isMobileCam ? 24 : 18, isMobileCam ? 16 : 11, zoomT);
    const camX = THREE.MathUtils.lerp(0, gridX, zoomT) + parallaxX;

    const lookY = THREE.MathUtils.lerp(1.5, -2.5 + gridY, zoomT);
    const lookX = THREE.MathUtils.lerp(0, gridX, zoomT);

    if (modalOpen && gridData.map[activeProject]) {
       const activeLoc = gridData.map[activeProject];
       const targetX = activeLoc.gridCol * 4;
       const targetY_grid = -activeLoc.gridRow * 4;
       // Zoom lại gần mô hình đang chọn, chếch sang trái một chút để chừa chỗ cho bảng thông tin bên phải
       const camTargetPos = new THREE.Vector3(targetX - 2.0, -3.2 + targetY_grid, 4.5); 
       const lookTarget = new THREE.Vector3(targetX, -3.8 + targetY_grid, 0);

       state.camera.position.lerp(camTargetPos, 0.08);
       currentLookAt.current.lerp(lookTarget, 0.08);
    } else {
       const camTargetPos = new THREE.Vector3(camX, camY, camZ);
       const lookTarget = new THREE.Vector3(lookX, lookY, 0);

       state.camera.position.lerp(camTargetPos, 0.08);
       currentLookAt.current.lerp(lookTarget, 0.08);
    }
    
    state.camera.lookAt(currentLookAt.current);

    // --- Animate Main Logo ---
    if (!logoRef.current) logoRef.current = document.getElementById('main-logo');
    const logo = logoRef.current;
    if (logo) {
      const isMobile = state.size.width < 768;
      const t = Math.min(s / 0.15, 1); 
      const easeT = t * (2 - t); // easeOut quadratic
      
      const startTop = state.size.height * (isMobile ? 0.35 : 0.4);
      const startLeft = state.size.width * (isMobile ? 0.5 : 0.25);
      const endTop = isMobile ? 40 : 60; // Approximate final top-left y center
      const endLeft = isMobile ? state.size.width / 2 : 140; // Approximate final x center (center on mobile)
      
      const currentTop = THREE.MathUtils.lerp(startTop, endTop, easeT);
      const currentLeft = THREE.MathUtils.lerp(startLeft, endLeft, easeT);
      const scale = THREE.MathUtils.lerp(1, isMobile ? 0.3 : 0.15, easeT); // scale down
      
      logo.style.top = `${currentTop}px`;
      logo.style.left = `${currentLeft}px`;
      logo.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    // --- Fade out Hero Description ---
    if (!heroDescRef.current) heroDescRef.current = document.getElementById('hero-desc');
    const heroDesc = heroDescRef.current;
    if (heroDesc) {
      const t = Math.min(s / 0.1, 1);
      heroDesc.style.opacity = `${1 - t}`;
    }
  });

  return (
    <>
      {/* Môi trường HDRI: Tạo ánh sáng studio và phản xạ thực tế (rất mượt) */}
      <Suspense fallback={null}>
         <Environment preset={isDarkMode ? "night" : "city"} environmentIntensity={isDarkMode ? 0.1 : 0.8} />
      </Suspense>

      <ambientLight intensity={isDarkMode ? 0.05 : 0.4} color={isDarkMode ? "#222244" : "#ffffff"} />
      
      {/* Ánh sáng mặt trời chiếu vát tạo khối */}
      <directionalLight 
         position={[25, 15, 15]} 
         intensity={isDarkMode ? 0.1 : 1.5} 
         castShadow 
         shadow-mapSize={[1024, 1024]} 
         shadow-camera-left={-25}
         shadow-camera-right={25}
         shadow-camera-top={25}
         shadow-camera-bottom={-25}
         color={isDarkMode ? "#555588" : "#fffcf2"}
         shadow-bias={-0.0001}
      />

      {/* Hiệu ứng Contact Shadows: Bóng đổ chân thật sát mặt kệ (AO) - frames={1} để tối ưu hiệu năng */}
      <ContactShadows position={[0, -3.89, -1]} opacity={0.65} scale={50} blur={2.5} far={4} resolution={512} color="#332211" frames={1} />
      
      <CursorLight isDarkMode={isDarkMode} />

      {/* Hiệu ứng hạt bụi bay lơ lửng */}
      <Sparkles 
         count={isDarkMode ? 120 : 40} 
         scale={[20, 10, 8]} 
         size={isDarkMode ? 3 : 1.5} 
         speed={0.2} 
         opacity={isDarkMode ? 0.4 : 0.15} 
         position={[0, -2, 0]} 
         color={isDarkMode ? "#ffd199" : "#ffffff"} 
      />

      {/* --- CẤU TRÚC KỆ SÁCH & BỨC TƯỜNG --- */}
      <Suspense fallback={null}>
        <Bookshelf />
      </Suspense>

      {/* --- NỘI DUNG VĂN BẢN VẼ TRÊN TƯỜNG (Z = -2.5 để không bị lẹm vào tường Z=-2.6) --- */}

      {/* Màn 1: Hero (HTML Overlay theo mẫu) */}
      <Scroll html style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
        <div className="w-full h-full relative" style={{ pointerEvents: 'none' }}>
          {/* Chữ HIÊN studio đã được chuyển sang Overlay.tsx để cố định và hiệu ứng trượt */}
          
          {/* Đoạn miêu tả bên phải */}
          <div id="hero-desc" className="absolute w-full px-6 md:w-auto md:px-0 left-1/2 md:left-auto md:right-[20%] top-[65%] -translate-y-1/2 -translate-x-1/2 md:translate-x-0" style={{ maxWidth: '450px' }}>
            <p className="text-sm md:text-base text-[#333] font-serif italic leading-relaxed md:text-right text-center md:text-left" style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
              {settings?.heroDescription || "Hiên archi là một xưởng thiết kế kiến trúc nhỏ. Chúng tôi làm việc với con người và khí hậu bản địa để tạo nên những không gian sống mộc mạc, bình yên"}
            </p>
          </div>

          {/* Màn 2: About (HTML với hiệu ứng gõ phím) */}
          <AboutSection />
        </div>
      </Scroll>

      {/* --- CÁC MÔ HÌNH DỰ ÁN (PROJECTS) --- */}
      <group position={[0, -3.9, -1]}>
         
         {/* Phụ kiện trang trí */}
         <Suspense fallback={null}>
            <DecorativeLamp 
               position={[10, 0, -1]} 
               scale={9} 
               isDarkMode={isDarkMode} 
               onToggle={() => setIsDarkMode(!isDarkMode)} 
            />
         </Suspense>
         
         {(() => {
            const photoProjects = projects ? projects.filter((p: any) => !p.modelFileUrl) : [];
            const modelProjects = projects ? projects.filter((p: any) => p.modelFileUrl) : [];
            const gridProjects: any[] = [];
            let r = 0, c = 0;
            
            photoProjects.forEach((p: any) => {
               gridProjects.push({ ...p, gridRow: r, gridCol: c });
               c++; if (c >= 5) { c = 0; r++; }
            });
            if (c > 0) { r++; c = 0; }
            modelProjects.forEach((p: any) => {
               gridProjects.push({ ...p, gridRow: r, gridCol: c });
               c++; if (c >= 5) { c = 0; r++; }
            });

            if (gridProjects.length === 0) {
              return (
                <InteractiveProject index={0} position={[0, 0, 0]} title="Đang tải dữ liệu..." isDarkMode={isDarkMode}>
                   <Suspense fallback={<LoadingSpinner />}>
                      <FallbackPhotoFrame image={null} index={0} />
                   </Suspense>
                </InteractiveProject>
              );
            }

            return gridProjects.map((project: any, index: number) => {
               const originalIndex = projects.findIndex((p: any) => p._id === project._id);
               const activeIdx = originalIndex !== -1 ? originalIndex : index;
               return (
                 <InteractiveProject 
                    key={project._id || index} 
                    index={activeIdx} 
                    position={[project.gridCol * 4, -project.gridRow * 4, 0]} 
                    title={project.name}
                    generalInfo={project.generalInfo}
                    isDarkMode={isDarkMode}
                 >
                    <Suspense fallback={<LoadingSpinner />}>
                      {project.modelFileUrl ? (
                        <SplineModel url={project.modelFileUrl} scale={0.8} position={[0, 0, 0.25]} rotation={[0, 0, 0]} />
                      ) : (
                        <FallbackPhotoFrame image={project.image} index={activeIdx} />
                      )}
                    </Suspense>
                 </InteractiveProject>
               );
            });
         })()}
      </group>

      {/* --- HIỆU ỨNG HẬU KỲ (POST-PROCESSING) --- */}
      <EffectComposer>
         <Bloom 
            luminanceThreshold={isDarkMode ? 0.2 : 0.8} 
            luminanceSmoothing={0.9} 
            intensity={isDarkMode ? 1.2 : 0.2} 
            opacity={1}
         />
         <Vignette eskil={false} offset={0.1} darkness={isDarkMode ? 0.6 : 0.25} />
      </EffectComposer>
    </>
  );
}

export function Scene() {
   useEffect(() => {
     return () => { document.body.style.cursor = 'auto'; };
   }, []);
 
   return (
     <ScrollControls pages={3} damping={0.2}>
        <SceneContents />
     </ScrollControls>
   );
}
