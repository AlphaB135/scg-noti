"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Calendar, Clock, Eye, LinkIcon, Lock, Pencil, Trash2, Zap } from "lucide-react"

type Reminder = {
  id: number
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
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col items-center justify-center gap-2">
          <Calendar className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-700">ไม่พบรายการแจ้งเตือน</h3>
          <p className="text-sm text-gray-500">ไม่พบรายการแจ้งเตือนที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {reminders.map((reminder) => (
        <Card
          key={reminder.id}
          className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
            reminder.status === "completed"
              ? "border-l-4 border-l-green-500"
              : reminder.status === "overdue"
                ? "border-l-4 border-l-red-500"
                : reminder.isUrgent
                  ? "border-l-4 border-l-orange-500"
                  : "border-l-4 border-l-yellow-500"
          }`}
        >
          <CardContent className="p-0">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={reminder.status === "completed"}
                    onChange={() => onToggleStatus(reminder)}
                    className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <h3
                      className={`font-medium text-lg ${
                        reminder.status === "completed" ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {reminder.title}
                      {reminder.isUrgent && (
                        <Badge className="ml-2 bg-orange-100 text-orange-800 hover:bg-orange-200">
                          <Zap className="h-3 w-3 mr-1" /> ด่วน
                        </Badge>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {getStatusBadge(reminder.status)}
                      {reminder.type && getTypeIcon(reminder.type)}
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" /> {getFrequencyText(reminder.frequency)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          onClick={() => onEdit(reminder)}
                        >
                          <Pencil className="h-4 w-4" />
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
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => onDelete(reminder)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ลบ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">รายละเอียด</Label>
                        <p className="mt-1 text-sm text-gray-700">{reminder.details}</p>
                      </div>

                      {reminder.impact && (
                        <div>
                          <Label className="text-xs text-gray-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" /> ผลกระทบหากงานไม่เสร็จ
                          </Label>
                          <p className="mt-1 text-sm text-red-600">{reminder.impact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                    <div>
                      <Label className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> วันที่แจ้งเตือน
                      </Label>
                      <div className="mt-1">{getDueDateStatus(reminder.date)}</div>
                    </div>

                    {reminder.link && (
                      <div>
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" /> ลิงก์
                        </Label>
                        <div className="mt-1">
                          <a
                            href={reminder.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <LinkIcon className="h-3 w-3" /> เปิดลิงก์
                          </a>
                        </div>
                      </div>
                    )}

                    {reminder.password && (
                      <div>
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> ข้อมูลเข้าสู่ระบบ
                        </Label>
                        <div className="mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-white"
                            onClick={() => onViewPassword(reminder)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> ดูข้อมูล
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
