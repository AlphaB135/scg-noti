# Dashboard API

API สำหรับแสดงข้อมูลสถิติและภาพรวมของระบบ SCG Notification ใน Dashboard ของ Admin รองรับการดูข้อมูลสรุป, กราฟแสดงแนวโน้ม, และกิจกรรมล่าสุด พร้อมระบบ Caching เพื่อประสิทธิภาพ

## เอกสารดูเพิ่มเติม
- [Authentication API](./auth-api.md) - การเข้าสู่ระบบและ Token management
- [Notifications API](./notification-api.md) - การจัดการการแจ้งเตือน
- [Approvals API](./approval-api.md) - การจัดการการอนุมัติ
- [Security Logs API](./security-logs-api.md) - การตรวจสอบ Security Logs

## Base URL
```
/api/dashboard
```

## Authentication & Authorization

ทุก endpoint ต้องการการ authentication และมีระบบควบคุมสิทธิ์ดังนี้:

- **ADMIN**: เข้าถึง Dashboard ได้ทั้งหมดในบริษัทเดียวกัน
- **SUPERADMIN**: เข้าถึง Dashboard ได้ทุกบริษัท

## Caching Strategy

API ใช้ Redis Cache เพื่อลดการ query ฐานข้อมูลและเพิ่มประสิทธิภาพ:

- **Overview Data**: Cache 5 นาที
- **Metrics Data**: Cache 15 นาที

## Endpoints

### 1. ข้อมูลภาพรวมระบบ

```http
GET /api/dashboard/overview
```

**Description**: ดึงข้อมูลสถิติภาพรวมของระบบ รวมถึงจำนวนการแจ้งเตือน, การอนุมัติ, ผู้ใช้, และกิจกรรมล่าสุด

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Response**:
```json
{
  "notifications": {
    "total": 1250,
    "pending": 45,
    "approved": 1150,
    "approvedPercentage": 92
  },
  "approvals": {
    "total": 890,
    "pending": 25,
    "completed": 850,
    "completedPercentage": 96
  },
  "users": {
    "total": 150,
    "active": 145,
    "activePercentage": 97
  },
  "recentActivity": [
    {
      "id": "log123",
      "action": "LOGIN",
      "userId": "user456",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "details": {
        "user": {
          "firstNameTh": "สมชาย",
          "lastNameTh": "ใจดี",
          "email": "somchai@scg.com"
        }
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "log124",
      "action": "NOTIFICATION_SENT",
      "userId": "user789",
      "details": {
        "notificationId": "notif456",
        "title": "ประชุมทีม Development",
        "recipientCount": 25
      },
      "createdAt": "2024-01-15T10:25:00.000Z"
    },
    {
      "id": "log125",
      "action": "APPROVAL_COMPLETED",
      "userId": "user333",
      "details": {
        "approvalId": "appr789",
        "response": "APPROVE",
        "completedBy": {
          "firstNameTh": "มานี",
          "lastNameTh": "ขยันงาน"
        }
      },
      "createdAt": "2024-01-15T10:20:00.000Z"
    }
  ]
}
```

### 2. ข้อมูลกราฟแสดงแนวโน้ม

```http
GET /api/dashboard/metrics
```

**Description**: ดึงข้อมูลสำหรับสร้างกราฟแสดงแนวโน้มการใช้งานระบบตามช่วงเวลา

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Query Parameters**:
```
?days=7    // จำนวนวันย้อนหลัง (default: 7, options: 7, 14, 30, 90)
```

**Response**:
```json
{
  "notifications": [
    {
      "date": "2024-01-09T00:00:00.000Z",
      "count": 35
    },
    {
      "date": "2024-01-10T00:00:00.000Z",
      "count": 42
    },
    {
      "date": "2024-01-11T00:00:00.000Z",
      "count": 28
    },
    {
      "date": "2024-01-12T00:00:00.000Z",
      "count": 51
    },
    {
      "date": "2024-01-13T00:00:00.000Z",
      "count": 33
    },
    {
      "date": "2024-01-14T00:00:00.000Z",
      "count": 46
    },
    {
      "date": "2024-01-15T00:00:00.000Z",
      "count": 39
    }
  ],
  "approvals": [
    {
      "date": "2024-01-09T00:00:00.000Z",
      "count": 12
    },
    {
      "date": "2024-01-10T00:00:00.000Z",
      "count": 18
    },
    {
      "date": "2024-01-11T00:00:00.000Z",
      "count": 8
    },
    {
      "date": "2024-01-12T00:00:00.000Z",
      "count": 25
    },
    {
      "date": "2024-01-13T00:00:00.000Z",
      "count": 15
    },
    {
      "date": "2024-01-14T00:00:00.000Z",
      "count": 22
    },
    {
      "date": "2024-01-15T00:00:00.000Z",
      "count": 19
    }
  ]
}
```

