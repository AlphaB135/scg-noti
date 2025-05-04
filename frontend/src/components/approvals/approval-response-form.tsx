"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { approvalsApi } from "@/lib/api"
import { toast } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"

export function ApprovalResponseForm() {
  const [loading, setLoading] = useState(false)
  const [notificationId, setNotificationId] = useState("")
  const [response, setResponse] = useState<"approve" | "reject">("approve")
  const [comments, setComments] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!notificationId) {
      toast.error("Please enter a notification ID")
      return
    }

    try {
      setLoading(true)
      await approvalsApi.sendResponse({
        notificationId,
        response,
        comments,
      })

      toast.success("Response submitted successfully")
      resetForm()
    } catch (error) {
      toast.error("Failed to submit response")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNotificationId("")
    setResponse("approve")
    setComments("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Approval Response</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notificationId">Notification ID</Label>
            <Input
              id="notificationId"
              value={notificationId}
              onChange={(e) => setNotificationId(e.target.value)}
              placeholder="Enter notification ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Response</Label>
            <RadioGroup
              value={response}
              onValueChange={(value) => setResponse(value as "approve" | "reject")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve" className="flex items-center">
                  <CheckCircle className="mr-1.5 h-4 w-4 text-green-600" />
                  Approve
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex items-center">
                  <XCircle className="mr-1.5 h-4 w-4 text-red-600" />
                  Reject
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments (Optional)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter any comments about your decision"
              rows={3}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#E2001A] hover:bg-[#C0001A] text-white">
            {loading ? "Submitting..." : "Submit Response"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
