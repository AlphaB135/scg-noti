// frontend/src/lib/real-api.ts
import axios from 'axios'
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  DashboardStats,
} from './types'

const api = axios.create({
  baseURL: '/api',        // proxy ไป http://localhost:3001/api
  withCredentials: true,  // ส่ง cookie httpOnly ไปด้วย
})

export async function getDashboardStats(): Promise<DashboardStats> {
  const resp = await api.get<DashboardStats>('/dashboard/overview')
  return resp.data
}

export const notificationsApi = {
  getAll: (): Promise<Notification[]> =>
    api.get<Notification[]>('/notifications').then(r => r.data),

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
