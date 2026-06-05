import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

/**
 * AboutSection — Hiệu ứng "gõ phím" (typewriter) tối ưu.
 * 
 * Trước đây: Tạo 1 <span> cho mỗi ký tự (~300+ DOM nodes), loop qua tất cả mỗi frame.
 * Bây giờ: Dùng 1 <span> duy nhất + CSS `clip-path: inset()` để lộ dần text.
 * → Giảm từ 300+ DOM operations/frame xuống còn 2.
 */
export function AboutSection() {
  const { settings } = useStore();
  const scroll = useScroll();
  const text1Ref = useRef<HTMLParagraphElement>(null);
  const text2Ref = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const text1 = settings?.aboutTitle || "Tôi là Trần Thái Bảo, một kiến trúc sư yêu bản sắc địa phương. Tôi chọn thiết kế những ngôi nhà dung dị, thích ứng với tự nhiên và tình yêu cuộc sống của gia chủ.";
  const text2 = settings?.aboutText || "Trong quá trình làm nghề, tôi đi tìm vẻ đẹp trong sự mộc mạc của gỗ, của bê tông, đá cuội và những hang hiên đón nắng che mưa. Hợp tác cùng những người thợ lành nghề tại địa phương, chúng tôi dựng nên những nếp nhà yên lành, nơi con người tìm đến sự kết nối với tự nhiên, với bản thân và gia đình";

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

     // Dùng clip-path: inset(0 X% 0 0) để lộ text từ trái sang phải
     // Khi progress = 0 → inset(0 100% 0 0) = ẩn hoàn toàn
     // Khi progress = 1 → inset(0 0% 0 0)   = hiện hoàn toàn
     const progress1 = THREE.MathUtils.clamp((s - 0.05) / 0.1, 0, 1);
     const progress2 = THREE.MathUtils.clamp((s - 0.1) / 0.1, 0, 1); 
     
     if (text1Ref.current) {
        const clipRight = (1 - progress1) * 100;
        text1Ref.current.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
     }
     
     if (text2Ref.current) {
        const clipRight = (1 - progress2) * 100;
        text2Ref.current.style.clipPath = `inset(0 ${clipRight}% 0 0)`;
     }
  });

  return (
    <div id="about-section" ref={containerRef} className="absolute w-full flex flex-col items-center justify-center text-center px-4 md:px-8" style={{ top: '80vh', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <div className="max-w-4xl bg-[#fdfbf7]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-2xl shadow-[0_0_40px_rgba(253,251,247,0.8)] md:shadow-none border border-white/50 md:border-transparent">
        <p ref={text1Ref} className="text-xl md:text-[32px] font-medium italic font-serif text-[#333333] mb-4 md:mb-8 leading-relaxed drop-shadow-sm md:drop-shadow-none" style={{ clipPath: 'inset(0 100% 0 0)' }}>
          {text1}
        </p>
        <p ref={text2Ref} className="text-base md:text-xl font-handwriting-guides text-[#555555] leading-loose drop-shadow-sm md:drop-shadow-none" style={{ clipPath: 'inset(0 100% 0 0)' }}>
          {text2}
        </p>
      </div>
    </div>
  );
}
