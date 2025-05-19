import axios from '@/axiosConfig'

// Types
export interface UserProfile {
  id: string
  email: string
  role: string
  employeeProfile?: {
    firstName: string
    lastName: string
    employeeCode: string
    position?: string
    nickname?: string
    profileImageUrl?: string
  }
}

export interface NotificationSettings {
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  digestFreq: string
  sound: string
  quietHoursStart: Date
  quietHoursEnd: Date
}

// API functions
export const settingsApi = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await axios.get('/api/auth/me')
    return data.user
  },  // Update user profile
  updateProfile: async (profileData: {
    email: string,
    employeeProfile: {
      firstName: string,
      lastName: string,
      position?: string,
      nickname?: string,
      profileImageUrl?: string // base64 image string
    }
  }) => {
    const { data } = await axios.put('/api/users/profile', profileData)
    return data
  },

  // Get notification settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const { data } = await axios.get('/api/settings/notifications')
    return data.data
  },

  // Update notification settings
  updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    const { data } = await axios.put('/api/settings/notifications', settings)
    return data.data
  }
}
