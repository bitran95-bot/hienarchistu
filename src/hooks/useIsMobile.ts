import { useState, useEffect } from 'react';

/**
 * Hook responsive để kiểm tra kích thước màn hình.
 * Tái sử dụng thay vì copy-paste logic `window.innerWidth < 768` khắp nơi.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
