"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X, Filter, Plus, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"

export function MonthCalendar({ tasks, onMonthChange, setIsAddDialogOpen, setEditTask, resetForm }) {
  // เพิ่ม state สำหรับการแสดงผลบนมือถือ
  const [isMobileView, setIsMobileView] = useState(false)

  // เพิ่ม state สำหรับการเลือกวันในมุมมองมือถือ
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    details: "",
    dueDate: "",
    priority: "normal",
    frequency: "no-repeat",
    impact: "",
    link: "",
    hasLogin: false,
    username: "",
    password: "",
  })
  const [draggedTask, setDraggedTask] = useState(null)
  const [allTasks, setAllTasks] = useState(tasks)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [taskToReschedule, setTaskToReschedule] = useState(null)
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})
  // const [editTask, setEditTask] = useState(null)

  // Sync tasks prop with internal state
  useEffect(() => {
    setAllTasks(tasks)
  }, [tasks])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Update the useEffect that notifies about month changes
  useEffect(() => {
    // Call the onMonthChange prop if provided
    if (onMonthChange) {
      onMonthChange(month + 1, year)
    }

    // Also dispatch the event for backward compatibility
    const event = new CustomEvent("calendarMonthChange", {
      detail: { month: month + 1, year },
    })
    window.dispatchEvent(event)
  }, [month, year, onMonthChange])

  // ฟังก์ชันอัพเดทความสำคัญของงานตามวันที่กำหนด
  const updateTaskPriority = (task) => {
    if (task.done) return task // ถ้างานเสร็จแล้ว ไม่ต้องอัพเดทสถานะ

    const todayDate = new Date()
    const due = new Date(task.dueDate)

    // เคลียร์เวลาทั้งคู่เพื่อเปรียบเทียบเฉพาะวัน
    todayDate.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffInDays = Math.floor((due - todayDate) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) return { ...task, priority: "overdue" } // งานเลยกำหนด
    if (diffInDays === 0) return { ...task, priority: "today" } // งานวันนี้
    if (diffInDays <= 3) return { ...task, priority: "urgent" } // งานด่วน (ภายใน 3 วัน)
    return { ...task, priority: "pending" } // งานอื่นๆ
  }

  // แปลง tasks array เป็น map ตามวันที่
  const taskMap = allTasks.reduce((acc, task) => {
    const date = task.dueDate
    if (!acc[date]) acc[date] = []
    acc[date].push({
      id: task.id,
      title: task.title,
      details: task.details || "",
      status: task.done
        ? "เสร็จแล้ว"
        : task.priority === "overdue"
          ? "เลยกำหนด"
          : task.priority === "most_urgent" || task.priority === "urgent"
            ? "กำลังจะมาถึง"
            : task.priority === "today"
              ? "งานวันนี้"
              : "ยังไม่เสร็จ",
      priority: task.priority,
      done: task.done,
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
  const englishDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // เพิ่ม useEffect เพื่อตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    // ตรวจสอบครั้งแรก
    checkIsMobile()

    // ตรวจสอบเมื่อขนาดหน้าจอเปลี่ยน
    window.addEventListener("resize", checkIsMobile)

    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  // เพิ่มฟังก์ชันสำหรับการเลือกวันในมุมมองมือถือ
  const handleDaySelect = (day: number) => {
    setSelectedDay(day === selectedDay ? null : day)
  }

  // แก้ไขฟังก์ชัน handleDayClick เพื่อรองรับมุมมองมือถือ
  const handleDayClick = (day: number) => {
    if (isMobileView) {
      handleDaySelect(day)
      return
    }

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
      case "กำลังจะมาถึง":
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

  const getTaskBgColor = (status: string) => {
    switch (status) {
      case "เลยกำหนด":
        return "bg-red-100 text-red-700"
      case "กำลังจะมาถึง":
        return "bg-orange-100 text-orange-700"
      case "งานวันนี้":
        return "bg-yellow-100 text-yellow-700"
      case "ยังไม่เสร็จ":
        return "bg-blue-100 text-blue-700"
      case "เสร็จแล้ว":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-").map(Number)
    const thaiYear = year + 543
    return `${day} ${thaiMonths[month - 1]} ${thaiYear}`
  }

  // Drag and drop functionality
  const handleDragStart = (e, task, dateStr) => {
    setDraggedTask({ ...task, originalDate: dateStr })
    e.dataTransfer.setData("text/plain", JSON.stringify({ task, dateStr }))
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, targetDate) => {
    e.preventDefault()
    if (!draggedTask) return

    // If the target date is different from the original date, show the reschedule dialog
    if (draggedTask.originalDate !== targetDate) {
      setTaskToReschedule(draggedTask)
      setNewDueDate(targetDate)
      setIsRescheduleDialogOpen(true)
    }

    setDraggedTask(null)
  }

  const handleRescheduleTask = () => {
    if (!taskToReschedule || !rescheduleReason.trim() || !newDueDate) return

    // Create a new array with the updated task
    const updatedTasks = allTasks.map((task) => {
      if (task.id === taskToReschedule.id) {
        // สร้างงานที่อัพเดทวันที่แล้ว
        const updatedTask = {
          ...task,
          dueDate: newDueDate,
          rescheduleReason,
          rescheduleDate: new Date().toISOString(),
        }

        // อัพเดทสถานะของงานตามวันที่ใหม่
        return updateTaskPriority(updatedTask)
      }
      return task
    })

    setAllTasks(updatedTasks)
    setTaskToReschedule(null)
    setRescheduleReason("")
    setNewDueDate("")
    setIsRescheduleDialogOpen(false)
  }

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.dueDate || !newTask.details.trim() || !newTask.impact.trim()) return

    // สร้างข้อมูล password จาก username และ password ถ้ามีการติ๊กช่อง hasLogin
    let passwordData = ""
    if (newTask.hasLogin && (newTask.username || newTask.password)) {
      passwordData = `user: ${newTask.username}\npassword: ${newTask.password}`
    }

    // สร้างงานใหม่และอัพเดทสถานะตามวันที่
    const newTaskObj = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      details: newTask.details,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      frequency: newTask.frequency,
      impact: newTask.impact,
      link: newTask.link,
      hasLogin: newTask.hasLogin,
      username: newTask.username,
      password: newTask.password,
      done: false,
    }

    // อัพเดทสถานะของงานตามวันที่
    const taskWithUpdatedPriority = updateTaskPriority(newTaskObj)

    setAllTasks([...allTasks, taskWithUpdatedPriority])
    setNewTask({
      title: "",
      details: "",
      dueDate: "",
      priority: "normal",
      frequency: "no-repeat",
      impact: "",
      link: "",
      hasLogin: false,
      username: "",
      password: "",
    })
    // setIsAddTaskOpen(false)
  }

  const openAddTaskDialog = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    resetForm()
    setEditTask(null)
    // กำหนดวันที่ในฟอร์มหลัก
    window.selectedCalendarDate = dateStr
    setIsAddDialogOpen(true)
  }

  const toggleExpandDay = (e, dateStr) => {
    e.stopPropagation() // ป้องกันไม่ให้เปิดไดอะล็อก
    setExpandedDays((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }))
  }

  // เพิ่มฟังก์ชัน handleEditTask ต่อจากฟังก์ชัน openRescheduleDialog
  const openRescheduleDialog = (task) => {
    setTaskToReschedule(task)
    setNewDueDate(task.dueDate)
    setIsRescheduleDialogOpen(true)
  }

  // เพิ่มฟังก์ชันสำหรับการแก้ไขงาน
  const handleEditTask = (task) => {
    // ค้นหางานจาก allTasks เพื่อให้ได้ข้อมูลเต็ม
    const fullTask = allTasks.find((t) => t.id === task.id)
    if (fullTask) {
      resetForm()
      setEditTask(fullTask)
      setIsAddDialogOpen(true)
    }
  }

  // เพิ่มฟังก์ชันสำหรับบันทึกการแก้ไขงาน
  const handleSaveEdit = () => {
    // if (!editTask) return
    // // อัพเดทสถานะของงานตามวันที่ใหม่
    // const updatedTask = updateTaskPriority(editTask)
    // // อัพเดทงานในรายการ
    // const updatedTasks = allTasks.map((task) => {
    //   if (task.id === updatedTask.id) {
    //     return updatedTask
    //   }
    //   return task
    // })
    // setAllTasks(updatedTasks)
    // setEditTask(null)
  }

  // แทนที่ return statement ด้วยโค้ดที่มีเงื่อนไขสำหรับมุมมองมือถือ
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
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 text-sm"
            onClick={() => {
              // Dispatch event to open filter dialog
              window.dispatchEvent(new CustomEvent("openFilterDialog"))
            }}
          >
            <Filter className="h-4 w-4" />
            <span>ตัวกรอง</span>
          </Button>
        </div>
      </div>

      {isMobileView ? (
        // Mobile Calendar View
        <div className="rounded-xl border overflow-hidden bg-white">
          {/* Mobile Month Header */}
          <div className="grid grid-cols-7 text-center border-b bg-gray-50">
            {thaiDays.map((day, index) => (
              <div key={index} className="py-2 text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Mobile Month Grid - Compact version */}
          <div className="grid grid-cols-7 gap-1 p-2 bg-white">
            {/* Empty cells before first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square flex items-center justify-center text-gray-300 text-xs">
                {new Date(year, month, 0).getDate() - firstDayOfMonth + i + 1}
              </div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const tasks = getTasksForDate(dateStr)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
              const isSelected = selectedDay === day

              return (
                <div
                  key={`day-${day}`}
                  className={`aspect-square relative flex flex-col items-center justify-center rounded-full 
                    ${isToday ? "bg-red-50" : ""} 
                    ${isSelected ? "bg-red-100 ring-2 ring-red-500" : ""}
                    ${tasks.length > 0 ? "font-semibold" : ""}
                    transition-all duration-200 ease-in-out`}
                  onClick={() => handleDayClick(day)}
                >
                  <span className={`text-sm ${isToday ? "text-red-700" : ""} ${isSelected ? "text-red-700" : ""}`}>
                    {day}
                  </span>

                  {/* Task indicators */}
                  {tasks.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {tasks.length > 3 ? (
                        <>
                          <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        </>
                      ) : (
                        tasks
                          .slice(0, 3)
                          .map((task, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 w-1.5 rounded-full ${
                                task.status === "เลยกำหนด"
                                  ? "bg-red-500"
                                  : task.status === "กำลังจะมาถึง"
                                    ? "bg-orange-500"
                                    : task.status === "งานวันนี้"
                                      ? "bg-yellow-500"
                                      : task.status === "เสร็จแล้ว"
                                        ? "bg-green-500"
                                        : "bg-blue-500"
                              }`}
                            ></div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Empty cells after last day of month */}
            {Array.from({ length: 42 - (firstDayOfMonth + daysInMonth) }).map((_, i) => (
              <div
                key={`empty-end-${i}`}
                className="aspect-square flex items-center justify-center text-gray-300 text-xs"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Mobile Task List for Selected Day */}
          {selectedDay && (
            <div className="border-t mt-2">
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium text-gray-800">
                  {selectedDay} {thaiMonths[month]} {year}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
                    openAddTaskDialog(selectedDay)
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {(() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
                  const tasks = getTasksForDate(dateStr)

                  if (tasks.length === 0) {
                    return (
                      <div className="text-center py-6 text-gray-500">
                        <CalendarIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">ไม่มีงานในวันที่เลือก</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
                            openAddTaskDialog(selectedDay)
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" /> เพิ่มงานใหม่
                        </Button>
                      </div>
                    )
                  }

                  return tasks.map((task, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        task.status === "เลยกำหนด"
                          ? "border-red-200 bg-red-50"
                          : task.status === "กำลังจะมาถึง"
                            ? "border-orange-200 bg-orange-50"
                            : task.status === "งานวันนี้"
                              ? "border-yellow-200 bg-yellow-50"
                              : task.status === "เสร็จแล้ว"
                                ? "border-green-200 bg-green-50"
                                : "border-blue-200 bg-blue-50"
                      } cursor-pointer`}
                      onClick={() => handleEditTask(task)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${task.done ? "line-through text-gray-400" : ""}`}>
                            {task.title}
                          </h4>
                          {task.details && (
                            <p className={`text-xs mt-1 ${task.done ? "text-gray-400" : "text-gray-600"}`}>
                              {task.details}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getTaskBgColor(task.status)}`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{task.done ? "เสร็จแล้ว" : "ยังไม่เสร็จ"}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              // Set the task for editing
                              const fullTask = allTasks.find((t) => t.id === task.id)
                              if (fullTask) {
                                setEditTask(fullTask)
                              }
                            }}
                          >
                            {task.done ? "ดูรายละเอียด" : "แก้ไข"}
                          </Button>

                          {!task.done && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                // Find the full task and open reschedule dialog
                                const fullTask = allTasks.find((t) => t.id === task.id)
                                if (fullTask) {
                                  openRescheduleDialog(fullTask)
                                }
                              }}
                            >
                              เลื่อนกำหนด
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Desktop Calendar View (Original)
        <div className="border rounded-xl overflow-hidden">
          {/* Calendar header */}
          <div className="grid grid-cols-7 text-center border-b">
            {englishDays.map((day, index) => (
              <div key={index} className="py-2 font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 grid-rows-5 gap-px bg-gray-100 hover:bg-gray-50">
            {/* Empty cells before first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-white text-gray-300">
                {new Date(year, month, 0).getDate() - firstDayOfMonth + i + 1}
              </div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const tasks = getTasksForDate(dateStr)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[100px] p-2 bg-white ${isToday ? "bg-red-50 border border-red-200" : ""} relative group cursor-pointer`}
                  onClick={() => handleDayClick(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${isToday ? "text-red-700" : ""}`}>{day}</span>
                  </div>

                  {tasks.length > 0 && (
                    <div className="mt-2">
                      {/* แสดง 2 งานแรกเสมอ */}
                      {tasks.slice(0, 2).map((task, index) => (
                        <div
                          key={index}
                          className={`mb-1 rounded ${getTaskBgColor(task.status)} px-1.5 py-0.5 text-[10px] font-medium truncate cursor-move`}
                          title={task.title}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task, dateStr)}
                        >
                          {task.title}
                        </div>
                      ))}

                      {/* ถ้ามีงานมากกว่า 2 ชิ้นและกำลังแสดงงานเพิ่มเติม */}
                      {tasks.length > 2 && expandedDays[dateStr] && (
                        <div className="mt-1">
                          {tasks.slice(2).map((task, index) => (
                            <div
                              key={`extra-${index}`}
                              className={`mb-1 rounded ${getTaskBgColor(task.status)} px-1.5 py-0.5 text-[10px] font-medium truncate cursor-move`}
                              title={task.title}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task, dateStr)}
                            >
                              {task.title}
                            </div>
                          ))}
                          <button
                            onClick={(e) => toggleExpandDay(e, dateStr)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer w-full text-left"
                          >
                            แสดงน้อยลง
                          </button>
                        </div>
                      )}

                      {/* ถ้ามีงานมากกว่า 2 ชิ้นและไม่ได้แสดงงานเพิ่มเติม */}
                      {tasks.length > 2 && !expandedDays[dateStr] && (
                        <button
                          onClick={(e) => toggleExpandDay(e, dateStr)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer w-full text-left"
                        >
                          + {tasks.length - 2} อื่นๆ
                        </button>
                      )}
                    </div>
                  )}

                  {/* Task count badge (bottom right) */}
                  {tasks.length > 0 && (
                    <div className="absolute bottom-1 right-1 text-[10px] text-gray-500">{tasks.length} งาน</div>
                  )}

                  {/* Add task button (visible on hover) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      openAddTaskDialog(day)
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}

            {/* Empty cells after last day of month */}
            {Array.from({ length: 42 - (firstDayOfMonth + daysInMonth) }).map((_, i) => (
              <div key={`empty-end-${i}`} className="min-h-[100px] p-2 bg-white text-gray-300">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task details dialog - Used in desktop view */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-red-700" />
                <span className="text-base md:text-lg">งานวันที่ {formatDate(selectedDate || "")}</span>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>รายการงานทั้งหมดในวันที่เลือก (ลากเพื่อย้ายงาน)</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto">
            {selectedDate &&
              (getTasksForDate(selectedDate).length > 0 ? (
                getTasksForDate(selectedDate).map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, selectedDate)}
                      onClick={() => handleEditTask(task)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm md:text-base">{task.title}</div>
                          {task.details && <p className="text-sm text-gray-500 mt-1">{task.details}</p>}
                        </div>
                        <Badge className={getBadgeColor(task.status)}>{task.status}</Badge>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>ไม่มีงานในวันที่เลือก</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsDialogOpen(false)
                      if (selectedDate) {
                        const day = Number.parseInt(selectedDate.split("-")[2])
                        openAddTaskDialog(day)
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> เพิ่มงานใหม่
                  </Button>
                </div>
              ))}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={(e) => {
                e.preventDefault()
                setIsDialogOpen(false)
                if (selectedDate) {
                  const day = Number.parseInt(selectedDate.split("-")[2])
                  openAddTaskDialog(day)
                }
              }}
              className="bg-red-700 hover:bg-red-800"
            >
              <Plus className="h-4 w-4 mr-2" /> เพิ่มงานใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule task dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-red-700" />
              <span>เลื่อนกำหนดการ</span>
            </DialogTitle>
            <DialogDescription>
              เลื่อนกำหนดการจากวันที่ {formatDate(taskToReschedule?.originalDate || "")} เป็นวันที่{" "}
              {formatDate(newDueDate || "")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">งาน</label>
              <div className="p-2 border rounded-md bg-gray-50">{taskToReschedule?.title}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">เหตุผลในการเลื่อนกำหนด</label>
              <Textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="ระบุเหตุผลในการเลื่อนกำหนด"
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleRescheduleTask}
              className="bg-red-700 hover:bg-red-800"
              disabled={!rescheduleReason.trim()}
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
