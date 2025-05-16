// 📁 frontend/src/main.tsx
import './index.css'
import './axiosConfig'          // ← เพิ่มบรรทัดนี้ เพื่อให้ interceptor โหลดก่อนใคร
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setupAuthInterceptor } from './lib/authInterceptor'

// ตั้งค่า interceptor สำหรับแนบ token กับ requests
setupAuthInterceptor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
