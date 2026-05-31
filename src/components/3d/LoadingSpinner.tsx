import { Html, useProgress } from '@react-three/drei';

export function LoadingSpinner() {
  const { progress } = useProgress();
  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center justify-center gap-2">
         <div className="w-8 h-8 border-4 border-[#bda994]/30 border-t-[#bda994] rounded-full animate-spin"></div>
         <span className="text-xs font-medium text-[#bda994]">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}
