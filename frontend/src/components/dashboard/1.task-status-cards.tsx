"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from "lucide-react"

type TaskStatusCardsProps = {
  notifications: {
    overdue: number
    urgentToday: number
    other: number
    done: number
  }
  onCardClick: (filter: string) => void
}

export default function TaskStatusCards({ notifications, onCardClick }: TaskStatusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
      {/* กล่อง: งานเลยกำหนด */}
      <Card
        onClick={() => onCardClick("overdue")}
        className="cursor-pointer border-l-4 border-red-600 bg-red-50 hover:scale-[1.02] duration-300 hover:shadow-md"
      >
        <CardHeader className="pb-2 ">
          <CardTitle className="text-lg font-medium text-red-800 ">งานเลยกำหนด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-700 w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{notifications.overdue} งาน</p>
              <p className="text-sm text-red-600">งานที่เลยกำหนดแล้ว</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-end">
              <button className="text-xs text-red-700 hover:underline">View details &gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* กล่อง: งานด่วนวันนี้ */}
      <Card
        onClick={() => onCardClick("urgent")}
        className="cursor-pointer border-l-4 border-orange-600 bg-orange-50 hover:scale-[1.02] duration-300 hover:shadow-md"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-orange-800">งานด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
              <AlertCircle className="text-orange-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{notifications.urgentToday} งาน</p>
              <p className="text-sm text-orange-600">งานที่ต้องทำด่วน</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-end">
              <button className="text-xs text-orange-700 hover:underline">View details &gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* กล่อง: งานอื่นๆ */}
      <Card
        onClick={() => onCardClick("normal")}
        className="cursor-pointer border-l-4 border-blue-500 bg-blue-50 hover:scale-[1.02] duration-300 hover:shadow-md"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">งานอื่นๆ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Clock className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{notifications.other} งาน</p>
              <p className="text-sm text-gray-500">รายการที่เหลืออยู่</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-end">
              <button className="text-xs text-blue-600 hover:underline">View details &gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* กล่อง: งานที่เสร็จแล้ว */}
      <Card
        onClick={() => onCardClick("completed")}
        className="cursor-pointer border-l-4 border-green-500 bg-green-50 hover:scale-[1.02] duration-300 hover:shadow-md"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-green-800">งานที่เสร็จแล้ว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
              <CheckCircle2 className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{notifications.done} งาน</p>
              <p className="text-sm text-gray-500">งานที่ทำเสร็จแล้ว</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-end">
              <button className="text-xs text-green-600 hover:underline">View details &gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
