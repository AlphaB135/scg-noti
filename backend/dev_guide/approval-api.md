# ✅ Approvals API

คู่มือการใช้งาน Approvals API สำหรับระบบ SCG Notification

## ภาพรวม

Approvals API ใช้สำหรับการจัดการระบบการอนุมัติในการแจ้งเตือน ผู้ใช้สามารถอนุมัติ, ปฏิเสธ, หรือแสดงความเห็นต่อการแจ้งเตือนที่ต้องการการอนุมัติ

## Base URL
```
/api/notifications/:notificationId/approvals
```

## Authentication
ทุก endpoint ต้องการ JWT token:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. รายการการอนุมัติ (List Approvals)

**GET** `/api/notifications/:notificationId/approvals`

ดึงรายการการอนุมัติทั้งหมดของการแจ้งเตือน

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | ✅ | ID ของการแจ้งเตือน |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | ❌ | 1 | หน้าที่ต้องการ |
| `limit` | number | ❌ | 20 | จำนวนรายการต่อหน้า |
| `response` | string | ❌ | all | กรองตามการตอบกลับ (`APPROVED`, `REJECTED`, `PENDING`) |
| `userId` | string | ❌ | - | กรองตาม User ID |

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "approval_123",
        "notificationId": "notification_456",
        "userId": "user_789",
        "response": "APPROVED",
        "comment": "อนุมัติแล้ว เห็นด้วยกับข้อเสนอนี้",
        "respondedAt": "2025-05-30T14:30:00.000Z",
        "createdAt": "2025-05-30T10:00:00.000Z",
        "updatedAt": "2025-05-30T14:30:00.000Z",
        "user": {
          "id": "user_789",
          "firstName": "สมชาย",
          "lastName": "ใจดี",
          "email": "somchai@scg.com",
          "department": "IT",
          "position": "Manager"
        },
        "metadata": {
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "deviceInfo": "Desktop - Chrome"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 25,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "summary": {
      "total": 25,
      "approved": 18,
      "rejected": 3,
      "pending": 4,
      "approvalRate": 72.0,
      "rejectionRate": 12.0,
      "responseRate": 84.0
    }
  }
}
```

#### ตัวอย่างการใช้งาน
```bash
# ดึงรายการการอนุมัติทั้งหมด
curl -X GET "http://localhost:3001/api/notifications/456/approvals" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# กรองเฉพาะที่อนุมัติแล้ว
curl -X GET "http://localhost:3001/api/notifications/456/approvals?response=APPROVED" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# กรองตาม User
curl -X GET "http://localhost:3001/api/notifications/456/approvals?userId=user_789" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 2. สร้างการอนุมัติ (Create Approval)

**POST** `/api/notifications/:notificationId/approvals`

สร้างการตอบกลับการอนุมัติใหม่

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | ✅ | ID ของการแจ้งเตือน |

#### Request Body
```json
{
  "response": "APPROVED",
  "comment": "อนุมัติแล้ว เห็นด้วยกับข้อเสนอนี้"
}
```

#### Request Body Schema
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `response` | string | ✅ | การตอบกลับ (`APPROVED`, `REJECTED`) |
| `comment` | string | ❌ | ความเห็นเพิ่มเติม (สูงสุด 1000 ตัวอักษร) |

#### Response (201 - Created)
```json
{
  "success": true,
  "data": {
    "id": "approval_new_123",
    "notificationId": "notification_456",
    "userId": "user_789",
    "response": "APPROVED",
    "comment": "อนุมัติแล้ว เห็นด้วยกับข้อเสนอนี้",
    "respondedAt": "2025-05-30T15:00:00.000Z",
    "createdAt": "2025-05-30T15:00:00.000Z",
    "user": {
      "id": "user_789",
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "email": "somchai@scg.com"
    }
  }
}
```

#### Response (409 - Already Responded)
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_RESPONDED",
    "message": "คุณได้ตอบกลับการอนุมัตินี้แล้ว",
    "details": {
      "existingResponse": "APPROVED",
      "respondedAt": "2025-05-30T14:30:00.000Z"
    }
  }
}
```

#### ตัวอย่างการใช้งาน
```bash
# อนุมัติ
curl -X POST "http://localhost:3001/api/notifications/456/approvals" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "response": "APPROVED",
    "comment": "อนุมัติแล้ว เห็นด้วยกับข้อเสนอนี้"
  }'

# ปฏิเสธ
curl -X POST "http://localhost:3001/api/notifications/456/approvals" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "response": "REJECTED",
    "comment": "ไม่เห็นด้วยเนื่องจากงบประมาณไม่เพียงพอ"
  }'
```

### 3. แก้ไขการอนุมัติ (Update Approval)

**PUT** `/api/notifications/:notificationId/approvals/:approvalId`

แก้ไขการตอบกลับการอนุมัติ (ภายใน 24 ชั่วโมง)

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notificationId` | string | ✅ | ID ของการแจ้งเตือน |
| `approvalId` | string | ✅ | ID ของการอนุมัติ |

