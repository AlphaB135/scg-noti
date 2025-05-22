"use client";

import type React from "react";

import { useMobileDetector } from "@/hooks/use-mobile-detector";
// แก้ไข import path ให้ชี้ไปที่คอมโพเนนต์ในโฟลเดอร์ dashboard
import TaskStatusCards from "./1.task-status-cards";
import MonthlyProgress from "./2.monthly-progress";
import TaskList from "./3.task-list";
// คอมโพเนนต์ที่ไม่ได้อยู่ในโฟลเดอร์ dashboard ให้เรียกจาก components โดยตรง
import { MonthCalendar } from "../month-calendar";
import type { Task } from "@/lib/types/task";

type ResponsiveDashboardProps = {
  tasks: Task[];
  notifications: {
    overdue: number;
    urgentToday: number;
    other: number;
    done: number;
  };
  doneCount: number;
  incompleteCnt: number;
  totalTasks: number;
  progressPercent: number;
  selectedMonth: number;
  selectedYear: number;
  expandTodo: boolean;
  setExpandTodo: (value: boolean) => void;
  modalActiveFilter: string;
  setModalActiveFilter: (value: string) => void;
  handleToggleTaskDone: (id: string) => void;
  setEditTask: (task: Task | null) => void;
  onViewTaskDetail: (task: Task) => void;
  openRescheduleDialog: (task: Task) => void;
  resetForm: () => void;
  setIsAddDialogOpen: (value: boolean) => void;
  onCardClick: (filter: string) => void;
  onMonthChange: (month: number, year: number) => void;
  children: React.ReactNode; // This will be the desktop layout
};

export default function ResponsiveDashboard({
  tasks,
  notifications,
  doneCount,
  incompleteCnt,
  totalTasks,
  progressPercent,
  selectedMonth,
  selectedYear,
  expandTodo,
  setExpandTodo,
  modalActiveFilter,
  setModalActiveFilter,
  handleToggleTaskDone,
  setEditTask,
  onViewTaskDetail,
  openRescheduleDialog,
  resetForm,
  setIsAddDialogOpen,
  onCardClick,
  onMonthChange,
  children,
}: ResponsiveDashboardProps) {
  const isMobile = useMobileDetector();

  if (isMobile) {
    return (
      <div className="container px-4 py-4">
        {/* แสดงเฉพาะ 2 คอมโพเนนต์นี้บนมือถือ */}
        <TaskStatusCards
          notifications={notifications}
          onCardClick={onCardClick}
        />
        <div className="mt-4">
          {" "}
          {/* เพิ่ม margin-top */}
          <MonthCalendar
            tasks={tasks}
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={onMonthChange}
            setIsAddDialogOpen={setIsAddDialogOpen}
            setEditTask={setEditTask}
            resetForm={resetForm}
            onToggleTaskDone={handleToggleTaskDone}
            onRescheduleTask={openRescheduleDialog}
            onViewTaskDetail={onViewTaskDetail}
          />
        </div>
      </div>
    );
  }

  // Desktop view ยังคงแสดงทุกคอมโพเนนต์
  return (
    <div className="container p-4">
      <TaskStatusCards
        notifications={notifications}
        onCardClick={onCardClick}
      />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <MonthlyProgress
          doneCount={doneCount}
          incompleteCnt={incompleteCnt}
          totalTasks={totalTasks}
          progressPercent={progressPercent}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
        <TaskList
          tasks={tasks}
          activeFilter={modalActiveFilter}
          onToggleTaskDone={handleToggleTaskDone}
          onEditTask={setEditTask}
          onViewTaskDetail={onViewTaskDetail}
          onRescheduleTask={openRescheduleDialog}
          onAddTask={() => setIsAddDialogOpen(true)}
          onExpandTodo={() => setExpandTodo(true)}
          onFilterChange={setModalActiveFilter}
        />
      </div>
      {children}
    </div>
  );
}
