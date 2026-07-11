import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function DecorativeLamp({ position, scale = 1, isDarkMode, onToggle }: { position: [number, number, number], scale?: number, isDarkMode?: boolean, onToggle?: () => void }) {
  const { scene } = useGLTF('/LampModel/bankers_lamp.glb') as { scene: THREE.Group };
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (onToggle) onToggle();
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <primitive object={clonedScene} scale={scale} rotation={[0, -Math.PI / 4, 0]} />
      
      {/* Nguồn sáng của bóng đèn khi trời tối */}
      {isDarkMode && (
        <pointLight 
          position={[-1, 2.5, 0]} 
          intensity={15} 
          distance={40} 
          decay={1.5}
          color="#ffcc88" 
          castShadow={false}
        />
      )}
    </group>
  );
}

useGLTF.preload('/LampModel/bankers_lamp.glb');
