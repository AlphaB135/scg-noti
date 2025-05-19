"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../sidebar/sidebar"

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export default function AppLayout({ children, title, description }: AppLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const navigate = useNavigate()

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true })
      navigate("/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }
  return (
    <div className="flex min-h-screen bg-white font-noto">
      {/* Desktop Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 pt-20 w-full">
        {/* Desktop Header */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 ml-64">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-600">
                <div>
                  {currentTime.toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="font-bold text-lg">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                  น.
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
}
