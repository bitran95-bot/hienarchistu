import { useMemo } from 'react';
import * as THREE from 'three';
import { createWindowSunlightTexture } from './windowSunlightTexture';

/** Projects a warm, angled window with soft foliage shadows onto shelves and models. */
export function WindowSunlight() {
  const target = useMemo(() => new THREE.Object3D(), []);
  const windowMap = useMemo(() => createWindowSunlightTexture(true), []);

  return (
    <group>
      <primitive object={target} position={[10, -4, -3]} />
      <spotLight
        position={[-8, 14, 15]}
        target={target}
        map={windowMap}
        color="#ffe9c3"
        intensity={2.2}
        angle={0.72}
        penumbra={0.35}
        decay={0}
      />
    </group>
  );
}
