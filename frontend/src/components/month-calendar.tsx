"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Filter, Plus, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

export function MonthCalendar({ tasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    details: "",
    dueDate: "",
    priority: "normal",
  })
  const [draggedTask, setDraggedTask] = useState(null)
  const [allTasks, setAllTasks] = useState(tasks)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [taskToReschedule, setTaskToReschedule] = useState(null)
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [newDueDate, setNewDueDate] = useState("")

  // Sync tasks prop with internal state
  useEffect(() => {
    setAllTasks(tasks)
  }, [tasks])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

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
            ? "งานด่วน"
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

  const getTaskBgColor = (status: string) => {
    switch (status) {
      case "เลยกำหนด":
        return "bg-red-100 text-red-700"
      case "งานด่วน":
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
        return {
          ...task,
          dueDate: newDueDate,
          rescheduleReason,
          rescheduleDate: new Date().toISOString(),
        }
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
    if (!newTask.title.trim() || !newTask.dueDate) return

    const newTaskObj = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      details: newTask.details,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      done: false,
    }

    setAllTasks([...allTasks, newTaskObj])
    setNewTask({ title: "", details: "", dueDate: "", priority: "normal" })
    setIsAddTaskOpen(false)
  }

  const openAddTaskDialog = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setNewTask({ ...newTask, dueDate: dateStr })
    setIsAddTaskOpen(true)
  }

  return (
    <div className="w-full ">
      <div className="flex justify-between items-center mb-6 ">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">ปฏิทินงาน</h3>
          <p className="text-sm text-gray-500">ดูงานทั้งหมดสำหรับเดือน {thaiMonths[month]}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 md:h-10 md:w-10">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 md:h-10 md:w-10">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="hidden md:flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            <span>ตัวกรอง</span>
          </Button>
        </div>
      </div>

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
        <div className="grid grid-cols-7 grid-rows-5 gap-px bg-gray-100 hovar:bg-gray-50">
          {/* Empty cells before first day of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-white text-gray-300 ">
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
                className={`min-h-[100px] p-2 bg-white ${isToday ? "bg-red-50 border border-red-200" : ""} relative group cursor-pointer `}
                onClick={() => handleDayClick(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${isToday ? "text-red-700" : ""}`}>{day}</span>
                </div>

                {tasks.length > 0 && (
                  <div className="mt-2">
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
                    {tasks.length > 2 && (
                      <div className="text-[10px] text-gray-500 font-medium">+ {tasks.length - 2} อื่นๆ</div>
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

      {/* Task details dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] rounded-xl ">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center ">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-red-700 " />
                <span className="text-base md:text-lg">งานวันที่ {formatDate(selectedDate || "")}</span>
              </div>
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
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
                        setNewTask({ ...newTask, dueDate: selectedDate })
                        setIsAddTaskOpen(true)
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
                  setNewTask({ ...newTask, dueDate: selectedDate })
                  setIsAddTaskOpen(true)
                }
              }}
              className="bg-red-700 hover:bg-red-800"
            >
              <Plus className="h-4 w-4 mr-2" /> เพิ่มงานใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add task dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] rounded-xl ">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 ">
              <Plus className="h-5 w-5 text-red-700" />
              <span>เพิ่มงานใหม่</span>
            </DialogTitle>
            <DialogDescription>เพิ่มงานใหม่สำหรับวันที่ {formatDate(newTask.dueDate)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่องาน</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="ระบุชื่องาน"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">รายละเอียด</label>
              <Textarea
                value={newTask.details}
                onChange={(e) => setNewTask({ ...newTask, details: e.target.value })}
                placeholder="รายละเอียดงาน (ถ้ามี)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ความสำคัญ</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              >
                <option value="normal">ปกติ</option>
                <option value="today">วันนี้</option>
                <option value="urgent">ด่วน</option>
                <option value="overdue">เลยกำหนด</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddTask} className="bg-red-700 hover:bg-red-800">
              เพิ่มงาน
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
