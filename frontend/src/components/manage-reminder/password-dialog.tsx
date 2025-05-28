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
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react"
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
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#2c3e50]">ยืนยันตัวตน</DialogTitle>
          <DialogDescription>กรุณาใส่รหัสผ่านของคุณเพื่อดูข้อมูล user-password</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-6">
          {!isPasswordVisible && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-[#ebf8ff] p-4 rounded-full">
                  <Lock className="h-8 w-8 text-[#3182ce]" />
                </div>
              </div>

              <Label htmlFor="auth-password" className="text-[#2c3e50] font-medium">
                รหัสผ่านของคุณ
              </Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ใส่รหัสผ่านของคุณ"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="pr-10 border-[#cbd5e0] focus:border-[#3182ce] focus:ring-[#3182ce]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="link" className="text-xs p-0 h-auto text-[#3182ce] hover:text-[#2b6cb0]">
                  ลืมรหัสผ่าน?
                </Button>
              </div>
            </div>
          )}

          {isPasswordVisible && reminderPassword && (
            <div className="p-6 bg-[#f7fafc] rounded-lg border border-[#e2e8f0] mt-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-[#3182ce]" />
                <div className="text-sm font-medium text-[#2c3e50]">ข้อมูล user-password:</div>
              </div>
              <div className="text-base bg-white p-4 rounded border border-[#e2e8f0] whitespace-pre-line shadow-sm">
                {reminderPassword}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none border-[#cbd5e0] text-[#4a5568] hover:bg-[#edf2f7]"
          >
            ปิด
          </Button>
          {!isPasswordVisible && (
            <Button
              className="flex-1 sm:flex-none bg-[#3182ce] hover:bg-[#2b6cb0] text-white"
              onClick={handleAuthenticate}
              disabled={!authPassword}
            >
              ยืนยัน
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
