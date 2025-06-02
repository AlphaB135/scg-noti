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
import { useAuth } from "@/hooks/use-auth"

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
  const { user: authUser, isLoading: isAuthLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>("all")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // ===== LOAD AUTH USER TO STATE =====
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser.id,
        name: authUser.employeeProfile
          ? `${authUser.employeeProfile.firstName} ${authUser.employeeProfile.lastName}`
          : authUser.name || authUser.email,
        role: authUser.role,
        avatar: "/placeholder.svg?height=40&width=40",
        department: authUser.employeeProfile?.position || "-",
      })
    }
  }, [authUser])

  // ===== DATA LOADING =====
  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true)
    setError(null)
    
    // Helper: สร้าง query params สำหรับ timeline API
    const buildTimelineParams = () => {
      const params: any = { limit: 5 } // ลดจาก 50 เป็น 5 เพื่อทดสอบ
      if (filterType !== "all") params.types = [filterType]
      // เพิ่ม filter เฉพาะ TODO ที่ตัวเองสร้าง (personal)
      params.types = ["notification"];
      params.personal = true;
      // filterDate/searchQuery: filter ฝั่ง client
      return params
    }
    
    timelineApi.fetchTimeline(buildTimelineParams())
      .then((res: any) => {
        console.log('🔍 Timeline API Response:', res) // Debug log
        
        // Enhanced mapping: สร้าง multiple audit logs จาก single timeline event
        const logs: AuditLog[] = []
        
        if (!res?.events || !Array.isArray(res.events)) {
          console.log('❌ No events found in response')
          setAuditLogs([])
          setIsLoading(false)
          return
        }
        
        console.log(`📋 Processing ${res.events.length} events`) // Debug log
        
        res.events.forEach((event: any) => {
          // ตรวจสอบว่า event มีข้อมูลพื้นฐานที่จำเป็น
          if (!event?.id || !event?.createdAt || !event?.type) {
            return
          }

          console.log(`🔍 Event ${event.id}:`, {
            type: event.type,
            hasReschedule: event.metadata?.hasReschedule,
            hasEdit: event.metadata?.hasEdit,
            lastPostponedAt: event.metadata?.lastPostponedAt,
            postponeReason: event.metadata?.postponeReason,
            editedAt: event.metadata?.editedAt
          }) // Debug log

          const baseLog = {
            taskId: 0,
            taskTitle: event.title || event.metadata?.notificationTitle || event.metadata?.action || "ไม่ระบุ",
            actionBy: event.metadata?.creator?.firstName || event.metadata?.creator?.name || currentUser.name,
            details: event.message || event.status || event.metadata?.comment || "ไม่มีรายละเอียด",
            // ไม่ใส่ oldValue และ newValue ใน baseLog เพราะใช้เฉพาะกรณีแก้ไข
          }

          if (event.type === "notification") {
            // สร้าง log สำหรับ task creation
            logs.push({
              ...baseLog,
              id: `${event.id}_created`,
              actionType: "task_created",
              actionDate: event.createdAt,
              details: `สร้างการแจ้งเตือน: ${baseLog.taskTitle}`,
            })

            // ===== ตรวจสอบการเลื่อนงาน ใช้ข้อมูลจาก backend =====
            const hasBeenRescheduled = event.metadata?.hasReschedule === true
            const lastPostponedAt = event.metadata?.lastPostponedAt
            const postponeReason = event.metadata?.postponeReason || event.metadata?.rescheduleReason
            const postponeCount = event.metadata?.postponeCount || 0
            const originalDueDate = event.metadata?.originalDueDate
            const scheduledAt = event.metadata?.scheduledAt

            if (hasBeenRescheduled && lastPostponedAt) {
              const reason = postponeReason || "ไม่มีเหตุผลที่ระบุ"
              const originalScheduled = originalDueDate ? 
                new Date(originalDueDate).toLocaleDateString('th-TH') : 
                "ไม่ระบุ"
              const newScheduled = scheduledAt ? 
                new Date(scheduledAt).toLocaleDateString('th-TH') : 
                new Date(lastPostponedAt).toLocaleDateString('th-TH')
              
              logs.push({
                ...baseLog,
                id: `${event.id}_rescheduled`,
                actionType: "task_postponed",
                actionDate: lastPostponedAt,
                details: `เลื่อนกำหนดงาน: ${baseLog.taskTitle} (ครั้งที่ ${postponeCount}) - เหตุผล: ${reason}`,
                oldValue: `กำหนดเดิม: ${originalScheduled}`,
                newValue: `กำหนดใหม่: ${newScheduled}`,
              })
            }

            // ===== ตรวจสอบการแก้ไข (แยกจาก reschedule) =====
            const hasBeenEdited = event.metadata?.hasEdit === true
            const editedAt = event.metadata?.editedAt
            const originalCreatedAt = event.metadata?.originalCreatedAt
            
            // แก้ไขงานทั่วไป (ไม่ใช่การเลื่อนงาน)
            if (hasBeenEdited && editedAt && !hasBeenRescheduled) {
              const originalTime = new Date(originalCreatedAt || event.createdAt).toLocaleString('th-TH')
              const editTime = new Date(editedAt).toLocaleString('th-TH')
              
              logs.push({
                ...baseLog,
                id: `${event.id}_edited`,
                actionType: "task_updated",
                actionDate: editedAt,
                details: `แก้ไขงาน: ${baseLog.taskTitle}`,
                oldValue: `สร้างเมื่อ: ${originalTime}`,
                newValue: `แก้ไขเมื่อ: ${editTime}`,
              })
            }
            
            // Fallback: ตรวจสอบการแก้ไขจาก updatedAt (ถ้าไม่มี metadata)
            else if (!hasBeenRescheduled && event.updatedAt && event.updatedAt !== event.createdAt) {
              const editDate = event.updatedAt
              const originalTime = new Date(event.createdAt).toLocaleString('th-TH')
              const editTime = new Date(editDate).toLocaleString('th-TH')
              
              logs.push({
                ...baseLog,
                id: `${event.id}_edited`,
                actionType: "task_updated",
                actionDate: editDate,
                details: `แก้ไขงาน: ${baseLog.taskTitle}`,
                oldValue: `สร้างเมื่อ: ${originalTime}`,
                newValue: `แก้ไขเมื่อ: ${editTime}`,
              })
            }

            // หาก status แสดงว่า task ถูก process แล้ว ให้สร้าง additional log
            if (["SENT", "DELIVERED", "COMPLETED", "PROCESSED", "DONE"].includes(event.status)) {
              // ใช้ createdAt + 2 นาที เป็น processed time เมื่อไม่มี updatedAt
              const processedDate = event.updatedAt || new Date(new Date(event.createdAt).getTime() + 120000).toISOString()
              
              logs.push({
                ...baseLog,
                id: `${event.id}_processed`,
                actionType: "task_completed", // เปลี่ยนเป็น task_completed เพื่อให้เห็นการเสร็จงาน
                actionDate: processedDate,
                details: `เสร็จสิ้นการแจ้งเตือน: ${baseLog.taskTitle} - สถานะ: ${event.status}`,
              })
            }
          } else if (event.type === "approval") {
            // สร้าง log สำหรับ approval creation
            logs.push({
              ...baseLog,
              id: `${event.id}_created`,
              actionType: "task_created",
              actionDate: event.createdAt,
              details: `สร้างคำขออนุมัติ: ${baseLog.taskTitle}`,
            })

            // สร้าง log สำหรับ approval result (ถ้ามี)
            if (["APPROVED", "REJECTED"].includes(event.status)) {
              const resultDate = event.updatedAt || event.createdAt
              const timeDiff = new Date(resultDate).getTime() - new Date(event.createdAt).getTime()
              const adjustedDate = new Date(new Date(event.createdAt).getTime() + Math.max(timeDiff, 300000)).toISOString()
              
              logs.push({
                ...baseLog,
                id: `${event.id}_result`,
                actionType: event.status === "APPROVED" ? "task_completed" : "task_postponed",
                actionDate: adjustedDate,
                actionBy: event.metadata?.approver?.firstName || event.metadata?.approvedBy || baseLog.actionBy,
                details: `${event.status === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}คำขอ: ${baseLog.taskTitle}`,
              })
            }
          } else if (event.type === "security") {
            logs.push({
              ...baseLog,
              id: event.id,
              actionType: "task_reopened",
              actionDate: event.createdAt,
              details: `เหตุการณ์ความปลอดภัย: ${baseLog.details}`,
            })
          } else {
            // Default case สำหรับ event types อื่นๆ
            logs.push({
              ...baseLog,
              id: event.id,
              actionType: "task_updated",
              actionDate: event.createdAt,
            })
          }
        })

        // เรียงลำดับตามวันที่ (ใหม่สุดก่อน)
        logs.sort((a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime())
        setAuditLogs(logs)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch timeline data:', error)
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง')
        setAuditLogs([])
        setIsLoading(false)
      })
  }, [currentUser, filterType, filterDate, searchQuery])

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
        {isAuthLoading || !currentUser ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</span>
          </div>
        ) : (
          <UserProfile currentUser={currentUser} auditLogs={auditLogs} />
        )}

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

        {/* ===== LOADING STATE ===== */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        )}

        {/* ===== ERROR STATE ===== */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 px-2 py-1 rounded text-sm text-red-800 hover:bg-red-200"
                  >
                    โหลดใหม่
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TABS SECTION ===== */}
        {!isLoading && !error && (
          <LogsTabs
            filteredLogs={filteredLogs}
            groupedLogs={groupedLogs}
            formatGroupDate={formatGroupDate}
            getActionTypeColor={(t) => getActionTypeColor(t as ActionType)}
            getActionTypeIcon={(t) => getActionTypeIcon(t as ActionType)}
            getActionTypeText={(t) => getActionTypeText(t as ActionType)}
            formatDate={formatDate}
          />
        )}
      </div>
    </AppLayout>
  )
}
