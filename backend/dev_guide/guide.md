# คู่มือการใช้งาน Timeline API - ระบบ SCG Notification

## ภาพรวม

Timeline API เป็น RESTful API ที่รวบรวมข้อมูล Notification และ Approval events ของผู้ใช้ที่ล็อกอินอยู่ โดยแสดงเป็น timeline เรียงตามเวลาล่าสุด พร้อมด้วยระบบ pagination และการกรองข้อมูลตามประเภท

## คุณสมบัติหลัก

- ✅ **รวมข้อมูลจากหลายแหล่ง**: Notifications, Approvals, Security Logs
- ✅ **Cursor-based Pagination**: เลื่อนดูข้อมูลได้อย่างราบรื่น
- ✅ **การกรองตามประเภท**: สามารถกรองดู event แต่ละประเภทได้
- ✅ **Authentication**: ต้องล็อกอินก่อนใช้งาน
- ✅ **Performance Optimized**: ใช้ composite indexes สำหรับ query ที่รวดเร็ว

## API Endpoint

```
GET /api/timeline
```

## Authentication

API ต้องการ JWT token ในการเข้าถึง:

```typescript
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | ❌ | 20 | จำนวน items ต่อหน้า (1-100) |
| `cursor` | string | ❌ | - | Cursor สำหรับหน้าถัดไป (base64 encoded) |
| `type` | string | ❌ | all | ประเภทของ event (`all`, `notification`, `approval`, `security`) |

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "string",
        "type": "notification" | "approval" | "security",
        "title": "string",
        "message": "string",
        "createdAt": "2025-05-29T10:30:00.000Z",
        "metadata": {
          // ข้อมูลเฉพาะแต่ละประเภท
        }
      }
    ],
    "pagination": {
      "hasNextPage": true,
      "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI1LTA1LTI5VDEwOjMwOjAwLjAwMFoiLCJpZCI6IjEyMyJ9"
    }
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid limit parameter"
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
curl -X GET "http://localhost:3001/api/timeline?cursor=eyJjcmVhdGVkQXQiOiIyMDI1LTA1LTI5VDEwOjMwOjAwLjAwMFoiLCJpZCI6IjEyMyJ9" \
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

## ตัวอย่างการใช้งานใน Frontend

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

## ประเภทของ Timeline Items

### 1. Notification Items

```json
{
  "id": "notification_123",
  "type": "notification",
  "title": "การแจ้งเตือนใหม่",
  "message": "คุณได้รับการแจ้งเตือนจากระบบ",
  "createdAt": "2025-05-29T10:30:00.000Z",
  "metadata": {
    "notificationId": "123",
    "category": "system",
    "priority": "high",
    "isRead": false
  }
}
```

### 2. Approval Items

```json
{
  "id": "approval_456",
  "type": "approval",
  "title": "คำขออนุมัติใหม่",
  "message": "มีคำขออนุมัติรออการพิจารณา",
  "createdAt": "2025-05-29T09:15:00.000Z",
  "metadata": {
    "approvalId": "456",
    "requestType": "leave",
    "status": "pending",
    "requesterId": "user_789"
  }
}
```

### 3. Security Log Items

```json
{
  "id": "security_789",
  "type": "security",
  "title": "กิจกรรมด้านความปลอดภัย",
  "message": "มีการเข้าสู่ระบบจากอุปกรณ์ใหม่",
  "createdAt": "2025-05-29T08:45:00.000Z",
  "metadata": {
    "logId": "789",
    "action": "login",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
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

## การ Deploy และ Monitoring

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/scg_noti"
JWT_SECRET="your_jwt_secret_key"

# Optional
REDIS_URL="redis://localhost:6379"
NODE_ENV="production"
PORT=3001
```

### Health Check

```bash
curl -X GET "http://localhost:3001/health"
```

### Monitoring Endpoints

- **Health**: `/health`
- **Metrics**: `/metrics` (ถ้ามี Prometheus)
- **Logs**: ดูใน console หรือ log files

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

## Version History

### v1.0.0 (Current)
- ✅ Basic timeline functionality
- ✅ Cursor-based pagination  
- ✅ Type filtering
- ✅ Authentication integration
- ✅ Performance optimization

### Planned Features
- 🔄 Real-time updates (WebSocket)
- 🔄 Advanced filtering (date range, status)
- 🔄 Bulk operations
- 🔄 Export functionality

---

## ติดต่อและสนับสนุน

หากมีคำถามหรือต้องการความช่วยเหลือ:
- 📧 Email: dev-team@scg.com
- 📝 Issue Tracker: [GitHub Issues](https://github.com/scg/notification-system/issues)
- 📚 Documentation: [Full API Docs](https://docs.scg.com/notification-api)

---

*เอกสารนี้อัปเดตล่าสุด: 29 พฤษภาคม 2025*