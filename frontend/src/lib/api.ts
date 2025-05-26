import axios from "axios"
import {
  mockNotifications,
  mockNotificationStats,
  mockApprovalLogs,
  mockDashboardStats,
  mockRPAResponse,
  simulateApiDelay,
} from "./mock-data"

// Base API configuration
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For JWT HttpOnly cookie
})

// Types
export interface Notification {
  id: string
  title: string
  message: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  createdAt: string
  updatedAt: string
  createdBy: string
  targetUsers: string[]
}

export interface NotificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
}

export interface ApprovalLog {
  id: string
  notificationId: string
  action: "approved" | "rejected" | "cancelled"
  actionBy: string
  actionAt: string
  comments?: string
}

export interface DashboardStats {
  notifications: {
    total: number
    pending: number
    approved: number
  }
  approvals: {
    total: number
    pending: number
    completed: number
  }
  users: {
    total: number
    active: number
  }
  recentActivity: {
    id: string
    type: string
    description: string
    timestamp: string
  }[]
}

export interface RPAResponse {
  success: boolean
  message: string
  jobId?: string
}

// Default dashboard stats for when API fails
const defaultDashboardStats: DashboardStats = {
  notifications: {
    total: 0,
    pending: 0,
    approved: 0,
  },
  approvals: {
    total: 0,
    pending: 0,
    completed: 0,
  },
  users: {
    total: 0,
    active: 0,
  },
  recentActivity: [],
}

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// API functions with mock data
export const notificationsApi = {
  getAll: async () => {
    try {
      // Simulate API delay
      await simulateApiDelay()

      // Use mock data instead of API call
      return [...mockNotifications]
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return []
    }
  },

  getById: async (id: string) => {
    await simulateApiDelay()
    const notification = mockNotifications.find((n) => n.id === id)

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    return notification
  },

  create: async (notification: Omit<Notification, "id" | "createdAt" | "updatedAt" | "status">) => {
    await simulateApiDelay()

    const newNotification: Notification = {
      id: generateId(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...notification,
    }

    // In a real app, we would add this to the database
    // For mock purposes, we'll just return it
    return newNotification
  },

  update: async (id: string, notification: Partial<Notification>) => {
    await simulateApiDelay()

    const existingIndex = mockNotifications.findIndex((n) => n.id === id)

    if (existingIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    // In a real app, we would update the database
    // For mock purposes, we'll just return the updated notification
    const updatedNotification = {
      ...mockNotifications[existingIndex],
      ...notification,
      updatedAt: new Date().toISOString(),
    }

    return updatedNotification
  },

  delete: async (id: string) => {
    await simulateApiDelay()

    const existingIndex = mockNotifications.findIndex((n) => n.id === id)

    if (existingIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    // In a real app, we would delete from the database
    // For mock purposes, we'll just return success
    return { success: true }
  },

  approve: async (id: string, comments?: string) => {
    await simulateApiDelay()

    const existingIndex = mockNotifications.findIndex((n) => n.id === id)

    if (existingIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    // In a real app, we would update the database
    // For mock purposes, we'll just return the updated notification
    const updatedNotification = {
      ...mockNotifications[existingIndex],
      status: "approved" as const,
      updatedAt: new Date().toISOString(),
    }

    return updatedNotification
  },

  reject: async (id: string, comments?: string) => {
    await simulateApiDelay()

    const existingIndex = mockNotifications.findIndex((n) => n.id === id)

    if (existingIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    // In a real app, we would update the database
    // For mock purposes, we'll just return the updated notification
    const updatedNotification = {
      ...mockNotifications[existingIndex],
      status: "rejected" as const,
      updatedAt: new Date().toISOString(),
    }

    return updatedNotification
  },

  cancel: async (id: string, comments?: string) => {
    await simulateApiDelay()

    const existingIndex = mockNotifications.findIndex((n) => n.id === id)

    if (existingIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`)
    }

    // In a real app, we would update the database
    // For mock purposes, we'll just return the updated notification
    const updatedNotification = {
      ...mockNotifications[existingIndex],
      status: "cancelled" as const,
      updatedAt: new Date().toISOString(),
    }

    return updatedNotification
  },

  getApprovalLogs: async (id: string) => {
    await simulateApiDelay()

    // Return mock approval logs for the notification ID, or empty array if none exist
    return mockApprovalLogs[id] || []
  },

  getStats: async () => {
    await simulateApiDelay()
    return mockNotificationStats
  },
}

export const approvalsApi = {
  sendPopup: async (data: { notificationId: string; userIds: string[] }) => {
    await simulateApiDelay()

    // Validate notification exists
    const notification = mockNotifications.find((n) => n.id === data.notificationId)

    if (!notification) {
      throw new Error(`Notification with ID ${data.notificationId} not found`)
    }

    // In a real app, we would send popups to users
    // For mock purposes, we'll just return success
    return {
      success: true,
      message: `Popup sent to ${data.userIds.length} users`,
    }
  },

  sendResponse: async (data: { notificationId: string; response: "approve" | "reject"; comments?: string }) => {
    await simulateApiDelay()

    // Validate notification exists
    const notification = mockNotifications.find((n) => n.id === data.notificationId)

    if (!notification) {
      throw new Error(`Notification with ID ${data.notificationId} not found`)
    }

    // In a real app, we would record the response
    // For mock purposes, we'll just return success
    return {
      success: true,
      message: `Response "${data.response}" recorded for notification ${data.notificationId}`,
    }
  },
}

export const dashboardApi = {
  getStats: async () => {
    try {
      await simulateApiDelay()
      return mockDashboardStats
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return defaultDashboardStats
    }
  },
}

export const rpaApi = {
  trigger: async (data: { action: string; parameters: Record<string, any> }) => {
    await simulateApiDelay(1000) // Longer delay for RPA actions

    // Randomly succeed or fail to demonstrate both scenarios
    const success = Math.random() > 0.3
    return mockRPAResponse(success)
  },
}
