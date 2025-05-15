import { FileText, CheckCircle, Edit, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react"

// ประเภทของการดำเนินการ
export type ActionType =
  | "task_created"
  | "task_completed"
  | "task_updated"
  | "task_postponed"
  | "task_reopened"
  | "task_deleted"

// แปลงวันที่เป็นรูปแบบที่อ่านง่าย
export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// แปลงวันที่แบบสั้น
export const formatShortDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// แปลงประเภทการดำเนินการเป็นภาษาไทย
export const getActionTypeText = (actionType: ActionType) => {
  switch (actionType) {
    case "task_created":
      return "สร้างงานใหม่"
    case "task_completed":
      return "ทำงานเสร็จแล้ว"
    case "task_updated":
      return "แก้ไขงาน"
    case "task_postponed":
      return "เลื่อนกำหนดส่ง"
    case "task_reopened":
      return "เปิดงานใหม่"
    case "task_deleted":
      return "ลบงาน"
    default:
      return actionType
  }
}

// แปลงประเภทการดำเนินการเป็นสี
export const getActionTypeColor = (actionType: ActionType) => {
  switch (actionType) {
    case "task_created":
      return "bg-blue-100 text-blue-800"
    case "task_completed":
      return "bg-green-100 text-green-800"
    case "task_updated":
      return "bg-purple-100 text-purple-800"
    case "task_postponed":
      return "bg-orange-100 text-orange-800"
    case "task_reopened":
      return "bg-yellow-100 text-yellow-800"
    case "task_deleted":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// แปลงประเภทการดำเนินการเป็นไอคอน
export const getActionTypeIcon = (actionType: ActionType) => {
  switch (actionType) {
    case "task_created":
      return <FileText className="h-4 w-4" />
    case "task_completed":
      return <CheckCircle className="h-4 w-4" />
    case "task_updated":
      return <Edit className="h-4 w-4" />
    case "task_postponed":
      return <ArrowRight className="h-4 w-4" />
    case "task_reopened":
      return <RefreshCw className="h-4 w-4" />
    case "task_deleted":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}
