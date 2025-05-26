export type Task = {
  id: string
  title: string
  details: string
  dueDate?: string
  priority: "today" | "urgent" | "overdue" | "pending"
  done: boolean
}
