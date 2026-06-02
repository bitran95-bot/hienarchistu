import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function SplineModel({ url, scale = 1, position = [0,0,0], rotation = [0,0,0] }: any) {
  const { scene } = useGLTF(url) as any;

  // Tự động tính toán để scale mô hình vừa vặn trên kệ
  const { autoScale } = useMemo(() => {
    // Bật bóng đổ và thêm viền (edges) cho tất cả các chi tiết bên trong mô hình
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Thêm đường nét viền (edges) để tạo phong cách phác thảo kiến trúc
        if (!child.userData.hasEdges) {
          // Tăng góc threshold lên 40 độ để bỏ qua các bề mặt cong tròn, chỉ lấy nét ở các góc cạnh sắc nét (tường, mái)
          const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 40); 
          const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x5c4a3d, // Đổi sang màu nâu chì (sepia/pencil tone) để hợp với chất liệu gỗ/giấy
            linewidth: 1, 
            transparent: true, 
            opacity: 0.15 // Giảm độ đậm để nét vẽ chìm nhẹ vào khối, không bị gắt
          });
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          child.add(edges);
          child.userData.hasEdges = true;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    
    // Đưa tâm gốc (pivot) của mô hình về chính giữa mặt đáy để luôn khớp với mặt kệ
    const center = box.getCenter(new THREE.Vector3());
    scene.position.x = -center.x;
    scene.position.z = -center.z;
    scene.position.y = -box.min.y;
    
    // Kích thước tối đa cho phép (vừa vặn với kệ sách)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2.4; 
    
    let computedScale = scale;
    if (maxDim > 0) {
      computedScale = (targetSize / maxDim) * scale;
    }
    
    return { 
      autoScale: computedScale
    };
  }, [scene, scale]);

  return (
    <group position={position} rotation={rotation}>
      <primitive 
        object={scene} 
        scale={autoScale} 
      />
    </group>
  );
}
