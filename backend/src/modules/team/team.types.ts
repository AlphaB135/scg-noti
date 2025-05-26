export interface TeamEvent {
  type: 'security' | 'approval' | 'notification'
  actor: {
    id: string
    name: string
  }
  details: {
    action?: string
    ipAddress?: string
    userAgent?: string
    notificationId?: string
    notificationTitle?: string
    response?: string
    comment?: string
    title?: string
    message?: string
    type?: string
    category?: string
  }
  timestamp: Date
}
