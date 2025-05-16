// 📁 frontend/src/components/RequireAuth.tsx

import React, { ReactElement, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/real-api'  // ใช้ api instance ที่มีการกำหนดค่าไว้แล้ว

interface RequireAuthProps {
  children: ReactElement
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  
  useEffect(() => {
    ;(async () => {
      try {
        console.log('Verifying authentication...')
          // ตรวจสอบสิทธิ์โดยการเรียก API /auth/me
        // เนื่องจากเราใช้ cookie-based auth ไม่จำเป็นต้องเช็ค token ใน localStorage
        console.log('Checking authentication with endpoint /auth/me')
        const response = await api.get('/auth/me')
        console.log('Auth check response:', response.data)
        setChecking(false)
        
        console.log('Authentication successful')
      } catch (error) {
        console.error('Authentication failed:', error)
        // ดีดกลับไปหน้า login
        navigate('/login', { replace: true })
      }
    })()
  }, [navigate])

  if (checking) {
    return <div>กำลังตรวจสอบสิทธิ์...</div>
  }

  return children
}
