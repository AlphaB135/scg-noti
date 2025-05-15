"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type DeleteReminderDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  reminderTitle: string
  handleDeleteReminder: () => void
}

export default function DeleteReminderDialog({
  isOpen,
  onOpenChange,
  reminderTitle,
  handleDeleteReminder,
}: DeleteReminderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบการแจ้งเตือน</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-gray-700">คุณต้องการลบการแจ้งเตือน "{reminderTitle}" ใช่หรือไม่?</p>
          <p className="text-center text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={handleDeleteReminder} className="bg-red-600 hover:bg-red-700">
            ลบการแจ้งเตือน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
