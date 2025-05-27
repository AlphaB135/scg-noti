// frontend/src/lib/real-api.ts
import axios from 'axios'
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  DashboardStats,
} from './types'

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    size: number
    totalPages: number
  }
}

export interface NotificationStatus {
  DONE: 'DONE'
  PENDING: 'PENDING'
  CANCELLED: 'CANCELLED'
}

// Simple cache implementation
const cache = new Map<string, {data: any, timestamp: number}>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const api = axios.create({
  baseURL: '/api',        // proxy ไป http://localhost:3001/api
  withCredentials: true,  // ส่ง cookie httpOnly ไปด้วย
})

console.log('API client configured with baseURL:', api.defaults.baseURL)
console.log('API client withCredentials:', api.defaults.withCredentials)

// Cache wrapper
const withCache = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  const data = await fn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

// Cache invalidation helper
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    // Invalidate specific cache entries matching pattern
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    // Clear all cache
    cache.clear()
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Remove cache for dashboard stats to ensure immediate updates
  const resp = await api.get<DashboardStats>('/dashboard/overview')
  return resp.data
}

export const notificationsApi = {
  getAll: (page: number = 1, size: number = 20): Promise<PaginatedResponse<Notification>> =>
    // Temporarily disable cache for debugging
    api.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, size }
    }).then(r => {
      console.log('Raw API response for notifications:', r.data)
      return r.data
    }),

  getCurrentMonthNotifications: (month: number, year: number): Promise<PaginatedResponse<Notification>> =>
    withCache(`notifications-${year}-${month}`, () =>
      api.get<PaginatedResponse<Notification>>('/notifications', {
        params: { 
          page: 1, 
          size: 100,
          month,
          year
        }
      }).then(r => r.data)
    ),

  // Get user's own notifications only
  getMine: (page: number = 1, size: number = 20): Promise<PaginatedResponse<Notification>> =>
    api.get<PaginatedResponse<Notification>>('/notifications/mine', {
      params: { page, size }
    }).then(r => {
      console.log('Raw API response for my notifications:', r.data)
      return r.data
    }),

  getCurrentMonthMyNotifications: (month: number, year: number): Promise<PaginatedResponse<Notification>> =>
    api.get<PaginatedResponse<Notification>>('/notifications/mine', {
      params: { 
        page: 1, 
        size: 100,
        month,
        year
      }
    }).then(r => r.data),



  get: (id: string): Promise<Notification> =>
    api.get<Notification>(`/notifications/${id}`).then(r => r.data),

  create: (data: CreateNotificationInput): Promise<Notification> =>
    api.post<Notification>('/notifications', data).then(r => r.data),

  update: (id: string, data: UpdateNotificationInput): Promise<Notification> =>
    api.put<Notification>(`/notifications/${id}`, data).then(r => r.data),

  updateStatus: async (id: string, status: keyof NotificationStatus): Promise<Notification> => {
    const result = await api.patch<Notification>(`/notifications/${id}`, { status }).then(r => r.data)
    // Invalidate all notification and dashboard caches after status update
    invalidateCache('notifications')
    return result
  },

  reopen: (id: string, reason: string): Promise<Notification> =>
    api.post<Notification>(`/notifications/${id}/reopen`, { reason }).then(r => r.data),

  reschedule: (id: string, dueDate: string, reason: string): Promise<Notification> =>
    api.post<Notification>(`/notifications/${id}/reschedule`, { dueDate, reason }).then(r => r.data),

  remove: (id: string): Promise<void> =>
    api.delete<void>(`/notifications/${id}`).then(r => r.data),
}

// Team API
export const teamApi = {
  getTeams: (): Promise<any[]> =>
    api.get('/teams').then(r => r.data.data || r.data),

  getTeamById: (teamId: string): Promise<any> =>
    api.get(`/teams/${teamId}`).then(r => r.data.data || r.data),

  getTeamMembers: (teamId: string): Promise<any[]> =>
    api.get(`/teams/${teamId}/members`).then(r => r.data.data || r.data),

  addTeamMember: (teamId: string, employeeId: string, role: string): Promise<any> =>
    api.post(`/teams/${teamId}/members`, {
      employeeId,
      isLeader: role === 'หัวหน้างาน',
      role
    }).then(r => r.data.data || r.data),

  removeTeamMember: (teamId: string, memberId: string): Promise<void> =>
    api.delete(`/teams/${teamId}/members/${memberId}`).then(r => r.data),

  leaveTeam: (teamId: string, userId: string): Promise<void> =>
    api.delete(`/teams/${teamId}/members/${userId}`).then(r => r.data),

  getAvailableEmployees: (teamId: string): Promise<any[]> =>
    api.get(`/teams/${teamId}/available-employees`).then(r => r.data.data || r.data).catch(() => []),
}

export default api
