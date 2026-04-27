import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
