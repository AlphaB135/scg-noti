# Employees API

API สำหรับจัดการข้อมูลพนักงานในระบบ SCG Notification รองรับการดูรายชื่อพนักงานและรายละเอียดพนักงานแต่ละคน พร้อมระบบควบคุมสิทธิ์ตาม Company Code

## เอกสารดูเพิ่มเติม
- [Users API](./users-api.md) - การจัดการข้อมูลผู้ใช้ทั่วไป
- [Authentication API](./auth-api.md) - การเข้าสู่ระบบและ Token management
- [Teams API](./teams-api.md) - การจัดการทีมและการจัดกลุ่ม

## Base URL
```
/api/employees
```

## Authentication & Authorization

ทุก endpoint ต้องการการ authentication และมีระบบควบคุมสิทธิ์ดังนี้:

- **USER**: ดูข้อมูลพนักงานได้เฉพาะในบริษัทเดียวกัน
- **ADMIN**: ดูข้อมูลพนักงานทั้งหมดในบริษัทเดียวกัน
- **SUPERADMIN**: ดูข้อมูลพนักงานทุกบริษัท

## Endpoints

### 1. ดูรายชื่อพนักงานทั้งหมด

```http
GET /api/employees
```

**Description**: ดึงรายชื่อพนักงานทั้งหมด กรองตาม Company Code และสิทธิ์ของผู้ใช้

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Query Parameters**:
```
?search=keyword     // ค้นหาจากชื่อ, นามสกุล, รหัสพนักงาน
?department=IT      // กรองตามแผนก
?position=Developer // กรองตามตำแหน่ง
?status=ACTIVE      // กรองตามสถานะ
?page=1             // หน้าที่ต้องการ (pagination)
?limit=20           // จำนวนรายการต่อหน้า
```

**Response**:
```json
{
  "success": true,
  "data": [
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
        "companyCode": "SCG",
        "firstNameTh": "จอห์น",
        "lastNameTh": "โด",
        "firstNameEn": "John",
        "lastNameEn": "Doe",
        "position": "Senior Developer",
        "department": "IT",
        "division": "Technology",
        "phoneNumber": "0812345678",
        "lineUserId": "line123",
        "profileImage": "/uploads/profiles/john.jpg",
        "supervisor": {
          "id": "supervisor456",
          "firstNameTh": "แมรี่",
          "lastNameTh": "สมิธ",
          "position": "Team Lead"
        },
        "team": {
          "id": "team789",
          "name": "Development Team A",
          "description": "Frontend & Backend Development"
        },
        "startDate": "2023-01-01T00:00:00.000Z",
        "employmentType": "FULL_TIME",
        "workLocation": "ONSITE"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20
  }
}
```

### 2. ดูรายละเอียดพนักงานแต่ละคน

```http
GET /api/employees/{id}
```

**Description**: ดึงรายละเอียดพนักงานคนหนึ่ง พร้อมข้อมูลทีม, หัวหน้างาน, และประวัติการทำงาน

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `USER`, `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): User ID ของพนักงาน

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "john@scg.com",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z",
    "employeeProfile": {
      "id": "emp123",
      "employeeId": "SCG001",
      "companyCode": "SCG",
      "firstNameTh": "จอห์น",
      "lastNameTh": "โด",
      "firstNameEn": "John",
      "lastNameEn": "Doe",
      "nickname": "John",
      "position": "Senior Developer",
      "department": "IT",
      "division": "Technology",
      "phoneNumber": "0812345678",
      "email": "john@scg.com",
      "lineUserId": "line123",
      "profileImage": "/uploads/profiles/john.jpg",
      "supervisor": {
        "id": "supervisor456",
        "firstNameTh": "แมรี่",
        "lastNameTh": "สมิธ",
        "position": "Team Lead",
        "email": "mary@scg.com"
      },
      "team": {
        "id": "team789",
        "name": "Development Team A",
        "description": "Frontend & Backend Development",
        "members": [
          {
            "id": "member1",
            "firstNameTh": "สมชาย",
            "lastNameTh": "ใจดี",
            "position": "Junior Developer"
          }
        ]
      },
      "startDate": "2023-01-01T00:00:00.000Z",
      "employmentType": "FULL_TIME",
      "workLocation": "ONSITE",
      "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
      "certifications": [
        {
          "name": "AWS Developer Associate",
          "issuer": "Amazon",
          "issueDate": "2023-06-15T00:00:00.000Z",
          "expiryDate": "2026-06-15T00:00:00.000Z"
        }
      ],
      "emergencyContact": {
        "name": "จินดา โด",
        "relationship": "คู่สมรส",
        "phoneNumber": "0898765432"
      }
    }
  }
}
```

