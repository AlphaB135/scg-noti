"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react"

// Get status badge color
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">เสร็จแล้ว</Badge>
    case "incomplete":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">ยังไม่เสร็จ</Badge>
    case "overdue":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">เลยกำหนด</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
  }
}

// Get frequency text
export const getFrequencyText = (frequency: string) => {
  switch (frequency) {
    case "no-repeat":
      return "เตือนไม่ทำซ้ำ"
    case "monthly":
      return "เตือนทุกเดือน"
    case "daily":
      return "เตือนทุกวัน"
    case "yearly":
      return "ทุกปี"
    case "weekly":
      return "ทุกอาทิตย์"
    case "quarterly":
      return "ทุกไตรมาส"
    default:
      return frequency
  }
}

// Format date to Thai format
export const formatThaiDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Get type icon
export const getTypeIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Calendar className="h-3 w-3" /> การประชุม
        </Badge>
      )
    case "report":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> รายงาน
        </Badge>
      )
    case "document":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> เอกสาร
        </Badge>
      )
    case "finance":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> การเงิน
        </Badge>
      )
    case "training":
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> การอบรม
        </Badge>
      )
    case "maintenance":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
          <Clock className="h-3 w-3" /> การบำรุงรักษา
        </Badge>
      )
    case "data":
      return (
        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> ข้อมูล
        </Badge>
      )
    case "purchase":
      return (
        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> การสั่งซื้อ
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> {type}
        </Badge>
      )
  }
}

// Get due date status
export const getDueDateStatus = (dateString: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return (
      <span className="text-red-600 text-xs flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> เลยกำหนด {Math.abs(diffDays)} วัน
      </span>
    )
  } else if (diffDays === 0) {
    return (
      <span className="text-orange-600 text-xs flex items-center gap-1">
        <Clock className="h-3 w-3" /> วันนี้
      </span>
    )
  } else if (diffDays <= 3) {
    return (
      <span className="text-yellow-600 text-xs flex items-center gap-1">
        <Clock className="h-3 w-3" /> อีก {diffDays} วัน
      </span>
    )
  } else {
    return <span className="text-gray-500 text-xs">{formatThaiDate(dateString)}</span>
  }
}

// Check if a task is urgent (today or within next 3 days)
export const checkIsUrgent = (dateString: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= 3
}