## Data Models

### OverviewData
```typescript
interface OverviewData {
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
  recentActivity: SecurityLog[]
}
```

### MetricsData
```typescript
interface MetricsData {
  notifications: DailyCount[]
  approvals: DailyCount[]
}

interface DailyCount {
  date: string
  count: number
}
```

### SecurityLog
```typescript
interface SecurityLog {
  id: string
  action: string
  userId: string
  ipAddress?: string
  userAgent?: string
  details: Record<string, any>
  createdAt: string
}
```

## Error Codes

| Status Code | Error Code | Message |
|-------------|------------|---------|
| 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ |
| 403 | `FORBIDDEN` | ไม่มีสิทธิ์เข้าถึง Dashboard |
| 400 | `INVALID_DAYS_PARAMETER` | พารามิเตอร์ days ไม่ถูกต้อง |
| 500 | `CACHE_ERROR` | ข้อผิดพลาดของระบบ Cache |
| 500 | `DATABASE_ERROR` | ข้อผิดพลาดในการดึงข้อมูล |

## Frontend Integration

### React Hook สำหรับ Dashboard

```typescript
// hooks/useDashboard.ts
import { useState, useEffect } from 'react'
import { OverviewData, MetricsData } from '../types/dashboard'
import { dashboardApi } from '../api/dashboard'

export function useDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getOverview()
      setOverview(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async (days: number = 7) => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getMetrics(days)
      setMetrics(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async (days: number = 7) => {
    await Promise.all([
      fetchOverview(),
      fetchMetrics(days)
    ])
  }

  useEffect(() => {
    refreshData()
  }, [])

  return {
    overview,
    metrics,
    loading,
    error,
    fetchOverview,
    fetchMetrics,
    refreshData
  }
}
```

### API Service

```typescript
// api/dashboard.ts
import axios from 'axios'
import { OverviewData, MetricsData } from '../types/dashboard'

const API_BASE = '/api/dashboard'

export const dashboardApi = {
  // ดึงข้อมูลภาพรวม
  getOverview: () =>
    axios.get<OverviewData>(`${API_BASE}/overview`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // ดึงข้อมูล Metrics
  getMetrics: (days: number = 7) =>
    axios.get<MetricsData>(`${API_BASE}/metrics?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
}
```

### React Components

#### Dashboard Component
```tsx
// components/Dashboard.tsx
import React, { useState } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import { StatsCard } from './StatsCard'
import { MetricsChart } from './MetricsChart'
import { RecentActivity } from './RecentActivity'

