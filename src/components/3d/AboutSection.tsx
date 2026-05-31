import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export function AboutSection() {
  const { settings } = useStore();
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
    <div id="about-section" ref={containerRef} className="absolute w-full flex flex-col items-center justify-center text-center px-4 md:px-8" style={{ top: '80vh', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <div className="max-w-4xl bg-[#fdfbf7]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-2xl shadow-[0_0_40px_rgba(253,251,247,0.8)] md:shadow-none border border-white/50 md:border-transparent">
        <p ref={text1Ref} className="text-xl md:text-[32px] font-medium italic font-serif text-[#333333] mb-4 md:mb-8 leading-relaxed drop-shadow-sm md:drop-shadow-none">
          {chars1.map((c: string, i: number) => <span key={i} className="transition-opacity duration-75" style={{ opacity: 0 }}>{c}</span>)}
        </p>
        <p ref={text2Ref} className="text-sm md:text-lg text-[#555555] leading-relaxed drop-shadow-sm md:drop-shadow-none">
          {chars2.map((c: string, i: number) => <span key={i} className="transition-opacity duration-75" style={{ opacity: 0 }}>{c}</span>)}
        </p>
      </div>
    </div>
  );
}
