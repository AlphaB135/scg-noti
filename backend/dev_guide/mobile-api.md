# Mobile API

API สำหรับแอปพลิเคชันมือถือ SCG Notification รองรับ Dashboard หน้าหลัก, ปฏิทิน, การตั้งค่าการแจ้งเตือน, และประวัติการกระทำ

## เอกสารดูเพิ่มเติม
- [Authentication API](./auth-api.md) - การเข้าสู่ระบบสำหรับ Mobile
- [Notifications API](./notification-api.md) - การแจ้งเตือนในระบบ
- [Dashboard API](./dashboard-api.md) - Dashboard สำหรับ Web

## Base URL
```
/api/mobile
```

## Authentication

ทุก endpoint ต้องการการ authentication:
- **Bearer Token**: ใส่ JWT token ใน Authorization header

## Mobile-Specific Features

1. **Optimized Responses**: ข้อมูลที่ปรับให้เหมาะกับหน้าจอมือถือ
2. **Minimal Data Transfer**: ลดข้อมูลที่ส่งเพื่อประหยัด bandwidth
3. **Push Notification Integration**: พร้อมรองรับ Firebase/APNs
4. **Offline Support**: ข้อมูลบางส่วนสามารถ cache ได้

## Endpoints

### 1. Dashboard Boxes

```http
GET /api/mobile/dashboard/boxes
```

**Description**: ดึงข้อมูลสำหรับแสดงใน dashboard หน้าหลักของแอพมือถือ

