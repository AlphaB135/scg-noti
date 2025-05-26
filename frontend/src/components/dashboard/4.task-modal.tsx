"use client";

import { motion, AnimatePresence } from "framer-motion";
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

type TaskModalProps = {
  tasks: Task[];
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
};

export default function TaskModal({
  tasks,
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
}: TaskModalProps) {
  return (
    <AnimatePresence>
      {expandTodo && (
        <motion.div
          key="todoModal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
          onClick={() => setExpandTodo(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, y: 10 }}
            transition={{
              duration: 0.25,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[20px] shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b z-10 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                รายการแจ้งเตือนทั้งหมด
              </h2>
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(true);
                  }}
                  className="bg-gradient-to-b from-red-700 to-red-800 hover:bg-red-700 text-white text-xs md:text-sm py-1 md:py-2 px-2 md:px-3 h-auto"
                >
                  <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />{" "}
                  เพิ่มงาน
                </Button>
                <button
                  onClick={() => setExpandTodo(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 md:p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Tabs - Scrollable on mobile */}
            <div className="px-4 md:px-6 pt-3 md:pt-4 border-b border-gray-100">
              <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setModalActiveFilter("all")}
                  className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap ${
                    modalActiveFilter === "all"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setModalActiveFilter("overdue")}
                  className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap ${
                    modalActiveFilter === "overdue"
                      ? "bg-red-50 text-red-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  เลยกำหนด
                </button>
                <button
                  onClick={() => setModalActiveFilter("urgent")}
                  className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap ${
                    modalActiveFilter === "urgent"
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  งานด่วน
                </button>
                <button
                  onClick={() => setModalActiveFilter("normal")}
                  className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap ${
                    modalActiveFilter === "normal"
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  งานอื่นๆ
                </button>
                <button
                  onClick={() => setModalActiveFilter("completed")}
                  className={`px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap ${
                    modalActiveFilter === "completed"
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  เสร็จแล้ว
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-3 md:p-6 max-h-[calc(85vh-120px)] space-y-4 md:space-y-6">
              {/* Overdue Tasks Section */}
              {(modalActiveFilter === "all" ||
                modalActiveFilter === "overdue") && (
                <div
                  id="section-overdue"
                  className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  <div className="bg-gradient-to-r from-red-700 to-red-800 text-white px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">งานเลยกำหนด</h3>
                    </div>
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                      {
                        tasks.filter((t) => t.priority === "overdue" && !t.done)
                          .length
                      }{" "}
                      งาน
                    </span>
                  </div>

                  <div className="bg-white divide-y divide-gray-100">
                    {tasks.filter((t) => t.priority === "overdue" && !t.done)
                      .length > 0 ? (
                      tasks
                        .filter((t) => t.priority === "overdue" && !t.done)
                        .map((task, i) => (
                          <div
                            key={i}
                            className="p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                              onViewTaskDetail(task);
                              setExpandTodo(false); // Close modal when opening task details
                            }}
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={task.done}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskDone(task.id);
                                  }}
                                  className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-xs md:text-sm text-gray-900 truncate pr-2">
                                    {task.title}
                                  </h4>
                                  <span className="text-[10px] md:text-xs font-medium text-red-700 bg-red-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                                    เลยกำหนด
                                  </span>
                                </div>
                                <p className="mt-1 text-[10px] md:text-sm text-gray-600 line-clamp-2">
                                  {task.details}
                                </p>
                                <div className="mt-2 md:mt-3 flex justify-between items-center">
                                  <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                                    กำหนด: {task.dueDate}
                                  </p>
                                  <div className="flex gap-1 md:gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetForm();
                                        setEditTask(task);
                                        setIsAddDialogOpen(true);
                                      }}
                                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRescheduleDialog(task, "manual"); // 👈 เพิ่ม "manual"
                                      }}
                                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                      เลื่อนกำหนด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6 md:py-10 text-gray-500">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center rounded-full bg-gray-100">
                          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm">ไม่มีงานที่เลยกำหนด</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Urgent Tasks Section */}
              {(modalActiveFilter === "all" ||
                modalActiveFilter === "urgent") && (
                <div
                  id="section-urgent"
                  className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">งานด่วน</h3>
                    </div>
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                      {
                        tasks.filter(
                          (t) =>
                            ["today", "urgent"].includes(t.priority) && !t.done
                        ).length
                      }{" "}
                      งาน
                    </span>
                  </div>

                  <div className="bg-white divide-y divide-gray-100">
                    {tasks.filter(
                      (t) => ["today", "urgent"].includes(t.priority) && !t.done
                    ).length > 0 ? (
                      tasks
                        .filter(
                          (t) =>
                            ["today", "urgent"].includes(t.priority) && !t.done
                        )
                        .map((task, i) => (
                          <div
                            key={i}
                            className="p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                              onViewTaskDetail(task);
                              setExpandTodo(false);
                            }}
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={task.done}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskDone(task.id);
                                  }}
                                  className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-xs md:text-sm text-gray-900 truncate pr-2">
                                    {task.title}
                                  </h4>
                                  <span className="text-[10px] md:text-xs font-medium text-orange-700 bg-orange-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                                    {task.priority === "urgent"
                                      ? "ใกล้ถึง"
                                      : "วันนี้"}
                                  </span>
                                </div>
                                <p className="mt-1 text-[10px] md:text-sm text-gray-600 line-clamp-2">
                                  {task.details}
                                </p>
                                <div className="mt-2 md:mt-3 flex justify-between items-center">
                                  <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                                    กำหนด: {task.dueDate}
                                  </p>
                                  <div className="flex gap-1 md:gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetForm();
                                        setEditTask(task);
                                        setIsAddDialogOpen(true);
                                      }}
                                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRescheduleDialog(task, "manual");
                                      }}
                                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                      เลื่อนกำหนด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6 md:py-10 text-gray-500">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center rounded-full bg-gray-100">
                          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm">ไม่มีงานด่วนที่ต้องทำในวันนี้</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Tasks Section */}
              {(modalActiveFilter === "all" ||
                modalActiveFilter === "normal") && (
                <div
                  id="section-other"
                  className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">งานอื่นๆ</h3>
                    </div>
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                      {
                        tasks.filter(
                          (t) =>
                            !["today", "urgent", "overdue"].includes(
                              t.priority
                            ) && !t.done
                        ).length
                      }{" "}
                      งาน
                    </span>
                  </div>

                  <div className="bg-white divide-y divide-gray-100">
                    {tasks.filter(
                      (t) =>
                        !["today", "urgent", "overdue"].includes(t.priority) &&
                        !t.done
                    ).length > 0 ? (
                      tasks
                        .filter(
                          (t) =>
                            !["today", "urgent", "overdue"].includes(
                              t.priority
                            ) && !t.done
                        )
                        .map((task, i) => (
                          <div
                            key={i}
                            className="p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                              onViewTaskDetail(task);
                              setExpandTodo(false);
                            }}
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={task.done}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskDone(task.id);
                                  }}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-xs md:text-sm text-gray-900 truncate pr-2">
                                    {task.title}
                                  </h4>
                                  <span className="text-[10px] md:text-xs font-medium text-blue-700 bg-blue-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full whitespace-nowrap">
                                    งานอื่นๆ
                                  </span>
                                </div>
                                <p className="mt-1 text-[10px] md:text-sm text-gray-600 line-clamp-2">
                                  {task.details}
                                </p>
                                <div className="mt-2 md:mt-3 flex justify-between items-center">
                                  <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5" />{" "}
                                    กำหนด: {task.dueDate}
                                  </p>
                                  <div className="flex gap-1 md:gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetForm();
                                        setEditTask(task);
                                        setIsAddDialogOpen(true);
                                      }}
                                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                      แก้ไข
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRescheduleDialog(task, "manual");
                                      }}
                                      className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                    >
                                      เลื่อนกำหนด
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6 md:py-10 text-gray-500">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 flex items-center justify-center rounded-full bg-gray-100">
                          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm">ไม่มีงานอื่นๆ ที่ต้องทำ</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Tasks Section */}
              {(modalActiveFilter === "all" ||
                modalActiveFilter === "completed") && (
                <div
                  id="section-done"
                  className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                >
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">งานที่เสร็จแล้ว</h3>
                    </div>
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                      {tasks.filter((t) => t.done).length} งาน
                    </span>
                  </div>

                  <div className="bg-white divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {tasks.filter((t) => t.done).length > 0 ? (
                      tasks
                        .filter((t) => t.done)
                        .map((task, i) => (
                          <div
                            key={i}
                            className="p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                              onViewTaskDetail(task);
                              setExpandTodo(false);
                            }}
                          >
                            <div className="flex items-start gap-2 md:gap-3">
                              <div className="pt-0.5">
                                <input
                                  type="checkbox"
                                  checked={task.done}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskDone(task.id);
                                  }}
                                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-600"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-gray-400 line-through truncate pr-2">
                                    {task.title}
                                  </h4>
                                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    เสร็จแล้ว
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-400 line-through">
                                  {task.details}
                                </p>
                                <div className="mt-3 flex justify-between items-center">
                                  <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" /> กำหนด:{" "}
                                    {task.dueDate}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resetForm();
                                      setEditTask(task);
                                      setIsAddDialogOpen(true);
                                    }}
                                    className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
                                  >
                                    ดูรายละเอียด
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                          <CheckCircle2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p>ยังไม่มีงานที่เสร็จแล้ว</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AnimatePresence>
  );
}
