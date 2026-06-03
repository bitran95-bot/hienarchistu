import { useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { calculateProjectLayout } from '../../utils/layout';

export function Bookshelf() {
  const { projects } = useStore();
  const wallTextures = useTexture({
    map: '/textures/beige_wall_001_diff_2k.jpg',
    displacementMap: '/textures/beige_wall_001_disp_2k.png',
    roughnessMap: '/textures/beige_wall_001_rough_2k.jpg',
  });
  const shelfTexture = useTexture('/textures/plywood_diff_2k.jpg');

  const shelfGeometry = useMemo(() => new THREE.BoxGeometry(80, 0.2, 2.5), []);
  const shelfMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: shelfTexture, roughness: 0.8, color: 0xffffff }), [shelfTexture]);

  useEffect(() => {
    Object.values(wallTextures).forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 4);
    });
    wallTextures.map.colorSpace = THREE.SRGBColorSpace;
    
    shelfTexture.wrapS = shelfTexture.wrapT = THREE.RepeatWrapping;
    shelfTexture.repeat.set(8, 0.5);
    shelfTexture.colorSpace = THREE.SRGBColorSpace;
  }, [wallTextures, shelfTexture]);

  return (
    <group position={[10, 0, -2]}>
      {/* Bức tường trắng có texture thạch cao */}
      <mesh position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[100, 50]} />
        <meshStandardMaterial 
          map={wallTextures.map}
          roughnessMap={wallTextures.roughnessMap}
          bumpMap={wallTextures.displacementMap}
          bumpScale={0.15}
          color="#ffffff"
        />
      </mesh>

      {/* Đợt kệ */}
      {(() => {
        const layout = calculateProjectLayout(projects || []);
        const totalRows = layout.length > 0 ? Math.max(...layout.map((l) => l.computedRow)) + 1 : 0;
        const shelfRows = Math.max(1, totalRows);
        
        return Array.from({ length: shelfRows }).map((_, r) => (
          <mesh key={r} geometry={shelfGeometry} material={shelfMaterial} position={[10, -4 - r * 4, 0]} receiveShadow castShadow />
        ));
      })()}
    </group>
  );
}
