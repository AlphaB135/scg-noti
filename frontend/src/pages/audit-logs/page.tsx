import { AuditLogHeader } from "@/components/audit-logs/audit-log-header"
import { AuditLogFilters } from "@/components/audit-logs/audit-log-filters"
import { AuditLogTable } from "@/components/audit-logs/audit-log-table"

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <AuditLogHeader />
      <AuditLogFilters />
      <AuditLogTable />
    </div>
  )
}
