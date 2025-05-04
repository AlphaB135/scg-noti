"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { auditLogApi, type AuditLog } from "@/lib/audit-api"
import { toast } from "sonner"
import { AuditLogDetailsDialog } from "./audit-log-details-dialog"

export function AuditLogTable() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [currentPage])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await auditLogApi.getLogs({ page: currentPage, limit: 10 })
      setLogs(response.logs)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast.error("Failed to load audit logs")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetails(true)
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "READ":
        return <Badge className="bg-blue-100 text-blue-800">READ</Badge>
      case "WRITE":
        return <Badge className="bg-green-100 text-green-800">WRITE</Badge>
      case "DELETE":
        return <Badge className="bg-red-100 text-red-800">DELETE</Badge>
      case "LOGIN":
        return <Badge className="bg-purple-100 text-purple-800">LOGIN</Badge>
      case "LOGOUT":
        return <Badge className="bg-gray-100 text-gray-800">LOGOUT</Badge>
      case "UPDATE":
        return <Badge className="bg-yellow-100 text-yellow-800">UPDATE</Badge>
      default:
        return <Badge>{action}</Badge>
    }
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-100 text-green-800">{status}</Badge>
    } else if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
    } else if (status >= 500) {
      return <Badge className="bg-red-100 text-red-800">{status}</Badge>
    } else {
      return <Badge>{status}</Badge>
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={log.targetResource}>
                      {log.targetResource}
                    </TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>{getStatusBadge(log.statusCode)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {selectedLog && <AuditLogDetailsDialog log={selectedLog} open={showDetails} onOpenChange={setShowDetails} />}
    </>
  )
}
