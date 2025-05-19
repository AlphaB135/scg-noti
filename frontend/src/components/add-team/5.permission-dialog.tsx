"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserCog, UserPlus } from "lucide-react"
import type { PermissionLevel, TeamMember } from "@/components/types/team"

interface PermissionDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  selectedMember: TeamMember | null
  selectedPermission: PermissionLevel
  setSelectedPermission: (permission: PermissionLevel) => void
  handleUpdatePermission: () => void
}

export default function PermissionDialog({
  isOpen,
  setIsOpen,
  selectedMember,
  selectedPermission,
  setSelectedPermission,
  handleUpdatePermission,
}: PermissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>กำหนดสิทธิ์การใช้งาน</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            กำหนดสิทธิ์การใช้งานให้กับ <span className="font-semibold">{selectedMember?.name}</span>
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ระดับสิทธิ์</label>
              <Select
                value={selectedPermission}
                onValueChange={(value: PermissionLevel) => setSelectedPermission(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสิทธิ์การใช้งาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-red-600" />
                      แอดมินทีม
                    </div>
                  </SelectItem>
                  <SelectItem value="leader">
                    <div className="flex items-center">
                      <UserCog className="h-4 w-4 mr-2 text-amber-600" />
                      หัวหน้าทีม
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center">
                      <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
                      สมาชิก
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">รายละเอียดสิทธิ์</h4>
              <div className="text-sm text-gray-600">
                {selectedPermission === "admin" && <p>สามารถจัดการพนักงานและทีมทั้งหมดได้ รวมถึงกำหนดสิทธิ์ให้ผู้อื่น</p>}
                {selectedPermission === "leader" && <p>สามารถเพิ่ม/ลบสมาชิกในทีมตัวเองได้ และจัดการข้อมูลทีม</p>}
                {selectedPermission === "member" && <p>สามารถแก้ไขข้อมูลทีมได้ แต่ไม่สามารถเพิ่ม/ลบสมาชิก</p>}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleUpdatePermission} className="bg-red-700 hover:bg-red-800 text-white">
            บันทึกสิทธิ์
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
