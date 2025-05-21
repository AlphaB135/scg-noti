"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

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
    <div className="grid gap-6 py-6">
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}title`} className="text-sm font-medium text-[#2c3e50]">
          หัวข้องาน
        </Label>
        <Input
          id={`${prefix}title`}
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="กรอกหัวข้องาน"
          required
          className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}date`} className="text-sm font-medium text-[#2c3e50]">
            วันที่แจ้งเตือน
          </Label>
          <Input
            id={`${prefix}date`}
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${prefix}frequency`} className="text-sm font-medium text-[#2c3e50]">
            ความถี่
          </Label>
          <Select value={formData.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
            <SelectTrigger className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]">
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
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}details`} className="text-sm font-medium text-[#2c3e50]">
          รายละเอียด
        </Label>
        <Textarea
          id={`${prefix}details`}
          name="details"
          value={formData.details}
          onChange={handleInputChange}
          placeholder="กรอกรายละเอียดเพิ่มเติม"
          required
          className="min-h-[120px] border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}impact`} className="text-sm font-medium text-[#2c3e50]">
          ผลกระทบหากงานไม่เสร็จ
        </Label>
        <Textarea
          id={`${prefix}impact`}
          name="impact"
          value={formData.impact}
          onChange={handleInputChange}
          placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
          required
          className="min-h-[100px] border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${prefix}link`} className="text-sm font-medium text-[#2c3e50]">
          ลิงก์ (ถ้ามี)
        </Label>
        <Input
          id={`${prefix}link`}
          name="link"
          value={formData.link}
          onChange={handleInputChange}
          placeholder="https://example.com"
          type="url"
          className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${prefix}hasLogin`}
            checked={hasLogin}
            onCheckedChange={(checked) => {
              const isChecked = checked === true
              setHasLogin(isChecked)
              handleInputChange({
                target: {
                  name: "hasLogin",
                  value: isChecked,
                },
              } as React.ChangeEvent<HTMLInputElement>)
            }}
            className="text-[#2c3e50] focus:ring-[#2c3e50]"
          />
          <Label htmlFor={`${prefix}hasLogin`} className="text-sm font-medium text-[#2c3e50]">
            งานที่ต้องมีการล็อคอิน
          </Label>
        </div>

        {hasLogin && (
          <div className="grid gap-4 mt-3 p-5 bg-[#f7fafc] rounded-md border border-[#e2e8f0]">
            {isPasswordProtected && !isEditPasswordAuthenticated ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#fffaf0] border border-[#feebc8] rounded-md text-[#dd6b20] text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="font-medium">ยืนยันตัวตนเพื่อดูข้อมูล user-password</span>
                  </div>
                  <p>กรุณาใส่รหัสผ่านของคุณเพื่อดูและแก้ไขข้อมูล user-password</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${prefix}auth-password`} className="text-sm font-medium text-[#2c3e50]">
                    รหัสผ่านของคุณ
                  </Label>
                  <div className="relative">
                    <Input
                      id={`${prefix}auth-password`}
                      type={showPassword ? "text" : "password"}
                      placeholder="ใส่รหัสผ่านของคุณ"
                      value={authPassword}
                      onChange={(e) => setAuthPassword && setAuthPassword(e.target.value)}
                      className="pr-10 border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
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

                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={handleEditAuthenticate}
                      className="bg-[#2c3e50] hover:bg-[#1a2530] text-white"
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
                  <Label htmlFor={`${prefix}username`} className="text-sm font-medium text-[#2c3e50]">
                    Username
                  </Label>
                  <Input
                    id={`${prefix}username`}
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="ระบุ username ที่ใช้ในการล็อคอิน"
                    className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${prefix}password`} className="text-sm font-medium text-[#2c3e50]">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id={`${prefix}password`}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="ระบุ password ที่ใช้ในการล็อคอิน"
                      type={showPassword ? "text" : "password"}
                      className="pr-10 border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
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
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
