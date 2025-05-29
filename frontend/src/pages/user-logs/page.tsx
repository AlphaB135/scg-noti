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
    // ดึง timeline จริงจาก backend
    timelineApi.fetchTimeline({ limit: 50 })
      .then((res) => {
        // แปลงข้อมูลให้เข้ากับ AuditLog (ตัวอย่าง mapping)
        const logs: AuditLog[] = res.events.map((event) => ({
          id: event.id,
          taskId: 0, // ไม่มีใน timeline event จริง
          taskTitle: event.title,
          actionType: event.type === 'notification' ? 'task_created' : 'task_updated',
          actionBy: currentUser.name,
          actionDate: event.createdAt,
          details: event.status,
        }));
        setAuditLogs(logs);
      })
      .catch(() => {
        // fallback: mock data
        const todayStr = new Date().toISOString().split("T")[0]
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0]
        const twoDaysAgoStr = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]
        const mockAuditLogs: AuditLog[] = [
          // วันนี้
          {
            id: "log1",
            taskId: 1,
            taskTitle: "สรุปรายงานผลประกอบการ",
            actionType: "task_created",
            actionBy: "สมชาย ใจดี",
            actionDate: `${todayStr}T09:15:00`,
            details: "สร้างงานใหม่",
          },
          // 2 วันที่แล้ว
          {
            id: "log7",
            taskId: 3,
            taskTitle: "เตรียมเอกสารประชุม",
            actionType: "task_created",
            actionBy: "สมชาย ใจดี",
            actionDate: `${twoDaysAgoStr}T09:00:00`,
            details: "สร้างงานใหม่",
          },
          {
            id: "log11",
            taskId: 6,
            taskTitle: "อัปโหลดข้อมูลเข้าระบบ",
            actionType: "task_reopened",
            actionBy: "สมชาย ใจดี",
            actionDate: `${twoDaysAgoStr}T17:30:00`,
            details: "เปิดงานใหม่เนื่องจากข้อมูลไม่ครบถ้วน",
          },
          // เพิ่มข้อมูลเพิ่มเติมเพื่อให้มีประวัติมากขึ้น
          {
            id: "log12",
            taskId: 9,
            taskTitle: "ส่งรายงานประจำเดือน",
            actionType: "task_postponed",
            actionBy: "สมชาย ใจดี",
            actionDate: `${yesterdayStr}T10:15:00`,
            details: "เลื่อนกำหนดส่งงานจากวันที่ 3 พ.ค. ไปเป็นวันที่ 5 พ.ค.",
            oldValue: "2025-05-03",
            newValue: "2025-05-05",
          },
          {
            id: "log13",
            taskId: 2,
            taskTitle: "ปฐมนิเทศพนักงานใหม่",
            actionType: "task_updated",
            actionBy: "สมชาย ใจดี",
            actionDate: `${yesterdayStr}T14:30:00`,
            details: "แก้ไขรายละเอียดงาน",
            oldValue: "เตรียมการปฐมนิเทศ",
            newValue: "เริ่มปฐมนิเทศในวันนี้",
          },
          {
            id: "log14",
            taskId: 4,
            taskTitle: "สั่งซื้ออุปกรณ์สำนักงาน",
            actionType: "task_completed",
            actionBy: "สมชาย ใจดี",
            actionDate: `${yesterdayStr}T16:45:00`,
            details: "ทำงานเสร็จแล้ว",
          },
          {
            id: "log15",
            taskId: 4,
            taskTitle: "สั่งซื้ออุปกรณ์สำนักงาน",
            actionType: "task_reopened",
            actionBy: "สมชาย ใจดี",
            actionDate: `${todayStr}T08:30:00`,
            details: "เปิดงานใหม่เนื่องจากต้องสั่งซื้อเพิ่มเติม",
          },
        ];
        mockAuditLogs.sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())
        setAuditLogs(mockAuditLogs)
      });
  }, [currentUser.name])

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
          getActionTypeColor={getActionTypeColor}
          getActionTypeIcon={getActionTypeIcon}
          getActionTypeText={getActionTypeText}
          formatDate={formatDate}
        />
      </div>
    </AppLayout>
  )
}