## Data Models

### Employee (User with EmployeeProfile)
```typescript
interface Employee {
  id: string
  email: string
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPERADMIN'
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  employeeProfile: EmployeeProfile
}
```

### EmployeeProfile
```typescript
interface EmployeeProfile {
  id: string
  employeeId: string
  companyCode: string
  firstNameTh: string
  lastNameTh: string
  firstNameEn: string
  lastNameEn: string
  nickname?: string
  position: string
  department: string
  division?: string
  phoneNumber?: string
  email?: string
  lineUserId?: string
  profileImage?: string
  supervisor?: SupervisorInfo
  team?: TeamInfo
  startDate: string
  endDate?: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
  workLocation: 'ONSITE' | 'REMOTE' | 'HYBRID'
  skills?: string[]
  certifications?: Certification[]
  emergencyContact?: EmergencyContact
}
```

### Supporting Types
```typescript
interface SupervisorInfo {
  id: string
  firstNameTh: string
  lastNameTh: string
  position: string
  email: string
}

interface TeamInfo {
  id: string
  name: string
  description: string
  members?: TeamMember[]
}

interface Certification {
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
}

interface EmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
}
```

## Error Codes

| Status Code | Error Code | Message |
|-------------|------------|---------|
| 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ |
| 403 | `FORBIDDEN` | ไม่มีสิทธิ์ในการดำเนินการ |
| 403 | `COMPANY_ACCESS_DENIED` | ไม่มีสิทธิ์เข้าถึงข้อมูลบริษัทนี้ |
| 404 | `EMPLOYEE_NOT_FOUND` | ไม่พบข้อมูลพนักงาน |
| 400 | `INVALID_EMPLOYEE_ID` | รหัสพนักงานไม่ถูกต้อง |
| 500 | `INTERNAL_ERROR` | เกิดข้อผิดพลาดภายในระบบ |

## Frontend Integration

### React Hook สำหรับจัดการ Employees

```typescript
// hooks/useEmployees.ts
import { useState, useEffect } from 'react'
import { Employee, EmployeeFilters } from '../types/employee'
import { employeesApi } from '../api/employees'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  })

  const fetchEmployees = async (filters: EmployeeFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await employeesApi.getAll(filters)
      setEmployees(response.data.data)
      setPagination(response.data.pagination)
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployee = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await employeesApi.getById(id)
      return response.data.data
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  return {
    employees,
    loading,
    error,
    pagination,
    fetchEmployees,
    fetchEmployee
  }
}
```

### API Service

```typescript
// api/employees.ts
import axios from 'axios'
import { Employee, EmployeeFilters } from '../types/employee'

const API_BASE = '/api/employees'

export const employeesApi = {
  // ดูรายชื่อพนักงานทั้งหมด
  getAll: (filters: EmployeeFilters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.department) params.append('department', filters.department)
    if (filters.position) params.append('position', filters.position)
    if (filters.status) params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    return axios.get(`${API_BASE}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
  },

  // ดูรายละเอียดพนักงาน
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
}
```

### React Components

#### EmployeesList Component
```tsx
// components/EmployeesList.tsx
import React, { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { EmployeeFilters } from '../types/employee'

export const EmployeesList: React.FC = () => {
  const { employees, loading, error, pagination, fetchEmployees } = useEmployees()
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    department: '',
    position: '',
    status: 'ACTIVE',
    page: 1,
    limit: 20
  })

  const handleFilterChange = (key: keyof EmployeeFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchEmployees(newFilters)
  }

  const handlePageChange = (page: number) => {
    handleFilterChange('page', page)
  }

  if (loading) return <div className="loading">กำลังโหลดข้อมูลพนักงาน...</div>
  if (error) return <div className="error">ข้อผิดพลาด: {error}</div>

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>รายชื่อพนักงาน</h1>
        <div className="employee-stats">
          <span>ทั้งหมด {pagination.totalItems} คน</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, นามสกุล, รหัสพนักงาน..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            <option value="">ทุกแผนก</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="employees-grid">
        {employees.map(employee => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={pagination.currentPage === 1}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
        >
          ◀ ก่อนหน้า
        </button>
        
        <span className="page-info">
          หน้า {pagination.currentPage} จาก {pagination.totalPages}
        </span>
        
        <button 
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
        >
          ถัดไป ▶
        </button>
      </div>
    </div>
  )
}

