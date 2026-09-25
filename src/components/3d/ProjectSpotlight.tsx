import { useMemo } from 'react';
import * as THREE from 'three';

/** Invisible light aimed at one project, independent of its hover rotation. */
export function ProjectSpotlight({ position }: { position: [number, number, number] }) {
  const target = useMemo(() => new THREE.Object3D(), []);

  return (
    <group position={position}>
      <primitive object={target} position={[0, 0.6, 0.25]} />
      <spotLight
        position={[0, 3.2, 1.8]}
        target={target}
        color="#ffe4b6"
        intensity={26}
        distance={8}
        decay={2}
        angle={0.55}
        penumbra={0.75}
        castShadow={false}
      />
    </group>
  );
}
