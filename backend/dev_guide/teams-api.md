# Teams API

API สำหรับจัดการทีมงานในระบบ SCG Notification รองรับการสร้าง, อ่าน, แก้ไข, ลบทีม และการจัดการสมาชิกในทีม พร้อมระบบควบคุมสิทธิ์และ Company Code

## เอกสารดูเพิ่มเติม
- [Employees API](./employees-api.md) - การจัดการข้อมูลพนักงาน
- [Users API](./users-api.md) - การจัดการข้อมูลผู้ใช้
- [Notifications API](./notification-api.md) - การส่งการแจ้งเตือนให้ทีม

## Base URL
```
/api/team
```

## Authentication & Authorization

ทุก endpoint ต้องการการ authentication และมีระบบควบคุมสิทธิ์ดังนี้:

- **USER**: ดูข้อมูลทีมได้เฉพาะในบริษัทเดียวกัน
- **ADMIN**: จัดการทีมได้ทั้งหมดในบริษัทเดียวกัน  
- **SUPERADMIN**: จัดการทีมได้ทุกบริษัท

## Endpoints

### 1. สร้างทีมใหม่

```http
POST /api/team
```

**Description**: สร้างทีมงานใหม่ในระบบ

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Request Body**:
```json
{
  "name": "Development Team Alpha",
  "description": "ทีมพัฒนาระบบหลัก รับผิดชอบ Frontend และ Backend",
  "department": "IT",
  "division": "Technology",
  "leaderId": "user123",
  "members": [
    {
      "userId": "user456",
      "role": "DEVELOPER"
    },
    {
      "userId": "user789", 
      "role": "SENIOR_DEVELOPER"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "สร้างทีมเรียบร้อยแล้ว",
  "data": {
    "id": "team123",
    "name": "Development Team Alpha",
    "description": "ทีมพัฒนาระบบหลัก รับผิดชอบ Frontend และ Backend",
    "department": "IT",
    "division": "Technology",
    "companyCode": "SCG",
    "status": "ACTIVE",
    "leader": {
      "id": "user123",
      "firstNameTh": "สมชาย",
      "lastNameTh": "ใจดี",
      "position": "Tech Lead"
    },
    "members": [
      {
        "id": "member456",
        "userId": "user456",
        "role": "DEVELOPER",
        "joinDate": "2024-01-15T08:30:00.000Z",
        "user": {
          "firstNameTh": "มานี",
          "lastNameTh": "รักงาน",
          "position": "Developer"
        }
      }
    ],
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  }
}
```

### 2. ดูรายชื่อทีมทั้งหมด

```http
GET /api/team
```

**Description**: ดึงรายชื่อทีมทั้งหมด กรองตาม Company Code และสิทธิ์ของผู้ใช้

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `USER`, `ADMIN`, `SUPERADMIN`

**Query Parameters**:
```
?search=keyword       // ค้นหาจากชื่อทีม, คำอธิบาย
?department=IT        // กรองตามแผนก
?division=Technology  // กรองตามฝ่าย
?status=ACTIVE        // กรองตามสถานะ
?page=1               // หน้าที่ต้องการ (pagination)
?limit=20             // จำนวนรายการต่อหน้า
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "team123",
      "name": "Development Team Alpha",
      "description": "ทีมพัฒนาระบบหลัก",
      "department": "IT",
      "division": "Technology",
      "companyCode": "SCG",
      "status": "ACTIVE",
      "memberCount": 5,
      "leader": {
        "id": "user123",
        "firstNameTh": "สมชาย",
        "lastNameTh": "ใจดี",
        "position": "Tech Lead",
        "profileImage": "/uploads/profiles/somchai.jpg"
      },
      "createdAt": "2024-01-15T08:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 20
  }
}
```

### 3. ดูรายละเอียดทีม

```http
GET /api/team/{id}
```