**Authentication**: ✅ Required (Bearer Token)

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": {
      "unread": 12,
      "pending": 5,
      "total": 156,
      "recent": [
        {
          "id": "notif123",
          "title": "ประชุมทีม Development",
          "message": "ประชุมทีมวันศุกร์ 10:00",
          "type": "MEETING",
          "priority": "HIGH",
          "createdAt": "2024-01-15T08:30:00.000Z",
          "isRead": false
        },
        {
          "id": "notif124",
          "title": "แจ้งเตือนการอนุมัติ",
          "message": "รออนุมัติโครงการใหม่",
          "type": "APPROVAL",
          "priority": "MEDIUM",
          "createdAt": "2024-01-15T07:45:00.000Z",
          "isRead": false
        }
      ]
    },
    "approvals": {
      "pending": 3,
      "completed": 25,
      "urgent": 1,
      "items": [
        {
          "id": "appr456",
          "title": "อนุมัติโครงการ X",
          "requester": "สมชาย ใจดี",
          "type": "PROJECT_APPROVAL",
          "deadline": "2024-01-16T17:00:00.000Z",
          "priority": "HIGH"
        }
      ]
    },
    "schedule": {
      "today": 2,
      "thisWeek": 8,
      "upcoming": [
        {
          "id": "event789",
          "title": "ประชุมบอร์ด",
          "startTime": "2024-01-15T14:00:00.000Z",
          "endTime": "2024-01-15T16:00:00.000Z",
          "location": "ห้องประชุม A",
          "type": "MEETING"
        }
      ]
    },
    "quickActions": [
      {
        "id": "create_notification",
        "title": "สร้างการแจ้งเตือน",
        "icon": "plus-circle",
        "color": "#3B82F6"
      },
      {
        "id": "view_calendar",
        "title": "ดูปฏิทิน",
        "icon": "calendar",
        "color": "#10B981"
      },
      {
        "id": "my_approvals",
        "title": "การอนุมัติของฉัน",
        "icon": "check-circle",
        "color": "#F59E0B"
      }
    ]
  }
}
```

### 2. Calendar Events

```http
GET /api/mobile/dashboard/calendar
```

**Description**: ดึงข้อมูลปฏิทินสำหรับแสดงในแอพมือถือ

**Authentication**: ✅ Required (Bearer Token)

**Query Parameters**:
```
?month=2024-01     // เดือนที่ต้องการ (YYYY-MM format)
?view=week         // มุมมอง: day, week, month (default: month)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "month": "2024-01",
    "events": [
      {
        "id": "event123",
        "title": "ประชุมทีม Development",
        "description": "ประชุมสรุปงานประจำสัปดาห์",
        "startTime": "2024-01-15T10:00:00.000Z",
        "endTime": "2024-01-15T11:30:00.000Z",
        "type": "MEETING",
        "location": "ห้องประชุม B",
        "isAllDay": false,
        "attendees": [
          {
            "id": "user456",
            "name": "สมชาย ใจดี",
            "status": "ACCEPTED"
          },
          {
            "id": "user789",
            "name": "มานี ขยันงาน",
            "status": "PENDING"
          }
        ],
        "category": {
          "id": "work",
          "name": "งาน",
          "color": "#3B82F6"
        }
      },
      {
        "id": "event124",
        "title": "Deadline โครงการ X",
        "type": "DEADLINE",
        "startTime": "2024-01-20T23:59:00.000Z",
        "isAllDay": true,
        "priority": "HIGH",
        "category": {
          "id": "deadline",
          "name": "กำหนดส่ง",
          "color": "#EF4444"
        }
      }
    ],
    "summary": {
      "totalEvents": 15,
      "meetings": 8,
      "deadlines": 3,
      "notifications": 4
    }
  }
}
```

### 3. Notification Settings

```http
GET /api/mobile/settings/notifications
```

**Description**: ดึงการตั้งค่าการแจ้งเตือนสำหรับผู้ใช้

**Authentication**: ✅ Required (Bearer Token)

**Response**:
```json
{
  "success": true,
  "data": {
    "pushNotifications": {
      "enabled": true,
      "types": {
        "newNotification": true,
        "approvalRequest": true,
        "approvalResponse": true,
        "meetingReminder": true,
        "deadlineAlert": true,
        "systemUpdate": false
      }
    },
    "emailNotifications": {
      "enabled": true,
      "types": {
        "dailySummary": true,
        "weeklySummary": true,
        "urgentOnly": false,
        "approvalDigest": true
      }
    },
    "lineNotifications": {
      "enabled": true,
      "lineUserId": "line123456",
      "types": {
        "newNotification": true,
        "approvalRequest": true,
        "meetingReminder": false
      }
    },
    "quietHours": {
      "enabled": true,
      "startTime": "22:00",
      "endTime": "08:00",
      "timezone": "Asia/Bangkok"
    },
    "language": "th",
    "sound": "default"
  }
}
```

### 4. Update Notification Settings

```http
PUT /api/mobile/settings/notifications
```

**Description**: อัปเดตการตั้งค่าการแจ้งเตือน

**Authentication**: ✅ Required (Bearer Token)

**Request Body**:
```json
{
  "pushNotifications": {
    "enabled": true,
    "types": {
      "newNotification": true,
      "approvalRequest": true,
      "approvalResponse": false,
      "meetingReminder": true,
      "deadlineAlert": true,
      "systemUpdate": false
    }
  },
  "emailNotifications": {
    "enabled": false
  },
  "quietHours": {
    "enabled": true,
    "startTime": "23:00",
    "endTime": "07:00"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "อัปเดตการตั้งค่าเรียบร้อยแล้ว",
  "data": {
    "pushNotifications": {
      "enabled": true,
      "types": {
        "newNotification": true,
        "approvalRequest": true,
        "approvalResponse": false,
        "meetingReminder": true,
        "deadlineAlert": true,
        "systemUpdate": false
      }
    },
    "emailNotifications": {
      "enabled": false
    },
    "quietHours": {
      "enabled": true,
      "startTime": "23:00",
      "endTime": "07:00",
      "timezone": "Asia/Bangkok"
    },
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Action History

```http
GET /api/mobile/history/actions
```

**Description**: ดึงประวัติการกระทำล่าสุดของผู้ใช้

**Authentication**: ✅ Required (Bearer Token)

**Query Parameters**:
```
?limit=20         // จำนวนรายการ (default: 20, max: 50)
?offset=0         // เริ่มจากรายการที่ (pagination)
?type=all         // ประเภท: all, notification, approval, meeting
?days=7           // จำนวนวันย้อนหลัง (default: 7)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "id": "action123",
        "type": "NOTIFICATION_CREATED",
        "title": "สร้างการแจ้งเตือนใหม่",
        "description": "ประชุมทีม Development",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "details": {
          "notificationId": "notif456",
          "recipients": 15,
          "type": "MEETING"
        },
        "icon": "bell",
        "color": "#3B82F6"
      },
      {
        "id": "action124",
        "type": "APPROVAL_COMPLETED",
        "title": "อนุมัติเสร็จสิ้น",
        "description": "อนุมัติโครงการ Y",
        "timestamp": "2024-01-15T09:15:00.000Z",
        "details": {
          "approvalId": "appr789",
          "response": "APPROVE",
          "requester": "มานี ขยันงาน"
        },
        "icon": "check-circle",
        "color": "#10B981"
      },
      {
        "id": "action125",
        "type": "NOTIFICATION_READ",
        "title": "อ่านการแจ้งเตือน",
        "description": "ประกาศสำคัญจาก HR",
        "timestamp": "2024-01-15T08:45:00.000Z",
        "details": {
          "notificationId": "notif333"
        },
        "icon": "eye",
        "color": "#6B7280"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 156,
      "hasMore": true
    },
    "summary": {
      "today": 5,
      "thisWeek": 23,
      "thisMonth": 89
    }
  }
}
```

## Data Models

### DashboardBoxes
```typescript
interface DashboardBoxes {
  notifications: {
    unread: number
    pending: number
    total: number
    recent: NotificationSummary[]
  }
  approvals: {
    pending: number
    completed: number
    urgent: number
    items: ApprovalSummary[]
  }
  schedule: {
    today: number
    thisWeek: number
    upcoming: EventSummary[]
  }
  quickActions: QuickAction[]
}
```

### NotificationSettings
```typescript
interface NotificationSettings {
  pushNotifications: {
    enabled: boolean
    types: Record<string, boolean>
  }
  emailNotifications: {
    enabled: boolean
    types: Record<string, boolean>
  }
  lineNotifications: {
    enabled: boolean
    lineUserId?: string
    types: Record<string, boolean>
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm
    endTime: string   // HH:mm
    timezone: string
  }
  language: string
  sound: string
}
```

### ActionHistory
```typescript
interface ActionHistory {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  details: Record<string, any>
  icon: string
  color: string
}
```

## Error Codes

| Status Code | Error Code | Message |
|-------------|------------|---------|
| 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ |
| 400 | `INVALID_MONTH_FORMAT` | รูปแบบเดือนไม่ถูกต้อง (ต้องเป็น YYYY-MM) |
| 400 | `INVALID_SETTINGS_DATA` | ข้อมูลการตั้งค่าไม่ถูกต้อง |
| 400 | `INVALID_LIMIT` | limit ต้องไม่เกิน 50 |
| 500 | `PUSH_NOTIFICATION_ERROR` | ข้อผิดพลาดในการตั้งค่า Push Notification |

## Frontend Integration (React Native)

### React Hooks สำหรับ Mobile

```typescript
// hooks/useMobileDashboard.ts
import { useState, useEffect } from 'react'
import { DashboardBoxes, CalendarData } from '../types/mobile'
import { mobileApi } from '../api/mobile'

export function useMobileDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardBoxes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await mobileApi.getDashboardBoxes()
      setDashboardData(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard: fetchDashboard
  }
}

export function useMobileCalendar() {
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCalendar = async (month?: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await mobileApi.getCalendar(month)
      setCalendar(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return {
    calendar,
    loading,
    error,
    fetchCalendar
  }
}
```

### API Service (React Native)

```typescript
// api/mobile.ts
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE = '/api/mobile'

// Axios interceptor สำหรับ token
axios.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const mobileApi = {
  // Dashboard
  getDashboardBoxes: () =>
    axios.get(`${API_BASE}/dashboard/boxes`),

  getCalendar: (month?: string) => {
    const params = month ? `?month=${month}` : ''
    return axios.get(`${API_BASE}/dashboard/calendar${params}`)
  },

  // Settings
  getNotificationSettings: () =>
    axios.get(`${API_BASE}/settings/notifications`),

  updateNotificationSettings: (settings: any) =>
    axios.put(`${API_BASE}/settings/notifications`, settings),

  // History
  getActionHistory: (params: any = {}) => {
    const query = new URLSearchParams(params).toString()
    return axios.get(`${API_BASE}/history/actions?${query}`)
  }
}
```

### React Native Components

#### DashboardScreen
```tsx
// screens/DashboardScreen.tsx
import React from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useMobileDashboard } from '../hooks/useMobileDashboard'
import { NotificationBox } from '../components/NotificationBox'
import { ApprovalBox } from '../components/ApprovalBox'
import { ScheduleBox } from '../components/ScheduleBox'
import { QuickActions } from '../components/QuickActions'

export const DashboardScreen: React.FC = () => {
  const { dashboardData, loading, error, refreshDashboard } = useMobileDashboard()

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>ข้อผิดพลาด: {error}</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshDashboard}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>หน้าหลัก</Text>
        <Text style={styles.subtitle}>
          วันนี้ {new Date().toLocaleDateString('th-TH')}
        </Text>
      </View>

      {dashboardData && (
        <>
          <NotificationBox data={dashboardData.notifications} />
          <ApprovalBox data={dashboardData.approvals} />
          <ScheduleBox data={dashboardData.schedule} />
          <QuickActions actions={dashboardData.quickActions} />
        </>
      )}
    </ScrollView>
  )
}
```

#### NotificationSettingsScreen
```tsx
// screens/NotificationSettingsScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, Switch, ScrollView } from 'react-native'
import { mobileApi } from '../api/mobile'

export const NotificationSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await mobileApi.getNotificationSettings()
      setSettings(response.data.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (path: string, value: boolean) => {
    try {
      const updatedSettings = { ...settings }
      // Update nested object based on path
      const pathArray = path.split('.')
      let current = updatedSettings
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]]
      }
      current[pathArray[pathArray.length - 1]] = value

      await mobileApi.updateNotificationSettings(updatedSettings)
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  if (!settings) return <Text>กำลังโหลด...</Text>

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>การตั้งค่าการแจ้งเตือน</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notifications</Text>
        
        <View style={styles.settingItem}>
          <Text>เปิดใช้งาน</Text>
          <Switch
            value={settings.pushNotifications.enabled}
            onValueChange={(value) => 
              updateSetting('pushNotifications.enabled', value)
            }
          />
        </View>

        {settings.pushNotifications.enabled && (
          <>
            <View style={styles.settingItem}>
              <Text>การแจ้งเตือนใหม่</Text>
              <Switch
                value={settings.pushNotifications.types.newNotification}
                onValueChange={(value) => 
                  updateSetting('pushNotifications.types.newNotification', value)
                }
              />
            </View>

            <View style={styles.settingItem}>
              <Text>การอนุมัติ</Text>
              <Switch
                value={settings.pushNotifications.types.approvalRequest}
                onValueChange={(value) => 
                  updateSetting('pushNotifications.types.approvalRequest', value)
                }
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  )
}
```

## Push Notification Integration

### Firebase Configuration
```typescript
// services/pushNotification.ts
import messaging from '@react-native-firebase/messaging'
import { mobileApi } from '../api/mobile'

export class PushNotificationService {
  static async requestPermission() {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      const token = await messaging().getToken()
      // ส่ง token ไปยัง backend
      await this.registerToken(token)
    }
  }

  static async registerToken(token: string) {
    try {
      await mobileApi.registerPushToken(token)
    } catch (error) {
      console.error('Error registering push token:', error)
    }
  }

  static setupNotificationHandler() {
    // Handle foreground notifications
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage)
      // แสดง notification ในแอพ
    })

    // Handle background/quit notifications
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage)
      // Navigate to specific screen
    })

    // Handle notification when app is closed
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage)
          // Navigate to specific screen
        }
      })
  }
}
```

## cURL Examples

### ดึงข้อมูล Dashboard
```bash
curl -X GET "http://localhost:3000/api/mobile/dashboard/boxes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ดึงปฏิทินเดือนมกราคม
```bash
curl -X GET "http://localhost:3000/api/mobile/dashboard/calendar?month=2024-01" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### อัปเดตการตั้งค่าการแจ้งเตือน
```bash
curl -X PUT "http://localhost:3000/api/mobile/settings/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pushNotifications": {
      "enabled": true,
      "types": {
        "newNotification": true,
        "approvalRequest": false
      }
    }
  }'
```

## Testing

### Unit Tests
```typescript
// __tests__/mobile.test.ts
import request from 'supertest'
import app from '../src/app'
import { createTestUser, getAuthToken } from './helpers'

describe('Mobile API', () => {
  describe('GET /api/mobile/dashboard/boxes', () => {
    it('should return dashboard data', async () => {
      const user = await createTestUser()
      const token = await getAuthToken(user)

      const response = await request(app)
        .get('/api/mobile/dashboard/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('notifications')
      expect(response.body.data).toHaveProperty('approvals')
      expect(response.body.data).toHaveProperty('schedule')
      expect(response.body.data).toHaveProperty('quickActions')
    })
  })

  describe('PUT /api/mobile/settings/notifications', () => {
    it('should update notification settings', async () => {
      const user = await createTestUser()
      const token = await getAuthToken(user)

      const settings = {
        pushNotifications: {
          enabled: false
        }
      }

      const response = await request(app)
        .put('/api/mobile/settings/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send(settings)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.pushNotifications.enabled).toBe(false)
    })
  })
})
```

## Performance Optimization

1. **Data Minimization**: ส่งเฉพาะข้อมูลที่จำเป็นสำหรับ mobile
2. **Caching**: Cache ข้อมูลที่เปลี่ยนแปลงไม่บ่อย
3. **Pagination**: ใช้ pagination สำหรับรายการยาว
4. **Compression**: เปิดใช้ gzip compression
5. **Background Sync**: ซิงค์ข้อมูลในพื้นหลัง

## Security Considerations

1. **Token Security**: เก็บ JWT token ใน secure storage
2. **API Rate Limiting**: จำกัดการเรียก API ต่อนาที
3. **Data Validation**: ตรวจสอบข้อมูลที่ส่งมาทุกครั้ง
4. **Push Token Management**: จัดการ push token อย่างปลอดภัย

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **Push Notification ไม่ทำงาน**
   - ตรวจสอบ Firebase configuration
   - ตรวจสอบ permissions ของแอพ
   - ตรวจสอบ token registration

2. **ข้อมูล Dashboard ไม่อัปเดต**
   - ตรวจสอบ network connection
   - ลอง pull-to-refresh
   - ตรวจสอบ cache อาจหมดอายุ

3. **การตั้งค่าไม่บันทึก**
   - ตรวจสอบ request format
   - ตรวจสอบ authentication token
   - ตรวจสอบ server logs
