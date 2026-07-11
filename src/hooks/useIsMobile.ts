import { useState, useEffect } from 'react';

/**
 * Hook responsive để kiểm tra kích thước màn hình.
 * Dùng matchMedia thay vì resize event — chỉ fire khi vượt qua breakpoint,
 * tránh re-render liên tục khi kéo cửa sổ.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    // Sync initial state safely without cascading render warnings
    queueMicrotask(() => setIsMobile(mql.matches));
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
