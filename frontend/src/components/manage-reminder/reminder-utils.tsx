"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react"

// Get status badge color
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-[#c6f6d5] text-[#38a169] hover:bg-[#9ae6b4]">เสร็จแล้ว</Badge>
    case "incomplete":
      return <Badge className="bg-[#fefcbf] text-[#d69e2e] hover:bg-[#faf089]">ยังไม่เสร็จ</Badge>
    case "overdue":
      return <Badge className="bg-[#fed7d7] text-[#e53e3e] hover:bg-[#feb2b2]">เลยกำหนด</Badge>
    default:
      return <Badge className="bg-[#e2e8f0] text-[#4a5568] hover:bg-[#cbd5e0]">{status}</Badge>
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
        <Badge variant="outline" className="bg-[#ebf8ff] text-[#3182ce] border-[#bee3f8] flex items-center gap-1">
          <Calendar className="h-3 w-3" /> การประชุม
        </Badge>
      )
    case "report":
      return (
        <Badge variant="outline" className="bg-[#f3e8ff] text-[#805ad5] border-[#e9d8fd] flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> รายงาน
        </Badge>
      )
    case "document":
      return (
        <Badge variant="outline" className="bg-[#fffbeb] text-[#d97706] border-[#fef3c7] flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> เอกสาร
        </Badge>
      )
    case "finance":
      return (
        <Badge variant="outline" className="bg-[#f0fff4] text-[#38a169] border-[#c6f6d5] flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> การเงิน
        </Badge>
      )
    case "training":
      return (
        <Badge variant="outline" className="bg-[#eef2ff] text-[#5a67d8] border-[#c3dafe] flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> การอบรม
        </Badge>
      )
    case "maintenance":
      return (
        <Badge variant="outline" className="bg-[#fff8f1] text-[#dd6b20] border-[#feebc8] flex items-center gap-1">
          <Clock className="h-3 w-3" /> การบำรุงรักษา
        </Badge>
      )
    case "data":
      return (
        <Badge variant="outline" className="bg-[#edfdfd] text-[#0987a0] border-[#b2f5ea] flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> ข้อมูล
        </Badge>
      )
    case "purchase":
      return (
        <Badge variant="outline" className="bg-[#fff5f7] text-[#d53f8c] border-[#fed7e2] flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> การสั่งซื้อ
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-[#f7fafc] text-[#4a5568] border-[#e2e8f0] flex items-center gap-1">
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
      <span className="text-[#e53e3e] text-xs flex items-center gap-1 font-medium">
        <AlertCircle className="h-3 w-3" /> เลยกำหนด {Math.abs(diffDays)} วัน
      </span>
    )
  } else if (diffDays === 0) {
    return (
      <span className="text-[#dd6b20] text-xs flex items-center gap-1 font-medium">
        <Clock className="h-3 w-3" /> วันนี้
      </span>
    )
  } else if (diffDays <= 3) {
    return (
      <span className="text-[#d69e2e] text-xs flex items-center gap-1 font-medium">
        <Clock className="h-3 w-3" /> อีก {diffDays} วัน
      </span>
    )
  } else {
    return <span className="text-[#4a5568] text-xs">{formatThaiDate(dateString)}</span>
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
