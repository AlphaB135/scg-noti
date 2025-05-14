"use client"
import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Bell,
  Clock,
  DollarSign,
  LogOut,
  Users,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Search,
  Settings,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ManageReminder() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [reminders, setReminders] = useState<any[]>([])
  const [cycleReminders, setCycleReminders] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentReminder, setCurrentReminder] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [showPassword, setShowPassword] = useState(false)
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false)

  // Form state for new/edit reminder
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    frequency: "no-repeat",
    details: "",
    link: "",
    password: "",
    impact: "",
  })

  useEffect(() => {
    // 2.1) ดึงงาน manual
    const fetchManualReminders = async () => {
      try {
        const { data } = await axios.get("/api/notifications", {
          withCredentials: true,
          params: { skip: 0, take: 100 },
        })
        setReminders(data)
      } catch (e) {
        console.error("Failed to load manual reminders", e)
      }
    }

    // 2.2) ดึงงาน cycle
    const fetchCycleReminders = async () => {
      try {
        const { data } = await axios.get("/api/notifications/cycles", {
          withCredentials: true,
          params: { skip: 0, take: 100 },
        })
        setCycleReminders(data)
      } catch (e) {
        console.error("Failed to load cycle reminders", e)
      }
    }

    fetchManualReminders()
    fetchCycleReminders()
  }, []) // รันแค่ครั้งเดียวตอน mount

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add new reminder
  const handleAddReminder = () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()) {
      // Show error or return
      return
    }

    const newReminder = {
      id: reminders.length + 1,
      ...formData,
    }
    setReminders([...reminders, newReminder])
    setIsAddDialogOpen(false)
    resetForm()
  }

  // Edit reminder
  const handleEditReminder = () => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === currentReminder.id ? { ...formData, id: reminder.id } : reminder,
    )
    setReminders(updatedReminders)
    setIsEditDialogOpen(false)
    resetForm()
  }

  // Delete reminder
  const handleDeleteReminder = () => {
    const updatedReminders = reminders.filter((reminder) => reminder.id !== currentReminder.id)
    setReminders(updatedReminders)
    setIsDeleteDialogOpen(false)
  }

  // Open edit dialog and set current reminder
  const openEditDialog = (reminder) => {
    setCurrentReminder(reminder)
    setFormData({
      title: reminder.title,
      date: reminder.date,
      frequency: reminder.frequency,
      details: reminder.details,
      link: reminder.link,
      password: reminder.password,
      impact: reminder.impact,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog and set current reminder
  const openDeleteDialog = (reminder) => {
    setCurrentReminder(reminder)
    setIsDeleteDialogOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      frequency: "no-repeat",
      details: "",
      link: "",
      password: "",
      impact: "",
    })
    setCurrentReminder(null)
  }

  const mappedCycle = cycleReminders.map((c) => ({
    id: c.id,
    title: c.title,
    details: c.message,
    date: c.scheduledAt?.split("T")[0],
    frequency: c.frequency, // หรือ field จริงของคุณ
    status: c.status,
    type: c.type, // ถ้ามี
  }))

  // รวม manual + cycle
  const allReminders = [...reminders, ...mappedCycle]

  // กรอง search / filter บน allReminders
  const filteredReminders = allReminders.filter((reminder) => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || reminder.status === statusFilter
    const matchesType = typeFilter === "all" || reminder.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">เสร็จแล้ว</Badge>
      case "incomplete":
        return <Badge className="bg-yellow-500">ยังไม่เสร็จ</Badge>
      case "overdue":
        return <Badge className="bg-red-500">เลยกำหนด</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  // Get frequency text
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case "no-repeat":
        return "เตือนไม่ทำซ้ำ"
      case "monthly":
        return "เตือนทุกเดือน"
      case "daily":
        return "เตือนทุกวัน"
      default:
        return frequency
    }
  }

  // Get type text and icon
  const getTypeInfo = (type) => {
    switch (type) {
      case "meeting":
        return { text: "การประชุม", icon: <Users className="h-4 w-4" /> }
      case "report":
        return { text: "รายงาน", icon: <FileText className="h-4 w-4" /> }
      case "document":
        return { text: "เอกสาร", icon: <FileText className="h-4 w-4" /> }
      case "purchase":
        return {
          text: "การสั่งซื้อ",
          icon: <DollarSign className="h-4 w-4" />,
        }
      case "maintenance":
        return { text: "การบำรุงรักษา", icon: <Clock className="h-4 w-4" /> }
      case "data":
        return { text: "ข้อมูล", icon: <FileText className="h-4 w-4" /> }
      case "training":
        return { text: "การอบรม", icon: <Users className="h-4 w-4" /> }
      case "finance":
        return { text: "การเงิน", icon: <DollarSign className="h-4 w-4" /> }
      default:
        return { text: type, icon: <Bell className="h-4 w-4" /> }
    }
  }

  // Format date to Thai format
  const formatThaiDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderMenuItems = () => (
    <>
      <details className="group" open>
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
          <Bell className="h-5 w-5" />
          ระบบการแจ้งเตือน
        </summary>
        <div className="ml-4 mt-2 space-y-1">
          <Link to="/dashboard" className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors">
            เตือนความจำ
          </Link>
          <Link
            to="/manage"
            className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
          >
            ตั้งค่าการแจ้งเตือน
          </Link>
          <Link
            to="/auditperson"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            ประวัติการดำเนินการ
          </Link>
        </div>
      </details>

      <details className="group">
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
          <CheckCircle className="h-5 w-5" />
          แอดมิน
        </summary>
        <div className="ml-4 mt-2 space-y-1">
          <Link
            to="/audit-logs"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            ประวัติการดำเนินการพนักงาน
          </Link>
          <Link
            to="/addemployee"
            className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors cursor-pointer"
          >
            เพิ่มพนักงานใหม่
          </Link>
        </div>
      </details>

      <Link to="/settings" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors">
        <Settings className="h-5 w-5" />
        การตั้งค่า
      </Link>
    </>
  )

  return (
    <div className="flex min-h-screen bg-white font-noto">
      {/* ===== SIDEBAR (DESKTOP) ===== */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-red-800 to-red-900 text-white fixed inset-y-0 z-50">
        <div className="px-6 py-8">
          <img
            src="https://storage.googleapis.com/be8website.appspot.com/logo-scg-white.png"
            alt="SCG Logo"
            className="w-20 mb-4"
          />
          <h1 className="text-xl font-semibold">SCG Admin</h1>
          <p className="text-sm text-white/80">Reminder&nbsp;Dashboard</p>
        </div>

        <nav className="flex-1 space-y-1 px-2 pb-6 overflow-y-auto">{renderMenuItems()}</nav>

        <button className="m-6 flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200">
          <LogOut className="mr-2 h-5 w-5" />
          ออกจากระบบ
        </button>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-b from-red-800 to-red-900 text-white flex items-center justify-between px-4 py-4 shadow z-50">
        <div className="font-bold text-lg">SCG Admin</div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold">
            SG
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-64 h-full bg-gradient-to-b from-red-800 to-red-900 text-white z-40 shadow-lg p-3 overflow-y-auto">
          <nav className="space-y-1">{renderMenuItems()}</nav>

          <button className="mt-6 w-full flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-6 w-full">
        <div className="mt-0">
          <Card className="border-l-4 border-red-600">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold">ตั้งค่าการแจ้งเตือน</CardTitle>
                  <CardDescription>สร้าง แก้ไข และลบการแจ้งเตือนต่างๆ</CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-b from-red-800 to-red-900 hover:bg-red-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4 text-white" /> สร้างการแจ้งเตือนใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="ค้นหาการแจ้งเตือน..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />
                    <Select value={filterDate} onValueChange={setFilterDate}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="กรองตามวันที่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        <SelectItem value="today">วันนี้</SelectItem>
                        <SelectItem value="thisWeek">สัปดาห์นี้</SelectItem>
                        <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Reminders Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">หัวข้องาน</TableHead>
                      <TableHead>วันที่แจ้งเตือน</TableHead>
                      <TableHead>ความถี่</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.length > 0 ? (
                      filteredReminders.map((reminder) => (
                        <TableRow key={reminder.id}>
                          <TableCell className="font-medium">
                            <div className="font-semibold">{reminder.title}</div>
                            <div className="text-sm text-gray-500">{reminder.details}</div>
                            {reminder.impact && (
                              <div className="text-xs text-red-600 mt-1">
                                <span className="font-medium">ผลกระทบ:</span> {reminder.impact}
                              </div>
                            )}
                            {reminder.link && (
                              <a
                                href={reminder.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                              >
                                ดูลิงก์
                              </a>
                            )}
                          </TableCell>
                          <TableCell>{formatThaiDate(reminder.date)}</TableCell>
                          <TableCell>{getFrequencyText(reminder.frequency)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(reminder)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => openDeleteDialog(reminder)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          ไม่พบรายการแจ้งเตือนที่ตรงกับเงื่อนไขการค้นหา
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Reminder Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>สร้างการแจ้งเตือนใหม่</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                หัวข้องาน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="กรอกหัวข้องาน"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">
                วันที่แจ้งเตือน <span className="text-red-500">*</span>
              </Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">
                ความถี่ <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกความถี่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-repeat">เตือนไม่ทำซ้ำ</SelectItem>
                  <SelectItem value="monthly">เตือนทุกเดือน</SelectItem>
                  <SelectItem value="daily">เตือนทุกวัน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="details">
                รายละเอียด <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="impact">
                ผลกระทบหากงานไม่เสร็จ <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="link">ลิงก์ (ถ้ามี)</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                type="url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่านช่วยจำ (ถ้ามี)</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="รหัสผ่าน"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-xs p-0 h-auto"
                onClick={() => setIsForgotPasswordDialogOpen(true)}
              >
                ลืมรหัสผ่าน?
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleAddReminder}
              className="bg-red-600 hover:bg-red-700"
              disabled={!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()}
            >
              สร้างการแจ้งเตือน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reminder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>แก้ไขการแจ้งเตือน</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">
                หัวข้องาน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="กรอกหัวข้องาน"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-date">
                วันที่แจ้งเตือน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-frequency">
                ความถี่ <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกความถี่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-repeat">เตือนไม่ทำซ้ำ</SelectItem>
                  <SelectItem value="monthly">เตือนทุกเดือน</SelectItem>
                  <SelectItem value="daily">เตือนทุกวัน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-details">
                รายละเอียด <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-impact">
                ผลกระทบหากงานไม่เสร็จ <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-link">ลิงก์ (ถ้ามี)</Label>
              <Input
                id="edit-link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                type="url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-password">รหัสผ่านช่วยจำ (ถ้ามี)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="รหัสผ่าน"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-xs p-0 h-auto"
                onClick={() => setIsForgotPasswordDialogOpen(true)}
              >
                ลืมรหัสผ่าน?
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleEditReminder}
              className="bg-red-600 hover:bg-red-700"
              disabled={!formData.title.trim() || !formData.date || !formData.details.trim() || !formData.impact.trim()}
            >
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบการแจ้งเตือน</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-700">คุณต้องการลบการแจ้งเตือน "{currentReminder?.title}" ใช่หรือไม่?</p>
            <p className="text-center text-sm text-gray-500 mt-2">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDeleteReminder} className="bg-red-600 hover:bg-red-700">
              ลบการแจ้งเตือน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordDialogOpen} onOpenChange={setIsForgotPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ยืนยันตัวตน</DialogTitle>
            <DialogDescription>กรุณาใส่รหัสผ่านของคุณเพื่อดูรหัสผ่านช่วยจำ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="auth-password">รหัสผ่านของคุณ</Label>
              <Input id="auth-password" type="password" placeholder="ใส่รหัสผ่านของคุณ" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForgotPasswordDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setShowPassword(true)
                setIsForgotPasswordDialogOpen(false)
              }}
            >
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
