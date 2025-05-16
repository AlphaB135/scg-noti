import axios from 'axios'
import api from '../real-api'  // นำเข้า axios instance ที่มีการตั้งค่า baseURL

// Helper function to implement delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry a request with exponential backoff
const retryRequest = async <T>(
  request: () => Promise<T>, 
  maxRetries = 3, 
  initialDelay = 1000
): Promise<T> => {
  let attempts = 0;
  let lastError: unknown = new Error("Unknown error");
  
  while (attempts < maxRetries) {
    try {
      return await request();
    } catch (error: unknown) {
      lastError = error;
      // Check if it's an axios error with status 429
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        // Rate limited, let's wait before retrying
        const delayMs = initialDelay * Math.pow(2, attempts); // Exponential backoff
        console.log(`Rate limited. Retrying in ${delayMs}ms...`);
        await delay(delayMs);
        attempts++;
      } else {
        // For other errors, just throw them
        throw error;
      }
    }
  }
  
  // All retries failed
  console.error(`Failed after ${maxRetries} attempts`);
  throw lastError;
};

export const notificationApi = {
  // Fetch notifications
  async getNotifications() {
    return retryRequest(async () => {
      const { data } = await api.get('/notifications')
      return data
    })
  },

  // Update notification status
  async updateNotificationStatus(id: string, status: string) {
    return retryRequest(async () => {
      const { data } = await api.patch(
        `/notifications/${id}/status`,
        { status }
      )
      return data
    })
  },

  // Update notification content
  async updateNotification(id: string, updateData: {
    title?: string
    message?: string
    dueDate?: string
  }) {
    return retryRequest(async () => {
      const { data } = await api.patch(
        `/notifications/${id}`,
        updateData
      )
      return data
    })
  },

  // Reschedule notification
  async rescheduleNotification(
    id: string,
    newDueDate: string,
    reason: string
  ) {
    return retryRequest(async () => {
      const { data } = await api.patch(
        `/notifications/${id}/reschedule`,
        {
          dueDate: newDueDate,
          reason
        }
      )
      return data
    })
  },

  // Create new notification
  async createNotification(notification: {
    title: string
    message: string
    type: 'SYSTEM' | 'TODO' | 'REMINDER'
    dueDate: string
    category: string
    link?: string
    urgencyDays: number
    repeatIntervalDays: number
    recipients: Array<{
      type: 'USER' | 'GROUP' | 'ALL'
      userId?: string
      groupId?: string
    }>
  }) {
    return retryRequest(async () => {
      const { data } = await api.post(
        '/notifications',
        notification
      )
      return data
    })
  },

  // Reopen a closed notification
  async reopenNotification(id: string, reason: string) {
    return retryRequest(async () => {
      const { data } = await api.patch(
        `/notifications/${id}/reopen`, 
        { reason }
      )
      return data
    })
  }
}
