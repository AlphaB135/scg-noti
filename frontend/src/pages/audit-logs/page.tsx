"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import SearchFilter from "@/components/audit-logs/search-filter"
import Statistics from "@/components/audit-logs/statistics"
import LogsTabs from "@/components/audit-logs/logs-tabs"
import {
  formatDate,
  getActionTypeText,
  getActionTypeColor,
  getActionTypeIcon,
  type ActionType,
} from "@/components/user-logs/utils"

// ข้อมูลประวัติการดำเนินการ
interface AuditLog {
  id: string
  taskId: number
  taskTitle: string
  actionType: ActionType
  actionBy: string
  actionDate: string
  details?: string
  oldValue?: string
  newValue?: string
}

export default function AuditLogsPage() {
  // ===== STATE MANAGEMENT =====
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // ===== MOCK DATA LOADING =====
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const twoDaysAgoStr = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]

    // สร้างข้อมูลประวัติการดำเนินการตัวอย่าง
    const mockAuditLogs: AuditLog[] = [
      // วันนี้
      {
        id: "log1",
        taskId: 1,
        taskTitle: "สรุปรายงานผลประกอบการ",
        actionType: "task_created",
        actionBy: "โชกุน สุดหล่อ",
        actionDate: `${todayStr}T09:15:00`,
        details: "สร้างงานใหม่",
      },
      {
        id: "log2",
        taskId: 2,
        taskTitle: "ปฐมนิเทศพนักงานใหม่",
        actionType: "task_updated",
        actionBy: "แบงค์ คาร์แคร์",
        actionDate: `${todayStr}T10:30:00`,
        details: "แก้ไขรายละเอียดงาน",
        oldValue: "เริ่มปฐมนิเทศ",
        newValue: "เริ่มปฐมนิเทศในวันนี้",
      },
      {
        id: "log3",
        taskId: 5,
        taskTitle: "ตรวจสอบระบบเซิร์ฟเวอร์",
        actionType: "task_postponed",
        actionBy: "บิว อาสยาม",
        actionDate: `${todayStr}T11:45:00`,
        details: "เลื่อนกำหนดส่งงาน",
        oldValue: "2025-05-08",
        newValue: "2025-05-09",
      },

      // เมื่อวาน
      {
        id: "log4",
        taskId: 9,
        taskTitle: "ส่งรายงานประจำเดือน",
        actionType: "task_updated",
        actionBy: "บาส ไม่เป็นสุข",
        actionDate: `${yesterdayStr}T14:20:00`,
        details: "เปลี่ยนสถานะเป็นเลยกำหนด",
      },
      {
        id: "log5",
        taskId: 10,
        taskTitle: "ตรวจสอบงบประมาณไตรมาส",
        actionType: "task_updated",
        actionBy: "พี่พีท ซีเนียร์จำเป็น",
        actionDate: `${yesterdayStr}T15:10:00`,
        details: "เปลี่ยนสถานะเป็นเลยกำหนด",
      },
      {
        id: "log6",
        taskId: 8,
        taskTitle: "จัดทำงบประมาณไตรมาสใหม่",
        actionType: "task_created",
        actionBy: "พี่พีท ซีเนียร์จำเป็น",
        actionDate: `${yesterdayStr}T16:30:00`,
        details: "สร้างงานใหม่",
      },

      // 2 วันที่แล้ว
      {
        id: "log7",
        taskId: 3,
        taskTitle: "เตรียมเอกสารประชุม",
        actionType: "task_created",
        actionBy: "โชกุน สุดหล่อ",
        actionDate: `${twoDaysAgoStr}T09:00:00`,
        details: "สร้างงานใหม่",
      },
      {
        id: "log8",
        taskId: 4,
        taskTitle: "สั่งซื้ออุปกรณ์สำนักงาน",
        actionType: "task_created",
        actionBy: "แบงค์ คาร์แคร์",
        actionDate: `${twoDaysAgoStr}T10:15:00`,
        details: "สร้างงานใหม่",
      },
      {
        id: "log9",
        taskId: 7,
        taskTitle: "วางแผนอบรมประจำเดือน",
        actionType: "task_postponed",
        actionBy: "บาส ไม่เป็นสุข",
        actionDate: `${twoDaysAgoStr}T13:45:00`,
        details: "เลื่อนกำหนดส่งงานจากวันที่ 15 พ.ค. ไปเป็นวันที่ 17 พ.ค.",
      },
      {
        id: "log10",
        taskId: 6,
        taskTitle: "อัปโหลดข้อมูลเข้าระบบ",
        actionType: "task_completed",
        actionBy: "บิว อาสยาม",
        actionDate: `${twoDaysAgoStr}T16:20:00`,
        details: "ทำงานเสร็จแล้ว",
      },
      {
        id: "log11",
        taskId: 6,
        taskTitle: "อัปโหลดข้อมูลเข้าระบบ",
        actionType: "task_reopened",
        actionBy: "โชกุน สุดหล่อ",
        actionDate: `${twoDaysAgoStr}T17:30:00`,
        details: "เปิดงานใหม่เนื่องจากข้อมูลไม่ครบถ้วน",
      },
    ]

    // เรียงลำดับตามวันที่ล่าสุด
    mockAuditLogs.sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())

    setAuditLogs(mockAuditLogs)
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

  // กรองประวัติการดำเนินการตามเงื่อนไข
  const filteredLogs = auditLogs.filter((log) => {
    // กรองตามคำค้นหา
    const matchesSearch =
      log.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))

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

    return matchesSearch && matchesType && matchesDate
  })

  // จัดกลุ่มประวัติการดำเนินการตามวันที่
  const groupedLogs: { [date: string]: AuditLog[] } = {}
  filteredLogs.forEach((log) => {
    const date = log.actionDate.split("T")[0]
    if (!groupedLogs[date]) {
      groupedLogs[date] = []
    }
    groupedLogs[date].push(log)
  })

  return (
    <AppLayout title="ประวัติการดำเนินการพนักงาน" description="ติดตามการเปลี่ยนแปลงและการดำเนินการของงานทั้งหมด">
      <div className="mt-4">
        {/* ===== SEARCH AND FILTER SECTION ===== */}
        <SearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
        />

        {/* ===== STATISTICS SECTION ===== */}
        <Statistics auditLogs={auditLogs} />

        {/* ===== TABS SECTION ===== */}
        <LogsTabs
          filteredLogs={filteredLogs}
          groupedLogs={groupedLogs}
          formatGroupDate={formatGroupDate}
          getActionTypeColor={getActionTypeColor}
          getActionTypeIcon={getActionTypeIcon}
          getActionTypeText={getActionTypeText}
          formatDate={formatDate}
        />
      </div>
    </AppLayout>
  )
}
