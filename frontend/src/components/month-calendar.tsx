"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

export function MonthCalendar({ tasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // แปลง tasks array เป็น map ตามวันที่
  const taskMap = tasks.reduce((acc, task) => {
    const date = task.dueDate
    if (!acc[date]) acc[date] = []
    acc[date].push({
      title: task.title,
      status: task.done
        ? "เสร็จแล้ว"
        : task.priority === "overdue"
          ? "เลยกำหนด"
          : task.priority === "most_urgent" || task.priority === "urgent"
            ? "งานด่วน"
            : task.priority === "today"
              ? "งานวันนี้"
              : "ยังไม่เสร็จ",
    })
    return acc
  }, {})

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ]
  const thaiDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateStr)
    setIsDialogOpen(true)
  }

  const getTasksForDate = (dateStr: string) => {
    return taskMap[dateStr] || []
  }

  // สลับสีระหว่างงานด่วนกับงานเลยกำหนด
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "เลยกำหนด":
        return "bg-red-500" // เปลี่ยนเป็นสีแดงสำหรับงานเลยกำหนด
      case "งานด่วน":
        return "bg-orange-500" // เปลี่ยนเป็นสีส้มสำหรับงานด่วน
      case "งานวันนี้":
        return "bg-yellow-500"
      case "ยังไม่เสร็จ":
        return "bg-blue-500"
      case "เสร็จแล้ว":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const generateCalendarGrid = () => {
    const days = []
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 md:h-24 border border-gray-200 bg-gray-50"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const tasks = getTasksForDate(dateStr)
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

      days.push(
        <div
          key={day}
          className={`h-16 md:h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? "bg-red-50 border-red-200" : "bg-white"
          }`}
          onClick={() => handleDayClick(day)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? "text-red-600" : ""}`}>{day}</span>
            {isToday && <Badge className="bg-red-500 text-xs hidden sm:inline-flex">วันนี้</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {tasks.length > 0 && (
              <>
                {/* แสดงจำนวนงานบนมือถือ */}
                <div className="sm:hidden">
                  {tasks.length > 0 && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                      {tasks.length} งาน
                    </Badge>
                  )}
                </div>
                {/* แสดงจุดสีบนหน้าจอใหญ่ */}
                <div className="hidden sm:flex flex-wrap gap-1">
                  {tasks.map((task, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${getBadgeColor(task.status)}`}
                      title={`${task.title} (${task.status})`}
                    ></div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>,
      )
    }

    const remainingCells = totalCells - (daysInMonth + firstDayOfMonth)
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="h-16 md:h-24 border border-gray-200 bg-gray-50"></div>)
    }

    return days
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-").map(Number)
    const thaiYear = year + 543
    return `${day} ${thaiMonths[month - 1]} ${thaiYear}`
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-base md:text-lg font-medium">
          {thaiMonths[month]} {year + 543}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 md:h-10 md:w-10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 md:h-10 md:w-10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* คำอธิบายสีบนหน้าจอใหญ่ - อัพเดทสีตามเงื่อนไขใหม่ */}
      <div className="hidden md:flex items-center gap-4 mb-4 text-sm flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>เลยกำหนด</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>งานด่วน</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>งานวันนี้</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>ยังไม่เสร็จ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>เสร็จแล้ว</span>
        </div>
      </div>

      {/* คำอธิบายสีบนมือถือ - แบบย่อ - อัพเดทสีตามเงื่อนไขใหม่ */}
      <div className="flex md:hidden items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>เลยกำหนด</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span>ด่วน</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>วันนี้</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>ปกติ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>เสร็จ</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px mb-px">
        {thaiDays.map((day, index) => (
          <div
            key={index}
            className="h-8 md:h-10 bg-gray-100 flex items-center justify-center text-xs md:text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">{generateCalendarGrid()}</div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span className="text-base md:text-lg">งานวันที่ {formatDate(selectedDate || "")}</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>รายการงานทั้งหมดในวันที่เลือก</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto">
            {selectedDate &&
              (getTasksForDate(selectedDate).length > 0 ? (
                getTasksForDate(selectedDate).map((task, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm md:text-base">{task.title}</div>
                      <Badge className={getBadgeColor(task.status)}>{task.status}</Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">ไม่มีงานในวันที่เลือก</div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
