"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { rpaApi } from "@/lib/api"
import { toast } from "sonner"
import { Play } from "lucide-react"

const RPA_ACTIONS = [
  { value: "send-email", label: "Send Email" },
  { value: "generate-report", label: "Generate Report" },
  { value: "update-database", label: "Update Database" },
  { value: "sync-systems", label: "Sync Systems" },
]

export function RPATriggerForm() {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState("")
  const [parameters, setParameters] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!action) {
      toast.error("Please select an action")
      return
    }

    try {
      setLoading(true)

      let parsedParams = {}
      if (parameters) {
        try {
          parsedParams = JSON.parse(parameters)
        } catch (error) {
          toast.error("Invalid JSON parameters")
          return
        }
      }

      const result = await rpaApi.trigger({
        action,
        parameters: parsedParams,
      })

      if (result.success) {
        toast.success(`RPA action triggered successfully. Job ID: ${result.jobId}`)
      } else {
        toast.error(`Failed to trigger RPA action: ${result.message}`)
      }
    } catch (error) {
      toast.error("Failed to trigger RPA action")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trigger RPA Action</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={setAction} required>
              <SelectTrigger id="action">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {RPA_ACTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parameters">Parameters (JSON)</Label>
            <Textarea
              id="parameters"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              placeholder='{"key": "value"}'
              rows={5}
            />
            <p className="text-xs text-muted-foreground">Enter parameters as a valid JSON object</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#E2001A] hover:bg-[#C0001A] text-white">
            {loading ? (
              "Triggering..."
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Trigger Action
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
