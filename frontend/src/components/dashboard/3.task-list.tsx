"use client";

import {
  Calendar,
  Plus,
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  details: string;
  dueDate: string;
  priority: "today" | "urgent" | "overdue" | "pending";
  done: boolean;
}

type TaskListProps = {
  tasks: Task[];
  activeFilter: string;
  onToggleTaskDone: (id: string) => void;
  onEditTask: (task: Task) => void;
  onViewTaskDetail: (task: Task) => void;
  onRescheduleTask: (task: Task) => void;
  onAddTask: () => void;
  onExpandTodo: () => void;
  onFilterChange: (filter: string) => void;
};

export default function TaskList({
  tasks,
  activeFilter,
  onToggleTaskDone,
  onEditTask,
  onViewTaskDetail,
  onRescheduleTask,
  onAddTask,
  onExpandTodo,
  onFilterChange,
}: TaskListProps) {
  return (
    <section className="w-full h-full rounded-[20px] border border-gray-100 bg-white shadow-sm backdrop-blur-sm shadow-xl ring-1 ring-black/5 transition hover:scale-[1.02] duration-300 shadow-md flex flex-col">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            สิ่งที่ต้องทำ
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={onAddTask}
              className="bg-gradient-to-b from-red-700 to-red-800 hover:bg-red-700 text-white text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 h-auto"
            >
              <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> เพิ่มงาน
            </Button>
          </div>
        </div>

        {/* Filter Tabs - Scrollable on mobile */}
        <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeFilter === "all"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => onFilterChange("overdue")}
            className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeFilter === "overdue"
                ? "bg-red-50 text-red-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            เลยกำหนด
          </button>
          <button
            onClick={() => onFilterChange("urgent")}
            className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeFilter === "urgent"
                ? "bg-orange-50 text-orange-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            งานด่วน
          </button>
          <button
            onClick={() => onFilterChange("normal")}
            className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeFilter === "normal"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            งานอื่นๆ
          </button>
          <button
            onClick={() => onFilterChange("completed")}
            className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeFilter === "completed"
                ? "bg-green-50 text-green-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            เสร็จแล้ว
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scroll-smooth">
          {/* Overdue Tasks */}
          {(activeFilter === "all" || activeFilter === "overdue") && (
            <>
              {tasks.filter((t) => t.priority === "overdue" && !t.done).length >
              0 ? (
                <>
                  {activeFilter === "all" && (
                    <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" /> งานเลยกำหนด
                    </h3>
                  )}
                  {tasks
                    .filter((t) => t.priority === "overdue" && !t.done)
                    .map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 md:p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => onViewTaskDetail(task)}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleTaskDone(task.id);
                          }}
                          className="h-4 w-4 md:h-5 md:w-5 text-red-700 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-xs md:text-sm font-medium truncate ${
                                task.done
                                  ? "line-through text-gray-400"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </p>
                            <span className="rounded-full bg-red-100 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs text-red-700 font-medium whitespace-nowrap">
                              เลยกำหนด
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {task.details}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                              กำหนด: {task.dueDate}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRescheduleTask(task, "manual"); // 👈 เพิ่ม "manual"
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRescheduleTask(task);
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                เลื่อนกำหนด
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                activeFilter === "overdue" && (
                  <div className="text-center py-6 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                      <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm">ไม่มีงานที่เลยกำหนด</p>
                  </div>
                )
              )}
            </>
          )}

          {/* Urgent Tasks */}
          {(activeFilter === "all" || activeFilter === "urgent") && (
            <>
              {tasks.filter(
                (t) => ["today", "urgent"].includes(t.priority) && !t.done
              ).length > 0 ? (
                <>
                  {activeFilter === "all" && (
                    <h3 className="text-sm font-semibold text-orange-700 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> งานด่วน
                    </h3>
                  )}
                  {tasks
                    .filter(
                      (t) => ["today", "urgent"].includes(t.priority) && !t.done
                    )
                    .map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 md:p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => onViewTaskDetail(task)}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleTaskDone(task.id);
                          }}
                          className="h-4 w-4 md:h-5 md:w-5 text-orange-600 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-xs md:text-sm font-medium truncate ${
                                task.done
                                  ? "line-through text-gray-400"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </p>
                            <span className="rounded-full bg-orange-100 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs text-orange-700 font-medium whitespace-nowrap">
                              {task.priority === "urgent"
                                ? "กำลังจะมาถึง"
                                : "วันนี้"}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {task.details}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                              กำหนด: {task.dueDate}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTask(task);
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRescheduleTask(task);
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                เลื่อนกำหนด
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                activeFilter === "urgent" && (
                  <div className="text-center py-6 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                      <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm">ไม่มีงานด่วนที่ต้องทำ</p>
                  </div>
                )
              )}
            </>
          )}

          {/* Normal Tasks */}
          {(activeFilter === "all" || activeFilter === "normal") && (
            <>
              {tasks.filter(
                (t) =>
                  !["today", "urgent", "overdue"].includes(t.priority) &&
                  !t.done
              ).length > 0 ? (
                <>
                  {activeFilter === "all" && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center mt-4">
                      <Clock className="h-4 w-4 mr-1" /> งานอื่นๆ
                    </h3>
                  )}
                  {tasks
                    .filter(
                      (t) =>
                        !["today", "urgent", "overdue"].includes(t.priority) &&
                        !t.done
                    )
                    .map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 md:p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => onViewTaskDetail(task)}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleTaskDone(task.id);
                          }}
                          className="h-4 w-4 md:h-5 md:w-5 text-gray-700 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p
                              className={`text-xs md:text-sm font-medium truncate ${
                                task.done
                                  ? "line-through text-gray-400"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </p>
                            <span className="rounded-full bg-blue-100 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs text-blue-700 font-medium whitespace-nowrap">
                              ปกติ
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-500 truncate">
                            {task.details}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                              กำหนด: {task.dueDate}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTask(task);
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRescheduleTask(task);
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                เลื่อนกำหนด
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                activeFilter === "normal" && (
                  <div className="text-center py-6 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                      <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm">ไม่มีงานอื่นๆ ที่ต้องทำ</p>
                  </div>
                )
              )}
            </>
          )}

          {/* Completed Tasks */}
          {(activeFilter === "all" || activeFilter === "completed") && (
            <>
              {tasks.filter((t) => t.done).length > 0 ? (
                <>
                  {activeFilter === "all" && (
                    <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center mt-4">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> งานที่เสร็จแล้ว
                    </h3>
                  )}
                  {tasks
                    .filter((t) => t.done)
                    .map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 md:p-3 border rounded-xl shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => onViewTaskDetail(task)}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleTaskDone(task.id);
                          }}
                          className="h-4 w-4 md:h-5 md:w-5 text-green-700 rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-xs md:text-sm font-medium line-through text-gray-400">
                              {task.title}
                            </p>
                            <span className="rounded-full bg-green-100 px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs text-green-700 font-medium whitespace-nowrap">
                              เสร็จแล้ว
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-400 line-through">
                            {task.details}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                              กำหนด: {task.dueDate}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTask(task);
                                }}
                                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 text-gray-500 hover:bg-gray-100 rounded border border-gray-200"
                              >
                                ดูรายละเอียด
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                activeFilter === "completed" && (
                  <div className="text-center py-6 text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                      <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm">ยังไม่มีงานที่เสร็จแล้ว</p>
                  </div>
                )
              )}
            </>
          )}

          {/* Empty State */}
          {activeFilter === "all" &&
            tasks.filter((t) => !t.done).length === 0 &&
            tasks.filter((t) => t.done).length === 0 && (
              <div className="text-center py-6 md:py-10 text-gray-500">
                <div className="w-10 h-10 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 flex items-center justify-center rounded-full bg-gray-100">
                  <CheckCircle2 className="w-5 h-5 md:w-8 md:h-8 text-gray-400" />
                </div>
                <p className="text-sm">ไม่มีงานในระบบ</p>
              </div>
            )}
        </div>

        {/* View All Button */}
        <div className="mt-4 text-center">
          <button
            onClick={onExpandTodo}
            className="text-sm text-red-700 hover:text-red-800 font-medium flex items-center justify-center mx-auto"
          >
            ดูรายการทั้งหมด
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
<style jsx global>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`}</style>;
