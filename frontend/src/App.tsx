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
import Manage from "./pages/manage_reminder/page";
import UserLogs from "./pages/user-logs/page";
import AddTeam from "./pages/add-team/page";
import ImportEmployees from "./pages/add-team/import-excel";
import TeamMember from "./pages/team-member/page";
import SuperAdmin from "./pages/super-admin-logs/page";
import TeamOverview from "./pages/team-overview/page";
import TeamNoti from "./pages/team-notification/page";
import AddAdmin from "./pages/add-admin-dialog/page";

// HOC ตรวจสอบสิทธิ์
import { RequireAuth } from "./components/RequireAuth";

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
          path="/add-team"
          element={
            <RequireAuth>
              <AddTeam />
            </RequireAuth>
          }
        />
        <Route
          path="/import-employees"
          element={
            <RequireAuth>
              <ImportEmployees />
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
        <Route
          path="/team-overview"
          element={
            <RequireAuth>
              <TeamOverview />
            </RequireAuth>
          }
        />
        <Route
          path="/team-notification"
          element={
            <RequireAuth>
              <TeamNoti />
            </RequireAuth>
          }
        />
        <Route
          path="/addadmin"
          element={
            <RequireAuth>
              <AddAdmin />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
