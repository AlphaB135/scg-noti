"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Pencil,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/lib/types/task";

// แก้ไข interface MonthCalendarProps
interface MonthCalendarProps {
  tasks: Task[];
  onMonthChange: (month: number, year: number) => void;
  setIsAddDialogOpen: (value: boolean) => void;
  setEditTask: (task: Task | null) => void;
  resetForm: () => void;
  currentMonth: number;
  currentYear: number;
  onToggleTaskDone?: (id: string) => void;
  onRescheduleTask?: (task: Task) => void;
  onViewTaskDetail?: (task: Task) => void;
  onOpenRescheduleDialog?: (task: Task, source: "manual" | "drag") => void;
  onRescheduleStart?: (task: Task, newDate: string) => void; // เพิ่ม prop ใหม่
}

export function MonthCalendar({
  tasks,
  onMonthChange,
  setIsAddDialogOpen,
  setEditTask,
  resetForm,
  currentMonth,
  currentYear,
  onToggleTaskDone,
  onRescheduleTask,
  onViewTaskDetail,
  onOpenRescheduleDialog,   // 🟢 เพิ่มบรรทัดนี้
  onRescheduleStart,
}: MonthCalendarProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [dayTasksDialogOpen, setDayTasksDialogOpen] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState("");

  // Drag and reschedule states
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Add this state at the top with other states
  const [taskActionDialogOpen, setTaskActionDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Initialize month and year state from props
  const now = new Date(currentYear, currentMonth - 1);
  const [monthDate, setMonthDate] = useState(now);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // Update month and year when props change
  useEffect(() => {
    setMonthDate(new Date(currentYear, currentMonth - 1));
  }, [currentMonth, currentYear]);

  // Screen size detection
  useEffect(() => {
    const checkIsMobile = () => setIsMobileView(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Navigation handlers
  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    setMonthDate(prev);
    onMonthChange(prev.getMonth() + 1, prev.getFullYear());
  };

  const nextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setMonthDate(next);
    onMonthChange(next.getMonth() + 1, next.getFullYear());
  };

  // Calendar utilities
  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Task grouping by date
  const taskMap = tasks.reduce<{ [key: string]: Task[] }>((acc, task) => {
    const date = task.dueDate;
    if (!date) return acc;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  // Date handling
  const formatDateStr = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  const getTasksForDate = (date: string) => taskMap[date] || [];

  const handleDayClick = (day: number) => {
    const dateStr = formatDateStr(year, month, day);
    const tasksForDay = getTasksForDate(dateStr);

    setSelectedDateStr(dateStr);
    setSelectedDateTasks(tasksForDay);

    // ✅ ถ้ามือถือ แสดง inline (แบบเดิม)
    // ✅ ถ้า desktop → เปิด Dialog
    if (isMobileView) {
      setDayTasksDialogOpen(true);
    } else {
      setDesktopDayDialogOpen(true); // 👈 เราจะเพิ่ม state นี้ด้านล่าง
    }
  };

  const [desktopDayDialogOpen, setDesktopDayDialogOpen] = useState(false);

  const openAddTaskDialog = () => {
    resetForm();
    setEditTask(null);
    setIsAddDialogOpen(true);
  };

  const toggleExpandDay = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    setExpandedDays((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id);
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // แก้ไขฟังก์ชัน handleDrop
  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    // ไม่อนุญาตให้ลากวางในวันเดียวกัน
    if (draggedTask.dueDate === targetDate) {
      setDraggedTask(null);
      return;
    }

    // แจ้ง parent component ว่ามีการลากวาง
    if (onRescheduleStart) {
      onRescheduleStart(draggedTask, targetDate);
    }

    setDraggedTask(null);
  };

  const handleRescheduleConfirm = () => {
    if (!draggedTask || !newTaskDate) return;

    // Create updated task with new date and reason
    const updatedTask = {
      ...draggedTask,
      dueDate: newTaskDate,
      rescheduleReason: rescheduleReason,
    };

    // Call the reschedule handler from props
    if (onRescheduleTask) {
      onRescheduleTask(updatedTask);
    }

    setRescheduleDialogOpen(false);
    setDraggedTask(null);
    setRescheduleReason("");
  };

  // UI Constants
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const thaiDays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const englishDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Add this function to handle task click
  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTaskActionDialogOpen(true);
  };

  // ปรับส่วนแสดงงานในแต่ละวัน
  const renderDayContent = (
    dayTasks: Task[],
    formattedDate: string,
    isMobile: boolean
  ) => {
    if (!dayTasks.length) return null;

    if (isMobile) {
      // จัดกลุ่มงานตาม priority
      const taskGroups = {
        overdue: dayTasks.filter((t) => t.priority === "overdue"),
        urgent: dayTasks.filter((t) => t.priority === "urgent"),
        normal: dayTasks.filter(
          (t) => !["overdue", "urgent"].includes(t.priority)
        ),
      };

      return (
        <div
          className="flex flex-wrap gap-0.5 mt-1"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, formattedDate)}
        >
          {/* จุดสีแดง - งานเลยกำหนด */}
          {taskGroups.overdue.map((_, i) => (
            <div
              key={`overdue-${i}`}
              className="w-1.5 h-1.5 rounded-full bg-red-500"
            />
          ))}
          {/* จุดสีส้ม - งานด่วน */}
          {taskGroups.urgent.map((_, i) => (
            <div
              key={`urgent-${i}`}
              className="w-1.5 h-1.5 rounded-full bg-orange-500"
            />
          ))}
          {/* จุดสีฟ้า - งานทั่วไป */}
          {taskGroups.normal.map((_, i) => (
            <div
              key={`normal-${i}`}
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
            />
          ))}
        </div>
      );
    }

    // แสดงผลปกติสำหรับ desktop
    return (
      <div
        className="mt-2 space-y-1"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, formattedDate)}
      >
        {dayTasks.map((task, index) => (
          <div
            key={index}
            className={`px-1.5 py-0.5 text-[10px] font-medium truncate rounded cursor-move
              ${
                task.done
                  ? "bg-green-100 text-green-700"
                  : task.priority === "overdue"
                  ? "bg-red-100 text-red-700"
                  : task.priority === "urgent"
                  ? "bg-orange-100 text-orange-700"
                  : task.priority === "today"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onClick={(e) => {
              e.stopPropagation();
              // เปิดหน้าต่างรายละเอียดงานแทนการแก้ไข
              if (onViewTaskDetail) {
                onViewTaskDetail(task);
              } else {
                resetForm();
                setEditTask(task);
                setIsAddDialogOpen(true);
              }
            }}
          >
            {task.title}
          </div>
        ))}
        {dayTasks.length > 2 && !expandedDays[formattedDate] && (
          <button
            onClick={(e) => toggleExpandDay(e, formattedDate)}
            className="text-[10px] text-blue-600 hover:text-blue-800 w-full text-left"
          >
            + {dayTasks.length - 2} อื่นๆ
          </button>
        )}
      </div>
    );
  };

  // ส่วนของ UI
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 font-noto">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">ปฏิทินงาน</h3>
          <p className="text-sm text-gray-500">
            ดูงานทั้งหมดสำหรับเดือน {thaiMonths[month]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            {thaiMonths[month]} {year}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 text-center border-b bg-gray-50">
          {(isMobileView ? thaiDays : englishDays).map((day, index) => (
            <div
              key={index}
              className={`py-2 font-medium ${
                index === 0 || index === 6 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100">
          {Array.from({ length: daysInMonth + firstDayOfMonth }).map((_, i) => {
            if (i < firstDayOfMonth) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[40px] md:min-h-[100px] p-2 bg-white text-gray-300"
                >
                  {new Date(year, month, 0).getDate() - firstDayOfMonth + i + 1}
                </div>
              );
            }

            const day = i - firstDayOfMonth + 1;
            const formattedDate = formatDateStr(year, month, day);
            const dayTasks = getTasksForDate(formattedDate);
            const isToday =
              new Date().toDateString() ===
              new Date(year, month, day).toDateString();

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[60px] md:min-h-[100px] p-1 bg-white relative cursor-pointer transition-all duration-200
                  ${isToday ? "bg-red-50" : ""}
                  ${draggedTask ? "hover:bg-blue-50" : "hover:bg-gray-50"}
                  ${
                    new Date(year, month, day).getDay() === 0 ||
                    new Date(year, month, day).getDay() === 6
                      ? "bg-gray-50"
                      : ""
                  }`}
                onClick={() => handleDayClick(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, formattedDate)}
              >
                <div className="flex justify-center items-center h-8 md:h-10">
                  <span
                    className={`text-sm md:text-base font-medium w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full
                      ${
                        isToday
                          ? "bg-red-500 text-white"
                          : new Date(year, month, day).getDay() === 0 ||
                            new Date(year, month, day).getDay() === 6
                          ? "text-red-500"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {day}
                  </span>
                </div>
                {renderDayContent(dayTasks, formattedDate, isMobileView)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tasks Panel */}
      {isMobileView && dayTasksDialogOpen && (
        <div className="mt-4 border rounded-xl bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">งานวันที่ {selectedDateStr}</h3>
            <Button
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              เพิ่มงานใหม่
            </Button>
          </div>

          {selectedDateTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedDateTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={(event) => {
                    handleTaskClick(event as React.MouseEvent, task);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (onToggleTaskDone) {
                        onToggleTaskDone(task.id);
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {task.details}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full
                      ${
                        task.done
                          ? "bg-green-100 text-green-700"
                          : task.priority === "overdue"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "urgent"
                          ? "bg-orange-100 text-orange-700"
                          : task.priority === "today"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {task.done
                      ? "เสร็จแล้ว"
                      : task.priority === "overdue"
                      ? "เลยกำหนด"
                      : task.priority === "urgent"
                      ? "ด่วน"
                      : task.priority === "today"
                      ? "วันนี้"
                      : "ปกติ"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>ไม่มีงานในวันนี้</p>
            </div>
          )}
        </div>
      )}

      {/* Task Action Dialog */}
      <Dialog
        open={taskActionDialogOpen}
        onOpenChange={setTaskActionDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid gap-3">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition text-green-700 hover:bg-green-50"
              onClick={() => {
                if (selectedTask && onToggleTaskDone) {
                  onToggleTaskDone(selectedTask.id);
                  setTaskActionDialogOpen(false);
                }
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {selectedTask?.done ? "ยกเลิกการเสร็จงาน" : "เสร็จงาน"}
            </Button>

            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition text-blue-700 hover:bg-blue-50"
              onClick={() => {
                if (selectedTask) {
                  resetForm();
                  setEditTask(selectedTask);
                  setIsAddDialogOpen(true);
                  setTaskActionDialogOpen(false);
                }
              }}
            >
              <Pencil className="w-5 h-5 text-blue-600" />
              แก้ไขงาน
            </Button>

            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition text-yellow-700 hover:bg-yellow-50"
              onClick={() => {
                if (selectedTask) {
                  onOpenRescheduleDialog?.(selectedTask, "manual");
                  setTaskActionDialogOpen(false);
                }
              }}
            >
              <CalendarClock className="w-5 h-5 text-yellow-600" />
              เลื่อนกำหนดการ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={desktopDayDialogOpen}
        onOpenChange={setDesktopDayDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>งานวันที่ {selectedDateStr}</DialogTitle>
          </DialogHeader>

          {selectedDateTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedDateTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleTaskClick(e, task)}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (onToggleTaskDone) {
                        onToggleTaskDone(task.id);
                      }
                    }}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {task.details}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full
              ${
                task.done
                  ? "bg-green-100 text-green-700"
                  : task.priority === "overdue"
                  ? "bg-red-100 text-red-700"
                  : task.priority === "urgent"
                  ? "bg-orange-100 text-orange-700"
                  : task.priority === "today"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"
              }`}
                  >
                    {task.done
                      ? "เสร็จแล้ว"
                      : task.priority === "overdue"
                      ? "เลยกำหนด"
                      : task.priority === "urgent"
                      ? "ด่วน"
                      : task.priority === "today"
                      ? "วันนี้"
                      : "ปกติ"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">ไม่มีงานในวันนี้</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
