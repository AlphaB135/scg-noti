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
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input id="search" placeholder="Search logs..." className="pl-8" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
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
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-id">User ID</Label>
              <Input
                id="user-id"
                placeholder="Filter by user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READ">READ</SelectItem>
                  <SelectItem value="WRITE">WRITE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="LOGIN">LOGIN</SelectItem>
                  <SelectItem value="LOGOUT">LOGOUT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-code">Status Code</Label>
              <Input
                id="status-code"
                placeholder="Filter by status code"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ip-address">IP Address</Label>
              <Input
                id="ip-address"
                placeholder="Filter by IP address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource">Target Resource</Label>
              <Input
                id="resource"
                placeholder="Filter by resource path"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
            <Button className="bg-[#E2001A] hover:bg-[#C0001A] text-white">Apply Filters</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
