// frontend/src/lib/real-api.ts
import axios from "axios";
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  DashboardStats,
} from "./types";

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export interface NotificationStatus {
  DONE: "DONE";
  PENDING: "PENDING";
  CANCELLED: "CANCELLED";
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: "/api", // proxy ไป http://localhost:3001/api
  withCredentials: true, // ส่ง cookie httpOnly ไปด้วย
});

console.log("API client configured with baseURL:", api.defaults.baseURL);
console.log("API client withCredentials:", api.defaults.withCredentials);

// Cache wrapper
const withCache = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const data = await fn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const resp = await api.get<DashboardStats>("/dashboard/overview");
  return resp.data;
}

export const notificationsApi = {
  getAll: (
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<Notification>> =>
    withCache(`notifications-${page}-${size}`, () =>
      api
        .get<PaginatedResponse<Notification>>("/notifications", {
          params: { page, size },
        })
        .then((r) => r.data)
    ),

  getCurrentMonthNotifications: (
    month: number,
    year: number
  ): Promise<PaginatedResponse<Notification>> =>
    withCache(`notifications-${year}-${month}`, () =>
      api
        .get<PaginatedResponse<Notification>>("/notifications", {
          params: {
            page: 1,
            size: 100,
            month,
            year,
          },
        })
        .then((r) => r.data)
    ),

  get: (id: string): Promise<Notification> =>
    api.get<Notification>(`/notifications/${id}`).then((r) => r.data),

  create: (data: CreateNotificationInput): Promise<Notification> =>
    api.post<Notification>("/notifications", data).then((r) => r.data),

  update: (id: string, data: UpdateNotificationInput): Promise<Notification> =>
    api.put<Notification>(`/notifications/${id}`, data).then((r) => r.data),

  updateStatus: (
    id: string,
    status: keyof NotificationStatus
  ): Promise<Notification> =>
    api
      .patch<Notification>(`/notifications/${id}/status`, { status })
      .then((r) => r.data),

  reopen: (id: string, reason: string): Promise<Notification> =>
    api
      .post<Notification>(`/notifications/${id}/reopen`, { reason })
      .then((r) => r.data),

  reschedule: (
    id: string,
    dueDate: string,
    reason: string
  ): Promise<Notification> =>
    api
      .post<Notification>(`/notifications/${id}/reschedule`, {
        dueDate,
        reason,
      })
      .then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete<void>(`/notifications/${id}`).then((r) => r.data),

  complete: (id: string, form: FormData) =>
    api
      .post<Notification>(`/notifications/${id}/complete`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
};

export default api;
