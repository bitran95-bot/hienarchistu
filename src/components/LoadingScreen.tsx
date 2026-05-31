import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export function LoadingScreen({ started }: { started: boolean }) {
  const { progress, active } = useProgress();
  const [show, setShow] = useState(true);
  
  // Đợi cho đến khi load xong (progress = 100 và active = false) và data đã load xong (started = true)
  const isLoaded = progress === 100 && !active && started;

  useEffect(() => {
    if (isLoaded) {
      // Đợi thêm một chút để hiệu ứng fade-out trông mượt mà hơn
      const timeout = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfbf7] transition-opacity duration-1000 ease-in-out pointer-events-none`}
      style={{ opacity: isLoaded ? 0 : 1 }}
    >
      {/* Khung viền mỏng manh mộc mạc */}
      <div className="flex flex-col items-center max-w-sm w-full px-8">
        <h1 className="text-3xl md:text-5xl font-serif text-[#333] mb-8 tracking-widest uppercase">
          Hiên <span className="text-[#8b7355] lowercase italic">archi</span>
        </h1>
        
        {/* Thanh progress bar mộc mạc */}
        <div className="w-full h-[2px] bg-[#e5d3b3] relative overflow-hidden rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-[#8b7355] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Text % */}
        <div className="mt-4 flex justify-between w-full text-xs text-[#666] font-sans tracking-widest uppercase">
          <span>Đang tải không gian...</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
