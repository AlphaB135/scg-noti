"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { type NotificationStats, notificationsApi } from "@/lib/api"
import { toast } from "sonner"

export function NotificationStats() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await notificationsApi.getStats()
        setStats(data)
      } catch (error) {
        toast.error("Failed to load notification stats")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    { label: "Total", value: stats.total, color: "bg-blue-100 text-blue-800" },
    { label: "Pending", value: stats.pending, color: "bg-yellow-100 text-yellow-800" },
    { label: "Approved", value: stats.approved, color: "bg-green-100 text-green-800" },
    { label: "Rejected", value: stats.rejected, color: "bg-red-100 text-red-800" },
    { label: "Cancelled", value: stats.cancelled, color: "bg-gray-100 text-gray-800" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <div className={`text-2xl font-bold mt-1 ${item.color} inline-block px-2 py-1 rounded-md`}>
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
