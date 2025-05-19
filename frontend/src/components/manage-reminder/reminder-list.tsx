"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Calendar, Clock, ExternalLink, Lock, Pencil, Trash2, Zap } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

type Reminder = {
  id: number | string
  title: string
  details: string
  date: string
  frequency: string
  link?: string
  password?: string
  impact?: string
  status: "completed" | "incomplete" | "overdue"
  type?: string
  isUrgent?: boolean
}

type ReminderListProps = {
  reminders: Reminder[]
  onEdit: (reminder: Reminder) => void
  onDelete: (reminder: Reminder) => void
  onToggleStatus: (reminder: Reminder) => void
  onViewPassword: (reminder: Reminder) => void
  getStatusBadge: (status: string) => React.ReactNode
  getFrequencyText: (frequency: string) => string
  getTypeIcon: (type: string) => React.ReactNode
  getDueDateStatus: (dateString: string) => React.ReactNode
  formatThaiDate: (dateString: string) => string
}

export default function ReminderList({
  reminders,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewPassword,
  getStatusBadge,
  getFrequencyText,
  getTypeIcon,
  getDueDateStatus,
  formatThaiDate,
}: ReminderListProps) {
  if (reminders.length === 0) {
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
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className={`p-5 hover:bg-gray-50 transition-colors ${reminder.status === "completed" ? "bg-[#f7fafc]" : ""}`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left side - Checkbox and Title */}
            <div className="flex items-start gap-3 md:w-1/2">
              <div className="pt-1">
                <Checkbox
                  checked={reminder.status === "completed"}
                  onCheckedChange={() => onToggleStatus(reminder)}
                  className={`h-5 w-5 ${
                    reminder.status === "completed" ? "bg-[#38a169] text-white border-[#38a169]" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`font-medium text-lg ${
                    reminder.status === "completed" ? "line-through text-gray-500" : "text-[#2c3e50]"
                  }`}
                >
                  {reminder.title}
                  {reminder.isUrgent && (
                    <Badge className="ml-2 bg-[#feebc8] text-[#dd6b20] hover:bg-[#fbd38d]">
                      <Zap className="h-3 w-3 mr-1" /> ด่วน
                    </Badge>
                  )}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {getStatusBadge(reminder.status)}
                  {reminder.type && getTypeIcon(reminder.type)}
                  <Badge
                    variant="outline"
                    className="bg-[#f7fafc] text-[#4a5568] border-[#e2e8f0] flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" /> {getFrequencyText(reminder.frequency)}
                  </Badge>
                </div>

                <div className="mt-3 text-sm text-gray-700 line-clamp-2">{reminder.details}</div>

                {reminder.impact && (
                  <div className="mt-3 bg-[#fff5f5] p-2 rounded-md border border-[#fed7d7]">
                    <div className="flex items-center gap-1 text-[#e53e3e] text-xs font-medium">
                      <AlertCircle className="h-3 w-3" /> ผลกระทบหากงานไม่เสร็จ
                    </div>
                    <p className="text-xs text-[#e53e3e] mt-1 line-clamp-2">{reminder.impact}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Date, Links, Actions */}
            <div className="flex flex-col md:flex-row justify-between md:w-1/2">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-[#4a5568] text-sm font-medium">
                    <Calendar className="h-4 w-4" /> วันที่แจ้งเตือน
                  </div>
                  <div className="text-sm mt-1">{getDueDateStatus(reminder.date)}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {reminder.link && (
                    <a
                      href={reminder.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ebf8ff] text-[#3182ce] rounded-md text-sm hover:bg-[#bee3f8] transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> เปิดลิงก์
                    </a>
                  )}

                  {reminder.password && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 bg-[#f7fafc] border-[#e2e8f0] text-[#4a5568] hover:bg-[#edf2f7]"
                      onClick={() => onViewPassword(reminder)}
                    >
                      <Lock className="h-3 w-3 mr-1" /> ดูข้อมูลล็อกอิน
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 border-[#e2e8f0] text-[#4a5568] hover:bg-[#edf2f7] hover:text-[#2c3e50]"
                        onClick={() => onEdit(reminder)}
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
                        onClick={() => onDelete(reminder)}
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
