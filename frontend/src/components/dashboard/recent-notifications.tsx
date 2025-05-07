"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Notification, notificationsApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

export function RecentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const data = await notificationsApi.getAll()
        // Ensure data is an array before slicing
        const notificationsArray = Array.isArray(data) ? data : []
        setNotifications(notificationsArray.slice(0, 5)) // Get only the 5 most recent
      } catch (error) {
        toast.error("Failed to load recent notifications")
        console.error(error)
        // Set empty array on error
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="divide-y">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(notification.createdAt)}</p>
                      </div>
                      <Badge className={getStatusColor(notification.status)}>{notification.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
