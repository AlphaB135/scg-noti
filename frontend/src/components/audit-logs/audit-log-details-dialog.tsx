"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { AuditLog } from "@/lib/audit-api"
import { formatDateTime } from "@/lib/utils"

interface AuditLogDetailsDialogProps {
  log: AuditLog
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailsDialog({ log, open, onOpenChange }: AuditLogDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p className="text-sm font-mono break-all">{log.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
              <p className="text-sm">{formatDateTime(log.timestamp)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
              <p className="text-sm font-mono break-all">{log.userId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Action</h3>
              <p className="text-sm">{log.action}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">IP Address</h3>
              <p className="text-sm">{log.ipAddress}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status Code</h3>
              <p className="text-sm">{log.statusCode}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Session ID</h3>
              <p className="text-sm font-mono break-all">{log.sessionId}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Target Resource</h3>
            <p className="text-sm font-mono break-all">{log.targetResource}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">User Agent</h3>
            <p className="text-sm break-all">{log.userAgent}</p>
          </div>

          {log.details && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded-md overflow-auto max-h-[200px] mt-1">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
