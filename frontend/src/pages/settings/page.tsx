"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { simulateApiDelay } from "@/lib/mock-data";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

// Icons
import {
  Bell,
  Calendar,
  LogOut,
  Settings,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Home,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  /**
   * หน้าการตั้งค่า (Settings Page)
   * ------------------------------
   * หน้านี้รวมทุกส่วนของการตั้งค่าไว้ด้วยกัน
   * ประกอบด้วยแท็บ 7 แท็บ:
   * 1. โปรไฟล์ - จัดการข้อมูลส่วนตัวของผู้ใช้
   * 2. การแจ้งเตือน - ตั้งค่าการรับการแจ้งเตือน
   * 3. ระบบ - ตั้งค่าระบบพื้นฐาน
   * 4. ลักษณะ - ปรับแต่งธีมและการแสดงผล
   * 5. ความปลอดภัย - จัดการรหัสผ่านและการยืนยันตัวตน
   * 6. การเชื่อมต่อ - ตั้งค่าการเชื่อมต่อกับบริการภายนอก
   * 7. ข้อมูล - จัดการการนำเข้า/ส่งออกและล้างข้อมูล
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("profile");

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

        <nav className="flex-1 space-y-1 px-2 pb-6 overflow-y-auto">
          <details className="group">
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              ระบบการแจ้งเตือน
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              <Link
                to="/dashboard"
                className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors"
              >
                เตือนความจำ
              </Link>
              <Link
                to="/manage"
                className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors"
              >
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

          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
          >
            <Settings className="h-5 w-5" />
            การตั้งค่า
          </Link>
        </nav>

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
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-64 h-full bg-gradient-to-b from-red-800 to-red-900 text-white z-40 shadow-lg p-3 overflow-y-auto">
          <nav className="space-y-1">
            <details className="group">
              <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
                <Bell className="h-5 w-5" />
                ระบบการแจ้งเตือน
              </summary>
              <div className="ml-4 mt-2 space-y-1">
                <Link
                  to="/dashboard"
                  className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors"
                >
                  เตือนความจำ
                </Link>
                <Link
                  to="/manage"
                  className="block rounded-md px-3 py-2  hover:bg-white/5 transition-colors"
                >
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
              </div>
            </details>

            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer"
            >
              <Settings className="h-5 w-5" />
              การตั้งค่า
            </Link>
          </nav>

          <button className="mt-6 w-full flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200">
            <LogOut className="mr-2 h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-20 w-full">
        {/* ===== DESKTOP HEADER ===== */}
        <header className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 ml-64">
            <div>
              <h1 className="text-xl font-bold text-gray-800">การตั้งค่า</h1>
              <p className="text-sm text-gray-500">
                จัดการการตั้งค่าบัญชีของคุณและปรับแต่งการตั้งค่าระบบ
              </p>
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
        <header className="block md:hidden bg-white border-b shadow-sm w-full top-14 z-30">
          <div className="flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-800">การตั้งค่า</h1>
                <p className="text-xs text-gray-500">
                  จัดการการตั้งค่าบัญชีของคุณและปรับแต่งการตั้งค่าระบบ
                </p>
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

        {/* ===== SETTINGS TABS ===== */}
        <div className="mt-4">
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-2">
              <TabsTrigger value="profile" className="font-noto">
                โปรไฟล์
              </TabsTrigger>
              <TabsTrigger value="notifications" className="font-noto">
                การแจ้งเตือน
              </TabsTrigger>
              <TabsTrigger value="system" className="font-noto">
                ระบบ
              </TabsTrigger>
              <TabsTrigger value="appearance" className="font-noto">
                ลักษณะ
              </TabsTrigger>
              <TabsTrigger value="security" className="font-noto">
                ความปลอดภัย
              </TabsTrigger>
              <TabsTrigger value="integrations" className="font-noto">
                การเชื่อมต่อ
              </TabsTrigger>
              <TabsTrigger value="data" className="font-noto">
                ข้อมูล
              </TabsTrigger>
            </TabsList>

            {/* ==================================================== */}
            {/* =================== 1. โปรไฟล์ ==================== */}
            {/* ==================================================== */}
            {/* ===== PROFILE SETTINGS ===== */}
            <TabsContent value="profile" className="space-y-4">
              <ProfileSettings />
            </TabsContent>

            {/* ==================================================== */}
            {/* ================= 2. การแจ้งเตือน ================== */}
            {/* ==================================================== */}
            {/* ===== NOTIFICATION SETTINGS ===== */}
            <TabsContent value="notifications" className="space-y-4">
              <NotificationPreferences />
            </TabsContent>

            {/* ==================================================== */}
            {/* =================== 3. ระบบ ====================== */}
            {/* ==================================================== */}
            {/* ===== SYSTEM SETTINGS ===== */}
            <TabsContent value="system" className="space-y-4">
              <SystemSettings />
            </TabsContent>

            {/* ==================================================== */}
            {/* ================== 4. ลักษณะ ===================== */}
            {/* ==================================================== */}
            {/* ===== APPEARANCE SETTINGS ===== */}
            <TabsContent value="appearance" className="space-y-4">
              <AppearanceSettings />
            </TabsContent>

            {/* ==================================================== */}
            {/* =============== 5. ความปลอดภัย =================== */}
            {/* ==================================================== */}
            {/* ===== SECURITY SETTINGS ===== */}
            <TabsContent value="security" className="space-y-4">
              <SecuritySettings />
            </TabsContent>

            {/* ==================================================== */}
            {/* ================ 6. การเชื่อมต่อ ================== */}
            {/* ==================================================== */}
            {/* ===== INTEGRATION SETTINGS ===== */}
            <TabsContent value="integrations" className="space-y-4">
              <IntegrationSettings />
            </TabsContent>

            {/* ==================================================== */}
            {/* ================== 7. ข้อมูล ====================== */}
            {/* ==================================================== */}
            {/* ===== DATA MANAGEMENT ===== */}
            <TabsContent value="data" className="space-y-4">
              <DataManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// ===============================================================================
