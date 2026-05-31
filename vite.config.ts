import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three';
            if (id.includes('@react-three')) return 'vendor-r3f';
            if (id.includes('postprocessing')) return 'vendor-postprocessing';
            if (id.includes('framer-motion')) return 'vendor-framer-motion';
            if (id.includes('sanity') || id.includes('@sanity')) return 'vendor-sanity';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor'; // all other node_modules
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Tăng giới hạn cảnh báo lên 1MB để bớt cảnh báo không cần thiết
  }
})
