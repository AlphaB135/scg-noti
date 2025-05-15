"use client"

import type React from "react"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/app-layout"
import ReminderFilter from "@/components/manage-reminder/1.reminder-filter"
import ReminderTabs from "@/components/manage-reminder/2.reminder-tabs"
import AddReminderDialog from "@/components/manage-reminder/3.add-reminder-dialog"
import EditReminderDialog from "@/components/manage-reminder/4.edit-reminder-dialog"
import DeleteReminderDialog from "@/components/manage-reminder/5.delete-reminder-dialog"
import PasswordDialog from "@/components/manage-reminder/6.password-dialog"
import {
  checkIsUrgent,
  formatThaiDate,
  getDueDateStatus,
  getFrequencyText,
  getStatusBadge,
  getTypeIcon,
} from "@/components/manage-reminder/7.reminder-utils"

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

export default function ManageReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [cycleReminders, setCycleReminders] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [hasLogin, setHasLogin] = useState(false)
  const [isEditPasswordAuthenticated, setIsEditPasswordAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Form state for new/edit reminder
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
    // 2.1) ดึงงาน manual
    const fetchManualReminders = async () => {
      try {
        // คอมเม้น API ไว้ก่อน
        // const { data } = await axios.get("/api/notifications", {
        //   withCredentials: true,
        //   params: { skip: 0, take: 100 },
        // })

        // Get today's date for urgent tasks
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate date for 3 days from now
        const threeDaysFromNow = new Date(today)
        threeDaysFromNow.setDate(today.getDate() + 3)

        // Format dates for mock data
        const todayStr = today.toISOString().split("T")[0]
        const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0]
        const dayAfterTomorrowStr = new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0]

        // Mock data สำหรับการแจ้งเตือนแบบ manual
        const mockManualReminders = [
          {
            id: 1,
            title: "ต่อสัญญาเช่าสำนักงาน",
            date: "2025-06-15",
            frequency: "no-repeat",
            details: "ติดต่อตัวแทนอสังหาริมทรัพย์เพื่อต่อสัญญาเช่าสำนักงานสาขาบางนา",
            link: "https://scg-property.com/contracts",
            password: "user: property_admin\npassword: SCGprop2025!",
            impact: "หากไม่ต่อสัญญาภายในกำหนด อาจต้องจ่ายค่าปรับ 15% หรือสูญเสียพื้นที่สำนักงาน",
            status: "incomplete",
            type: "document",
          },
          {
            id: 2,
            title: "ชำระภาษีประจำปี",
            date: "2025-05-30",
            frequency: "yearly",
            details: "ชำระภาษีนิติบุคคลประจำปี 2025 ผ่านระบบกรมสรรพากร",
            link: "https://www.rd.go.th/",
            password: "user: scg_tax\npassword: Tax2025@SCG\nรหัส OTP จะส่งไปที่เบอร์ 08x-xxx-xxxx (คุณสมศักดิ์)",
            impact: "หากชำระล่าช้าจะมีค่าปรับ 1.5% ต่อเดือน และอาจส่งผลต่อการตรวจสอบบัญชีประจำปี",
            status: "incomplete",
            type: "finance",
          },
          {
            id: 3,
            title: "ประชุมคณะกรรมการบริษัท",
            date: "2025-05-20",
            frequency: "no-repeat",
            details: "ประชุมคณะกรรมการบริษัทประจำเดือนพฤษภาคม ห้องประชุมใหญ่ ชั้น 15",
            link: "https://scg-meeting.zoom.us/j/123456789",
            password: "Meeting ID: 123 456 789\nPasscode: SCG2025",
            impact: "การไม่จัดประชุมตามกำหนดอาจส่งผลต่อการตัดสินใจเชิงกลยุทธ์และการดำเนินงานของบริษัท",
            status: "incomplete",
            type: "meeting",
          },
          {
            id: 4,
            title: "ตรวจสอบและบำรุงรักษาเครื���องจักร",
            date: "2025-05-10",
            frequency: "no-repeat",
            details: "ตรวจสอบและบำรุงรักษาเครื่องจักรในสายการผลิต A ตามแผนการบำรุงรักษาเชิงป้องกัน",
            link: "",
            password: "",
            impact: "หากไม่ดำเนินการตามแผน อาจทำให้เครื่องจักรเสียหายและกระทบต่อการผลิต ทำให้ส่งมอบสินค้าล่าช้า",
            status: "completed",
            type: "maintenance",
          },
          {
            id: 5,
            title: "ส่งรายงานความยั่งยืน",
            date: "2025-07-15",
            frequency: "monthly",
            details: "จัดทำและส่งรายงานความยั่งยืนประจำไตรมาสที่ 2 ปี 2025 ให้กับตลาดหลักทรัพย์",
            link: "https://scg-sustainability.com/reports",
            password: "user: report_admin\npassword: Sus@SCG2025",
            impact: "การไม่ส่งรายงานตามกำหนดอาจส่งผลต่อความน่าเชื่อถือและภาพลักษณ์ของบริษัทในด้านความยั่งยืน",
            status: "incomplete",
            type: "report",
          },
          {
            id: 6,
            title: "อบรมความปลอดภัยในการทำงาน",
            date: "2025-06-05",
            frequency: "yearly",
            details: "จัดอบรมความปลอดภัยในการทำงานประจำปีให้กับพนักงานทุกคนตามข้อกำหนด ISO 45001",
            link: "https://scg-training.com/safety2025",
            password: "user: training_admin\npassword: Safety2025!",
            impact: "การไม่จัดอบรมตามกำหนดอาจส่งผลต่อการรับรองมาตรฐาน ISO และความปลอดภัยของพนักงาน",
            status: "incomplete",
            type: "training",
          },
          {
            id: 7,
            title: "สั่งซื้อวัตถุดิบหลัก",
            date: "2025-05-25",
            frequency: "monthly",
            details: "สั่งซื้อวัตถุดิบหลักสำหรับการผลิตเดือนมิถุนายน 2025 จากซัพพลายเออร์หลัก",
            link: "https://scg-procurement.com",
            password: "user: procurement_manager\npassword: Proc@SCG2025\nรหัสอนุมัติ: 7890-ABCD",
            impact: "การสั่งซื้อล่าช้าอาจทำให้วัตถุดิบไม่เพียงพอต่อการผลิต ส่งผลให้ไม่สามารถส่งมอบสินค้าได้ตามกำหนด",
            status: "incomplete",
            type: "purchase",
          },
          // เพิ่มงานด่วน 2 งาน
          {
            id: 8,
            title: "ส่งเอกสารประมูลโครงการใหม่",
            date: todayStr, // วันนี้
            frequency: "no-repeat",
            details: "จัดเตรียมและส่งเอกสารประมูลโครงการก่อสร้างสาขาใหม่ภายในวันนี้",
            link: "https://scg-bidding.com/projects",
            password: "user: bid_manager\npassword: Bid2025!",
            impact: "หากไม่ส่งเอกสารภายในวันนี้ บริษัทจะหมดสิทธิ์ในการเข้าร่วมประมูลโครงการมูลค่า 50 ล้านบาท",
            status: "incomplete",
            type: "document",
            isUrgent: true,
          },
          {
            id: 9,
            title: "ตรวจสอบระบบความปลอดภัยหลังเหตุการณ์น้ำรั่ว",
            date: tomorrowStr, // พรุ่งนี้
            frequency: "no-repeat",
            details: "ตรวจสอบระบบความปลอดภัยและความเสียหายหลังเหตุการณ์น้ำรั่วในโรงงานเมื่อวานนี้",
            link: "",
            password: "",
            impact: "หากไม่ตรวจสอบและแก้ไขอย่างเร่งด่วน อาจเกิดความเสียหายต่อเครื่องจักรและระบบไฟฟ้าเพิ่มเติม",
            status: "incomplete",
            type: "maintenance",
            isUrgent: true,
          },
        ]

        setReminders(mockManualReminders)
      } catch (e) {
        console.error("Failed to load manual reminders", e)
      }
    }

    // 2.2) ดึงงาน cycle
    const fetchCycleReminders = async () => {
      try {
        // คอมเม้น API ไว้ก่อน
        // const { data } = await axios.get("/api/notifications/cycles", {
        //   withCredentials: true,
        //   params: { skip: 0, take: 100 },
        // })

        // Mock data สำหรับการแจ้งเตือนแบบ cycle
        const mockCycleReminders = [
          {
            id: 101,
            title: "อัปเดตข้อมูลความปลอดภัยระบบ IT",
            message: "ตรวจสอบและอัปเดตระบบความปลอดภัย IT ตามนโยบายความปลอดภัยข้อมูล",
            scheduledAt: "2025-05-18T09:00:00",
            frequency: "monthly",
            status: "incomplete",
            type: "data",
          },
          {
            id: 102,
            title: "ส่งรายงานยอดขายประจำวัน",
            message: "รวบรวมและส่งรายงานยอดขายประจำวันให้ผู้บริหาร",
            scheduledAt: "2025-05-15T17:00:00",
            frequency: "daily",
            status: "overdue",
            type: "report",
          },
          {
            id: 103,
            title: "ประชุมทีมการตลาด",
            message: "ประชุมทีมการตลาดเพื่อติดตามความคืบหน้าแคมเปญไตรมาส 2",
            scheduledAt: "2025-05-22T13:00:00",
            frequency: "weekly",
            status: "incomplete",
            type: "meeting",
          },
        ]

        setCycleReminders(mockCycleReminders)
      } catch (e) {
        console.error("Failed to load cycle reminders", e)
      }
    }

    fetchManualReminders()
    fetchCycleReminders()
  }, []) // รันแค่ครั้งเดียวตอน mount

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

  // Add new reminder
  const handleAddReminder = () => {
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

    // Check if task is urgent (today or within next 3 days)
    const isUrgent = checkIsUrgent(formData.date)

    const newReminder = {
      id: reminders.length + 1,
      ...formData,
      password: passwordData,
      status: "incomplete" as const,
      isUrgent: isUrgent,
    }
    setReminders([...reminders, newReminder])
    setIsAddDialogOpen(false)
    resetForm()
  }

  // Edit reminder
  const handleEditReminder = () => {
    if (!currentReminder) return

    // สร้างข้อมูล password จาก username และ password ถ้ามีการติ๊กช่อง hasLogin
    let passwordData = ""
    if (formData.hasLogin && (formData.username || formData.password)) {
      passwordData = `user: ${formData.username}\npassword: ${formData.password}`
    }

    // Check if task is urgent (today or within next 3 days)
    const isUrgent = checkIsUrgent(formData.date)

    const updatedReminders = reminders.map((reminder) =>
      reminder.id === currentReminder.id
        ? {
            ...formData,
            id: reminder.id,
            password: passwordData,
            status: reminder.status,
            isUrgent: isUrgent,
          }
        : reminder,
    )
    setReminders(updatedReminders)
    setIsEditDialogOpen(false)
    resetForm()
  }

  // Delete reminder
  const handleDeleteReminder = () => {
    if (!currentReminder) return
    const updatedReminders = reminders.filter((reminder) => reminder.id !== currentReminder.id)
    setReminders(updatedReminders)
    setIsDeleteDialogOpen(false)
  }

  // Open edit dialog and set current reminder
  const openEditDialog = (reminder: Reminder) => {
    setCurrentReminder(reminder)

    // Set hasLogin flag based on whether password exists
    const hasLoginValue = reminder.password ? true : false
    setHasLogin(hasLoginValue)

    // Initialize form data without username and password
    setFormData({
      title: reminder.title,
      date: reminder.date,
      frequency: reminder.frequency,
      details: reminder.details,
      link: reminder.link || "",
      username: "",
      password: "",
      impact: reminder.impact || "",
      hasLogin: hasLoginValue,
    })

    // If there's password data, we'll need authentication
    if (hasLoginValue) {
      setIsPasswordVisible(false)
      setIsEditPasswordAuthenticated(false)
      setIsEditDialogOpen(true)
    } else {
      // If no password data, just open the edit dialog normally
      setIsEditPasswordAuthenticated(true)
      setIsEditDialogOpen(true)
    }
  }

  // Handle authentication for editing password
  const handleEditAuthenticate = () => {
    // In a real system, verify the password against backend
    // For this example, we'll just accept any password

    // Extract username and password from the reminder's password field
    let username = ""
    let password = ""

    if (currentReminder?.password) {
      const passwordLines = currentReminder.password.split("\n")

      for (const line of passwordLines) {
        if (line.toLowerCase().startsWith("user:")) {
          username = line.substring(line.indexOf(":") + 1).trim()
        } else if (line.toLowerCase().startsWith("password:")) {
          password = line.substring(line.indexOf(":") + 1).trim()
        }
      }
    }

    setIsEditPasswordAuthenticated(true)
    setFormData({
      ...formData,
      username: username,
      password: password,
    })
  }

  // Open delete dialog and set current reminder
  const openDeleteDialog = (reminder: Reminder) => {
    setCurrentReminder(reminder)
    setIsDeleteDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
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
    setHasLogin(false)
    setCurrentReminder(null)
    setIsEditPasswordAuthenticated(false)
  }

  // Handle authentication for viewing password
  const handleAuthenticate = () => {
    // ในระบบจริงควรมีการตรวจสอบรหัสผ่านกับ backend
    // สำหรับตัวอย่างนี้จะแสดงรหัสผ่านเมื่อกดปุ่มยืนยัน
    setIsPasswordVisible(true)
  }

  // Toggle reminder status
  const toggleReminderStatus = (reminder: Reminder) => {
    const updatedReminders = reminders.map((r) =>
      r.id === reminder.id ? { ...r, status: r.status === "completed" ? "incomplete" : "completed" } : r,
    )
    setReminders(updatedReminders)
  }

  const mappedCycle = cycleReminders.map((c) => ({
    id: c.id,
    title: c.title,
    details: c.message,
    date: c.scheduledAt?.split("T")[0],
    frequency: c.frequency,
    status: c.status,
    type: c.type,
    isUrgent: false, // Default for cycle reminders
  }))

  // รวม manual + cycle
  const allReminders = [...reminders, ...mappedCycle]

  // Mark urgent tasks
  const remindersWithUrgentFlag = allReminders.map((reminder) => {
    if (reminder.isUrgent !== undefined) return reminder
    return {
      ...reminder,
      isUrgent: checkIsUrgent(reminder.date),
    }
  })

  // กรอง search / filter บน allReminders
  const filteredReminders = remindersWithUrgentFlag
    .filter((reminder) => {
      const matchesSearch =
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.details.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || reminder.status === statusFilter
      const matchesType = typeFilter === "all" || reminder.type === typeFilter
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "overdue" && reminder.status === "overdue") ||
        (activeTab === "urgent" && reminder.isUrgent) ||
        (activeTab === "incomplete" && reminder.status === "incomplete") ||
        (activeTab === "completed" && reminder.status === "completed")

      return matchesSearch && matchesStatus && matchesType && matchesTab
    })
    .sort((a, b) => {
      // Sort by priority: overdue > urgent > incomplete > completed
      if (a.status === "overdue" && b.status !== "overdue") return -1
      if (a.status !== "overdue" && b.status === "overdue") return 1
      if (a.isUrgent && !b.isUrgent) return -1
      if (!a.isUrgent && b.isUrgent) return 1
      if (a.status === "incomplete" && b.status === "completed") return -1
      if (a.status === "completed" && b.status === "incomplete") return 1

      // If same priority, sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  // Count reminders by status
  const reminderCounts = {
    all: remindersWithUrgentFlag.length,
    overdue: remindersWithUrgentFlag.filter((r) => r.status === "overdue").length,
    urgent: remindersWithUrgentFlag.filter((r) => r.isUrgent).length,
    incomplete: remindersWithUrgentFlag.filter((r) => r.status === "incomplete").length,
    completed: remindersWithUrgentFlag.filter((r) => r.status === "completed").length,
  }

  return (
    <AppLayout title="ตั้งค่าการแจ้งเตือน" description="สร้าง แก้ไข และลบการแจ้งเตือนต่างๆ">
      <div className="mt-4">
        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Search and Add Button */}
          <ReminderFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onAddClick={() => {
              resetForm()
              setIsAddDialogOpen(true)
            }}
          />

          {/* Tabs */}
          <ReminderTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reminderCounts={reminderCounts}
            filteredReminders={filteredReminders}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onToggleStatus={toggleReminderStatus}
            onViewPassword={(reminder) => {
              setCurrentReminder(reminder)
              setIsPasswordVisible(false)
              setIsForgotPasswordDialogOpen(true)
            }}
            getStatusBadge={getStatusBadge}
            getFrequencyText={getFrequencyText}
            getTypeIcon={getTypeIcon}
            getDueDateStatus={getDueDateStatus}
            formatThaiDate={formatThaiDate}
          />
        </div>
      </div>

      {/* Add Reminder Dialog */}
      <AddReminderDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleAddReminder={handleAddReminder}
        hasLogin={hasLogin}
        setHasLogin={setHasLogin}
      />

      {/* Edit Reminder Dialog */}
      <EditReminderDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setIsEditPasswordAuthenticated(false)
          }
        }}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleEditReminder={handleEditReminder}
        isPasswordProtected={!!currentReminder?.password}
        isEditPasswordAuthenticated={isEditPasswordAuthenticated}
        handleEditAuthenticate={handleEditAuthenticate}
        hasLogin={hasLogin}
        setHasLogin={setHasLogin}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteReminderDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        reminderTitle={currentReminder?.title || ""}
        handleDeleteReminder={handleDeleteReminder}
      />

      {/* View Password Dialog */}
      <PasswordDialog
        isOpen={isForgotPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsForgotPasswordDialogOpen(open)
          if (!open) {
            setIsPasswordVisible(false)
          }
        }}
        reminderPassword={currentReminder?.password}
        isPasswordVisible={isPasswordVisible}
        handleAuthenticate={handleAuthenticate}
      />
    </AppLayout>
  )
}
