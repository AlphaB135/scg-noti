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
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#2c3e50]">สร้างการแจ้งเตือนใหม่</DialogTitle>
        </DialogHeader>
        <ReminderForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          hasLogin={hasLogin}
          setHasLogin={setHasLogin}
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
            onClick={handleAddReminder}
            className="flex-1 sm:flex-none bg-[#2c3e50] hover:bg-[#1a2530] text-white"
          >
            สร้างการแจ้งเตือน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
