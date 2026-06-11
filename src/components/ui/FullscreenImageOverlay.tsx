import { motion, AnimatePresence } from 'framer-motion';

interface FullscreenImageOverlayProps {
  selectedImage: string | null;
  onClose: () => void;
}

export function FullscreenImageOverlay({ selectedImage, onClose }: FullscreenImageOverlayProps) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
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
