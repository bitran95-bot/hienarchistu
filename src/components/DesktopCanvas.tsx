import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';

/**
 * DesktopCanvas — Canvas 3D chỉ render trên desktop.
 * 
 * Tách thành module riêng để lazy import:
 * - Mobile: không load Three.js, @react-three/fiber, @react-three/drei
 * - Desktop: load đầy đủ trải nghiệm 3D kệ sách
 */
export default function DesktopCanvas() {
  return (
    <Canvas 
      shadows 
      camera={{ position: [0, 1.5, 18], fov: 40 }} 
      dpr={[1, 1.5]} 
      gl={{ antialias: true }} 
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
