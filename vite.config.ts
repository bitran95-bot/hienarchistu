import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'magazine.glb'],
      manifest: {
        name: 'Hiên Archi Studio',
        short_name: 'Hiên Archi',
        description: 'Studio thiết kế kiến trúc và nội thất',
        theme_color: '#fdfbf7',
        background_color: '#fdfbf7',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
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
