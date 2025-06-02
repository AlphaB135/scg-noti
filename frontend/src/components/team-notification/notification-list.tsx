"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Pencil, Trash2, Users, User, AlertCircle, CheckCircle, BarChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type NotificationAssignment = {
  memberId: string
  memberName: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  assignedAt: string
  completedAt?: string
}

type Notification = {
  id: string
  title: string
  details: string
  date: string
  dueDate: string
  frequency: string
  type?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "draft" | "active" | "completed" | "overdue"
  isTeamAssignment: boolean
  assignments: NotificationAssignment[]
}

type NotificationListProps = {
  notifications: Notification[]
  onEdit: (notification: Notification) => void
  onDelete: (notification: Notification) => void
  onViewAssignments: (notification: Notification) => void
}

export default function NotificationList({
  notifications,
  onEdit,
  onDelete,
  onViewAssignments,
}: NotificationListProps) {
  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-[#c6f6d5] text-[#38a169] hover:bg-[#9ae6b4]">เสร็จสิ้น</Badge>
      case "active":
        return <Badge className="bg-[#bee3f8] text-[#3182ce] hover:bg-[#90cdf4]">กำลังดำเนินการ</Badge>
      case "overdue":
        return <Badge className="bg-[#fed7d7] text-[#e53e3e] hover:bg-[#feb2b2]">เลยกำหนด</Badge>
      case "draft":
        return <Badge className="bg-[#e2e8f0] text-[#4a5568] hover:bg-[#cbd5e0]">ร่าง</Badge>
      default:
        return <Badge className="bg-[#e2e8f0] text-[#4a5568] hover:bg-[#cbd5e0]">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-[#fed7d7] text-[#e53e3e] hover:bg-[#feb2b2]">ด่วนมาก</Badge>
      case "high":
        return <Badge className="bg-[#feebc8] text-[#dd6b20] hover:bg-[#fbd38d]">ด่วน</Badge>
      case "medium":
        return <Badge className="bg-[#fefcbf] text-[#d69e2e] hover:bg-[#faf089]">ปานกลาง</Badge>
      case "low":
        return <Badge className="bg-[#c6f6d5] text-[#38a169] hover:bg-[#9ae6b4]">ต่ำ</Badge>
      default:
        return <Badge className="bg-[#e2e8f0] text-[#4a5568] hover:bg-[#cbd5e0]">{priority}</Badge>
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "meeting":
        return (
          <Badge variant="outline" className="bg-[#ebf8ff] text-[#3182ce] border-[#bee3f8] flex items-center gap-1">
            <Calendar className="h-3 w-3" /> การประชุม
          </Badge>
        )
      case "report":
        return (
          <Badge variant="outline" className="bg-[#f3e8ff] text-[#805ad5] border-[#e9d8fd] flex items-center gap-1">
            <BarChart className="h-3 w-3" /> รายงาน
          </Badge>
        )
      case "document":
        return (
          <Badge variant="outline" className="bg-[#fffbeb] text-[#d97706] border-[#fef3c7] flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> เอกสาร
          </Badge>
        )
      default:
        return type ? (
          <Badge variant="outline" className="bg-[#f7fafc] text-[#4a5568] border-[#e2e8f0] flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> {type}
          </Badge>
        ) : null
    }
  }

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDueDateStatus = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDate = new Date(dateString)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return (
        <span className="text-[#e53e3e] text-xs flex items-center gap-1 font-medium">
          <AlertCircle className="h-3 w-3" /> เลยกำหนด {Math.abs(diffDays)} วัน
        </span>
      )
    } else if (diffDays === 0) {
      return (
        <span className="text-[#dd6b20] text-xs flex items-center gap-1 font-medium">
          <Clock className="h-3 w-3" /> วันนี้
        </span>
      )
    } else if (diffDays <= 3) {
      return (
        <span className="text-[#d69e2e] text-xs flex items-center gap-1 font-medium">
          <Clock className="h-3 w-3" /> อีก {diffDays} วัน
        </span>
      )
    } else {
      return <span className="text-[#4a5568] text-xs">{formatThaiDate(dateString)}</span>
    }
  }

  const getCompletionRate = (assignments: NotificationAssignment[]) => {
    if (assignments.length === 0) return 0
    const completedCount = assignments.filter((a) => a.status === "completed").length
    return Math.round((completedCount / assignments.length) * 100)
  }

  // If no notifications
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Calendar className="h-20 w-20 text-gray-300 mb-6" />
        <h3 className="text-2xl font-medium text-[#2c3e50] mb-3">ไม่พบรายการแจ้งเตือน</h3>
        <p className="text-gray-500 text-center max-w-md">
          ไม่พบรายการแจ้งเตือนที่ตรงกับเงื่อนไขการค้นหา กรุณาลองเปลี่ยนตัวกรองหรือคำค้นหา
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-5 hover:bg-gray-50 transition-colors ${notification.status === "completed" ? "bg-[#f7fafc]" : ""}`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left side - Title and Details */}
            <div className="flex items-start gap-3 md:w-1/2">
              <div className="pt-1">
                {notification.isTeamAssignment ? (
                  <div className="bg-[#ebf8ff] p-1 rounded-md">
                    <Users className="h-5 w-5 text-[#3182ce]" />
                  </div>
                ) : (
                  <div className="bg-[#f3e8ff] p-1 rounded-md">
                    <User className="h-5 w-5 text-[#805ad5]" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-[#2c3e50]">{notification.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {getStatusBadge(notification.status)}
                  {getPriorityBadge(notification.priority)}
                  {notification.type && getTypeIcon(notification.type)}
                </div>

                <div className="mt-3 text-sm text-gray-700 line-clamp-2">{notification.details}</div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#4a5568]">ความคืบหน้า</span>
                    <span className="text-xs font-medium text-[#4a5568]">
                      {getCompletionRate(notification.assignments)}%
                    </span>
                  </div>
                  <Progress value={getCompletionRate(notification.assignments)} className="h-2" />
                </div>
              </div>
            </div>

            {/* Right side - Date, Assignments, Actions */}
            <div className="flex flex-col md:flex-row justify-between md:w-1/2">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-[#4a5568] text-sm font-medium">
                    <Calendar className="h-4 w-4" /> กำหนดส่ง
                  </div>
                  <div className="text-sm mt-1">{getDueDateStatus(notification.dueDate)}</div>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-[#4a5568] text-sm font-medium">
                    <Users className="h-4 w-4" /> มอบหมายให้
                  </div>
                  <div className="flex -space-x-2 mt-1">
                    {notification.assignments.slice(0, 5).map((assignment) => (
                      <TooltipProvider key={assignment.memberId}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar
                              className={`h-8 w-8 border-2 ${assignment.status === "completed" ? "border-[#38a169]" : "border-white"}`}
                            >
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={assignment.memberName} />
                              <AvatarFallback className="bg-[#2c3e50] text-white text-xs">
                                {assignment.memberName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{assignment.memberName}</p>
                            <p className="text-xs text-muted-foreground">
                              {assignment.status === "completed"
                                ? "เสร็จสิ้น"
                                : assignment.status === "in-progress"
                                  ? "กำลังดำเนินการ"
                                  : assignment.status === "overdue"
                                    ? "เลยกำหนด"
                                    : "รอดำเนินการ"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}

                    {notification.assignments.length > 5 && (
                      <Avatar className="h-8 w-8 border-2 border-white bg-[#e2e8f0]">
                        <AvatarFallback className="bg-[#e2e8f0] text-[#4a5568] text-xs">
                          +{notification.assignments.length - 5}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-[#3182ce] border-[#bee3f8] bg-[#ebf8ff] hover:bg-[#bee3f8]"
                  onClick={() => onViewAssignments(notification)}
                >
                  ดูสถานะการมอบหมาย
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 border-[#e2e8f0] text-[#4a5568] hover:bg-[#edf2f7] hover:text-[#2c3e50]"
                        onClick={() => onEdit(notification)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">แก้ไข</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>แก้ไข</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 border-[#e2e8f0] text-[#e53e3e] hover:bg-[#fff5f5] hover:text-[#c53030]"
                        onClick={() => onDelete(notification)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">ลบ</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ลบ</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
