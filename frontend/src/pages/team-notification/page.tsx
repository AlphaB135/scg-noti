//team-notification

"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input" 
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/layout/app-layout"
import { notificationsApi } from "@/lib/api"
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
  impact?: string // เพิ่ม impact
  date: string
  dueDate: string
  frequency: string
  type?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "draft" | "active" | "completed" | "overdue"
  isTeamAssignment: boolean
  assignments: NotificationAssignment[]
}

type Props = {
  teamId: string
}

export default function TeamNotificationsPage({ teamId }: Props) {
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
    impact: "", // เพิ่ม impact
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    link: "",
    username: "",
    password: "",
    frequency: "no-repeat", 
    type: "",
    priority: "medium",
    isTeamAssignment: false,
    selectedMembers: [] as string[],
  })

  // Data loading (เปลี่ยนจาก mock เป็น API จริง)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // โหลดสมาชิกทีม
        const membersRes = await fetch(`/api/teams/${teamId}/members`)
        const membersData = await membersRes.json()
        const rawMembers = membersData.data || membersData.members || []
        // Normalize ข้อมูลสมาชิกทีมให้ตรงกับ API จริง
        const normalizedMembers: TeamMember[] = (rawMembers || []).map((m: any) => ({
          id: m.user?.id || m.employeeId || m.id,
          name: m.user?.employeeProfile
            ? `${m.user.employeeProfile.firstName} ${m.user.employeeProfile.lastName}`
            : m.user?.email || m.employeeId || '-',
          role: m.role || '-',
          avatar: m.user?.employeeProfile?.profileImageUrl || undefined,
        }))
        setTeamMembers(normalizedMembers)

        // โหลด notifications ของทีม
        const notiRes = await fetch(`/api/teams/${teamId}/notifications`)
        const notiData = await notiRes.json()
        setNotifications(notiData.notifications || notiData.data || [])
        setTotalPages(notiData.totalPages || 1)
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
  }, [teamId])

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

      // Build API payload
      const payload = {
        title: formData.title,
        message: formData.details,
        impact: formData.impact, // ส่ง impact แยก field
        scheduledAt: new Date(formData.date).toISOString(),
        category: "TASK", // เพิ่ม category ให้ตรง type
        link: formData.link || undefined,
        linkUsername: formData.username || undefined,
        linkPassword: formData.password || undefined,
        recipients: formData.isTeamAssignment
          ? teamMembers.map(member => ({ type: 'USER' as const, userId: member.id }))
          : formData.selectedMembers.map(memberId => ({ type: 'USER' as const, userId: memberId }))
      }

      // Call API
      await notificationsApi.create(payload)

      // Show success toast
      toast({
        title: "สร้างการแจ้งเตือนสำเร็จ",
        description: `การแจ้งเตือน "${formData.title}" ถูกสร้างเรียบร้อยแล้ว`,
      })

      // Close dialog and reset form
      setIsAddDialogOpen(false)
      resetForm()

      // โหลดข้อมูลใหม่
      const notiRes = await fetch(`/api/teams/${teamId}/notifications`)
      const notiData = await notiRes.json()
      setNotifications(notiData.notifications || [])
      setTotalPages(notiData.totalPages || 1)
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
      const payload = {
        title: formData.title,
        message: formData.details,
        impact: formData.impact, // ส่ง impact แยก field
        scheduledAt: new Date(formData.date).toISOString(),
        category: "TASK", // เพิ่ม category ให้ตรง type
        link: formData.link || undefined,
        linkUsername: formData.username || undefined,
        linkPassword: formData.password || undefined,
        recipients: formData.isTeamAssignment
          ? teamMembers.map(member => ({ type: 'USER' as const, userId: member.id }))
          : formData.selectedMembers.map(memberId => ({ type: 'USER' as const, userId: memberId }))
      }

      await notificationsApi.update(currentNotification.id, payload)

      toast({
        title: "แก้ไขการแจ้งเตือนสำเร็จ",
        description: `การแจ้งเตือน "${formData.title}" ถูกแก้ไขเรียบร้อยแล้ว`,
      })

      setIsEditDialogOpen(false)
      resetForm()

      // โหลดข้อมูลใหม่
      const notiRes = await fetch(`/api/teams/${teamId}/notifications`)
      const notiData = await notiRes.json()
      setNotifications(notiData.notifications || [])
      setTotalPages(notiData.totalPages || 1)
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
      await notificationsApi.remove(currentNotification.id)

      toast({
        title: "ลบการแจ้งเตือนสำเร็จ",
        description: `ลบการแจ้งเตือน "${currentNotification.title}" เรียบร้อยแล้ว`,
      })

      setIsDeleteDialogOpen(false)

      // โหลดข้อมูลใหม่
      const notiRes = await fetch(`/api/teams/${teamId}/notifications`)
      const notiData = await notiRes.json()
      setNotifications(notiData.notifications || [])
      setTotalPages(notiData.totalPages || 1)
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
      impact: notification.impact || "", // map impact
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
      impact: "", // reset impact
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
        isLoading={isLoading}
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
        isLoading={isLoading}
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
