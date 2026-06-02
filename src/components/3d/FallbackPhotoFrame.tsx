import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { urlFor } from '../../sanityClient';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export function FallbackPhotoFrame({ project, index = 0 }: { project: any; index?: number }) {
  // Load mô hình tạp chí từ thư mục public
  const { scene: originalScene } = useGLTF('/magazine.glb') as any;
  const scene = useMemo(() => clone(originalScene), [originalScene]);
  
  const image = project?.image;
  const imageUrl = image?.asset 
    ? urlFor(image).width(800).quality(80).auto('format').url() 
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop";
    
  const texture = useTexture(imageUrl);
  
  // Thường các texture map vào GLTF cần cấu hình này
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false; 

  useMemo(() => {
     scene.traverse((child: any) => {
        if (child.isMesh) {
           child.castShadow = true;
           child.receiveShadow = true;
           
           if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              
              materials.forEach((mat: any, i: number) => {
                 // Gán ảnh bìa dự án vào vật liệu tên Coverfrontpage
                 if (mat.name === 'Coverfrontpage') {
                    const newMat = mat.clone();
                    newMat.map = texture;
                    // Bỏ màu gốc nếu nó bị đè
                    newMat.color = new THREE.Color(0xffffff);
                    newMat.needsUpdate = true;
                    
                    if (Array.isArray(child.material)) {
                       child.material[i] = newMat;
                    } else {
                       child.material = newMat;
                    }
                 }
                 
                 // Nếu bạn muốn xử lý Coverbackpage, có thể làm tương tự ở đây
                 // Ví dụ gán màu đơn sắc hoặc texture khác:
                 /*
                 if (mat.name === 'Coverbackpage') {
                    const newMat = mat.clone();
                    newMat.color = new THREE.Color('#2a2a2a'); // Màu tối cho mặt sau
                    newMat.needsUpdate = true;
                    if (Array.isArray(child.material)) child.material[i] = newMat;
                    else child.material = newMat;
                 }
                 */
              });
           }
        }
     });
  }, [scene, texture]);

  // Tính toán Scale để quyển sách có kích thước phù hợp trên kệ
  const { autoScale } = useMemo(() => {
    const oldPos = scene.position.clone();
    const oldScale = scene.scale.clone();
    
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 1.4; // Tương đương kích thước tạp chí giả lập trước đây
    
    let computedScale = 1;
    if (maxDim > 0) {
      computedScale = (targetSize / maxDim);
    }
    
    scene.position.copy(oldPos);
    scene.scale.copy(oldScale);
    scene.updateMatrixWorld(true);

    return { 
      autoScale: computedScale,
      boxSize: size
    };
  }, [scene]);
  
  // Độ nghiêng ngẫu nhiên nhẹ cho tự nhiên trên kệ
  const tiltZ = -0.15; // Ngả ra sau
  const tiltY = (index % 3 === 0) ? -0.05 : ((index % 2 === 0) ? 0.05 : 0);

  // Đặt sách đứng ở mép kệ, dùng pivot gốc của 3D
  return (
    <group position={[0, 0, 0.4]} rotation={[tiltZ, tiltY, 0]}>
       <group scale={autoScale}>
         <primitive object={scene} position={[0, 0, 0]} />
       </group>
    </group>
  );
}

useGLTF.preload('/magazine.glb');
