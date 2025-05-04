// src/App.tsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/dashboard'  // ← import หน้า Dashboard
// ถ้ามี Layout แยก ก็ import มาได้ เช่น DashboardLayout

function App() {
  const [role, setRole] = useState('')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage setRole={setRole} />} />

        {/* เพิ่ม route สำหรับ /dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* ถ้าอยากให้เข้า /dashboard/overview ก็เพิ่มได้เช่นกัน */}
        <Route
          path="/dashboard/overview"
          element={<DashboardPage />}
        />

        {/* Optional: ถ้าเข้าหน้าอื่นโดยยังไม่ login ให้กลับไป login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
