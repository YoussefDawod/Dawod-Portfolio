import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true, // Dies erzwingt die Freigabe im Netzwerk
    https: true
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
