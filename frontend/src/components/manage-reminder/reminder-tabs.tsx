"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"
import ReminderList from "./reminder-list"

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
                {reminderCounts.all}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#e53e3e] data-[state=active]:bg-white data-[state=active]:text-[#e53e3e] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> เลยกำหนด
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#fed7d7] text-[#e53e3e]">
                {reminderCounts.overdue}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="urgent"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#dd6b20] data-[state=active]:bg-white data-[state=active]:text-[#dd6b20] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <Zap className="h-3 w-3 mr-1" /> งานด่วน
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#feebc8] text-[#dd6b20]">
                {reminderCounts.urgent}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="incomplete"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#d69e2e] data-[state=active]:bg-white data-[state=active]:text-[#d69e2e] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" /> ยังไม่เสร็จ
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#fefcbf] text-[#d69e2e]">
                {reminderCounts.incomplete}
              </Badge>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-[#38a169] data-[state=active]:bg-white data-[state=active]:text-[#38a169] transition-all"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> เสร็จแล้ว
              </span>
              <Badge variant="secondary" className="mt-1 bg-[#c6f6d5] text-[#38a169]">
                {reminderCounts.completed}
              </Badge>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 p-0">
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

        <TabsContent value="overdue" className="mt-0 p-0">
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

        <TabsContent value="urgent" className="mt-0 p-0">
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

        <TabsContent value="incomplete" className="mt-0 p-0">
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

        <TabsContent value="completed" className="mt-0 p-0">
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
    </div>
  )
}