export const Dashboard: React.FC = () => {
  const { overview, metrics, loading, error, refreshData } = useDashboard()
  const [selectedDays, setSelectedDays] = useState(7)

  const handleDaysChange = (days: number) => {
    setSelectedDays(days)
    refreshData(days)
  }

  if (loading && !overview) {
    return <div className="loading">กำลังโหลดข้อมูล Dashboard...</div>
  }

  if (error) {
    return <div className="error">ข้อผิดพลาด: {error}</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button 
          onClick={() => refreshData(selectedDays)}
          className="refresh-button"
          disabled={loading}
        >
          🔄 รีเฟรช
        </button>
      </div>

      {overview && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              title="การแจ้งเตือน"
              icon="📨"
              stats={[
                { label: 'ทั้งหมด', value: overview.notifications.total },
                { label: 'รออนุมัติ', value: overview.notifications.pending },
                { label: 'อนุมัติแล้ว', value: overview.notifications.approved },
                { label: 'อัตราอนุมัติ', value: `${overview.notifications.approvedPercentage}%` }
              ]}
              primaryStat={overview.notifications.approved}
              primaryLabel="อนุมัติแล้ว"
            />

            <StatsCard
              title="การอนุมัติ"
              icon="✅"
              stats={[
                { label: 'ทั้งหมด', value: overview.approvals.total },
                { label: 'รอดำเนินการ', value: overview.approvals.pending },
                { label: 'เสร็จสิ้น', value: overview.approvals.completed },
                { label: 'อัตราเสร็จสิ้น', value: `${overview.approvals.completedPercentage}%` }
              ]}
              primaryStat={overview.approvals.completed}
              primaryLabel="เสร็จสิ้น"
            />

            <StatsCard
              title="ผู้ใช้งาน"
              icon="👥"
              stats={[
                { label: 'ทั้งหมด', value: overview.users.total },
                { label: 'ใช้งานอยู่', value: overview.users.active },
                { label: 'อัตราใช้งาน', value: `${overview.users.activePercentage}%` }
              ]}
              primaryStat={overview.users.active}
              primaryLabel="ใช้งานอยู่"
            />
          </div>

          {/* Metrics Chart */}
          {metrics && (
            <div className="metrics-section">
              <div className="metrics-header">
                <h2>แนวโน้มการใช้งาน</h2>
                <div className="time-selector">
                  {[7, 14, 30, 90].map(days => (
                    <button
                      key={days}
                      className={selectedDays === days ? 'active' : ''}
                      onClick={() => handleDaysChange(days)}
                    >
                      {days} วัน
                    </button>
                  ))}
                </div>
              </div>
              <MetricsChart 
                data={metrics}
                days={selectedDays}
              />
            </div>
          )}

          {/* Recent Activity */}
          <div className="activity-section">
            <h2>กิจกรรมล่าสุด</h2>
            <RecentActivity activities={overview.recentActivity} />
          </div>
        </>
      )}
    </div>
  )
}
```

#### StatsCard Component
```tsx
// components/StatsCard.tsx
import React from 'react'

interface StatItem {
  label: string
  value: string | number
}

