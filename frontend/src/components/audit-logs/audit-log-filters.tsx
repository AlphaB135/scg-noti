"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AuditLogFilters() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [userId, setUserId] = useState("")
  const [action, setAction] = useState("")
  const [statusCode, setStatusCode] = useState("")
  const [ipAddress, setIpAddress] = useState("")
  const [resource, setResource] = useState("")

  const handleClearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setUserId("")
    setAction("")
    setStatusCode("")
    setIpAddress("")
    setResource("")
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="font-noto">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="search" placeholder="ค้นหาบันทึก..." className="pl-8 font-noto" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-noto">ช่วงวันที่</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal font-noto",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "วันที่เริ่มต้น"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal font-noto",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "วันที่สิ้นสุด"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-id" className="font-noto">รหัสผู้ใช้</Label>
              <Input
                id="user-id"
                placeholder="กรองตามรหัสผู้ใช้"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="font-noto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action" className="font-noto">การกระทำ</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="action" className="font-noto">
                  <SelectValue placeholder="เลือกการกระทำ" />
                </SelectTrigger>
                <SelectContent>
                  {['READ','WRITE','DELETE','LOGIN','LOGOUT','UPDATE'].map((a) => (
                    <SelectItem key={a} value={a} className="font-noto">{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-code" className="font-noto">รหัสสถานะ</Label>
              <Input
                id="status-code"
                placeholder="กรองตามรหัสสถานะ"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                className="font-noto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip-address" className="font-noto">IP Address</Label>
              <Input
                id="ip-address"
                placeholder="กรองตามที่อยู่ IP"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="font-noto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource" className="font-noto">ทรัพยากรเป้าหมาย</Label>
              <Input
                id="resource"
                placeholder="กรองตามเส้นทางทรัพยากร"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="font-noto"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClearFilters} className="gap-2 font-noto">
              <X className="h-4 w-4" />
              ล้างตัวกรอง
            </Button>
            <Button className="bg-[#E2001A] hover:bg-[#C0001A] text-white font-noto">
              ใช้ตัวกรอง
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
