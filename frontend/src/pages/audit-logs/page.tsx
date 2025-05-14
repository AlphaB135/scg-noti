"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Clock,
  LogOut,
  Settings,
  FileText,
  History,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Edit,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ประเภทของการดำเนินการ
type ActionType =
  | "task_created"
  | "task_completed"
  | "task_updated"
  | "task_postponed"
  | "task_reopened"
  | "task_deleted";

// ข้อมูลประวัติการดำเนินการ
interface AuditLog {
  id: string;
  taskId: number;
  taskTitle: string;
  actionType: ActionType;
  actionBy: string;
  actionDate: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
}

export default function AuditLogsPage() {
  // ===== STATE MANAGEMENT =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("all");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tasks, setTasks] = useState([]);

  // ===== MOCK DATA LOADING =====
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const twoDaysAgoStr = new Date(Date.now() - 86400000 * 2)
      .toISOString()
      .split("T")[0];

    // โหลดข้อมูลงานตัวอย่าง (เหมือนกับหน้าหลัก)
    const mockTasks = [
      // ✅ งานวันนี้
      {
        id: 1,
        title: "สรุปรายงานผลประกอบการ",
        details: "จัดทำรายงานภายในวันนี้",
        dueDate: todayStr,
        priority: "today",
        done: false,
      },
      {
        id: 2,
        title: "ปฐมนิเทศพนักงานใหม่",
        details: "เริ่มปฐมนิเทศในวันนี้",
        dueDate: todayStr,
        priority: "today",
        done: false,
      },
      // 🔴 งานด่วน (เหลือ 1-2 วัน)
      {
        id: 3,
        title: "เตรียมเอกสารประชุม",
        details: "ส่งภายใน 8 พ.ค.",
        dueDate: "2025-05-08",
        priority: "urgent",
        done: false,
      },
      {
        id: 4,
        title: "สั่งซื้ออุปกรณ์สำนักงาน",
        details: "จัดซื้อภายใน 9 พ.ค.",
        dueDate: "2025-05-09",
        priority: "urgent",
        done: false,
      },
      {
        id: 5,
        title: "ตรวจสอบระบบเซิร์ฟเวอร์",
        details: "ดำเนินการก่อน 9 พ.ค.",
        dueDate: "2025-05-09",
        priority: "urgent",
        done: false,
      },
      {
        id: 6,
        title: "อัปโหลดข้อมูลเข้าระบบ",
        details: "ส่งภายใน 10 พ.ค.",
        dueDate: "2025-05-10",
        priority: "urgent",
        done: false,
      },
      // 🟡 งานอื่นๆ (ทั่วไปของเดือน พ.ค.)
      {
        id: 7,
        title: "วางแผนอบรมประจำเดือน",
        details: "ดำเนินการภายใน 17 พ.ค.",
        dueDate: "2025-05-17",
        priority: "pending",
        done: false,
      },
      {
        id: 8,
        title: "จัดทำงบประมาณไตรมาสใหม่",
        details: "ส่งภายใน 18 พ.ค.",
        dueDate: "2025-05-18",
        priority: "pending",
        done: false,
      },
      // งานเลยกำหนด
      {
        id: 9,
        title: "ส่งรายงานประจำเดือน",
        details: "ควรส่งภายใน 5 พ.ค.",
        dueDate: "2025-05-05",
        priority: "overdue",
        done: false,
      },
      {
        id: 10,
        title: "ตรวจสอบงบประมาณไตรมาส",
        details: "ควรเสร็จภายใน 6 พ.ค.",
        dueDate: "2025-05-06",
        priority: "overdue",
        done: false,
      },
    ];

    setTasks(mockTasks);

    // สร้างข้อมูลประวัติการดำเนินการตัวอย่าง
    const mockAuditLogs: AuditLog[] = [
      // วันนี้
      {
        id: "log1",
        taskId: 1,
        taskTitle: "สรุปรายงานผลประกอบการ",
        actionType: "task_created",
        actionBy: "โชกุน สุดหล่อ",
        actionDate: `${todayStr}T09:15:00`,
        details: "สร้างงานใหม่",
      },
      {
        id: "log2",
        taskId: 2,
        taskTitle: "ปฐมนิเทศพนักงานใหม่",
        actionType: "task_updated",
        actionBy: "แบงค์ คาร์แคร์",
        actionDate: `${todayStr}T10:30:00`,
        details: "แก้ไขรายละเอียดงาน",
        oldValue: "เริ่มปฐมนิเทศ",
        newValue: "เริ่มปฐมนิเทศในวันนี้",
      },
      {
        id: "log3",
        taskId: 5,
        taskTitle: "ตรวจสอบระบบเซิร์ฟเวอร์",
        actionType: "task_postponed",
        actionBy: "บิว อาสยาม",
        actionDate: `${todayStr}T11:45:00`,
        details: "เลื่อนกำหนดส่งงาน",
        oldValue: "2025-05-08",
        newValue: "2025-05-09",
      },

      // เมื่อวาน
      {
        id: "log4",
        taskId: 9,
        taskTitle: "ส่งรายงานประจำเดือน",
        actionType: "task_updated",
        actionBy: "บาส ไม่เป็นสุข",
        actionDate: `${yesterdayStr}T14:20:00`,
        details: "เปลี่ยนสถานะเป็นเลยกำหนด",
      },
      {
        id: "log5",
        taskId: 10,
        taskTitle: "ตรวจสอบงบประมาณไตรมาส",
        actionType: "task_updated",
        actionBy: "พี่พีท ซีเนียร์จำเป็น",
        actionDate: `${yesterdayStr}T15:10:00`,
        details: "เปลี่ยนสถานะเป็นเลยกำหนด",
      },
      {
        id: "log6",
        taskId: 8,
        taskTitle: "จัดทำงบประมาณไตรมาสใหม่",
        actionType: "task_created",
        actionBy: "พี่พีท ซีเนียร์จำเป็น",
        actionDate: `${yesterdayStr}T16:30:00`,
        details: "สร้างงานใหม่",
      },

      // 2 วันที่แล้ว
      {
        id: "log7",
        taskId: 3,
        taskTitle: "เตรียมเอกสารประชุม",
        actionType: "task_created",
        actionBy: "โชกุน สุดหล่อ",
        actionDate: `${twoDaysAgoStr}T09:00:00`,
        details: "สร้างงานใหม่",
      },
      {
        id: "log8",
        taskId: 4,
        taskTitle: "สั่งซื้ออุปกรณ์สำนักงาน",
        actionType: "task_created",
        actionBy: "แบงค์ คาร์แคร์",
        actionDate: `${twoDaysAgoStr}T10:15:00`,
        details: "สร้างงานใหม่",
      },
      {
        id: "log9",
        taskId: 7,
        taskTitle: "วางแผนอบรมประจำเดือน",
        actionType: "task_postponed",
        actionBy: "บาส ไม่เป็นสุข",
        actionDate: `${twoDaysAgoStr}T13:45:00`,
        details: "เลื่อนกำหนดส่งงานจากวันที่ 15 พ.ค. ไปเป็นวันที่ 17 พ.ค.",
      },
      {
        id: "log10",
        taskId: 6,
        taskTitle: "อัปโหลดข้อมูลเข้าระบบ",
        actionType: "task_completed",
        actionBy: "บิว อาสยาม",
        actionDate: `${twoDaysAgoStr}T16:20:00`,
        details: "ทำงานเสร็จแล้ว",
      },
      {
        id: "log11",
        taskId: 6,
        taskTitle: "อัปโหลดข้อมูลเข้าระบบ",
        actionType: "task_reopened",
        actionBy: "โชกุน สุดหล่อ",
        actionDate: `${twoDaysAgoStr}T17:30:00`,
        details: "เปิดงานใหม่เนื่องจากข้อมูลไม่ครบถ้วน",
      },
    ];

    // เรียงลำดับตามวันที่ล่าสุด
    mockAuditLogs.sort(
      (a, b) =>
        new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
    );

    setAuditLogs(mockAuditLogs);
  }, []);

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ===== HELPER FUNCTIONS =====
  // แปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // แปลงวันที่แบบสั้น
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // แปลงประเภทการดำเนินการเป็นภาษาไทย
  const getActionTypeText = (actionType: ActionType) => {
    switch (actionType) {
      case "task_created":
        return "สร้างงานใหม่";
      case "task_completed":
        return "ทำงานเสร็จแล้ว";
      case "task_updated":
        return "แก้ไขงาน";
      case "task_postponed":
        return "เลื่อนกำหนดส่ง";
      case "task_reopened":
        return "เปิดงานใหม่";
      case "task_deleted":
        return "ลบงาน";
      default:
        return actionType;
    }
  };

  // แปลงประเภทการดำเนินการเป็นสี
  const getActionTypeColor = (actionType: ActionType) => {
    switch (actionType) {
      case "task_created":
        return "bg-blue-100 text-blue-800";
      case "task_completed":
        return "bg-green-100 text-green-800";
      case "task_updated":
        return "bg-purple-100 text-purple-800";
      case "task_postponed":
        return "bg-orange-100 text-orange-800";
      case "task_reopened":
        return "bg-yellow-100 text-yellow-800";
      case "task_deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // แปลงประเภทการดำเนินการเป็นไอคอน
  const getActionTypeIcon = (actionType: ActionType) => {
    switch (actionType) {
      case "task_created":
        return <FileText className="h-4 w-4" />;
      case "task_completed":
        return <CheckCircle className="h-4 w-4" />;
      case "task_updated":
        return <Edit className="h-4 w-4" />;
      case "task_postponed":
        return <ArrowRight className="h-4 w-4" />;
      case "task_reopened":
        return <RefreshCw className="h-4 w-4" />;
      case "task_deleted":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // กรองประวัติการดำเนินการตามเงื่อนไข
  const filteredLogs = auditLogs.filter((log) => {
    // กรองตามคำค้นหา
    const matchesSearch =
      log.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actionBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details &&
        log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    // กรองตามประเภทการดำเนินการ
    const matchesType = filterType === "all" || log.actionType === filterType;

    // กรองตามวันที่
    let matchesDate = true;
    if (filterDate === "today") {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = log.actionDate.startsWith(today);
    } else if (filterDate === "yesterday") {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      matchesDate = log.actionDate.startsWith(yesterday);
    } else if (filterDate === "last7days") {
      const sevenDaysAgo = new Date(Date.now() - 86400000 * 7);
      matchesDate = new Date(log.actionDate) >= sevenDaysAgo;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  // จัดกลุ่มประวัติการดำเนินการตามวันที่
  const groupedLogs: { [date: string]: AuditLog[] } = {};
  filteredLogs.forEach((log) => {
    const date = log.actionDate.split("T")[0];
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });

  // แปลงวันที่เป็นรูปแบบที่อ่านง่ายสำหรับหัวข้อกลุ่ม
  const formatGroupDate = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (dateString === today) {
      return "วันนี้";
    } else if (dateString === yesterday) {
      return "เมื่อวาน";
    } else {
      return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // ===== SIDEBAR MENU ITEMS =====
  // แสดงรายการเมนูในแถบด้านข้าง
  const renderMenuItems = () => (
    <>
      <details className="group" open>
        <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" />
          ระบบการแจ้งเตือน
        </summary>
        <div className="ml-4 mt-2 space-y-1">
          <Link
            to="/dashboard"
            className="block rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            เตือนความจำ
          </Link>
          <Link
            to="/manage"
            className="block rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
          >
            ตั้งค่าการแจ้งเตือน
          </Link>
          <Link
            to="/auditperson"
            className="block rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
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
            to="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/10 font-bold"
          >
            ประวัติการดำเนินการพนักงาน
          </Link>
          <Link
            to="/addemployee"
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
          <details className="group">
            <summary className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              ระบบการแจ้งเตือน
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              <Link
                to="/dashboard"
                className="block rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
              >
                เตือนความจำ
              </Link>
              <Link
                to="/manage"
                className="block rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
              >
                ตั้งค่าการแจ้งเตือน
              </Link>
              <Link
                to="/auditperson"
                className="block rounded-md px-3 py-2 hover:bg-white/5 transition-colors"
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
                className="flex items-center gap-3 rounded-md px-3 py-2 bg-white/10 font-bold"
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
      {/* เมนูสำหรับมือถือที่แสดงเมื่อกดปุ่มแฮมเบอร์เกอร์ */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-64 h-full bg-gradient-to-b from-red-800 to-red-900 text-white z-40 shadow-lg p-3 overflow-y-auto">
          <nav className="space-y-1">{renderMenuItems()}</nav>

          <button className="mt-6 w-full flex items-center justify-center rounded-md bg-white py-2 font-bold text-red-700 hover:bg-gray-200">
            <LogOut className="mr-2 h-5 w-5" />
            ออกจากระบบ
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
              <h1 className="text-xl font-bold text-gray-800">
                ประวัติการดำเนินการ
              </h1>
              <p className="text-sm text-gray-500">
                ติดตามการเปลี่ยนแปลงและการดำเนินการของงาน
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
        {/* ส่วนหัวสำหรับมือถือ */}
        <header className="block md:hidden bg-white border-b shadow-sm w-full top-14 z-30">
          <div className="flex flex-col px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  ประวัติการดำเนินการ
                </h1>
                <p className="text-xs text-gray-500">
                  ติดตามการเปลี่ยนแปลงและการดำเนินการของงาน
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

        {/* ===== AUDIT LOGS CONTENT ===== */}
        <div className="mt-4">
          {/* ===== SEARCH AND FILTER SECTION ===== */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <History className="mr-2 h-5 w-5 text-red-700" />
                ค้นหาและกรองประวัติการดำเนินการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ช่องค้นหา */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ค้นหาตามชื่องาน, ผู้ดำเนินการ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* ตัวกรองประเภทการดำเนินการ */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="กรองตามประเภทการดำเนินการ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="task_created">สร้างงานใหม่</SelectItem>
                    <SelectItem value="task_completed">
                      ทำงานเสร็จแล้ว
                    </SelectItem>
                    <SelectItem value="task_updated">แก้ไขงาน</SelectItem>
                    <SelectItem value="task_postponed">
                      เลื่อนกำหนดส่ง
                    </SelectItem>
                    <SelectItem value="task_reopened">เปิดงานใหม่</SelectItem>
                    <SelectItem value="task_deleted">ลบงาน</SelectItem>
                  </SelectContent>
                </Select>

                {/* ตัวกรองตามวันที่ */}
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="กรองตามวันที่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="today">วันนี้</SelectItem>
                    <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                    <SelectItem value="last7days">7 วันที่ผ่านมา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ===== STATISTICS SECTION ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-700">
                  การดำเนินการทั้งหมด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-3">
                    <History className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {auditLogs.length}
                    </p>
                    <p className="text-sm text-gray-500">รายการ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-700">
                  งานที่เสร็จสิ้น
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
                    <CheckCircle className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        auditLogs.filter(
                          (log) => log.actionType === "task_completed"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-500">รายการ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-700">
                  งานที่เลื่อนออกไป
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mr-3">
                    <ArrowRight className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        auditLogs.filter(
                          (log) => log.actionType === "task_postponed"
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-500">รายการ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===== TABS SECTION ===== */}
          <Tabs defaultValue="timeline" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>ไทม์ไลน์</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>ตารางข้อมูล</span>
              </TabsTrigger>
            </TabsList>

            {/* ===== TIMELINE VIEW ===== */}
            <TabsContent value="timeline" className="mt-4">
              {Object.keys(groupedLogs).length > 0 ? (
                Object.keys(groupedLogs)
                  .sort()
                  .reverse()
                  .map((date) => (
                    <div key={date} className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-red-700" />
                        {formatGroupDate(date)}
                      </h3>
                      <div className="relative border-l-2 border-gray-200 pl-6 ml-3 space-y-6">
                        {groupedLogs[date].map((log) => (
                          <div key={log.id} className="relative">
                            {/* จุดบนไทม์ไลน์ */}
                            <div className="absolute -left-[31px] mt-1.5 h-4 w-4 rounded-full bg-red-700 border-4 border-white shadow-sm"></div>

                            {/* การ์ดแสดงข้อมูล */}
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 mb-2 md:mb-0">
                                    <Badge
                                      className={getActionTypeColor(
                                        log.actionType
                                      )}
                                      variant="secondary"
                                    >
                                      <span className="flex items-center gap-1">
                                        {getActionTypeIcon(log.actionType)}
                                        {getActionTypeText(log.actionType)}
                                      </span>
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      {new Date(
                                        log.actionDate
                                      ).toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-700">
                                    ดำเนินการโดย: {log.actionBy}
                                  </div>
                                </div>

                                <h4 className="text-base font-semibold text-gray-800 mb-1">
                                  {log.taskTitle}
                                </h4>

                                <p className="text-sm text-gray-600">
                                  {log.details}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-200">
                    <History className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    ไม่พบประวัติการดำเนินการ
                  </h3>
                  <p className="text-gray-500">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาและการกรอง
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ===== TABLE VIEW ===== */}
            <TabsContent value="table" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {filteredLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              วันที่และเวลา
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ชื่องาน
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              การดำเนินการ
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ผู้ดำเนินการ
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              รายละเอียด
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(log.actionDate)}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {log.taskTitle}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={getActionTypeColor(log.actionType)}
                                  variant="secondary"
                                >
                                  <span className="flex items-center gap-1">
                                    {getActionTypeIcon(log.actionType)}
                                    {getActionTypeText(log.actionType)}
                                  </span>
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {log.actionBy}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {log.details}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                        <History className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-1">
                        ไม่พบประวัติการดำเนินการ
                      </h3>
                      <p className="text-gray-500">
                        ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาและการกรอง
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
