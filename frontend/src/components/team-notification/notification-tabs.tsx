"use client"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, Users, User } from "lucide-react"
import NotificationList from "./notification-list"

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

type NotificationTabsProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
  notificationCounts: {
    all: number
    team: number
    individual: number
    active: number
    completed: number
  }
  filteredNotifications: Notification[]
  onEdit: (notification: Notification) => void
  onDelete: (notification: Notification) => void
  onViewAssignments: (notification: Notification) => void
  teamMembers: TeamMember[]
}

export default function NotificationTabs({
  activeTab,
  setActiveTab,
  notificationCounts,
  filteredNotifications,
  onEdit,
  onDelete,
  onViewAssignments,
  teamMembers,
}: NotificationTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 bg-[#f1f5f9] p-0 h-auto">
          <TabsTrigger
            value="all"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2c3e50] data-[state=active]:bg-white data-[state=active]:text-[#2c3e50] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium">ทั้งหมด</span>
              <Badge variant="secondary" className="mt-1 bg-[#e2e8f0] text-[#475569]">
                {notificationCounts.all}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#3182ce] data-[state=active]:bg-white data-[state=active]:text-[#3182ce] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <Users className="h-3 w-3 mr-1" /> ทีม
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#bee3f8] text-[#3182ce]">
                {notificationCounts.team}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="individual"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#805ad5] data-[state=active]:bg-white data-[state=active]:text-[#805ad5] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <User className="h-3 w-3 mr-1" /> บุคคล
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#e9d8fd] text-[#805ad5]">
                {notificationCounts.individual}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#d69e2e] data-[state=active]:bg-white data-[state=active]:text-[#d69e2e] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" /> กำลังดำเนินการ
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#fefcbf] text-[#d69e2e]">
                {notificationCounts.active}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#38a169] data-[state=active]:bg-white data-[state=active]:text-[#38a169] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> เสร็จสิ้น
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#c6f6d5] text-[#38a169]">
                {notificationCounts.completed}
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 p-0">
          <NotificationList
            notifications={filteredNotifications}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewAssignments={onViewAssignments}
            teamMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="team" className="mt-0 p-0">
          <NotificationList
            notifications={filteredNotifications}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewAssignments={onViewAssignments}
            teamMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="individual" className="mt-0 p-0">
          <NotificationList
            notifications={filteredNotifications}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewAssignments={onViewAssignments}
            teamMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-0 p-0">
          <NotificationList
            notifications={filteredNotifications}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewAssignments={onViewAssignments}
            teamMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-0 p-0">
          <NotificationList
            notifications={filteredNotifications}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewAssignments={onViewAssignments}
            teamMembers={teamMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
