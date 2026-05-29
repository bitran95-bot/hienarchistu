import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Text, useGLTF, Environment, ContactShadows, Scroll, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { urlFor } from '../sanityClient';
// const ARCHI_FONT = "/ArchitectsDaughter-Regular.ttf";

// --- Tạo Texture tường thạch cao/xi măng bằng Canvas ---
function usePlasterTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 40000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const v = Math.random() * 255;
        context.fillStyle = `rgba(${v}, ${v}, ${v}, 0.04)`;
        context.fillRect(x, y, 2, 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 6);
    return tex;
  }, []);
  return texture;
}

// --- Vòng tròn tải (Loading Spinner) ---
function LoadingSpinner() {
  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="w-8 h-8 border-4 border-[#bda994]/30 border-t-[#bda994] rounded-full animate-spin"></div>
    </Html>
  );
}

// --- Spline Model ---
function SplineModel({ url, scale = 1, position = [0,0,0], rotation = [0,0,0] }: any) {
  const { scene } = useGLTF(url) as any;

  // Tự động tính toán để scale mô hình vừa vặn trên kệ
  const { autoScale, offset } = useMemo(() => {
    // Bật bóng đổ và thêm viền (edges) cho tất cả các chi tiết bên trong mô hình
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Thêm đường nét viền (edges) để tạo phong cách phác thảo kiến trúc
        if (!child.userData.hasEdges) {
          const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 20); // 20 độ góc để hiện nét
          const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: 0x333333, 
            linewidth: 1, 
            transparent: true, 
            opacity: 0.3 
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
    
    // Kích thước tối đa cho phép (vừa vặn với kệ sách)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 2.4; 
    
    let computedScale = scale;
    if (maxDim > 0) {
      computedScale = (targetSize / maxDim) * scale;
    }
    
    // Tính toán độ lệch để đặt mặt đáy của mô hình nằm sát lên mặt kệ
    const bottomY = box.min.y;
    return { 
      autoScale: computedScale, 
      offset: new THREE.Vector3(-center.x, -bottomY, -center.z) 
    };
  }, [scene, scale]);

  return (
    <group position={position} rotation={rotation}>
      <primitive 
        object={scene} 
        scale={autoScale} 
        position={[offset.x * autoScale, offset.y * autoScale, offset.z * autoScale]}
      />
    </group>
  );
}

// --- Khung ảnh 3D mặc định nếu không có mô hình ---
function FallbackPhotoFrame({ image, index = 0 }: { image: any; index?: number }) {
  const imageUrl = image?.asset 
    ? urlFor(image).width(800).quality(80).auto('format').url() 
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop";
  const texture = useTexture(imageUrl);

  // Lấy tỷ lệ khung hình từ _ref của Sanity (vd: "image-xxx-2000x3000-jpg")
  let aspect = 2.2 / 1.4; // Mặc định
  if (image?.asset?._ref) {
    const match = image.asset._ref.match(/-(\d+)x(\d+)-/);
    if (match) {
      const width = parseInt(match[1], 10);
      const height = parseInt(match[2], 10);
      if (width && height) {
        aspect = width / height;
      }
    }
  }

  // Cố định chiều cao khung, chiều ngang sẽ dựa vào tỷ lệ ảnh
  const baseHeight = 1.4; 
  const imgW = baseHeight * aspect;
  const imgH = baseHeight;

  // Đa dạng màu sắc viền/khung dựa trên index của dự án
  const frameColors = ['#1a1a1a', '#ffffff', '#e5d3b3', '#6b4423', '#2a3b45', '#4a4036'];
  const frameColor = frameColors[index % frameColors.length];

  return (
    <group position={[0, baseHeight / 2 + 0.2, 0]}>
       {/* Khung ngoài */}
       <mesh castShadow receiveShadow position={[0, 0, -0.05]}>
          <boxGeometry args={[imgW + 0.4, imgH + 0.4, 0.1]} />
          <meshStandardMaterial color={frameColor} roughness={0.8} />
       </mesh>
       {/* Viền lót trong (màu trắng/sáng) */}
       <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[imgW + 0.2, imgH + 0.2, 0.05]} />
          <meshStandardMaterial color="#fcfbfa" roughness={0.9} />
       </mesh>
       {/* Ảnh */}
       <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[imgW, imgH]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
       </mesh>
    </group>
  );
}

