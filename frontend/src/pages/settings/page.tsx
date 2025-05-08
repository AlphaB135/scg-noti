// frontend/src/app/settings/page.tsx
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SettingsHeader } from "@/components/settings/settings-header"
import { SettingsTabs } from "@/components/settings/settings-tabs"

export default function SettingsPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <Header />

        {/* Page content: flex-1 + overflow-y-auto */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <SettingsHeader />
          <SettingsTabs />
        </main>
      </div>
    </div>
  )
}
