// 📁 frontend/src/App.tsx

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ––– Public pages
import LoginPage from "./pages/LoginPage";

// ––– Protected pages
import DashboardPage from "./pages/dashboard/page";
import Audit from "./pages/audit-logs/page";
import Settings from "./pages/settings/page";

// **ตรงนี้ต้อง import ให้ตรงกับไฟล์ของคุณ**
// สมมติโฟลเดอร์ชื่อ manage_reminder/page.tsx และ default export เป็น component ชื่อ Manage
import Manage from "./pages/manage_reminder/page";

import UserLogs from "./pages/user-logs/page";

// HOC ตรวจสอบสิทธิ์
import { RequireAuth } from "./components/RequireAuth";

import AddEmployee from "./pages/add-employee-page/page";

import TeamMember from "./pages/team-member/page";

import SuperAdmin from "./pages/super-admin-logs/page";

function App() {
  const [, setRole] = useState("");

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage setRole={setRole} />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
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
          path="/userlogs"
          element={
            <RequireAuth>
              <UserLogs />
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
        <Route
          path="/addemployee"
          element={
            <RequireAuth>
              <AddEmployee />
            </RequireAuth>
          }
        />
        <Route
          path="/teammember"
          element={
            <RequireAuth>
              <TeamMember />
            </RequireAuth>
          }
        />
        <Route
          path="/superadmin"
          element={
            <RequireAuth>
              <SuperAdmin />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
