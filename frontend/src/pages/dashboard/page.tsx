/* eslint-disable no-unused-vars */
"use client"
/* eslint-disable no-unused-vars */
import { useEffect, useState  } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { PieChart, Pie, Tooltip } from "recharts"
import {
  Bell,
  Calendar,
  Clock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Settings,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthCalendar } from "@/components/month-calendar"
import { AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
// ---------- TYPE หลังย้ายออกมา ------------
type Task = {
  id: string
  title: string
  details: string
  dueDate?: string
  priority: 'today' | 'urgent' | 'overdue' | 'pending'
 done: boolean
}



export default function AdminNotificationPage() {
  // ===== STATE MANAGEMENT =====
  // สถานะหลักสำหรับจัดการข้อมูลและ UI
 
const [tasks, setTasks] = useState<Task[]>([]) // เก็บรายการงานทั้งหมด
  const [isMenuOpen, setIsMenuOpen] = useState(false) // ควบคุมการเปิด/ปิดเมนูบนมือถือ
  const [currentTime, setCurrentTime] = useState(new Date()) // เก็บเวลาปัจจุบัน
  const [expandTodo, setExpandTodo] = useState(false) // ควบคุมการแสดง modal รายการงานแบบเต็มจอ
  const [editTask, setEditTask] = useState(null) // เก็บข้อมูลงานที่กำลังแก้ไข
  const [activeFilter, setActiveFilter] = useState("all") // ตัวกรองสำหรับแสดงงานตามประเภท
  const [modalActiveFilter, setModalActiveFilter] = useState("all") // ตัวกรองสำหรับแสดงงานในโมดัล
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false)
  const [taskToReschedule, setTaskToReschedule] = useState(null)
  const [taskToReopen, setTaskToReopen] = useState(null)
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [reopenReason, setReopenReason] = useState("")
  const [newDueDate, setNewDueDate] = useState("")

  useEffect(() => {
  // 📁 frontend/src/pages/notifications/page.tsx (หรือไฟล์ที่เรียก fetchNotifications)
const fetchNotifications = async () => {
  try {
    const { data } = await axios.get('/api/notifications', {
      withCredentials: true,
      // (ถ้าต้องการ) pagination ก็ใส่ params: { page: 1, size: 200 }
    })

    // ——————————————
    // ตรวจสอบจำนวนจริง และ ดูตัวอย่าง 5 รายการแรก
    console.log('🔔 Received notifications:', data.length)
    console.log('🔔 Sample notification:', data.slice(0, 5))
    // ——————————————

    const mappedTasks: Task[] = data.map(rawTask => {
      const task = {
        id: rawTask.id,
        title: rawTask.title,
        details: rawTask.message,
        // ถ้าใน API field ชื่อ scheduledAt ให้ split อันนี้ ถ้า dueDate ให้แก้เป็น rawTask.dueDate
        dueDate: rawTask.scheduledAt?.split('T')[0],
        done: rawTask.status === 'DONE',
        priority: 'pending' as const,
      }

      return updateTaskPriority(task)
    })

    setTasks(mappedTasks)
  } catch (err) {
    console.error('Failed to fetch notifications:', err)
  }
}

    fetchNotifications()
  }, []) // Empty deps array = run once on mount

  // ===== TASK MANAGEMENT FUNCTIONS =====
  // บันทึกการแก้ไขงาน
  const handleSaveEdit = () => {
    const updated = updateTaskPriority(editTask)
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setEditTask(null)
  }

  // อัพเดทความสำคัญของงานตามวันที่กำหนด
  const updateTaskPriority = (task) => {
    const todayDate = new Date()
    const due = new Date(task.dueDate)

    // เคลียร์เวลาทั้งคู่เพื่อเปรียบเทียบเฉพาะวัน
    todayDate.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffInDays = Math.floor((due - todayDate) / (1000 * 60 * 60 * 24))

    if (diffInDays < 0) return { ...task, priority: "overdue" } // 👈 เลยกำหนด
    if (diffInDays === 0) return { ...task, priority: "today" }
    if (diffInDays <= 2) return { ...task, priority: "urgent" }
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
  const openRescheduleDialog = (task) => {
    setTaskToReschedule(task)
    setNewDueDate(task.dueDate)
    setIsRescheduleDialogOpen(true)
  }

  // Function to open the reopen dialog
  const openReopenDialog = (task) => {
    setTaskToReopen(task)
    setIsReopenDialogOpen(true)
  }

  // ===== TASK STATISTICS =====
  // นับจำนวนงานตามประเภทต่างๆ
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

const tasksInMonth = tasks;

  const totalTasks = tasksInMonth.length;
  const doneCount = tasksInMonth.filter(t => t.done).length;
  const incompleteCnt = totalTasks - doneCount;
  const urgentTodayCount = tasksInMonth.filter(
    t => ["today", "urgent"].includes(t.priority) && !t.done
  ).length;
  const overdueCount = tasksInMonth.filter(
    t => t.priority === "overdue" && !t.done
  ).length;
  const otherPendingCount = tasksInMonth.filter(
    t => !["today", "urgent", "overdue"].includes(t.priority) && !t.done
  ).length;
  const progressPercent = totalTasks
    ? Math.round((doneCount / totalTasks) * 100)
    : 0;

  // อัพเดทข้อมูลการแจ้งเตือน
  const notifications = {
    urgentToday: urgentTodayCount,
    overdue: overdueCount,
    other: otherPendingCount,
    done: doneCount,
  };

  // ===== HELPER FUNCTIONS =====
  // แปลงเดือนเป็นภาษาไทย
  const getThaiMonthName = (date) => {
    const monthNames = [
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
    return monthNames[date.getMonth()]
  }

  // คอมโพเนนต์สำหรับแสดง tooltip ในกราฟ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0]
      const msg = name === "เสร็จแล้ว" ? `ทำแล้ว ${value} งาน` : `เหลืออีก ${value} งาน`

      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm text-gray-800">
          <div className="font-semibold">{name}</div>
          <div>{msg}</div>
        </div>
      )
    }
    return null
  }

  // สลับสถานะงานเสร็จ/ไม่เสร็จ
 const handleToggleTaskDone = async (id: string) => {
  const target = tasks.find(t => t.id === id)
  if (!target) return

  // ถ้า tick งานเสร็จแล้ว → reopen dialog เหมือนเดิม
  if (target.done) { openReopenDialog(target); return }

  try {
    await axios.patch(`/api/notifications/${id}`, {
      status: 'DONE',
    }, { withCredentials: true })

    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, done: true, priority: 'pending' } : t
    ))
  } catch (e) {
    console.error('update status fail', e)
  }
}


  // ===== SIDEBAR MENU ITEMS =====
  // แสดงรายการเมนูในแถบด้านข้าง
  const renderMenuItems = () => (
    <>
      <details className="group" open>
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
          <Bell className="h-5 w-5" />
          ระบบการแจ้งเตือน
        </summary>
        <div className="ml-4 mt-2 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
          >
            เตือนความจำ
          </Link>
          <Link to="/manage" className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors">
            ตั้งค่าการแจ้งเตือน
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            ประวัติการดำเนินการ
          </Link>
        </div>
      </details>

      <details className="group">
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
          <CheckCircle className="h-5 w-5" />
          แอดมิน
        </summary>
        <div className="ml-4 mt-2 space-y-1">
          <Link
            to="/audit-logs"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            ประวัติการดำเนินการพนักงาน
          </Link>
        </div>
      </details>

      <Link to="/settings" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors">
        <Settings className="h-5 w-5" />
        การตั้งค่า
      </Link>
    </>
  )

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const navigate = useNavigate()

