"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { approvalsApi, notificationsApi } from "@/lib/api"
import { toast } from "sonner"
import { SendIcon } from "lucide-react"

export function ApprovalPopupForm() {
  const [loading, setLoading] = useState(false)
  const [notificationId, setNotificationId] = useState("")
  const [userIds, setUserIds] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!notificationId || !userIds) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)

      // First, verify the notification exists
      await notificationsApi.getById(notificationId)

      // Then send the popup
      await approvalsApi.sendPopup({
        notificationId,
        userIds: userIds.split(",").map((id) => id.trim()),
      })

      toast.success("Approval popup sent successfully")
      resetForm()
    } catch (error) {
      toast.error("Failed to send approval popup")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNotificationId("")
    setUserIds("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Approval Popup</CardTitle>
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
            <Label htmlFor="userIds">User IDs</Label>
            <Input
              id="userIds"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder="Enter user IDs separated by commas"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter user IDs separated by commas (e.g., user1, user2, user3)
            </p>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#E2001A] hover:bg-[#C0001A] text-white">
            {loading ? (
              "Sending..."
            ) : (
              <>
                <SendIcon className="mr-2 h-4 w-4" />
                Send Approval Popup
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
