"use client"

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from "recharts"
import { AlertCircle, Calendar, Check, ChevronDown, Clock, Download, FileText, Menu, RefreshCw, Search, X, XCircle } from 'lucide-react'

// Types
interface Admin {
  id: string
  name: string
  department: string
  behaviorStatus: string
  snoozes: number
  overdue: number
  events: {
    date: string
    type: string
    details: string
    time?: string
  }[]
  taskStats: {
    normal: number
    snoozed: number
    overdue: number
  }
}

interface MonthlyStats {
  month: string
  snoozes: number
  absences: number
  lates: number
  overdue: number
}

type ToastType = "success" | "error" | "info"

// Main Component
export default function AdminBehaviorDashboard() {
  // States
  const [admins, setAdmins] = useState<Admin[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [behaviorFilter, setBehaviorFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  
  const panelRef = useRef<HTMLDivElement>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout>()

  // Fetch admins data
  useEffect(() => {
    fetchAdmins()
  }, [])

  // Filter admins when search or filter changes
  useEffect(() => {
    filterAdmins()
  }, [searchQuery, behaviorFilter, admins])

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Clear toast after timeout
  useEffect(() => {
    if (toast) {
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null)
      }, 3000)
    }

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [toast])

  // Fetch admins data
  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      // In a real app, uncomment this to fetch from API
      // const response = await axios.get('/api/admins/behavior')
      // const data = response.data
      
      // Mock data for demonstration
      const mockData: Admin[] = [
        {
          id: "1",
          name: "สมชาย ใจดี",
          department: "ฝ่ายขาย",
          behaviorStatus: "ปกติ",
          snoozes: 0,
          overdue: 0,
          events: [
            { date: "2023-05-01", time: "09:00", type: "งานเสร็จตามกำหนด", details: "ส่งรายงานตรงเวลา" }
          ],
          taskStats: { normal: 45, snoozed: 0, overdue: 0 }
        },
        {
          id: "2",
          name: "วิชัย มานะ",
          department: "ฝ่ายการเงิน",
          behaviorStatus: "เลื่อนงานบ่อย",
          snoozes: 12,
          overdue: 2,
          events: [
            { date: "2023-05-02", time: "14:30", type: "เลื่อนงาน", details: "เลื่อนการส่งรายงานประจำเดือน" },
            { date: "2023-05-10", time: "11:15", type: "เลื่อนงาน", details: "เลื่อนการตรวจสอบบัญชี" }
          ],
          taskStats: { normal: 30, snoozed: 12, overdue: 2 }
        },
        {
          id: "3",
          name: "สุดา รักงาน",
          department: "ฝ่ายบุคคล",
          behaviorStatus: "ไม่ตรงเวลา",
          snoozes: 5,
          overdue: 8,
          events: [
            { date: "2023-05-03", time: "09:30", type: "มาสาย", details: "มาทำงานสาย 30 นาที" },
            { date: "2023-05-11", time: "09:45", type: "มาสาย", details: "มาทำงานสาย 45 นาที" }
          ],
          taskStats: { normal: 25, snoozed: 5, overdue: 8 }
        },
        {
          id: "4",
          name: "มานี ขยัน",
          department: "ฝ่ายการตลาด",
          behaviorStatus: "ปกติ",
          snoozes: 1,
          overdue: 0,
          events: [
            { date: "2023-05-04", time: "08:50", type: "งานเสร็จตามกำหนด", details: "ส่งแผนการตลาดตรงเวลา" }
          ],
          taskStats: { normal: 40, snoozed: 1, overdue: 0 }
        },
        {
          id: "5",
          name: "ประสิทธิ์ ช้างาน",
          department: "ฝ่ายไอที",
          behaviorStatus: "ไม่ทำงาน",
          snoozes: 8,
          overdue: 15,
          events: [
            { date: "2023-05-05", time: "17:00", type: "ไม่ส่งงาน", details: "ไม่ส่งรายงานความคืบหน้า" },
            { date: "2023-05-12", time: "17:00", type: "ไม่ส่งงาน", details: "ไม่อัพเดทระบบตามกำหนด" }
          ],
          taskStats: { normal: 10, snoozed: 8, overdue: 15 }
        },
        {
          id: "6",
          name: "วันดี มีสุข",
          department: "ฝ่ายลูกค้าสัมพันธ์",
          behaviorStatus: "ขาดงาน",
          snoozes: 3,
          overdue: 7,
          events: [
            { date: "2023-05-06", time: "00:00", type: "ขาดงาน", details: "ไม่มาทำงานโดยไม่แจ้งล่วงหน้า" },
            { date: "2023-05-15", time: "00:00", type: "ขาดงาน", details: "ไม่มาทำงานโดยไม่แจ้งล่วงหน้า" }
          ],
          taskStats: { normal: 20, snoozed: 3, overdue: 7 }
        }
      ]
      
      setAdmins(mockData)
      setFilteredAdmins(mockData)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching admins:", error)
      showToast("ไม่สามารถดึงข้อมูลแอดมินได้", "error")
      setIsLoading(false)
    }
  }

  // Filter admins based on search query and behavior filter
  const filterAdmins = () => {
    let filtered = [...admins]
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(admin => 
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Filter by behavior status
    if (behaviorFilter !== "all") {
      filtered = filtered.filter(admin => admin.behaviorStatus === behaviorFilter)
    }
    
    setFilteredAdmins(filtered)
  }

  // Handle admin selection
  const handleAdminSelect = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsPanelOpen(true)
  }

  // Handle export CSV
  const handleExportCSV = () => {
    if (!selectedAdmin) return
    
    try {
      // In a real app, this would generate and download a CSV file
      // For demo purposes, we'll just show a success toast
      showToast(`ข้อมูลของ ${selectedAdmin.name} ถูกส่งออกเป็นไฟล์ CSV แล้ว`, "success")
    } catch (error) {
      showToast("ไม่สามารถส่งออกข้อมูลได้", "error")
    }
  }

  // Handle download PDF
  const handleDownloadPDF = () => {
    if (!selectedAdmin) return
    
    try {
      // In a real app, this would generate and download a PDF file
      // For demo purposes, we'll just show a success toast
      showToast(`ข้อมูลของ ${selectedAdmin.name} ถูกส่งออกเป็นไฟล์ PDF แล้ว`, "success")
    } catch (error) {
      showToast("ไม่สามารถส่งออกข้อมูลได้", "error")
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchAdmins()
    showToast("ข้อมูลถูกอัพเดทเรียบร้อยแล้ว", "info")
  }

  // Show toast message
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type })
  }

  // Get behavior badge variant
  const getBehaviorBadgeVariant = (status: string) => {
    switch (status) {
      case "ปกติ":
        return "bg-green-500 text-white"
      case "เลื่อนงานบ่อย":
        return "bg-amber-500 text-white"
      case "ไม่ทำงาน":
        return "bg-[#E2001A] text-white"
      case "ขาดงาน":
        return "bg-[#E2001A] text-white"
      case "ไม่ตรงเวลา":
        return "bg-amber-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Get event type color
  const getEventTypeColor = (type: string) => {
    if (type.includes("เลื่อน")) return "text-amber-600"
    if (type.includes("ไม่ส่ง") || type.includes("ขาด")) return "text-[#E2001A]"
    if (type.includes("สาย")) return "text-amber-600"
    return "text-green-600"
  }

  // Get event icon
  const getEventIcon = (type: string) => {
    if (type.includes("เลื่อน")) return <Calendar className="h-4 w-4 text-amber-600" />
    if (type.includes("ไม่ส่ง") || type.includes("ขาด")) return <XCircle className="h-4 w-4 text-[#E2001A]" />
    if (type.includes("สาย")) return <Clock className="h-4 w-4 text-amber-600" />
    if (type.includes("ปกติ") || type.includes("เสร็จ")) return <Check className="h-4 w-4 text-green-600" />
    return <AlertCircle className="h-4 w-4 text-gray-600" />
  }

  // Format date
  const formatDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString)
    const formattedDate = new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
    
    return timeString ? `${formattedDate} ${timeString}` : formattedDate
  }

  // Generate monthly stats
  const generateMonthlyStats = (admin: Admin): MonthlyStats[] => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน"]
    
    return months.map((month) => {
      // Generate random stats based on admin's behavior status
      let snoozes = 0
      let absences = 0
      let lates = 0
      let overdue = 0

      if (admin.behaviorStatus === "เลื่อนงานบ่อย") {
        snoozes = Math.floor(Math.random() * 5) + 1
      } else if (admin.behaviorStatus === "ขาดงาน") {
        absences = Math.floor(Math.random() * 3) + 1
      } else if (admin.behaviorStatus === "ไม่ตรงเวลา") {
        lates = Math.floor(Math.random() * 4) + 1
      } else if (admin.behaviorStatus === "ไม่ทำงาน") {
        overdue = Math.floor(Math.random() * 6) + 1
      }

      // For normal admins, keep values low
      if (admin.behaviorStatus === "ปกติ") {
        snoozes = Math.random() > 0.7 ? 1 : 0
        absences = 0
        lates = Math.random() > 0.8 ? 1 : 0
        overdue = 0
      }

      return {
        month,
        snoozes,
        absences,
        lates,
        overdue,
      }
    })
  }

  // Render skeleton loaders
  const renderSkeletons = () => (
    <div className="container mx-auto px-4 py-6">
      <div className="h-8 w-64 bg-gray-200 rounded-md mb-6 animate-pulse"></div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-full md:w-[200px] bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-full md:w-[100px] bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 w-16 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="h-4 w-16 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="h-5 w-8 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="h-5 w-8 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Render toast
  const renderToast = () => {
    if (!toast) return null

    const bgColor = toast.type === "success" 
      ? "bg-green-500" 
      : toast.type === "error" 
        ? "bg-[#E2001A]" 
        : "bg-blue-500"

    return (
      <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white ${bgColor} shadow-lg z-50 flex items-center gap-2 transition-opacity duration-300`}>
        {toast.type === "success" && <Check className="h-5 w-5" />}
        {toast.type === "error" && <X className="h-5 w-5" />}
        {toast.type === "info" && <AlertCircle className="h-5 w-5" />}
        <span>{toast.message}</span>
      </div>
    )
  }

  // Render sidebar
  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 bg-white border-r transition-transform duration-300 ease-in-out z-30`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-center">
          <div className="bg-[#E2001A] text-white p-2 rounded-lg">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="ml-2 text-xl font-bold">SCG Admin</h1>
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center p-2 rounded-lg bg-[#E2001A]/10 text-[#E2001A]">
              <AlertCircle className="h-5 w-5 mr-2" />
              พฤติกรรมแอดมิน
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100">
              <Calendar className="h-5 w-5 mr-2" />
              ตารางงาน
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100">
              <Clock className="h-5 w-5 mr-2" />
              การเข้างาน
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )

  // Render main content
  const renderMainContent = () => (
    <div className="md:ml-64 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดพฤติกรรมแอดมิน</h1>
        <button 
          className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อหรือหน่วยงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2001A] focus:border-transparent"
            aria-label="ค้นหาแอดมิน"
          />
        </div>
        
        <div className="relative w-full md:w-[200px]">
          <select
            value={behaviorFilter}
            onChange={(e) => setBehaviorFilter(e.target.value)}
            className="w-full appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E2001A] focus:border-transparent"
            aria-label="กรองตามพฤติกรรม"
          >
            <option value="all">ทั้งหมด</option>
            <option value="ปกติ">ปกติ</option>
            <option value="เลื่อนงานบ่อย">เลื่อนงานบ่อย</option>
            <option value="ไม่ทำงาน">ไม่ทำงาน</option>
            <option value="ขาดงาน">ขาดงาน</option>
            <option value="ไม่ตรงเวลา">ไม่ตรงเวลา</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
        
        <button 
          onClick={handleRefresh} 
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E2001A] focus:border-transparent"
          aria-label="รีเฟรชข้อมูล"
        >
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </button>
      </div>
      
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                  ชื่อ-สกุล
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หน่วยงาน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะพฤติกรรม
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนงานที่เลื่อน
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนงานค้าง
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลแอดมิน
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr 
                    key={admin.id} 
                    onClick={() => handleAdminSelect(admin)} 
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {admin.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBehaviorBadgeVariant(admin.behaviorStatus)}`}>
                        {admin.behaviorStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {admin.snoozes > 0 ? (
                        <span className="text-amber-600 font-medium">{admin.snoozes}</span>
                      ) : (
                        admin.snoozes
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {admin.overdue > 0 ? (
                        <span className="text-[#E2001A] font-medium">{admin.overdue}</span>
                      ) : (
                        admin.overdue
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render detail panel
  const renderDetailPanel = () => {
    if (!selectedAdmin || !isPanelOpen) return null

    const chartData = [
      {
        name: "ปกติ",
        value: selectedAdmin.taskStats.normal,
        color: "#16A34A",
      },
      {
        name: "เลื่อน",
        value: selectedAdmin.taskStats.snoozed,
        color: "#F59E0B",
      },
      {
        name: "ค้าง",
        value: selectedAdmin.taskStats.overdue,
        color: "#E2001A",
      },
    ]

    const monthlyStats = generateMonthlyStats(selectedAdmin)

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
        <div 
          ref={panelRef}
          className="bg-white w-full max-w-md md:max-w-xl h-full shadow-lg animate-in slide-in-from-right"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold">{selectedAdmin.name}</h2>
              <p className="text-gray-500">{selectedAdmin.department}</p>
            </div>
            <button 
              onClick={() => setIsPanelOpen(false)} 
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E2001A]"
              aria-label="ปิดรายละเอียด"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="h-[calc(100vh-80px)] overflow-y-auto">
            <div className="space-y-8 p-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">สรุปสถานะงาน</h3>
                <div className="bg-white rounded-2xl border shadow-sm p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} งาน`, "จำนวน"]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">เหตุการณ์สำคัญ</h3>
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่/เวลา
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เหตุการณ์
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          รายละเอียด
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedAdmin.events.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                            ไม่พบข้อมูลเหตุการณ์
                          </td>
                        </tr>
                      ) : (
                        selectedAdmin.events.map((event, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(event.date, event.time)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                {getEventIcon(event.type)}
                                <span className={getEventTypeColor(event.type)}>
                                  {event.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.details}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">สถิติรายเดือน</h3>
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เดือน
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เลื่อนงาน
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ขาดงาน
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          มาสาย
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          งานค้าง
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyStats.map((stat) => (
                        <tr key={stat.month}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {stat.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {stat.snoozes > 0 ? (
                              <span className="text-amber-600 font-medium">{stat.snoozes}</span>
                            ) : (
                              stat.snoozes
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {stat.absences > 0 ? (
                              <span className="text-[#E2001A] font-medium">{stat.absences}</span>
                            ) : (
                              stat.absences
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {stat.lates > 0 ? (
                              <span className="text-amber-600 font-medium">{stat.lates}</span>
                            ) : (
                              stat.lates
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {stat.overdue > 0 ? (
                              <span className="text-[#E2001A] font-medium">{stat.overdue}</span>
                            ) : (
                              stat.overdue
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="bg-white rounded-2xl border shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <button
                    onClick={handleExportCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#E2001A] text-white rounded-lg hover:bg-[#C0001A] focus:outline-none focus:ring-2 focus:ring-[#E2001A] focus:ring-offset-2"
                    aria-label="ส่งออกข้อมูลเป็น CSV"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-[#E2001A] text-[#E2001A] rounded-lg hover:bg-[#E2001A]/10 focus:outline-none focus:ring-2 focus:ring-[#E2001A] focus:ring-offset-2"
                    aria-label="ดาวน์โหลดข้อมูลเป็น PDF"
                  >
                    <FileText className="h-4 w-4" />
                    ดาวน์โหลด PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {renderSidebar()}
      
      <div className="md:pl-64 min-h-screen">
        {isLoading ? renderSkeletons() : renderMainContent()}
      </div>
      
      {renderDetailPanel()}
      {renderToast()}
    </div>
  )
}