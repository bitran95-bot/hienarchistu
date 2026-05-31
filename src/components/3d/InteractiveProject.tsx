import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export function InteractiveProject({ children, position, index }: any) {
  const { setActiveProject, setModalOpen } = useStore();
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    hasDragged: false
  });
  const [dragRotY, setDragRotY] = useState(0);
  const [dragRotX, setDragRotX] = useState(0);

  const scroll = useScroll();
  const lastScroll = useRef(scroll ? scroll.offset : 0);

  useFrame((state) => {
    if (scroll && Math.abs(scroll.offset - lastScroll.current) > 0.0001) {
       if (hovered) {
          setHovered(false);
          document.body.style.cursor = 'auto';
       }
    }
    if (scroll) {
       lastScroll.current = scroll.offset;
    }

    if (!group.current) return;
    // Tăng kích thước hiển thị lên 1.5 lần
    const targetScale = hovered ? 1.95 : 1.8;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.1));
    
    // Nổi lên nhẹ khi hover, và nổi cao hơn khi đang kéo xoay để không bị lẹm vào kệ
    const targetY = dragState.current.isDragging ? 0.8 : (hovered ? 0.2 : 0);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.1);

    if (dragState.current.isDragging) {
      // Khi đang drag, quay theo giá trị kéo
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, dragRotY, 0.2);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, dragRotX, 0.2);
    } else if (hovered) {
      // Khi hover (không drag), tự động lắc lư nhẹ
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 1.5) * 0.05, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.1);
    } else {
      // Khi bình thường, trả về 0
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.1);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.1);
    }
  });

  return (
    <group position={position}>
      <group
        ref={group}
        onClick={(e) => {
           e.stopPropagation();
           if (dragState.current.hasDragged) {
              dragState.current.hasDragged = false;
              return;
           }
           setActiveProject(index);
           setModalOpen(true);
        }}
        onPointerDown={(e: any) => {
           e.stopPropagation();
           if (e.target.setPointerCapture) {
             e.target.setPointerCapture(e.pointerId);
           }
           dragState.current.isDragging = true;
           dragState.current.startX = e.clientX;
           dragState.current.startY = e.clientY;
           dragState.current.hasDragged = false;
           document.body.style.cursor = 'grabbing';
        }}
        onPointerMove={(e: any) => {
           if (dragState.current.isDragging) {
              e.stopPropagation();
              const deltaX = e.clientX - dragState.current.startX;
              const deltaY = e.clientY - dragState.current.startY;
              
              if (!dragState.current.hasDragged) {
                 const isTouch = e.pointerType === 'touch';
                 if (isTouch) {
                    // Trên Mobile (Cảm ứng): Nếu vuốt dọc nhiều hơn ngang -> Đây là thao tác cuộn trang
                    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
                       dragState.current.isDragging = false;
                       if (e.target.releasePointerCapture) {
                         e.target.releasePointerCapture(e.pointerId);
                       }
                       return;
                    }
                    // Nếu vuốt ngang đủ -> Đánh dấu đang xoay model
                    if (Math.abs(deltaX) > 5) {
                       dragState.current.hasDragged = true;
                    }
                 } else {
                    // Trên Desktop (Chuột): Vuốt hướng nào cũng cho phép xoay
                    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                       dragState.current.hasDragged = true;
                    }
                 }
              }

              if (dragState.current.hasDragged) {
                 // Ngang: tối đa 30 độ (Math.PI / 6)
                 let newRotY = deltaX * 0.005;
                 newRotY = THREE.MathUtils.clamp(newRotY, -Math.PI / 6, Math.PI / 6);
                 setDragRotY(newRotY);

                 // Dọc: tối đa 45 độ xuống (Math.PI / 4)
                 let newRotX = deltaY * 0.005;
                 newRotX = THREE.MathUtils.clamp(newRotX, 0, Math.PI / 4);
                 setDragRotX(newRotX);
              }
           }
        }}
        onPointerUp={(e: any) => {
           e.stopPropagation();
           if (e.target.releasePointerCapture) {
             e.target.releasePointerCapture(e.pointerId);
           }
           dragState.current.isDragging = false;
           setDragRotY(0);
           setDragRotX(0);
           document.body.style.cursor = hovered ? 'pointer' : 'auto';
        }}
        onPointerCancel={() => {
           dragState.current.isDragging = false;
           setDragRotY(0);
           setDragRotX(0);
           document.body.style.cursor = hovered ? 'pointer' : 'auto';
        }}
        onPointerOver={(e) => { 
           e.stopPropagation(); 
           setHovered(true); 
           if (!dragState.current.isDragging) {
             document.body.style.cursor = 'pointer'; 
           }
        }}
        onPointerOut={(e) => { 
           e.stopPropagation(); 
           setHovered(false); 
           if (!dragState.current.isDragging) {
             document.body.style.cursor = 'auto'; 
           }
        }}
      >
        {children}
      </group>
    </group>
  );
}
