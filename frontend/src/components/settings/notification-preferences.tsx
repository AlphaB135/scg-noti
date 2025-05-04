"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"

export function NotificationPreferences() {
  const [isLoading, setIsLoading] = useState(false)

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [digestFrequency, setDigestFrequency] = useState("daily")
  const [notificationSound, setNotificationSound] = useState("default")

  // Notification types state
  const [systemUpdates, setSystemUpdates] = useState(true)
  const [approvalRequests, setApprovalRequests] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [newsAndAnnouncements, setNewsAndAnnouncements] = useState(true)
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true)

  async function handleSave() {
    setIsLoading(true)

    try {
      // Simulate API call
      await simulateApiDelay(1000)
      toast.success("Notification preferences saved")
    } catch (error) {
      toast.error("Failed to save notification preferences")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Delivery</CardTitle>
          <CardDescription>Configure how you want to receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
              </div>
              <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
              </div>
              <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Notification Digest Frequency</Label>
              <RadioGroup
                value={digestFrequency}
                onValueChange={setDigestFrequency}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="realtime" id="realtime" />
                  <Label htmlFor="realtime">Real-time (Immediate)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Daily Digest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly Digest</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-sound">Notification Sound</Label>
              <Select value={notificationSound} onValueChange={setNotificationSound}>
                <SelectTrigger id="notification-sound">
                  <SelectValue placeholder="Select a sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="bell">Bell</SelectItem>
                  <SelectItem value="none">None (Silent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>Select which types of notifications you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-updates">System Updates</Label>
            <Switch id="system-updates" checked={systemUpdates} onCheckedChange={setSystemUpdates} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="approval-requests">Approval Requests</Label>
            <Switch id="approval-requests" checked={approvalRequests} onCheckedChange={setApprovalRequests} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="security-alerts">Security Alerts</Label>
            <Switch id="security-alerts" checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="news-announcements">News & Announcements</Label>
            <Switch id="news-announcements" checked={newsAndAnnouncements} onCheckedChange={setNewsAndAnnouncements} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
            <Switch id="maintenance-alerts" checked={maintenanceAlerts} onCheckedChange={setMaintenanceAlerts} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
