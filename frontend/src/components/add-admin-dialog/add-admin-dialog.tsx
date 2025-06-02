"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserCog } from "lucide-react"
import { toast } from "sonner"

interface AddAdminDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onAddAdmin: (data: AdminFormData) => Promise<void>
}

export interface AdminFormData {
  email: string
  role: "admin" | "superadmin"
  name: string
  position: string
}

export default function AddAdminDialog({ isOpen, setIsOpen, onAddAdmin }: AddAdminDialogProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    email: "",
    role: "admin",
    name: "",
    position: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!formData.email || !formData.name) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setIsSubmitting(true)
    try {
      await onAddAdmin(formData)
      setFormData({
        email: "",
        role: "admin",
        name: "",
        position: "",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error adding admin:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มแอดมินใหม่</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@company.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">ตำแหน่ง</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="กรอกตำแหน่ง"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">ระดับสิทธิ์</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "superadmin") => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="เลือกระดับสิทธิ์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center">
                    <UserCog className="h-4 w-4 mr-2 text-amber-600" />
                    แอดมิน
                  </div>
                </SelectItem>
                <SelectItem value="superadmin">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-red-600" />
                    ซุปเปอร์แอดมิน
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} className="bg-red-700 hover:bg-red-800 text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                กำลังเพิ่ม...
              </>
            ) : (
              "เพิ่มแอดมิน"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
