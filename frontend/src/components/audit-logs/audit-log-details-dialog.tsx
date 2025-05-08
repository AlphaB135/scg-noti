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
          <DialogTitle className="font-noto">รายละเอียดบันทึกตรวจสอบ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">รหัส</h3>
              <p className="font-noto text-sm font-mono break-all">{log.id}</p>
            </div>
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">เวลาบันทึก</h3>
              <p className="font-noto text-sm">{formatDateTime(log.timestamp)}</p>
            </div>
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">รหัสผู้ใช้</h3>
              <p className="font-noto text-sm font-mono break-all">{log.userId}</p>
            </div>
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">การกระทำ</h3>
              <p className="font-noto text-sm">{log.action}</p>
            </div>
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">ที่อยู่ IP</h3>
              <p className="font-noto text-sm">{log.ipAddress}</p>
            </div>
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">รหัสสถานะ</h3>
              <p className="font-noto text-sm">{log.statusCode}</p>
            </div>
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">รหัสเซสชัน</h3>
              <p className="font-noto text-sm font-mono break-all">{log.sessionId}</p>
            </div>
          </div>

          <div>
            <h3 className="font-noto text-sm font-medium text-muted-foreground">ทรัพยากรเป้าหมาย</h3>
            <p className="font-noto text-sm font-mono break-all">{log.targetResource}</p>
          </div>

          <div>
            <h3 className="font-noto text-sm font-medium text-muted-foreground">ตัวแทนผู้ใช้</h3>
            <p className="font-noto text-sm break-all">{log.userAgent}</p>
          </div>

          {log.details && (
            <div>
              <h3 className="font-noto text-sm font-medium text-muted-foreground">รายละเอียดเพิ่มเติม</h3>
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
