"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import our separated components
import AppLayout from "@/components/layout/app-layout"
import TaskStatusCards from "@/components/dashboard/1.task-status-cards"
import MonthlyProgress from "@/components/dashboard/2.monthly-progress"
import TaskList from "@/components/dashboard/3.task-list"
import TaskCalendar from "@/components/dashboard/5.task-calendar"
import TaskModal from "@/components/dashboard/4.task-modal"

// Type definitions
type Task = {
  id: string
  title: string
  details: string
  dueDate?: string
  priority: "today" | "urgent" | "overdue" | "pending"
  done: boolean
}

export default function AdminNotificationPage() {
  // ===== STATE MANAGEMENT =====
  const [tasks, setTasks] = useState<Task[]>([]) // เก็บรายการงานทั้งหมด
  const [isMenuOpen, setIsMenuOpen] = useState(false) // ควบคุมการเปิด/ปิดเมนูบนมือถือ
  const [currentTime, setCurrentTime] = useState(new Date()) // เก็บเวลาปัจจุบัน
  const [expandTodo, setExpandTodo] = useState(false) // ควบคุมการแสดง modal รายการงานแบบเต็มจอ
  const [editTask, setEditTask] = useState<Task | null>(null) // เก็บข้อมูลงานที่กำลังแก้ไข
  const [activeFilter, setActiveFilter] = useState("all") // ตัวกรองสำหรับแสดงงานตามประเภท
  const [modalActiveFilter, setModalActiveFilter] = useState("all") // ตัวกรองสำหรับแสดงงานในโมดัล
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false)
  const [taskToReschedule, setTaskToReschedule] = useState<Task | null>(null)
  const [taskToReopen, setTaskToReopen] = useState<Task | null>(null)
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [reopenReason, setReopenReason] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authPassword, setAuthPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Form state for new reminder
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    frequency: "no-repeat",
    details: "",
    link: "",
    password: "",
    username: "",
    impact: "",
    hasLogin: false,
  })

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get("/api/notifications", {
          withCredentials: true,
        })

        const mappedTasks: Task[] = data.map((rawTask: any) => {
          const task = {
            id: rawTask.id,
            title: rawTask.title,
            details: rawTask.message,
            dueDate: rawTask.scheduledAt?.split("T")[0],
            done: rawTask.status === "DONE",
            priority: "pending" as const,
          }
          return updateTaskPriority(task)
        })

        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1

        const tasksInCurrentMonth = mappedTasks.filter((task) => {
          if (!task.dueDate) return false
          const [taskYear, taskMonth] = task.dueDate.split("-").map(Number)
          return taskYear === currentYear && taskMonth === currentMonth
        })

        setTasks(tasksInCurrentMonth)
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
      }
    }

    fetchNotifications()
  }, [])

  // ===== TASK MANAGEMENT FUNCTIONS =====
  // บันทึกการแก้ไขงาน
  const handleSaveEdit = () => {
    if (!editTask) return
    const updated = updateTaskPriority(editTask)
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setEditTask(null)
  }

  // อัพเดทความสำคัญของงานตามวันที่กำหนด
  const updateTaskPriority = (task: Task): Task => {
    const todayDate = new Date()
    const due = task.dueDate ? new Date(task.dueDate) : new Date()

    // เคลียร์เวลาทั้งคู่เพื่อเปรียบเทียบเฉพาะวัน
    todayDate.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffInDays = Math.floor((due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) return { ...task, priority: "overdue" } // 👈 เลยกำหนด
    if (diffInDays === 0) return { ...task, priority: "today" }
    if (diffInDays <= 3) return { ...task, priority: "urgent" }
    return { ...task, priority: "pending" }
  }

  // Function to handle rescheduling a task
  const handleRescheduleTask = () => {
    if (!taskToReschedule || !rescheduleReason.trim() || !newDueDate) return

    const updatedTask = {
      ...taskToReschedule,
      dueDate: newDueDate,
      rescheduleReason,
      rescheduleDate: new Date().toISOString(),
    }

    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
    setTaskToReschedule(null)
    setRescheduleReason("")
    setNewDueDate("")
    setIsRescheduleDialogOpen(false)
  }

  // Function to handle reopening a completed task
  const handleReopenTask = () => {
    if (!taskToReopen || !reopenReason.trim()) return

    const updatedTask = {
      ...taskToReopen,
      done: false,
      reopenReason,
      reopenDate: new Date().toISOString(),
    }

    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
    setTaskToReopen(null)
    setReopenReason("")
    setIsReopenDialogOpen(false)
  }

  // Function to open the reschedule dialog
  const openRescheduleDialog = (task: Task) => {
    setTaskToReschedule(task)
    setNewDueDate(task.dueDate || "")
    setIsRescheduleDialogOpen(true)
  }

  // Function to open the reopen dialog
  const openReopenDialog = (task: Task) => {
    setTaskToReopen(task)
    setIsReopenDialogOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add or edit task
  const handleAddTask = () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()) {
      // Show error or return
      return
    }

    // สร้างข้อมูล password จาก username และ password ถ้ามีการติ๊กช่อง hasLogin
    let passwordData = ""
    if (formData.hasLogin && (formData.username || formData.password)) {
      passwordData = `user: ${formData.username}\npassword: ${formData.password}`
    }

    if (editTask) {
      // Update existing task
      const updatedTask = {
        ...editTask,
        title: formData.title,
        details: formData.details,
        dueDate: formData.date,
      }

      const taskWithUpdatedPriority = updateTaskPriority(updatedTask)
      setTasks(tasks.map((t) => (t.id === editTask.id ? taskWithUpdatedPriority : t)))
    } else {
      // Create new task
      const newTask = {
        id: String(tasks.length + 1),
        title: formData.title,
        details: formData.details,
        dueDate: formData.date,
        done: false,
        priority: "pending" as const,
      }

      const updatedTask = updateTaskPriority(newTask)
      setTasks([...tasks, updatedTask])
    }

    setIsAddDialogOpen(false)
    setEditTask(null)
    resetForm()
  }

  // Reset form or populate with edit data
  const resetForm = () => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        date: editTask.dueDate || "",
        frequency: editTask.frequency || "no-repeat",
        details: editTask.details || "",
        link: editTask.link || "",
        password: editTask.password || "",
        username: editTask.username || "",
        impact: editTask.impact || "",
        hasLogin: editTask.hasLogin || false,
      })
    } else {
      // ตรวจสอบว่ามีการเลือกวันที่จากปฏิทินหรือไม่
      const selectedDate = window.selectedCalendarDate || ""

      setFormData({
        title: "",
        date: selectedDate,
        frequency: "no-repeat",
        details: "",
        link: "",
        password: "",
        username: "",
        impact: "",
        hasLogin: false,
      })

      // ล้างค่าวันที่ที่เลือกจากปฏิทิน
      window.selectedCalendarDate = ""
    }
  }

  // Handle authentication for viewing password
  const handleAuthenticate = () => {
    // ในระบบจริงควรมีการตรวจสอบรหัสผ่านกับ backend
    // สำหรับตัวอย่างนี้จะแสดงรหัสผ่านเมื่อกดปุ่มยืนยัน
    setIsPasswordVisible(true)
  }

  // ===== TASK STATISTICS =====
  // นับจำนวนงานตามประเภทต่างๆ
  const totalTasks = tasks.length
  const doneCount = tasks.filter((t) => t.done).length
  const incompleteCnt = totalTasks - doneCount
  const urgentTodayCount = tasks.filter((t) => ["today", "urgent"].includes(t.priority) && !t.done).length
  const overdueCount = tasks.filter((t) => t.priority === "overdue" && !t.done).length
  const otherPendingCount = tasks.filter((t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done).length
  const progressPercent = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0

  // อัพเดทข้อมูลการแจ้งเตือน
  const notifications = {
    urgentToday: urgentTodayCount,
    overdue: overdueCount,
    other: otherPendingCount,
    done: doneCount,
  }

  // สลับสถานะงานเสร็จ/ไม่เสร็จ
  const handleToggleTaskDone = async (id: string) => {
    const target = tasks.find((t) => t.id === id)
    if (!target) return

    // ถ้า tick งานเสร็จแล้ว → reopen dialog เหมือนเดิม
    if (target.done) {
      openReopenDialog(target)
      return
    }

    try {
      // In a real application, you would update the task status in your API
      // await axios.patch(
      //   `/api/notifications/${id}`,
      //   {
      //     status: "DONE",
      //   },
      //   { withCredentials: true }
      // );

      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true, priority: "pending" } : t)))
    } catch (e) {
      console.error("update status fail", e)
    }
  }

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle card click to expand todo and set filter
  const handleCardClick = (filter: string) => {
    setExpandTodo(true)
    setModalActiveFilter(filter)
    setTimeout(() => {
      const el = document.getElementById(`section-${filter}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  }

  return (
    <AppLayout title="ระบบเตือนความจำ" description="จัดการงานและการแจ้งเตือนของคุณ">
      {/* ===== NOTIFICATION CARDS ===== */}
      <TaskStatusCards notifications={notifications} onCardClick={handleCardClick} />

      {/* ===== DASHBOARD MAIN CONTENT ===== */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* ===== DONUT CHART ===== */}
        <MonthlyProgress
          doneCount={doneCount}
          incompleteCnt={incompleteCnt}
          totalTasks={totalTasks}
          progressPercent={progressPercent}
          currentMonth={currentTime}
        />

        {/* ===== TO-DO LIST ===== */}
        <TaskList
          tasks={tasks}
          activeFilter={activeFilter}
          onToggleTaskDone={handleToggleTaskDone}
          onEditTask={(task) => {
            resetForm()
            setEditTask(task)
            setIsAddDialogOpen(true)
          }}
          onRescheduleTask={openRescheduleDialog}
          onAddTask={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }}
          onExpandTodo={() => {
            setExpandTodo(true)
            setModalActiveFilter("all")
          }}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* ===== FULLSCREEN MODAL ===== */}
      <TaskModal
        tasks={tasks}
        expandTodo={expandTodo}
        setExpandTodo={setExpandTodo}
        modalActiveFilter={modalActiveFilter}
        setModalActiveFilter={setModalActiveFilter}
        handleToggleTaskDone={handleToggleTaskDone}
        setEditTask={setEditTask}
        openRescheduleDialog={openRescheduleDialog}
        resetForm={resetForm}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />

      {/* ===== EDIT TASK DIALOG ===== */}
      <Dialog open={false} onOpenChange={() => {}}>
        {/* This dialog is no longer needed as we're using the Add Task Dialog for editing */}
      </Dialog>

      {/* ===== CALENDAR SECTION ===== */}
      <TaskCalendar
        tasks={tasks}
        setIsAddDialogOpen={setIsAddDialogOpen}
        setEditTask={setEditTask}
        resetForm={resetForm}
      />

      {/* ===== RESCHEDULE TASK DIALOG ===== */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-xl">เลื่อนกำหนดการ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">งาน: {taskToReschedule?.title}</label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">วันที่กำหนดเดิม: {taskToReschedule?.dueDate}</label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">วันที่กำหนดใหม่</label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">เหตุผลในการเลื่อนกำหนด</label>
              <Textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="ระบุเหตุผลในการเลื่อนกำหนด"
                className="rounded-lg min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)} className="rounded-lg">
              ยกเลิก
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white rounded-lg"
              onClick={handleRescheduleTask}
              disabled={!rescheduleReason.trim() || !newDueDate}
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== REOPEN TASK DIALOG ===== */}
      <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-xl">เปิดงานที่เสร็จสิ้นแล้ว</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">งาน: {taskToReopen?.title}</label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">เหตุผลในการเปิดงานใหม่</label>
              <Textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="ระบุเหตุผลในการเปิดงานใหม่"
                className="rounded-lg min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsReopenDialogOpen(false)} className="rounded-lg">
              ยกเลิก
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white rounded-lg"
              onClick={handleReopenTask}
              disabled={!reopenReason.trim()}
            >
              เปิดงานใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ADD TASK DIALOG ===== */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTask ? "แก้ไขงาน" : "สร้างการแจ้งเตือนใหม่"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                หัวข้องาน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="กรอกหัวข้องาน"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">
                วันที่แจ้งเตือน <span className="text-red-500">*</span>
              </Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">
                ความถี่ <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกความถี่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-repeat">เตือนไม่ทำซ้ำ</SelectItem>
                  <SelectItem value="yearly">ทุกปี</SelectItem>
                  <SelectItem value="monthly">เตือนทุกเดือน</SelectItem>
                  <SelectItem value="weekly">ทุกอาทิตย์</SelectItem>
                  <SelectItem value="daily">เตือนทุกวัน</SelectItem>
                  <SelectItem value="quarterly">ทุกไตรมาส</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="details">
                รายละเอียด <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="impact">
                ผลกระทบหากงานไม่เสร็จ <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">ลิงก์ (ถ้ามี)</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                type="url"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasLogin"
                  checked={formData.hasLogin}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      hasLogin: e.target.checked,
                    })
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="hasLogin">งานที่ต้องมีการล็อคอิน</Label>
              </div>

              {formData.hasLogin && (
                <div className="grid gap-4 mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="ระบุ username ที่ใช้ในการล็อคอิน"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="ระบุ password ที่ใช้ในการล็อคอิน"
                      type="text"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleAddTask}
              className="bg-red-600 hover:bg-red-700"
              disabled={!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()}
            >
              {editTask ? "บันทึกการเปลี่ยนแปลง" : "สร้างการแจ้งเตือน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
