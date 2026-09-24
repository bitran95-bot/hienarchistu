import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { calculateProjectLayout } from '../../utils/layout';

export function Bookshelf() {
  const { projects, isDarkMode } = useStore();
  const shelfTexture = useTexture('/textures/plywood_diff_2k.jpg');
  const wallPhoto = useTexture('/textures/sunlit-wall.webp');

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
  const configuredWallPhoto = useMemo(() => {
    const texture = wallPhoto.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [wallPhoto]);

  // Tính số hàng kệ dựa trên grid layout (memoized để tránh tính lại mỗi render)
  const shelfRows = useMemo(() => {
    const layout = calculateProjectLayout(projects || []);
    const totalRows = layout.length > 0 ? Math.max(...layout.map((l) => l.computedRow)) + 1 : 0;
    return Math.max(1, totalRows);
  }, [projects]);
  // Giữ mép trên cố định, nới tường xuống dưới khi Sanity có thêm hàng dự án.
  const wallHeight = Math.max(45, shelfRows * 4 + 32);
  const wallWidth = wallHeight * (1672 / 941);
  const wallY = -(wallHeight - 45) / 2;

  return (
    <group position={[10, 0, -2]}>
      {/* Tường ảnh và các đợt kệ cùng một hệ tọa độ; tường lùi hẳn sau mép kệ. */}
      <mesh position={[0, wallY, -4.5]}>
        <planeGeometry args={[wallWidth, wallHeight]} />
        {isDarkMode
          ? <meshBasicMaterial color="#ffffff" />
          : <meshBasicMaterial map={configuredWallPhoto} toneMapped={false} />}
      </mesh>
      <mesh position={[0, wallY, -4.48]} receiveShadow>
        <planeGeometry args={[wallWidth, wallHeight]} />
        <shadowMaterial color="#5e5549" opacity={isDarkMode ? 0 : 0.12} depthWrite={false} />
      </mesh>

      {/* Đợt kệ */}
      {Array.from({ length: shelfRows }).map((_, r) => (
        <mesh key={r} geometry={shelfGeometry} material={shelfMaterial} position={[10, -4 - r * 4, 0]} receiveShadow castShadow />
      ))}
    </group>
  );
}
