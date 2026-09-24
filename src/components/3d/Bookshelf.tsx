import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { calculateProjectLayout } from '../../utils/layout';

export function Bookshelf() {
  const { projects } = useStore();

  const shelfGeometry = useMemo(() => new THREE.BoxGeometry(80, 0.2, 2.5), []);
  const shelfMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }), []);

  // Tính số hàng kệ dựa trên grid layout (memoized để tránh tính lại mỗi render)
  const shelfRows = useMemo(() => {
    const layout = calculateProjectLayout(projects || []);
    const totalRows = layout.length > 0 ? Math.max(...layout.map((l) => l.computedRow)) + 1 : 0;
    return Math.max(1, totalRows);
  }, [projects]);

  return (
    <group position={[10, 0, -2]}>
      {/* Nền trắng trơn, không tải texture tường hoặc kệ. */}
      <mesh position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[100, 50]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Đợt kệ */}
      {Array.from({ length: shelfRows }).map((_, r) => (
        <mesh key={r} geometry={shelfGeometry} material={shelfMaterial} position={[10, -4 - r * 4, 0]} receiveShadow castShadow />
      ))}
    </group>
  );
}
