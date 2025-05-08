// src/App.tsx
import { useState } from 'react'
 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
 import LoginPage from './pages/LoginPage'
 import DashboardPage from './pages/dashboard/page'
 import NotificationPage from './pages/notifications/page'
 import Rpa from './pages/rpa/page'
 import Approvals from './pages/approvals/page'
 import Audit from './pages/audit-logs/page'
 import Settings from './pages/settings/page'

 function App() {
  // ไม่สนใจค่าปัจจุบัน แค่ต้องการ setter อย่างเดียว
  const [, setRole] = useState('')

   return (
     <Router>
       <Routes>
         <Route path="/" element={<Navigate to="/login" replace />} />
         <Route path="/login" element={<LoginPage setRole={setRole} />} />
         <Route path="/dashboard" element={<DashboardPage  />} />
         <Route path="/notifications" element={<NotificationPage/>} />
         <Route path="/approvals" element={<Approvals/>} />
         <Route path="/rpa" element={<Rpa/>} />
         <Route path="/audit-logs" element={<Audit/>} />
        <Route path="/settings" element={<Settings/>} />
       </Routes>
     </Router>
   )
 }

 export default App
