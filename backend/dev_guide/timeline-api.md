# 🕒 Timeline API

คู่มือการใช้งาน Timeline API สำหรับระบบ SCG Notification

## ภาพรวม

Timeline API เป็น RESTful API ที่รวบรวมข้อมูล Notification และ Approval events ของผู้ใช้ที่ล็อกอินอยู่ โดยแสดงเป็น timeline เรียงตามเวลาล่าสุด พร้อมด้วยระบบ pagination และการกรองข้อมูลตามประเภท

## คุณสมบัติหลัก

- ✅ **รวมข้อมูลจากหลายแหล่ง**: Notifications, Approvals, Security Logs
- ✅ **Cursor-based Pagination**: เลื่อนดูข้อมูลได้อย่างราบรื่น
- ✅ **การกรองตามประเภท**: สามารถกรองดู event แต่ละประเภทได้
- ✅ **Authentication**: ต้องล็อกอินก่อนใช้งาน
- ✅ **Performance Optimized**: ใช้ composite indexes สำหรับ query ที่รวดเร็ว

## Base URL
```
/api/timeline
```

## Authentication
API ต้องการ JWT token ในการเข้าถึง:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. ดึงข้อมูล Timeline (Get Timeline)

**GET** `/api/timeline`

ดึงรายการ events ของผู้ใช้ปัจจุบันเรียงตามเวลาล่าสุด

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | ❌ | 20 | จำนวน items ต่อหน้า (1-100) |
| `cursor` | string | ❌ | - | Cursor สำหรับหน้าถัดไป (base64 encoded) |
| `type` | string | ❌ | all | ประเภทของ event (`all`, `notification`, `approval`, `security`) |

#### Response (200 - Success)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notification_123",
        "type": "notification",
        "title": "การแจ้งเตือนใหม่",
        "message": "คุณได้รับการแจ้งเตือนจากระบบ",
        "status": "SENT",
        "createdAt": "2025-05-30T10:30:00.000Z",
        "metadata": {
          "notificationId": "notification_123",
          "category": "system",
          "priority": "high",
          "isRead": false,
          "creator": {
            "firstName": "Admin",
            "lastName": "User"
          }
        }
      },
      {
        "id": "approval_456",
        "type": "approval",
        "title": "Approval: คำขออนุมัติใหม่",
        "message": "มีคำขออนุมัติรออการพิจารณา",
        "status": "APPROVED",
        "createdAt": "2025-05-30T09:15:00.000Z",
        "metadata": {
          "approvalId": "approval_456",
          "notificationTitle": "คำขออนุมัติงบประมาณ",
          "response": "APPROVED",
          "comment": "อนุมัติแล้ว"
        }
      }
    ],
    "pagination": {
      "hasNextPage": true,
      "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI1LTA1LTMwVDA5OjE1OjAwLjAwMFoiLCJpZCI6ImFwcHJvdmFsXzQ1NiJ9"
    }
  }
}
```

#### Response (400 - Validation Error)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid limit parameter",
    "details": {
      "field": "limit",
      "value": 150,
      "constraint": "Must be between 1 and 100"
    }
  }
}
```

#### Response (401 - Unauthorized)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token"
  }
}
```

## ตัวอย่างการใช้งาน

### 1. ดึงข้อมูล Timeline พื้นฐาน

```bash
curl -X GET "http://localhost:3001/api/timeline" \
  -H "Authorization: Bearer your_jwt_token"
```

### 2. กำหนดจำนวน items ต่อหน้า

```bash
curl -X GET "http://localhost:3001/api/timeline?limit=10" \
  -H "Authorization: Bearer your_jwt_token"
```

### 3. ดึงหน้าถัดไป (Pagination)

```bash
curl -X GET "http://localhost:3001/api/timeline?cursor=eyJjcmVhdGVkQXQiOiIyMDI1LTA1LTMwVDA5OjE1OjAwLjAwMFoiLCJpZCI6ImFwcHJvdmFsXzQ1NiJ9" \
  -H "Authorization: Bearer your_jwt_token"
