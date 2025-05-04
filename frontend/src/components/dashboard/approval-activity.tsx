"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardApi, type DashboardStats } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

export function ApprovalActivity() {
  const [activities, setActivities] = useState<DashboardStats["recentActivity"]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getStats()
        // Ensure we have a valid array of activities
        setActivities(Array.isArray(data?.recentActivity) ? data.recentActivity : [])
      } catch (error) {
        toast.error("Failed to load approval activities")
        console.error(error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "approval":
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-sm">✓</span>
          </div>
        )
      case "rejection":
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-sm">✕</span>
          </div>
        )
      case "creation":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-sm">+</span>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 text-sm">•</span>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
