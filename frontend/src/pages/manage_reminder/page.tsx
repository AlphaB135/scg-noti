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
import { unifiedApi, type UnifiedTask } from "@/lib/api-integration"

// Convert UnifiedTask to Reminder type for the UI
type Reminder = {
  id: number | string
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

const convertTaskToReminder = (task: UnifiedTask): Reminder => {
  // Create password string from username and password if they exist
  let passwordData = ""
  if (task.hasLogin && (task.username || task.password)) {
    passwordData = `user: ${task.username || ""}\npassword: ${task.password || ""}`
  }

  return {
    id: task.id,
    title: task.title,
    details: task.details,
    date: task.dueDate,
    frequency: task.frequency,
    link: task.link,
    password: passwordData,
    impact: task.impact,
    status: task.status,
    type: task.type,
    isUrgent: task.isUrgent,
  }
}

export default function ManageReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Load reminders from API
  const loadReminders = async () => {
    setIsLoading(true)
    try {
      const tasks = await unifiedApi.getAll()
      const convertedReminders = tasks.map(convertTaskToReminder)
      setReminders(convertedReminders)
    } catch (error) {
      console.error("Failed to load reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add new reminder
  const handleAddReminder = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()) {
      return
    }

    try {
      // Create a new task from form data
      const newTask: Omit<UnifiedTask, "id"> = {
        title: formData.title,
        details: formData.details,
        dueDate: formData.date,
        status: "incomplete",
        priority: "pending", // Will be calculated by API
        done: false,
        frequency: formData.frequency as UnifiedTask["frequency"],
        impact: formData.impact,
        link: formData.link,
        hasLogin: formData.hasLogin,
        username: formData.username,
        password: formData.password,
        isUrgent: checkIsUrgent(formData.date),
      }

      // Create the task via API
      await unifiedApi.create(newTask)

      // Reload reminders to get the updated list
      await loadReminders()

      // Close dialog and reset form
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create reminder:", error)
    }
  }

  // Edit reminder
  const handleEditReminder = async () => {
    if (!currentReminder) return

    try {
      // Create updated task from form data
      const updatedTask: Partial<UnifiedTask> = {
        title: formData.title,
        details: formData.details,
        dueDate: formData.date,
        frequency: formData.frequency as UnifiedTask["frequency"],
        impact: formData.impact,
        link: formData.link,
        hasLogin: formData.hasLogin,
        username: formData.username,
        password: formData.password,
      }

      // Update the task via API
      await unifiedApi.update(String(currentReminder.id), updatedTask)

      // Reload reminders to get the updated list
      await loadReminders()

      // Close dialog and reset form
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to update reminder:", error)
    }
  }

  // Delete reminder
  const handleDeleteReminder = async () => {
    if (!currentReminder) return

    try {
      // Delete the task via API
      await unifiedApi.delete(String(currentReminder.id))

      // Reload reminders to get the updated list
      await loadReminders()

      // Close dialog
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete reminder:", error)
    }
  }

  // Open edit dialog and set current reminder
  const openEditDialog = (reminder: Reminder) => {
    setCurrentReminder(reminder)

    // Set hasLogin flag based on whether password exists
    const hasLoginValue = reminder.password ? true : false
    setHasLogin(hasLoginValue)

    // Extract username and password from the reminder's password field
    let username = ""
    let password = ""

    if (reminder.password) {
      const passwordLines = reminder.password.split("\n")

      for (const line of passwordLines) {
        if (line.toLowerCase().startsWith("user:")) {
          username = line.substring(line.indexOf(":") + 1).trim()
        } else if (line.toLowerCase().startsWith("password:")) {
          password = line.substring(line.indexOf(":") + 1).trim()
        }
      }
    }

    // Initialize form data
    setFormData({
      title: reminder.title,
      date: reminder.date,
      frequency: reminder.frequency,
      details: reminder.details,
      link: reminder.link || "",
      username: username,
      password: password,
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
    setIsEditPasswordAuthenticated(true)
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
  const toggleReminderStatus = async (reminder: Reminder) => {
    try {
      const newStatus = reminder.status === "completed" ? "PENDING" : "DONE"
      await unifiedApi.updateStatus(String(reminder.id), newStatus)

      // Reload reminders to get the updated list
      await loadReminders()
    } catch (error) {
      console.error("Failed to toggle reminder status:", error)
    }
  }

  // Filter reminders
  const filteredReminders = reminders
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

      // Filter by date if needed
      let matchesDate = true
      if (filterDate !== "all") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const reminderDate = new Date(reminder.date)
        reminderDate.setHours(0, 0, 0, 0)

        if (filterDate === "today") {
          matchesDate = reminderDate.getTime() === today.getTime()
        } else if (filterDate === "thisWeek") {
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          matchesDate = reminderDate >= weekStart && reminderDate <= weekEnd
        } else if (filterDate === "thisMonth") {
          matchesDate =
            reminderDate.getMonth() === today.getMonth() && reminderDate.getFullYear() === today.getFullYear()
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesTab && matchesDate
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
    all: reminders.length,
    overdue: reminders.filter((r) => r.status === "overdue").length,
    urgent: reminders.filter((r) => r.isUrgent).length,
    incomplete: reminders.filter((r) => r.status === "incomplete").length,
    completed: reminders.filter((r) => r.status === "completed").length,
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

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
            </div>
          ) : (
            /* Tabs */
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
          )}
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
