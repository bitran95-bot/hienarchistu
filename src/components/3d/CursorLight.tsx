import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CursorLight({ isDarkMode }: { isDarkMode: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current && isDarkMode) {
      const x = state.pointer.x * 15 + state.camera.position.x;
      const y = state.pointer.y * 10 + state.camera.position.y;
      
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, x, 0.2);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, y, 0.2);
      lightRef.current.position.z = state.camera.position.z - 3;
    }
  });

  if (!isDarkMode) return null;
  return <pointLight ref={lightRef} intensity={50} distance={40} decay={1.5} color="#ffffff" />;
}
