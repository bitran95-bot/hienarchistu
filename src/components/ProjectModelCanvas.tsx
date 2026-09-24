import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

function Model({ url }: { url: string }) {
  const { scene: source } = useGLTF(url) as { scene: THREE.Group };
  const { scene, center, scale } = useMemo(() => {
    const scene = clone(source);
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const longestSide = Math.max(size.x, size.y, size.z);
    return { scene, center, scale: longestSide > 0 ? 3.8 / longestSide : 1 };
  }, [source]);

  return (
    <group scale={scale}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export default function ProjectModelCanvas({ url, loadingLabel }: { url: string; loadingLabel: string }) {
  return (
    <Canvas
      camera={{ position: [4.5, 2.8, 5.8], fov: 40, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={1.7} />
      <hemisphereLight args={['#ffffff', '#d9d4ca', 1.2]} />
      <directionalLight position={[5, 8, 6]} intensity={2} />
      <directionalLight position={[-4, 4, -5]} intensity={0.9} />
      <Suspense fallback={<Html center><span className="whitespace-nowrap text-sm text-stone-500">{loadingLabel}</span></Html>}>
        <Model url={url} />
      </Suspense>
      <OrbitControls enablePan={false} enableDamping minDistance={2.5} maxDistance={12} rotateSpeed={0.7} />
    </Canvas>
  );
}
