"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckSquare, Users } from "lucide-react"
import { dashboardApi, type DashboardStats } from "@/lib/api"
import { toast } from "sonner"

// Default stats object to use when data is not available
const defaultStats: DashboardStats = {
  notifications: {
    total: 0,
    pending: 0,
    approved: 0,
  },
  approvals: {
    total: 0,
    pending: 0,
    completed: 0,
  },
  users: {
    total: 0,
    active: 0,
  },
  recentActivity: [],
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardApi.getStats()
        // Make sure we have valid data with the expected structure
        setStats({
          notifications: {
            total: data?.notifications?.total ?? 0,
            pending: data?.notifications?.pending ?? 0,
            approved: data?.notifications?.approved ?? 0,
          },
          approvals: {
            total: data?.approvals?.total ?? 0,
            pending: data?.approvals?.pending ?? 0,
            completed: data?.approvals?.completed ?? 0,
          },
          users: {
            total: data?.users?.total ?? 0,
            active: data?.users?.active ?? 0,
          },
          recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : [],
        })
      } catch (error) {
        toast.error("Failed to load dashboard stats")
        console.error(error)
        // Keep the default stats on error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-300">Loading...</CardTitle>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gray-200 w-16 h-8 rounded"></div>
              <p className="text-xs text-muted-foreground mt-2 bg-gray-200 w-24 h-4 rounded"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate percentages safely
  const notificationPercentage =
    stats.notifications.total > 0 ? (stats.notifications.approved / stats.notifications.total) * 100 : 0

  const approvalPercentage = stats.approvals.total > 0 ? (stats.approvals.completed / stats.approvals.total) * 100 : 0

  const userPercentage = stats.users.total > 0 ? (stats.users.active / stats.users.total) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <Bell className="h-5 w-5 text-[#E2001A]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.notifications.total}</div>
          <p className="text-xs text-muted-foreground mt-1">{stats.notifications.pending} pending approval</p>
          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E2001A]"
              style={{
                width: `${notificationPercentage}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Approvals</CardTitle>
          <CheckSquare className="h-5 w-5 text-[#E2001A]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approvals.total}</div>
          <p className="text-xs text-muted-foreground mt-1">{stats.approvals.completed} completed</p>
          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E2001A]"
              style={{
                width: `${approvalPercentage}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
          <Users className="h-5 w-5 text-[#E2001A]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.users.total}</div>
          <p className="text-xs text-muted-foreground mt-1">{stats.users.active} active now</p>
          <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E2001A]"
              style={{
                width: `${userPercentage}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