**Description**: ดึงรายละเอียดทีมพร้อมสมาชิกทั้งหมด

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `USER`, `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): Team ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "team123",
    "name": "Development Team Alpha",
    "description": "ทีมพัฒนาระบบหลัก รับผิดชอบ Frontend และ Backend",
    "department": "IT",
    "division": "Technology",
    "companyCode": "SCG",
    "status": "ACTIVE",
    "leader": {
      "id": "user123",
      "firstNameTh": "สมชาย",
      "lastNameTh": "ใจดี",
      "firstNameEn": "Somchai",
      "lastNameEn": "Jaidee",
      "position": "Tech Lead",
      "profileImage": "/uploads/profiles/somchai.jpg",
      "email": "somchai@scg.com"
    },
    "members": [
      {
        "id": "member456",
        "userId": "user456",
        "role": "DEVELOPER",
        "joinDate": "2024-01-15T08:30:00.000Z",
        "status": "ACTIVE",
        "user": {
          "id": "user456",
          "firstNameTh": "มานี",
          "lastNameTh": "รักงาน",
          "firstNameEn": "Manee",
          "lastNameEn": "Rakngarn",
          "position": "Frontend Developer",
          "profileImage": "/uploads/profiles/manee.jpg",
          "email": "manee@scg.com"
        }
      },
      {
        "id": "member789",
        "userId": "user789",
        "role": "SENIOR_DEVELOPER",
        "joinDate": "2024-01-10T08:30:00.000Z",
        "status": "ACTIVE",
        "user": {
          "id": "user789",
          "firstNameTh": "วิชาย",
          "lastNameTh": "ขยันทำ",
          "position": "Senior Backend Developer",
          "email": "wichai@scg.com"
        }
      }
    ],
    "statistics": {
      "totalMembers": 5,
      "activeMembers": 5,
      "averageExperience": "2.5 ปี",
      "completedProjects": 12
    },
    "createdAt": "2024-01-01T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  }
}
```

### 4. อัปเดตข้อมูลทีม

```http
PUT /api/team/{id}
```

**Description**: แก้ไขข้อมูลทีม

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): Team ID

**Request Body**:
```json
{
  "name": "Development Team Alpha (Updated)",
  "description": "ทีมพัฒนาระบบหลัก รับผิดชอบ Full Stack Development",
  "department": "IT",
  "division": "Technology",
  "status": "ACTIVE"
}
```

