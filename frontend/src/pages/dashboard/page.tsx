"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from 'axios'
import { notificationsApi } from '@/lib/real-api'
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
import type { Task } from "@/lib/types/task"

// Define API types
type APINotification = {
  id: string
  title: string
  message: string
  dueDate?: string
  scheduledAt?: string
  status: string
  rescheduleHistory?: Array<{date: string, reason: string}>
  reopenHistory?: Array<{date: string, reason: string}>
}

// ===== STATE MANAGEMENT =====
export default function AdminNotificationPage() {
  const [tasks, setTasks] = useState<Task[]>([]) // เก็บรายการงานที่แสดงในปัจจุบัน
  const [allTasks, setAllTasks] = useState<Task[]>([]) // เก็บรายการงานทั้งหมด

  // Initial state with current date
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [currentTime, setCurrentTime] = useState(now)

  const [expandTodo, setExpandTodo] = useState(false) // ควบคุมการแสดง modal รายการงานแบบเต็มจอ
  const [editTask, setEditTask] = useState<Task | null>(null) // เก็บข้อมูลงานที่กำลังแก้ไข

  // dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [modalActiveFilter, setModalActiveFilter] = useState("all")

  // form states
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    date: "",
    frequency: "no-repeat",
    impact: "",
    hasLogin: false,
    username: "",    password: "",
    link: "",
  })
  
  const [taskToReschedule, setTaskToReschedule] = useState<Task | null>(null)
  const [taskToReopen, setTaskToReopen] = useState<Task | null>(null)
  const [reopenReason, setReopenReason] = useState("")
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  
  // Load notifications on component mount only
  useEffect(() => {  const loadNotifications = async () => {
      try {
        console.log("Fetching notifications...", { selectedMonth, selectedYear })
        
        let allNotifications: APINotification[] = []
        let currentPage = 1
        let hasMorePages = true
        let retryCount = 0
        const maxRetries = 3
        const delayMs = 1000 // 1 second delay between requests
        
        while (hasMorePages && retryCount < maxRetries) {
          try {
            // Add delay between requests
            if (currentPage > 1) {
              await new Promise(resolve => setTimeout(resolve, delayMs))
            }
            
            const response = await notificationsApi.getAll(currentPage)
            console.log(`Page ${currentPage} API Response:`, response)
            
            if (!response || !response.data || !response.meta) {
              console.error("Invalid response format:", response)
              break
            }

            allNotifications = [...allNotifications, ...response.data]
            
            hasMorePages = currentPage < response.meta.totalPages
            currentPage++
            retryCount = 0 // Reset retry count on successful request
          } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 429) {
              retryCount++
              console.log(`Rate limited, retry ${retryCount}/${maxRetries}. Waiting ${delayMs}ms...`)
              await new Promise(resolve => setTimeout(resolve, delayMs))
              continue
            }
            throw err // Re-throw other errors
          }
        }
        
        console.log(`Found ${allNotifications.length} total notifications`)        // Map API response to Task format with proper date handling
        const mappedTasks = allNotifications.map((notification: APINotification) => {
          const dueDate = notification.dueDate || notification.scheduledAt?.split("T")[0]
          const task: Task = {
            id: notification.id,
            title: notification.title,
            details: notification.message,
            dueDate,
            done: notification.status === "DONE",
            priority: "pending",
            rescheduleHistory: notification.rescheduleHistory,
            reopenHistory: notification.reopenHistory
          }
          return updateTaskPriority(task)
        })

        // Store all tasks
        setAllTasks(mappedTasks)

        // Filter tasks for current month
        const tasksInCurrentMonth = mappedTasks.filter((task: Task) => {
          if (!task.dueDate) return false
          const taskDate = new Date(task.dueDate)
          const taskMonth = taskDate.getMonth() + 1 // JavaScript months are 0-based
          const taskYear = taskDate.getFullYear()
          
          console.log("Comparing dates:", {
            task: task.title,
            taskDate: task.dueDate,
            taskMonth,
            taskYear,
            selectedMonth,
            selectedYear,
            match: taskYear === selectedYear && taskMonth === selectedMonth
          })
          
          return taskYear === selectedYear && taskMonth === selectedMonth
        })
        
        console.log("Tasks in current month:", tasksInCurrentMonth)
        setTasks(tasksInCurrentMonth)
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
        if (axios.isAxiosError(err)) {
          console.error("API Error Details:", {
            status: err.response?.status,
            data: err.response?.data,
            headers: err.response?.headers
          })
        }
      }
    }
    
    loadNotifications()
  }, [selectedMonth, selectedYear])

  // Handle edit task
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        details: editTask.details || "",
        date: editTask.dueDate || "",
        frequency: (editTask.frequency as string) || "no-repeat",
        impact: editTask.impact || "",
        hasLogin: editTask.hasLogin || false,
        username: editTask.username || "",
        password: editTask.password || "",
        link: editTask.link || "",
      });
    }
  }, [editTask]);

  // ===== TASK MANAGEMENT FUNCTIONS =====
  // Set task priority based on due date
  const updateTaskPriority = (task: Task): Task => {
    if (!task.dueDate) return { ...task, priority: "pending" }

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    const due = new Date(task.dueDate)
    due.setHours(0, 0, 0, 0)

    const diffInDays = Math.floor((due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) return { ...task, priority: "overdue" } 
    if (diffInDays === 0) return { ...task, priority: "today" }
    if (diffInDays <= 3) return { ...task, priority: "urgent" }
    return { ...task, priority: "pending" }
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: "",
      details: "",
      date: "",
      frequency: "no-repeat",
      impact: "",
      hasLogin: false,
      username: "",
      password: "",
      link: "",
    })
    setNewDueDate("")
    setEditTask(null)
  }

  // Form change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Function to open reschedule dialog
  const openRescheduleDialog = (task: Task) => {
    setTaskToReschedule(task)
    setIsRescheduleDialogOpen(true)
  }

  // Function to open reopen dialog
  const openReopenDialog = (task: Task) => {
    setTaskToReopen(task)
    setIsReopenDialogOpen(true)
  }

  // Function to change month/year
  const changeMonth = (month: number, year: number) => {
    console.log("Changing month/year to:", { month, year })
    setSelectedMonth(month)
    setSelectedYear(year)
    
    // กรองข้อมูลใหม่จาก allTasks
    const filteredTasks = allTasks.filter((task: Task) => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      const taskMonth = taskDate.getMonth() + 1 // JavaScript months are 0-based
      const taskYear = taskDate.getFullYear()
      return taskYear === year && taskMonth === month
    })
    
    console.log("Filtered tasks after month change:", filteredTasks)
    setTasks(filteredTasks)
  }

  // Handler for reopening a task
  const handleReopenTask = async () => {
    if (!taskToReopen || !reopenReason.trim()) return

    try {
      const updatedTask = await notificationApi.reopenNotification(
        taskToReopen.id,
        reopenReason
      )

      setTasks(prev => prev.map(t => 
        t.id === updatedTask.id 
          ? { ...t, done: false, reopenHistory: updatedTask.reopenHistory }
          : t
      ))

      setTaskToReopen(null)
      setReopenReason("")
      setIsReopenDialogOpen(false)
    } catch (error) {
      console.error('Failed to reopen task:', error)
    }
  }

  // Handler for rescheduling a task
  const handleRescheduleTask = async () => {
    if (!taskToReschedule || !rescheduleReason.trim() || !newDueDate) return

    try {
      const updatedTask = await notificationApi.rescheduleNotification(
        taskToReschedule.id,
        newDueDate,
        rescheduleReason
      )

      setTasks(prev => prev.map(t => 
        t.id === updatedTask.id 
          ? {
              ...t,
              dueDate: updatedTask.scheduledAt?.split('T')[0],
              rescheduleHistory: updatedTask.rescheduleHistory
            }
          : t
      ))

      setTaskToReschedule(null)
      setRescheduleReason("")
      setNewDueDate("")
      setIsRescheduleDialogOpen(false)
    } catch (error) {
      console.error('Failed to reschedule task:', error)
    }
  }

  // Toggle task completion status
  const handleToggleTaskDone = async (id: string) => {
    const target = tasks.find((t) => t.id === id)
    if (!target) return

    if (target.done) {
      openReopenDialog(target)
      return
    }

    try {
      await notificationApi.updateNotificationStatus(id, 'DONE')
      
      setTasks(prev => prev.map(t => 
        t.id === id 
          ? { ...t, done: true, priority: "pending" }
          : t
      ))
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }
  // Load existing task data when editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        details: editTask.details || "",
        date: editTask.dueDate || "",
        frequency: (editTask.frequency as string) || "no-repeat",
        impact: editTask.impact || "",
        hasLogin: editTask.hasLogin || false,
        username: editTask.username || "",
        password: editTask.password || "",
        link: editTask.link || "",
      });
    }
  }, [editTask]);
  // Add or edit task
  const handleAddTask = async () => {
    if (!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()) {
      return
    }

    try {
      // Create message with all details
      const message = `${formData.details}\n\nผลกระทบ: ${formData.impact}${
        formData.hasLogin 
          ? `\n\nข้อมูลการเข้าสู่ระบบ:\nUsername: ${formData.username}\nPassword: ${formData.password}` 
          : ''
      }`

      const repeatIntervalMap = {
        'no-repeat': 0,
        'daily': 1,
        'weekly': 7,
        'monthly': 30,
        'quarterly': 90,
        'yearly': 365
      }

      if (editTask) {
        // Update existing task
        try {          await notificationsApi.update(editTask.id, {
            title: formData.title,
            message: message,
            scheduledAt: new Date(formData.date).toISOString()
          } as any); // TODO: Fix types
          
          // Update local state
          setTasks(prev => prev.map(t => 
            t.id === editTask.id 
            ? {
                ...t,
                title: formData.title,
                details: message,
                dueDate: formData.date,
                frequency: formData.frequency as Task['frequency'],
                impact: formData.impact,
                link: formData.link,
                hasLogin: formData.hasLogin,
                username: formData.username,
                password: formData.password
              }
            : t
          ))
        } catch (error) {
          console.error('Error updating notification:', error);
        }
      } else {        // Create new task
        const notification = await notificationsApi.create({
          title: formData.title,
          message,
          type: 'TODO',
          scheduledAt: new Date(formData.date).toISOString(),
          category: 'TASK',
          link: formData.link || undefined,
          urgencyDays: 3,
          repeatIntervalDays: repeatIntervalMap[formData.frequency as keyof typeof repeatIntervalMap],
          recipients: [{ type: 'ALL' }]
        } as any) // TODO: Fix types

        // Convert API response to Task format
        const newTask: Task = {
          id: notification.id,
          title: notification.title,
          details: notification.message,
          dueDate: notification.scheduledAt?.split('T')[0],
          done: false,
          priority: 'pending',
          frequency: formData.frequency as Task['frequency'],
          impact: formData.impact,
          link: formData.link,
          hasLogin: formData.hasLogin,
          username: formData.username,
          password: formData.password
        }

        setTasks(prev => [...prev, updateTaskPriority(newTask)])
      }
      
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create or update notification:', error)
    }
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
      </Dialog>      {/* ===== CALENDAR SECTION ===== */}
      <TaskCalendar
        tasks={tasks}
        setIsAddDialogOpen={setIsAddDialogOpen}
        setEditTask={setEditTask}
        resetForm={resetForm}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={changeMonth}
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
