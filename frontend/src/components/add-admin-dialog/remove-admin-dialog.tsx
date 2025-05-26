"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserMinus } from "lucide-react"

interface RemoveAdminDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  adminName: string
  onConfirm: () => void
  isLoading?: boolean
}

export default function RemoveAdminDialog({
  isOpen,
  setIsOpen,
  adminName,
  onConfirm,
  isLoading = false,
}: RemoveAdminDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบแอดมิน</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            คุณต้องการลบ <span className="font-semibold">{adminName}</span> ออกจากการเป็นแอดมินใช่หรือไม่?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
            <p>หมายเหตุ: การลบแอดมินจะทำให้ผู้ใช้งานไม่สามารถเข้าถึงระบบจัดการได้อีกต่อไป</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                กำลังลบ...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-1" />
                ยืนยันการลบแอดมิน
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
