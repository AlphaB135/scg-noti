# 📧 Notifications API

คู่มือการใช้งาน Notifications API สำหรับระบบ SCG Notification

## ภาพรวม

Notifications API ใช้สำหรับการจัดการการแจ้งเตือนในระบบ รวมถึงการสร้าง, อ่าน, แก้ไข, และลบการแจ้งเตือน พร้อมระบบการส่งไปยังผู้รับที่กำหนด

## Base URL
```
/api/notifications
```

## Authentication
ทุก endpoint ต้องการ JWT token:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. รายการแจ้งเตือนทั้งหมด (List All Notifications)

**GET** `/api/notifications`

ดึงรายการแจ้งเตือนทั้งหมดในระบบ (สำหรับ Admin/SuperAdmin)

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | หน้าที่ต้องการ |
| `limit` | number | ❌ | 20 | จำนวนรายการต่อหน้า (1-100) |
| `status` | string | ❌ | all | สถานะ (`DRAFT`, `SCHEDULED`, `SENT`, `FAILED`) |
| `type` | string | ❌ | all | ประเภท (`SYSTEM`, `ANNOUNCEMENT`, `APPROVAL`, `REMINDER`) |
| `category` | string | ❌ | all | หมวดหมู่ (`urgent`, `info`, `warning`) |
| `search` | string | ❌ | - | ค้นหาจากชื่อเรื่องหรือข้อความ |
| `dateFrom` | string | ❌ | - | วันที่เริ่มต้น (ISO 8601) |
| `dateTo` | string | ❌ | - | วันที่สิ้นสุด (ISO 8601) |

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_123",
        "title": "การแจ้งเตือนระบบ",
        "message": "ระบบจะปิดปรับปรุงในวันที่ 31 พฤษภาคม 2025",
        "type": "SYSTEM",
        "category": "info",
        "status": "SENT",
        "priority": "HIGH",
        "scheduledAt": "2025-05-30T14:00:00.000Z",
        "sentAt": "2025-05-30T14:00:00.000Z",
        "createdAt": "2025-05-30T10:00:00.000Z",
        "updatedAt": "2025-05-30T14:00:00.000Z",
        "createdBy": "admin_123",
        "creator": {
          "id": "admin_123",
          "firstName": "Admin",
          "lastName": "User"
        },
        "recipients": {
          "total": 150,
          "sent": 148,
          "failed": 2,
          "read": 45
        },
        "metadata": {
          "channels": ["email", "line", "in-app"],
          "template": "system-maintenance"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 89,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

#### ตัวอย่างการใช้งาน
```bash
# ดึงรายการทั้งหมด
curl -X GET "http://localhost:3001/api/notifications" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# ค้นหาและกรอง
curl -X GET "http://localhost:3001/api/notifications?status=SENT&type=SYSTEM&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# ค้นหาตามข้อความ
curl -X GET "http://localhost:3001/api/notifications?search=ปิดระบบ" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 2. แจ้งเตือนของฉัน (My Notifications)

**GET** `/api/notifications/mine`

ดึงรายการแจ้งเตือนที่ผู้ใช้ปัจจุบันเป็นผู้รับ

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | หน้าที่ต้องการ |
| `limit` | number | ❌ | 20 | จำนวนรายการต่อหน้า |
| `isRead` | boolean | ❌ | all | สถานะการอ่าน |
| `type` | string | ❌ | all | ประเภทการแจ้งเตือน |

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_123",
        "title": "คำขออนุมัติใหม่",
        "message": "คุณมีคำขออนุมัติใหม่รออการพิจารณา",
        "type": "APPROVAL",
        "category": "urgent",
        "priority": "HIGH",
        "createdAt": "2025-05-30T10:00:00.000Z",
        "isRead": false,
        "readAt": null,
        "recipient": {
          "id": "recipient_456",
          "userId": "user_123",
          "groupId": null,
          "isRead": false,
          "readAt": null,
          "deliveryStatus": "DELIVERED",
          "deliveredAt": "2025-05-30T10:01:00.000Z"
        },
        "metadata": {
          "approvalId": "approval_789",
          "requestType": "leave",
          "urgency": "high"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 42,
      "itemsPerPage": 20,
      "hasNextPage": true
    },
    "summary": {
      "total": 42,
      "unread": 8,
      "urgent": 2
    }
  }
}
```

### 3. สร้างการแจ้งเตือนใหม่ (Create Notification)

**POST** `/api/notifications`

สร้างการแจ้งเตือนใหม่ (เฉพาะ Admin/SuperAdmin)

#### Request Body
```json
{
  "title": "หัวข้อการแจ้งเตือน",
  "message": "ข้อความการแจ้งเตือน",
  "type": "ANNOUNCEMENT",
  "category": "info",
  "priority": "MEDIUM",
  "scheduledAt": "2025-05-30T15:00:00.000Z",
  "recipients": {
    "users": ["user_123", "user_456"],
    "groups": ["team_789"],
    "departments": ["IT", "HR"],
    "roles": ["ADMIN"],
    "all": false
  },
  "channels": ["email", "line", "in-app"],
  "template": "general-announcement",
  "metadata": {
    "attachment": "https://cdn.scg.com/files/announcement.pdf",
    "autoDelete": false,
    "expiresAt": "2025-06-30T23:59:59.000Z"
  }
}
```

#### Response (201 - Created)
```json
{
  "success": true,
  "data": {
    "id": "notification_new_123",
    "title": "หัวข้อการแจ้งเตือน",
    "message": "ข้อความการแจ้งเตือน",
    "type": "ANNOUNCEMENT",
    "category": "info",
    "priority": "MEDIUM",
    "status": "SCHEDULED",
    "scheduledAt": "2025-05-30T15:00:00.000Z",
    "createdAt": "2025-05-30T12:00:00.000Z",
    "createdBy": "admin_123",
    "recipients": {
      "total": 25,
      "breakdown": {
        "users": 2,
        "groups": 15,
        "departments": 8
      }
    }
  }
}
```

#### ตัวอย่างการใช้งาน
```bash
curl -X POST "http://localhost:3001/api/notifications" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ประกาศปิดระบบ",
    "message": "ระบบจะปิดปรับปรุงในวันที่ 31 พฤษภาคม 2025 เวลา 20:00-22:00 น.",
    "type": "SYSTEM",
    "category": "warning",
    "priority": "HIGH",
    "scheduledAt": "2025-05-30T15:00:00.000Z",
    "recipients": {
      "all": true
    },
    "channels": ["email", "line", "in-app"]
  }'
```

### 4. ดูรายละเอียดการแจ้งเตือน (Get Notification Details)

**GET** `/api/notifications/:id`

ดึงรายละเอียดของการแจ้งเตือนแต่ละรายการ

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "notification_123",
    "title": "การแจ้งเตือนระบบ",
    "message": "ระบบจะปิดปรับปรุงในวันที่ 31 พฤษภาคม 2025",
    "type": "SYSTEM",
    "category": "warning",
    "priority": "HIGH",
    "status": "SENT",
    "scheduledAt": "2025-05-30T14:00:00.000Z",
    "sentAt": "2025-05-30T14:00:00.000Z",
    "createdAt": "2025-05-30T10:00:00.000Z",
    "updatedAt": "2025-05-30T14:00:00.000Z",
    "createdBy": "admin_123",
    "creator": {
      "id": "admin_123",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@scg.com"
    },
    "recipients": [
      {
        "id": "recipient_456",
        "user": {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@scg.com"
        },
        "isRead": true,
        "readAt": "2025-05-30T14:15:00.000Z",
        "deliveryStatus": "DELIVERED",
        "deliveredAt": "2025-05-30T14:01:00.000Z"
      }
    ],
    "statistics": {
      "totalRecipients": 150,
      "delivered": 148,
      "failed": 2,
      "read": 45,
      "deliveryRate": 98.67,
      "readRate": 30.41
    },
    "metadata": {
      "channels": ["email", "line", "in-app"],
      "template": "system-maintenance",
      "attachment": "https://cdn.scg.com/files/maintenance-notice.pdf"
    }
  }
}
```

### 5. แก้ไขการแจ้งเตือน (Update Notification)

**PUT** `/api/notifications/:id`

แก้ไขการแจ้งเตือน (เฉพาะ Admin/SuperAdmin และเฉพาะสถานะ DRAFT หรือ SCHEDULED)

#### Request Body
```json
{
  "title": "หัวข้อใหม่",
  "message": "ข้อความใหม่",
  "priority": "HIGH",
  "scheduledAt": "2025-05-30T16:00:00.000Z",
  "metadata": {
    "updated": true
  }
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "notification_123",
    "title": "หัวข้อใหม่",
    "message": "ข้อความใหม่",
    "priority": "HIGH",
    "scheduledAt": "2025-05-30T16:00:00.000Z",
    "updatedAt": "2025-05-30T13:00:00.000Z"
  }
}
```

### 6. อัปเดตสถานะการแจ้งเตือน (Update Status)

**PATCH** `/api/notifications/:id`

เปลี่ยนสถานะของการแจ้งเตือน

#### Request Body
```json
{
  "status": "CANCELLED",
  "reason": "ยกเลิกเนื่องจากเปลี่ยนแปลงแผน"
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "notification_123",
    "status": "CANCELLED",
    "cancelledAt": "2025-05-30T13:30:00.000Z",
    "cancelReason": "ยกเลิกเนื่องจากเปลี่ยนแปลงแผน"
  }
}
```

### 7. กำหนดเวลาใหม่ (Reschedule)

**POST** `/api/notifications/:id/reschedule`

กำหนดเวลาส่งใหม่สำหรับการแจ้งเตือน

#### Request Body
```json
{
  "scheduledAt": "2025-05-31T09:00:00.000Z",
  "reason": "เลื่อนเวลาเนื่องจากวันหยุด"
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "notification_123",
    "scheduledAt": "2025-05-31T09:00:00.000Z",
    "previousScheduledAt": "2025-05-30T15:00:00.000Z",
    "rescheduledAt": "2025-05-30T14:00:00.000Z",
    "rescheduleReason": "เลื่อนเวลาเนื่องจากวันหยุด"
  }
}
```

### 8. ลบการแจ้งเตือน (Delete Notification)

**DELETE** `/api/notifications/:id`

ลบการแจ้งเตือน (เฉพาะ Admin/SuperAdmin และเฉพาะสถานะ DRAFT)

#### Response (200 - Success)
```json
{
  "success": true,
  "message": "การแจ้งเตือนถูกลบแล้ว"
}
```

### 9. ทำเครื่องหมายว่าอ่านแล้ว (Mark as Read)

**POST** `/api/notifications/:id/read`

ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "notification_123",
    "isRead": true,
    "readAt": "2025-05-30T15:30:00.000Z"
  }
}
```

