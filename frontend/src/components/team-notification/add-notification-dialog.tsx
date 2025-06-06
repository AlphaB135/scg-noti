"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NotificationForm from "./notification-form"

type TeamMember = {
  id: string
  name: string
  role: string
  avatar?: string
}

type AddNotificationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    title: string
    details: string
    date: string
    dueDate: string
    frequency: string
    type: string
    priority: string
    isTeamAssignment: boolean
    selectedMembers: string[]
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleTeamAssignmentChange: (isTeamAssignment: boolean) => void
  handleMemberSelection: (memberId: string, isSelected: boolean) => void
  handleAddNotification: () => void
  teamMembers: TeamMember[]
  isLoading?: boolean
}

export default function AddNotificationDialog({
  isOpen,
  onOpenChange,
  formData,
  handleInputChange,
  handleSelectChange,
  handleTeamAssignmentChange,
  handleMemberSelection,
  handleAddNotification,
  teamMembers,
  isLoading = false,
}: AddNotificationDialogProps) {
  // Normalize teamMembers (defensive, in case parent passes raw API)
  const normalizedTeamMembers = Array.isArray(teamMembers)
    ? teamMembers.map((m) => ({
        id: m.id,
        name: m.name || '-',
        role: m.role || '-',
        avatar: m.avatar || undefined,
      }))
    : []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#2c3e50]">สร้างการแจ้งเตือนใหม่</DialogTitle>
        </DialogHeader>
        <NotificationForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleTeamAssignmentChange={handleTeamAssignmentChange}
          handleMemberSelection={handleMemberSelection}
          teamMembers={normalizedTeamMembers}
          isLoading={isLoading}
        />
        <DialogFooter className="flex gap-2 sm:gap-0 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none border-[#cbd5e0] text-[#4a5568] hover:bg-[#edf2f7]"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleAddNotification}
            className="flex-1 sm:flex-none bg-[#2c3e50] hover:bg-[#1a2530] text-white"
          >
            สร้างการแจ้งเตือน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
