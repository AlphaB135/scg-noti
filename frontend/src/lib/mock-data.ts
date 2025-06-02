import type { Notification, NotificationStats, ApprovalLog, DashboardStats, RPAResponse } from "./api"

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Generate a random date within the last 30 days
const generateRecentDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  return date.toISOString()
}

// Mock user data
const mockUsers = [
  { id: "user1", name: "John Doe" },
  { id: "user2", name: "Jane Smith" },
  { id: "user3", name: "Robert Johnson" },
  { id: "user4", name: "Emily Davis" },
  { id: "user5", name: "Michael Wilson" },
]

// Mock notifications data
export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "System Maintenance",
    message: "The system will be down for maintenance on Saturday from 2 AM to 4 AM.",
    status: "approved",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user1",
    targetUsers: ["user2", "user3", "user4"],
  },
  {
    id: "notif-2",
    title: "New Feature Release",
    message: "We're excited to announce the release of our new dashboard features.",
    status: "pending",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user1",
    targetUsers: ["user2", "user3", "user4", "user5"],
  },
  {
    id: "notif-3",
    title: "Security Alert",
    message: "Please update your password as part of our regular security protocol.",
    status: "pending",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user1",
    targetUsers: ["user2", "user5"],
  },
  {
    id: "notif-4",
    title: "Holiday Schedule",
    message: "The office will be closed on December 25th and 26th for the holidays.",
    status: "rejected",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user3",
    targetUsers: ["user1", "user2", "user4", "user5"],
  },
  {
    id: "notif-5",
    title: "Training Session",
    message: "Mandatory training session on the new compliance procedures on Friday at 2 PM.",
    status: "cancelled",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user3",
    targetUsers: ["user1", "user2", "user4"],
  },
  {
    id: "notif-6",
    title: "Budget Approval Required",
    message: "Please review and approve the Q3 budget proposal by end of week.",
    status: "approved",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user2",
    targetUsers: ["user1"],
  },
  {
    id: "notif-7",
    title: "Team Meeting",
    message: "Weekly team meeting moved to Thursday at 10 AM this week only.",
    status: "approved",
    createdAt: generateRecentDate(),
    updatedAt: generateRecentDate(),
    createdBy: "user4",
    targetUsers: ["user1", "user2", "user3", "user5"],
  },
]

// Mock notification stats
export const mockNotificationStats: NotificationStats = {
  total: mockNotifications.length,
  pending: mockNotifications.filter((n) => n.status === "pending").length,
  approved: mockNotifications.filter((n) => n.status === "approved").length,
  rejected: mockNotifications.filter((n) => n.status === "rejected").length,
  cancelled: mockNotifications.filter((n) => n.status === "cancelled").length,
}

// Mock approval logs
export const mockApprovalLogs: Record<string, ApprovalLog[]> = {
  "notif-1": [
    {
      id: generateId(),
      notificationId: "notif-1",
      action: "approved",
      actionBy: "user5",
      actionAt: generateRecentDate(),
      comments: "Looks good to me.",
    },
  ],
  "notif-4": [
    {
      id: generateId(),
      notificationId: "notif-4",
      action: "rejected",
      actionBy: "user2",
      actionAt: generateRecentDate(),
      comments: "Dates are incorrect, please revise.",
    },
  ],
  "notif-5": [
    {
      id: generateId(),
      notificationId: "notif-5",
      action: "cancelled",
      actionBy: "user3",
      actionAt: generateRecentDate(),
      comments: "Training session postponed.",
    },
  ],
  "notif-6": [
    {
      id: generateId(),
      notificationId: "notif-6",
      action: "approved",
      actionBy: "user1",
      actionAt: generateRecentDate(),
      comments: "Budget approved.",
    },
  ],
  "notif-7": [
    {
      id: generateId(),
      notificationId: "notif-7",
      action: "approved",
      actionBy: "user1",
      actionAt: generateRecentDate(),
    },
  ],
}

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  notifications: {
    total: mockNotifications.length,
    pending: mockNotifications.filter((n) => n.status === "pending").length,
    approved: mockNotifications.filter((n) => n.status === "approved").length,
  },
  approvals: {
    total: 12,
    pending: 3,
    completed: 9,
  },
  users: {
    total: mockUsers.length,
    active: 3,
  },
  recentActivity: [
    {
      id: generateId(),
      type: "approval",
      description: "John Doe approved the Budget Approval notification",
      timestamp: generateRecentDate(),
    },
    {
      id: generateId(),
      type: "creation",
      description: "Emily Davis created a new Team Meeting notification",
      timestamp: generateRecentDate(),
    },
    {
      id: generateId(),
      type: "rejection",
      description: "Jane Smith rejected the Holiday Schedule notification",
      timestamp: generateRecentDate(),
    },
    {
      id: generateId(),
      type: "approval",
      description: "John Doe approved the Team Meeting notification",
      timestamp: generateRecentDate(),
    },
    {
      id: generateId(),
      type: "creation",
      description: "Robert Johnson created a new Security Alert notification",
      timestamp: generateRecentDate(),
    },
  ],
}

// Mock RPA responses
export const mockRPAResponse = (success = true): RPAResponse => {
  if (success) {
    return {
      success: true,
      message: "RPA action triggered successfully",
      jobId: generateId(),
    }
  } else {
    return {
      success: false,
      message: "Failed to trigger RPA action: Invalid parameters",
    }
  }
}

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))
