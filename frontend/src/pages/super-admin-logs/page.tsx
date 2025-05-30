"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, History, FileText, Calendar, Building, Shield } from "lucide-react"

// ข้อมูลประวัติการดำเนินการ
interface SuperAdminLog {
  id: string
  taskId: number
  taskTitle: string
  actionType: ActionType
  actionBy: string
  actionDate: string
  company: string
  department?: string
  details?: string
  oldValue?: string
  newValue?: string
}

// ประเภทการดำเนินการ
type ActionType =
  | "task_created"
  | "task_completed"
  | "task_updated"
  | "task_postponed"
  | "task_reopened"
  | "task_deleted"

export default function SuperAdminLogsPage() {
  // ===== STATE MANAGEMENT =====
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [filterCompany, setFilterCompany] = useState<string>("all")
  const [logs, setLogs] = useState<SuperAdminLog[]>([])
  const [companies, setCompanies] = useState<string[]>([])

  // ===== MOCK DATA LOADING =====
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const twoDaysAgoStr = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]

    // สร้างข้อมูลประวัติการดำเนินการตัวอย่าง
    const mockLogs: SuperAdminLog[] = [
      // SCG Chemicals
      {
        id: "log1",
        taskId: 1,
        taskTitle: "สรุปรายงานผลประกอบการไตรมาส 1",
        actionType: "task_created",
        actionBy: "วิชัย สมบูรณ์ดี",
        actionDate: `${todayStr}T09:15:00`,
        company: "SCG Chemicals",
        department: "Finance",
        details: "สร้างงานใหม่",
      },
      {
        id: "log2",
        taskId: 2,
        taskTitle: "ตรวจสอบคุณภาพวัตถุดิบ Lot 45B",
        actionType: "task_updated",
        actionBy: "สมศักดิ์ วงศ์ประเสริฐ",
        actionDate: `${todayStr}T10:30:00`,
        company: "SCG Chemicals",
        department: "Quality Control",
        details: "แก้ไขรายละเอียดงาน",
        oldValue: "ตรวจสอบเบื้องต้น",
        newValue: "ตรวจสอบเต็มรูปแบบ",
      },

      // SCG Packaging
      {
        id: "log3",
        taskId: 5,
        taskTitle: "ออกแบบบรรจุภัณฑ์ใหม่สำหรับสินค้า XYZ",
        actionType: "task_postponed",
        actionBy: "นภา ศรีวิไล",
        actionDate: `${todayStr}T11:45:00`,
        company: "SCG Packaging",
        department: "Design",
        details: "เลื่อนกำหนดส่งงาน",
        oldValue: "2025-05-08",
        newValue: "2025-05-15",
      },
      {
        id: "log4",
        taskId: 9,
        taskTitle: "ทดสอบความแข็งแรงของกล่องรุ่น P-2023",
        actionType: "task_completed",
        actionBy: "ธีรพงษ์ สุขสันต์",
        actionDate: `${yesterdayStr}T14:20:00`,
        company: "SCG Packaging",
        department: "R&D",
        details: "ทำงานเสร็จแล้ว",
      },

      // SCG Cement-Building Materials
      {
        id: "log5",
        taskId: 10,
        taskTitle: "ตรวจสอบคุณภาพปูนซีเมนต์รุ่น SC-500",
        actionType: "task_updated",
        actionBy: "วิทยา ก้าวหน้า",
        actionDate: `${yesterdayStr}T15:10:00`,
        company: "SCG Cement-Building Materials",
        department: "Quality Assurance",
        details: "เปลี่ยนสถานะเป็นเลยกำหนด",
      },
      {
        id: "log6",
        taskId: 8,
        taskTitle: "วางแผนการผลิตวัสดุก่อสร้างประจำเดือน",
        actionType: "task_created",
        actionBy: "สุรชัย พัฒนาดี",
        actionDate: `${yesterdayStr}T16:30:00`,
        company: "SCG Cement-Building Materials",
        department: "Production",
        details: "สร้างงานใหม่",
      },

      // SCG Cement-Building Materials
      {
        id: "log7",
        taskId: 3,
        taskTitle: "เตรียมเอกสารประชุมคณะกรรมการบริหาร",
        actionType: "task_created",
        actionBy: "มานะ ตั้งใจ",
        actionDate: `${twoDaysAgoStr}T09:00:00`,
        company: "SCG Cement-Building Materials",
        department: "Administration",
        details: "สร้างงานใหม่",
      },

      // SCG Chemicals
      {
        id: "log8",
        taskId: 4,
        taskTitle: "สั่งซื้อสารเคมีสำหรับการทดลอง",
        actionType: "task_created",
        actionBy: "พิมพ์ใจ รักงาน",
        actionDate: `${twoDaysAgoStr}T10:15:00`,
        company: "SCG Chemicals",
        department: "Procurement",
        details: "สร้างงานใหม่",
      },

      // SCG Packaging
      {
        id: "log9",
        taskId: 7,
        taskTitle: "วางแผนการตลาดสำหรับบรรจุภัณฑ์รักษ์โลก",
        actionType: "task_postponed",
        actionBy: "วรรณา สร้างสรรค์",
        actionDate: `${twoDaysAgoStr}T13:45:00`,
        company: "SCG Packaging",
        department: "Marketing",
        details: "เลื่อนกำหนดส่งงานจากวันที่ 15 พ.ค. ไปเป็นวันที่ 20 พ.ค.",
      },

      // SCG Cement-Building Materials
      {
        id: "log10",
        taskId: 6,
        taskTitle: "อัปโหลดข้อมูลการขายประจำเดือน",
        actionType: "task_completed",
        actionBy: "สมหมาย ใจดี",
        actionDate: `${twoDaysAgoStr}T16:20:00`,
        company: "SCG Cement-Building Materials",
        department: "Sales",
        details: "ทำงานเสร็จแล้ว",
      },
      {
        id: "log11",
        taskId: 6,
        taskTitle: "อัปโหลดข้อมูลการขายประจำเดือน",
        actionType: "task_reopened",
        actionBy: "ประภาส ละเอียด",
        actionDate: `${twoDaysAgoStr}T17:30:00`,
        company: "SCG Cement-Building Materials",
        department: "Sales",
        details: "เปิดงานใหม่เนื่องจากข้อมูลไม่ครบถ้วน",
      },
    ]

    // เรียงลำดับตามวันที่ล่าสุด
    mockLogs.sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())

    // ดึงรายชื่อบริษัททั้งหมด
    const uniqueCompanies = Array.from(new Set(mockLogs.map((log) => log.company)))

    setLogs(mockLogs)
    setCompanies(uniqueCompanies)
  }, [])

  // ===== HELPER FUNCTIONS =====
  // แปลงวันที่เป็นรูปแบบที่อ่านง่ายสำหรับหัวข้อกลุ่ม
  const formatGroupDate = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    if (dateString === today) {
      return "วันนี้"
    } else if (dateString === yesterday) {
      return "เมื่อวาน"
    } else {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  // แปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // ฟังก์ชันสำหรับแสดงสีของประเภทการดำเนินการ
  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "task_created":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "task_completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "task_updated":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "task_postponed":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      case "task_reopened":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "task_deleted":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // ฟังก์ชันสำหรับแสดงไอคอนของประเภทการดำเนินการ
  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "task_created":
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      case "task_completed":
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "task_updated":
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        )
      case "task_postponed":
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "task_reopened":
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )
      case "task_deleted":
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )
      default:
        return (
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  // ฟังก์ชันสำหรับแสดงข้อความของประเภทการดำเนินการ
  const getActionTypeText = (actionType: string) => {
    switch (actionType) {
      case "task_created":
        return "สร้างงานใหม่"
      case "task_completed":
        return "ทำงานเสร็จแล้ว"
      case "task_updated":
        return "แก้ไขงาน"
      case "task_postponed":
        return "เลื่อนกำหนดส่ง"
      case "task_reopened":
        return "เปิดงานใหม่"
      case "task_deleted":
        return "ลบงาน"
      default:
        return "ไม่ระบุ"
    }
  }

  // กรองประวัติการดำเนินการตามเงื่อนไข
  const filteredLogs = logs.filter((log) => {
    // กรองตามคำค้นหา
    const matchesSearch =
      log.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.company.toLowerCase().includes(searchQuery.toLowerCase())

    // กรองตามประเภทการดำเนินการ
    const matchesType = filterType === "all" || log.actionType === filterType

    // กรองตามวันที่
    let matchesDate = true
    if (filterDate === "today") {
      const today = new Date().toISOString().split("T")[0]
      matchesDate = log.actionDate.startsWith(today)
    } else if (filterDate === "yesterday") {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
      matchesDate = log.actionDate.startsWith(yesterday)
    } else if (filterDate === "last7days") {
      const sevenDaysAgo = new Date(Date.now() - 86400000 * 7)
      matchesDate = new Date(log.actionDate) >= sevenDaysAgo
    }

    // กรองตามบริษัท
    const matchesCompany = filterCompany === "all" || log.company === filterCompany

    return matchesSearch && matchesType && matchesDate && matchesCompany
  })

  // จัดกลุ่มประวัติการดำเนินการตามวันที่
  const groupedLogs: { [date: string]: SuperAdminLog[] } = {}
  filteredLogs.forEach((log) => {
    const date = log.actionDate.split("T")[0]
    if (!groupedLogs[date]) {
      groupedLogs[date] = []
    }
    groupedLogs[date].push(log)
  })

  // สถิติแยกตามบริษัท
  const companyStats = companies.map((company) => {
    const companyLogs = logs.filter((log) => log.company === company)
    return {
      company,
      total: companyLogs.length,
      completed: companyLogs.filter((log) => log.actionType === "task_completed").length,
      postponed: companyLogs.filter((log) => log.actionType === "task_postponed").length,
    }
  })

  return (
    <AppLayout title="ซุปเปอร์แอดมิน - ประวัติการดำเนินการทั้งหมด" description="ติดตามการเปลี่ยนแปลงและการดำเนินการของทุกบริษัทใน SCG">
      <div className="mt-4">
        {/* ===== SEARCH AND FILTER SECTION ===== */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Shield className="mr-2 h-5 w-5 text-red-700" />
              ค้นหาและกรองประวัติการดำเนินการ (ซุปเปอร์แอดมิน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* ช่องค้นหา */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหาตามชื่องาน, ผู้ดำเนินการ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* ตัวกรองตามบริษัท */}
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="กรองตามบริษัท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกบริษัท</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* ตัวกรองประเภทการดำเนินการ */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="กรองตามประเภทการดำเนินการ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="task_created">สร้างงานใหม่</SelectItem>
                  <SelectItem value="task_completed">ทำงานเสร็จแล้ว</SelectItem>
                  <SelectItem value="task_updated">แก้ไขงาน</SelectItem>
                  <SelectItem value="task_postponed">เลื่อนกำหนดส่ง</SelectItem>
                  <SelectItem value="task_reopened">เปิดงานใหม่</SelectItem>
                  <SelectItem value="task_deleted">ลบงาน</SelectItem>
                </SelectContent>
              </Select>

              {/* ตัวกรองตามวันที่ */}
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue placeholder="กรองตามวันที่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                  <SelectItem value="last7days">7 วันที่ผ่านมา</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ===== COMPANY STATISTICS SECTION ===== */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Building className="mr-2 h-5 w-5 text-red-700" />
            สถิติแยกตามบริษัท
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companyStats.map((stat) => (
              <Card key={stat.company} className={filterCompany === stat.company ? "border-red-500 shadow-md" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-gray-700">{stat.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">การดำเนินการทั้งหมด</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.total}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-green-600">เสร็จสิ้น: {stat.completed}</p>
                      <p className="text-sm text-orange-600">เลื่อนออกไป: {stat.postponed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ===== TABS SECTION ===== */}
        <Tabs defaultValue="timeline" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>ไทม์ไลน์</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>ตารางข้อมูล</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== TIMELINE VIEW ===== */}
          <TabsContent value="timeline" className="mt-4">
            {Object.keys(groupedLogs).length > 0 ? (
              Object.keys(groupedLogs)
                .sort()
                .reverse()
                .map((date) => (
                  <div key={date} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-red-700" />
                      {formatGroupDate(date)}
                    </h3>
                    <div className="relative border-l-2 border-gray-200 pl-6 ml-3 space-y-6">
                      {groupedLogs[date].map((log) => (
                        <div key={log.id} className="relative">
                          {/* จุดบนไทม์ไลน์ */}
                          <div className="absolute -left-[31px] mt-1.5 h-4 w-4 rounded-full bg-red-700 border-4 border-white shadow-sm"></div>

                          {/* การ์ดแสดงข้อมูล */}
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                <div className="flex items-center gap-2 mb-2 md:mb-0">
                                  <Badge className={getActionTypeColor(log.actionType)} variant="secondary">
                                    <span className="flex items-center gap-1">
                                      {getActionTypeIcon(log.actionType)}
                                      {getActionTypeText(log.actionType)}
                                    </span>
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {new Date(log.actionDate).toLocaleTimeString("th-TH", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-700">ดำเนินการโดย: {log.actionBy}</div>
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                <h4 className="text-base font-semibold text-gray-800">{log.taskTitle}</h4>
                                <Badge variant="outline" className="mt-1 md:mt-0 bg-gray-50">
                                  <Building className="h-3 w-3 mr-1" />
                                  {log.company}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600">{log.details}</p>                                {/* แสดงค่าเก่าและค่าใหม่ถ้ามี */}
                                {(log.oldValue || log.newValue) && (log.oldValue?.trim() !== "" || log.newValue?.trim() !== "") && (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm border-l-4 border-blue-200">
                                    {log.oldValue && log.oldValue.trim() !== "" && (
                                      <div className="text-red-600 mb-2">
                                        <span className="font-medium">ค่าเดิม:</span> 
                                        <span className="ml-2 px-2 py-1 bg-red-100 rounded text-red-700">{log.oldValue}</span>
                                      </div>
                                    )}
                                    {log.newValue && log.newValue.trim() !== "" && (
                                      <div className="text-green-600">
                                        <span className="font-medium">ค่าใหม่:</span> 
                                        <span className="ml-2 px-2 py-1 bg-green-100 rounded text-green-700">{log.newValue}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* แสดงแผนกถ้ามี */}
                              {log.department && (
                                <div className="mt-2 text-xs text-gray-500">แผนก: {log.department}</div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-200">
                  <History className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">ไม่พบประวัติการดำเนินการ</h3>
                <p className="text-gray-500">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาและการกรอง</p>
              </div>
            )}
          </TabsContent>

          {/* ===== TABLE VIEW ===== */}
          <TabsContent value="table" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {filteredLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            วันที่และเวลา
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            บริษัท
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ชื่องาน
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            การดำเนินการ
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ผู้ดำเนินการ
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            รายละเอียด
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(log.actionDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <Badge variant="outline" className="bg-gray-50">
                                <Building className="h-3 w-3 mr-1" />
                                {log.company}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.taskTitle}</td>
                            <td className="px-4 py-3">
                              <Badge className={getActionTypeColor(log.actionType)} variant="secondary">
                                <span className="flex items-center gap-1">
                                  {getActionTypeIcon(log.actionType)}
                                  {getActionTypeText(log.actionType)}
                                </span>
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{log.actionBy}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                      <History className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">ไม่พบประวัติการดำเนินการ</h3>
                    <p className="text-gray-500">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาและการกรอง</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
