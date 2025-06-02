// Task utility functions
import type { Task } from "@/lib/types/task";

// Set task priority based on due date
export const updateTaskPriority = (task: Task): Task => {
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