#### Request Body
```json
{
  "response": "REJECTED",
  "comment": "เปลี่ยนความเห็น ไม่เห็นด้วยหลังจากพิจารณาใหม่"
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "approval_123",
    "response": "REJECTED",
    "comment": "เปลี่ยนความเห็น ไม่เห็นด้วยหลังจากพิจารณาใหม่",
    "respondedAt": "2025-05-30T16:00:00.000Z",
    "updatedAt": "2025-05-30T16:00:00.000Z",
    "editHistory": [
      {
        "previousResponse": "APPROVED",
        "previousComment": "อนุมัติแล้ว เห็นด้วยกับข้อเสนอนี้",
        "changedAt": "2025-05-30T16:00:00.000Z"
      }
    ]
  }
}
```

### 4. ลบการอนุมัติ (Delete Approval)

**DELETE** `/api/notifications/:notificationId/approvals/:approvalId`

ลบการตอบกลับการอนุมัติ (เฉพาะเจ้าของหรือ Admin)

#### Response (200 - Success)
```json
{
  "success": true,
  "message": "การอนุมัติถูกลบแล้ว"
}
```

### 5. สถิติการอนุมัติ (Approval Metrics)

**GET** `/api/notifications/:notificationId/approvals/metrics`

ดึงสถิติการอนุมัติของการแจ้งเตือน

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "notificationId": "notification_456",
    "metrics": {
      "totalApprovers": 25,
      "totalResponses": 21,
      "pendingResponses": 4,
      "approved": 18,
      "rejected": 3,
      "approvalRate": 85.71,
      "rejectionRate": 14.29,
      "responseRate": 84.0,
      "averageResponseTime": "2h 30m",
      "fastestResponse": "5m",
      "slowestResponse": "8h 15m"
    },
    "breakdown": {
      "byDepartment": [
        {
          "department": "IT",
          "total": 8,
          "approved": 7,
          "rejected": 1,
          "pending": 0
        },
        {
          "department": "HR",
          "total": 6,
          "approved": 5,
          "rejected": 0,
          "pending": 1
        }
      ],
      "byRole": [
        {
          "role": "MANAGER",
          "total": 10,
          "approved": 9,
          "rejected": 1,
          "pending": 0
        },
        {
          "role": "USER",
          "total": 15,
          "approved": 9,
          "rejected": 2,
          "pending": 4
        }
      ]
    },
    "timeline": [
      {
        "date": "2025-05-30",
        "approved": 12,
        "rejected": 2,
        "pending": 11
      }
    ]
  }
}
```

### 6. การอนุมัติของฉัน (My Approvals)

**GET** `/api/approvals/mine`

ดึงรายการการอนุมัติทั้งหมดที่ผู้ใช้ปัจจุบันต้องตอบกลับ

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | ❌ | all | สถานะ (`pending`, `responded`, `all`) |
| `page` | number | ❌ | 1 | หน้าที่ต้องการ |
| `limit` | number | ❌ | 20 | จำนวนรายการต่อหน้า |

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "approval_123",
        "notification": {
          "id": "notification_456",
          "title": "คำขออนุมัติงบประมาณโครงการ AI",
          "message": "ขออนุมัติงบประมาณ 2,500,000 บาท สำหรับโครงการ AI",
          "type": "APPROVAL",
          "priority": "HIGH",
          "createdAt": "2025-05-30T10:00:00.000Z",
          "creator": {
            "firstName": "วิศวกร",
            "lastName": "โปรเจค",
            "department": "IT"
          }
        },
        "response": null,
        "comment": null,
        "respondedAt": null,
        "createdAt": "2025-05-30T10:00:00.000Z",
        "daysUntilExpiry": 5,
        "urgency": "HIGH"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 8,
      "itemsPerPage": 20
    },
    "summary": {
      "total": 8,
      "pending": 3,
      "approved": 4,
      "rejected": 1,
      "overdue": 0,
      "expiringToday": 1
    }
  }
}
```

## Data Models

### Approval Object
```typescript
interface Approval {
  id: string;
  notificationId: string;
  userId: string;
  response: 'APPROVED' | 'REJECTED' | null;
  comment?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
  };
}
```

### Approval Response
```typescript
type ApprovalResponse = 'APPROVED' | 'REJECTED';
```

### Approval Metrics
```typescript
interface ApprovalMetrics {
  totalApprovers: number;
  totalResponses: number;
  pendingResponses: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  rejectionRate: number;
  responseRate: number;
  averageResponseTime: string;
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOTIFICATION_NOT_FOUND` | 404 | ไม่พบการแจ้งเตือน |
| `APPROVAL_NOT_FOUND` | 404 | ไม่พบการอนุมัติ |
| `ALREADY_RESPONDED` | 409 | ตอบกลับแล้ว |
| `NOT_AUTHORIZED_APPROVER` | 403 | ไม่ใช่ผู้ที่มีสิทธิ์อนุมัติ |
| `INVALID_RESPONSE` | 400 | การตอบกลับไม่ถูกต้อง |
| `COMMENT_TOO_LONG` | 400 | ความเห็นยาวเกินไป |
| `EDIT_TIME_EXPIRED` | 400 | หมดเวลาแก้ไข |
| `APPROVAL_EXPIRED` | 400 | การอนุมัติหมดอายุแล้ว |

