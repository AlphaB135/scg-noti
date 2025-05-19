import { notificationsApi } from "@/lib/real-api"

// Type definitions for unified data structure
export type UnifiedTask = {
  id: string
  title: string
  details: string
  dueDate: string
  status: "completed" | "incomplete" | "overdue"
  priority: "today" | "urgent" | "overdue" | "pending"
  done: boolean
  frequency: "no-repeat" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  impact?: string
  link?: string
  hasLogin?: boolean
  username?: string
  password?: string
  type?: string
  isUrgent?: boolean
  rescheduleHistory?: Array<{ date: string; reason: string }>
  reopenHistory?: Array<{ date: string; reason: string }>
}

// Convert API notification to unified task format
export const convertApiNotificationToTask = (notification: any): UnifiedTask => {
  return {
    id: notification.id,
    title: notification.title,
    details: notification.message || "",
    dueDate: notification.scheduledAt?.split("T")[0] || "",
    done: notification.status === "DONE",
    priority: getPriorityFromDueDate(notification.scheduledAt),
    status: getStatusFromApiStatus(notification.status, notification.scheduledAt),
    frequency: getFrequencyFromRepeatInterval(notification.repeatIntervalDays),
    impact: extractImpactFromMessage(notification.message),
    link: notification.link || "",
    hasLogin: notification.message?.includes("user:") || false,
    username: extractUsernameFromMessage(notification.message),
    password: extractPasswordFromMessage(notification.message),
    type: notification.category || "",
    isUrgent: isTaskUrgent(notification.scheduledAt),
    rescheduleHistory: notification.rescheduleHistory,
    reopenHistory: notification.reopenHistory,
  }
}

// Convert unified task to API notification format
export const convertTaskToApiNotification = (task: UnifiedTask): any => {
  // Create message with all details
  const message = `${task.details}${task.impact ? `\n\nผลกระทบ: ${task.impact}` : ""}${
    task.hasLogin ? `\n\nข้อมูลการเข้าสู่ระบบ:\nuser: ${task.username}\npassword: ${task.password}` : ""
  }`

  const repeatIntervalMap: Record<string, number> = {
    "no-repeat": 0,
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    yearly: 365,
  }

  return {
    title: task.title,
    message: message,
    type: "TODO",
    scheduledAt: new Date(task.dueDate).toISOString(),
    category: task.type || "TASK",
    link: task.link || undefined,
    urgencyDays: 3,
    repeatIntervalDays: repeatIntervalMap[task.frequency],
    recipients: [{ type: "ALL" }],
    status: task.done ? "DONE" : "PENDING",
  }
}

// Helper functions
const getPriorityFromDueDate = (dueDate?: string): UnifiedTask["priority"] => {
  if (!dueDate) return "pending"

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffInDays = Math.floor((due.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) return "overdue"
  if (diffInDays === 0) return "today"
  if (diffInDays <= 3) return "urgent"
  return "pending"
}

const getStatusFromApiStatus = (status: string, dueDate?: string): "completed" | "incomplete" | "overdue" => {
  if (status === "DONE") return "completed"

  if (!dueDate) return "incomplete"

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due < todayDate) return "overdue"
  return "incomplete"
}

const getFrequencyFromRepeatInterval = (repeatIntervalDays?: number): UnifiedTask["frequency"] => {
  if (!repeatIntervalDays) return "no-repeat"
  if (repeatIntervalDays === 1) return "daily"
  if (repeatIntervalDays === 7) return "weekly"
  if (repeatIntervalDays === 30) return "monthly"
  if (repeatIntervalDays === 90) return "quarterly"
  if (repeatIntervalDays === 365) return "yearly"
  return "no-repeat"
}

