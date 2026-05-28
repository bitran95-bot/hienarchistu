import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { client } from './sanityClient';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    client.fetch(`*[_type == "project"] | order(order asc) {
      ...,
      "modelFileUrl": modelFile.asset->url
    }`).then((data) => {
      setProjects(data);
    }).catch(console.error);
  }, []);

  return (
    <>
      <div id="paper-texture"></div>
      
      {/* Không gian 3D nền (Ban ngày sáng sủa) */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#fdfbf7]">
         <Canvas shadows camera={{ position: [0, 1.5, 18], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
           <Suspense fallback={null}>
             <Scene setModalOpen={setModalOpen} setActiveProject={setActiveProject} modalOpen={modalOpen} activeProject={activeProject} projects={projects} />
           </Suspense>
         </Canvas>
      </div>

      {/* Lớp nội dung (Chỉ còn Modal và Header siêu nhỏ) */}
      <div className="relative z-30 w-full pointer-events-none">
         <Overlay 
            modalOpen={modalOpen} 
            setModalOpen={setModalOpen} 
            activeProject={activeProject} 
            projects={projects}
         />
      </div>
    </>
  );
}

export default App;
