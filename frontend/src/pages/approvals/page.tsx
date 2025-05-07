// frontend/src/app/approvals/page.tsx
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { ApprovalsHeader } from "@/components/approvals/approvals-header"
import { ApprovalPopupForm } from "@/components/approvals/approval-popup-form"
import { ApprovalResponseForm } from "@/components/approvals/approval-response-form"

export default function ApprovalsPage() {
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
          <ApprovalsHeader />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApprovalPopupForm />
            <ApprovalResponseForm />
          </div>
        </main>
      </div>
    </div>
  )
}
