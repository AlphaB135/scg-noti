// 📁 frontend/src/App.tsx
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/dashboard/page'
import NotificationPage from './pages/notifications/page'
import Rpa from './pages/rpa/page'
import Approvals from './pages/approvals/page'
import Audit from './pages/audit-logs/page'
import Settings from './pages/settings/page'
import Manage from './pages/manage_reminder/page'
import AuditPerson from './pages/audit-logs-person/page'

// ← เพิ่มบรรทัดนี้
import { RequireAuth } from './components/RequireAuth'

function App() {
  const [, setRole] = useState('')

  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage setRole={setRole} />} />

        {/* protected routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/approvals"
          element={
            <RequireAuth>
              <Approvals />
            </RequireAuth>
          }
        />
        <Route
          path="/rpa"
          element={
            <RequireAuth>
              <Rpa />
            </RequireAuth>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <RequireAuth>
              <Audit />
            </RequireAuth>
          }
        />
        <Route
          path="/manage"
          element={
            <RequireAuth>
              <Manage />
            </RequireAuth>
          }
        />
        <Route
          path="/auditperson"
          element={
            <RequireAuth>
              <AuditPerson />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