// ======================== 1. โปรไฟล์ (PROFILE SETTINGS) =========================
// ===============================================================================
// ===== PROFILE SETTINGS COMPONENT =====
function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    title: z.string().optional(),
    department: z.string().optional(),
    bio: z
      .string()
      .max(160, { message: "Bio must not be longer than 160 characters." })
      .optional(),
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  // This would come from your user context or API in a real app
  const defaultValues: Partial<ProfileFormValues> = {
    name: "Shogun",
    email: "shokun159@gmail.com",
    title: "Developer",
    department: "IT Department",
    bio: "ตื่นมาก็หล่อ พอให้พอใจ แต่ยังง่วงอยู่ไง ขอนอนต่ออีกที",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      // Simulate API call
      await simulateApiDelay(1000);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 font-noto">
      <Card>
        <CardHeader>
          <CardTitle>โปรไฟล์</CardTitle>
          <CardDescription>การตั้งค่าและจัดการข้อมูลส่วนบุคคล</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="/placeholder.svg?height=96&width=96"
                alt="Profile"
              />
              <AvatarFallback className="text-2xl">SG</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="font-medium">รูปโปรไฟล์</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  อัพโหลด
                </Button>
                <Button variant="outline" size="sm" className="text-red-500">
                  ลบรูปโปรไฟล์
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size 1MB.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อจริง</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ตำแหน่งงาน</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แผนก</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a short bio about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      คำอธิบายสั้น ๆ สำหรับโปรไฟล์ของคุณ ( ไม่เกิน 160 ตัวอักษร
                      )
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#E2001A] hover:bg-[#C0001A] text-white"
                >
                  {isLoading ? "Saving..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// ===============================================================================
// ===================== 2. การแจ้งเตือน (NOTIFICATION SETTINGS) ===================
// ===============================================================================
// ===== NOTIFICATION PREFERENCES COMPONENT =====
function NotificationPreferences() {
  const [isLoading, setIsLoading] = useState(false);

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("daily");
  const [notificationSound, setNotificationSound] = useState("default");

  // Notification types state
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [approvalRequests, setApprovalRequests] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [newsAndAnnouncements, setNewsAndAnnouncements] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);

  async function handleSave() {
    setIsLoading(true);

    try {
      // Simulate API call
      await simulateApiDelay(1000);
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save notification preferences");
      console.error(error);
    } finally {
      setIsLoading(false);
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
                <Label htmlFor="email-notifications">
                  การแจ้งเตือนทางอีเมล
                </Label>
                <p className="text-sm text-muted-foreground">
                  รับการแจ้งเตือนผ่านทางอีเมล
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">การแจ้งเตือนแบบพุช</Label>
                <p className="text-sm text-muted-foreground">
                  รับการแจ้งเตือนผ่านเบราว์เซอร์ของคุณ
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">การแจ้งเตือนทาง Line</Label>
                <p className="text-sm text-muted-foreground">
                  รับการแจ้งเตือนผ่าน Line
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
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
              <Select
                value={notificationSound}
                onValueChange={setNotificationSound}
              >
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
          <CardDescription>
            เลือกประเภทการแจ้งเตือนที่คุณต้องการรับ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-updates">อัปเดตระบบ</Label>
            <Switch
              id="system-updates"
              checked={systemUpdates}
              onCheckedChange={setSystemUpdates}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="approval-requests">คำขออนุมัติ</Label>
            <Switch
              id="approval-requests"
              checked={approvalRequests}
              onCheckedChange={setApprovalRequests}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="security-alerts">การแจ้งเตือนด้านความปลอดภัย</Label>
            <Switch
              id="security-alerts"
              checked={securityAlerts}
              onCheckedChange={setSecurityAlerts}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="news-announcements">ข่าวสารและประกาศ</Label>
            <Switch
              id="news-announcements"
              checked={newsAndAnnouncements}
              onCheckedChange={setNewsAndAnnouncements}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-alerts">
              การแจ้งเตือนการบำรุงรักษา
            </Label>
            <Switch
              id="maintenance-alerts"
              checked={maintenanceAlerts}
              onCheckedChange={setMaintenanceAlerts}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#E2001A] hover:bg-[#C0001A] text-white"
          >
            {isLoading ? "Saving..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ===============================================================================
// ========================== 3. ระบบ (SYSTEM SETTINGS) ===========================
// ===============================================================================
// ===== SYSTEM SETTINGS COMPONENT =====
function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const systemSettingsSchema = z.object({
    systemName: z
      .string()
      .min(2, { message: "กรุณากรอกชื่อระบบอย่างน้อย 2 ตัวอักษร" }),
    defaultLanguage: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
    timeFormat: z.string(),
    autoLogout: z.number().int().min(5).max(120),
    enableAuditLog: z.boolean(),
    enableAnalytics: z.boolean(),
  });

  type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

  const defaultValues: SystemSettingsValues = {
    systemName: "SCG ระบบแจ้งเตือน",
    defaultLanguage: "th-TH",
    timezone: "Asia/Bangkok",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    autoLogout: 30,
    enableAuditLog: true,
    enableAnalytics: true,
  };

  const form = useForm<SystemSettingsValues>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues,
  });

  async function onSubmit(data: SystemSettingsValues) {
    setIsLoading(true);

    try {
      await simulateApiDelay(1000);
      toast.success("บันทึกการตั้งค่าสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถบันทึกการตั้งค่าได้");
      console.error(error);
    } finally {
      setIsLoading(false);
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
                    <FormDescription>
                      ชื่อนี้จะแสดงในหัวเบราว์เซอร์และอีเมล
                    </FormDescription>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกเขตเวลา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Asia/Bangkok">
                            กรุงเทพฯ (GMT+7)
                          </SelectItem>
                          <SelectItem value="Asia/Singapore">
                            สิงคโปร์ (GMT+8)
                          </SelectItem>
                          <SelectItem value="Asia/Tokyo">
                            โตเกียว (GMT+9)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            ลอนดอน (GMT+0)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            นิวยอร์ก (GMT-5)
                          </SelectItem>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกรูปแบบวันที่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MMM-YYYY">
                            DD-MMM-YYYY
                          </SelectItem>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกรูปแบบเวลา" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="12h">
                            12 ชั่วโมง (AM/PM)
                          </SelectItem>
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
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        เวลาที่ไม่มีการใช้งานก่อนจะออกจากระบบอัตโนมัติ (5–120
                        นาที)
                      </FormDescription>
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
                        <FormDescription>
                          บันทึกกิจกรรมของผู้ใช้ทั้งหมดเพื่อความปลอดภัยและการตรวจสอบย้อนหลัง
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
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
                        <FormDescription>
                          เก็บข้อมูลการใช้งานแบบไม่ระบุตัวตน
                          เพื่อปรับปรุงระบบให้ดียิ่งขึ้น
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#E2001A] hover:bg-[#C0001A] text-white"
                >
                  {isLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// ===============================================================================
// ====================== 4. ลักษณะ (APPEARANCE SETTINGS) =========================
// ===============================================================================
// ===== APPEARANCE SETTINGS COMPONENT =====
function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Appearance settings state
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState(16);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accentColor, setAccentColor] = useState("red");

  async function handleSave() {
    setIsLoading(true);

    try {
      // Simulate API call
      await simulateApiDelay(1000);
      toast.success("บันทึกการตั้งค่าการแสดงผลแล้ว");
    } catch (error) {
      toast.error("ไม่สามารถบันทึกการตั้งค่าการแสดงผลได้");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-noto">ธีม</CardTitle>
          <CardDescription className="font-noto">
            ปรับแต่งลักษณะและความรู้สึกของระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="font-noto">ธีมสี</Label>
            <RadioGroup
              value={theme || "light"}
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="font-noto flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 rounded-md bg-white p-1 shadow-sm border">
                    <div className="space-y-2">
                      <div className="h-2 w-[80px] rounded-lg bg-[#E2001A]" />
                      <div className="h-2 w-[100px] rounded-lg bg-gray-200" />
                      <div className="h-2 w-[60px] rounded-lg bg-gray-200" />
                    </div>
                  </div>
                  <span className="font-noto">สว่าง</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="font-noto flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gray-950 p-4 hover:bg-gray-900 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 rounded-md bg-gray-800 p-1 shadow-sm border border-gray-700">
                    <div className="space-y-2">
                      <div className="h-2 w-[80px] rounded-lg bg-[#E2001A]" />
                      <div className="h-2 w-[100px] rounded-lg bg-gray-600" />
                      <div className="h-2 w-[60px] rounded-lg bg-gray-600" />
                    </div>
                  </div>
                  <span className="font-noto text-white">มืด</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="font-noto flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-r from-white to-gray-950 p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 rounded-md bg-gradient-to-r from-white to-gray-800 p-1 shadow-sm border">
                    <div className="space-y-2">
                      <div className="h-2 w-[80px] rounded-lg bg-[#E2001A]" />
                      <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-600" />
                      <div className="h-2 w-[60px] rounded-lg bg-gradient-to-r from-gray-200 to-gray-600" />
                    </div>
                  </div>
                  <span className="font-noto">ตามระบบ</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="font-noto">สีเน้น</Label>
            <RadioGroup
              value={accentColor}
              onValueChange={setAccentColor}
              className="grid grid-cols-5 gap-2"
            >
              <div>
                <RadioGroupItem value="red" id="red" className="peer sr-only" />
                <Label
                  htmlFor="red"
                  className="font-noto flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-[#E2001A] hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">แดง</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="blue"
                  id="blue"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="blue"
                  className="font-noto flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-blue-600 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">น้ำเงิน</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="green"
                  id="green"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="green"
                  className="font-noto flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-green-600 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">เขียว</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="purple"
                  id="purple"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="purple"
                  className="font-noto flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-purple-600 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">ม่วง</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="orange"
                  id="orange"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="orange"
                  className="font-noto flex aspect-square items-center justify-center rounded-md border-2 border-muted bg-orange-500 hover:opacity-90 peer-data-[state=checked]:border-black [&:has([data-state=checked])]:border-black"
                >
                  <span className="sr-only">ส้ม</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="font-noto">ระดับความกระชับของอินเทอร์เฟซ</Label>
            <RadioGroup
              value={density}
              onValueChange={setDensity}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="compact"
                  id="compact"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="compact"
                  className="font-noto flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 space-y-1">
                    <div className="h-1.5 w-[80px] rounded-lg bg-gray-300" />
                    <div className="h-1.5 w-[100px] rounded-lg bg-gray-300" />
                    <div className="h-1.5 w-[60px] rounded-lg bg-gray-300" />
                  </div>
                  <span className="font-noto">กระชับ</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="comfortable"
                  id="comfortable"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="comfortable"
                  className="font-noto flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 space-y-2">
                    <div className="h-2 w-[80px] rounded-lg bg-gray-300" />
                    <div className="h-2 w-[100px] rounded-lg bg-gray-300" />
                    <div className="h-2 w-[60px] rounded-lg bg-gray-300" />
                  </div>
                  <span className="font-noto">สบายตา</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="spacious"
                  id="spacious"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="spacious"
                  className="font-noto flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-gray-100 hover:text-accent-foreground peer-data-[state=checked]:border-[#E2001A] [&:has([data-state=checked])]:border-[#E2001A]"
                >
                  <div className="mb-2 space-y-3">
                    <div className="h-2.5 w-[80px] rounded-lg bg-gray-300" />
                    <div className="h-2.5 w-[100px] rounded-lg bg-gray-300" />
                    <div className="h-2.5 w-[60px] rounded-lg bg-gray-300" />
                  </div>
                  <span className="font-noto">กว้างขวาง</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size" className="font-noto">
                  ขนาดตัวอักษร ({fontSize}px)
                </Label>
              </div>
              <Slider
                id="font-size"
                min={12}
                max={20}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-noto">เล็ก</span>
                <span className="font-noto">ใหญ่</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations" className="font-noto">
                  เปิดอนิเมชัน
                </Label>
                <p className="font-noto text-sm text-muted-foreground">
                  แสดงการเคลื่อนไหวและการเปลี่ยนองค์ประกอบในส่วนติดต่อ
                </p>
              </div>
              <Switch
                id="animations"
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebar-collapsed" className="font-noto">
                  ย่อแถบนำทางเริ่มต้น
                </Label>
                <p className="font-noto text-sm text-muted-foreground">
                  ให้แถบนำทางถูกย่อเมื่อคุณเข้าสู่ระบบ
                </p>
              </div>
              <Switch
                id="sidebar-collapsed"
                checked={sidebarCollapsed}
                onCheckedChange={setSidebarCollapsed}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white"
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึกการแสดงผล"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ===============================================================================
// ===================== 5. ความปลอดภัย (SECURITY SETTINGS) =======================
// ===============================================================================
// ===== SECURITY SETTINGS COMPONENT =====
function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [apiKey, setApiKey] = useState(
    "scg_api_" + Math.random().toString(36).substring(2, 15)
  );

  const passwordSchema = z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: "กรุณากรอกรหัสผ่านปัจจุบัน" }),
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
    });

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof passwordSchema>) {
    setIsLoading(true);

    try {
      await simulateApiDelay(1000);
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      form.reset();
    } catch (error) {
      toast.error("ไม่สามารถเปลี่ยนรหัสผ่านได้");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (checked) {
      setShowTwoFactorSetup(true);
    } else {
      setShowTwoFactorSetup(false);
      toast.success("ปิดการยืนยันตัวตนสองชั้นแล้ว");
    }
  };

  const regenerateApiKey = async () => {
    setIsLoading(true);

    try {
      await simulateApiDelay(1000);
      setApiKey("scg_api_" + Math.random().toString(36).substring(2, 15));
      toast.success("สร้างคีย์ API ใหม่สำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถสร้างคีย์ API ใหม่ได้");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("คัดลอกคีย์ API ไปยังคลิปบอร์ดแล้ว");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-noto">เปลี่ยนรหัสผ่าน</CardTitle>
          <CardDescription className="font-noto">
            อัปเดตรหัสผ่านเพื่อให้บัญชีของคุณปลอดภัย
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-noto">
                      รหัสผ่านปัจจุบัน
                    </FormLabel>
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
                      รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
                      และประกอบด้วยตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข
                      และอักขระพิเศษ
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
                    <FormLabel className="font-noto">
                      ยืนยันรหัสผ่านใหม่
                    </FormLabel>
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
          <CardDescription className="font-noto">
            เพิ่มชั้นความปลอดภัยให้บัญชีของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="font-noto">
                การยืนยันตัวตนสองชั้น
              </Label>
              <p className="font-noto text-sm text-muted-foreground">
                ต้องใช้รหัสยืนยันเมื่อเข้าสู่ระบบ
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          {showTwoFactorSetup && (
            <div className="mt-4 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ต้องการตั้งค่า</AlertTitle>
                <AlertDescription>
                  สแกน QR code ด้านล่างด้วยแอป Authenticator
                  เพื่อตั้งค่าการยืนยันตัวตนสองชั้น
                </AlertDescription>
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
                  <Input
                    id="verification-code"
                    placeholder="กรอกรหัส 6 หลัก"
                    maxLength={6}
                  />
                  <Button className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white">
                    <Check className="mr-2 h-4 w-4" />
                    ยืนยัน
                  </Button>
                </div>
              </div>

              <p className="font-noto text-sm text-muted-foreground">
                หากคุณสูญเสียการเข้าถึงแอป Authenticator
                คุณจะต้องติดต่อฝ่ายสนับสนุนเพื่อกู้คืนการเข้าถึงบัญชี
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">เข้าถึง API</CardTitle>
          <CardDescription className="font-noto">
            จัดการคีย์ API สำหรับการเข้าถึงระบบผ่านโปรแกรม
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="font-noto">
              คีย์ API
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                value={apiKey}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyApiKey}
                className="font-noto"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="font-noto text-sm text-muted-foreground">
              คีย์นี้ให้สิทธิ์เข้าถึง API ทั้งหมด เก็บให้ปลอดภัยและห้ามแชร์
            </p>
          </div>

          <Button
            variant="outline"
            onClick={regenerateApiKey}
            disabled={isLoading}
            className="font-noto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            สร้างคีย์ API ใหม่
          </Button>

          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>คำเตือน</AlertTitle>
            <AlertDescription>
              การสร้างคีย์ API
              ใหม่จะทำให้คีย์เดิมใช้งานไม่ได้และอาจทำให้การเชื่อมต่อระบบล้มเหลว
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">เซสชันการเข้าสู่ระบบ</CardTitle>
          <CardDescription className="font-noto">
            จัดการเซสชันที่กำลังใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-noto font-medium">เซสชันปัจจุบัน</p>
                  <p className="font-noto text-sm text-muted-foreground">
                    Chrome บน Windows • กรุงเทพฯ ประเทศไทย
                  </p>
                  <p className="font-noto text-xs text-muted-foreground mt-1">
                    เริ่มเมื่อ 2 ชั่วโมงที่แล้ว • IP: 192.168.1.1
                  </p>
                </div>
                <Badge className="font-noto bg-green-100 text-green-800">
                  กำลังใช้งาน
                </Badge>
              </div>
              <div className="border-t p-4 flex items-center justify-between">
                <div>
                  <p className="font-noto font-medium">แอปมือถือ</p>
                  <p className="font-noto text-sm text-muted-foreground">
                    iPhone • กรุงเทพฯ ประเทศไทย
                  </p>
                  <p className="font-noto text-xs text-muted-foreground mt-1">
                    เริ่มเมื่อ 3 วันก่อน • IP: 192.168.2.2
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-noto text-red-500"
                >
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
  );
}

// ===============================================================================
// ===================== 6. การเชื่อมต่อ (INTEGRATION SETTINGS) ====================
// ===============================================================================
// ===== INTEGRATION SETTINGS COMPONENT =====
function IntegrationSettings() {
  const [isLoading, setIsLoading] = useState(false);

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
  ]);

  const toggleIntegration = async (id: string, enabled: boolean) => {
    setIsLoading(true);
    try {
      await simulateApiDelay(1000);
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                connected: enabled,
                status: enabled ? "active" : "inactive",
                lastSync: enabled
                  ? new Date().toISOString()
                  : integration.lastSync,
              }
            : integration
        )
      );
      toast.success(
        `${enabled ? "เปิดใช้งาน" : "ปิดใช้งาน"} การเชื่อมต่อ ${
          integrations.find((i) => i.id === id)?.name
        }`
      );
    } catch (error) {
      toast.error(
        `${enabled ? "ไม่สามารถเปิดใช้งาน" : "ไม่สามารถปิดใช้งาน"} การเชื่อมต่อ`
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncIntegration = async (id: string) => {
    setIsLoading(true);
    try {
      await simulateApiDelay(1500);
      setIntegrations(
        integrations.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                status: "active",
                lastSync: new Date().toISOString(),
              }
            : integration
        )
      );
      toast.success(
        `ซิงค์ข้อมูลการเชื่อมต่อ ${integrations.find((i) => i.id === id)?.name}`
      );
    } catch (error) {
      toast.error("ไม่สามารถซิงค์การเชื่อมต่อได้");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-noto">การตั้งค่าอีเมล</CardTitle>
          <CardDescription className="font-noto">
            ตั้งค่าบริการอีเมลสำหรับส่งการแจ้งเตือน
          </CardDescription>
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
              <Input
                id="smtp-password"
                type="password"
                defaultValue="••••••••••••"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="smtp-ssl" className="font-noto">
                ใช้งาน SSL/TLS
              </Label>
              <p className="font-noto text-sm text-muted-foreground">
                เปิดใช้งานการเชื่อมต่อที่ปลอดภัยสำหรับการส่งอีเมล
              </p>
            </div>
            <Switch id="smtp-ssl" defaultChecked />
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" className="font-noto">
              ทดสอบการเชื่อมต่อ
            </Button>
            <Button className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white">
              บันทึกการตั้งค่าอีเมล
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-noto">การเชื่อมต่อภายนอก</CardTitle>
          <CardDescription className="font-noto">
            เชื่อมต่อกับบริการภายนอกสำหรับการแจ้งเตือนและแลกเปลี่ยนข้อมูล
          </CardDescription>
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
                  <div className="ml-2">
                    {getStatusBadge(integration.status)}
                  </div>
                </div>
                <p className="font-noto text-sm text-muted-foreground">
                  {integration.description}
                </p>
                {integration.lastSync && (
                  <p className="font-noto text-xs text-muted-foreground">
                    ซิงค์ล่าสุด:{" "}
                    {new Date(integration.lastSync).toLocaleString()}
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
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="font-noto"
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  กำหนดค่า
                </Button>
                <Switch
                  id={`integration-${integration.id}`}
                  checked={integration.connected}
                  onCheckedChange={(checked) =>
                    toggleIntegration(integration.id, checked)
                  }
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
          <CardDescription className="font-noto">
            ตั้งค่าเว็บฮุกสำหรับการส่งการแจ้งเตือนแบบเรียลไทม์
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>สำคัญ</AlertTitle>
            <AlertDescription>
              เว็บฮุกช่วยให้ระบบภายนอกรับข้อมูลเรียลไทม์จากระบบแจ้งเตือน
              โปรดตรวจสอบให้ endpoint ปลอดภัยและรองรับปริมาณคำขอที่คาดว่าจะรับ
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="font-noto">
              URL เว็บฮุก
            </Label>
            <Input
              id="webhook-url"
              defaultValue="https://api.example.com/webhooks/notifications"
            />
            <p className="font-noto text-xs text-muted-foreground">
              URL ที่จะรับคำขอ POST สำหรับเว็บฮุก
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-secret" className="font-noto">
              ความลับของเว็บฮุก
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-secret"
                type="password"
                defaultValue="whsec_abcdefghijklmnopqrstuvwxyz"
              />
              <Button variant="outline" size="sm" className="font-noto">
                สร้างใหม่
              </Button>
            </div>
            <p className="font-noto text-xs text-muted-foreground">
              ใช้เพื่อยืนยันว่าคำขอมาจากระบบแจ้งเตือน SCG
            </p>
          </div>
          <div className="space-y-2">
            <Label className="font-noto">ประเภทเหตุการณ์</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-created" defaultChecked />
                <Label
                  htmlFor="event-notification-created"
                  className="font-noto"
                >
                  สร้างการแจ้งเตือน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-updated" defaultChecked />
                <Label
                  htmlFor="event-notification-updated"
                  className="font-noto"
                >
                  อัปเดตการแจ้งเตือน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-approved" defaultChecked />
                <Label
                  htmlFor="event-notification-approved"
                  className="font-noto"
                >
                  อนุมัติการแจ้งเตือน
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="event-notification-rejected" defaultChecked />
                <Label
                  htmlFor="event-notification-rejected"
                  className="font-noto"
                >
                  ปฏิเสธการแจ้งเตือน
                </Label>
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" className="font-noto">
              ทดสอบเว็บฮุก
            </Button>
            <Button className="font-noto bg-[#E2001A] hover:bg-[#C0001A] text-white">
              บันทึกการตั้งค่าเว็บฮุก
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===============================================================================
// ========================== 7. ข้อมูล (DATA MANAGEMENT) =========================
// ===============================================================================
// ===== DATA MANAGEMENT COMPONENT =====
function DataManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await simulateApiDelay(300);
      }

      toast.success("ส่งออกข้อมูลสำเร็จ");

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = "#";
        link.download = `scg-notifications-export-${
          new Date().toISOString().split("T")[0]
        }.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 500);
    } catch (error) {
      toast.error("ไม่สามารถส่งออกข้อมูลได้");
      console.error(error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      for (let i = 0; i <= 100; i += 5) {
        setImportProgress(i);
        await simulateApiDelay(200);
      }

      toast.success("นำเข้าข้อมูลสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถนำเข้าข้อมูลได้");
      console.error(error);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handlePurgeData = async () => {
    setIsLoading(true);

    try {
      await simulateApiDelay(2000);
      toast.success("ล้างข้อมูลสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถล้างข้อมูลได้");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
              <CardDescription className="font-noto">
                ส่งออกข้อมูลแจ้งเตือนเพื่อสำรองหรือย้ายระบบ
              </CardDescription>
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
                    <Label
                      htmlFor="export-start-date"
                      className="font-noto text-xs"
                    >
                      วันที่เริ่มต้น
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="export-start-date"
                        type="date"
                        className="pl-8"
                        defaultValue={
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split("T")[0]
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="export-end-date"
                      className="font-noto text-xs"
                    >
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
              <CardDescription className="font-noto">
                นำเข้าข้อมูลแจ้งเตือนจากไฟล์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-noto">สำคัญ</AlertTitle>
                <AlertDescription className="font-noto">
                  การนำเข้าข้อมูลจะผสานกับข้อมูลเดิม
                  โปรดตรวจสอบว่าไฟล์ของคุณอยู่ในรูปแบบที่ถูกต้อง
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="import-file" className="font-noto">
                  ไฟล์นำเข้า
                </Label>
                <Input id="import-file" type="file" />
                <p className="font-noto text-xs text-muted-foreground">
                  รองรับ: JSON, CSV, XLSX
                </p>
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
              <CardDescription className="font-noto">
                ลบข้อมูลเก่าหรือไม่จำเป็นถาวร
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-noto">คำเตือน</AlertTitle>
                <AlertDescription className="font-noto">
                  การล้างข้อมูลไม่สามารถกู้คืนได้
                  ควรส่งออกข้อมูลสำรองก่อนดำเนินการ
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
              <Button
                variant="destructive"
                onClick={handlePurgeData}
                disabled={isLoading}
                className="font-noto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isLoading ? "กำลังล้าง..." : "ล้างข้อมูล"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