const isTaskUrgent = (dueDate?: string): boolean => {
  if (!dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays >= 0 && diffDays <= 3
}

// Extract impact, username, password from message
const extractImpactFromMessage = (message?: string): string => {
  if (!message) return ""

  const impactMatch = message.match(/ผลกระทบ:\s*(.*?)(?:\n\n|$)/s)
  return impactMatch ? impactMatch[1].trim() : ""
}

const extractUsernameFromMessage = (message?: string): string => {
  if (!message) return ""

  const userMatch = message.match(/user:\s*(.*?)(?:\n|$)/i)
  return userMatch ? userMatch[1].trim() : ""
}

const extractPasswordFromMessage = (message?: string): string => {
  if (!message) return ""

  const passwordMatch = message.match(/password:\s*(.*?)(?:\n|$)/i)
  return passwordMatch ? passwordMatch[1].trim() : ""
}

// Unified API functions
export const unifiedApi = {
  // Get all tasks
  getAll: async (page = 1, limit = 100): Promise<UnifiedTask[]> => {
    try {
      const response = await notificationsApi.getAll(page, limit)
      return response.data.map(convertApiNotificationToTask)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      return []
    }
  },

  // Get tasks for current month
  getCurrentMonthTasks: async (month: number, year: number): Promise<UnifiedTask[]> => {
    try {
      const response = await notificationsApi.getCurrentMonthNotifications(month, year)
      return response.data.map(convertApiNotificationToTask)
    } catch (error) {
      console.error("Failed to fetch current month notifications:", error)
      return []
    }
  },

  // Create a new task
  create: async (task: Omit<UnifiedTask, "id">): Promise<UnifiedTask> => {
    try {
      const apiNotification = convertTaskToApiNotification(task as UnifiedTask)
      const response = await notificationsApi.create(apiNotification)
      return convertApiNotificationToTask(response)
    } catch (error) {
      console.error("Failed to create notification:", error)
      throw error
    }
  },

  // Update a task
  update: async (id: string, task: Partial<UnifiedTask>): Promise<UnifiedTask> => {
    try {
      // First get the current task to merge with updates
      const currentTask = await unifiedApi.getById(id)
      const updatedTask = { ...currentTask, ...task }

      const apiNotification = convertTaskToApiNotification(updatedTask)
      const response = await notificationsApi.update(id, apiNotification)
      return convertApiNotificationToTask(response)
    } catch (error) {
      console.error("Failed to update notification:", error)
      throw error
    }
  },

  // Get a task by ID
  getById: async (id: string): Promise<UnifiedTask> => {
    try {
      const response = await notificationsApi.getById(id)
      return convertApiNotificationToTask(response)
    } catch (error) {
      console.error(`Failed to fetch notification with ID ${id}:`, error)
      throw error
    }
  },

  // Delete a task
  delete: async (id: string): Promise<void> => {
    try {
      await notificationsApi.delete(id)
    } catch (error) {
      console.error(`Failed to delete notification with ID ${id}:`, error)
      throw error
    }
  },

  // Update task status
  updateStatus: async (id: string, status: string): Promise<UnifiedTask> => {
    try {
      const response = await notificationsApi.updateStatus(id, status)
      return convertApiNotificationToTask(response)
    } catch (error) {
      console.error(`Failed to update status for notification with ID ${id}:`, error)
      throw error
    }
  },

  // Reschedule a task
  reschedule: async (id: string, newDueDate: string, reason: string): Promise<UnifiedTask> => {
    try {
      const response = await notificationsApi.reschedule(id, newDueDate, reason)
      return convertApiNotificationToTask(response)
    } catch (error) {
      console.error(`Failed to reschedule notification with ID ${id}:`, error)
      throw error
    }
  },

  // Reopen a completed task
  reopen: async (id: string, reason: string): Promise<UnifiedTask> => {
    try {
      const response = await notificationsApi.reopen(id, reason)
      return convertApiNotificationToTask(response)
    } catch (error) {
      console.error(`Failed to reopen notification with ID ${id}:`, error)
      throw error
    }
  },
}
