// frontend/src/app/audit-logs/page.tsx
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { AuditLogHeader } from "@/components/audit-logs/audit-log-header"
import { AuditLogFilters } from "@/components/audit-logs/audit-log-filters"
import { AuditLogTable } from "@/components/audit-logs/audit-log-table"

export default function AuditLogsPage() {
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
          <AuditLogHeader />
          <AuditLogFilters />
          <AuditLogTable />
        </main>
      </div>
    </div>
  )
}
