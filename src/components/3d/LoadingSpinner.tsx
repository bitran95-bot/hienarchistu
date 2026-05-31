import { Html } from '@react-three/drei';

export function LoadingSpinner() {
  return (
    <Html center zIndexRange={[100, 0]}>
      <div className="w-8 h-8 border-4 border-[#bda994]/30 border-t-[#bda994] rounded-full animate-spin"></div>
    </Html>
  );
}
