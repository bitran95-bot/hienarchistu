import { useState, Suspense, useEffect, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { client } from './sanityClient';
import { LoadingScreen } from './components/LoadingScreen';

// Lazy load các component nặng để tăng tốc độ tải trang ban đầu (Code Splitting)
const Scene = lazy(() => import('./components/Scene').then(module => ({ default: module.Scene })));
const Overlay = lazy(() => import('./components/Overlay').then(module => ({ default: module.Overlay })));

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);

  const [settings, setSettings] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    client.fetch(`{
      "projects": *[_type == "project"] | order(order asc) {
        ...,
        "modelFileUrl": modelFile.asset->url
      },
      "settings": *[_type == "siteSettings"][0]
    }`).then((data) => {
      setProjects(data.projects || []);
      setSettings(data.settings || null);
      setDataLoaded(true);
    }).catch(console.error);
  }, []);

  return (
    <>
      {/* Màn hình chờ */}
      <LoadingScreen started={dataLoaded} />

      
      {/* Không gian 3D nền (Ban ngày sáng sủa) */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#fdfbf7]">
         <Canvas shadows camera={{ position: [0, 1.5, 18], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }} style={{ touchAction: 'pan-y' }}>
           <Suspense fallback={null}>
             <Scene setModalOpen={setModalOpen} setActiveProject={setActiveProject} modalOpen={modalOpen} activeProject={activeProject} projects={projects} settings={settings} />
           </Suspense>
         </Canvas>
      </div>

      {/* Lớp nội dung (Chỉ còn Modal và Header siêu nhỏ) */}
      <div className="relative z-30 w-full pointer-events-none">
         <Suspense fallback={null}>
            <Overlay 
               modalOpen={modalOpen} 
               setModalOpen={setModalOpen} 
               activeProject={activeProject} 
               projects={projects}
               settings={settings}
            />
         </Suspense>
      </div>
    </>
  );
}

export default App;
