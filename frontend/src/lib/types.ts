// frontend/src/lib/types.ts

export interface Notification {
    id: string
    title: string
    message: string
    scheduledAt: string | null
    status: string
    createdAt: string
    updatedAt: string
  }
  
  export interface CreateNotificationInput {
    title: string
    message: string
    scheduledAt?: string
    status?: string
  }
  
  export interface UpdateNotificationInput {
    title?: string
    message?: string
    scheduledAt?: string
    status?: string
  }
  
  export interface DashboardStats {
    notifications: {
      total: number
      pending: number
      approved: number
      approvedPercentage: number
    }
    approvals: {
      total: number
      pending: number
      completed: number
      completedPercentage: number
    }
    users: {
      total: number
      active: number
      activePercentage: number
    }
    recentActivity: Array<{
      id: string
      userId: string
      action: string
      ipAddress: string
      userAgent: string
      createdAt: string
    }>
  }
  