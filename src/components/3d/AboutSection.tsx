
import { useStore } from '../../store/useStore';

/** The two CMS paragraphs remain intact while the scene reveals them in order. */
export function AboutSection() {
  const { settings } = useStore();

  const text1 = settings?.aboutTitle || "Tôi là Trần Thái Bảo, một kiến trúc sư yêu bản sắc địa phương. Tôi chọn thiết kế những ngôi nhà dung dị, thích ứng với tự nhiên và tình yêu cuộc sống của gia chủ.";
  const text2 = settings?.aboutText || "Trong quá trình làm nghề, tôi đi tìm vẻ đẹp trong sự mộc mạc của gỗ, của bê tông, đá cuội và những hang hiên đón nắng che mưa. Hợp tác cùng những người thợ lành nghề tại địa phương, chúng tôi dựng nên những nếp nhà yên lành, nơi con người tìm đến sự kết nối với tự nhiên, với bản thân và gia đình";

  return (
    <div id="about-section" className="absolute w-full flex flex-col items-center justify-center text-center px-4 md:px-8" style={{ top: '72vh', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
      <div className="max-w-4xl bg-[#fdfbf7]/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-2xl shadow-[0_0_40px_rgba(253,251,247,0.8)] md:shadow-none border border-white/50 md:border-transparent">
        <p id="about-text-1" className="about-copy text-xl md:text-[32px] font-medium italic font-serif text-[#333333] mb-4 md:mb-6 leading-relaxed drop-shadow-sm md:drop-shadow-none" style={{ opacity: 0 }}>
          {text1}
        </p>
        <span id="about-divider" aria-hidden="true" className="mx-auto mb-4 md:mb-6 block h-px w-20 origin-center scale-x-0 bg-amber-800/70" />
        <p id="about-text-2" className="about-copy mx-auto max-w-3xl text-base md:text-lg font-body font-normal text-[#555555] leading-relaxed drop-shadow-sm md:drop-shadow-none" style={{ opacity: 0 }}>
          {text2}
        </p>
      </div>
    </div>
  );
}
