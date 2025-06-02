//team-notification

"use client"

import { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input" 
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/layout/app-layout"
import { notificationsApi } from "@/lib/api"
import { notificationApi } from "@/lib/api/notification"
import { teamsApi } from "@/lib/api/teams"
import NotificationFilters from "@/components/team-notification/notification-filters"
import NotificationTabs from "@/components/team-notification/notification-tabs"
import AddNotificationDialog from "@/components/team-notification/add-notification-dialog"
import EditNotificationDialog from "@/components/team-notification/edit-notification-dialog" 
import DeleteNotificationDialog from "@/components/team-notification/delete-notification-dialog"
import AssignmentStatusDialog from "@/components/team-notification/assignment-status-dialog"
import { useParams } from "react-router-dom"

// Types
type TeamMember = {
  id: string
  name: string
  role: string
  avatar?: string
  teamRole: string
  department: string
  email: string
  isLeader: boolean
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

export default function TeamNotificationsPage() {
  const params = useParams()
  const teamId = params.teamId // รับ teamId จาก URL parameter
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

  // Data loading (ใช้ teamsApi แทน fetch)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        console.log("🔍 Loading data for teamId:", teamId);
        
        if (teamId) {
          // โหลดข้อมูลทีมเฉพาะที่เลือก
          console.log("📥 Fetching team data...");
          const team = await teamsApi.get(teamId)
          console.log("📊 Team data received:", team);
          
          // Normalize ข้อมูลสมาชิก - ใช้ข้อมูลที่ transform แล้วจาก teamsApi
          const normalizedMembers = team.members.map((member) => ({
            id: member.id, // ใช้ id ที่ transform แล้ว
            name: member.name, // ชื่อเต็มที่ transform แล้ว
            role: member.position, // ตำแหน่งงาน
            avatar: member.avatar || "/placeholder.svg",
            teamRole: member.role, // บทบาทในทีม (หัวหน้างาน, พนักงาน)
            department: member.department,
            email: member.email,
            isLeader: member.isLeader,
          }))
          setTeamMembers(normalizedMembers)
          console.log("👥 Normalized team members:", normalizedMembers);

          // โหลดการแจ้งเตือนของทีม
          try {
            console.log("📥 Fetching notifications...");
            const notiRes = await notificationsApi.getAll(1, 50)
            console.log("📋 Raw notifications from API:", notiRes);
            console.log("📊 Notifications count:", notiRes.data.length);
            
            // Filter notifications for this team
            const teamNotifications = notiRes.data.filter((noti: any) => 
              noti.recipients?.some((r: any) => 
                team.members.some(member => member.id === r.userId)
              )
            )
            console.log("🎯 Filtered team notifications:", teamNotifications);
            
            // Transform API notifications to local format
            const transformedNotifications = teamNotifications.map((noti: any) => ({
              id: noti.id,
              title: noti.title,
              details: noti.message || noti.details || '',
              impact: noti.impact || '',
              date: noti.createdAt || new Date().toISOString(),
              dueDate: noti.scheduledAt || new Date().toISOString(),
              frequency: 'no-repeat',
              type: 'TODO', // <<--- fix: set type เป็น 'TODO' เสมอ
              priority: noti.priority || 'medium',
              status: noti.status || 'draft',
              isTeamAssignment: true,
              assignments: noti.recipients?.map((r: any) => {
                const member = team.members.find(m => m.id === r.userId)
                return {
                  memberId: r.userId,
                  memberName: member?.name || 'Unknown',
                  status: r.status || 'pending',
                  assignedAt: noti.createdAt || new Date().toISOString()
                }
              }) || []
            }))
            console.log("✨ Transformed notifications:", transformedNotifications);
            setNotifications(transformedNotifications)
          } catch (notiError) {
            console.log("❌ No notifications found for team, using empty list:", notiError)
            setNotifications([])
          }
        } else {
          // ถ้าไม่มี teamId ให้โหลดทีมทั้งหมดและใช้ทีมแรก
          const teamsRes = await teamsApi.list()
          console.log("📊 All teams data:", teamsRes);
          
          if (teamsRes.data.length > 0) {
            const firstTeam = teamsRes.data[0]
            
            // Normalize ข้อมูลสมาชิก
            const normalizedMembers = firstTeam.members.map((member) => ({
              id: member.id,
              name: member.name,
              role: member.position || member.role,
              avatar: member.avatar || "/placeholder.svg",
              teamRole: member.role,
              department: member.department,
              email: member.email,
              isLeader: member.isLeader,
            }))
            setTeamMembers(normalizedMembers)
            setNotifications([]) // Reset notifications
          } else {
            // ถ้าไม่มีทีม ใช้ mock data
            console.log("⚠️ No teams found, using mock data");
            const mockMembers = [
              {
                id: "550e8400-e29b-41d4-a716-446655440001", // Valid UUID
                name: "จอห์น สมิธ",
                role: "นักพัฒนาระบบ",
                avatar: "/placeholder.svg",
                teamRole: "พนักงาน",
                department: "พัฒนาระบบ",
                email: "john@example.com",
                isLeader: false,
              },
              {
                id: "550e8400-e29b-41d4-a716-446655440002", // Valid UUID
                name: "เจน โดว์",
                role: "นักวิเคราะห์ระบบ",
                avatar: "/placeholder.svg",
                teamRole: "พนักงาน",
                department: "วิเคราะห์ระบบ",
                email: "jane@example.com",
                isLeader: false,
              },
              {
                id: "550e8400-e29b-41d4-a716-446655440003", // Valid UUID
                name: "บ๊อบ จอห์นสัน",
                role: "หัวหน้าทีม",
                avatar: "/placeholder.svg",
                teamRole: "หัวหน้างาน",
                department: "จัดการโครงการ",
                email: "bob@example.com",
                isLeader: true,
              }
            ]
            setTeamMembers(mockMembers)
            setNotifications([])
          }
        }
        
      } catch (error) {
        console.error("❌ Failed to load team data:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: teamId ? "ไม่สามารถโหลดข้อมูลทีมได้ กรุณาตรวจสอบ teamId" : "ไม่สามารถโหลดข้อมูลทีมได้",
          variant: "destructive",
        })
        
        // Set mock data for testing if team loading fails
        const mockMembers = [
          {
            id: "550e8400-e29b-41d4-a716-446655440001", // Valid UUID
            name: "จอห์น สมิธ",
            role: "นักพัฒนาระบบ",
            avatar: "/placeholder.svg",
            teamRole: "พนักงาน",
            department: "พัฒนาระบบ",
            email: "john@example.com",
            isLeader: false,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002", // Valid UUID
            name: "เจน โดว์",
            role: "นักวิเคราะห์ระบบ",
            avatar: "/placeholder.svg",
            teamRole: "พนักงาน",
            department: "วิเคราะห์ระบบ",
            email: "jane@example.com",
            isLeader: false,
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003", // Valid UUID
            name: "บ๊อบ จอห์นสัน",
            role: "หัวหน้าทีม",
            avatar: "/placeholder.svg",
            teamRole: "หัวหน้างาน",
            department: "จัดการโครงการ",
            email: "bob@example.com",
            isLeader: true,
          }
        ]
        setTeamMembers(mockMembers)
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [teamId, toast])

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
        type: "TODO" as const,
        scheduledAt: new Date(formData.date).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        category: "TASK",
        link: formData.link && formData.link.trim() ? formData.link.trim() : null,
        linkUsername: formData.username && formData.username.trim() ? formData.username.trim() : null,
        linkPassword: formData.password && formData.password.trim() ? formData.password.trim() : null,
        impact: formData.impact && formData.impact.trim() ? formData.impact.trim() : null,
        urgencyDays: 3,
        repeatIntervalDays: 0,
        recipients: formData.isTeamAssignment
          ? teamMembers.map(member => ({ type: 'USER' as const, userId: member.id }))
          : formData.selectedMembers.map(memberId => ({ type: 'USER' as const, userId: memberId }))
      }

      // Log the payload before sending
      console.log("📤 Sending payload to API:", JSON.stringify(payload, null, 2))
      console.log("👥 Team members IDs:", teamMembers.map(m => ({ id: m.id, name: m.name })))
      console.log("📝 Selected member IDs:", formData.selectedMembers)
      
      // Validate UUIDs before sending
      const invalidUUIDs = payload.recipients
        .filter(r => r.userId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.userId))
        .map(r => r.userId)
      
      if (invalidUUIDs.length > 0) {
        console.error("❌ Invalid UUID format detected:", invalidUUIDs)
        toast({
          title: "ข้อผิดพลาดในข้อมูล",
          description: `รหัสสมาชิกไม่ถูกต้อง: ${invalidUUIDs.join(", ")}`,
          variant: "destructive",
        })
        return
      }
      
      // Call API
      await notificationApi.createNotification(payload)

      // Show success toast
      toast({
        title: "สร้างการแจ้งเตือนสำเร็จ",
        description: `การแจ้งเตือน "${formData.title}" ถูกสร้างเรียบร้อยแล้ว`,
      })

      // Close dialog and reset form
      setIsAddDialogOpen(false)
      resetForm()

      // โหลดข้อมูลใหม่
      await refreshNotifications()
    } catch (error: any) {
      console.error("Failed to create notification:", error)
      console.error("Error response:", error?.response?.data)
      if (error?.response?.data?.details) {
        console.error("Validation details:", JSON.stringify(error.response.data.details, null, 2));
      }
      // Extract detailed error message from validation errors
      let errorMessage = "ไม่สามารถสร้างการแจ้งเตือนได้"
      if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details.map((detail: any) => {
          if (detail.message) return detail.message
          if (detail.path) return `ข้อผิดพลาดในฟิลด์: ${detail.path.join('.')}`
          return JSON.stringify(detail)
        }).join(", ")
        errorMessage = `ข้อผิดพลาดในการตรวจสอบข้อมูล: ${validationErrors}\n\nรายละเอียด: ${JSON.stringify(error.response.data.details, null, 2)}`
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Refresh notifications function
  const refreshNotifications = async () => {
    try {
      if (teamId) {
        // โหลดข้อมูลทีมเฉพาะที่เลือก
        const team = await teamsApi.get(teamId)
        const notiRes = await notificationsApi.getAll(1, 50)
        
        // Filter notifications for this team
        const teamNotifications = notiRes.data.filter((noti: any) => 
          noti.recipients?.some((r: any) => 
            team.members.some(member => member.id === r.userId)
          )
        )
        
        // Transform API notifications to local format
        const transformedNotifications = teamNotifications.map((noti: any) => ({
          id: noti.id,
          title: noti.title,
          details: noti.message || noti.details || '',
          impact: noti.impact || '',
          date: noti.createdAt || new Date().toISOString(),
          dueDate: noti.scheduledAt || new Date().toISOString(),
          frequency: 'no-repeat',
          type: 'TODO', // <<--- fix: set type เป็น 'TODO' เสมอ
          priority: noti.priority || 'medium',
          status: noti.status || 'draft',
          isTeamAssignment: true,
          assignments: noti.recipients?.map((r: any) => {
            const member = team.members.find(m => m.id === r.userId)
            return {
              memberId: r.userId,
              memberName: member?.name || 'Unknown',
              status: r.status || 'pending',
              assignedAt: noti.createdAt || new Date().toISOString()
            }
          }) || []
        }))
        setNotifications(transformedNotifications)
        setTotalPages(Math.ceil(transformedNotifications.length / 10))
      } else {
        // ถ้าไม่มี teamId ให้โหลดทีมทั้งหมดและใช้ทีมแรก
        const teamsRes = await teamsApi.list()
        if (teamsRes.data.length > 0) {
          setNotifications([]) // Reset notifications
          setTotalPages(1)
        }
      }
    } catch (error) {
      console.error("Failed to refresh notifications:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการแจ้งเตือนได้",
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
        impact: formData.impact,
        scheduledAt: new Date(formData.date).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        type: "TODO" as const,
        category: "TASK",
        link: formData.link || undefined,
        linkUsername: formData.username || undefined,
        linkPassword: formData.password || undefined,
        urgencyDays: 3,
        repeatIntervalDays: 0,
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
      await refreshNotifications()
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
      await refreshNotifications()
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
      link: "", // เพิ่ม link
      username: "", // เพิ่ม username 
      password: "", // เพิ่ม password
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
      link: "",
      username: "",
      password: "",
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
