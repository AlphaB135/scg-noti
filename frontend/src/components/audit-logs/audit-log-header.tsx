import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function AuditLogHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Monitor and review all system activities</p>
      </div>
      <Button variant="outline" className="w-full md:w-auto">
        <Download className="mr-2 h-4 w-4" />
        Export Logs
      </Button>
    </div>
  )
}