const handleLogout = async () => {
  try {
    await axios.post(
      '/api/auth/logout',
      {},
      { withCredentials: true }
    )
    navigate('/login')
  } catch (err) {
    console.error('Logout failed', err)
  }
}

  return (
    <div className="flex min-h-screen bg-white font-noto">
      {/* ===== SIDEBAR (DESKTOP) ===== */}
      {/* แถบด้านข้างสำหรับการนำทางบนหน้าจอขนาดใหญ่ */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-red-800 to-red-900 text-white fixed inset-y-0 z-50">
        <div className="px-6 py-8">
          <img
            src="https://storage.googleapis.com/be8website.appspot.com/logo-scg-white.png"
            alt="SCG Logo"
            className="w-20 mb-4"
          />
          <h1 className="text-xl font-semibold">SCG Admin</h1>
          <p className="text-sm text-white/80">Reminder&nbsp;Dashboard</p>
        </div>

        <nav className="flex-1 space-y-1 px-2 pb-6 overflow-y-auto">
          <details className="group" open>
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
              <Bell className="h-5 w-5" />
              ระบบการแจ้งเตือน
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
              >
                เตือนความจำ
              </Link>
              <Link to="/manage" className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors">
                ตั้งค่าการแจ้งเตือน
              </Link>
              <Link
                to="/auditperson"
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
              >
                ประวัติการดำเนินการ
              </Link>
            </div>
          </details>

          <details className="group">
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
              <CheckCircle className="h-5 w-5" />
              แอดมิน
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              <Link
                to="/audit-logs"
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
              >
                ประวัติการดำเนินการพนักงาน
              </Link>
            </div>
          </details>

          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            <Settings className="h-5 w-5" />
            การตั้งค่า
          </Link>
        </nav>

         <button
   onClick={handleLogout}
   className="m-6 flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200"
 >
   <LogOut className="mr-2 h-5 w-5" />
  ออกจากระบบ
 </button>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      {/* ส่วนหัวสำหรับมือถือพร้อมปุ่มแฮมเบอร์เกอร์ */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-b from-red-800 to-red-900 text-white flex items-center justify-between px-4 py-4 shadow z-50">
        <div className="font-bold text-lg">SCG Admin</div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold">
            SG
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {/* เมนูสำหรับมือถือที่แสดงเมื่อกดปุ่มแฮมเบอร์เกอร์ */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-64 h-full bg-gradient-to-b from-red-800 to-red-900 text-white z-40 shadow-lg p-3 overflow-y-auto">
          <nav className="space-y-1">{renderMenuItems()}</nav>

           <button
   onClick={handleLogout}
  className="mt-6 w-full flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200"
 >
    <LogOut className="mr-2 h-5 w-5" />
    Logout
  </button>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-20 w-full">
        {/* ===== DESKTOP HEADER ===== */}
        {/* ส่วนหัวสำหรับเดสก์ท็อป */}
        <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 ml-64">
            <div>
              <h1 className="text-xl font-bold text-gray-800">ระบบเตือนความจำ</h1>
              <p className="text-sm text-gray-500">Manage your tasks and notifications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-600">
                <div>
                  {currentTime.toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="font-bold text-lg">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                  น.
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                SG
              </div>
            </div>
          </div>
        </header>

        {/* ===== MOBILE HEADER ===== */}
        {/* ส่วนหัวสำหรับมือถือ */}
        <header className="block md:hidden bg-white border-b shadow-sm w-full top-14 z-30">
          <div className="flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-800">ระบบเตือนความจำ</h1>
                <p className="text-xs text-gray-500">Manage your tasks and notifications</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="font-bold text-sm">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  น.
                </div>
              </div>
              <Link
                to="/mobile"
                className="ml-2 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                มือถือ
              </Link>
            </div>
          </div>
        </header>

        {/* ===== NOTIFICATION CARDS ===== */}
        {/* การ์ดแสดงสถานะงานประเภทต่างๆ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          {/* กล่อง: งานเลยกำหนด */}
          <Card
            onClick={() => {
              setExpandTodo(true)
              setModalActiveFilter("overdue") // ตั้งค่าฟิลเตอร์ในโมดัลเป็น "overdue"
              setTimeout(() => {
                const el = document.getElementById("section-overdue")
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
              }, 300)
            }}
            className="cursor-pointer border-l-4 border-red-600 bg-red-50 hover:scale-[1.02] duration-300 hover:shadow-md"
          >
            <CardHeader className="pb-2 ">
              <CardTitle className="text-lg font-medium text-red-800 ">งานเลยกำหนด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                  <AlertTriangle className="text-red-700 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{notifications.overdue} งาน</p>
                  <p className="text-sm text-red-600">งานที่เลยกำหนดแล้ว</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-end">
                  <button className="text-xs text-red-700 hover:underline">View details &gt;</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* กล่อง: งานด่วนวันนี้ */}
          <Card
            onClick={() => {
              setExpandTodo(true)
              setModalActiveFilter("urgent") // ตั้งค่าฟิลเตอร์ในโมดัลเป็น "urgent"
              setTimeout(() => {
                const el = document.getElementById("section-urgent")
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
              }, 300)
            }}
            className="cursor-pointer border-l-4 border-orange-600 bg-orange-50 hover:scale-[1.02] duration-300 hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-orange-800">งานด่วน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                  <AlertCircle className="text-orange-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">{notifications.urgentToday} งาน</p>
                  <p className="text-sm text-orange-600">งานที่ต้องทำด่วน</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-end">
                  <button className="text-xs text-orange-700 hover:underline">View details &gt;</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* กล่อง: งานอื่นๆ */}
          <Card
            onClick={() => {
              setExpandTodo(true)
              setModalActiveFilter("normal") // ตั้งค่าฟิลเตอร์ในโมดัลเป็น "normal"
              setTimeout(() => {
                const el = document.getElementById("section-other")
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
              }, 300)
            }}
            className="cursor-pointer border-l-4 border-blue-500 bg-blue-50 hover:scale-[1.02] duration-300 hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">งานอื่นๆ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Clock className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{notifications.other} งาน</p>
                  <p className="text-sm text-gray-500">รายการที่เหลืออยู่</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-end">
                  <button className="text-xs text-blue-600 hover:underline">View details &gt;</button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* กล่อง: งานที่เสร็จแล้ว */}
          <Card
            onClick={() => {
              setExpandTodo(true)
              setModalActiveFilter("completed") // ตั้งค่าฟิลเตอร์ในโมดัลเป็น "completed"
              setTimeout(() => {
                const el = document.getElementById("section-done")
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
              }, 300)
            }}
            className="cursor-pointer border-l-4 border-green-500 bg-green-50 hover:scale-[1.02] duration-300 hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-green-800">งานที่เสร็จแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <CheckCircle2 className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{notifications.done} งาน</p>
                  <p className="text-sm text-gray-500">งานที่ทำเสร็จแล้ว</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-end">
                  <button className="text-xs text-green-600 hover:underline">View details &gt;</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== DASHBOARD MAIN CONTENT ===== */}
        {/* ส่วนหลักของแดชบอร์ดแสดงกราฟและรายการงาน */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* ===== DONUT CHART ===== */}
          {/* กราฟวงกลมแสดงความคืบหน้าของงาน */}
          <section className="relative isolate w-full md:w-1/3 overflow-hidden rounded-3xl border border-gray-100/70 bg-white/70 backdrop-blur-sm shadow-xl ring-1 ring-black/5 transition hover:scale-[1.02] duration-300 md:flex md:flex-col">
            {/* light gradient tint */}
            <div className="absolute inset-0 pointer-events-none" />
            <div className="relative z-10 p-6 flex-1 flex flex-col">
              {/* Heading */}
              <h2 className="mb-4 text-center text-xl font-bold tracking-tight text-gray-800">
                สรุปความคืบหน้างานเดือน : {getThaiMonthName(new Date())}
              </h2>

              {/* Donut chart - ปรับให้ขยายตามพื้นที่ */}
              <div className="relative mx-auto flex flex-1 items-center justify-center w-full">
                <PieChart width={200} height={200} className="mx-auto">
                  {/* ✅ วาดสีเทาก่อน (พื้นหลัง) */}
                  <Pie
                    data={[{ name: "ยังไม่เสร็จ", value: incompleteCnt }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    cornerRadius={50}
                    dataKey="value"
                    stroke="none"
                    fill="#e5e7eb"
                  />

                  {/* ✅ วาดวงเขียวซ้อนทับหลังสุด (ความคืบหน้า) */}
                  <Pie
                    data={[{ name: "เสร็จแล้ว", value: doneCount }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={90 - (360 * doneCount) / (totalTasks || 1)}
                    cornerRadius={50}
                    dataKey="value"
                    stroke="none"
                    fill="#96231e"
                  />

                  {/* Tooltip */}
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} position={{ y: 90 }} />
                </PieChart>

                {/* Center label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{progressPercent}%</span>
                  <span className="mt-1 text-xs">
                    {doneCount} จาก {totalTasks} งาน
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center gap-8 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="block h-3 w-3 rounded-full bg-gradient-to-b from-red-800 to-red-900" />
                  เสร็จแล้ว
                </div>
                <div className="flex items-center gap-2">
                  <span className="block h-3 w-3 rounded-full bg-gray-300" />
                  ยังไม่เสร็จ
                </div>
              </div>
            </div>
          </section>

          {/* ===== TO-DO LIST ===== */}
          {/* รายการงานที่ต้องทำ */}
          <section className="w-full md:w-2/3 rounded-[20px] border border-gray-100 bg-white shadow-sm backdrop-blur-sm shadow-xl ring-1 ring-black/5 transition hover:scale-[1.02] transition duration-300 shadow-md">
            <div className="p-6 ">
              <div className="flex justify-between items-center mb-4 ">
                <h2 className="text-lg font-bold text-gray-800">สิ่งที่ต้องทำ</h2>
                <Link to="/manage" className="flex items-center gap-1 text-sm text-red-700 hover:text-red-800">
                  <Bell className="h-4 w-4" />
                  จัดการการแจ้งเตือน
                </Link>
              </div>

              {/* ===== FILTER TABS ===== */}
              {/* แท็บสำหรับกรองประเภทงาน - แก้ไขลำดับให้งานเลยกำหนดอยู่ก่อนงานด่วน */}
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === "all"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setActiveFilter("overdue")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === "overdue"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  เลยกำหนด
                </button>
                <button
                  onClick={() => setActiveFilter("urgent")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === "urgent"
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  งานด่วน
                </button>
                <button
                  onClick={() => setActiveFilter("normal")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === "normal"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  งานอื่นๆ
                </button>
                <button
                  onClick={() => setActiveFilter("completed")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeFilter === "completed"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  เสร็จแล้ว
                </button>
              </div>

              {/* ===== TASK LIST ===== */}
              {/* รายการงานที่แสดงตามการกรอง */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {/* แสดงงานเลยกำหนดเมื่อกรอง all หรือ overdue */}
                {(activeFilter === "all" || activeFilter === "overdue") && (
                  <>
                    {tasks.filter((t) => t.priority === "overdue" && !t.done).length > 0 ? (
                      <>
                        {activeFilter === "all" && (
                          <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" /> งานเลยกำหนด
                          </h3>
                        )}
                        {tasks
                          .filter((t) => t.priority === "overdue" && !t.done)
                          .map((task, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTaskDone(task.id)}
                                className="h-5 w-5 text-red-700 rounded-md"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p
                                    className={`text-sm font-medium ${
                                      task.done ? "line-through text-gray-400" : "text-gray-800"
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700 font-medium">
                                    เลยกำหนด
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{task.details}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditTask(task)}
                                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openRescheduleDialog(task)
                                      }}
                                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      เลื่อนกำหนด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      activeFilter === "overdue" && (
                        <div className="text-center py-6 text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                            <CheckCircle2 className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm">ไม่มีงานที่เลยกำหนด</p>
                        </div>
                      )
                    )}
                  </>
                )}

                {/* แสดงงานด่วนเมื่อกรอง all หรือ urgent */}
                {(activeFilter === "all" || activeFilter === "urgent") && (
                  <>
                    {tasks.filter((t) => ["today", "urgent"].includes(t.priority) && !t.done).length > 0 ? (
                      <>
                        {activeFilter === "all" && (
                          <h3 className="text-sm font-semibold text-orange-700 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" /> งานด่วน
                          </h3>
                        )}
                        {tasks
                          .filter((t) => ["today", "urgent"].includes(t.priority) && !t.done)
                          .map((task, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTaskDone(task.id)}
                                className="h-5 w-5 text-orange-600 rounded-md"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p
                                    className={`text-sm font-medium ${
                                      task.done ? "line-through text-gray-400" : "text-gray-800"
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700 font-medium">
                                    {task.priority === "urgent" ? "กำลังจะมาถึง" : "วันนี้"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{task.details}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditTask(task)}
                                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openRescheduleDialog(task)
                                      }}
                                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      เลื่อนกำหนด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      activeFilter === "urgent" && (
                        <div className="text-center py-6 text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                            <CheckCircle2 className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm">ไม่มีงานด่วนที่ต้องทำ</p>
                        </div>
                      )
                    )}
                  </>
                )}

                {/* ===== NORMAL TASKS ===== */}
                {/* แสดงงานอื่นๆเมื่อกรอง all หรือ normal */}
                {(activeFilter === "all" || activeFilter === "normal") && (
                  <>
                    {tasks.filter((t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done).length > 0 ? (
                      <>
                        {activeFilter === "all" && (
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center mt-4">
                            <Clock className="h-4 w-4 mr-1" /> งานอื่นๆ
                          </h3>
                        )}
                        {tasks
                          .filter((t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done)
                          .map((task, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTaskDone(task.id)}
                                className="h-5 w-5 text-gray-700 rounded-md"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p
                                    className={`text-sm font-medium ${
                                      task.done ? "line-through text-gray-400" : "text-gray-800"
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 font-medium">
                                    ปกติ
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{task.details}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditTask(task)}
                                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        openRescheduleDialog(task)
                                      }}
                                      className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      เลื่อนกำหนด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      activeFilter === "normal" && (
                        <div className="text-center py-6 text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                            <CheckCircle2 className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm">ไม่มีงานอื่นๆ ที่ต้องทำ</p>
                        </div>
                      )
                    )}
                  </>
                )}

                {/* ===== COMPLETED TASKS ===== */}
                {/* แสดงงานที่เสร็จแล้วเมื่อกรอง all หรือ completed */}
                {(activeFilter === "all" || activeFilter === "completed") && (
                  <>
                    {tasks.filter((t) => t.done).length > 0 ? (
                      <>
                        {activeFilter === "all" && (
                          <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center mt-4">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> งานที่เสร็จแล้ว
                          </h3>
                        )}
                        {tasks
                          .filter((t) => t.done)
                          .map((task, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => handleToggleTaskDone(task.id)}
                                className="h-5 w-5 text-green-700 rounded-md"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium line-through text-gray-400">{task.title}</p>
                                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 font-medium">
                                    เสร็จแล้ว
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 line-through">{task.details}</p>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditTask(task)}
                                      className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded border border-gray-200"
                                    >
                                      ดูรายละเอียด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </>
                    ) : (
                      activeFilter === "completed" && (
                        <div className="text-center py-6 text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                            <CheckCircle2 className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm">ยังไม่มีงานที่เสร็จแล้ว</p>
                        </div>
                      )
                    )}
                  </>
                )}

                {/* ===== EMPTY STATE ===== */}
                {/* แสดงเมื่อไม่มีงานในทุกหมวดหมู่ */}
                {activeFilter === "all" &&
                  tasks.filter((t) => !t.done).length === 0 &&
                  tasks.filter((t) => t.done).length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                        <CheckCircle2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p>ไม่มีงานในระบบ</p>
                    </div>
                  )}
              </div>

              {/* ===== VIEW ALL BUTTON ===== */}
              {/* ปุ่มดูรายการทั้งหมด */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setExpandTodo(true)
                    setModalActiveFilter("all") // รีเซ็ตฟิลเตอร์ในโมดัลเมื่อเปิดใหม่
                  }}
                  className="text-sm text-red-700 hover:text-red-800 font-medium flex items-center justify-center mx-auto"
                >
                  ดูรายการทั้งหมด
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ===== FULLSCREEN MODAL ===== */}
        {/* โมดัลแสดงรายการงานแบบเต็มจอ */}
        <AnimatePresence>
          {expandTodo && (
            <motion.div
              key="todoModal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
              onClick={() => setExpandTodo(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.98, y: 10 }}
                transition={{
                  duration: 0.25,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[20px] shadow-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ===== MODAL HEADER ===== */}
                {/* ส่วนหัวของโมดัล */}
                <div className="sticky top-0 bg-white border-b z-10 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">รายการแจ้งเตือนทั้งหมด</h2>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/manage"
                      className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      จัดการการแจ้งเตือน
                    </Link>
                    <button
                      onClick={() => setExpandTodo(false)}
                      className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ===== MODAL TABS ===== */}
                {/* แท็บในโมดัล - แก้ไขลำดับให้งานเลยกำหนดอยู่ก่อนงานด่วน และเปลี่ยนชื่อ "งานปกติ" เป็น "งานอื่นๆ" */}
                <div className="px-6 pt-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setModalActiveFilter("all")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        modalActiveFilter === "all"
                          ? "bg-red-50 text-red-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      onClick={() => setModalActiveFilter("overdue")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        modalActiveFilter === "overdue"
                          ? "bg-red-50 text-red-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      เลยกำหนด
                    </button>
                    <button
                      onClick={() => setModalActiveFilter("urgent")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        modalActiveFilter === "urgent"
                          ? "bg-orange-50 text-orange-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      งานด่วน
                    </button>
                    <button
                      onClick={() => setModalActiveFilter("normal")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        modalActiveFilter === "normal"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      งานอื่นๆ
                    </button>
                    <button
                      onClick={() => setModalActiveFilter("completed")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        modalActiveFilter === "completed"
                          ? "bg-green-50 text-green-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      เสร็จแล้ว
                    </button>
                  </div>
                </div>

                {/* ===== MODAL CONTENT ===== */}
                {/* เนื้อหาในโมดัล */}
                <div className="overflow-y-auto p-6 max-h-[calc(85vh-120px)] space-y-6">
                  {/* งานเลยกำหนด - แสดงก่อนงานด่วน */}
                  {(modalActiveFilter === "all" || modalActiveFilter === "overdue") && (
                    <div id="section-overdue" className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-red-700 to-red-800 text-white px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <h3 className="font-medium">งานเลยกำหนด</h3>
                        </div>
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                          {tasks.filter((t) => t.priority === "overdue" && !t.done).length} งาน
                        </span>
                      </div>

                      <div className="bg-white divide-y divide-gray-100">
                        {tasks.filter((t) => t.priority === "overdue" && !t.done).length > 0 ? (
                          tasks
                            .filter((t) => t.priority === "overdue" && !t.done)
                            .map((task, i) => (
                              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="pt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={task.done}
                                      onChange={() => handleToggleTaskDone(task.id)}
                                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-600"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-semibold text-gray-900 truncate pr-2">{task.title}</h4>
                                      <span className="text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                        เลยกำหนด
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{task.details}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                      </p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setEditTask(task)}
                                          className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          แก้ไข
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openRescheduleDialog(task)
                                          }}
                                          className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          เลื่อนกำหนด
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                              <CheckCircle2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p>ไม่มีงานที่เลยกำหนด</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== URGENT TASKS SECTION ===== */}
                  {/* ส่วนแสดงงานด่วน */}
                  {(modalActiveFilter === "all" || modalActiveFilter === "urgent") && (
                    <div id="section-urgent" className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          <h3 className="font-medium">งานด่วน</h3>
                        </div>
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                          {tasks.filter((t) => ["today", "urgent"].includes(t.priority) && !t.done).length} งาน
                        </span>
                      </div>

                      <div className="bg-white divide-y divide-gray-100">
                        {tasks.filter((t) => ["today", "urgent"].includes(t.priority) && !t.done).length > 0 ? (
                          tasks
                            .filter((t) => ["today", "urgent"].includes(t.priority) && !t.done)
                            .map((task, i) => (
                              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="pt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={task.done}
                                      onChange={() => handleToggleTaskDone(task.id)}
                                      className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-600"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-semibold text-gray-900 truncate pr-2">{task.title}</h4>
                                      <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                        {task.priority === "urgent" ? "ใกล้ถึง" : "วันนี้"}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{task.details}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                      </p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setEditTask(task)}
                                          className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          แก้ไข
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openRescheduleDialog(task)
                                          }}
                                          className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          เลื่อนกำหนด
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                              <CheckCircle2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p>ไม่มีงานด่วนที่ต้องทำในวันนี้</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== OTHER TASKS SECTION ===== */}
                  {/* ส่วนแสดงงานอื่นๆ */}
                  {(modalActiveFilter === "all" || modalActiveFilter === "normal") && (
                    <div id="section-other" className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          <h3 className="font-medium">งานอื่นๆ</h3>
                        </div>
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                          {tasks.filter((t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done).length}{" "}
                          งาน
                        </span>
                      </div>

                      <div className="bg-white divide-y divide-gray-100">
                        {tasks.filter((t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done).length >
                        0 ? (
                          tasks
                            .filter((t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done)
                            .map((task, i) => (
                              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="pt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={task.done}
                                      onChange={() => handleToggleTaskDone(task.id)}
                                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-semibold text-gray-900 truncate pr-2">{task.title}</h4>
                                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                        งานอื่นๆ
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{task.details}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                      </p>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setEditTask(task)}
                                          className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          แก้ไข
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            openRescheduleDialog(task)
                                          }}
                                          className="text-xs px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                        >
                                          เลื่อนกำหนด
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                              <CheckCircle2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p>ไม่มีงานอื่นๆ ที่ต้องทำ</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== COMPLETED TASKS SECTION ===== */}
                  {/* ส่วนแสดงงานที่เสร็จแล้ว */}
                  {(modalActiveFilter === "all" || modalActiveFilter === "completed") && (
                    <div id="section-done" className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <h3 className="font-medium">งานที่เสร็จแล้ว</h3>
                        </div>
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                          {tasks.filter((t) => t.done).length} งาน
                        </span>
                      </div>

                      <div className="bg-white divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                        {tasks.filter((t) => t.done).length > 0 ? (
                          tasks
                            .filter((t) => t.done)
                            .map((task, i) => (
                              <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="pt-0.5">
                                    <input
                                      type="checkbox"
                                      checked={task.done}
                                      onChange={() => handleToggleTaskDone(task.id)}
                                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-600"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium text-gray-400 line-through truncate pr-2">
                                        {task.title}
                                      </h4>
                                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                        เสร็จแล้ว
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-400 line-through">{task.details}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                      <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" /> กำหนด: {task.dueDate}
                                      </p>
                                      <button
                                        onClick={() => setEditTask(task)}
                                        className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                      >
                                        ดูรายละเอียด
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-10 text-gray-500">
                            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                              <CheckCircle2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p>ยังไม่มีงานที่เสร็จแล้ว</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== EDIT TASK DIALOG ===== */}
        {/* ไดอะล็อกสำหรับแก้ไขงาน */}
        <Dialog open={!!editTask} onOpenChange={() => setEditTask(null)}>
          <DialogContent className="sm:max-w-[500px] rounded-[20px]">
            <DialogHeader>
              <DialogTitle className="text-xl">แก้ไขงาน</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ชื่องาน</label>
                <Input
                  value={editTask?.title || ""}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  placeholder="ชื่องาน"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">รายละเอียด</label>
                <Textarea
                  value={editTask?.details || ""}
                  onChange={(e) => setEditTask({ ...editTask, details: e.target.value })}
                  placeholder="รายละเอียด"
                  className="rounded-lg min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">วันที่กำหนด</label>
                <Input
                  type="date"
                  value={editTask?.dueDate || ""}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                  className="rounded-lg"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setEditTask(null)} className="rounded-lg">
                ยกเลิก
              </Button>
              <Button className="bg-red-700 hover:bg-red-800 text-white rounded-lg" onClick={handleSaveEdit}>
                บันทึกการเปลี่ยนแปลง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== CALENDAR SECTION ===== */}
        {/* ส่วนแสดงปฏิทินงาน */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:scale-[1.02] duration-300">
          <Card>
            <CardContent className="p-6">
              <MonthCalendar tasks={tasks} />
            </CardContent>
          </Card>
        </div>
      </main>
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
    </div>
  )
}