interface EmployeeCardProps {
  employee: Employee
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const profile = employee.employeeProfile
  
  return (
    <div className="employee-card">
      <div className="employee-avatar">
        {profile.profileImage ? (
          <img 
            src={profile.profileImage} 
            alt={`${profile.firstNameTh} ${profile.lastNameTh}`}
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {profile.firstNameTh.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="employee-info">
        <h3 className="employee-name">
          {profile.firstNameTh} {profile.lastNameTh}
        </h3>
        <p className="employee-name-en">
          {profile.firstNameEn} {profile.lastNameEn}
        </p>
        <p className="employee-id">รหัส: {profile.employeeId}</p>
        
        <div className="employee-details">
          <p className="position">{profile.position}</p>
          <p className="department">{profile.department}</p>
          {profile.division && (
            <p className="division">{profile.division}</p>
          )}
        </div>

        {profile.team && (
          <div className="team-info">
            <span className="team-badge">{profile.team.name}</span>
          </div>
        )}

        <div className="employee-status">
          <span className={`status-badge ${employee.status.toLowerCase()}`}>
            {employee.status === 'ACTIVE' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
          </span>
          <span className="work-location">{profile.workLocation}</span>
        </div>

        <div className="employee-contact">
          {profile.phoneNumber && (
            <span className="phone">📞 {profile.phoneNumber}</span>
          )}
          {profile.email && (
            <span className="email">✉️ {profile.email}</span>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### EmployeeDetail Component
```tsx
// components/EmployeeDetail.tsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useEmployees } from '../hooks/useEmployees'
import { Employee } from '../types/employee'

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { fetchEmployee, loading, error } = useEmployees()
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    if (id) {
      fetchEmployee(id).then(setEmployee).catch(console.error)
    }
  }, [id, fetchEmployee])

  if (loading) return <div className="loading">กำลังโหลด...</div>
  if (error) return <div className="error">ข้อผิดพลาด: {error}</div>
  if (!employee) return <div className="not-found">ไม่พบข้อมูลพนักงาน</div>

  const profile = employee.employeeProfile

  return (
    <div className="employee-detail">
      <div className="detail-header">
        <div className="employee-avatar-large">
          {profile.profileImage ? (
            <img 
              src={profile.profileImage} 
              alt={`${profile.firstNameTh} ${profile.lastNameTh}`}
            />
          ) : (
            <div className="avatar-placeholder-large">
              {profile.firstNameTh.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="employee-header-info">
          <h1>{profile.firstNameTh} {profile.lastNameTh}</h1>
          <h2>{profile.firstNameEn} {profile.lastNameEn}</h2>
          <p className="employee-id">รหัสพนักงาน: {profile.employeeId}</p>
          <p className="position">{profile.position}</p>
          <p className="department">{profile.department} - {profile.division}</p>
        </div>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h3>ข้อมูลติดต่อ</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>อีเมล:</label>
              <span>{profile.email || employee.email}</span>
            </div>
            <div className="info-item">
              <label>เบอร์โทร:</label>
              <span>{profile.phoneNumber || '-'}</span>
            </div>
            <div className="info-item">
              <label>LINE ID:</label>
              <span>{profile.lineUserId || '-'}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>ข้อมูลการทำงาน</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>วันที่เริ่มงาน:</label>
              <span>{new Date(profile.startDate).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="info-item">
              <label>ประเภทการจ้าง:</label>
              <span>{profile.employmentType}</span>
            </div>
            <div className="info-item">
              <label>รูปแบบการทำงาน:</label>
              <span>{profile.workLocation}</span>
            </div>
          </div>
        </div>

        {profile.supervisor && (
          <div className="info-section">
            <h3>หัวหน้างาน</h3>
            <div className="supervisor-info">
              <span className="supervisor-name">
                {profile.supervisor.firstNameTh} {profile.supervisor.lastNameTh}
              </span>
              <span className="supervisor-position">
                {profile.supervisor.position}
              </span>
              <span className="supervisor-email">
                {profile.supervisor.email}
              </span>
            </div>
          </div>
        )}

        {profile.team && (
          <div className="info-section">
            <h3>ทีมงาน</h3>
            <div className="team-info">
              <h4>{profile.team.name}</h4>
              <p>{profile.team.description}</p>
              {profile.team.members && (
                <div className="team-members">
                  <h5>สมาชิกในทีม:</h5>
                  <ul>
                    {profile.team.members.map(member => (
                      <li key={member.id}>
                        {member.firstNameTh} {member.lastNameTh} - {member.position}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="info-section">
            <h3>ทักษะ</h3>
            <div className="skills-tags">
              {profile.skills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {profile.certifications && profile.certifications.length > 0 && (
          <div className="info-section">
            <h3>ใบรับรอง</h3>
            <div className="certifications-list">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  <h4>{cert.name}</h4>
                  <p>ออกโดย: {cert.issuer}</p>
                  <p>วันที่ออก: {new Date(cert.issueDate).toLocaleDateString('th-TH')}</p>
                  {cert.expiryDate && (
                    <p>วันหมดอายุ: {new Date(cert.expiryDate).toLocaleDateString('th-TH')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.emergencyContact && (
          <div className="info-section">
            <h3>ผู้ติดต่อฉุกเฉิน</h3>
            <div className="emergency-contact">
              <p><strong>ชื่อ:</strong> {profile.emergencyContact.name}</p>
              <p><strong>ความสัมพันธ์:</strong> {profile.emergencyContact.relationship}</p>
              <p><strong>เบอร์โทร:</strong> {profile.emergencyContact.phoneNumber}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

## cURL Examples

### ดูรายชื่อพนักงานทั้งหมด
```bash
curl -X GET "http://localhost:3000/api/employees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ดูรายชื่อพนักงานพร้อม filters
```bash
curl -X GET "http://localhost:3000/api/employees?search=john&department=IT&page=1&limit=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### ดูรายละเอียดพนักงานคนหนึ่ง
```bash
curl -X GET "http://localhost:3000/api/employees/user123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing

### Unit Tests
```typescript
// __tests__/employees.test.ts
import request from 'supertest'
import app from '../src/app'
import { createTestUser, getAuthToken } from './helpers'

describe('Employees API', () => {
  describe('GET /api/employees', () => {
    it('should return employees for admin user', async () => {
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return 403 for regular user', async () => {
      const user = await createTestUser({ role: 'EMPLOYEE' })
      const token = await getAuthToken(user)

      await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${token}`)
        .expect(403)
    })
  })

  describe('GET /api/employees/:id', () => {
    it('should return employee details', async () => {
      const employee = await createTestUser({ role: 'EMPLOYEE' })
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      const response = await request(app)
        .get(`/api/employees/${employee.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(employee.id)
      expect(response.body.data.employeeProfile).toBeDefined()
    })

    it('should return 404 for non-existent employee', async () => {
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      await request(app)
        .get('/api/employees/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })
  })
})
```

## Security Considerations

1. **Company Code Verification**: ระบบตรวจสอบ Company Code เพื่อแยกข้อมูลระหว่างบริษัท
2. **Role-Based Access**: ควบคุมสิทธิ์การเข้าถึงตาม Role ของผู้ใช้
3. **Data Filtering**: กรองข้อมูลที่ส่งกลับตามสิทธิ์
4. **Authentication Required**: ทุก endpoint ต้องการ Token ที่ถูกต้อง

## Performance Optimization

1. **Database Indexing**: สร้าง Index สำหรับ companyCode, department, position
2. **Pagination**: จำกัดจำนวนผลลัพธ์ต่อหน้า
3. **Selective Include**: ดึงเฉพาะข้อมูลที่จำเป็น
4. **Caching**: Cache ข้อมูลที่เปลี่ยนแปลงไม่บ่อย

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **ไม่สามารถดูรายชื่อพนักงานได้**
   - ตรวจสอบสิทธิ์ของผู้ใช้ (ต้องเป็น ADMIN ขึ้นไป)
   - ตรวจสอบ Company Code ใน Token

2. **ไม่พบข้อมูลพนักงาน**
   - ตรวจสอบว่า ID ถูกต้อง
   - ตรวจสอบสิทธิ์เข้าถึงข้อมูลบริษัท

3. **ข้อมูลไม่ครบถ้วน**
   - ตรวจสอบ include relationships ในการ query
   - ตรวจสอบข้อมูลในฐานข้อมูล
