"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReminderForm, { type ReminderFormData } from "./reminder-form"

type AddReminderDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: ReminderFormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleAddReminder: () => void
  hasLogin: boolean
  setHasLogin: (value: boolean) => void
}

export default function AddReminderDialog({
  isOpen,
  onOpenChange,
  formData,
  handleInputChange,
  handleSelectChange,
  handleAddReminder,
  hasLogin,
  setHasLogin,
}: AddReminderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้างการแจ้งเตือนใหม่</DialogTitle>
        </DialogHeader>
        <ReminderForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          hasLogin={hasLogin}
          setHasLogin={setHasLogin}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleAddReminder}
            className="bg-red-600 hover:bg-red-700"
            disabled={!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()}
          >
            สร้างการแจ้งเตือน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
