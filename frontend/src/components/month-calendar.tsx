"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Task } from "@/lib/types/task"

interface MonthCalendarProps {
  tasks: Task[]
  onMonthChange: (month: number, year: number) => void
  setIsAddDialogOpen: (value: boolean) => void
  setEditTask: (task: Task | null) => void
  resetForm: () => void
  currentMonth: number
  currentYear: number
  onToggleTaskDone?: (id: string) => void
  onRescheduleTask?: (task: Task) => void
  onViewTaskDetail?: (task: Task) => void
}

export function MonthCalendar({
  tasks,
  onMonthChange,
  setIsAddDialogOpen,
  setEditTask,
  resetForm,
  currentMonth,
  currentYear,
  onToggleTaskDone,
  onRescheduleTask,
  onViewTaskDetail,
}: MonthCalendarProps) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  const [dayTasksDialogOpen, setDayTasksDialogOpen] = useState(false)
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState("")

  // Drag and reschedule states
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [newTaskDate, setNewTaskDate] = useState("")
  const [rescheduleReason, setRescheduleReason] = useState("")

  // Initialize month and year state from props
  const now = new Date(currentYear, currentMonth - 1)
  const [monthDate, setMonthDate] = useState(now)

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  // Update month and year when props change
  useEffect(() => {
    setMonthDate(new Date(currentYear, currentMonth - 1))
  }, [currentMonth, currentYear])

  // Screen size detection
  useEffect(() => {
    const checkIsMobile = () => setIsMobileView(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Navigation handlers
  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1)
    setMonthDate(prev)
    onMonthChange(prev.getMonth() + 1, prev.getFullYear())
  }

  const nextMonth = () => {
    const next = new Date(year, month + 1, 1)
    setMonthDate(next)
    onMonthChange(next.getMonth() + 1, next.getFullYear())
  }

  // Calendar utilities
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  // Task grouping by date
  const taskMap = tasks.reduce<{ [key: string]: Task[] }>((acc, task) => {
    const date = task.dueDate
    if (!date) return acc
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(task)
    return acc
  }, {})

  // Date handling
  const formatDateStr = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  const getTasksForDate = (date: string) => taskMap[date] || []

  const handleDayClick = (day: number) => {
    const dateStr = formatDateStr(year, month, day)
    const tasksForDay = getTasksForDate(dateStr)

    setSelectedDateStr(dateStr)
    setSelectedDateTasks(tasksForDay)
    setDayTasksDialogOpen(true)
  }

  const openAddTaskDialog = () => {
    resetForm()
    setEditTask(null)
    setIsAddDialogOpen(true)
  }

  const toggleExpandDay = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation()
    setExpandedDays((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }))
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id)
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault()
    if (!draggedTask) return

    // Don't reschedule if dropped on the same date
    if (draggedTask.dueDate === targetDate) {
      setDraggedTask(null)
      return
    }

    setNewTaskDate(targetDate)
    setRescheduleDialogOpen(true)
  }

  const handleRescheduleConfirm = () => {
    // This would typically call an API to reschedule the task
    // For now, we'll just close the dialog
    setRescheduleDialogOpen(false)
    setDraggedTask(null)
    setRescheduleReason("")
  }

  // UI Constants
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
  const englishDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // ส่วนของ UI
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 font-noto">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">ปฏิทินงาน</h3>
          <p className="text-sm text-gray-500">ดูงานทั้งหมดสำหรับเดือน {thaiMonths[month]}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 md:h-10 md:w-10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {thaiMonths[month]} {year}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 md:h-10 md:w-10">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 text-center border-b">
          {(isMobileView ? thaiDays : englishDays).map((day, index) => (
            <div key={index} className="py-2 font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {Array.from({ length: daysInMonth + firstDayOfMonth }).map((_, i) => {
            if (i < firstDayOfMonth) {
              return (
                <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-white text-gray-300">
                  {new Date(year, month, 0).getDate() - firstDayOfMonth + i + 1}
                </div>
              )
            }

            const day = i - firstDayOfMonth + 1
            const formattedDate = formatDateStr(year, month, day)
            const dayTasks = getTasksForDate(formattedDate)
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
            const isSelected = selectedDay === day

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[100px] p-2 bg-white relative group cursor-pointer
                  ${isToday ? "bg-red-50 border border-red-200" : ""}
                  ${isSelected ? "ring-2 ring-red-500" : ""}`}
                onClick={() => handleDayClick(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, formattedDate)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday ? "text-red-700" : ""}`}>{day}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      openAddTaskDialog()
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {dayTasks.length > 0 && (
                  <>
                    {/* Task List */}
                    <div className="mt-2 space-y-1">
                      {(expandedDays[formattedDate] ? dayTasks : dayTasks.slice(0, 2)).map((task, index) => (
                        <div
                          key={index}
                          className={`px-1.5 py-0.5 text-[10px] font-medium truncate rounded cursor-move
                            ${
                              task.done
                                ? "bg-green-100 text-green-700"
                                : task.priority === "overdue"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "urgent"
                                    ? "bg-orange-100 text-orange-700"
                                    : task.priority === "today"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                            }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onClick={(e) => {
                            e.stopPropagation()
                            // เปิดหน้าต่างรายละเอียดงานแทนการแก้ไข
                            if (onViewTaskDetail) {
                              onViewTaskDetail(task)
                            } else {
                              resetForm()
                              setEditTask(task)
                              setIsAddDialogOpen(true)
                            }
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && !expandedDays[formattedDate] && (
                        <button
                          onClick={(e) => toggleExpandDay(e, formattedDate)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 w-full text-left"
                        >
                          + {dayTasks.length - 2} อื่นๆ
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day Tasks Dialog */}
      <Dialog open={dayTasksDialogOpen} onOpenChange={setDayTasksDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>งานวันที่ {selectedDateStr}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-3">
                {selectedDateTasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setDayTasksDialogOpen(false)
                      // เปิดหน้าต่างรายละเอียดงานแทนการแก้ไข
                      if (onViewTaskDetail) {
                        onViewTaskDetail(task)
                      } else {
                        resetForm()
                        setEditTask(task)
                        setIsAddDialogOpen(true)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={(e) => {
                          e.stopPropagation()
                          // เปลี่ยนจากคอมเมนต์เป็นการเรียกใช้ฟังก์ชันจริง
                          if (onToggleTaskDone) {
                            onToggleTaskDone(task.id)
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.done ? "line-through text-gray-400" : ""}`}>{task.title}</p>
                        <p className="text-sm text-gray-500 truncate">{task.details}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full
                          ${
                            task.done
                              ? "bg-green-100 text-green-700"
                              : task.priority === "overdue"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "urgent"
                                  ? "bg-orange-100 text-orange-700"
                                  : task.priority === "today"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {task.done
                          ? "เสร็จแล้ว"
                          : task.priority === "overdue"
                            ? "เลยกำหนด"
                            : task.priority === "urgent"
                              ? "ด่วน"
                              : task.priority === "today"
                                ? "วันนี้"
                                : "ปกติ"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>ไม่มีงานในวันนี้</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setDayTasksDialogOpen(false)
                resetForm()
                setIsAddDialogOpen(true)
              }}
            >
              เพิ่มงานใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>เลื่อนกำหนดการ</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <p className="font-medium">งาน: {draggedTask?.title}</p>
                <p className="text-sm text-gray-500">วันที่เดิม: {draggedTask?.dueDate}</p>
                <p className="text-sm text-gray-500">วันที่ใหม่: {newTaskDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">เหตุผลในการเลื่อนกำหนด</label>
                <Textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="ระบุเหตุผลในการเลื่อนกำหนด"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleRescheduleConfirm}
              disabled={!rescheduleReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
