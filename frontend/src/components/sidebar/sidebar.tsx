"use client"
import { Link, useLocation } from "react-router-dom"
import { Bell, LogOut, Settings, CheckCircle, ChevronDown, Users, Database } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  onLogout: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation()
  const currentPath = location.pathname
  const [notificationOpen, setNotificationOpen] = useState(
    ["/dashboard", "/manage", "/userlogs"].some((path) => location.pathname.startsWith(path)),
  )

  const [adminOpen, setAdminOpen] = useState(["/addemployee"].some((path) => location.pathname.startsWith(path)))

  const [teamOpen, setTeamOpen] = useState(
    ["/audit-logs", "/teammember"].some((path) => location.pathname.startsWith(path)),
  )

  const [superAdminOpen, setSuperAdminOpen] = useState(
    ["/superadmin"].some((path) => location.pathname.startsWith(path)),
  )

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return currentPath === path
  }

  // Helper function to check if a path is part of a group
  const isGroupActive = (paths: string[]) => {
    return paths.some((path) => currentPath.startsWith(path))
  }

  // ตรวจสอบว่าเป็นซุปเปอร์แอดมินหรือไม่ (ในตัวอย่างนี้กำหนดให้เป็น true เพื่อแสดงเมนู)
  const isSuperAdmin = true

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50 shadow-lg bg-gradient-to-b from-red-800 to-red-900">
      {/* Header with logo */}
      <div className="p-4 border-b border-red-700/50">
        <div className="flex items-center">
          <img
            src="https://storage.googleapis.com/be8website.appspot.com/logo-scg-white.png"
            alt="SCG Logo"
            className="h-10"
          />
          <div className="border-l border-white/30 pl-3 ml-3">
            <h1 className="text-xl font-bold text-white">SelfSync</h1>
          </div>
        </div>
        <p className="text-white/90 font-medium text-xs tracking-wider uppercase mt-2">REMINDER DASHBOARD</p>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-red-700/50">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white font-medium text-xl border border-white/20">
            ปฉ
          </div>
          <div className="ml-3">
            <p className="text-white font-medium">ปัณณธร ฉิมเรือง</p>
            <p className="text-white/60 text-xs">ผู้ดูแลระบบ</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
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
                isGroupActive(["/addemployee"]) ? "bg-white/10 font-medium" : "hover:bg-white/5"
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
                  to="/addemployee"
                  className={`block rounded-md px-4 py-2 text-white transition-colors ${
                    isActive("/addemployee") ? "bg-white/15 font-medium" : "hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 mr-2.5"></div>
                    เพิ่มพนักงานใหม่
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
      <div className="p-4 border-t border-red-700/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-red-800 font-bold py-2.5 px-4 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
