// frontend/src/pages/LoginPage.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../lib/api"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    // fade in card
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/auth/login", {
        employeeCode: username,
        password,
      })
      
      if (!res.data) {
        setError("ล็อกอินไม่สำเร็จ: ไม่ได้รับข้อมูลตอบกลับ")
        return
      }
      
      if (!res.data.ok && !res.data.role) {
        setError("ล็อกอินไม่สำเร็จ: " + (res.data?.message || "ไม่สามารถเข้าสู่ระบบได้"))
        return
      }
      
      const { role } = res.data
      
      // Navigate to dashboard for all roles
      switch (role) {
        case "ADMIN":
        case "SUPERADMIN":
        case "SUPERVISOR":
          navigate("/dashboard")
          break
        default:
          setError("สิทธิ์ของผู้ใช้นี้ไม่ถูกต้อง")
      }
    } catch (err: unknown) {
      let msg = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? err.message
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden font-noto">      {/* grid pattern overlay (non-interactive) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dot" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 L0 0 0 20" stroke="white" strokeWidth="1" fill="none" />
            </pattern>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#dot)" />
              <path d="M100 0 L0 0 0 100" stroke="white" strokeWidth="2" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mx-4 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* SCG Logo */}
      <div className="flex justify-center mb-6">
  <img
    src="https://www.watsadupedia.com/images/2/2c/Scg.png"
    alt="SCG Logo"
    className="w-22 h-20 object-contain"
  />
</div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-8">
          SCG Notification System
        </h1>

        {/* General error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          รหัสพนักงาน
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="C001-1000"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E2001A]"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            รหัสผ่าน
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E2001A]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              className="h-4 w-4 text-[#E2001A] focus:ring-[#E2001A] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-500">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-sm text-gray-500 hover:text-[#E2001A]">
            ลืมรหัสผ่าน?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E2001A] text-white py-2 rounded-lg hover:bg-[#E2001A]/90 transition duration-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © 2025 SCG Notification System
        </p>
      </form>
    </div>
  )
}
