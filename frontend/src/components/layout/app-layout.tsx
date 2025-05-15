"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../sidebar/sidebar"
import MobileSidebar from "../sidebar/mobile-sidebar"
import MobileHeader from "../sidebar/mobile-header"

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export default function AppLayout({ children, title, description }: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex min-h-screen bg-white font-noto">
      {/* Desktop Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Mobile Header */}
      <MobileHeader isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMenuOpen} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-20 w-full">
        {/* Desktop Header */}
        <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
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

        {/* Mobile Header Content */}
        <header className="block md:hidden bg-white border-b shadow-sm w-full top-14 z-30">
          <div className="flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-800">{title}</h1>
                {description && <p className="text-xs text-gray-500">{description}</p>}
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="font-bold text-sm">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
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
