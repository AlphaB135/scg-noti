// frontend/src/app/notifications/page.tsx
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { NotificationsHeader } from "@/components/notifications/notifications-header"
import { NotificationStats } from "@/components/notifications/notification-stats"
import { NotificationsTable } from "@/components/notifications/notifications-table"

export default function NotificationsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top header */}
        <Header />

        {/* Page content */}
        <main className="p-6 space-y-6">
          <NotificationsHeader />
          <NotificationStats />
          <NotificationsTable />
        </main>
      </div>
    </div>
  )
}
