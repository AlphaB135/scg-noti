"use client"
import { Link, useLocation } from "react-router-dom"
import { Bell, LogOut, Settings, CheckCircle, ChevronDown, Users, Database } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface MobileSidebarProps {
  isOpen: boolean
  onLogout: () => void
}

export default function MobileSidebar({ isOpen, onLogout }: MobileSidebarProps) {
  const location = useLocation()
  const currentPath = location.pathname
  const [notificationOpen, setNotificationOpen] = useState(
    ["/dashboard", "/manage", "/userlogs"].some((path) => location.pathname.startsWith(path)),
  )

  const [adminOpen, setAdminOpen] = useState(
    ["/addemployee", "/add-team", "/import-employees"].some((path) => location.pathname.startsWith(path)),
  )

  const [teamOpen, setTeamOpen] = useState(
    ["/audit-logs", "/teammember"].some((path) => location.pathname.startsWith(path)),
  )

  const [superAdminOpen, setSuperAdminOpen] = useState(
    ["/superadmin"].some((path) => location.pathname.startsWith(path)),
  )

  // Get user data from useAuth hook
  const { user } = useAuth()

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return currentPath === path
  }

  // Helper function to check if a path is part of a group
  const isGroupActive = (paths: string[]) => {
    return paths.some((path) => currentPath.startsWith(path))
  }

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Check if user is superadmin
  const isSuperAdmin = user?.role === "SUPERADMIN"

  // Format role for display
  const getDisplayRole = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "ซุปเปอร์แอดมิน"
      case "ADMIN":
        return "ผู้ดูแลระบบ"
      case "USER":
        return "ผู้ใช้งาน"
      case "TEAM_LEAD":
        return "หัวหน้าทีม"
      default:
        return role
    }
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isOpen) return

    // Reset scroll position when opening
    const sidebarElement = document.getElementById("mobile-sidebar")
    if (sidebarElement) {
      sidebarElement.scrollTop = 0
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={onLogout}></div>

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className="md:hidden fixed top-14 left-0 w-64 h-[calc(100vh-3.5rem)] bg-gradient-to-b from-red-800 to-red-900 text-white z-50 shadow-xl overflow-y-auto"
      >
        {/* User info */}
        <div className="p-4 border-b border-red-700/50">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white font-medium text-xl border border-white/20">
              {user?.employeeProfile
                ? getInitials(`${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`)
                : getInitials(user?.name || "")}
            </div>
            <div className="ml-3">
              <p className="text-white font-medium">
                {user?.employeeProfile
                  ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`
                  : user?.name || ""}
              </p>
              <p className="text-white/60 text-xs">
                {user?.role ? getDisplayRole(user.role) : ""}
                {user?.employeeProfile?.position && ` • ${user.employeeProfile.position}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-3">
          <nav className="space-y-1">
            {/* Notification System */}
            <div className="rounded-md overflow-hidden">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-white ${
                  isGroupActive(["/dashboard", "/manage", "/userlogs"]) ? "bg-white/10 font-medium" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-3" />
                  <span>ระบบการแจ้งเตือน</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    notificationOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {notificationOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/dashboard"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/dashboard") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      เตือนความจำ
                    </div>
                  </Link>
                  <Link
                    to="/manage"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/manage") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      ตั้งค่าการแจ้งเตือน
                    </div>
                  </Link>
                  <Link
                    to="/userlogs"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/userlogs") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      ประวัติการดำเนินการ
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Team Management */}
            <div className="rounded-md overflow-hidden">
              <button
                onClick={() => setTeamOpen(!teamOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-white ${
                  isGroupActive(["/audit-logs", "/teammember"]) ? "bg-white/10 font-medium" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  <span>จัดการทีม</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${teamOpen ? "transform rotate-180" : ""}`}
                />
              </button>

              {teamOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/audit-logs"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/audit-logs") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      ประวัติการดำเนินการพนักงาน
                    </div>
                  </Link>
                  <Link
                    to="/teammember"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/teammember") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      สมาชิกในทีม
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Admin */}
            <div className="rounded-md overflow-hidden">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-white ${
                  isGroupActive(["/addemployee", "/add-team", "/import-employees"])
                    ? "bg-white/10 font-medium"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>แอดมิน</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${adminOpen ? "transform rotate-180" : ""}`}
                />
              </button>

              {adminOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/add-team"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/add-team") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      สร้างทีม
                    </div>
                  </Link>
                  <Link
                    to="/import-employees"
                    className={`block rounded-md px-4 py-2 text-white transition-colors ${
                      isActive("/import-employees") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                      นำเข้ารายชื่อพนักงาน
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Super Admin (Hidden Menu) */}
            {isSuperAdmin && (
              <div className="rounded-md overflow-hidden mt-4 border-t border-red-700/30 pt-4">
                <button
                  onClick={() => setSuperAdminOpen(!superAdminOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-white ${
                    isGroupActive(["/superadmin"]) ? "bg-white/10 font-medium" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-3" />
                    <span className="flex items-center">
                      ซุปเปอร์แอดมิน
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-500 text-black rounded-full">พิเศษ</span>
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${superAdminOpen ? "transform rotate-180" : ""}`}
                  />
                </button>

                {superAdminOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      to="/superadmin"
                      className={`block rounded-md px-4 py-2 text-white transition-colors ${
                        isActive("/superadmin") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2.5"></div>
                        ประวัติการดำเนินการทั้งหมด
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            <Link
              to="/settings"
              className={`flex items-center px-3 py-2.5 rounded-md text-white transition-colors ${
                isActive("/settings") ? "bg-white/15 font-medium" : "hover:bg-white/10"
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              การตั้งค่า
            </Link>
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-red-700/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-red-800 font-bold py-2.5 px-4 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </>
  )
}
