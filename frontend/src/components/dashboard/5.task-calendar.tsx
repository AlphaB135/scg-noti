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
}: TaskCalendarProps) {
  return (
    <section className="mt-6">
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6">
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
