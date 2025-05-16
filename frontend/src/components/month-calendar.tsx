"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types/task"

interface MonthCalendarProps {
  tasks: Task[]
  onMonthChange: (month: number, year: number) => void
  setIsAddDialogOpen: (value: boolean) => void
  setEditTask: (task: Task | null) => void
  resetForm: () => void
  currentMonth: number
  currentYear: number
}

export function MonthCalendar({ 
  tasks, 
  onMonthChange, 
  setIsAddDialogOpen, 
  setEditTask, 
  resetForm,
  currentMonth,
  currentYear 
}: MonthCalendarProps) {
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

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
    if (isMobileView) {
      setSelectedDay(selectedDay === day ? null : day)
      return
    }
    // Open add task dialog for non-mobile view
    openAddTaskDialog()
  }

  const openAddTaskDialog = () => {
    resetForm()
    setEditTask(null)
    setIsAddDialogOpen(true)
  }

  const toggleExpandDay = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation()
    setExpandedDays(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }))
  }

  // UI Constants
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
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
                className={`min-h-[100px] p-2 bg-white relative group
                  ${isToday ? "bg-red-50 border border-red-200" : ""}
                  ${isSelected ? "ring-2 ring-red-500" : ""}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday ? "text-red-700" : ""}`}>
                    {day}
                  </span>
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
                          className={`px-1.5 py-0.5 text-[10px] font-medium truncate rounded
                            ${task.done ? "bg-green-100 text-green-700" :
                            task.priority === "overdue" ? "bg-red-100 text-red-700" :
                            task.priority === "urgent" ? "bg-orange-100 text-orange-700" :
                            task.priority === "today" ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"}`}
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
    </div>
  )
}
