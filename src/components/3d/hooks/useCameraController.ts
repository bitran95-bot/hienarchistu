import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import type { GridData } from '../../../types';

export function useCameraController(
  gridData: GridData,
  modalOpen: boolean,
  activeProject: number
) {
  const scroll = useScroll();
  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, 0));
  const camTargetPosRef = useRef(new THREE.Vector3());
  const lookTargetRef = useRef(new THREE.Vector3());

  useFrame((state) => {
    const s = scroll.offset; // 0 to 1

    // 1. Chuyển động Camera (Cinematic Camera)
    const zoomT = THREE.MathUtils.smoothstep(s, 0.25, 0.45); // Camera hạ xuống rất sớm
    const panT = THREE.MathUtils.smoothstep(s, 0.45, 1.0);  // Trượt ngang kéo dài

    // 2. Parallax góc nhìn lắc nhẹ theo chuột
    const parallaxX = state.pointer.x * 1.2;
    const parallaxY = state.pointer.y * 1.2;

    // 3. Tính toán vị trí theo Grid Layout
    let gridX = 0;
    let gridY = 0;
    
    if (gridData.path.length > 0) {
       const totalItems = gridData.path.length;
       const currentIndex = panT * Math.max(0, totalItems - 1);
       const floorIdx = Math.floor(currentIndex);
       const ceilIdx = Math.min(Math.ceil(currentIndex), totalItems - 1);
       const fraction = currentIndex - floorIdx;

       const p1 = gridData.path[floorIdx];
       const p2 = gridData.path[ceilIdx];

       gridX = THREE.MathUtils.lerp(p1.computedX, p2.computedX, fraction);
       gridY = THREE.MathUtils.lerp(-p1.gridRow * 4, -p2.gridRow * 4, fraction);
    }

    const isMobileCam = state.size.width < 768;

    const camY = THREE.MathUtils.lerp(1.5, -2.5 + gridY, zoomT) + parallaxY;
    const camZ = THREE.MathUtils.lerp(isMobileCam ? 24 : 18, isMobileCam ? 16 : 11, zoomT);
    const camX = THREE.MathUtils.lerp(0, gridX, zoomT) + parallaxX;

    const lookY = THREE.MathUtils.lerp(1.5, -2.5 + gridY, zoomT);
    const lookX = THREE.MathUtils.lerp(0, gridX, zoomT);

    if (modalOpen && gridData.map[activeProject]) {
       const activeLoc = gridData.map[activeProject]!;
       const targetX = activeLoc.computedX;
       const targetY_grid = -activeLoc.gridRow * 4;
       camTargetPosRef.current.set(targetX - 2.0, -3.2 + targetY_grid, 4.5);
       lookTargetRef.current.set(targetX, -3.8 + targetY_grid, 0);

       state.camera.position.lerp(camTargetPosRef.current, 0.08);
       currentLookAt.current.lerp(lookTargetRef.current, 0.08);
    } else {
       camTargetPosRef.current.set(camX, camY, camZ);
       lookTargetRef.current.set(lookX, lookY, 0);

       state.camera.position.lerp(camTargetPosRef.current, 0.08);
       currentLookAt.current.lerp(lookTargetRef.current, 0.08);
    }
    
    state.camera.lookAt(currentLookAt.current);
  });
}
