"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History } from "lucide-react"

interface SearchFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterType: string
  setFilterType: (type: string) => void
  filterDate: string
  setFilterDate: (date: string) => void
}

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterDate,
  setFilterDate,
}: SearchFilterProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <History className="mr-2 h-5 w-5 text-red-700" />
          ค้นหาและกรองประวัติการดำเนินการ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ช่องค้นหา */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาตามชื่องาน, รายละเอียด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* ตัวกรองประเภทการดำเนินการ */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="กรองตามประเภทการดำเนินการ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="task_created">สร้างงานใหม่</SelectItem>
              <SelectItem value="task_completed">ทำงานเสร็จแล้ว</SelectItem>
              <SelectItem value="task_updated">แก้ไขงาน</SelectItem>
              <SelectItem value="task_postponed">เลื่อนกำหนดส่ง</SelectItem>
              <SelectItem value="task_reopened">เปิดงานใหม่</SelectItem>
              <SelectItem value="task_deleted">ลบงาน</SelectItem>
            </SelectContent>
          </Select>

          {/* ตัวกรองตามวันที่ */}
          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger>
              <SelectValue placeholder="กรองตามวันที่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="today">วันนี้</SelectItem>
              <SelectItem value="yesterday">เมื่อวาน</SelectItem>
              <SelectItem value="last7days">7 วันที่ผ่านมา</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
