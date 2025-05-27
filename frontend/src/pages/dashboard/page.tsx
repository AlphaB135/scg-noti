"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { notificationsApi, invalidateCache } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

// Import our separated components
import AppLayout from "@/components/layout/app-layout";
import TaskStatusCards from "@/components/dashboard/1.task-status-cards";
import MonthlyProgress from "@/components/dashboard/2.monthly-progress";
import TaskList from "@/components/dashboard/3.task-list";
import TaskCalendar from "@/components/dashboard/5.task-calendar";
import TaskModal from "@/components/dashboard/4.task-modal";
import type { Task } from "@/lib/types/task";

// Define API types
type APINotification = {
  id: string;
  title: string;
  message: string;
  dueDate?: string;
  scheduledAt?: string;
  status: string;
  rescheduleHistory?: Array<{ date: string; reason: string }>;
  reopenHistory?: Array<{ date: string; reason: string }>;
};

// ===== STATE MANAGEMENT =====
export default function AdminNotificationPage() {
  const [tasks, setTasks] = useState<Task[]>([]); // เก็บรายการงานที่แสดงในปัจจุบัน
  const [allTasks, setAllTasks] = useState<Task[]>([]); // เก็บรายการงานทั้งหมด

  // Initial state with current date
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [currentTime, setCurrentTime] = useState(now);
  const [calendarKey, setCalendarKey] = useState(0); // สำหรับ force re-render calendar
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0); // สำหรับ force refresh ทั้งหมด

  const [expandTodo, setExpandTodo] = useState(false); // ควบคุมการแสดง modal รายการงานแบบเต็มจอ
  const [editTask, setEditTask] = useState<Task | null>(null); // เก็บข้อมูลงานที่กำลังแก้ไข

  // dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalActiveFilter, setModalActiveFilter] = useState("all");

  // form states
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    date: "",
    frequency: "no-repeat",
    impact: "",
    hasLogin: false,
    username: "",
    password: "",
    link: "",
  });

  const [taskToReschedule, setTaskToReschedule] = useState<Task | null>(null);
  const [taskToReopen, setTaskToReopen] = useState<Task | null>(null);
  const [reopenReason, setReopenReason] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // เพิ่มสถานะสำหรับหน้าต่างรายละเอียดงาน
  const [isTaskDetailDialogOpen, setIsTaskDetailDialogOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);

  // แยกฟังก์ชันโหลดข้อมูลเป็นส่วนๆ
  const loadCurrentMonthData = useCallback(async () => {
    try {
      // โหลดข้อมูลการแจ้งเตือนทั้งหมด
      const allResponse = await notificationsApi.getCurrentMonthNotifications(selectedMonth, selectedYear);
      console.log('📥 Raw API response:', allResponse);

      if (!allResponse?.data) {
        throw new Error("Invalid response format");
      }

      const allMappedTasks = allResponse.data.map(
        (notification) =>
          ({
            id: notification.id,
            title: notification.title,
            details: notification.message || "",
            dueDate: notification.scheduledAt?.split("T")[0] || "",
            done: notification.status === "DONE",
            priority: "pending" as const,
            frequency: "no-repeat" as const,
            impact: "",
            link: "",
            hasLogin: false,
            username: "",
            password: "",
          } satisfies Task)
      );
      console.log('🔄 Mapped tasks:', allMappedTasks);

      // อัพเดทสถานะงานก่อนเซ็ตค่า
      const updatedAllTasks = allMappedTasks.map((task) => updateTaskPriority(task));
      console.log('⭐ Tasks with priority:', updatedAllTasks);
      
      // กรองข้อมูลตามเดือนและปีที่เลือก
      const filteredTasks = updatedAllTasks.filter((task) => {
        if (!task.dueDate) {
          console.log('⚠️ Task missing dueDate:', task);
          return false;
        }
        
        const [taskYear, taskMonth] = task.dueDate.split('-').map(Number);
        const matches = taskMonth === selectedMonth && taskYear === selectedYear;
        
        if (matches) {
          console.log('✅ Task matches current month/year:', task);
        } else {
          console.log('❌ Task does not match:', {task, taskMonth, taskYear, selectedMonth, selectedYear});
        }
        
        return matches;
      });
      console.log('📅 Filtered tasks for', selectedMonth, '/', selectedYear, ':', filteredTasks);

      setTasks(filteredTasks);
      setAllTasks(updatedAllTasks); // เก็บข้อมูลทั้งหมดไว้สำหรับใช้งานอื่น
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [selectedMonth, selectedYear]);

  // โหลดข้อมูลตอนเริ่มต้นและเมื่อเปลี่ยนเดือน/ปี
  useEffect(() => {
    loadCurrentMonthData();
  }, [loadCurrentMonthData]);

  // เพิ่ม event listener สำหรับ window focus เพื่อ refresh ข้อมูลเมื่อกลับมาที่หน้า
  useEffect(() => {
    const handleFocus = () => {
      // Invalidate cache และโหลดข้อมูลใหม่
      invalidateCache('notifications');
      loadCurrentMonthData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadCurrentMonthData]);

  // Handle edit task
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        details: editTask.details || "",
        date: editTask.dueDate || "",
        frequency: (editTask.frequency as string) || "no-repeat",
        impact: editTask.impact || "",
        hasLogin: editTask.hasLogin || false,
        username: editTask.username || "",
        password: editTask.password || "",
        link: editTask.link || "",
      });
    }
  }, [editTask]);

  // ===== TASK MANAGEMENT FUNCTIONS =====
  // Set task priority based on due date
  const updateTaskPriority = (task: Task): Task => {
    if (!task.dueDate) return { ...task, priority: "pending" };

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < 0) return { ...task, priority: "overdue" }; // งานที่เลยกำหนด
    if (diffInDays === 0) return { ...task, priority: "today" }; // งานที่ต้องทำวันนี้
    if (diffInDays <= 3) return { ...task, priority: "urgent" }; // งานด่วนที่ต้องทำภายใน 3 วัน
    return { ...task, priority: "pending" }; // งานปกติที่ยังไม่ถึงกำหนด
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: "",
      details: "",
      date: "",
      frequency: "no-repeat",
      impact: "",
      hasLogin: false,
      username: "",
      password: "",
      link: "",
    });
    setNewDueDate("");
    setEditTask(null);
  };

  // Form change handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openRescheduleDialog = (
    task: Task,
    source: "manual" | "drag" = "manual"
  ) => {
    setTaskToReschedule(task);
    setNewDueDate(task.dueDate ?? ""); // initial value
    setRescheduleReason(""); // clear
    setRescheduleSource(source); // <-- HERE
    setIsRescheduleDialogOpen(true);
  };

  const handleRescheduleStart = (task: Task, newDate: string) => {
    setTaskToReschedule(task);
    setNewDueDate(newDate);
    setRescheduleSource("drag");
    setRescheduleReason("");
    setIsRescheduleDialogOpen(true);
  };

  // Function to open reopen dialog
  const openReopenDialog = (task: Task) => {
    setTaskToReopen(task);
    setIsReopenDialogOpen(true);
  };

  // เพิ่มฟังก์ชันสำหรับเปิดหน้าต่างรายละเอียดงาน
  const openTaskDetailDialog = (task: Task) => {
    setTaskDetail(task);
    setIsTaskDetailDialogOpen(true);
  };

  // Function to change month/year
  const changeMonth = (month: number, year: number) => {
    console.log("Changing month/year to:", { month, year });
    setSelectedMonth(month);
    setSelectedYear(year);

    // กรองข้อมูลใหม่จาก allTasks
    const filteredTasks = allTasks.filter((task: Task) => {
      if (!task.dueDate) {
        console.log('⚠️ Task has no dueDate:', task);
        return false;
      }
      // แปลง date string เป็น UTC เพื่อให้แน่ใจว่าไม่มีปัญหาเรื่อง timezone
      const [y, m, d] = task.dueDate.split('-').map(Number);
      if (!y || !m || !d) {
        console.log('⚠️ Invalid date format:', task.dueDate);
        return false;
      }
      return y === year && m === month;
    });
    console.log('🔍 Filtered tasks for', month, '/', year, ':', filteredTasks);

    // อัพเดทสถานะงานก่อนเซ็ตค่า
    const updatedTasks = filteredTasks.map((task) => updateTaskPriority(task));
    console.log('✨ Final tasks with priority:', updatedTasks);
    setTasks(updatedTasks);
  };

  // Handler for reopening a task
  const handleReopenTask = async () => {
    if (!taskToReopen || !reopenReason.trim()) return;

    try {
      // ใช้ updateStatus แทน reopen
      await notificationsApi.updateStatus(taskToReopen.id, 'PENDING');

      // อัปเดตทั้ง tasks และ allTasks
      const updateTask = (t: Task) =>
        t.id === taskToReopen.id ? { ...t, done: false } : t;

      setTasks((prev) => prev.map(updateTask));
      setAllTasks((prev) => prev.map(updateTask));

      // รีเฟรชข้อมูลสำหรับอัพเดท dashboard stats
      await loadCurrentMonthData();

      setTaskToReopen(null);
      setReopenReason("");
      setIsReopenDialogOpen(false);
    } catch (error) {
      console.error("Failed to reopen task:", error);
    }
  };

  // Handler for rescheduling a task
  const handleRescheduleTask = async () => {
    if (
      !taskToReschedule ||
      !rescheduleReason.trim() ||
      (rescheduleSource === "manual" && !newDueDate)
    )
      return;

    setIsRescheduling(true);
    try {
      // ใช้ newDueDate สำหรับทั้ง manual และ drag
      const targetDate = newDueDate;
      
      // บันทึกข้อมูลใหม่ไปยัง server
      await notificationsApi.update(taskToReschedule.id, {
        scheduledAt: new Date(targetDate).toISOString(),
      } as any);

      // ปิด dialog และ clear form
      setTaskToReschedule(null);
      setRescheduleReason("");
      setNewDueDate("");
      setIsRescheduleDialogOpen(false);
      
      // แสดงการแจ้งเตือนความสำเร็จ
      console.log(`✅ Task "${taskToReschedule.title}" rescheduled to ${targetDate} successfully!`);
      
      // Refresh หน้าทั้งหมดเพื่อให้แน่ใจว่า UI อัพเดท
      window.location.reload();
    } catch (error) {
      console.error("Failed to reschedule task:", error);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Toggle task completion status
  const handleToggleTaskDone = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    if (!target.done) {
      // ถ้างานยังไม่เสร็จ ให้แสดง submit dialog
      setSubmitTask(target);
      setIsSubmitDialogOpen(true);
      return;
    }
    
    // ถ้างานเสร็จแล้ว ให้เปิด reopen dialog
    openReopenDialog(target);
  };
  // Load existing task data when editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || "",
        details: editTask.details || "",
        date: editTask.dueDate || "",
        frequency: (editTask.frequency as string) || "no-repeat",
        impact: editTask.impact || "",
        hasLogin: editTask.hasLogin || false,
        username: editTask.username || "",
        password: editTask.password || "",
        link: editTask.link || "",
      });
    }
  }, [editTask]);
  // Add or edit task
  const handleAddTask = async () => {
    if (
      !formData.title.trim() ||
      !formData.date ||
      !formData.details.trim() ||
      !formData.impact.trim()
    ) {
      return;
    }

    try {
      const message = `${formData.details}\n\nผลกระทบ: ${formData.impact}${
        formData.hasLogin
          ? `\n\nข้อมูลการเข้าสู่ระบบ:\nUsername: ${formData.username}\nPassword: ${formData.password}`
          : ""
      }`;

      if (editTask) {
        // Update existing task
        await notificationsApi.update(editTask.id, {
          title: formData.title,
          message: message,
          scheduledAt: new Date(formData.date).toISOString(),
        } as any);

        // Update local state - ทั้ง tasks และ allTasks
        const updateTask = (t: Task) =>
          t.id === editTask.id
            ? {
                ...t,
                title: formData.title,
                details: message,
                dueDate: formData.date,
                frequency: formData.frequency as Task["frequency"],
                impact: formData.impact,
                link: formData.link,
                hasLogin: formData.hasLogin,
                username: formData.username,
                password: formData.password,
              }
            : t;

        setTasks((prev) => prev.map(updateTask));
        setAllTasks((prev) => prev.map(updateTask));
      } else {
        // Create new task
        const notification = await notificationsApi.create({
          title: formData.title,
          message,
          type: "TODO",
          scheduledAt: new Date(formData.date).toISOString(),
          category: "TASK",
          link: formData.link || undefined,
          urgencyDays: 3,
          repeatIntervalDays: 0,
          recipients: [{ type: "ALL" }],
        } as any);

        const newTask: Task = {
          id: notification.id,
          title: notification.title,
          details: notification.message,
          dueDate: notification.scheduledAt?.split("T")[0],
          done: false,
          priority: "pending",
          frequency: formData.frequency as Task["frequency"],
          impact: formData.impact,
          link: formData.link,
          hasLogin: formData.hasLogin,
          username: formData.username,
          password: formData.password,
        };

        const updatedTask = updateTaskPriority(newTask);
        
        // เพิ่มใน allTasks
        setAllTasks((prev) => [...prev, updatedTask]);
        
        // ถ้าอยู่ในเดือนปัจจุบัน ให้เพิ่มใน tasks ด้วย
        const taskDate = new Date(formData.date);
        const taskMonth = taskDate.getMonth() + 1;
        const taskYear = taskDate.getFullYear();
        
        if (taskYear === selectedYear && taskMonth === selectedMonth) {
          setTasks((prev) => [...prev, updatedTask]);
        }
      }

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create or update notification:", error);
    }
  };

  // ===== TASK STATISTICS =====
  // นับจำนวนงานตามประเภทต่างๆ
  const totalTasks = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const incompleteCnt = totalTasks - doneCount;
  const urgentTodayCount = tasks.filter(
    (t) => ["today", "urgent"].includes(t.priority) && !t.done
  ).length;
  const overdueCount = tasks.filter(
    (t) => t.priority === "overdue" && !t.done
  ).length;
  const otherPendingCount = tasks.filter(
    (t) => !["today", "urgent", "overdue"].includes(t.priority) && !t.done
  ).length;
  const progressPercent = totalTasks
    ? Math.round((doneCount / totalTasks) * 100)
    : 0;

  // อัพเดทข้อมูลการแจ้งเตือน
  const notifications = {
    urgentToday: urgentTodayCount,
    overdue: overdueCount,
    other: otherPendingCount,
    done: doneCount,
  };

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  const [submitEvidence, setSubmitEvidence] = useState<File | null>(null);

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // อัพเดทสถานะงานทุกครั้งที่เวลาเปลี่ยน
      setTasks((prev) => prev.map((task) => updateTaskPriority(task)));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle card click to expand todo and set filter
  const handleCardClick = (filter: string) => {
    setExpandTodo(true);
    setModalActiveFilter(filter);
    setTimeout(() => {
      const el = document.getElementById(`section-${filter}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };
  const [rescheduleSource, setRescheduleSource] = useState<"manual" | "drag">(
    "drag"
  );
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Load notifications function
  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.getAll(1, 100);
      if (res?.data) {
        const mappedTasks = res.data.map(
          (notification) =>
            ({
              id: notification.id,
              title: notification.title,
              details: notification.message || "",
              dueDate: notification.scheduledAt?.split("T")[0] || "",
              done: notification.status === "DONE",
              priority: "pending" as const,
              frequency: "no-repeat" as const,
              impact: "",
              link: "",
              hasLogin: false,
              username: "",
              password: "",
            } satisfies Task)
        );
        
        const updatedAllTasks = mappedTasks.map((task) => updateTaskPriority(task));
        setAllTasks(updatedAllTasks);
        
        // กรองข้อมูลสำหรับเดือนปัจจุบัน
        const filteredTasks = updatedAllTasks.filter((task: Task) => {
          if (!task.dueDate) {
            console.log('⚠️ Task missing dueDate:', task);
            return false;
          }
          
          // แยกปีและเดือนจาก dueDate string โดยตรง ("YYYY-MM-DD")
          const [taskYear, taskMonth] = task.dueDate.split('-').map(Number);
          const matches = taskMonth === selectedMonth && taskYear === selectedYear;
          
          if (matches) {
            console.log('✅ Task matches current month/year:', task);
          } else {
            console.log('❌ Task does not match:', {task, taskMonth, taskYear, selectedMonth, selectedYear});
          }
          
          return matches;
        });
        console.log('📅 Filtered tasks for', selectedMonth, '/', selectedYear, ':', filteredTasks);
        
        const updatedTasks = filteredTasks.map((task) => updateTaskPriority(task));
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  return (
    <AppLayout
      title="ระบบเตือนความจำ"
      description="จัดการงานและการแจ้งเตือนของคุณ"
    >
      {/* ===== NOTIFICATION CARDS ===== */}
      <TaskStatusCards
        notifications={notifications}
        onCardClick={handleCardClick}
      />

      {/* ===== DASHBOARD MAIN CONTENT ===== */}
      <div className="hidden md:grid md:grid-cols-10 gap-4 md:gap-6 mt-4 md:mt-6 w-full">
        {/* ===== DONUT CHART (30% width on desktop only) ===== */}
        <div className="md:col-span-3 flex">
          <MonthlyProgress
            doneCount={doneCount}
            incompleteCnt={incompleteCnt}
            totalTasks={totalTasks}
            progressPercent={progressPercent}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
        {/* ===== TO-DO LIST (70% width on desktop only) ===== */}
        <div className="md:col-span-7 flex">
          <TaskList
            tasks={tasks}
            activeFilter={activeFilter}
            onToggleTaskDone={handleToggleTaskDone}
            onEditTask={(task) => {
              resetForm();
              setEditTask(task);
              setIsAddDialogOpen(true);
            }}
            onViewTaskDetail={openTaskDetailDialog}
            onRescheduleTask={openRescheduleDialog}
            onAddTask={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            onExpandTodo={() => {
              setExpandTodo(true);
              setModalActiveFilter("all");
            }}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      {/* ===== CALENDAR SECTION (visible on all screens) ===== */}
      <div key={globalRefreshKey}>
        <TaskCalendar
          tasks={tasks}
          setIsAddDialogOpen={setIsAddDialogOpen}
          setEditTask={setEditTask}
          resetForm={resetForm}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={changeMonth}
          onToggleTaskDone={handleToggleTaskDone}
          onRescheduleStart={handleRescheduleStart} // เพิ่ม prop นี้
          onOpenRescheduleDialog={openRescheduleDialog}
          isRescheduling={isRescheduling} // เพิ่ม loading state
          key={calendarKey} // <-- เพิ่ม key นี้
        />
      </div>

      {/* ===== FULLSCREEN MODAL ===== */}
      <TaskModal
        tasks={tasks}
        expandTodo={expandTodo}
        setExpandTodo={setExpandTodo}
        modalActiveFilter={modalActiveFilter}
        setModalActiveFilter={setModalActiveFilter}
        handleToggleTaskDone={handleToggleTaskDone}
        setEditTask={setEditTask}
        onViewTaskDetail={openTaskDetailDialog}
        openRescheduleDialog={openRescheduleDialog}
        resetForm={resetForm}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />

      {/* ===== REOPEN TASK DIALOG ===== */}
      <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              เปิดงานที่เสร็จสิ้นแล้ว
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                งาน: {taskToReopen?.title}
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                เหตุผลในการเปิดงานใหม่
              </label>
              <Textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="ระบุเหตุผลในการเปิดงานใหม่"
                className="rounded-lg min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsReopenDialogOpen(false)}
              className="rounded-lg"
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white rounded-lg"
              onClick={handleReopenTask}
              disabled={!reopenReason.trim()}
            >
              เปิดงานใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ===== ADD TASK DIALOG ===== */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base md:text-xl">
              {editTask ? "แก้ไขงาน" : "สร้างการแจ้งเตือนใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:gap-4 py-2 md:py-4">
            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="title" className="text-xs md:text-sm">
                หัวข้องาน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="กรอกหัวข้องาน"
                required
                className="text-sm"
              />
            </div>

            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="date" className="text-xs md:text-sm">
                วันที่แจ้งเตือน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="text-sm"
              />
            </div>

            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="frequency" className="text-xs md:text-sm">
                ความถี่ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  handleSelectChange("frequency", value)
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="เลือกความถี่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-repeat">เตือนไม่ทำซ้ำ</SelectItem>
                  <SelectItem value="yearly">ทุกปี</SelectItem>
                  <SelectItem value="monthly">เตือนทุกเดือน</SelectItem>
                  <SelectItem value="weekly">ทุกอาทิตย์</SelectItem>
                  <SelectItem value="daily">เตือนทุกวัน</SelectItem>
                  <SelectItem value="quarterly">ทุกไตรมาส</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="details" className="text-xs md:text-sm">
                รายละเอียด <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="กรอกรายละเอียดเพิ่มเติม"
                required
                className="min-h-[80px] md:min-h-[100px] text-sm"
              />
            </div>

            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="impact" className="text-xs md:text-sm">
                ผลกระทบหากงานไม่เสร็จ <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="ระบุความเสียหายหากงานไม่เสร็จ"
                required
                className="min-h-[80px] md:min-h-[100px] text-sm"
              />
            </div>

            <div className="grid gap-1 md:gap-2">
              <Label htmlFor="link" className="text-xs md:text-sm">
                ลิงก์ (ถ้ามี)
              </Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="https://example.com"
                type="url"
                className="text-sm"
              />
            </div>

            <div className="grid gap-1 md:gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasLogin"
                  checked={formData.hasLogin}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      hasLogin: e.target.checked,
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="hasLogin" className="text-xs md:text-sm">
                  งานที่ต้องมีการล็อคอิน
                </Label>
              </div>

              {formData.hasLogin && (
                <div className="grid gap-3 md:gap-4 mt-2 p-2 md:p-3 bg-gray-50 rounded-md">
                  <div className="grid gap-1 md:gap-2">
                    <Label htmlFor="username" className="text-xs md:text-sm">
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="ระบุ username ที่ใช้ในการล็อคอิน"
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-1 md:gap-2">
                    <Label htmlFor="password" className="text-xs md:text-sm">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="ระบุ password ที่ใช้ในการล็อคอิน"
                      type="text"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row mt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleAddTask}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              disabled={
                !formData.title.trim() ||
                !formData.date ||
                !formData.details.trim() ||
                !formData.impact.trim()
              }
            >
              {editTask ? "บันทึกการเปลี่ยนแปลง" : "สร้างการแจ้งเตือน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ===== TASK DETAIL DIALOG ===== */}
      <Dialog
        open={isTaskDetailDialogOpen}
        onOpenChange={setIsTaskDetailDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-[600px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base md:text-xl">
              รายละเอียดงาน
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 md:space-y-4 py-2">
            {taskDetail && (
              <>
                <div className="flex justify-between items-start">
                  <h3 className="text-base md:text-lg font-semibold">
                    {taskDetail.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      taskDetail.done
                        ? "bg-green-100 text-green-700"
                        : taskDetail.priority === "overdue"
                        ? "bg-red-100 text-red-700"
                        : taskDetail.priority === "urgent"
                        ? "bg-orange-100 text-orange-700"
                        : taskDetail.priority === "today"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {taskDetail.done
                      ? "เสร็จแล้ว"
                      : taskDetail.priority === "overdue"
                      ? "เลยกำหนด"
                      : taskDetail.priority === "urgent"
                      ? "ด่วน"
                      : taskDetail.priority === "today"
                      ? "วันนี้"
                      : "ปกติ"}
                  </span>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">
                      กำหนดส่ง: {taskDetail.dueDate}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <h4 className="text-xs md:text-sm font-medium text-gray-700">
                    รายละเอียด
                  </h4>
                  <div className="p-2 md:p-3 bg-gray-50 rounded-lg whitespace-pre-wrap text-xs md:text-sm text-gray-700">
                    {taskDetail.details}
                  </div>
                </div>

                {taskDetail.hasLogin && (
                  <div className="space-y-1 md:space-y-2">
                    <h4 className="text-xs md:text-sm font-medium text-gray-700">
                      ข้อมูลการเข้าสู่ระบบ
                    </h4>
                    <div className="p-2 md:p-3 bg-gray-50 rounded-lg space-y-1 md:space-y-2">
                      <div className="flex gap-2">
                        <span className="text-xs md:text-sm font-medium text-gray-600">
                          Username:
                        </span>
                        <span className="text-xs md:text-sm">
                          {taskDetail.username}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs md:text-sm font-medium text-gray-600">
                          Password:
                        </span>
                        <span className="text-xs md:text-sm">
                          {taskDetail.password}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {taskDetail.link && (
                  <div className="space-y-1 md:space-y-2">
                    <h4 className="text-xs md:text-sm font-medium text-gray-700">
                      ลิงก์
                    </h4>
                    <a
                      href={taskDetail.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {taskDetail.link}
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="mt-4 md:mt-6 space-x-0 space-y-2 md:space-y-0 md:space-x-2 flex-col md:flex-row">
            {taskDetail && !taskDetail.done && (
              <Button
                onClick={() => {
                  if (taskDetail) {
                    handleToggleTaskDone(taskDetail.id);
                    setIsTaskDetailDialogOpen(false);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
              >
                <CheckCircle2 className="mr-1 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />{" "}
                ทำเสร็จแล้ว / แนบหลักฐาน
              </Button>
            )}
            {taskDetail && !taskDetail.done && (
              <Button
                onClick={() => {
                  if (taskDetail) {
                    openRescheduleDialog(taskDetail);
                    setIsTaskDetailDialogOpen(false);
                  }
                }}
                variant="outline"
                className="w-full md:w-auto"
              >
                เลื่อนกำหนด
              </Button>
            )}
            <Button
              onClick={() => {
                if (taskDetail) {
                  resetForm();
                  setEditTask(taskDetail);
                  setIsAddDialogOpen(true);
                  setIsTaskDetailDialogOpen(false);
                }
              }}
              variant="outline"
              className="w-full md:w-auto"
            >
              แก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-xl">เลื่อนกำหนดการ</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block">
                งาน: {taskToReschedule?.title}
              </label>
            </div>

            {rescheduleSource === "manual" ? (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  วันที่กำหนดใหม่
                </label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  required
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                วันที่ใหม่: {taskToReschedule?.dueDate}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                เหตุผลในการเลื่อนกำหนด
              </label>
              <Textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="ระบุเหตุผล"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(false)}
              className="rounded-lg"
              disabled={isRescheduling}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white rounded-lg"
              onClick={handleRescheduleTask}
              disabled={
                isRescheduling ||
                !rescheduleReason.trim() ||
                (rescheduleSource === "manual" && !newDueDate)
              }
            >
              {isRescheduling ? "กำลังบันทึก..." : "บันทึกการเลื่อน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-xl">แนบหลักฐานการทำงาน (ถ้ามี) </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-700">งาน: {submitTask?.title}</p>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setSubmitEvidence(e.target.files?.[0] || null)}
            />
            {submitEvidence && (
              <p className="text-xs text-gray-500">
                ไฟล์: {submitEvidence.name}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitDialogOpen(false);
                setSubmitTask(null);
                setSubmitEvidence(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white"
              onClick={async () => {
                if (!submitTask) return;

                try {
                  // Use proper API call instead of direct fetch
                  await notificationsApi.updateStatus(submitTask.id, 'DONE');

                  // Update UI state
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === submitTask.id ? { ...t, done: true } : t
                    )
                  );
                  setAllTasks((prev) =>
                    prev.map((t) =>
                      t.id === submitTask.id ? { ...t, done: true } : t
                    )
                  );

                  // Refresh data for dashboard stats
                  await loadCurrentMonthData();
                  
                } catch (e) {
                  console.error("ส่งงานล้มเหลว", e);
                }

                setIsSubmitDialogOpen(false);
                setSubmitTask(null);
                setSubmitEvidence(null);
              }}
            >
              ส่งงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
