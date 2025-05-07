"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { dashboardApi, type WorkItem } from "@/lib/api"
import { toast } from "sonner"

export function DashboardCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(false)
  const [workDates, setWorkDates] = useState<Date[]>([])
  const [month, setMonth] = useState<Date>(new Date())

  useEffect(() => {
    fetchWorkDates(month)
  }, [month])

  useEffect(() => {
    if (selectedDate) {
      fetchWorkItems(selectedDate)
    }
  }, [selectedDate])

  const fetchWorkDates = async (month: Date) => {
    try {
      const dates = await dashboardApi.getWorkDates(month)
      setWorkDates(dates.map((date) => new Date(date)))
    } catch (error) {
      console.error("Failed to fetch work dates:", error)
    }
  }

  const fetchWorkItems = async (date: Date) => {
    setLoading(true)
    try {
      const items = await dashboardApi.getWorkItems(date)
      setWorkItems(items)
    } catch (error) {
      toast.error("Failed to load work items")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth)
  }

  const clearSelection = () => {
    setSelectedDate(undefined)
    setWorkItems([])
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle>Work Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date()
              setMonth(today)
              setSelectedDate(today)
            }}
          >
            Today
          </Button>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const prevMonth = new Date(month)
                prevMonth.setMonth(prevMonth.getMonth() - 1)
                handleMonthChange(prevMonth)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                const nextMonth = new Date(month)
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                handleMonthChange(nextMonth)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={handleMonthChange}
              className="rounded-md border"
              modifiers={{
                hasWork: workDates,
              }}
              modifiersStyles={{
                hasWork: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  textDecorationColor: "#E2001A",
                  textDecorationThickness: "2px",
                },
              }}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{selectedDate ? `Work for ${formatDate(selectedDate)}` : "Select a date"}</h3>
              {selectedDate && (
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 border rounded-md">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate && workItems.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {workItems.map((item) => (
                  <div key={item.id} className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge className={cn(getStatusColor(item.status))}>{item.status}</Badge>
                      <span className="text-xs text-muted-foreground">{item.time ? item.time : "All day"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <p className="text-muted-foreground">No work items for this date</p>
                <Button variant="link" className="mt-2 text-[#E2001A]">
                  + Add work item
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-center">
                <p className="text-muted-foreground">Select a date to view work items</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
