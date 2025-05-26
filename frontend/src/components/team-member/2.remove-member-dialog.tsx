"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserMinus } from "lucide-react"

interface RemoveMemberDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  memberName: string
  onConfirm: () => void
}

export default function RemoveMemberDialog({ isOpen, setIsOpen, memberName, onConfirm }: RemoveMemberDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการนำสมาชิกออกจากทีม</DialogTitle>
        </DialogHeader>
        <div className="pt-6 pb-4">
          <p className="mb-4">
            คุณต้องการนำ <span className="font-semibold">{memberName}</span> ออกจากทีมใช่หรือไม่?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
            <p>หมายเหตุ: การนำสมาชิกออกจากทีมจะทำให้สมาชิกไม่สามารถเข้าถึงข้อมูลของทีมได้อีกต่อไป</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            <UserMinus className="h-4 w-4 mr-1" />
            ยืนยันการนำออกจากทีม
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
