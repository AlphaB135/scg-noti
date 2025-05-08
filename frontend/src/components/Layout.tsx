// src/components/Layout.tsx
import React, { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"
import { Header } from "./header"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar (จะ hidden บนมือถือ แต่ parent ยัง overflow-hidden) */}
      <AppSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* นี่คือส่วนเดียวที่เลื่อน scroll ได้ */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
