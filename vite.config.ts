import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        globIgnores: [
          '**/textures/**',
          '**/Models/**',
          '**/LampModel/**',
          '**/assets/DesktopCanvas-*.js',
          '**/assets/TextLayer-*',
          '**/assets/MagazineViewer-*.js',
        ],
        runtimeCaching: [
          {
            urlPattern: /\/(?:assets\/(?:DesktopCanvas|TextLayer|MagazineViewer)-[^/]+\.(?:js|css)|magazine\.glb|pdf\.worker\.min\.mjs)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'optional-assets-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
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
    chunkSizeWarningLimit: 1000
  }
})
