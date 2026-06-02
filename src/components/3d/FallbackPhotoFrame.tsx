import { useTexture } from '@react-three/drei';
import { urlFor } from '../../sanityClient';

export function FallbackPhotoFrame({ image, index = 0 }: { image: any; index?: number }) {
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

  // Đa dạng màu sắc gáy sách dựa trên index của dự án
  const spineColors = ['#1a1a1a', '#e5d3b3', '#6b4423', '#2a3b45', '#4a4036', '#8c7d70'];
  const spineColor = spineColors[index % spineColors.length];

  // Chiều dày của tạp chí
  const thickness = 0.15;
  // Độ nghiêng ngẫu nhiên nhẹ cho tự nhiên
  const tiltZ = -0.15; // Ngả ra sau
  const tiltY = (index % 3 === 0) ? -0.05 : ((index % 2 === 0) ? 0.05 : 0);

  return (
    <group position={[0, baseHeight / 2, 0.4]} rotation={[tiltZ, tiltY, 0]}>
       {/* Tạp chí (Magazine Block) */}
       <mesh castShadow receiveShadow>
          <boxGeometry args={[imgW, imgH, thickness]} />
          {/* Thứ tự materials: Right, Left(Spine), Top, Bottom, Front(Cover), Back */}
          <meshStandardMaterial attach="material-0" color="#e8decd" roughness={1} /> {/* Pages right */}
          <meshStandardMaterial attach="material-1" color={spineColor} roughness={0.8} /> {/* Spine */}
          <meshStandardMaterial attach="material-2" color="#e8decd" roughness={1} /> {/* Pages top */}
          <meshStandardMaterial attach="material-3" color="#e8decd" roughness={1} /> {/* Pages bottom */}
          <meshStandardMaterial attach="material-4" map={texture} roughness={0.3} metalness={0.1} /> {/* Cover */}
          <meshStandardMaterial attach="material-5" color={spineColor} roughness={0.8} /> {/* Back */}
       </mesh>
    </group>
  );
}
