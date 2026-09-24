import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { calculateProjectLayout } from '../../utils/layout';
import { createWindowSunlightTexture } from './windowSunlightTexture';

export function Bookshelf() {
  const { projects, isDarkMode } = useStore();
  const shelfTexture = useTexture('/textures/plywood_diff_2k.jpg');

  const configuredShelfTexture = useMemo(() => {
    const texture = shelfTexture.clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 0.5);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [shelfTexture]);

  const shelfGeometry = useMemo(() => new THREE.BoxGeometry(80, 0.2, 2.5), []);
  const shelfMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: configuredShelfTexture, roughness: 0.8, color: 0xffffff }), [configuredShelfTexture]);

  const sunlightTexture = useMemo(() => createWindowSunlightTexture(false), []);

  // Tính số hàng kệ dựa trên grid layout (memoized để tránh tính lại mỗi render)
  const shelfRows = useMemo(() => {
    const layout = calculateProjectLayout(projects || []);
    const totalRows = layout.length > 0 ? Math.max(...layout.map((l) => l.computedRow)) + 1 : 0;
    return Math.max(1, totalRows);
  }, [projects]);

  return (
    <group position={[10, 0, -2]}>
      {/* Tường trắng trơn; chỉ các đợt kệ dùng texture gỗ. */}
      <mesh position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[100, 50]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {!isDarkMode && (
        <>
          <mesh position={[-4.5, 2, -2.97]}>
            <planeGeometry args={[20, 18]} />
            <meshBasicMaterial map={sunlightTexture} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -2.94]} receiveShadow>
            <planeGeometry args={[100, 50]} />
            <shadowMaterial color="#6b6257" opacity={0.2} depthWrite={false} />
          </mesh>
        </>
      )}

      {/* Đợt kệ */}
      {Array.from({ length: shelfRows }).map((_, r) => (
        <mesh key={r} geometry={shelfGeometry} material={shelfMaterial} position={[10, -4 - r * 4, 0]} receiveShadow castShadow />
      ))}
    </group>
  );
}
