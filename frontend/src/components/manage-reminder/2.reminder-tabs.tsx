"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap } from "lucide-react"
import ReminderList from "./reminder-list"

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

type ReminderTabsProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
  reminderCounts: {
    all: number
    overdue: number
    urgent: number
    incomplete: number
    completed: number
  }
  filteredReminders: Reminder[]
  onEdit: (reminder: Reminder) => void
  onDelete: (reminder: Reminder) => void
  onToggleStatus: (reminder: Reminder) => void
  onViewPassword: (reminder: Reminder) => void
  getStatusBadge: (status: string) => React.ReactNode
  getFrequencyText: (frequency: string) => string
  getTypeIcon: (type: string) => React.ReactNode
  getDueDateStatus: (dateString: string) => React.ReactNode
  formatThaiDate: (dateString: string) => string
}

export default function ReminderTabs({
  activeTab,
  setActiveTab,
  reminderCounts,
  filteredReminders,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewPassword,
  getStatusBadge,
  getFrequencyText,
  getTypeIcon,
  getDueDateStatus,
  formatThaiDate,
}: ReminderTabsProps) {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-6">
        <TabsTrigger value="all" className="flex items-center gap-2">
          ทั้งหมด
          <Badge variant="secondary" className="ml-1">
            {reminderCounts.all}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="overdue" className="flex items-center gap-2">
          เลยกำหนด
          <Badge variant="secondary" className="ml-1">
            {reminderCounts.overdue}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="urgent" className="flex items-center gap-2">
          <Zap className="h-3 w-3 mr-1" /> งานด่วน
          <Badge variant="secondary" className="ml-1">
            {reminderCounts.urgent}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="incomplete" className="flex items-center gap-2">
          ยังไม่เสร็จ
          <Badge variant="secondary" className="ml-1">
            {reminderCounts.incomplete}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          เสร็จแล้ว
          <Badge variant="secondary" className="ml-1">
            {reminderCounts.completed}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <ReminderList
          reminders={filteredReminders}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewPassword={onViewPassword}
          getStatusBadge={getStatusBadge}
          getFrequencyText={getFrequencyText}
          getTypeIcon={getTypeIcon}
          getDueDateStatus={getDueDateStatus}
          formatThaiDate={formatThaiDate}
        />
      </TabsContent>

      <TabsContent value="overdue" className="mt-0">
        <ReminderList
          reminders={filteredReminders}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewPassword={onViewPassword}
          getStatusBadge={getStatusBadge}
          getFrequencyText={getFrequencyText}
          getTypeIcon={getTypeIcon}
          getDueDateStatus={getDueDateStatus}
          formatThaiDate={formatThaiDate}
        />
      </TabsContent>

      <TabsContent value="urgent" className="mt-0">
        <ReminderList
          reminders={filteredReminders}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewPassword={onViewPassword}
          getStatusBadge={getStatusBadge}
          getFrequencyText={getFrequencyText}
          getTypeIcon={getTypeIcon}
          getDueDateStatus={getDueDateStatus}
          formatThaiDate={formatThaiDate}
        />
      </TabsContent>

      <TabsContent value="incomplete" className="mt-0">
        <ReminderList
          reminders={filteredReminders}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewPassword={onViewPassword}
          getStatusBadge={getStatusBadge}
          getFrequencyText={getFrequencyText}
          getTypeIcon={getTypeIcon}
          getDueDateStatus={getDueDateStatus}
          formatThaiDate={formatThaiDate}
        />
      </TabsContent>

      <TabsContent value="completed" className="mt-0">
        <ReminderList
          reminders={filteredReminders}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewPassword={onViewPassword}
          getStatusBadge={getStatusBadge}
          getFrequencyText={getFrequencyText}
          getTypeIcon={getTypeIcon}
          getDueDateStatus={getDueDateStatus}
          formatThaiDate={formatThaiDate}
        />
      </TabsContent>
    </Tabs>
  )
}
