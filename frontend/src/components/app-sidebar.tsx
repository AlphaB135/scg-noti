"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CheckSquare, LayoutDashboard, Play, Settings, LogOut, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Approvals",
    href: "/approvals",
    icon: CheckSquare,
  },
  {
    name: "RPA Trigger",
    href: "/rpa",
    icon: Play,
  },
  {
    name: "Audit Logs",
    href: "/audit-logs",
    icon: ClipboardList,
    adminOnly: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  // In a real app, you would check if the user is an admin
  const isAdmin = true

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-[#E2001A] flex items-center justify-center text-white font-bold">SCG</div>
          <span className="ml-2 text-lg font-semibold">Notification System</span>
        </div>
      </div>
      <div className="flex-1 py-6 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          // Skip admin-only links if user is not admin
          if (link.adminOnly && !isAdmin) return null

          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-[#E2001A]/10 text-[#E2001A]" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <link.icon className={cn("mr-2 h-5 w-5", isActive ? "text-[#E2001A]" : "text-gray-500")} />
              {link.name}
            </Link>
          )
        })}
      </div>
      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" className="w-full justify-start text-gray-700">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
