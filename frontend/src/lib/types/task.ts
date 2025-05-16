export interface Task {
  id: string
  title: string
  details: string
  dueDate?: string
  priority: "today" | "urgent" | "overdue" | "pending"
  done: boolean
  frequency?: "no-repeat" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  impact?: string
  link?: string
  hasLogin?: boolean
  username?: string
  password?: string
  rescheduleHistory?: Array<{
    date: string
    reason: string
  }>
  reopenHistory?: Array<{
    date: string
    reason: string
  }>
}
