import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { Scene } from './Scene';
import { LoadingScreen } from './LoadingScreen';
import { RecoveryMessage } from './ui/RecoveryMessage';

/**
 * DesktopCanvas — Canvas 3D chỉ render trên desktop.
 * 
 * Tách thành module riêng để lazy import:
 * - Mobile: không load Three.js, @react-three/fiber, @react-three/drei
 * - Desktop: load đầy đủ trải nghiệm 3D kệ sách
 */
export default function DesktopCanvas() {
  const { progress, active } = useProgress();
  const [timedOut, setTimedOut] = useState(false);
  const ready = progress === 100 && !active;
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setTimedOut(true), 20_000);
    return () => clearTimeout(timer);
  }, [ready]);
  if (timedOut && !ready) return <RecoveryMessage scene fullScreen />;
  return (
    <>
      <LoadingScreen started={ready} progress={progress} />
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 18], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#ffffff']} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  );
}
