"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { notificationsApi } from "@/lib/api"
import { toast } from "sonner"

interface CreateNotificationDialogProps {
  children: React.ReactNode
}

export function CreateNotificationDialog({ children }: CreateNotificationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetUsers, setTargetUsers] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !message || !targetUsers) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      await notificationsApi.create({
        title,
        message,
        createdBy: "current-user", // This would be dynamic in a real app
        targetUsers: targetUsers.split(",").map((user) => user.trim()),
      })

      toast.success("Notification created successfully")
      setOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to create notification")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setMessage("")
    setTargetUsers("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Notification</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetUsers">Target Users</Label>
            <Input
              id="targetUsers"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              placeholder="Enter user IDs separated by commas"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter user IDs separated by commas (e.g., user1, user2, user3)
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
              {loading ? "Creating..." : "Create Notification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
