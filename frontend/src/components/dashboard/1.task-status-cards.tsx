"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

type TaskStatusCardsProps = {
  notifications: {
    overdue: number;
    urgentToday: number;
    other: number;
    done: number;
  };
  onCardClick: (filter: string) => void;
};

export default function TaskStatusCards({
  notifications,
  onCardClick,
}: TaskStatusCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-2 my-2">
      {/* Overdue Tasks Card */}
      <Card
        onClick={() => onCardClick("overdue")}
        className="cursor-pointer rounded-xl border-0 shadow-md bg-gradient-to-br from-white to-red-50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-400 to-red-600"></div>
        <CardHeader className="pb-1 pt-3 px-5">
          <CardTitle className="text-base font-medium text-red-800 flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600 w-4 h-4" />
            </div>
            <span>งานเลยกำหนด</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-2">
          <div>
            <p className="text-2xl font-bold text-red-700">
              {notifications.overdue}{" "}
              <span className="text-sm font-medium">งาน</span>
            </p>
            <p className="text-xs text-red-600 mt-1">งานที่เลยกำหนดแล้ว</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-end">
              <button className="text-xs text-red-700 hover:underline flex items-center">
                View details <span className="ml-1">&gt;</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Tasks Card */}
      <Card
        onClick={() => onCardClick("urgent")}
        className="cursor-pointer rounded-xl border-0 shadow-md bg-gradient-to-br from-white to-orange-50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600"></div>
        <CardHeader className="pb-1 pt-3 px-5">
          <CardTitle className="text-base font-medium text-orange-800 flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
              <AlertCircle className="text-orange-600 w-4 h-4" />
            </div>
            <span>งานด่วน</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-2">
          <div>
            <p className="text-2xl font-bold text-orange-700">
              {notifications.urgentToday}{" "}
              <span className="text-sm font-medium">งาน</span>
            </p>
            <p className="text-xs text-orange-600 mt-1">งานที่ต้องทำด่วน</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-end">
              <button className="text-xs text-orange-700 hover:underline flex items-center">
                View details <span className="ml-1">&gt;</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Tasks Card */}
      <Card
        onClick={() => onCardClick("normal")}
        className="cursor-pointer rounded-xl border-0 shadow-md bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
        <CardHeader className="pb-1 pt-3 px-5">
          <CardTitle className="text-base font-medium text-blue-800 flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Clock className="text-blue-600 w-4 h-4" />
            </div>
            <span>งานอื่นๆ</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-2">
          <div>
            <p className="text-2xl font-bold text-blue-700">
              {notifications.other}{" "}
              <span className="text-sm font-medium">งาน</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">รายการที่เหลืออยู่</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-end">
              <button className="text-xs text-blue-700 hover:underline flex items-center">
                View details <span className="ml-1">&gt;</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks Card */}
      <Card
        onClick={() => onCardClick("completed")}
        className="cursor-pointer rounded-xl border-0 shadow-md bg-gradient-to-br from-white to-green-50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-400 to-green-600"></div>
        <CardHeader className="pb-1 pt-3 px-5">
          <CardTitle className="text-base font-medium text-green-800 flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <CheckCircle2 className="text-green-600 w-4 h-4" />
            </div>
            <span>งานที่เสร็จแล้ว</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-2">
          <div>
            <p className="text-2xl font-bold text-green-700">
              {notifications.done}{" "}
              <span className="text-sm font-medium">งาน</span>
            </p>
            <p className="text-xs text-green-600 mt-1">งานที่ทำเสร็จแล้ว</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-end">
              <button className="text-xs text-green-700 hover:underline flex items-center">
                View details <span className="ml-1">&gt;</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
