import { useMemo } from 'react';
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

  // Configure wall & shelf textures without mutating useTexture cache
  const configuredWallTextures = useMemo(() => {
    const map = wallTextures.map.clone();
    const roughnessMap = wallTextures.roughnessMap.clone();
    const displacementMap = wallTextures.displacementMap.clone();
    
    [map, roughnessMap, displacementMap].forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 4);
      texture.needsUpdate = true;
    });
    map.colorSpace = THREE.SRGBColorSpace;
    return { map, roughnessMap, displacementMap };
  }, [wallTextures]);

  const configuredShelfTexture = useMemo(() => {
    const tex = shelfTexture.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 0.5);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [shelfTexture]);

  const shelfGeometry = useMemo(() => new THREE.BoxGeometry(80, 0.2, 2.5), []);
  const shelfMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: configuredShelfTexture, roughness: 0.8, color: 0xffffff }), [configuredShelfTexture]);

  // Tính số hàng kệ dựa trên grid layout (memoized để tránh tính lại mỗi render)
  const shelfRows = useMemo(() => {
    const layout = calculateProjectLayout(projects || []);
    const totalRows = layout.length > 0 ? Math.max(...layout.map((l) => l.computedRow)) + 1 : 0;
    return Math.max(1, totalRows);
  }, [projects]);

  return (
    <group position={[10, 0, -2]}>
      {/* Bức tường trắng có texture thạch cao */}
      <mesh position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[100, 50]} />
        <meshStandardMaterial 
          map={configuredWallTextures.map}
          roughnessMap={configuredWallTextures.roughnessMap}
          bumpMap={configuredWallTextures.displacementMap}
          bumpScale={0.15}
          color="#ffffff"
        />
      </mesh>

      {/* Đợt kệ */}
      {Array.from({ length: shelfRows }).map((_, r) => (
        <mesh key={r} geometry={shelfGeometry} material={shelfMaterial} position={[10, -4 - r * 4, 0]} receiveShadow castShadow />
      ))}
    </group>
  );
}
