import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';

interface FullscreenImageOverlayProps {
  selectedImage: string | null;
  onClose: () => void;
}

export function FullscreenImageOverlay({ selectedImage, onClose }: FullscreenImageOverlayProps) {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      previousFocus?.focus();
    };
  }, [selectedImage]);

  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onKeyDown={(event) => {
            if (event.key === 'Tab') {
              event.preventDefault();
              closeRef.current?.focus();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={t.projectDetail.gallery}
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            ref={closeRef}
            type="button"
            aria-label={t.contact.close}
            onClick={(event) => { event.stopPropagation(); onClose(); }}
            className="absolute right-6 top-6 z-10 rounded-full bg-white/90 px-4 py-2 text-xl text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >×</button>
          <motion.img 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            src={selectedImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
