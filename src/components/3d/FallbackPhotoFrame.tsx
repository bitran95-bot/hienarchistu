import { useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { urlFor } from '../../sanityClient';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Project } from '../../types';

export function FallbackPhotoFrame({ project, index = 0, isDarkMode = false }: { project: Partial<Project>; index?: number; isDarkMode?: boolean }) {
  // Load mô hình tạp chí từ thư mục public (thêm ?v=2 để tránh cache trình duyệt)
  const { scene: originalScene } = useGLTF('/magazine.glb?v=3') as any;
  const scene = useMemo(() => clone(originalScene), [originalScene]);
  
  const image = project?.image;
  const imageUrl = image?.asset 
    ? urlFor(image).width(800).quality(80).auto('format').url() 
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop";
    
  const texture = useTexture(imageUrl);
  
  // Tính toán Scale để quyển sách có kích thước phù hợp trên kệ
  const { autoScale, boxSize } = useMemo(() => {
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

  // Xử lý Texture (Crop hình ảnh để không bị méo tỉ lệ)
  // Lưu ref của texture cũ để dispose khi thay đổi, tránh GPU memory leak
  const prevTextureRef = useRef<THREE.Texture | null>(null);

  const mappedTexture = useMemo(() => {
     const t = texture.clone();
     t.colorSpace = THREE.SRGBColorSpace;
     t.flipY = false; 

     // Tính tỉ lệ ảnh và tỉ lệ sách
     let imageAspect = 1.5; // Mặc định landscape nhẹ
     if (image?.asset?._ref) {
        const match = image.asset._ref.match(/-(\d+)x(\d+)-/);
        if (match) {
           const w = parseInt(match[1], 10);
           const h = parseInt(match[2], 10);
           if (w && h) imageAspect = w / h;
        }
     }
     
     // Giả định mặt sách là mặt lớn nhất của bounding box (thường là x và y)
     const coverAspect = boxSize.y > 0 ? (boxSize.x / boxSize.y) : 0.75;

     // Logic Object-fit: cover
     if (imageAspect > coverAspect) {
        // Ảnh bè ngang hơn sách -> crop 2 bên hông
        t.repeat.set(coverAspect / imageAspect, 1);
        t.offset.set((1 - (coverAspect / imageAspect)) / 2, 0);
     } else {
        // Ảnh dài dọc hơn sách -> crop trên dưới
        t.repeat.set(1, imageAspect / coverAspect);
        t.offset.set(0, (1 - (imageAspect / coverAspect)) / 2);
     }

     t.needsUpdate = true;
     return t;
  }, [texture, image, boxSize]);

  // Dispose cloned texture cũ khi deps thay đổi hoặc unmount → giải phóng GPU memory
  useEffect(() => {
     if (prevTextureRef.current && prevTextureRef.current !== mappedTexture) {
        prevTextureRef.current.dispose();
     }
     prevTextureRef.current = mappedTexture;
     return () => {
        mappedTexture.dispose();
     };
  }, [mappedTexture]);

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
                    const newMat = new THREE.MeshStandardMaterial({
                       map: mappedTexture,
                       color: 0xffffff,
                       roughness: 0.85, // Nhám hơn để giống giấy, giảm phản xạ ánh sáng làm mờ ảnh
                       metalness: 0.05,
                       side: THREE.DoubleSide,
                       emissive: isDarkMode ? new THREE.Color(0xffffff) : new THREE.Color(0x000000),
                       emissiveMap: isDarkMode ? mappedTexture : null,
                       emissiveIntensity: isDarkMode ? 0.8 : 0 // Tỏa sáng mạnh hơn khi tắt đèn
                    });
                    
                    if (Array.isArray(child.material)) {
                       child.material[i] = newMat;
                    } else {
                       child.material = newMat;
                    }
                 }
              });
           }
        }
     });
  }, [scene, mappedTexture, isDarkMode]);
  
  // Độ nghiêng ngẫu nhiên nhẹ cho tự nhiên trên kệ
  const tiltZ = -0.15; // Ngả ra sau
  const tiltY = (index % 3 === 0) ? -0.05 : ((index % 2 === 0) ? 0.05 : 0);

  // Đặt sách đứng ở mép kệ, dời vào trong một chút (Z: 0.1 thay vì 0.4)
  return (
    <group position={[0, 0, 0.1]} rotation={[tiltZ, tiltY, 0]}>
       <group scale={autoScale}>
         <primitive object={scene} position={[0, 0, 0]} />
       </group>
    </group>
  );
}

useGLTF.preload('/magazine.glb?v=3');
