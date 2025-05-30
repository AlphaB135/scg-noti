"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import UserProfile from "@/components/user-logs/user-profile"
import SearchFilter from "@/components/user-logs/search-filter"
import Statistics from "@/components/user-logs/statistics"
import LogsTabs from "@/components/user-logs/logs-tabs"
import {
  formatDate,
  getActionTypeText,
  getActionTypeColor,
  getActionTypeIcon,
  type ActionType,
} from "@/components/user-logs/utils"
import { timelineApi } from "@/lib/api/timeline"

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

export default function UserActivityLogsPage() {
  // ===== STATE MANAGEMENT =====
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [currentUser, setCurrentUser] = useState({
    id: "user1",
    name: "Shogun",
    role: "ผู้จัดการโครงการ",
    avatar: "/placeholder.svg?height=40&width=40",
    department: "Developer",
  })

  // ===== DATA LOADING =====
  useEffect(() => {
    // Helper: สร้าง query params สำหรับ timeline API
    const buildTimelineParams = () => {
      const params: any = { limit: 50 }
      if (filterType !== "all") params.types = [filterType]
      // filterDate/searchQuery: filter ฝั่ง client
      return params
    }
    timelineApi.fetchTimeline(buildTimelineParams())
      .then((res: any) => {
        // Mapping timeline API → AuditLog
        const logs: AuditLog[] = (res.events || []).map((event: any) => {
          // Mapping event.type, event.status → actionType
          let actionType: ActionType = "task_updated"
          if (event.type === "notification") {
            actionType = event.status === "SENT" ? "task_created" : "task_updated"
          } else if (event.type === "approval") {
            if (event.status === "APPROVED") actionType = "task_completed"
            else if (event.status === "REJECTED") actionType = "task_postponed"
            else actionType = "task_updated"
          } else if (event.type === "security") {
            actionType = "task_reopened"
          }
          return {
            id: event.id,
            taskId: 0, // ไม่มีใน timeline event จริง
            taskTitle: event.title || event.metadata?.notificationTitle || event.metadata?.action || "-",
            actionType,
            actionBy: event.metadata?.creator?.firstName || currentUser.name,
            actionDate: event.createdAt,
            details: event.message || event.status || event.metadata?.comment,
            oldValue: event.metadata?.oldValue,
            newValue: event.metadata?.newValue,
          }
        })
        setAuditLogs(logs)
      })
      // ลบ fallback mock data: ไม่ต้อง setAuditLogs(mockAuditLogs) อีกต่อไป
  }, [currentUser.name, filterType, filterDate, searchQuery])

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
    <AppLayout title="ประวัติการดำเนินการของคุณ" description="ติดตามการเปลี่ยนแปลงและการดำเนินการของงานที่คุณทำ">
      <div className="mt-4">
        {/* ===== USER PROFILE SECTION ===== */}
        <UserProfile currentUser={currentUser} auditLogs={auditLogs} />

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
          getActionTypeColor={(t) => getActionTypeColor(t as ActionType)}
          getActionTypeIcon={(t) => getActionTypeIcon(t as ActionType)}
          getActionTypeText={(t) => getActionTypeText(t as ActionType)}
          formatDate={formatDate}
        />
      </div>
    </AppLayout>
  )
}
