import { useMemo } from 'react';
import * as THREE from 'three';

/** A small downlight aimed at one project, independent of its hover rotation. */
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
      <group position={[0, 3.4, 1.8]} rotation={[0.55, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.16, 0.28, 12]} />
          <meshStandardMaterial color="#3b3631" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.17, 0]}>
          <sphereGeometry args={[0.07, 12, 8]} />
          <meshBasicMaterial color="#ffe1aa" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
