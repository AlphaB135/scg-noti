"use client"

import { useState } from "react"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function NotificationPreferences() {
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
    <div className="space-y-6 font-noto">
      <Card>
        <CardHeader>
          <CardTitle>การส่งการแจ้งเตือน</CardTitle>
          <CardDescription>กำหนดรูปแบบการแจ้งเตือน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">การแจ้งเตือนทางอีเมล</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่านทางอีเมล</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">การแจ้งเตือนแบบพุช</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่านเบราว์เซอร์ของคุณ</p>
              </div>
              <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">การแจ้งเตือนทาง Line</Label>
                <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่าน Line</p>
              </div>
              <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>ความถี่ในการสรุปการแจ้งเตือน</Label>
              <RadioGroup
                value={digestFrequency}
                onValueChange={setDigestFrequency}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="realtime" id="realtime" />
                  <Label htmlFor="realtime">เรียลไทม์ ( ทันที )</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">สรุปรายวัน</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">สรุปรายสัปดาห์</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-sound">เสียงแจ้งเตือน</Label>
              <Select value={notificationSound} onValueChange={setNotificationSound}>
                <SelectTrigger id="notification-sound">
                  <SelectValue placeholder="Select a sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">ค่าเริ่มต้น</SelectItem>
                  <SelectItem value="chime">เสียงกระทบ</SelectItem>
                  <SelectItem value="bell">เสียงกระดิ่ง</SelectItem>
                  <SelectItem value="none">ไม่มีเสียง (เงียบ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ประเภทการแจ้งเตือน</CardTitle>
          <CardDescription>เลือกประเภทการแจ้งเตือนที่คุณต้องการรับ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-updates">อัปเดตระบบ</Label>
            <Switch id="system-updates" checked={systemUpdates} onCheckedChange={setSystemUpdates} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="approval-requests">คำขออนุมัติ</Label>
            <Switch id="approval-requests" checked={approvalRequests} onCheckedChange={setApprovalRequests} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="security-alerts">การแจ้งเตือนด้านความปลอดภัย</Label>
            <Switch id="security-alerts" checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="news-announcements">ข่าวสารและประกาศ</Label>
            <Switch id="news-announcements" checked={newsAndAnnouncements} onCheckedChange={setNewsAndAnnouncements} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-alerts">การแจ้งเตือนการบำรุงรักษา</Label>
            <Switch id="maintenance-alerts" checked={maintenanceAlerts} onCheckedChange={setMaintenanceAlerts} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
            {isLoading ? "Saving..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
