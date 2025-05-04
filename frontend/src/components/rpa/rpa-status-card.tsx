"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CheckCircle, Clock, RefreshCw, XCircle } from "lucide-react"
import { simulateApiDelay } from "@/lib/mock-data"

interface RPAJob {
  id: string
  action: string
  status: "running" | "completed" | "failed"
  startTime: string
  endTime?: string
  result?: any
  error?: string
}

// Mock RPA jobs for demonstration
const mockRPAJobs: Record<string, RPAJob> = {
  "job-1": {
    id: "job-1",
    action: "send-email",
    status: "completed",
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() - 3540000).toISOString(),
    result: { success: true, message: "Email sent successfully to 5 recipients" },
  },
  "job-2": {
    id: "job-2",
    action: "generate-report",
    status: "running",
    startTime: new Date().toISOString(),
  },
  "job-3": {
    id: "job-3",
    action: "update-database",
    status: "failed",
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 7140000).toISOString(),
    error: "Database connection timeout after 60 seconds",
  },
  "job-4": {
    id: "job-4",
    action: "sync-systems",
    status: "completed",
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 86100000).toISOString(),
    result: { success: true, message: "Systems synchronized successfully", recordsProcessed: 1245 },
  },
}

export function RPAStatusCard() {
  const [jobId, setJobId] = useState("")
  const [loading, setLoading] = useState(false)
  const [job, setJob] = useState<RPAJob | null>(null)

  const handleCheckStatus = async () => {
    if (!jobId) {
      toast.error("Please enter a job ID")
      return
    }

    setLoading(true)

    try {
      // Simulate API delay
      await simulateApiDelay(800)

      // Check if job exists in our mock data
      if (mockRPAJobs[jobId]) {
        setJob(mockRPAJobs[jobId])
        toast.success("Job status retrieved")
      } else {
        // If job ID doesn't exist in our mock data, create a random status
        const randomStatus = ["running", "completed", "failed"][Math.floor(Math.random() * 3)] as
          | "running"
          | "completed"
          | "failed"

        const mockJob: RPAJob = {
          id: jobId,
          action: ["send-email", "generate-report", "update-database", "sync-systems"][Math.floor(Math.random() * 4)],
          status: randomStatus,
          startTime: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
          endTime: randomStatus !== "running" ? new Date().toISOString() : undefined,
          result:
            randomStatus === "completed" ? { success: true, message: "Operation completed successfully" } : undefined,
          error: randomStatus === "failed" ? "Operation failed due to system error" : undefined,
        }

        setJob(mockJob)
        toast.success("Job status retrieved")
      }
    } catch (error) {
      toast.error("Failed to retrieve job status")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>RPA Job Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="jobId">Job ID</Label>
              <Input
                id="jobId"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Enter RPA job ID (e.g., job-1, job-2)"
              />
              <p className="text-xs text-muted-foreground mt-1">Try job-1, job-2, job-3, job-4 or any custom ID</p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCheckStatus}
                disabled={loading}
                className="bg-[#E2001A] hover:bg-[#C0001A] text-white"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Check Status"}
              </Button>
            </div>
          </div>

          {job && (
            <div className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Job Details</h3>
                {getStatusBadge(job.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Job ID</p>
                  <p className="font-medium">{job.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Action</p>
                  <p className="font-medium">{job.action}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Time</p>
                  <p className="font-medium">{new Date(job.startTime).toLocaleString()}</p>
                </div>
                {job.endTime && (
                  <div>
                    <p className="text-muted-foreground">End Time</p>
                    <p className="font-medium">{new Date(job.endTime).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {job.result && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-sm font-medium text-green-800">Result</p>
                  <pre className="text-xs mt-1 text-green-700 overflow-auto">{JSON.stringify(job.result, null, 2)}</pre>
                </div>
              )}

              {job.error && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-xs mt-1 text-red-700">{job.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              Enter a job ID to check the status of an RPA action. You can find the job ID in the response after
              triggering an action.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
