"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Filter, Search, Plus } from "lucide-react"
import { useState } from "react"

type ReminderFilterProps = {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  typeFilter: string
  setTypeFilter: (type: string) => void
  filterDate: string
  setFilterDate: (date: string) => void
  onAddClick: () => void
}

export default function ReminderFilter({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  filterDate,
  setFilterDate,
  onAddClick,
}: ReminderFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="ค้นหาการแจ้งเตือน..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="w-full md:w-auto">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={16} />
              ตัวกรอง
              <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-4 bg-white rounded-lg border shadow-sm absolute z-10 w-full md:w-[400px] right-0">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>กรองตามวันที่</Label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger>
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
                <Label>กรองตามสถานะ</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="กรองตามสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="completed">เสร็จแล้ว</SelectItem>
                    <SelectItem value="incomplete">ยังไม่เสร็จ</SelectItem>
                    <SelectItem value="overdue">เลยกำหนด</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>กรองตามประเภท</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button onClick={onAddClick} className="bg-gradient-to-b from-red-700 to-red-800 hover:bg-red-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> สร้างการแจ้งเตือน
        </Button>
      </div>
    </div>
  )
}
