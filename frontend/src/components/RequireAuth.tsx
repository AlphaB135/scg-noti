// 📁 frontend/src/components/RequireAuth.tsx

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

interface RequireAuthProps {
  children: React.ReactElement
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get('/api/auth/me', { withCredentials: true })
      .then(() => setChecking(false))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  if (checking) {
    return <div>กำลังตรวจสอบสิทธิ์...</div>
  }
  return children
}
