import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Scene } from './Scene';
import { InlineLoadingIndicator } from './ui/InlineLoadingIndicator';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n';

/**
 * DesktopCanvas — Canvas 3D chỉ render trên desktop.
 * 
 * Tách thành module riêng để lazy import:
 * - Mobile: không load Three.js, @react-three/fiber, @react-three/drei
 * - Desktop: load đầy đủ trải nghiệm 3D kệ sách
 */
export default function DesktopCanvas() {
  const isDarkMode = useStore(state => state.isDarkMode);
  const { t } = useTranslation();
  return (
    <Canvas
        shadows
        camera={{ position: [0, 1.5, 18], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={[isDarkMode ? '#141518' : '#ffffff']} />
        <Suspense fallback={<Html center style={{ pointerEvents: 'none' }}><InlineLoadingIndicator label={t.projectDetail.loadingModel} /></Html>}>
          <Scene />
        </Suspense>
    </Canvas>
  );
}
