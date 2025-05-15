"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export type ReminderFormData = {
  title: string
  date: string
  frequency: string
  details: string
  link: string
  password: string
  username: string
  impact: string
  hasLogin: boolean
}

type ReminderFormProps = {
  formData: ReminderFormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  isEdit?: boolean
  isPasswordProtected?: boolean
  isEditPasswordAuthenticated?: boolean
  handleEditAuthenticate?: () => void
  authPassword?: string
  setAuthPassword?: (value: string) => void
  hasLogin: boolean
  setHasLogin: (value: boolean) => void
}

export default function ReminderForm({
  formData,
  handleInputChange,
  handleSelectChange,
  isEdit = false,
  isPasswordProtected = false,
  isEditPasswordAuthenticated = false,
  handleEditAuthenticate,
  authPassword = "",
  setAuthPassword,
  hasLogin,
  setHasLogin,
}: ReminderFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const prefix = isEdit ? "edit-" : ""

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}title`}>
          หัวข้องาน <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`${prefix}title`}
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="กรอกหัวข้องาน"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}date`}>
          วันที่แจ้งเตือน <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`${prefix}date`}
          name="date"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}frequency`}>
          ความถี่ <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกความถี่" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-repeat">เตือนไม่ทำซ้ำ</SelectItem>
            <SelectItem value="yearly">ทุกปี</SelectItem>
            <SelectItem value="monthly">เตือนทุกเดือน</SelectItem>
            <SelectItem value="weekly">ทุกอาทิตย์</SelectItem>
            <SelectItem value="daily">เตือนทุกวัน</SelectItem>
            <SelectItem value="quarterly">ทุกไตรมาส</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}details`}>
          รายละเอียด <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id={`${prefix}details`}
          name="details"
          value={formData.details}
          onChange={handleInputChange}
          placeholder="กรอกรายละเอียดเพิ่มเติม"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}impact`}>
          ผลกระทบหากงานไม่เสร็จ <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id={`${prefix}impact`}
          name="impact"
          value={formData.impact}
          onChange={handleInputChange}
          placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}link`}>ลิงก์ (ถ้ามี)</Label>
        <Input
          id={`${prefix}link`}
          name="link"
          value={formData.link}
          onChange={handleInputChange}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${prefix}hasLogin`}
            checked={hasLogin}
            onChange={(e) => {
              setHasLogin(e.target.checked)
              handleInputChange({
                target: {
                  name: "hasLogin",
                  value: e.target.checked,
                },
              } as React.ChangeEvent<HTMLInputElement>)
            }}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <Label htmlFor={`${prefix}hasLogin`}>งานที่ต้องมีการล็อคอิน</Label>
        </div>

        {hasLogin && (
          <div className="grid gap-4 mt-2 p-3 bg-gray-50 rounded-md">
            {isPasswordProtected && !isEditPasswordAuthenticated ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">ยืนยันตัวตนเพื่อดูข้อมูล user-password</span>
                  </div>
                  <p>กรุณาใส่รหัสผ่านของคุณเพื่อดูและแก้ไขข้อมูล user-password</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${prefix}auth-password`}>รหัสผ่านของคุณ</Label>
                  <div className="relative">
                    <Input
                      id={`${prefix}auth-password`}
                      type={showPassword ? "text" : "password"}
                      placeholder="ใส่รหัสผ่านของคุณ"
                      value={authPassword}
                      onChange={(e) => setAuthPassword && setAuthPassword(e.target.value)}
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

                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleEditAuthenticate}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!authPassword}
                    >
                      ยืนยันตัวตน
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor={`${prefix}username`}>Username</Label>
                  <Input
                    id={`${prefix}username`}
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="ระบุ username ที่ใช้ในการล็อคอิน"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${prefix}password`}>Password</Label>
                  <Input
                    id={`${prefix}password`}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="ระบุ password ที่ใช้ในการล็อคอิน"
                    type="text"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
