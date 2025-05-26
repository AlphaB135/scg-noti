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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export default function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const systemSettingsSchema = z.object({
    systemName: z.string().min(2, { message: "กรุณากรอกชื่อระบบอย่างน้อย 2 ตัวอักษร" }),
    defaultLanguage: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
    timeFormat: z.string(),
    autoLogout: z.number().int().min(5).max(120),
    enableAuditLog: z.boolean(),
    enableAnalytics: z.boolean(),
  })

  type SystemSettingsValues = z.infer<typeof systemSettingsSchema>

  const defaultValues: SystemSettingsValues = {
    systemName: "SCG ระบบแจ้งเตือน",
    defaultLanguage: "th-TH",
    timezone: "Asia/Bangkok",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    autoLogout: 30,
    enableAuditLog: true,
    enableAnalytics: true,
  }

  const form = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues,
  })

  async function onSubmit(data: SystemSettingsValues) {
    setIsLoading(true)

    try {
      await simulateApiDelay(1000)
      toast.success("บันทึกการตั้งค่าสำเร็จ")
    } catch (error) {
      toast.error("ไม่สามารถบันทึกการตั้งค่าได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-noto">
      <Card>
        <CardHeader>
          <CardTitle>การกำหนดค่าระบบ</CardTitle>
          <CardDescription>ตั้งค่าระบบและค่าพื้นฐานโดยรวม</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="systemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อระบบ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>ชื่อนี้จะแสดงในหัวเบราว์เซอร์และอีเมล</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ภาษาพื้นฐาน</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกภาษา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en-US">อังกฤษ (US)</SelectItem>
                          <SelectItem value="th-TH">ไทย</SelectItem>
                          <SelectItem value="zh-CN">จีน (ตัวย่อ)</SelectItem>
                          <SelectItem value="ja-JP">ญี่ปุ่น</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เขตเวลา</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกเขตเวลา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Asia/Bangkok">กรุงเทพฯ (GMT+7)</SelectItem>
                          <SelectItem value="Asia/Singapore">สิงคโปร์ (GMT+8)</SelectItem>
                          <SelectItem value="Asia/Tokyo">โตเกียว (GMT+9)</SelectItem>
                          <SelectItem value="Europe/London">ลอนดอน (GMT+0)</SelectItem>
                          <SelectItem value="America/New_York">นิวยอร์ก (GMT-5)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รูปแบบวันที่</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกรูปแบบวันที่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รูปแบบเวลา</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกรูปแบบเวลา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12h">12 ชั่วโมง (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 ชั่วโมง</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoLogout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ออกจากระบบอัตโนมัติ (นาที)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          max={120}
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>เวลาที่ไม่มีการใช้งานก่อนจะออกจากระบบอัตโนมัติ (5–120 นาที)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="enableAuditLog"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>เปิดใช้งานการบันทึกกิจกรรม</FormLabel>
                        <FormDescription>บันทึกกิจกรรมของผู้ใช้ทั้งหมดเพื่อความปลอดภัยและการตรวจสอบย้อนหลัง</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableAnalytics"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>เปิดใช้งานระบบวิเคราะห์ข้อมูล</FormLabel>
                        <FormDescription>เก็บข้อมูลการใช้งานแบบไม่ระบุตัวตน เพื่อปรับปรุงระบบให้ดียิ่งขึ้น</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="bg-[#E2001A] hover:bg-[#C0001A] text-white">
                  {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
