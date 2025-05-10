import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // รีไรท์ Domain ของ Set-Cookie header
        // ให้กลายเป็นโฮสต์เดียวกับ frontend (ไม่กำหนด domain)
        cookieDomainRewrite: {
          '*': ''
        },
        // (ถ้าต้องการ) รีไรท์ path ในคุกกี้ให้ครอบคลุมทุก path
        cookiePathRewrite: {
          '^/api': ''
        },
      },
    },
  },
})
