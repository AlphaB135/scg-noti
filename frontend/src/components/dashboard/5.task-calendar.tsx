import { MonthCalendar } from "@/components/month-calendar";
import type { Task } from "@/lib/types/task";

type TaskCalendarProps = {
  tasks: Task[];
  setIsAddDialogOpen: (value: boolean) => void;
  setEditTask: (task: Task | null) => void;
  resetForm: () => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  onToggleTaskDone?: (id: string) => void;
  onRescheduleTask?: (task: Task) => void;
  onViewTaskDetail?: (task: Task) => void;
  onRescheduleStart?: (task: Task, newDate: string) => void; // จาก drag-&-drop
  onOpenRescheduleDialog?: (task: Task, source: "manual" | "drag") => void;
  isRescheduling?: boolean; // สำหรับแสดง loading state
};

export default function TaskCalendar({
  tasks,
  setIsAddDialogOpen,
  setEditTask,
  resetForm,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onToggleTaskDone,
  onRescheduleTask,
  onViewTaskDetail,
  onRescheduleStart,
  onOpenRescheduleDialog,
  isRescheduling = false,
}: TaskCalendarProps) {
  return (
    <section className="mt-6">
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6">
        {isRescheduling && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-700 text-sm">กำลังปรับปรุงปฏิทิน...</span>
            </div>
          </div>
        )}
        <MonthCalendar
          tasks={tasks}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
          onMonthChange={onMonthChange}
          setIsAddDialogOpen={setIsAddDialogOpen}
          setEditTask={setEditTask}
          resetForm={resetForm}
          onToggleTaskDone={onToggleTaskDone}
          onRescheduleTask={onRescheduleTask}
          onViewTaskDetail={onViewTaskDetail}
          onRescheduleStart={onRescheduleStart}
          onOpenRescheduleDialog={onOpenRescheduleDialog}
        />
      </div>
    </section>
  );
}
