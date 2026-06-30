import { useEffect } from 'react';

/**
 * Hook to handle Escape key press globally.
 * @param onEscape - Callback to run when Escape is pressed.
 * @param enabled  - Whether the listener is active (default: true).
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, enabled]);
}
