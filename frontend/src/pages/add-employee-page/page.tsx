/* eslint-disable no-unused-vars */
"use client"
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Bell,
  LogOut,
  Settings,
  CheckCircle,
  User,
  Upload,
  UserPlus,
  Building,
  Phone,
  Mail,
  Lock,
  Shield,
  X,
  Eye,
  EyeOff,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function AddEmployeePage() {
  // ===== STATE MANAGEMENT =====
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    department: "",
    phone: "",
    adminLevel: "user", // user, admin, super_admin
    isActive: true,
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true })
      navigate("/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  // ===== FORM HANDLING =====
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      isActive: checked,
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user selects
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfileImage = () => {
    setProfileImage(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ"
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล"
    if (!formData.email.trim()) newErrors.email = "กรุณากรอกอีเมล"
    if (!formData.password) newErrors.password = "กรุณากรอกรหัสผ่าน"
    if (!formData.position.trim()) newErrors.position = "กรุณาระบุตำแหน่ง"
    if (!formData.department.trim()) newErrors.department = "กรุณาระบุแผนก"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง"
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน"
    }

    // Phone validation (optional)
    if (formData.phone && !/^\d{9,10}$/.test(formData.phone.replace(/[- ]/g, ""))) {
      newErrors.phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // ในสถานการณ์จริง คุณจะส่งข้อมูลไปยัง API
      // const response = await axios.post('/api/employees', {
      //   ...formData,
      //   profileImage: profileImage
      // })

      // จำลองการส่งข้อมูล
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // แสดงข้อความสำเร็จ
      toast({
        title: "เพิ่มพนักงานสำเร็จ",
        description: `เพิ่ม ${formData.firstName} ${formData.lastName} เข้าสู่ระบบเรียบร้อยแล้ว`,
      })

      // รีเซ็ตฟอร์ม
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        position: "",
        department: "",
        phone: "",
        adminLevel: "user",
        isActive: true,
        notes: "",
      })
      setProfileImage(null)
    } catch (error) {
      console.error("Error adding employee:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มพนักงานได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ===== SIDEBAR MENU ITEMS =====
  // แสดงรายการเมนูในแถบด้านข้าง
  const renderMenuItems = () => (
    <>
      <details className="group">
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          ระบบการแจ้งเตือน
        </summary>
        <div className="ml-4 mt-2 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            เตือนความจำ
          </Link>
          <Link to="/manage" className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors">
            ตั้งค่าการแจ้งเตือน
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            ประวัติการดำเนินการ
          </Link>
        </div>
      </details>

      <details className="group" open>
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
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
            to="/add-employee"
            className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
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
      {/* แถบด้านข้างสำหรับการนำทางบนหน้าจอขนาดใหญ่ */}
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

        <nav className="flex-1 space-y-1 px-2 pb-6 overflow-y-auto">
          <details className="group">
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              ระบบการแจ้งเตือน
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
              >
                เตือนความจำ
              </Link>
              <Link to="/manage" className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors">
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

          <details className="group" open>
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
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
                to="/add-employee"
                className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
              >
                เพิ่มพนักงานใหม่
              </Link>
            </div>
          </details>

          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            <Settings className="h-5 w-5" />
            การตั้งค่า
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="m-6 flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200"
        >
          <LogOut className="mr-2 h-5 w-5" />
          ออกจากระบบ
        </button>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      {/* ส่วนหัวสำหรับมือถือพร้อมปุ่มแฮมเบอร์เกอร์ */}
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
      {/* เมนูสำหรับมือถือที่แสดงเมื่อกดปุ่มแฮมเบอร์เกอร์ */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-64 h-full bg-gradient-to-b from-red-800 to-red-900 text-white z-40 shadow-lg p-3 overflow-y-auto">
          <nav className="space-y-1">{renderMenuItems()}</nav>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-20 w-full">
        {/* ===== DESKTOP HEADER ===== */}
        {/* ส่วนหัวสำหรับเดสก์ท็อป */}
        <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 ml-64">
            <div>
              <h1 className="text-xl font-bold text-gray-800">เพิ่มพนักงานใหม่</h1>
              <p className="text-sm text-gray-500">เพิ่มพนักงานและกำหนดสิทธิ์การใช้งาน</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-600">
                <div>
                  {currentTime.toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="font-bold text-lg">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                  น.
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                SG
              </div>
            </div>
          </div>
        </header>

        {/* ===== MOBILE HEADER ===== */}
        {/* ส่วนหัวสำหรับมือถือ */}
        <header className="block md:hidden bg-white border-b shadow-sm w-full top-14 z-30">
          <div className="flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-800">เพิ่มพนักงานใหม่</h1>
                <p className="text-xs text-gray-500">เพิ่มพนักงานและกำหนดสิทธิ์การใช้งาน</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="font-bold text-sm">
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}{" "}
                  น.
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== FORM CONTENT ===== */}
        <div className="mt-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="personal" className="text-sm md:text-base">
                <User className="h-4 w-4 mr-2" />
                ข้อมูลส่วนตัว
              </TabsTrigger>
              <TabsTrigger value="access" className="text-sm md:text-base">
                <Shield className="h-4 w-4 mr-2" />
                สิทธิ์การใช้งาน
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Profile Image Upload */}
                  <Card className="md:row-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">รูปโปรไฟล์</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src={profileImage || ""} />
                          <AvatarFallback className="bg-gray-200 text-gray-500 text-xl">
                            {formData.firstName && formData.lastName
                              ? `${formData.firstName[0]}${formData.lastName[0]}`
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        {profileImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeProfileImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4 w-full">
                        <Label
                          htmlFor="profile-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG (สูงสุด 2MB)</p>
                          </div>
                          <Input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageChange}
                          />
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Information */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">ข้อมูลส่วนตัว</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">
                            ชื่อ <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="ชื่อ"
                            value={formData.firstName}
                            onChange={handleInputChange}
                          />
                          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">
                            นามสกุล <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="นามสกุล"
                            value={formData.lastName}
                            onChange={handleInputChange}
                          />
                          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          อีเมล <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex">
                          <Mail className="h-4 w-4 text-gray-500 absolute mt-3 ml-3" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            className="pl-10"
                            placeholder="example@scg.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">
                            รหัสผ่าน <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="h-4 w-4 text-gray-500 absolute mt-3 ml-3" />
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10"
                              placeholder="รหัสผ่าน"
                              value={formData.password}
                              onChange={handleInputChange}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Lock className="h-4 w-4 text-gray-500 absolute mt-3 ml-3" />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              className="pl-10"
                              placeholder="ยืนยันรหัสผ่าน"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                            />
                          </div>
                          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Work Information */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">ข้อมูลการทำงาน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">
                            ตำแหน่ง <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex">
                            <User className="h-4 w-4 text-gray-500 absolute mt-3 ml-3" />
                            <Input
                              id="position"
                              name="position"
                              className="pl-10"
                              placeholder="ตำแหน่ง"
                              value={formData.position}
                              onChange={handleInputChange}
                            />
                          </div>
                          {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">
                            แผนก <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex">
                            <Building className="h-4 w-4 text-gray-500 absolute mt-3 ml-3" />
                            <Input
                              id="department"
                              name="department"
                              className="pl-10"
                              placeholder="แผนก"
                              value={formData.department}
                              onChange={handleInputChange}
                            />
                          </div>
                          {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                        <div className="flex">
                          <Phone className="h-4 w-4 text-gray-500 absolute mt-3 ml-3" />
                          <Input
                            id="phone"
                            name="phone"
                            className="pl-10"
                            placeholder="0812345678"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="บันทึกเพิ่มเติมเกี่ยวกับพนักงาน"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="access">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">สิทธิ์การใช้งาน</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminLevel">ระดับสิทธิ์</Label>
                        <Select
                          value={formData.adminLevel}
                          onValueChange={(value) => handleSelectChange("adminLevel", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกระดับสิทธิ์" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">ผู้ใช้งานทั่วไป</SelectItem>
                            <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                            <SelectItem value="super_admin">ผู้ดูแลระบบระดับสูง</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                        <div>
                          <h3 className="font-medium">สถานะการใช้งาน</h3>
                          <p className="text-sm text-gray-500">เปิดใช้งานบัญชีผู้ใช้นี้</p>
                        </div>
                        <Switch checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">สิทธิ์การเข้าถึง</h3>
                      <div className="space-y-2 border rounded-lg divide-y">
                        <div className="flex items-center justify-between p-4">
                          <div>
                            <h4 className="font-medium">ระบบการแจ้งเตือน</h4>
                            <p className="text-sm text-gray-500">จัดการการแจ้งเตือนและเตือนความจำ</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <div>
                            <h4 className="font-medium">จัดการพนักงาน</h4>
                            <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบข้อมูลพนักงาน</p>
                          </div>
                          <Switch
                            defaultChecked={formData.adminLevel !== "user"}
                            disabled={formData.adminLevel === "user"}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <div>
                            <h4 className="font-medium">ตั้งค่าระบบ</h4>
                            <p className="text-sm text-gray-500">ปรับแต่งการตั้งค่าระบบ</p>
                          </div>
                          <Switch
                            defaultChecked={formData.adminLevel === "super_admin"}
                            disabled={formData.adminLevel !== "super_admin"}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="bg-red-700 hover:bg-red-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      เพิ่มพนักงาน
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
