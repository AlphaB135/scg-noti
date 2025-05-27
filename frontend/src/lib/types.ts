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
<<<<<<< HEAD
    status?: string
=======
    dueDate?: string
    type?: 'SYSTEM' | 'TODO' | 'REMINDER'
    category: string
    link?: string
    linkUsername?: string
    linkPassword?: string
    urgencyDays?: number
    repeatIntervalDays?: number
    recipients: Array<{
      type: 'USER' | 'GROUP' | 'ALL' | 'COMPANY'
      userId?: string
      groupId?: string
      companyCode?: string
    }>
>>>>>>> 9c9168b83a58a57f2055ca73d7fac4b3753d7707
  }
  
  export interface UpdateNotificationInput {
    title?: string
    message?: string
    scheduledAt?: string
    dueDate?: string
    type?: 'SYSTEM' | 'TODO' | 'REMINDER'
    category?: string
    link?: string
    linkUsername?: string
    linkPassword?: string
    urgencyDays?: number
    repeatIntervalDays?: number
    recipients?: Array<{
      type: 'USER' | 'GROUP' | 'ALL' | 'COMPANY'
      userId?: string
      groupId?: string
      companyCode?: string
    }>
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
  