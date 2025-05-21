"use client"

import { Bell, CheckCircle, ChevronDown, Database, Home, LogOut, Settings, Users } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const [notificationOpen, setNotificationOpen] = useState(
    ["/dashboard", "/manage", "/userlogs"].some((path) => pathname?.startsWith(path)),
  )
  const [teamOpen, setTeamOpen] = useState(
    ["/team-overview", "/teammember", "/team-notification"].some((path) => pathname?.startsWith(path)),
  )
  const [adminOpen, setAdminOpen] = useState(
    ["/add-team", "/import-employees"].some((path) => pathname?.startsWith(path)),
  )
  const [superAdminOpen, setSuperAdminOpen] = useState(
    ["/superadmin", "/add-admin"].some((path) => pathname?.startsWith(path)),
  )

  // Mock user data
  const user = {
    name: "สมชาย ใจดี",
    role: "SUPERADMIN",
    employeeProfile: {
      firstName: "สมชาย",
      lastName: "ใจดี",
      position: "ผู้จัดการ",
    },
  }

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return pathname === path
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4 border-b border-red-700/50">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-600 rounded-md flex items-center justify-center text-white font-bold">
              SS
            </div>
            <div className="border-l border-white/30 pl-3 ml-3">
              <h1 className="text-xl font-bold text-white">SelfSync</h1>
            </div>
          </div>
          <p className="text-white/90 font-medium text-xs tracking-wider uppercase mt-2">REMINDER DASHBOARD</p>
        </div>
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
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <Home className="h-5 w-5" />
                  <span>หน้าหลัก</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* ระบบการแจ้งเตือน */}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setNotificationOpen(!notificationOpen)} className="justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5" />
                  <span>ระบบการแจ้งเตือน</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    notificationOpen ? "transform rotate-180" : ""
                  }`}
                />
              </SidebarMenuButton>
              {notificationOpen && (
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/dashboard")}>
                      <Link href="/dashboard">เตือนความจำ</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/manage")}>
                      <Link href="/manage">ตั้งค่าการแจ้งเตือน</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/userlogs")}>
                      <Link href="/userlogs">ประวัติการดำเนินการ</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {/* จัดการทีม */}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setTeamOpen(!teamOpen)} className="justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5" />
                  <span>จัดการทีม</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${teamOpen ? "transform rotate-180" : ""}`}
                />
              </SidebarMenuButton>
              {teamOpen && (
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/team-overview")}>
                      <Link href="/team-overview">ภาพรวม</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/teammember")}>
                      <Link href="/teammember">สมาชิก</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/team-notification")}>
                      <Link href="/team-notification">เพิ่มการแจ้งเตือน</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {/* แอดมิน */}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setAdminOpen(!adminOpen)} className="justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5" />
                  <span>แอดมิน</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${adminOpen ? "transform rotate-180" : ""}`}
                />
              </SidebarMenuButton>
              {adminOpen && (
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/add-team")}>
                      <Link href="/add-team">สร้างทีม</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/import-employees")}>
                      <Link href="/import-employees">นำเข้ารายชื่อพนักงาน</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {/* ซุปเปอร์แอดมิน */}
            {isSuperAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setSuperAdminOpen(!superAdminOpen)} className="justify-between">
                  <div className="flex items-center">
                    <Database className="h-5 w-5" />
                    <span>ซุปเปอร์แอดมิน</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      superAdminOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>
                {superAdminOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/superadmin")}>
                        <Link href="/superadmin">ประวัติการดำเนินการทั้งหมด</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive("/add-admin")}>
                        <Link href="/add-admin">เพิ่มแอดมิน</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            )}

            {/* การตั้งค่า */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span>การตั้งค่า</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t border-red-700/50">
          <button
            onClick={() => console.log("Logout")}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-red-800 font-bold py-2.5 px-4 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
