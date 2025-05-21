"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

type DeleteNotificationDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  notificationTitle: string
  handleDeleteNotification: () => void
}

export default function DeleteNotificationDialog({
  isOpen,
  onOpenChange,
  notificationTitle,
  handleDeleteNotification,
}: DeleteNotificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#2c3e50]">ยืนยันการลบการแจ้งเตือน</DialogTitle>
        </DialogHeader>
        <div className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-[#fff5f5] p-4 rounded-full mb-5">
              <AlertTriangle className="h-8 w-8 text-[#e53e3e]" />
            </div>
            <p className="text-[#4a5568] font-medium text-lg">คุณต้องการลบการแจ้งเตือน</p>
            <p className="text-[#e53e3e] font-semibold text-lg mt-2">"{notificationTitle}"</p>
            <p className="text-gray-500 text-sm mt-5">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none border-[#cbd5e0] text-[#4a5568] hover:bg-[#edf2f7]"
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteNotification}
            className="flex-1 sm:flex-none bg-[#e53e3e] hover:bg-[#c53030] text-white"
          >
            ลบการแจ้งเตือน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
