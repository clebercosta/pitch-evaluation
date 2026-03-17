import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@upstash/redis']
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})