// --- Các chi tiết trang trí (Sách, Cây cảnh...) ---
function DecorativeBooks({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Sách 1 - Đứng thẳng, bìa xanh đậm */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1.2, 0.8]} />
        <meshStandardMaterial color="#2a3b45" roughness={0.6} />
      </mesh>
      
      {/* Sách 2 - Đứng thẳng, nhỏ hơn, bìa xám */}
      <mesh position={[0.22, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 1.1, 0.75]} />
        <meshStandardMaterial color="#8a8d8f" roughness={0.7} />
      </mesh>
      
      {/* Sách 3 - Nghiêng dựa vào sách 2, màu gỗ/đỏ nhạt */}
      <mesh position={[0.45, 0.48, 0]} rotation={[0, 0, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 1.1, 0.8]} />
        <meshStandardMaterial color="#945d41" roughness={0.5} />
      </mesh>
      
      {/* Sách nằm ngang kế bên */}
      <mesh position={[1.2, 0.05, 0]} rotation={[0, -0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.3, 0.7]} />
        <meshStandardMaterial color="#d4c9b3" roughness={0.9} />
      </mesh>
      
      {/* Sách mỏng nằm trên */}
      <mesh position={[1.2, 0.275, 0]} rotation={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.15, 0.65]} />
        <meshStandardMaterial color="#5c6356" roughness={0.6} />
      </mesh>

      {/* Sách bên trái, nghiêng ra ngoài */}
      <mesh position={[-0.25, 0.48, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 1.1, 0.78]} />
        <meshStandardMaterial color="#4a4238" roughness={0.8} />
      </mesh>
    </group>
  );
}

// --- Khối Dự án Tương tác ---
function InteractiveProject({ children, position, title, index, setActiveProject, setModalOpen }: any) {
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

  useFrame((state) => {
    if (!group.current) return;
    const targetScale = hovered ? 1.05 : 1;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, targetScale, 0.1));
    
    // Nổi lên nhẹ khi hover
    const targetY = hovered ? 0.3 : 0;
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
              if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                 dragState.current.hasDragged = true;
              }
              // Ngang: tối đa 30 độ (Math.PI / 6)
              let newRotY = deltaX * 0.005;
              newRotY = THREE.MathUtils.clamp(newRotY, -Math.PI / 6, Math.PI / 6);
              setDragRotY(newRotY);

              // Dọc: tối đa 45 độ xuống (Math.PI / 4)
              let newRotX = deltaY * 0.005;
              newRotX = THREE.MathUtils.clamp(newRotX, 0, Math.PI / 4);
              setDragRotX(newRotX);
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
        
        {/* Tiêu đề Dự án nằm ngay trên kệ, dưới mô hình */}
        <Text visible={hovered} position={[0, -0.6, 0]} fontSize={0.25} color="#5c4a4a" anchorY="top">
           {title}
        </Text>
      </group>
    </group>
  );
}

