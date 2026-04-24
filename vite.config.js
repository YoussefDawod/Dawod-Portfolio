import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor-Code separieren
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    // Chunk-Size-Warnung auf 1000 KiB erhöhen (anstatt 500 KiB)
    chunkSizeWarningLimit: 1000
  }
})
