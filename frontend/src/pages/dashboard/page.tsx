// frontend/src/app/dashboard/page.tsx
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RecentNotifications } from "@/components/dashboard/recent-notifications"
import { ApprovalActivity } from "@/components/dashboard/approval-activity"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 1) Sidebar on the left */}
      <AppSidebar />

      {/* 2) Main area: header + page body */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Sticky top header */}
        <Header />

        {/* Page content */}
        <main className="p-6 space-y-6">
          {/* Dashboard “hero” header */}
          <DashboardHeader />

          {/* Top stats */}
          <DashboardStats />

          {/* Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCalendar />
          </div>

          {/* Notifications & Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentNotifications />
            <ApprovalActivity />
          </div>
        </main>
      </div>
    </div>
  )
}