function AboutSection({ settings }: any) {
  const scroll = useScroll();
  const text1Ref = useRef<HTMLParagraphElement>(null);
  const text2Ref = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const text1 = settings?.aboutTitle || "Tôi là Trần Thái Bảo, một kiến trúc sư yêu bản sắc địa phương. Tôi chọn thiết kế những ngôi nhà dung dị, thích ứng với tự nhiên và tình yêu cuộc sống của gia chủ.";
  const text2 = settings?.aboutText || "Trong quá trình làm nghề, tôi đi tìm vẻ đẹp trong sự mộc mạc của gỗ, của bê tông, đá cuội và những hang hiên đón nắng che mưa. Hợp tác cùng những người thợ lành nghề tại địa phương, chúng tôi dựng nên những nếp nhà yên lành, nơi con người tìm đến sự kết nối với tự nhiên, với bản thân và gia đình";

  const chars1 = text1.split("");
  const chars2 = text2.split("");

  useFrame(() => {
     const s = scroll.offset;
     
     if (containerRef.current) {
        if (s > 0.25) {
           const fade = 1 - THREE.MathUtils.clamp((s - 0.25) / 0.05, 0, 1);
           containerRef.current.style.opacity = `${fade}`;
        } else {
           containerRef.current.style.opacity = '1';
        }
     }

     const progress1 = THREE.MathUtils.clamp((s - 0.05) / 0.1, 0, 1);
     const progress2 = THREE.MathUtils.clamp((s - 0.1) / 0.1, 0, 1); 
     
     if (text1Ref.current) {
        const spans = text1Ref.current.children;
        const total = spans.length;
        const visibleCount = Math.floor(progress1 * total);
        for (let i = 0; i < total; i++) {
           (spans[i] as HTMLElement).style.opacity = i < visibleCount ? '1' : '0';
        }
     }
     
     if (text2Ref.current) {
        const spans = text2Ref.current.children;
        const total = spans.length;
        const visibleCount = Math.floor(progress2 * total);
        for (let i = 0; i < total; i++) {
           (spans[i] as HTMLElement).style.opacity = i < visibleCount ? '1' : '0';
        }
     }
  });

  return (
    <div ref={containerRef} className="absolute w-full flex flex-col items-center justify-center text-center px-4 md:px-8" style={{ top: '80vh', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <p ref={text1Ref} className="max-w-3xl text-xl md:text-[32px] font-medium italic font-serif text-[#333333] mb-4 md:mb-8 leading-relaxed">
        {chars1.map((c: string, i: number) => <span key={i} className="transition-opacity duration-75" style={{ opacity: 0 }}>{c}</span>)}
      </p>
      <p ref={text2Ref} className="max-w-2xl text-sm md:text-lg text-[#555555] leading-relaxed">
        {chars2.map((c: string, i: number) => <span key={i} className="transition-opacity duration-75" style={{ opacity: 0 }}>{c}</span>)}
      </p>
    </div>
  );
}

// --- Toàn bộ nội dung 3D được điều khiển bởi Scroll ---
function SceneContents({ setModalOpen, setActiveProject, modalOpen, activeProject, projects = [], settings }: any) {
  const scroll = useScroll();
  const plasterTexture = usePlasterTexture();
  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, 0));

  useEffect(() => {
    const handleScrollHome = () => {
      scroll.el.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleScrollAbout = () => {
      scroll.el.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' });
    };
    const handleScrollProjects = () => {
      scroll.el.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
    };
    
    window.addEventListener('scroll-to-home', handleScrollHome);
    window.addEventListener('scroll-to-about', handleScrollAbout);
    window.addEventListener('scroll-to-projects', handleScrollProjects);
    
    return () => {
      window.removeEventListener('scroll-to-home', handleScrollHome);
      window.removeEventListener('scroll-to-about', handleScrollAbout);
      window.removeEventListener('scroll-to-projects', handleScrollProjects);
    };
  }, [scroll]);

  useFrame((state) => {
    const s = scroll.offset; // 0 to 1

    // 1. Chuyển động Camera (Cinematic Camera)
    const zoomT = THREE.MathUtils.smoothstep(s, 0.25, 0.45); // Camera hạ xuống rất sớm
    const panT = THREE.MathUtils.smoothstep(s, 0.45, 1.0);  // Trượt ngang kéo dài

    // 2. Parallax góc nhìn lắc nhẹ theo chuột
    const parallaxX = state.pointer.x * 1.2;
    const parallaxY = state.pointer.y * 1.2;

    const camY = THREE.MathUtils.lerp(1.5, -2.5, zoomT) + parallaxY;
    const camZ = THREE.MathUtils.lerp(18, 9, zoomT);
    const camX = THREE.MathUtils.lerp(0, 20, panT) + parallaxX; // Trượt camera qua 20 units

    const lookY = THREE.MathUtils.lerp(1.5, -2.5, zoomT);
    const lookX = THREE.MathUtils.lerp(0, 20, panT);

    if (modalOpen) {
       const targetX = activeProject * 4;
       // Zoom lại gần mô hình đang chọn, chếch sang trái một chút để chừa chỗ cho bảng thông tin bên phải
       const camTargetPos = new THREE.Vector3(targetX - 2.0, -3.2, 4.5); 
       const lookTarget = new THREE.Vector3(targetX, -3.8, 0);

       state.camera.position.lerp(camTargetPos, 0.08);
       currentLookAt.current.lerp(lookTarget, 0.08);
    } else {
       const camTargetPos = new THREE.Vector3(camX, camY, camZ);
       const lookTarget = new THREE.Vector3(lookX, lookY, 0);

       state.camera.position.lerp(camTargetPos, 0.08);
       currentLookAt.current.lerp(lookTarget, 0.08);
    }
    
    state.camera.lookAt(currentLookAt.current);

    // --- Animate Main Logo ---
    const logo = document.getElementById('main-logo');
    if (logo) {
      const isMobile = state.size.width < 768;
      const t = Math.min(s / 0.15, 1); 
      const easeT = t * (2 - t); // easeOut quadratic
      
      const startTop = state.size.height * (isMobile ? 0.35 : 0.4);
      const startLeft = state.size.width * (isMobile ? 0.5 : 0.25);
      const endTop = isMobile ? 40 : 60; // Approximate final top-left y center
      const endLeft = isMobile ? state.size.width / 2 : 140; // Approximate final x center (center on mobile)
      
      const currentTop = THREE.MathUtils.lerp(startTop, endTop, easeT);
      const currentLeft = THREE.MathUtils.lerp(startLeft, endLeft, easeT);
      const scale = THREE.MathUtils.lerp(1, isMobile ? 0.3 : 0.15, easeT); // scale down
      
      logo.style.top = `${currentTop}px`;
      logo.style.left = `${currentLeft}px`;
      logo.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    // --- Fade out Hero Description ---
    const heroDesc = document.getElementById('hero-desc');
    if (heroDesc) {
      const t = Math.min(s / 0.1, 1);
      heroDesc.style.opacity = `${1 - t}`;
    }
  });

  return (
    <>
      {/* Môi trường HDRI: Tạo ánh sáng studio và phản xạ thực tế (rất mượt) */}
      <Suspense fallback={null}>
         <Environment preset="city" environmentIntensity={0.8} />
      </Suspense>

      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Ánh sáng mặt trời chiếu vát tạo khối */}
      <directionalLight 
         position={[25, 15, 15]} 
         intensity={1.5} 
         castShadow 
         shadow-mapSize={[1024, 1024]} 
         shadow-camera-left={-25}
         shadow-camera-right={25}
         shadow-camera-top={25}
         shadow-camera-bottom={-25}
         color="#fffcf2"
         shadow-bias={-0.0001}
      />

      {/* Hiệu ứng Contact Shadows: Bóng đổ chân thật sát mặt kệ (AO) - frames={1} để tối ưu hiệu năng */}
      <ContactShadows position={[0, -3.89, -1]} opacity={0.65} scale={50} blur={2.5} far={4} resolution={512} color="#332211" frames={1} />

      {/* --- CẤU TRÚC KỆ SÁCH & BỨC TƯỜNG --- */}
      <group position={[10, 0, -2]}>
      {/* Bức tường trắng có texture thạch cao - Dời ra xa để tăng hiệu ứng Parallax và chống lẹm */}
         <mesh position={[0, 0, -3]} receiveShadow>
            <planeGeometry args={[100, 50]} />
            <meshStandardMaterial 
              color="#fcfbfa" 
              roughness={0.9} 
              bumpMap={plasterTexture} 
              bumpScale={0.03} 
            />
         </mesh>

         {/* Đợt kệ duy nhất (Projects - Mô hình) */}
         <mesh position={[0, -4, 0]} receiveShadow castShadow>
            <boxGeometry args={[44, 0.2, 2.5]} />
            <meshStandardMaterial color="#bda994" roughness={0.7} />
         </mesh>
      </group>

      {/* --- NỘI DUNG VĂN BẢN VẼ TRÊN TƯỜNG (Z = -2.5 để không bị lẹm vào tường Z=-2.6) --- */}

      {/* Màn 1: Hero (HTML Overlay theo mẫu) */}
      <Scroll html style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
        <div className="w-full h-full relative" style={{ pointerEvents: 'none' }}>
          {/* Chữ HIÊN studio đã được chuyển sang Overlay.tsx để cố định và hiệu ứng trượt */}
          
          {/* Đoạn miêu tả bên phải */}
          <div id="hero-desc" className="absolute w-[85%] md:w-auto" style={{ top: '65%', right: '7.5%', transform: 'translateY(-50%)', maxWidth: '450px' }}>
            <p className="text-sm md:text-base text-[#333] font-serif italic leading-relaxed md:text-right text-center md:text-left" style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
              {settings?.heroDescription || "Hiên archi là một xưởng thiết kế kiến trúc nhỏ. Chúng tôi làm việc với con người và khí hậu bản địa để tạo nên những không gian sống mộc mạc, bình yên"}
            </p>
          </div>

          {/* Màn 2: About (HTML với hiệu ứng gõ phím) */}
          <AboutSection settings={settings} />
        </div>
      </Scroll>

      {/* --- CÁC MÔ HÌNH DỰ ÁN (PROJECTS) --- */}
      {/* Đặt trên đợt kệ (Y = -3.8). Khoảng cách giữa mỗi dự án là 4 units */}
      <group position={[0, -3.8, -1]}>
         
         {/* Phụ kiện trang trí bên trái màn hình */}
         <DecorativeBooks position={[-5, 0, 0]} />
         
         {projects && projects.length > 0 ? (
           projects.map((project: any, index: number) => (
             <InteractiveProject key={project._id || index} index={index} setActiveProject={setActiveProject} setModalOpen={setModalOpen} position={[index * 4, 0, 0]} title={project.name}>
                <Suspense fallback={<LoadingSpinner />}>
                  {project.modelFileUrl ? (
                    <SplineModel url={project.modelFileUrl} scale={0.8} position={[0, 0.2, 0]} rotation={[0, 0, 0]} />
                  ) : (
                    <FallbackPhotoFrame image={project.image} index={index} />
                  )}
                </Suspense>
             </InteractiveProject>
           ))
         ) : (
           <InteractiveProject index={0} setActiveProject={setActiveProject} setModalOpen={setModalOpen} position={[0, 0, 0]} title="Đang tải dữ liệu...">
               <Suspense fallback={<LoadingSpinner />}>
                  <FallbackPhotoFrame image={null} index={0} />
               </Suspense>
           </InteractiveProject>
         )}

      </group>
    </>
  );
}

export function Scene({ setModalOpen, setActiveProject, modalOpen, activeProject, projects, settings }: any) {
   useEffect(() => {
     return () => { document.body.style.cursor = 'auto'; };
   }, []);
 
   return (
     <ScrollControls pages={3} damping={0.2}>
        <SceneContents setModalOpen={setModalOpen} setActiveProject={setActiveProject} modalOpen={modalOpen} activeProject={activeProject} projects={projects} settings={settings} />
     </ScrollControls>
   );
}
