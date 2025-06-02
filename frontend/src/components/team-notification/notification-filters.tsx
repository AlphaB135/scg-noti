"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type NotificationFiltersProps = {
  statusFilter: string
  setStatusFilter: (status: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  filterDate: string
  setFilterDate: (date: string) => void
}

export default function NotificationFilters({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  filterDate,
  setFilterDate,
}: NotificationFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
      <h3 className="text-[#2c3e50] font-semibold mb-4 text-lg">ตัวกรองขั้นสูง</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#2c3e50]">กรองตามวันที่</Label>
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="bg-white border-gray-300 focus:ring-[#2c3e50] focus:border-[#2c3e50]">
              <SelectValue placeholder="กรองตามวันที่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="today">วันนี้</SelectItem>
              <SelectItem value="thisWeek">สัปดาห์นี้</SelectItem>
              <SelectItem value="thisMonth">เดือนนี้</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#2c3e50]">กรองตามสถานะ</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-gray-300 focus:ring-[#2c3e50] focus:border-[#2c3e50]">
              <SelectValue placeholder="กรองตามสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="active">กำลังดำเนินการ</SelectItem>
              <SelectItem value="completed">เสร็จสิ้น</SelectItem>
              <SelectItem value="overdue">เลยกำหนด</SelectItem>
              <SelectItem value="draft">ร่าง</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#2c3e50]">กรองตามประเภท</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-white border-gray-300 focus:ring-[#2c3e50] focus:border-[#2c3e50]">
              <SelectValue placeholder="กรองตามประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="meeting">การประชุม</SelectItem>
              <SelectItem value="report">รายงาน</SelectItem>
              <SelectItem value="document">เอกสาร</SelectItem>
              <SelectItem value="purchase">การสั่งซื้อ</SelectItem>
              <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
              <SelectItem value="data">ข้อมูล</SelectItem>
              <SelectItem value="training">การอบรม</SelectItem>
              <SelectItem value="finance">การเงิน</SelectItem>
              <SelectItem value="TODO">งานที่ต้องทำ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
