"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AppLayout from "@/components/layout/app-layout"
import { useToast } from "@/hooks/use-toast"
import NotificationFilters from "@/components/team-notification/notification-filters"
import NotificationTabs from "@/components/team-notification/notification-tabs"
import AddNotificationDialog from "@/components/team-notification/add-notification-dialog"
import EditNotificationDialog from "@/components/team-notification/edit-notification-dialog"
import DeleteNotificationDialog from "@/components/team-notification/delete-notification-dialog"
import AssignmentStatusDialog from "@/components/team-notification/assignment-status-dialog"

// Types
type TeamMember = {
  id: string
  name: string
  role: string
  avatar?: string
}

type NotificationAssignment = {
  memberId: string
  memberName: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  assignedAt: string
  completedAt?: string
}

type Notification = {
  id: string
  title: string
  details: string
  date: string
  dueDate: string
  frequency: string
  type?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "draft" | "active" | "completed" | "overdue"
  isTeamAssignment: boolean
  assignments: NotificationAssignment[]
}

export default function TeamNotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssignmentStatusDialogOpen, setIsAssignmentStatusDialogOpen] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Form state for new/edit notification
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    frequency: "no-repeat",
    type: "",
    priority: "medium",
    isTeamAssignment: false,
    selectedMembers: [] as string[],
  })

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Mock team members data
        const mockTeamMembers: TeamMember[] = [
          { id: "1", name: "สมชาย ใจดี", role: "นักพัฒนาซอฟต์แวร์" },
          { id: "2", name: "สมหญิง รักงาน", role: "นักออกแบบ UI/UX" },
          { id: "3", name: "วิชัย เก่งกาจ", role: "วิศวกรระบบ" },
          { id: "4", name: "นภา สดใส", role: "ผู้จัดการโครงการ" },
          { id: "5", name: "ประสิทธิ์ มากความสามารถ", role: "นักทดสอบระบบ" },
        ]

        // Mock notifications data
        const mockNotifications: Notification[] = [
          {
            id: "1",
            title: "ส่งรายงานประจำเดือน",
            details: "กรุณาส่งรายงานความคืบหน้าประจำเดือนภายในวันที่กำหนด",
            date: "2025-05-15",
            dueDate: "2025-05-20",
            frequency: "monthly",
            type: "report",
            priority: "high",
            status: "active",
            isTeamAssignment: true,
            assignments: [
              {
                memberId: "1",
                memberName: "สมชาย ใจดี",
                status: "completed",
                assignedAt: "2025-05-15",
                completedAt: "2025-05-18",
              },
              {
                memberId: "2",
                memberName: "สมหญิง รักงาน",
                status: "completed",
                assignedAt: "2025-05-15",
                completedAt: "2025-05-17",
              },
              { memberId: "3", memberName: "วิชัย เก่งกาจ", status: "pending", assignedAt: "2025-05-15" },
              { memberId: "4", memberName: "นภา สดใส", status: "in-progress", assignedAt: "2025-05-15" },
              {
                memberId: "5",
                memberName: "ประสิทธิ์ มากความสามารถ",
                status: "completed",
                assignedAt: "2025-05-15",
                completedAt: "2025-05-16",
              },
            ],
          },
          {
            id: "2",
            title: "ประชุมทีมประจำสัปดาห์",
            details: "ประชุมติดตามความคืบหน้าและวางแผนงานประจำสัปดาห์",
            date: "2025-05-18",
            dueDate: "2025-05-18",
            frequency: "weekly",
            type: "meeting",
            priority: "medium",
            status: "completed",
            isTeamAssignment: true,
            assignments: [
              {
                memberId: "1",
                memberName: "สมชาย ใจดี",
                status: "completed",
                assignedAt: "2025-05-18",
                completedAt: "2025-05-18",
              },
              {
                memberId: "2",
                memberName: "สมหญิง รักงาน",
                status: "completed",
                assignedAt: "2025-05-18",
                completedAt: "2025-05-18",
              },
              {
                memberId: "3",
                memberName: "วิชัย เก่งกาจ",
                status: "completed",
                assignedAt: "2025-05-18",
                completedAt: "2025-05-18",
              },
              {
                memberId: "4",
                memberName: "นภา สดใส",
                status: "completed",
                assignedAt: "2025-05-18",
                completedAt: "2025-05-18",
              },
              {
                memberId: "5",
                memberName: "ประสิทธิ์ มากความสามารถ",
                status: "completed",
                assignedAt: "2025-05-18",
                completedAt: "2025-05-18",
              },
            ],
          },
          {
            id: "3",
            title: "ส่งแบบร่างการออกแบบ UI",
            details: "ส่งแบบร่างการออกแบบ UI สำหรับฟีเจอร์ใหม่",
            date: "2025-05-19",
            dueDate: "2025-05-25",
            frequency: "no-repeat",
            type: "document",
            priority: "high",
            status: "active",
            isTeamAssignment: false,
            assignments: [
              { memberId: "2", memberName: "สมหญิง รักงาน", status: "in-progress", assignedAt: "2025-05-19" },
            ],
          },
        ]

        setTeamMembers(mockTeamMembers)
        setNotifications(mockNotifications)
        setTotalPages(1) // Mock single page
      } catch (error) {
        console.error("Failed to load data:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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

  // Handle team assignment toggle
  const handleTeamAssignmentChange = (isTeamAssignment: boolean) => {
    setFormData({
      ...formData,
      isTeamAssignment,
      // If team assignment is true, select all members
      selectedMembers: isTeamAssignment ? teamMembers.map((member) => member.id) : [],
    })
  }

  // Handle member selection
  const handleMemberSelection = (memberId: string, isSelected: boolean) => {
    if (isSelected) {
      setFormData({
        ...formData,
        selectedMembers: [...formData.selectedMembers, memberId],
      })
    } else {
      setFormData({
        ...formData,
        selectedMembers: formData.selectedMembers.filter((id) => id !== memberId),
      })
    }
  }

  // Add new notification
  const handleAddNotification = async () => {
    try {
      // Validate form
      if (!formData.title.trim()) {
        toast({
          title: "กรุณาระบุข้อมูล",
          description: "กรุณาระบุหัวข้องานอย่างน้อย",
          variant: "destructive",
        })
        return
      }

      if (!formData.isTeamAssignment && formData.selectedMembers.length === 0) {
        toast({
          title: "กรุณาเลือกสมาชิก",
          description: "กรุณาเลือกสมาชิกที่ต้องการมอบหมายงานอย่างน้อย 1 คน",
          variant: "destructive",
        })
        return
      }

      // Create assignments
      const assignments: NotificationAssignment[] = formData.selectedMembers.map((memberId) => {
        const member = teamMembers.find((m) => m.id === memberId)
        return {
          memberId,
          memberName: member?.name || "Unknown",
          status: "pending",
          assignedAt: new Date().toISOString().split("T")[0],
        }
      })

      // Create new notification
      const newNotification: Notification = {
        id: Date.now().toString(), // Mock ID
        title: formData.title,
        details: formData.details,
        date: formData.date,
        dueDate: formData.dueDate,
        frequency: formData.frequency,
        type: formData.type || undefined,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        status: "active",
        isTeamAssignment: formData.isTeamAssignment,
        assignments,
      }

      // Add to list (in a real app, this would be an API call)
      setNotifications([newNotification, ...notifications])

      // Show success toast
      toast({
        title: "สร้างการแจ้งเตือนสำเร็จ",
        description: `การแจ้งเตือน "${formData.title}" ถูกสร้างและมอบหมายให้ ${assignments.length} คนเรียบร้อยแล้ว`,
      })

      // Close dialog and reset form
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create notification:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างการแจ้งเตือนได้",
        variant: "destructive",
      })
    }
  }

  // Edit notification
  const handleEditNotification = async () => {
    if (!currentNotification) return

    try {
      // Create updated assignments
      const currentAssignmentMap = new Map(currentNotification.assignments.map((a) => [a.memberId, a]))

      const updatedAssignments: NotificationAssignment[] = formData.selectedMembers.map((memberId) => {
        const member = teamMembers.find((m) => m.id === memberId)
        const existingAssignment = currentAssignmentMap.get(memberId)

        if (existingAssignment) {
          return existingAssignment
        }

        return {
          memberId,
          memberName: member?.name || "Unknown",
          status: "pending",
          assignedAt: new Date().toISOString().split("T")[0],
        }
      })

      // Create updated notification
      const updatedNotification: Notification = {
        ...currentNotification,
        title: formData.title,
        details: formData.details,
        date: formData.date,
        dueDate: formData.dueDate,
        frequency: formData.frequency,
        type: formData.type || undefined,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        isTeamAssignment: formData.isTeamAssignment,
        assignments: updatedAssignments,
      }

      // Update in list (in a real app, this would be an API call)
      setNotifications(notifications.map((n) => (n.id === currentNotification.id ? updatedNotification : n)))

      // Show success toast
      toast({
        title: "แก้ไขการแจ้งเตือนสำเร็จ",
        description: `การแจ้งเตือน "${formData.title}" ถูกแก้ไขเรียบร้อยแล้ว`,
      })

      // Close dialog and reset form
      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to update notification:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขการแจ้งเตือนได้",
        variant: "destructive",
      })
    }
  }

  // Delete notification
  const handleDeleteNotification = async () => {
    if (!currentNotification) return

    try {
      // Remove from list (in a real app, this would be an API call)
      setNotifications(notifications.filter((n) => n.id !== currentNotification.id))

      // Show success toast
      toast({
        title: "ลบการแจ้งเตือนสำเร็จ",
        description: `ลบการแจ้งเตือน "${currentNotification.title}" เรียบร้อยแล้ว`,
      })

      // Close dialog
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบการแจ้งเตือนได้",
        variant: "destructive",
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (notification: Notification) => {
    setCurrentNotification(notification)
    setFormData({
      title: notification.title,
      details: notification.details,
      date: notification.date,
      dueDate: notification.dueDate,
      frequency: notification.frequency,
      type: notification.type || "",
      priority: notification.priority,
      isTeamAssignment: notification.isTeamAssignment,
      selectedMembers: notification.assignments.map((a) => a.memberId),
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (notification: Notification) => {
    setCurrentNotification(notification)
    setIsDeleteDialogOpen(true)
  }

  // Open assignment status dialog
  const openAssignmentStatusDialog = (notification: Notification) => {
    setCurrentNotification(notification)
    setIsAssignmentStatusDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      details: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      frequency: "no-repeat",
      type: "",
      priority: "medium",
      isTeamAssignment: false,
      selectedMembers: [],
    })
    setCurrentNotification(null)
  }

  // Filter notifications
  const filteredNotifications = notifications
    .filter((notification) => {
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.details.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || notification.status === statusFilter
      const matchesType = typeFilter === "all" || notification.type === typeFilter

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "team" && notification.isTeamAssignment) ||
        (activeTab === "individual" && !notification.isTeamAssignment) ||
        (activeTab === "completed" && notification.status === "completed") ||
        (activeTab === "active" && notification.status === "active")

      // Filter by date if needed
      let matchesDate = true
      if (filterDate !== "all") {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const notificationDate = new Date(notification.dueDate)
        notificationDate.setHours(0, 0, 0, 0)

        if (filterDate === "today") {
          matchesDate = notificationDate.getTime() === today.getTime()
        } else if (filterDate === "thisWeek") {
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          matchesDate = notificationDate >= weekStart && notificationDate <= weekEnd
        } else if (filterDate === "thisMonth") {
          matchesDate =
            notificationDate.getMonth() === today.getMonth() && notificationDate.getFullYear() === today.getFullYear()
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesTab && matchesDate
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  // Count notifications by status
  const notificationCounts = {
    all: notifications.length,
    team: notifications.filter((n) => n.isTeamAssignment).length,
    individual: notifications.filter((n) => !n.isTeamAssignment).length,
    active: notifications.filter((n) => n.status === "active").length,
    completed: notifications.filter((n) => n.status === "completed").length,
  }

  return (
    <AppLayout title="เพิ่มการแจ้งเตือน" description="สร้างและมอบหมายการแจ้งเตือนให้กับทีม">
      <div className="bg-[#f8f9fc] min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Header with search and add button */}
          <div className="flex flex-col sm:flex-row gap-3 items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="ค้นหาการแจ้งเตือน..."
                className="pl-10 w-full border-gray-300 focus:border-[#2c3e50] focus:ring-[#2c3e50]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="flex-1 sm:flex-none border-[#2c3e50] text-[#2c3e50] hover:bg-[#2c3e50] hover:text-white transition-colors"
              >
                ตัวกรอง {isFiltersVisible ? "▲" : "▼"}
              </Button>
              <Button
                onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(true)
                }}
                className="flex-1 sm:flex-none bg-[#2c3e50] hover:bg-[#1a2530] text-white transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" /> สร้างการแจ้งเตือน
              </Button>
            </div>
          </div>

          {/* Filters section */}
          {isFiltersVisible && (
            <NotificationFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
            />
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c3e50]"></div>
            </div>
          ) : (
            /* Tabs and notification list */
            <NotificationTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              notificationCounts={notificationCounts}
              filteredNotifications={filteredNotifications}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onViewAssignments={openAssignmentStatusDialog}
              teamMembers={teamMembers}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-[#2c3e50] text-[#2c3e50]"
                >
                  ก่อนหน้า
                </Button>
                <div className="flex items-center px-4 bg-white rounded-md border border-[#e2e8f0]">
                  <span className="text-sm text-[#4a5568]">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-[#2c3e50] text-[#2c3e50]"
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Notification Dialog */}
      <AddNotificationDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleTeamAssignmentChange={handleTeamAssignmentChange}
        handleMemberSelection={handleMemberSelection}
        handleAddNotification={handleAddNotification}
        teamMembers={teamMembers}
      />

      {/* Edit Notification Dialog */}
      <EditNotificationDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleTeamAssignmentChange={handleTeamAssignmentChange}
        handleMemberSelection={handleMemberSelection}
        handleEditNotification={handleEditNotification}
        teamMembers={teamMembers}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNotificationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        notificationTitle={currentNotification?.title || ""}
        handleDeleteNotification={handleDeleteNotification}
      />

      {/* Assignment Status Dialog */}
      <AssignmentStatusDialog
        isOpen={isAssignmentStatusDialogOpen}
        onOpenChange={setIsAssignmentStatusDialogOpen}
        notification={currentNotification}
        teamMembers={teamMembers}
      />
    </AppLayout>
  )
}
