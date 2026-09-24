import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { calculateProjectLayout } from '../../utils/layout';

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

  const sunlightTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      const glow = context.createRadialGradient(128, 128, 15, 128, 128, 128);
      glow.addColorStop(0, 'rgba(255, 225, 174, 0.26)');
      glow.addColorStop(0.7, 'rgba(255, 231, 190, 0.13)');
      glow.addColorStop(1, 'rgba(255, 231, 190, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, 256, 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

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
          <mesh position={[0, -2, -2.97]}>
            <planeGeometry args={[50, 26]} />
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