## Business Rules

### 1. การตอบกลับ
- ผู้ใช้สามารถตอบกลับได้เพียงครั้งเดียวต่อการแจ้งเตือน
- สามารถแก้ไขการตอบกลับได้ภายใน 24 ชั่วโมง
- การแก้ไขจะถูกบันทึกใน edit history

### 2. สิทธิ์การเข้าถึง
- ผู้ใช้ทั่วไป: ดูและตอบกลับเฉพาะที่ตนเองเป็นผู้อนุมัติ
- Admin: ดูการอนุมัติทั้งหมดในบริษัท
- SuperAdmin: ดูการอนุมัติทั้งหมดในระบบ

### 3. การหมดอายุ
- การอนุมัติมีระยะเวลา default 7 วัน
- สามารถกำหนดเวลาหมดอายุเฉพาะได้
- หลังหมดอายุจะไม่สามารถตอบกลับได้

## Frontend Integration

### React Hook Example

```typescript
// hooks/useApprovals.ts
import { useState, useEffect } from 'react';
import { approvalApi } from '../lib/api/approvals';

export const useApprovals = (notificationId?: string) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const fetchApprovals = async () => {
    if (!notificationId) return;
    
    setLoading(true);
    try {
      const [approvalsResponse, metricsResponse] = await Promise.all([
        approvalApi.getApprovals(notificationId),
        approvalApi.getMetrics(notificationId)
      ]);
      
      if (approvalsResponse.success) {
        setApprovals(approvalsResponse.data.approvals);
      }
      
      if (metricsResponse.success) {
        setMetrics(metricsResponse.data.metrics);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitApproval = async (response: string, comment?: string) => {
    try {
      const result = await approvalApi.createApproval(notificationId, {
        response,
        comment
      });
      
      if (result.success) {
        // Refresh data
        await fetchApprovals();
        return result.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateApproval = async (approvalId: string, response: string, comment?: string) => {
    try {
      const result = await approvalApi.updateApproval(notificationId, approvalId, {
        response,
        comment
      });
      
      if (result.success) {
        await fetchApprovals();
        return result.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [notificationId]);

  return {
    approvals,
    metrics,
    loading,
    error,
    submitApproval,
    updateApproval,
    refetch: fetchApprovals
  };
};
```

### Approval Component

```typescript
// components/ApprovalForm.tsx
import React, { useState } from 'react';

interface ApprovalFormProps {
  notificationId: string;
  onSubmit: (response: string, comment?: string) => Promise<void>;
  disabled?: boolean;
}

export const ApprovalForm: React.FC<ApprovalFormProps> = ({
  notificationId,
  onSubmit,
  disabled = false
}) => {
  const [response, setResponse] = useState<string>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response) return;

    setSubmitting(true);
    try {
      await onSubmit(response, comment.trim() || undefined);
      setResponse('');
      setComment('');
    } catch (error) {
      console.error('Failed to submit approval:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          การตอบกลับ
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="APPROVED"
              checked={response === 'APPROVED'}
              onChange={(e) => setResponse(e.target.value)}
              disabled={disabled}
              className="mr-2"
            />
            <span className="text-green-600">✅ อนุมัติ</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="REJECTED"
              checked={response === 'REJECTED'}
              onChange={(e) => setResponse(e.target.value)}
              disabled={disabled}
              className="mr-2"
            />
            <span className="text-red-600">❌ ไม่อนุมัติ</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          ความเห็นเพิ่มเติม
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="ระบุเหตุผลหรือความเห็นเพิ่มเติม..."
          disabled={disabled}
          maxLength={1000}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {comment.length}/1000
        </div>
      </div>

      <button
        type="submit"
        disabled={!response || submitting || disabled}
        className={`w-full py-2 px-4 rounded-lg font-medium ${
          !response || submitting || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : response === 'APPROVED'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {submitting ? 'กำลังส่ง...' : `${response === 'APPROVED' ? 'อนุมัติ' : 'ไม่อนุมัติ'}`}
      </button>
    </form>
  );
};
```

## Testing

### Unit Tests
```bash
npm test -- approval.spec.ts
```

### Integration Tests
```bash
npm run test:integration -- approvals
```

### Manual Testing
```bash
# List approvals
curl -X GET "http://localhost:3001/api/notifications/456/approvals" \
  -H "Authorization: Bearer <token>"

# Create approval
curl -X POST "http://localhost:3001/api/notifications/456/approvals" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "APPROVED",
    "comment": "Approved by manager"
  }'

# Get metrics
curl -X GET "http://localhost:3001/api/notifications/456/approvals/metrics" \
  -H "Authorization: Bearer <admin_token>"

# My approvals
curl -X GET "http://localhost:3001/api/approvals/mine?status=pending" \
  -H "Authorization: Bearer <token>"
```

---

*เอกสารนี้อัปเดตล่าสุด: 30 พฤษภาคม 2025*
