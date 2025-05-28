"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LeaveTeamDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  teamName: string
  onConfirm: () => void
  isLeader?: boolean
}

export default function LeaveTeamDialog({
  isOpen,
  setIsOpen,
  teamName,
  onConfirm,
  isLeader = false,
}: LeaveTeamDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการออกจากทีม</DialogTitle>
        </DialogHeader>
        <div className="pt-6 pb-4">
          <p className="mb-4">
            คุณต้องการออกจากทีม <span className="font-semibold">{teamName}</span> ใช่หรือไม่?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
            {isLeader ? (
              <p>หมายเหตุ: คุณเป็นหัวหน้าทีม หากคุณเป็นหัวหน้าทีมคนเดียว ควรมอบหมายหัวหน้าทีมคนใหม่ก่อนออกจากทีม</p>
            ) : (
              <p>หมายเหตุ: การออกจากทีมจะทำให้คุณไม่สามารถเข้าถึงข้อมูลของทีมได้อีกต่อไป</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            <LogOut className="h-4 w-4 mr-1" />
            ยืนยันการออกจากทีม
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
