"use client"

import { useState } from "react"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, ExternalLink, RefreshCw } from "lucide-react"

export default function IntegrationSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const [integrations, setIntegrations] = useState<any[]>([
    {
      id: "email",
      name: "Email Service",
      description: "Send notifications via email using SMTP",
      connected: true,
      status: "active",
      lastSync: "2023-05-01T10:30:00Z",
    },
    // ... other mock integrations
  ])

  const toggleIntegration = async (id: string, enabled: boolean) => {
    setIsLoading(true)
    try {
      await simulateApiDelay(1000)
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                connected: enabled,
                status: enabled ? "active" : "inactive",
                lastSync: enabled ? new Date().toISOString() : integration.lastSync,
              }
            : integration,
        ),
      )
      toast.success(`${enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"} การเชื่อมต่อ ${integrations.find((i) => i.id === id)?.name}`)
    } catch (error) {
      toast.error(`${enabled ? "ไม่สามารถเปิดใช้งาน" : "ไม่สามารถปิดใช้งาน"} การเชื่อมต่อ`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncIntegration = async (id: string) => {
    setIsLoading(true)
    try {
      await simulateApiDelay(1500)
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                status: "active",
                lastSync: new Date().toISOString(),
              }
            : integration,
        ),
      )
      toast.success(`ซิงค์ข้อมูลการเชื่อมต่อ ${integrations.find((i) => i.id === id)?.name}`)
    } catch (error) {
      toast.error("ไม่สามารถซิงค์การเชื่อมต่อได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-noto">การตั้งค่าอีเมล</CardTitle>
          <CardDescription className="font-noto">ตั้งค่าบริการอีเมลสำหรับส่งการแจ้งเตือน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server" className="font-noto">
                เซิร์ฟเวอร์ SMTP
              </Label>
              <Input id="smtp-server" defaultValue="smtp.scg.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port" className="font-noto">
                พอร์ต SMTP
              </Label>
              <Input id="smtp-port" defaultValue="587" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username" className="font-noto">
                ชื่อผู้ใช้
              </Label>
              <Input id="smtp-username" defaultValue="notifications@scg.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password" className="font-noto">
                รหัสผ่าน
              </Label>
              <Input id="smtp-password" type="password" defaultValue="••••••••••••" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="smtp-ssl" className="font-noto">
                ใช้งาน SSL/TLS
              </Label>
              <p className="font-noto text-sm text-muted-foreground">เปิดใช้งานการเชื่อมต่อที่ปลอดภัยสำหรับการส่งอีเมล</p>
            </div>
            <Switch id="smtp-ssl" defaultChecked />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" className="font-noto">
              ทดสอบการเชื่อมต่อ
            </Button>
            <Button className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white">บันทึกการตั้งค่าอีเมล</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">การเชื่อมต่อภายนอก</CardTitle>
          <CardDescription className="font-noto">เชื่อมต่อกับบริการภายนอกสำหรับการแจ้งเตือนและแลกเปลี่ยนข้อมูล</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1 mb-4 md:mb-0">
                <div className="flex items-center">
                  <h3 className="font-medium">{integration.name}</h3>
                  <div className="ml-2">{getStatusBadge(integration.status)}</div>
                </div>
                <p className="font-noto text-sm text-muted-foreground">{integration.description}</p>
                {integration.lastSync && (
                  <p className="font-noto text-xs text-muted-foreground">
                    ซิงค์ล่าสุด: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {integration.connected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncIntegration(integration.id)}
                    disabled={isLoading}
                    className="font-noto"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    ซิงค์
                  </Button>
                )}
                <Button variant="outline" size="sm" disabled={isLoading} className="font-noto">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  กำหนดค่า
                </Button>
                <Switch
                  id={`integration-${integration.id}`}
                  checked={integration.connected}
                  onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" className="font-noto w-full">
            <Check className="mr-2 h-4 w-4" />
            เพิ่มการเชื่อมต่อใหม่
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">การตั้งค่าเว็บฮุก</CardTitle>
          <CardDescription className="font-noto">ตั้งค่าเว็บฮุกสำหรับการส่งการแจ้งเตือนแบบเรียลไทม์</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>สำคัญ</AlertTitle>
            <AlertDescription>
              เว็บฮุกช่วยให้ระบบภายนอกรับข้อมูลเรียลไทม์จากระบบแจ้งเตือน โปรดตรวจสอบให้ endpoint ปลอดภัยและรองรับปริมาณคำขอที่คาดว่าจะรับ
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="font-noto">
              URL เว็บฮุก
            </Label>
            <Input id="webhook-url" defaultValue="https://api.example.com/webhooks/notifications" />
            <p className="font-noto text-xs text-muted-foreground">URL ที่จะรับคำขอ POST สำหรับเว็บฮุก</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-secret" className="font-noto">
              ความลับของเว็บฮุก
            </Label>
            <div className="flex gap-2">
              <Input id="webhook-secret" type="password" defaultValue="whsec_abcdefghijklmnopqrstuvwxyz" />
              <Button variant="outline" size="sm" className="font-noto">
                สร้างใหม่
              </Button>
            </div>
            <p className="font-noto text-xs text-muted-foreground">ใช้เพื่อยืนยันว่าคำขอมาจากระบบแจ้งเตือน SCG</p>
          </div>
          <div className="space-y-2">
            <Label className="font-noto">ประเภทเหตุการณ์</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-created" defaultChecked />
                <Label htmlFor="event-notification-created" className="font-noto">
                  สร้างการแจ้งเตือน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-updated" defaultChecked />
                <Label htmlFor="event-notification-updated" className="font-noto">
                  อัปเดตการแจ้งเตือน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-approved" defaultChecked />
                <Label htmlFor="event-notification-approved" className="font-noto">
                  อนุมัติการแจ้งเตือน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-rejected" defaultChecked />
                <Label htmlFor="event-notification-rejected" className="font-noto">
                  ปฏิเสธการแจ้งเตือน
                </Label>
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" className="font-noto">
              ทดสอบเว็บฮุก
            </Button>
            <Button className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white">บันทึกการตั้งค่าเว็บฮุก</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
