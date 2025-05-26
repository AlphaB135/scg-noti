"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

type TeamMember = {
  id: string
  name: string
  role: string
  avatar?: string
}

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

type AssignmentStatusDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  notification: Notification | null
  teamMembers: TeamMember[]
}

export default function AssignmentStatusDialog({
  isOpen,
  onOpenChange,
  notification,
  teamMembers,
}: AssignmentStatusDialogProps) {
  if (!notification) return null

  const formatThaiDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-[#c6f6d5] text-[#38a169] hover:bg-[#9ae6b4]">เสร็จสิ้น</Badge>
      case "in-progress":
        return <Badge className="bg-[#bee3f8] text-[#3182ce] hover:bg-[#90cdf4]">กำลังดำเนินการ</Badge>
      case "pending":
        return <Badge className="bg-[#fefcbf] text-[#d69e2e] hover:bg-[#faf089]">รอดำเนินการ</Badge>
      case "overdue":
        return <Badge className="bg-[#fed7d7] text-[#e53e3e] hover:bg-[#feb2b2]">เลยกำหนด</Badge>
      default:
        return <Badge className="bg-[#e2e8f0] text-[#4a5568] hover:bg-[#cbd5e0]">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-[#38a169]" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-[#3182ce]" />
      case "pending":
        return <Clock className="h-5 w-5 text-[#d69e2e]" />
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-[#e53e3e]" />
      default:
        return <Clock className="h-5 w-5 text-[#4a5568]" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[60vw] xl:max-w-[50vw]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#2c3e50]">สถานะการมอบหมายงาน</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-[#2c3e50]">{notification.title}</h3>
            <p className="text-sm text-[#4a5568] mt-1">กำหนดส่ง: {formatThaiDate(notification.dueDate)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium text-[#4a5568] border-b pb-2">
              <div className="w-1/3">สมาชิก</div>
              <div className="w-1/3 text-center">สถานะ</div>
              <div className="w-1/3 text-right">วันที่</div>
            </div>

            {notification.assignments.map((assignment) => {
              const member = teamMembers.find((m) => m.id === assignment.memberId)

              return (
                <div key={assignment.memberId} className="flex justify-between items-center py-2">
                  <div className="w-1/3 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={assignment.memberName} />
                      <AvatarFallback className="bg-[#2c3e50] text-white text-xs">
                        {assignment.memberName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-[#2c3e50]">{assignment.memberName}</p>
                      <p className="text-xs text-[#718096]">{member?.role || ""}</p>
                    </div>
                  </div>

                  <div className="w-1/3 flex justify-center items-center gap-2">
                    <div className="mr-2">{getStatusIcon(assignment.status)}</div>
                    {getStatusBadge(assignment.status)}
                  </div>

                  <div className="w-1/3 text-right">
                    {assignment.status === "completed" && assignment.completedAt ? (
                      <div>
                        <p className="text-xs text-[#38a169] font-medium">เสร็จเมื่อ</p>
                        <p className="text-sm">{formatThaiDate(assignment.completedAt)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-[#718096]">มอบหมายเมื่อ</p>
                        <p className="text-sm">{formatThaiDate(assignment.assignedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button onClick={() => onOpenChange(false)} className="bg-[#2c3e50] hover:bg-[#1a2530] text-white">
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
