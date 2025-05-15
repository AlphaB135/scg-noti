"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

type PasswordDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  reminderPassword: string | undefined
  isPasswordVisible: boolean
  handleAuthenticate: () => void
}

export default function PasswordDialog({
  isOpen,
  onOpenChange,
  reminderPassword,
  isPasswordVisible,
  handleAuthenticate,
}: PasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>ยืนยันตัวตน</DialogTitle>
          <DialogDescription>กรุณาใส่รหัสผ่านของคุณเพื่อดูข้อมูล user-password</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!isPasswordVisible && (
            <div className="space-y-2">
              <Label htmlFor="auth-password">รหัสผ่านของคุณ</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ใส่รหัสผ่านของคุณ"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="link" className="text-xs p-0 h-auto text-red-500">
                  ลืมรหัสผ่าน?
                </Button>
              </div>
            </div>
          )}

          {isPasswordVisible && reminderPassword && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">ข้อมูล user-password:</div>
              <div className="text-base bg-white p-3 rounded border whitespace-pre-line">{reminderPassword}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          {!isPasswordVisible && (
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleAuthenticate} disabled={!authPassword}>
              ยืนยัน
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
