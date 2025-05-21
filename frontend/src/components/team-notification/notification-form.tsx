"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, User } from "lucide-react"

type TeamMember = {
  id: string
  name: string
  role: string
  avatar?: string
}

type NotificationFormProps = {
  formData: {
    title: string
    details: string
    date: string
    dueDate: string
    frequency: string
    type: string
    priority: string
    isTeamAssignment: boolean
    selectedMembers: string[]
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectChange: (name: string, value: string) => void
  handleTeamAssignmentChange: (isTeamAssignment: boolean) => void
  handleMemberSelection: (memberId: string, isSelected: boolean) => void
  teamMembers: TeamMember[]
  isEdit?: boolean
}

export default function NotificationForm({
  formData,
  handleInputChange,
  handleSelectChange,
  handleTeamAssignmentChange,
  handleMemberSelection,
  teamMembers,
  isEdit = false,
}: NotificationFormProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}date`} className="text-sm font-medium text-[#2c3e50]">
            วันที่สร้าง
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
          <Label htmlFor={`${prefix}dueDate`} className="text-sm font-medium text-[#2c3e50]">
            กำหนดส่ง
          </Label>
          <Input
            id={`${prefix}dueDate`}
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
            className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="grid gap-2">
          <Label htmlFor={`${prefix}type`} className="text-sm font-medium text-[#2c3e50]">
            ประเภท
          </Label>
          <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
            <SelectTrigger className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]">
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">ไม่ระบุ</SelectItem>
              <SelectItem value="meeting">การประชุม</SelectItem>
              <SelectItem value="report">รายงาน</SelectItem>
              <SelectItem value="document">เอกสาร</SelectItem>
              <SelectItem value="purchase">การสั่งซื้อ</SelectItem>
              <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
              <SelectItem value="data">ข้อมูล</SelectItem>
              <SelectItem value="training">การอบรม</SelectItem>
              <SelectItem value="finance">การเงิน</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${prefix}priority`} className="text-sm font-medium text-[#2c3e50]">
            ความสำคัญ
          </Label>
          <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
            <SelectTrigger className="border-[#cbd5e0] focus:border-[#2c3e50] focus:ring-[#2c3e50]">
              <SelectValue placeholder="เลือกความสำคัญ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">ต่ำ</SelectItem>
              <SelectItem value="medium">ปานกลาง</SelectItem>
              <SelectItem value="high">สูง</SelectItem>
              <SelectItem value="urgent">ด่วนมาก</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 pt-2">
        <Label className="text-sm font-medium text-[#2c3e50]">การมอบหมายงาน</Label>
        <RadioGroup
          defaultValue={formData.isTeamAssignment ? "team" : "individual"}
          className="flex flex-col space-y-1"
          onValueChange={(value) => handleTeamAssignmentChange(value === "team")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="team" id={`${prefix}team-assignment`} />
            <Label htmlFor={`${prefix}team-assignment`} className="flex items-center gap-2 cursor-pointer">
              <Users className="h-4 w-4 text-[#3182ce]" /> มอบหมายให้ทั้งทีม ({teamMembers.length} คน)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id={`${prefix}individual-assignment`} />
            <Label htmlFor={`${prefix}individual-assignment`} className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4 text-[#805ad5]" /> เลือกมอบหมายเป็นรายบุคคล
            </Label>
          </div>
        </RadioGroup>
      </div>

      {!formData.isTeamAssignment && (
        <div className="grid gap-4 pt-2">
          <Label className="text-sm font-medium text-[#2c3e50]">เลือกสมาชิกที่ต้องการมอบหมายงาน</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2 border rounded-md hover:bg-gray-50">
                <Checkbox
                  id={`${prefix}member-${member.id}`}
                  checked={formData.selectedMembers.includes(member.id)}
                  onCheckedChange={(checked) => handleMemberSelection(member.id, checked === true)}
                  className="text-[#2c3e50] focus:ring-[#2c3e50]"
                />
                <Label
                  htmlFor={`${prefix}member-${member.id}`}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={member.name} />
                    <AvatarFallback className="bg-[#2c3e50] text-white text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[#2c3e50]">{member.name}</p>
                    <p className="text-xs text-[#718096]">{member.role}</p>
                  </div>
                </Label>
              </div>
            ))}
          </div>
          {formData.selectedMembers.length > 0 && (
            <div className="text-sm text-[#4a5568]">
              เลือกแล้ว {formData.selectedMembers.length} คน จากทั้งหมด {teamMembers.length} คน
            </div>
          )}
        </div>
      )}
    </div>
  )
}
