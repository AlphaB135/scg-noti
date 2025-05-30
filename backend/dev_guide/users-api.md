# Users API

API สำหรับจัดการข้อมูลผู้ใช้ในระบบ SCG Notification รองรับการดูรายชื่อผู้ใช้และอัปเดตโปรไฟล์

## เอกสารดูเพิ่มเติม
- [Authentication API](./auth-api.md) - การเข้าสู่ระบบและ Token management
- [Employees API](./employees-api.md) - การจัดการข้อมูลพนักงาน
- [Teams API](./teams-api.md) - การจัดการทีมและการจัดกลุ่ม

## Base URL
```
/api/users
```

## Endpoints

### 1. ดูรายชื่อผู้ใช้ทั้งหมด

```http
GET /api/users
```

**Description**: ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ พร้อมข้อมูล Profile

**Authentication**: ไม่จำเป็น

**Response**:
```json
[
  {
    "id": "user123",
    "email": "john@scg.com",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z",
    "employeeProfile": {
      "id": "emp123",
      "employeeId": "SCG001",
      "firstNameTh": "จอห์น",
      "lastNameTh": "โด",
      "firstNameEn": "John",
      "lastNameEn": "Doe",
      "position": "Developer",
      "department": "IT",
      "phoneNumber": "0812345678",
      "lineUserId": "line123",
      "profileImage": "/uploads/profiles/john.jpg"
    },
    "adminProfile": null
  },
  {
    "id": "admin456",
    "email": "admin@scg.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "employeeProfile": null,
    "adminProfile": {
      "id": "adm456",
      "permissions": ["MANAGE_USERS", "MANAGE_NOTIFICATIONS"],
      "department": "IT_ADMIN"
    }
  }
]
```

### 2. อัปเดตโปรไฟล์ผู้ใช้

```http
PUT /api/users/profile
```

**Description**: อัปเดตข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่

**Authentication**: ✅ Required (Bearer Token)

**Request Body**:
```json
{
  "firstNameTh": "จอห์น",
  "lastNameTh": "สมิธ",
  "firstNameEn": "John",
  "lastNameEn": "Smith",
  "phoneNumber": "0898765432",
  "lineUserId": "line456",
  "profileImage": "/uploads/profiles/john_new.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "message": "อัปเดตโปรไฟล์เรียบร้อยแล้ว",
  "data": {
    "id": "emp123",
    "employeeId": "SCG001",
    "firstNameTh": "จอห์น",
    "lastNameTh": "สมิธ",
    "firstNameEn": "John",
    "lastNameEn": "Smith",
    "position": "Developer",
    "department": "IT",
    "phoneNumber": "0898765432",
    "lineUserId": "line456",
    "profileImage": "/uploads/profiles/john_new.jpg",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Data Models

### User
```typescript
interface User {
  id: string
  email: string
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN'
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  employeeProfile?: EmployeeProfile
  adminProfile?: AdminProfile
}
```

### EmployeeProfile
```typescript
interface EmployeeProfile {
  id: string
  employeeId: string
  firstNameTh: string
  lastNameTh: string
  firstNameEn: string
  lastNameEn: string
  position: string
  department: string
  phoneNumber?: string
  lineUserId?: string
  profileImage?: string
}
```

### AdminProfile
```typescript
interface AdminProfile {
  id: string
  permissions: string[]
  department: string
}
```

## Error Codes

| Status Code | Error Code | Message |
|-------------|------------|---------|
| 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ |
| 403 | `FORBIDDEN` | ไม่มีสิทธิ์ในการดำเนินการ |
| 404 | `USER_NOT_FOUND` | ไม่พบข้อมูลผู้ใช้ |
| 400 | `VALIDATION_ERROR` | ข้อมูลไม่ถูกต้อง |
| 409 | `EMAIL_EXISTS` | อีเมลนี้มีอยู่ในระบบแล้ว |
| 500 | `INTERNAL_ERROR` | เกิดข้อผิดพลาดภายในระบบ |

## Frontend Integration

### React Hook สำหรับจัดการ Users

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react'
import { User, UpdateProfileData } from '../types/user'
import { usersApi } from '../api/users'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await usersApi.getAll()
      setUsers(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await usersApi.updateProfile(data)
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateProfile
  }
}
```

### API Service

```typescript
// api/users.ts
import axios from 'axios'
import { User, UpdateProfileData } from '../types/user'

const API_BASE = '/api/users'

export const usersApi = {
  // ดูรายชื่อผู้ใช้ทั้งหมด
  getAll: () => 
    axios.get<User[]>(API_BASE),

  // อัปเดตโปรไฟล์
  updateProfile: (data: UpdateProfileData) =>
    axios.put(`${API_BASE}/profile`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
}
```

### React Components

#### UsersList Component
```tsx
// components/UsersList.tsx
import React from 'react'
import { useUsers } from '../hooks/useUsers'
import { User, EmployeeProfile } from '../types/user'

export const UsersList: React.FC = () => {
  const { users, loading, error } = useUsers()

  if (loading) return <div className="loading">กำลังโหลด...</div>
  if (error) return <div className="error">ข้อผิดพลาด: {error}</div>

  return (
    <div className="users-list">
      <h2>รายชื่อผู้ใช้</h2>
      <div className="users-grid">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}

interface UserCardProps {
  user: User
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const profile = user.employeeProfile || user.adminProfile
  const displayName = user.employeeProfile 
    ? `${user.employeeProfile.firstNameTh} ${user.employeeProfile.lastNameTh}`
    : user.email

  return (
    <div className="user-card">
      <div className="user-avatar">
        {user.employeeProfile?.profileImage ? (
          <img 
            src={user.employeeProfile.profileImage} 
            alt={displayName}
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {displayName.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="user-info">
        <h3>{displayName}</h3>
        <p className="user-email">{user.email}</p>
        
        {user.employeeProfile && (
          <div className="employee-details">
            <p className="position">{user.employeeProfile.position}</p>
            <p className="department">{user.employeeProfile.department}</p>
            <p className="employee-id">รหัส: {user.employeeProfile.employeeId}</p>
          </div>
        )}
        
        <div className="user-status">
          <span className={`status-badge ${user.status.toLowerCase()}`}>
            {user.status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
          </span>
          <span className={`role-badge ${user.role.toLowerCase()}`}>
            {user.role}
          </span>
        </div>
      </div>
    </div>
  )
}
```

