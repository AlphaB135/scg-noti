"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle, Check, Copy, RefreshCw } from "lucide-react"

export default function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [apiKey, setApiKey] = useState("scg_api_" + Math.random().toString(36).substring(2, 15))

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, { message: "กรุณากรอกรหัสผ่านปัจจุบัน" }),
      newPassword: z
        .string()
        .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" })
        .regex(/[A-Z]/, { message: "ต้องมีตัวพิมพ์ใหญ่อย่างน้อยหนึ่งตัว" })
        .regex(/[a-z]/, { message: "ต้องมีตัวพิมพ์เล็กอย่างน้อยหนึ่งตัว" })
        .regex(/[0-9]/, { message: "ต้องมีตัวเลขอย่างน้อยหนึ่งตัว" })
        .regex(/[^A-Za-z0-9]/, {
          message: "ต้องมีอักขระพิเศษอย่างน้อยหนึ่งตัว",
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "รหัสผ่านไม่ตรงกัน",
      path: ["confirmPassword"],
    })

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: z.infer<typeof passwordSchema>) {
    setIsLoading(true)

    try {
      await simulateApiDelay(1000)
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ")
      form.reset()
    } catch (error) {
      toast.error("ไม่สามารถเปลี่ยนรหัสผ่านได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    setTwoFactorEnabled(checked)
    if (checked) {
      setShowTwoFactorSetup(true)
    } else {
      setShowTwoFactorSetup(false)
      toast.success("ปิดการยืนยันตัวตนสองชั้นแล้ว")
    }
  }

  const regenerateApiKey = async () => {
    setIsLoading(true)

    try {
      await simulateApiDelay(1000)
      setApiKey("scg_api_" + Math.random().toString(36).substring(2, 15))
      toast.success("สร้างคีย์ API ใหม่สำเร็จ")
    } catch (error) {
      toast.error("ไม่สามารถสร้างคีย์ API ใหม่ได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success("คัดลอกคีย์ API ไปยังคลิปบอร์ดแล้ว")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-noto">เปลี่ยนรหัสผ่าน</CardTitle>
          <CardDescription className="font-noto">อัปเดตรหัสผ่านเพื่อให้บัญชีของคุณปลอดภัย</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-noto">รหัสผ่านปัจจุบัน</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-noto">รหัสผ่านใหม่</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription className="font-noto">
                      รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-noto">ยืนยันรหัสผ่านใหม่</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white"
              >
                {isLoading ? "กำลังเปลี่ยนรหัสผ่าน..." : "เปลี่ยนรหัสผ่าน"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">การยืนยันตัวตนสองชั้น</CardTitle>
          <CardDescription className="font-noto">เพิ่มชั้นความปลอดภัยให้บัญชีของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="font-noto">
                การยืนยันตัวตนสองชั้น
              </Label>
              <p className="font-noto text-sm text-muted-foreground">ต้องใช้รหัสยืนยันเมื่อเข้าสู่ระบบ</p>
            </div>
            <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>

          {showTwoFactorSetup && (
            <div className="mt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ต้องการตั้งค่า</AlertTitle>
                <AlertDescription>สแกน QR code ด้านล่างด้วยแอป Authenticator เพื่อตั้งค่าการยืนยันตัวตนสองชั้น</AlertDescription>
              </Alert>

              <div className="flex justify-center p-4">
                <div className="border p-4 bg-white">
                  <img
                    src="/placeholder.svg?height=200&width=200"
                    alt="Two-factor authentication QR code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code" className="font-noto">
                  รหัสยืนยัน
                </Label>
                <div className="flex gap-2">
                  <Input id="verification-code" placeholder="กรอกรหัส 6 หลัก" maxLength={6} />
                  <Button className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white">
                    <Check className="mr-2 h-4 w-4" />
                    ยืนยัน
                  </Button>
                </div>
              </div>

              <p className="font-noto text-sm text-muted-foreground">
                หากคุณสูญเสียการเข้าถึงแอป Authenticator คุณจะต้องติดต่อฝ่ายสนับสนุนเพื่อกู้คืนการเข้าถึงบัญชี
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">เข้าถึง API</CardTitle>
          <CardDescription className="font-noto">จัดการคีย์ API สำหรับการเข้าถึงระบบผ่านโปรแกรม</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="font-noto">
              คีย์ API
            </Label>
            <div className="flex gap-2">
              <Input id="api-key" value={apiKey} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={copyApiKey} className="font-noto">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="font-noto text-sm text-muted-foreground">คีย์นี้ให้สิทธิ์เข้าถึง API ทั้งหมด เก็บให้ปลอดภัยและห้ามแชร์</p>
          </div>

          <Button variant="outline" onClick={regenerateApiKey} disabled={isLoading} className="font-noto">
            <RefreshCw className="mr-2 h-4 w-4" />
            สร้างคีย์ API ใหม่
          </Button>

          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>คำเตือน</AlertTitle>
            <AlertDescription>การสร้างคีย์ API ใหม่จะทำให้คีย์เดิมใช้งานไม่ได้และอาจทำให้การเชื่อมต่อระบบล้มเหลว</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">เซสชันการเข้าสู่ระบบ</CardTitle>
          <CardDescription className="font-noto">จัดการเซสชันที่กำลังใช้งาน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-noto font-medium">เซสชันปัจจุบัน</p>
                  <p className="font-noto text-sm text-muted-foreground">Chrome บน Windows • กรุงเทพฯ ประเทศไทย</p>
                  <p className="font-noto text-xs text-muted-foreground mt-1">เริ่มเมื่อ 2 ชั่วโมงที่แล้ว • IP: 192.168.1.1</p>
                </div>
                <Badge className="font-noto bg-green-100 text-green-800">กำลังใช้งาน</Badge>
              </div>
              <div className="border-t p-4 flex items-center justify-between">
                <div>
                  <p className="font-noto font-medium">แอปมือถือ</p>
                  <p className="font-noto text-sm text-muted-foreground">iPhone • กรุงเทพฯ ประเทศไทย</p>
                  <p className="font-noto text-xs text-muted-foreground mt-1">เริ่มเมื่อ 3 วันก่อน • IP: 192.168.2.2</p>
                </div>
                <Button variant="outline" size="sm" className="font-noto text-red-500">
                  เพิกถอน
                </Button>
              </div>
            </div>

            <Button variant="destructive" className="font-noto">
              เพิกถอนเซสชันอื่นทั้งหมด
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
