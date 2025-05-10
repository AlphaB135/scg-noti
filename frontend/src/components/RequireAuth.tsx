// 📁 frontend/src/components/RequireAuth.tsx

import React, { ReactElement, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '@/axiosConfig'  // Axios instance ที่มี interceptor ติดตั้งแล้ว

interface RequireAuthProps {
  children: ReactElement
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        // เรียกตรวจสอบสิทธิ์ — ถ้า 401 จะข้าม interceptor ของ /me และถูกโยนขึ้นมา catch
        await axios.get('/api/auth/me')
        setChecking(false)
      } catch {
        // ถ้ายัง 401 จริง ๆ ให้ดีดกลับไปหน้า login
        navigate('/login', { replace: true })
      }
    })()
  }, [navigate])

  if (checking) {
    return <div>กำลังตรวจสอบสิทธิ์...</div>
  }

  return children
}