interface StatsCardProps {
  title: string
  icon: string
  stats: StatItem[]
  primaryStat: number
  primaryLabel: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  icon,
  stats,
  primaryStat,
  primaryLabel
}) => {
  return (
    <div className="stats-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      
      <div className="primary-stat">
        <div className="stat-number">{primaryStat.toLocaleString()}</div>
        <div className="stat-label">{primaryLabel}</div>
      </div>

      <div className="stats-details">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### MetricsChart Component
```tsx
// components/MetricsChart.tsx
import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { MetricsData } from '../types/dashboard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface MetricsChartProps {
  data: MetricsData
  days: number
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, days }) => {
  const chartData = {
    labels: data.notifications.map(item => 
      new Date(item.date).toLocaleDateString('th-TH', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    datasets: [
      {
        label: 'การแจ้งเตือน',
        data: data.notifications.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'การอนุมัติ',
        data: data.approvals.map(item => item.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `แนวโน้มการใช้งานใน ${days} วันที่ผ่านมา`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="metrics-chart">
      <Line data={chartData} options={options} />
    </div>
  )
}
```

#### RecentActivity Component
```tsx
// components/RecentActivity.tsx
import React from 'react'
import { SecurityLog } from '../types/dashboard'

interface RecentActivityProps {
  activities: SecurityLog[]
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN': return '🔑'
      case 'LOGOUT': return '🚪'
      case 'NOTIFICATION_SENT': return '📨'
      case 'APPROVAL_COMPLETED': return '✅'
      case 'USER_CREATED': return '👤'
      default: return '📋'
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'เข้าสู่ระบบ'
      case 'LOGOUT': return 'ออกจากระบบ'
      case 'NOTIFICATION_SENT': return 'ส่งการแจ้งเตือน'
      case 'APPROVAL_COMPLETED': return 'อนุมัติเสร็จสิ้น'
      case 'USER_CREATED': return 'สร้างผู้ใช้ใหม่'
      default: return action
    }
  }

  return (
    <div className="recent-activity">
      {activities.length === 0 ? (
        <div className="no-activity">ไม่มีกิจกรรมล่าสุด</div>
      ) : (
        <div className="activity-list">
          {activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActionIcon(activity.action)}
              </div>
              
              <div className="activity-content">
                <div className="activity-header">
                  <span className="activity-action">
                    {getActionText(activity.action)}
                  </span>
                  <span className="activity-time">
                    {new Date(activity.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
                
                <div className="activity-details">
                  {activity.details?.user && (
                    <span className="user-info">
                      โดย {activity.details.user.firstNameTh} {activity.details.user.lastNameTh}
                    </span>
                  )}
                  
                  {activity.details?.notificationId && (
                    <span className="notification-info">
                      "{activity.details.title}" ส่งให้ {activity.details.recipientCount} คน
                    </span>
                  )}
                  
                  {activity.details?.approvalId && (
                    <span className="approval-info">
                      อนุมัติโดย {activity.details.completedBy?.firstNameTh} {activity.details.completedBy?.lastNameTh}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## cURL Examples

### ดึงข้อมูลภาพรวม
```bash
curl -X GET "http://localhost:3000/api/dashboard/overview" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ดึงข้อมูล Metrics (7 วัน)
```bash
curl -X GET "http://localhost:3000/api/dashboard/metrics?days=7" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ดึงข้อมูล Metrics (30 วัน)
```bash
curl -X GET "http://localhost:3000/api/dashboard/metrics?days=30" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing

### Unit Tests
```typescript
// __tests__/dashboard.test.ts
import request from 'supertest'
import app from '../src/app'
import { createTestUser, getAuthToken } from './helpers'

describe('Dashboard API', () => {
  describe('GET /api/dashboard/overview', () => {
    it('should return overview data for admin', async () => {
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      const response = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('notifications')
      expect(response.body).toHaveProperty('approvals')
      expect(response.body).toHaveProperty('users')
      expect(response.body).toHaveProperty('recentActivity')
      
      expect(response.body.notifications).toHaveProperty('total')
      expect(response.body.notifications).toHaveProperty('pending')
      expect(response.body.notifications).toHaveProperty('approved')
      expect(response.body.notifications).toHaveProperty('approvedPercentage')
    })

    it('should return 403 for regular user', async () => {
      const user = await createTestUser({ role: 'EMPLOYEE' })
      const token = await getAuthToken(user)

      await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    })
  })

  describe('GET /api/dashboard/metrics', () => {
    it('should return metrics data with default 7 days', async () => {
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('notifications')
      expect(response.body).toHaveProperty('approvals')
      expect(Array.isArray(response.body.notifications)).toBe(true)
      expect(Array.isArray(response.body.approvals)).toBe(true)
    })

    it('should return metrics data for custom days', async () => {
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      const response = await request(app)
        .get('/api/dashboard/metrics?days=30')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('notifications')
      expect(response.body).toHaveProperty('approvals')
    })
  })
})
```

## Performance Optimization

1. **Redis Caching**: ใช้ Cache สำหรับข้อมูลที่เปลี่ยนแปลงไม่บ่อย
2. **Database Aggregation**: ใช้ `groupBy` และ `count` เพื่อลดข้อมูลที่ต้อง process
3. **Parallel Queries**: ใช้ `Promise.all` เพื่อ query ข้อมูลแบบ parallel
4. **Selective Data**: ดึงเฉพาะข้อมูลที่จำเป็นสำหรับ Dashboard

## Security Considerations

1. **Admin Only Access**: ควบคุมให้เฉพาะ Admin เท่านั้นที่เข้าถึงได้
2. **Company Data Isolation**: แยกข้อมูลตาม Company Code
3. **Sensitive Data Filtering**: ไม่แสดงข้อมูลละเอียดอ่อนใน Dashboard
4. **Rate Limiting**: จำกัดการเรียก API เพื่อป้องกัน abuse

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **ข้อมูลไม่อัปเดต**
   - ตรวจสอบระบบ Cache (Redis)
   - ลองรีเฟรชข้อมูลใหม่
   - ตรวจสอบ Cache TTL

2. **กราฟไม่แสดงข้อมูล**
   - ตรวจสอบพารามิเตอร์ days
   - ตรวจสอบข้อมูลในฐานข้อมูล
   - ตรวจสอบ date format

3. **ข้อมูลไม่ถูกต้อง**
   - ตรวจสอบ query conditions
   - ตรวจสอบการคำนวณ percentage
   - ตรวจสอบข้อมูลใน database
