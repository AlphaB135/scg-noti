"use client"

import { useState } from "react"
import { toast } from "sonner"
import { simulateApiDelay } from "@/lib/mock-data"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, Calendar, Trash2 } from "lucide-react"

export default function DataManagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")
  const [exportProgress, setExportProgress] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i)
        await simulateApiDelay(300)
      }

      toast.success("ส่งออกข้อมูลสำเร็จ")

      setTimeout(() => {
        const link = document.createElement("a")
        link.href = "#"
        link.download = `scg-notifications-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, 500)
    } catch (error) {
      toast.error("ไม่สามารถส่งออกข้อมูลได้")
      console.error(error)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    setImportProgress(0)

    try {
      for (let i = 0; i <= 100; i += 5) {
        setImportProgress(i)
        await simulateApiDelay(200)
      }

      toast.success("นำเข้าข้อมูลสำเร็จ")
    } catch (error) {
      toast.error("ไม่สามารถนำเข้าข้อมูลได้")
      console.error(error)
    } finally {
      setIsImporting(false)
      setImportProgress(0)
    }
  }

  const handlePurgeData = async () => {
    setIsLoading(true)

    try {
      await simulateApiDelay(2000)
      toast.success("ล้างข้อมูลสำเร็จ")
    } catch (error) {
      toast.error("ไม่สามารถล้างข้อมูลได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="export" className="font-noto">
            ส่งออกข้อมูล
          </TabsTrigger>
          <TabsTrigger value="import" className="font-noto">
            นำเข้าข้อมูล
          </TabsTrigger>
          <TabsTrigger value="purge" className="font-noto">
            ล้างข้อมูล
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-noto">ส่งออกข้อมูล</CardTitle>
              <CardDescription className="font-noto">ส่งออกข้อมูลแจ้งเตือนเพื่อสำรองหรือย้ายระบบ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-format" className="font-noto">
                  รูปแบบไฟล์
                </Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="เลือกประเภทไฟล์" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json" className="font-noto">
                      JSON
                    </SelectItem>
                    <SelectItem value="csv" className="font-noto">
                      CSV
                    </SelectItem>
                    <SelectItem value="xlsx" className="font-noto">
                      Excel (XLSX)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-noto">ข้อมูลที่จะส่งออก</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-notifications" defaultChecked />
                    <Label htmlFor="export-notifications" className="font-noto">
                      แจ้งเตือน
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-approvals" defaultChecked />
                    <Label htmlFor="export-approvals" className="font-noto">
                      บันทึกการอนุมัติ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-users" defaultChecked />
                    <Label htmlFor="export-users" className="font-noto">
                      ข้อมูลผู้ใช้
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-settings" />
                    <Label htmlFor="export-settings" className="font-noto">
                      การตั้งค่าระบบ
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-noto">ช่วงวันที่</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="export-start-date" className="font-noto text-xs">
                      วันที่เริ่มต้น
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="export-start-date"
                        type="date"
                        className="pl-8"
                        defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="export-end-date" className="font-noto text-xs">
                      วันที่สิ้นสุด
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="export-end-date"
                        type="date"
                        className="pl-8"
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-noto">ความคืบหน้าการส่งออก</Label>
                    <span className="font-noto text-sm">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white"
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                {isExporting ? "กำลังส่งออก..." : "ส่งออกข้อมูล"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-noto">นำเข้าข้อมูล</CardTitle>
              <CardDescription className="font-noto">นำเข้าข้อมูลแจ้งเตือนจากไฟล์</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-noto">สำคัญ</AlertTitle>
                <AlertDescription className="font-noto">
                  การนำเข้าข้อมูลจะผสานกับข้อมูลเดิม โปรดตรวจสอบว่าไฟล์ของคุณอยู่ในรูปแบบที่ถูกต้อง
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="import-file" className="font-noto">
                  ไฟล์นำเข้า
                </Label>
                <Input id="import-file" type="file" />
                <p className="font-noto text-xs text-muted-foreground">รองรับ: JSON, CSV, XLSX</p>
              </div>

              <div className="space-y-2">
                <Label className="font-noto">ตัวเลือกการนำเข้า</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-overwrite" />
                    <Label htmlFor="import-overwrite" className="font-noto">
                      เขียนทับข้อมูลเดิม
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="import-validate" defaultChecked />
                    <Label htmlFor="import-validate" className="font-noto">
                      ตรวจสอบก่อนนำเข้า
                    </Label>
                  </div>
                </div>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-noto">ความคืบหน้าการนำเข้า</Label>
                    <span className="font-noto text-sm">{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white"
              >
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                {isImporting ? "กำลังนำเข้า..." : "นำเข้าข้อมูล"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="purge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-noto">ล้างข้อมูล</CardTitle>
              <CardDescription className="font-noto">ลบข้อมูลเก่าหรือไม่จำเป็นถาวร</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-noto">คำเตือน</AlertTitle>
                <AlertDescription className="font-noto">
                  การล้างข้อมูลไม่สามารถกู้คืนได้ ควรส่งออกข้อมูลสำรองก่อนดำเนินการ
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="font-noto">ข้อมูลที่จะล้าง</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purge-notifications" />
                    <Label htmlFor="purge-notifications" className="font-noto">
                      การแจ้งเตือน
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purge-approvals" />
                    <Label htmlFor="purge-approvals" className="font-noto">
                      บันทึกการอนุมัติ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purge-logs" />
                    <Label htmlFor="purge-logs" className="font-noto">
                      บันทึกกิจกรรม
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purge-older-than" className="font-noto">
                  ล้างข้อมูลเก่าเกิน
                </Label>
                <Select defaultValue="90">
                  <SelectTrigger id="purge-older-than">
                    <SelectValue placeholder="เลือกช่วงเวลา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30" className="font-noto">
                      30 วัน
                    </SelectItem>
                    <SelectItem value="90" className="font-noto">
                      90 วัน
                    </SelectItem>
                    <SelectItem value="180" className="font-noto">
                      6 เดือน
                    </SelectItem>
                    <SelectItem value="365" className="font-noto">
                      1 ปี
                    </SelectItem>
                    <SelectItem value="all" className="font-noto">
                      ทั้งหมด
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purge-confirmation" className="font-noto">
                  พิมพ์ "PURGE" เพื่อยืนยัน
                </Label>
                <Input id="purge-confirmation" placeholder="PURGE" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="destructive" onClick={handlePurgeData} disabled={isLoading} className="font-noto">
                <Trash2 className="mr-2 h-4 w-4" />
                {isLoading ? "กำลังล้าง..." : "ล้างข้อมูล"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
