import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'magazine.glb', 'pdf.worker.min.mjs'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,mjs}'],
        globIgnores: ['**/textures/**', '**/Models/**', '**/LampModel/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sanity-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/[a-zA-Z0-9.-]+\.sanity\.io\/v\d+\/data\/query\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sanity-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 Day
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Hiên Archi Studio',
        short_name: 'Hiên Archi',
        description: 'Studio thiết kế kiến trúc và nội thất',
        theme_color: '#fdfbf7',
        background_color: '#fdfbf7',
        display: 'standalone',
        orientation: 'portrait-primary',
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
