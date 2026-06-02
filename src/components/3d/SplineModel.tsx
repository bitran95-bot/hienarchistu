import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function SplineModel({ url, scale = 1, position = [0,0,0], rotation = [0,0,0] }: any) {
  const { scene } = useGLTF(url) as any;

  // Dùng useMemo tính toán các thông số offset dựa trên scene nguyên bản
  const { autoScale, offsetX, offsetY, offsetZ } = useMemo(() => {
    // Lưu lại transform cũ (đề phòng)
    const oldPos = scene.position.clone();
    const oldScale = scene.scale.clone();
    
    // Đưa về gốc để tính toán chuẩn xác bounding box
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    // Bật bóng đổ và thêm viền (edges)
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (!child.userData.hasEdges) {
          const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 40); 
          const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x5c4a3d,
            linewidth: 1, 
            transparent: true, 
            opacity: 0.15
          });
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          child.add(edges);
          child.userData.hasEdges = true;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Kích thước tối đa cho phép
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2.4; 
    
    let computedScale = scale;
    if (maxDim > 0) {
      computedScale = (targetSize / maxDim) * scale;
    }
    
    // Trả lại transform cũ
    scene.position.copy(oldPos);
    scene.scale.copy(oldScale);
    scene.updateMatrixWorld(true);

    return { 
      autoScale: computedScale,
      offsetX: -center.x,
      offsetY: -box.min.y,
      offsetZ: -center.z
    };
  }, [scene, scale]);

  return (
    <group position={position} rotation={rotation}>
      <group scale={autoScale}>
        <primitive 
          object={scene} 
          position={[offsetX, offsetY, offsetZ]}
        />
      </group>
    </group>
  );
}
