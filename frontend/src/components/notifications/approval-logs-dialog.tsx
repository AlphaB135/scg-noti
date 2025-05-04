"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type ApprovalLog, notificationsApi } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"

interface ApprovalLogsDialogProps {
  children: React.ReactNode
  notificationId: string
}

export function ApprovalLogsDialog({ children, notificationId }: ApprovalLogsDialogProps) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<ApprovalLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await notificationsApi.getApprovalLogs(notificationId)
      setLogs(data)
    } catch (error) {
      toast.error("Failed to load approval logs")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>{action}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Approval Logs</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex justify-between p-2">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>{log.actionBy}</TableCell>
                    <TableCell>{formatDateTime(log.actionAt)}</TableCell>
                    <TableCell>{log.comments || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No approval logs found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
