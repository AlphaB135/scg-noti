"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type Notification, notificationsApi } from "@/lib/api"
import { formatDate, truncateText } from "@/lib/utils"
import { toast } from "sonner"
import { Check, MoreVertical, Search, X } from "lucide-react"
import { ApprovalLogsDialog } from "./approval-logs-dialog"
import { EditNotificationDialog } from "./edit-notification-dialog"
import { DeleteNotificationDialog } from "./delete-notification-dialog"

export function NotificationsTable() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotifications(notifications)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredNotifications(
        notifications.filter(
          (notification) =>
            notification.title.toLowerCase().includes(query) ||
            notification.message.toLowerCase().includes(query) ||
            notification.status.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, notifications])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsApi.getAll()
      setNotifications(data)
      setFilteredNotifications(data)
    } catch (error) {
      toast.error("Failed to load notifications")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await notificationsApi.approve(id)
      toast.success("Notification approved successfully")
      fetchNotifications()
    } catch (error) {
      toast.error("Failed to approve notification")
      console.error(error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await notificationsApi.reject(id)
      toast.success("Notification rejected successfully")
      fetchNotifications()
    } catch (error) {
      toast.error("Failed to reject notification")
      console.error(error)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await notificationsApi.cancel(id)
      toast.success("Notification cancelled successfully")
      fetchNotifications()
    } catch (error) {
      toast.error("Failed to cancel notification")
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  return (
    <div className="bg-white rounded-md border">
      <div className="p-4 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search notifications..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchNotifications} className="ml-2">
          Refresh
        </Button>
      </div>

      <div className="border-t">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Target Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{truncateText(notification.message, 50)}</TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell>{formatDate(notification.createdAt)}</TableCell>
                    <TableCell>{notification.targetUsers.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {notification.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleApprove(notification.id)}
                              title="Approve"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReject(notification.id)}
                              title="Reject"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ApprovalLogsDialog notificationId={notification.id}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                View Approval Logs
                              </DropdownMenuItem>
                            </ApprovalLogsDialog>
                            <EditNotificationDialog notification={notification} onSuccess={fetchNotifications}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                            </EditNotificationDialog>
                            {notification.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => handleCancel(notification.id)}>Cancel</DropdownMenuItem>
                            )}
                            <DeleteNotificationDialog notificationId={notification.id} onSuccess={fetchNotifications}>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DeleteNotificationDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No notifications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