### 10. ทำเครื่องหมายหลายรายการว่าอ่านแล้ว (Bulk Mark as Read)

**POST** `/api/notifications/bulk-read`

ทำเครื่องหมายการแจ้งเตือนหลายรายการว่าอ่านแล้ว

#### Request Body
```json
{
  "notificationIds": ["notification_123", "notification_456", "notification_789"]
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "results": [
      {
        "id": "notification_123",
        "success": true,
        "readAt": "2025-05-30T15:30:00.000Z"
      },
      {
        "id": "notification_456",
        "success": true,
        "readAt": "2025-05-30T15:30:00.000Z"
      },
      {
        "id": "notification_789",
        "success": true,
        "readAt": "2025-05-30T15:30:00.000Z"
      }
    ]
  }
}
```

## Data Models

### Notification Object
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'ANNOUNCEMENT' | 'APPROVAL' | 'REMINDER';
  category: 'urgent' | 'info' | 'warning' | 'success';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}
```

### Recipient Object
```typescript
interface Recipient {
  id: string;
  notificationId: string;
  userId?: string;
  groupId?: string;
  email?: string;
  isRead: boolean;
  readAt?: Date;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  deliveredAt?: Date;
  failureReason?: string;
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOTIFICATION_NOT_FOUND` | 404 | ไม่พบการแจ้งเตือน |
| `INSUFFICIENT_PERMISSIONS` | 403 | ไม่มีสิทธิ์เข้าถึง |
| `INVALID_STATUS_TRANSITION` | 400 | การเปลี่ยนสถานะไม่ถูกต้อง |
| `CANNOT_EDIT_SENT` | 400 | ไม่สามารถแก้ไขการแจ้งเตือนที่ส่งแล้ว |
| `INVALID_RECIPIENTS` | 400 | ผู้รับไม่ถูกต้อง |
| `SCHEDULED_TIME_PAST` | 400 | เวลาที่กำหนดผ่านไปแล้ว |
| `TITLE_REQUIRED` | 400 | ต้องระบุหัวข้อ |
| `MESSAGE_REQUIRED` | 400 | ต้องระบุข้อความ |

## Frontend Integration

### React Hook Example

```typescript
// hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { notificationApi } from '../lib/api/notifications';

interface UseNotificationsOptions {
  type?: string;
  status?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false
  });

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const response = await notificationApi.getMyNotifications({
        page,
        type: options.type,
        status: options.status
      });
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.isRead)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await notificationApi.bulkMarkAsRead(unreadIds);
        
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            isRead: true, 
            readAt: new Date() 
          }))
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto refresh if enabled
    if (options.autoRefresh) {
      const interval = setInterval(fetchNotifications, 
        options.refreshInterval || 30000);
      return () => clearInterval(interval);
    }
  }, [options.type, options.status]);

  return {
    notifications,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refetch: () => fetchNotifications(pagination.currentPage)
  };
};
```

### Notification Component

```typescript
// components/NotificationCard.tsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface NotificationCardProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg ${
        notification.isRead ? 'bg-gray-50' : 'bg-white border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {getCategoryIcon(notification.category)}
            </span>
            <h3 className={`font-semibold ${
              notification.isRead ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs text-white rounded ${
                getPriorityColor(notification.priority)
              }`}
            >
              {notification.priority}
            </span>
          </div>
          
          <p className={`text-sm mb-3 ${
            notification.isRead ? 'text-gray-600' : 'text-gray-800'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: th
              })}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded">
              {notification.type}
            </span>
            {notification.isRead && (
              <span className="text-green-600">
                ✓ อ่านแล้ว
              </span>
            )}
          </div>
        </div>
        
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            ทำเครื่องหมายว่าอ่านแล้ว
          </button>
        )}
      </div>
    </div>
  );
};
```

## Testing

### Unit Tests
```bash
npm test -- notification.spec.ts
```

### Integration Tests
```bash
npm run test:integration -- notifications
```

### Manual Testing
```bash
# Get my notifications
curl -X GET "http://localhost:3001/api/notifications/mine" \
  -H "Authorization: Bearer <token>"

# Create notification (Admin only)
curl -X POST "http://localhost:3001/api/notifications" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test message",
    "type": "ANNOUNCEMENT",
    "recipients": {"all": true}
  }'

# Mark as read
curl -X POST "http://localhost:3001/api/notifications/123/read" \
  -H "Authorization: Bearer <token>"
```

---

*เอกสารนี้อัปเดตล่าสุด: 30 พฤษภาคม 2025*