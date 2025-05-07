// frontend/src/app/rpa/page.tsx
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { RPAHeader } from "@/components/rpa/rpa-header"
import { RPATriggerForm } from "@/components/rpa/rpa-trigger-form"
import { RPAStatusCard } from "@/components/rpa/rpa-status-card"

export default function RPAPage() {
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
          <RPAHeader />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RPATriggerForm />
            </div>
            <div className="lg:col-span-2">
              <RPAStatusCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
