"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import ReminderForm, { type ReminderFormData } from "./reminder-form"

type EditReminderDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: ReminderFormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleEditReminder: () => void
  isPasswordProtected: boolean
  isEditPasswordAuthenticated: boolean
  handleEditAuthenticate: () => void
  hasLogin: boolean
  setHasLogin: (value: boolean) => void
}

export default function EditReminderDialog({
  isOpen,
  onOpenChange,
  formData,
  handleInputChange,
  handleSelectChange,
  handleEditReminder,
  isPasswordProtected,
  isEditPasswordAuthenticated,
  handleEditAuthenticate,
  hasLogin,
  setHasLogin,
}: EditReminderDialogProps) {
  const [authPassword, setAuthPassword] = useState("")

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          setAuthPassword("")
        }
      }}
    >
      <DialogContent className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขการแจ้งเตือน</DialogTitle>
        </DialogHeader>
        <ReminderForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          isEdit={true}
          isPasswordProtected={isPasswordProtected}
          isEditPasswordAuthenticated={isEditPasswordAuthenticated}
          handleEditAuthenticate={handleEditAuthenticate}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          hasLogin={hasLogin}
          setHasLogin={setHasLogin}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleEditReminder}
            className="bg-red-600 hover:bg-red-700"
            disabled={!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()}
          >
            บันทึกการแก้ไข
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
