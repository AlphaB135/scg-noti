"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  Home,
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ManageReminder() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [setCurrentTime] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Form state for new/edit reminder
  const [formData, setFormData] = useState({
    title: "",
    type: "meeting",
    date: "",
    frequency: "no-repeat",
    status: "incomplete",
    details: "",
  });

  useEffect(() => {
    // Mock data for reminders
    const mockReminders = [
      {
        id: 1,
        title: "สรุปรายงานผลประกอบการ",
        type: "report",
        date: "2025-05-07",
        frequency: "monthly",
        status: "incomplete",
        details: "จัดทำรายงานภายในวันนี้",
      },
      {
        id: 2,
        title: "ปฐมนิเทศพนักงานใหม่",
        type: "meeting",
        date: "2025-05-07",
        frequency: "no-repeat",
        status: "incomplete",
        details: "เริ่มปฐมนิเทศในวันนี้",
      },
      {
        id: 3,
        title: "เตรียมเอกสารประชุม",
        type: "document",
        date: "2025-05-08",
        frequency: "no-repeat",
        status: "incomplete",
        details: "ส่งภายใน 8 พ.ค.",
      },
      {
        id: 4,
        title: "สั่งซื้ออุปกรณ์สำนักงาน",
        type: "purchase",
        date: "2025-05-09",
        frequency: "monthly",
        status: "incomplete",
        details: "จัดซื้อภายใน 9 พ.ค.",
      },
      {
        id: 5,
        title: "ตรวจสอบระบบเซิร์ฟเวอร์",
        type: "maintenance",
        date: "2025-05-09",
        frequency: "daily",
        status: "incomplete",
        details: "ดำเนินการก่อน 9 พ.ค.",
      },
      {
        id: 6,
        title: "อัปโหลดข้อมูลเข้าระบบ",
        type: "data",
        date: "2025-05-10",
        frequency: "no-repeat",
        status: "incomplete",
        details: "ส่งภายใน 10 พ.ค.",
      },
      {
        id: 7,
        title: "วางแผนอบรมประจำเดือน",
        type: "training",
        date: "2025-05-17",
        frequency: "monthly",
        status: "incomplete",
        details: "ดำเนินการภายใน 17 พ.ค.",
      },
      {
        id: 8,
        title: "จัดทำงบประมาณไตรมาสใหม่",
        type: "finance",
        date: "2025-05-18",
        frequency: "no-repeat",
        status: "completed",
        details: "ส่งภายใน 18 พ.ค.",
      },
    ];

    setReminders(mockReminders);

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Add new reminder
  const handleAddReminder = () => {
    const newReminder = {
      id: reminders.length + 1,
      ...formData,
    };
    setReminders([...reminders, newReminder]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Edit reminder
  const handleEditReminder = () => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === currentReminder.id
        ? { ...formData, id: reminder.id }
        : reminder
    );
    setReminders(updatedReminders);
    setIsEditDialogOpen(false);
    resetForm();
  };

  // Delete reminder
  const handleDeleteReminder = () => {
    const updatedReminders = reminders.filter(
      (reminder) => reminder.id !== currentReminder.id
    );
    setReminders(updatedReminders);
    setIsDeleteDialogOpen(false);
  };

  // Open edit dialog and set current reminder
  const openEditDialog = (reminder) => {
    setCurrentReminder(reminder);
    setFormData({
      title: reminder.title,
      type: reminder.type,
      date: reminder.date,
      frequency: reminder.frequency,
      status: reminder.status,
      details: reminder.details,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog and set current reminder
  const openDeleteDialog = (reminder) => {
    setCurrentReminder(reminder);
    setIsDeleteDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      type: "meeting",
      date: "",
      frequency: "no-repeat",
      status: "incomplete",
      details: "",
    });
    setCurrentReminder(null);
  };

  // Filter reminders based on search query and filters
  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reminder.status === statusFilter;
    const matchesType = typeFilter === "all" || reminder.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">เสร็จแล้ว</Badge>;
      case "incomplete":
        return <Badge className="bg-yellow-500">ยังไม่เสร็จ</Badge>;
      case "overdue":
        return <Badge className="bg-red-500">เลยกำหนด</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Get frequency text
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case "no-repeat":
        return "เตือนไม่ทำซ้ำ";
      case "monthly":
        return "เตือนทุกเดือน";
      case "daily":
        return "เตือนทุกวัน";
      default:
        return frequency;
    }
  };

  // Get type text and icon
  const getTypeInfo = (type) => {
    switch (type) {
      case "meeting":
        return { text: "การประชุม", icon: <Users className="h-4 w-4" /> };
      case "report":
        return { text: "รายงาน", icon: <FileText className="h-4 w-4" /> };
      case "document":
        return { text: "เอกสาร", icon: <FileText className="h-4 w-4" /> };
      case "purchase":
        return {
          text: "การสั่งซื้อ",
          icon: <DollarSign className="h-4 w-4" />,
        };
      case "maintenance":
        return { text: "การบำรุงรักษา", icon: <Clock className="h-4 w-4" /> };
      case "data":
        return { text: "ข้อมูล", icon: <FileText className="h-4 w-4" /> };
      case "training":
        return { text: "การอบรม", icon: <Users className="h-4 w-4" /> };
      case "finance":
        return { text: "การเงิน", icon: <DollarSign className="h-4 w-4" /> };
      default:
        return { text: type, icon: <Bell className="h-4 w-4" /> };
    }
  };

  // Format date to Thai format
  const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderMenuItems = () => (
    <>
                    <details className="group" open>
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
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
              <Link to="/manage" className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
                ตั้งค่าการแจ้งเตือน
              </Link>
              <Link
            to="/auditperson"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors">
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
          <Link to="/audit-logs" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors">
            ประวัติการดำเนินการพนักงาน
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
    </>
  );

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
          <details className="group" open>
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
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
              <Link to="/manage" className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/5 transition-colors font-bold cursor-pointer">
                ตั้งค่าการแจ้งเตือน
              </Link>
              <Link
            to="/auditperson"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors">
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
          <Link to="/audit-logs" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors">
            ประวัติการดำเนินการพนักงาน
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

        <button className="m-6 flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200">
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

          <button className="mt-6 w-full flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-6 w-full">
        {/* Main Content */}
        <div className="mt-0">
          <Card className="border-l-4 border-red-600">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold">
                    ตั้งค่าการแจ้งเตือน
                  </CardTitle>
                  <CardDescription>
                    สร้าง แก้ไข และลบการแจ้งเตือนต่างๆ
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-b from-red-800 to-red-900 hover:bg-red-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4 text-white" />{" "}
                  สร้างการแจ้งเตือนใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    placeholder="ค้นหาการแจ้งเตือน..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 ">
                    <Filter size={18} className="text-gray-500" />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="สถานะทั้งหมด" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                        <SelectItem value="completed">เสร็จแล้ว</SelectItem>
                        <SelectItem value="incomplete">ยังไม่เสร็จ</SelectItem>
                        <SelectItem value="overdue">เลยกำหนด</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="ประเภททั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                      <SelectItem value="meeting">การประชุม</SelectItem>
                      <SelectItem value="report">รายงาน</SelectItem>
                      <SelectItem value="document">เอกสาร</SelectItem>
                      <SelectItem value="purchase">การสั่งซื้อ</SelectItem>
                      <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
                      <SelectItem value="data">ข้อมูล</SelectItem>
                      <SelectItem value="training">การอบรม</SelectItem>
                      <SelectItem value="finance">การเงิน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reminders Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">หัวข้องาน</TableHead>
                      <TableHead>ประเภทงาน</TableHead>
                      <TableHead>วันที่แจ้งเตือน</TableHead>
                      <TableHead>ความถี่</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.length > 0 ? (
                      filteredReminders.map((reminder) => (
                        <TableRow key={reminder.id}>
                          <TableCell className="font-medium">
                            <div className="font-semibold">
                              {reminder.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reminder.details}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getTypeInfo(reminder.type).icon}
                              <span>{getTypeInfo(reminder.type).text}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatThaiDate(reminder.date)}</TableCell>
                          <TableCell>
                            {getFrequencyText(reminder.frequency)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(reminder.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(reminder)}
                              >
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
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
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
              <Label htmlFor="title">หัวข้องาน</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="กรอกหัวข้องาน"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">ประเภทงาน</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">การประชุม</SelectItem>
                    <SelectItem value="report">รายงาน</SelectItem>
                    <SelectItem value="document">เอกสาร</SelectItem>
                    <SelectItem value="purchase">การสั่งซื้อ</SelectItem>
                    <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
                    <SelectItem value="data">ข้อมูล</SelectItem>
                    <SelectItem value="training">การอบรม</SelectItem>
                    <SelectItem value="finance">การเงิน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">วันที่แจ้งเตือน</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="frequency">ความถี่</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    handleSelectChange("frequency", value)
                  }
                >
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
                <Label htmlFor="status">สถานะ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">เสร็จแล้ว</SelectItem>
                    <SelectItem value="incomplete">ยังไม่เสร็จ</SelectItem>
                    <SelectItem value="overdue">เลยกำหนด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">รายละเอียด</Label>
              <Textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleAddReminder}
              className="bg-red-600 hover:bg-red-700"
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
              <Label htmlFor="edit-title">หัวข้องาน</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="กรอกหัวข้องาน"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-type">ประเภทงาน</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">การประชุม</SelectItem>
                    <SelectItem value="report">รายงาน</SelectItem>
                    <SelectItem value="document">เอกสาร</SelectItem>
                    <SelectItem value="purchase">การสั่งซื้อ</SelectItem>
                    <SelectItem value="maintenance">การบำรุงรักษา</SelectItem>
                    <SelectItem value="data">ข้อมูล</SelectItem>
                    <SelectItem value="training">การอบรม</SelectItem>
                    <SelectItem value="finance">การเงิน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">วันที่แจ้งเตือน</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-frequency">ความถี่</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) =>
                    handleSelectChange("frequency", value)
                  }
                >
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
                <Label htmlFor="edit-status">สถานะ</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">เสร็จแล้ว</SelectItem>
                    <SelectItem value="incomplete">ยังไม่เสร็จ</SelectItem>
                    <SelectItem value="overdue">เลยกำหนด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-details">รายละเอียด</Label>
              <Textarea
                id="edit-details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleEditReminder}
              className="bg-red-600 hover:bg-red-700"
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
            <p className="text-center text-gray-700">
              คุณต้องการลบการแจ้งเตือน "{currentReminder?.title}" ใช่หรือไม่?
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReminder}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบการแจ้งเตือน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
