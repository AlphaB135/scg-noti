"use client";

import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
interface TeamStatsProps {
  completedTasks: number;
  pendingTasks: number;
  lateTasks: number;
  totalTasks: number;
  completionRate: number;
  onStatsClick: (type: "completed" | "late" | "pending" | "all") => void;
}

export function TeamStats({
  completedTasks,
  pendingTasks,
  lateTasks,
  totalTasks,
  completionRate,
  onStatsClick,
}: TeamStatsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <BarChart3 className="h-6 w-6 text-red-700" />
            <span>สถิติความสำเร็จ</span>
          </div>
          <div className="text-sm font-medium">{completionRate}%</div>
        </div>

        <Progress
          value={completionRate}
          className="h-2 bg-gray-200"
          indicatorClassName="bg-red-600"
        />

        <div className="mt-4 grid grid-cols-4 gap-2">
          <button
            onClick={() => onStatsClick("completed")}
            className="bg-green-50 p-3 rounded-lg text-center hover:bg-green-100 transition-colors cursor-pointer"
          >
            <div className="text-green-700 text-xl font-bold">
              {completedTasks}
            </div>
            <div className="text-green-600 text-xs">งานเสร็จสิ้น</div>
          </button>

          <button
            onClick={() => onStatsClick("late")}
            className="bg-red-50 p-3 rounded-lg text-center hover:bg-red-100 transition-colors cursor-pointer"
          >
            <div className="text-red-700 text-xl font-bold">{lateTasks}</div>
            <div className="text-red-600 text-xs">งานล่าช้า</div>
          </button>

          <button
            onClick={() => onStatsClick("pending")}
            className="bg-yellow-50 p-3 rounded-lg text-center hover:bg-yellow-100 transition-colors cursor-pointer"
          >
            <div className="text-yellow-700 text-xl font-bold">
              {pendingTasks}
            </div>
            <div className="text-yellow-600 text-xs">งานรอดำเนินการ</div>
          </button>

          <button
            onClick={() => onStatsClick("all")}
            className="bg-blue-50 p-3 rounded-lg text-center hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <div className="text-blue-700 text-xl font-bold">{totalTasks}</div>
            <div className="text-blue-600 text-xs">งานทั้งหมด</div>
          </button>
        </div>
      </div>
    </div>
  );
}
