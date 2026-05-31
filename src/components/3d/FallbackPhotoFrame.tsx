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