#### ProfileUpdate Component
```tsx
// components/ProfileUpdate.tsx
import React, { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { UpdateProfileData } from '../types/user'

export const ProfileUpdate: React.FC = () => {
  const { updateProfile, loading, error } = useUsers()
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstNameTh: '',
    lastNameTh: '',
    firstNameEn: '',
    lastNameEn: '',
    phoneNumber: '',
    lineUserId: '',
    profileImage: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      alert('อัปเดตโปรไฟล์เรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="profile-update-form">
      <h2>อัปเดตโปรไฟล์</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstNameTh">ชื่อ (ไทย)</label>
          <input
            type="text"
            id="firstNameTh"
            name="firstNameTh"
            value={formData.firstNameTh}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastNameTh">นามสกุล (ไทย)</label>
          <input
            type="text"
            id="lastNameTh"
            name="lastNameTh"
            value={formData.lastNameTh}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstNameEn">ชื่อ (อังกฤษ)</label>
          <input
            type="text"
            id="firstNameEn"
            name="firstNameEn"
            value={formData.firstNameEn}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastNameEn">นามสกุล (อังกฤษ)</label>
          <input
            type="text"
            id="lastNameEn"
            name="lastNameEn"
            value={formData.lastNameEn}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">เบอร์โทรศัพท์</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="0812345678"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lineUserId">LINE User ID</label>
        <input
          type="text"
          id="lineUserId"
          name="lineUserId"
          value={formData.lineUserId}
          onChange={handleInputChange}
          placeholder="line123456"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="submit-button"
      >
        {loading ? 'กำลังอัปเดต...' : 'อัปเดตโปรไฟล์'}
      </button>
    </form>
  )
}
```

## cURL Examples

### ดูรายชื่อผู้ใช้ทั้งหมด
```bash
curl -X GET "http://localhost:3000/api/users" \
  -H "Content-Type: application/json"
```

### อัปเดตโปรไฟล์
```bash
curl -X PUT "http://localhost:3000/api/users/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstNameTh": "จอห์น",
    "lastNameTh": "สมิธ",
    "firstNameEn": "John",
    "lastNameEn": "Smith",
    "phoneNumber": "0898765432",
    "lineUserId": "line456"
  }'
```

## Testing

### Unit Tests
```typescript
// __tests__/users.test.ts
import request from 'supertest'
import app from '../src/app'
import { createTestUser, getAuthToken } from './helpers'

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('email')
        expect(response.body[0]).toHaveProperty('role')
      }
    })
  })

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const user = await createTestUser()
      const token = await getAuthToken(user)

      const updateData = {
        firstNameTh: 'ทดสอบ',
        lastNameTh: 'อัปเดต',
        firstNameEn: 'Test',
        lastNameEn: 'Update',
        phoneNumber: '0812345678'
      }

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.firstNameTh).toBe('ทดสอบ')
      expect(response.body.data.phoneNumber).toBe('0812345678')
    })

    it('should return 401 without token', async () => {
      const updateData = {
        firstNameTh: 'ทดสอบ',
        lastNameTh: 'อัปเดต'
      }

      await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401)
    })
  })
})
```

### Postman Collection
```json
{
  "info": {
    "name": "Users API",
    "description": "API endpoints for user management"
  },
  "item": [
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/users",
          "host": ["{{baseUrl}}"],
          "path": ["api", "users"]
        }
      }
    },
    {
      "name": "Update Profile",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"firstNameTh\": \"จอห์น\",\n  \"lastNameTh\": \"สมิธ\",\n  \"firstNameEn\": \"John\",\n  \"lastNameEn\": \"Smith\",\n  \"phoneNumber\": \"0898765432\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/users/profile",
          "host": ["{{baseUrl}}"],
          "path": ["api", "users", "profile"]
        }
      }
    }
  ]
}
```

## Security Considerations

1. **Authorization**: การอัปเดตโปรไฟล์ต้องมี Token ที่ถูกต้อง
2. **Data Validation**: ตรวจสอบข้อมูลที่ส่งเข้ามาทุกครั้ง
3. **File Upload**: หากมีการอัปโหลดรูปโปรไฟล์ ต้องตรวจสอบประเภทและขนาดไฟล์
4. **Rate Limiting**: จำกัดจำนวนการเรียก API ในช่วงเวลาหนึ่ง

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **ไม่สามารถดูรายชื่อผู้ใช้ได้**
   - ตรวจสอบการเชื่อมต่อฐานข้อมูล
   - ตรวจสอบ permissions ของฐานข้อมูล

2. **อัปเดตโปรไฟล์ไม่สำเร็จ**
   - ตรวจสอบ Token ที่ส่งมา
   - ตรวจสอบรูปแบบข้อมูลที่ส่ง
   - ตรวจสอบว่าผู้ใช้มีอยู่ในระบบ

3. **รูปโปรไฟล์ไม่แสดง**
   - ตรวจสอบ path ของไฟล์รูป
   - ตรวจสอบ permissions ของโฟลเดอร์ uploads