**Response**:
```json
{
  "success": true,
  "message": "อัปเดตข้อมูลทีมเรียบร้อยแล้ว",
  "data": {
    "id": "team123",
    "name": "Development Team Alpha (Updated)",
    "description": "ทีมพัฒนาระบบหลัก รับผิดชอบ Full Stack Development",
    "department": "IT",
    "division": "Technology",
    "status": "ACTIVE",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. ลบทีม

```http
DELETE /api/team/{id}
```

**Description**: ลบทีมออกจากระบบ (soft delete)

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): Team ID

**Response**:
```json
{
  "success": true,
  "message": "ลบทีมเรียบร้อยแล้ว"
}
```

### 6. เพิ่มสมาชิกในทีม

```http
POST /api/team/{id}/members
```

**Description**: เพิ่มสมาชิกใหม่เข้าทีม

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): Team ID

**Request Body**:
```json
{
  "userId": "user999",
  "role": "DEVELOPER"
}
```

**Response**:
```json
{
  "success": true,
  "message": "เพิ่มสมาชิกในทีมเรียบร้อยแล้ว",
  "data": {
    "id": "member999",
    "userId": "user999",
    "teamId": "team123",
    "role": "DEVELOPER",
    "joinDate": "2024-01-15T10:30:00.000Z",
    "status": "ACTIVE",
    "user": {
      "firstNameTh": "ธนา",
      "lastNameTh": "มั่นใจ",
      "position": "Junior Developer"
    }
  }
}
```

### 7. ลบสมาชิกออกจากทีม

```http
DELETE /api/team/{id}/members/{memberId}
```

**Description**: ลบสมาชิกออกจากทีม

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): Team ID
- `memberId` (string): Member ID

**Response**:
```json
{
  "success": true,
  "message": "ลบสมาชิกออกจากทีมเรียบร้อยแล้ว"
}
```

### 8. เปลี่ยนหัวหน้าทีม

```http
PATCH /api/team/{id}/leader
```

**Description**: เปลี่ยนหัวหน้าทีม

**Authentication**: ✅ Required (Bearer Token)

**Authorization**: `ADMIN`, `SUPERADMIN`

**Path Parameters**:
- `id` (string): Team ID

**Request Body**:
```json
{
  "leaderId": "user789"
}
```

**Response**:
```json
{
  "success": true,
  "message": "เปลี่ยนหัวหน้าทีมเรียบร้อยแล้ว",
  "data": {
    "id": "team123",
    "name": "Development Team Alpha",
    "leader": {
      "id": "user789",
      "firstNameTh": "วิชาย",
      "lastNameTh": "ขยันทำ",
      "position": "Senior Backend Developer"
    },
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Data Models

### Team
```typescript
interface Team {
  id: string
  name: string
  description?: string
  department: string
  division?: string
  companyCode: string
  status: 'ACTIVE' | 'INACTIVE'
  leaderId: string
  leader?: TeamLeader
  members?: TeamMember[]
  createdAt: string
  updatedAt: string
}
```

### TeamMember
```typescript
interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: 'MEMBER' | 'DEVELOPER' | 'SENIOR_DEVELOPER' | 'TEAM_LEAD' | 'MANAGER'
  joinDate: string
  leaveDate?: string
  status: 'ACTIVE' | 'INACTIVE'
  user?: User
}
```

### TeamLeader
```typescript
interface TeamLeader {
  id: string
  firstNameTh: string
  lastNameTh: string
  firstNameEn?: string
  lastNameEn?: string
  position: string
  profileImage?: string
  email: string
}
```

## Error Codes

| Status Code | Error Code | Message |
|-------------|------------|---------|
| 401 | `UNAUTHORIZED` | ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ |
| 403 | `FORBIDDEN` | ไม่มีสิทธิ์ในการดำเนินการ |
| 403 | `COMPANY_ACCESS_DENIED` | ไม่มีสิทธิ์เข้าถึงข้อมูลบริษัทนี้ |
| 404 | `TEAM_NOT_FOUND` | ไม่พบข้อมูลทีม |
| 404 | `MEMBER_NOT_FOUND` | ไม่พบสมาชิกในทีม |
| 400 | `INVALID_TEAM_DATA` | ข้อมูลทีมไม่ถูกต้อง |
| 400 | `USER_ALREADY_IN_TEAM` | ผู้ใช้เป็นสมาชิกของทีมนี้อยู่แล้ว |
| 400 | `CANNOT_REMOVE_LEADER` | ไม่สามารถลบหัวหน้าทีมได้ |
| 409 | `TEAM_NAME_EXISTS` | ชื่อทีมนี้มีอยู่แล้ว |
| 500 | `INTERNAL_ERROR` | เกิดข้อผิดพลาดภายในระบบ |

## Frontend Integration

### React Hook สำหรับจัดการ Teams

```typescript
// hooks/useTeams.ts
import { useState, useEffect } from 'react'
import { Team, TeamFilters, CreateTeamData, UpdateTeamData } from '../types/team'
import { teamsApi } from '../api/teams'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async (filters: TeamFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await teamsApi.getAll(filters)
      setTeams(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (data: CreateTeamData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await teamsApi.create(data)
      await fetchTeams() // Refresh list
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTeam = async (id: string, data: UpdateTeamData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await teamsApi.update(id, data)
      await fetchTeams() // Refresh list
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTeam = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await teamsApi.delete(id)
      await fetchTeams() // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (teamId: string, userId: string, role: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await teamsApi.addMember(teamId, { userId, role })
      return response.data
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember
  }
}
```

### API Service

```typescript
// api/teams.ts
import axios from 'axios'
import { Team, TeamFilters, CreateTeamData, UpdateTeamData } from '../types/team'

const API_BASE = '/api/team'

export const teamsApi = {
  // ดูรายชื่อทีมทั้งหมด
  getAll: (filters: TeamFilters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.department) params.append('department', filters.department)
    if (filters.division) params.append('division', filters.division)
    if (filters.status) params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    return axios.get(`${API_BASE}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
  },

  // ดูรายละเอียดทีม
  getById: (id: string) =>
    axios.get(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // สร้างทีมใหม่
  create: (data: CreateTeamData) =>
    axios.post(API_BASE, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // อัปเดตทีม
  update: (id: string, data: UpdateTeamData) =>
    axios.put(`${API_BASE}/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // ลบทีม
  delete: (id: string) =>
    axios.delete(`${API_BASE}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // เพิ่มสมาชิก
  addMember: (teamId: string, data: { userId: string, role: string }) =>
    axios.post(`${API_BASE}/${teamId}/members`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // ลบสมาชิก
  removeMember: (teamId: string, memberId: string) =>
    axios.delete(`${API_BASE}/${teamId}/members/${memberId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }),

  // เปลี่ยนหัวหน้าทีม
  changeLeader: (teamId: string, leaderId: string) =>
    axios.patch(`${API_BASE}/${teamId}/leader`, { leaderId }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
}
```

### React Components

#### TeamsList Component
```tsx
// components/TeamsList.tsx
import React, { useState } from 'react'
import { useTeams } from '../hooks/useTeams'
import { TeamFilters } from '../types/team'

export const TeamsList: React.FC = () => {
  const { teams, loading, error, fetchTeams } = useTeams()
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    department: '',
    status: 'ACTIVE'
  })

  const handleFilterChange = (key: keyof TeamFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    fetchTeams(newFilters)
  }

  if (loading) return <div className="loading">กำลังโหลดข้อมูลทีม...</div>
  if (error) return <div className="error">ข้อผิดพลาด: {error}</div>

  return (
    <div className="teams-page">
      <div className="page-header">
        <h1>จัดการทีมงาน</h1>
        <button className="btn-primary">+ สร้างทีมใหม่</button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="ค้นหาชื่อทีม..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <select 
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
        >
          <option value="">ทุกแผนก</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
        </select>
      </div>

      {/* Teams Grid */}
      <div className="teams-grid">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  )
}

interface TeamCardProps {
  team: Team
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  return (
    <div className="team-card">
      <div className="team-header">
        <h3>{team.name}</h3>
        <span className={`status-badge ${team.status.toLowerCase()}`}>
          {team.status}
        </span>
      </div>
      
      <p className="team-description">{team.description}</p>
      
      <div className="team-info">
        <div className="department">{team.department}</div>
        {team.division && <div className="division">{team.division}</div>}
      </div>

      {team.leader && (
        <div className="team-leader">
          <span className="leader-label">หัวหน้าทีม:</span>
          <div className="leader-info">
            {team.leader.profileImage && (
              <img src={team.leader.profileImage} alt="Leader" className="leader-avatar" />
            )}
            <span className="leader-name">
              {team.leader.firstNameTh} {team.leader.lastNameTh}
            </span>
          </div>
        </div>
      )}

      <div className="team-stats">
        <span className="member-count">
          👥 {team.memberCount || 0} คน
        </span>
        <span className="created-date">
          📅 {new Date(team.createdAt).toLocaleDateString('th-TH')}
        </span>
      </div>

      <div className="team-actions">
        <button className="btn-secondary">ดูรายละเอียด</button>
        <button className="btn-primary">แก้ไข</button>
      </div>
    </div>
  )
}
```

## cURL Examples

### ดูรายชื่อทีมทั้งหมด
```bash
curl -X GET "http://localhost:3000/api/team" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### สร้างทีมใหม่
```bash
curl -X POST "http://localhost:3000/api/team" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Development Team Alpha",
    "description": "ทีมพัฒนาระบบหลัก",
    "department": "IT",
    "division": "Technology",
    "leaderId": "user123"
  }'
```

### เพิ่มสมาชิกในทีม
```bash
curl -X POST "http://localhost:3000/api/team/team123/members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "user456",
    "role": "DEVELOPER"
  }'
```

## Testing

### Unit Tests
```typescript
// __tests__/teams.test.ts
import request from 'supertest'
import app from '../src/app'
import { createTestUser, getAuthToken } from './helpers'

describe('Teams API', () => {
  describe('POST /api/team', () => {
    it('should create team successfully', async () => {
      const admin = await createTestUser({ role: 'ADMIN' })
      const token = await getAuthToken(admin)

      const teamData = {
        name: 'Test Team',
        description: 'Test Description',
        department: 'IT',
        leaderId: admin.id
      }

      const response = await request(app)
        .post('/api/team')
        .set('Authorization', `Bearer ${token}`)
        .send(teamData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Test Team')
    })
  })

  describe('GET /api/team', () => {
    it('should return list of teams', async () => {
      const user = await createTestUser({ role: 'EMPLOYEE' })
      const token = await getAuthToken(user)

      const response = await request(app)
        .get('/api/team')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })
})
```

## Security Considerations

1. **Company Code Isolation**: แยกข้อมูลทีมตาม Company Code
2. **Role-Based Access Control**: ควบคุมสิทธิ์การเข้าถึงตาม Role
3. **Team Leader Validation**: ตรวจสอบว่าหัวหน้าทีมเป็นสมาชิกของบริษัทเดียวกัน
4. **Member Validation**: ตรวจสอบสิทธิ์การเพิ่ม/ลบสมาชิก

## Performance Optimization

1. **Database Indexing**: สร้าง Index สำหรับ companyCode, department, status
2. **Pagination**: จำกัดจำนวนผลลัพธ์ต่อหน้า
3. **Selective Loading**: ดึงเฉพาะข้อมูลที่จำเป็นในแต่ละหน้า
4. **Caching**: Cache ข้อมูลทีมที่เปลี่ยนแปลงไม่บ่อย

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **ไม่สามารถสร้างทีมได้**
   - ตรวจสอบสิทธิ์ของผู้ใช้ (ต้องเป็น ADMIN ขึ้นไป)
   - ตรวจสอบว่าชื่อทีมซ้ำหรือไม่

2. **ไม่สามารถเพิ่มสมาชิกได้**
   - ตรวจสอบว่าผู้ใช้เป็นสมาชิกของบริษัทเดียวกันหรือไม่
   - ตรวจสอบว่าผู้ใช้เป็นสมาชิกของทีมอื่นอยู่แล้วหรือไม่

3. **ไม่สามารถเปลี่ยนหัวหน้าทีมได้**
   - ตรวจสอบว่าผู้ใช้ใหม่เป็นสมาชิกของทีมหรือไม่
   - ตรวจสอบสิทธิ์ในการเปลี่ยนแปลง
