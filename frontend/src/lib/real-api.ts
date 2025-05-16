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

const api = axios.create({
  baseURL: '/api',        // proxy ไป http://localhost:3001/api
  withCredentials: true,  // ส่ง cookie httpOnly ไปด้วย
})

console.log('API client configured with baseURL:', api.defaults.baseURL)
console.log('API client withCredentials:', api.defaults.withCredentials)

export async function getDashboardStats(): Promise<DashboardStats> {
  const resp = await api.get<DashboardStats>('/dashboard/overview')
  return resp.data
}

export const notificationsApi = {
  getAll: (page: number = 1, size: number = 20): Promise<PaginatedResponse<Notification>> =>
    api.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, size }
    }).then(r => r.data),

  get: (id: string): Promise<Notification> =>
    api.get<Notification>(`/notifications/${id}`).then(r => r.data),

  create: (data: CreateNotificationInput): Promise<Notification> =>
    api.post<Notification>('/notifications', data).then(r => r.data),

  update: (id: string, data: UpdateNotificationInput): Promise<Notification> =>
    api.put<Notification>(`/notifications/${id}`, data).then(r => r.data),

  remove: (id: string): Promise<void> =>
    api.delete<void>(`/notifications/${id}`).then(r => r.data),
}

export default api