```

### 4. กรองตามประเภท - เฉพาะ Notifications

```bash
curl -X GET "http://localhost:3001/api/timeline?type=notification" \
  -H "Authorization: Bearer your_jwt_token"
```

### 5. กรองตามประเภท - เฉพาะ Approvals

```bash
curl -X GET "http://localhost:3001/api/timeline?type=approval" \
  -H "Authorization: Bearer your_jwt_token"
```

### 6. รวมหลาย parameters

```bash
curl -X GET "http://localhost:3001/api/timeline?type=notification&limit=5&cursor=abc123" \
  -H "Authorization: Bearer your_jwt_token"
```

## ประเภทของ Timeline Items

### 1. Notification Items

```json
{
  "id": "notification_123",
  "type": "notification",
  "title": "การแจ้งเตือนใหม่",
  "message": "คุณได้รับการแจ้งเตือนจากระบบ",
  "status": "SENT",
  "createdAt": "2025-05-30T10:30:00.000Z",
  "metadata": {
    "notificationId": "notification_123",
    "category": "system",
    "priority": "high",
    "isRead": false,
    "creator": {
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

### 2. Approval Items

```json
{
  "id": "approval_456",
  "type": "approval",
  "title": "Approval: คำขออนุมัติใหม่",
  "message": "มีคำขออนุมัติรออการพิจารณา",
  "status": "APPROVED",
  "createdAt": "2025-05-30T09:15:00.000Z",
  "metadata": {
    "approvalId": "approval_456",
    "notificationTitle": "คำขออนุมัติงบประมาณ",
    "response": "APPROVED",
    "comment": "อนุมัติแล้ว"
  }
}
```

### 3. Security Log Items (ในอนาคต)

```json
{
  "id": "security_789",
  "type": "security",
  "title": "กิจกรรมด้านความปลอดภัย",
  "message": "มีการเข้าสู่ระบบจากอุปกรณ์ใหม่",
  "status": "INFO",
  "createdAt": "2025-05-30T08:45:00.000Z",
  "metadata": {
    "logId": "security_789",
    "action": "login",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## Cursor Pagination

### วิธีการทำงาน

Timeline API ใช้ Cursor-based pagination เพื่อความเสถียรของข้อมูล:

1. **Cursor Format**: base64 encoded JSON object
2. **Cursor Content**: `{createdAt: ISO_STRING, id: string}`
3. **Sort Order**: createdAt DESC, id DESC

### ตัวอย่าง Cursor

```javascript
// Original cursor data
const cursorData = {
  createdAt: "2025-05-30T09:15:00.000Z",
  id: "approval_456"
};

// Base64 encoded cursor
const cursor = btoa(JSON.stringify(cursorData));
// Result: "eyJjcmVhdGVkQXQiOiIyMDI1LTA1LTMwVDA5OjE1OjAwLjAwMFoiLCJpZCI6ImFwcHJvdmFsXzQ1NiJ9"
```

### การใช้งาน Cursor

```typescript
// Client-side cursor handling
const handleNextPage = async (nextCursor: string) => {
  const response = await fetch(`/api/timeline?cursor=${nextCursor}`);
  const data = await response.json();
  
  if (data.success) {
    // Append new items to existing list
    setItems(prev => [...prev, ...data.data.items]);
    
    // Update cursor for next request
    setNextCursor(data.data.pagination.nextCursor);
    setHasMore(data.data.pagination.hasNextPage);
  }
};
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| `UNAUTHORIZED` | 401 | ไม่ได้รับการอนุญาตหรือ token ไม่ถูกต้อง |
| `FORBIDDEN` | 403 | ไม่มีสิทธิ์เข้าถึงข้อมูลนี้ |
| `INVALID_CURSOR` | 400 | Cursor ที่ส่งมาไม่ถูกต้อง |
| `INTERNAL_ERROR` | 500 | ข้อผิดพลาดภายในเซิร์ฟเวอร์ |

## การปรับแต่งและข้อจำกัด

### ข้อจำกัดการใช้งาน

- **Rate Limiting**: 100 requests ต่อนาที
- **Max Limit**: สูงสุด 100 items ต่อ request
- **Cursor Expiry**: Cursor จะหมดอายุใน 1 ชั่วโมง
- **Authentication**: ต้องมี valid JWT token

### Performance Tips

1. **ใช้ limit ที่เหมาะสม**: แนะนำ 20-50 items ต่อ request
2. **Cache ข้อมูล**: Cache ข้อมูลในฝั่ง client เพื่อลดการเรียก API
3. **กรองตามประเภท**: ใช้ type filter เมื่อต้องการข้อมูลเฉพาะประเภท
4. **Infinite Scrolling**: ใช้ cursor pagination สำหรับ infinite scroll

## Frontend Integration

### TypeScript/JavaScript

```typescript
import { timelineApi } from './lib/api/timeline';

// ดึงข้อมูล timeline แรก
const getInitialTimeline = async () => {
  try {
    const response = await timelineApi.getTimeline({
      limit: 20,
      type: 'all'
    });
    
    if (response.success) {
      console.log('Timeline items:', response.data.items);
      console.log('Has next page:', response.data.pagination.hasNextPage);
    }
  } catch (error) {
    console.error('Error fetching timeline:', error);
  }
};

// ดึงหน้าถัดไป
const getNextPage = async (cursor: string) => {
  try {
    const response = await timelineApi.getTimeline({
      cursor,
      limit: 20
    });
    
    if (response.success) {
      // Append ข้อมูลใหม่กับข้อมูลเก่า
      const newItems = response.data.items;
      return newItems;
    }
  } catch (error) {
    console.error('Error fetching next page:', error);
  }
};

// กรองตามประเภท
const filterByType = async (type: 'notification' | 'approval' | 'security') => {
  try {
    const response = await timelineApi.getTimeline({
      type,
      limit: 20
    });
    
    if (response.success) {
      console.log(`${type} items:`, response.data.items);
    }
  } catch (error) {
    console.error(`Error filtering by ${type}:`, error);
  }
};
```

### React Hook ตัวอย่าง

```typescript
import { useState, useEffect } from 'react';
import { timelineApi, TimelineItem } from '../lib/api/timeline';

export const useTimeline = (type: string = 'all') => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadTimeline = async (cursor?: string) => {
    setLoading(true);
    try {
      const response = await timelineApi.getTimeline({
        type,
        cursor,
        limit: 20
      });

      if (response.success) {
        if (cursor) {
          // Append for pagination
          setItems(prev => [...prev, ...response.data.items]);
        } else {
          // Replace for new filter
          setItems(response.data.items);
        }
        
        setHasNextPage(response.data.pagination.hasNextPage);
        setNextCursor(response.data.pagination.nextCursor || null);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextCursor && !loading) {
      loadTimeline(nextCursor);
    }
  };

  const refresh = () => {
    setItems([]);
    setNextCursor(null);
    loadTimeline();
  };

  useEffect(() => {
    refresh();
  }, [type]);

  return {
    items,
    loading,
    hasNextPage,
    loadMore,
    refresh
  };
};
```

### Timeline Component

```typescript
// components/Timeline.tsx
import React from 'react';
import { useTimeline } from '../hooks/useTimeline';
import { TimelineItem } from './TimelineItem';

interface TimelineProps {
  type?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ type = 'all' }) => {
  const { items, loading, hasNextPage, loadMore, refresh } = useTimeline(type);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Timeline</h2>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          รีเฟรช
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner">กำลังโหลด...</div>
        </div>
      )}

      {hasNextPage && !loading && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            โหลดเพิ่มเติม
          </button>
        </div>
      )}

      {!hasNextPage && items.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          ไม่มีข้อมูลเพิ่มเติม
        </div>
      )}
    </div>
  );
};
```

### API Helper

```typescript
// lib/api/timeline.ts
import axios from 'axios';

export interface TimelineItem {
  id: string;
  type: 'notification' | 'approval' | 'security';
  title: string;
  message?: string;
  status: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface TimelineResponse {
  success: boolean;
  data: {
    items: TimelineItem[];
    pagination: {
      hasNextPage: boolean;
      nextCursor?: string;
    };
  };
}

export interface TimelineParams {
  limit?: number;
  cursor?: string;
  type?: string;
}

class TimelineApi {
  async getTimeline(params: TimelineParams = {}): Promise<TimelineResponse> {
    const response = await axios.get('/api/timeline', { params });
    return response.data;
  }
}

export const timelineApi = new TimelineApi();
```

## การทดสอบ API

### ใช้ curl

```bash
# ทดสอบการเข้าถึงพื้นฐาน
curl -X GET "http://localhost:3001/api/timeline" \
  -H "Authorization: Bearer test_token_123"

# ทดสอบ pagination
curl -X GET "http://localhost:3001/api/timeline?limit=5" \
  -H "Authorization: Bearer test_token_123"

# ทดสอบ filtering
curl -X GET "http://localhost:3001/api/timeline?type=notification" \
  -H "Authorization: Bearer test_token_123"
```

### ใช้ Postman

1. สร้าง Collection ใหม่ชื่อ "Timeline API"
2. เพิ่ม Environment variables:
   - `base_url`: `http://localhost:3001`
   - `auth_token`: `test_token_123`
3. สร้าง Request:
   - Method: GET
   - URL: `{{base_url}}/api/timeline`
   - Headers: `Authorization: Bearer {{auth_token}}`

## การแก้ไขปัญหาที่พบบ่อย

### 1. Authentication Error (401)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token"
  }
}
```

**วิธีแก้ไข:**
- ตรวจสอบ JWT token ให้ถูกต้อง
- ตรวจสอบ Authorization header format
- ตรวจสอบ token expiry

### 2. Invalid Cursor (400)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CURSOR",
    "message": "Invalid cursor format"
  }
}
```

**วิธีแก้ไข:**
- ใช้ cursor จาก response ก่อนหน้า
- ไม่แก้ไข cursor string
- ตรวจสอบ cursor ไม่หมดอายุ

### 3. Empty Results

**สาเหตุที่เป็นไปได้:**
- ผู้ใช้ไม่มีข้อมูลในระบบ
- การกรองทำให้ไม่มีผลลัพธ์
- ข้อมูลยังไม่ได้ sync

**วิธีตรวจสอบ:**
- ลองเปลี่ยน type filter
- ตรวจสอบข้อมูลในฐานข้อมูล
- ตรวจสอบ user permissions

## Database Optimization

### Composite Indexes

```sql
-- Notification Index
CREATE INDEX idx_notification_timeline 
ON Notification (createdBy, createdAt DESC, id DESC);

-- Additional index for recipients
CREATE INDEX idx_notification_recipients_timeline 
ON NotificationRecipient (userId, createdAt DESC, notificationId DESC);

-- Approval Index
CREATE INDEX idx_approval_timeline 
ON Approval (userId, createdAt DESC, id DESC);
```

### Query Performance

```typescript
// Optimized queries with proper indexing
const getNotifications = async (userId: string, cursor?: TimelineCursor, limit: number) => {
  const whereClause = {
    OR: [
      { createdBy: userId },
      {
        recipients: {
          some: { userId }
        }
      }
    ],
    // Cursor conditions for pagination
    ...(cursor && {
      OR: [
        { createdAt: { lt: cursor.createdAt } },
        {
          createdAt: cursor.createdAt,
          id: { lt: cursor.id }
        }
      ]
    })
  };

  return prisma.notification.findMany({
    where: whereClause,
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ],
    take: limit + 1
  });
};
```

## Testing

### Unit Tests
```bash
npm test -- timeline.spec.ts
```

### Integration Tests
```bash
npm run test:integration -- timeline
```

### Manual Testing
```bash
# Basic timeline
curl -X GET "http://localhost:3001/api/timeline" \
  -H "Authorization: Bearer <token>"

# With filters
curl -X GET "http://localhost:3001/api/timeline?type=notification&limit=10" \
  -H "Authorization: Bearer <token>"

# Pagination
curl -X GET "http://localhost:3001/api/timeline?cursor=eyJ..." \
  -H "Authorization: Bearer <token>"
```

---

*เอกสารนี้อัปเดตล่าสุด: 30 พฤษภาคม 2025*