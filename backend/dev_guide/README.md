# 📚 คู่มือ API - ระบบ SCG Notification

ยินดีต้อนรับสู่เอกสารประกอบการใช้งาน API ของระบบ SCG Notification System

## 📋 สารบัญ

### 🔐 Authentication & Security
- [**Authentication API**](./auth-api.md) - การล็อกอิน, JWT tokens, session management
- [**Authorization & Permissions**](./authorization.md) - การจัดการสิทธิ์และบทบาท

### 📧 Core Features
- [**Notifications API**](./notification-api.md) - สร้าง, แก้ไข, ลบการแจ้งเตือน
- [**Approvals API**](./approval-api.md) - จัดการการอนุมัติ
- [**Timeline API**](./timeline-api.md) - ดูประวัติ events แบบ chronological

### 👥 User Management
- [**Users API**](./users-api.md) - จัดการข้อมูลผู้ใช้และโปรไฟล์
- [**Employees API**](./employees-api.md) - จัดการข้อมูลพนักงานและ Company Code
- [**Teams API**](./teams-api.md) - จัดการทีม, สมาชิก, และหัวหน้าทีม

### 📊 Analytics & Reporting
- [**Dashboard API**](./dashboard-api.md) - ข้อมูลสถิติ, กราฟ, และกิจกรรมล่าสุด
- [**Mobile API**](./mobile-api.md) - APIs สำหรับแอพมือถือ

### ⚙️ Administration
- [**Admin API**](./admin-api.md) - ฟังก์ชันสำหรับผู้ดูแลระบบ
- [**Security Logs API**](./security-logs-api.md) - ระบบ audit logs และการตรวจสอบ

## 🏗️ โครงสร้าง API

ระบบใช้ RESTful API design patterns พร้อมการจัดกลุ่ม endpoints ตามโดเมน:

```
/api/auth/*           - Authentication & session management
/api/users/*          - User account operations
/api/employees/*      - Employee profile management
/api/teams/*          - Team & collaboration features
/api/notifications/*  - Notification system
/api/approvals/*      - Approval workflows
/api/timeline/*       - Event timeline & history
/api/dashboard/*      - Analytics & reporting
/api/mobile/*         - Mobile app endpoints
/api/admin/*          - Administrative functions
/api/security-logs/*  - Audit logging
```

## 🚀 เริ่มต้นใช้งาน

### 1. Base URL
```
Development: http://localhost:3001
Production: https://api.scg-notification.com
```

### 2. Authentication
ทุก API (ยกเว้น `/api/auth/*`) ต้องการ JWT token:
```bash
Authorization: Bearer <your_jwt_token>
```

### 3. Content Type
```bash
Content-Type: application/json
```

### 4. ตัวอย่างการเรียกใช้
```bash
curl -X GET "http://localhost:3001/api/notifications" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

## 📖 API Reference แบบย่อ

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/auth/me` | ข้อมูลผู้ใช้ปัจจุบัน |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | รายการแจ้งเตือนทั้งหมด |
| GET | `/api/notifications/mine` | แจ้งเตือนของฉัน |
| POST | `/api/notifications` | สร้างแจ้งเตือนใหม่ |
| PUT | `/api/notifications/:id` | แก้ไขแจ้งเตือน |
| DELETE | `/api/notifications/:id` | ลบแจ้งเตือน |

### Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/:id/approvals` | รายการการอนุมัติ |
| POST | `/api/notifications/:id/approvals` | สร้างการอนุมัติ |
| GET | `/api/notifications/:id/approvals/metrics` | สถิติการอนุมัติ |

### Users & Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | รายการผู้ใช้ทั้งหมด |
| PUT | `/api/users/profile` | อัปเดตโปรไฟล์ |
| GET | `/api/employees` | รายการพนักงาน |
| GET | `/api/employees/:id` | รายละเอียดพนักงาน |
| GET | `/api/team` | รายการทีม |
| POST | `/api/team` | สร้างทีมใหม่ |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/overview` | ข้อมูลภาพรวมระบบ |
| GET | `/api/dashboard/metrics` | กราฟแสดงแนวโน้ม |

### Timeline
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timeline` | ประวัติ events ทั้งหมด |

## 🔧 การพัฒนาและทดสอบ

### Environment Setup
```bash
# ติดตั้ง dependencies
npm install

# เริ่มต้น development server
npm run dev

# รัน tests
npm test

# รัน database migration
npx prisma migrate dev
```

### API Testing Tools
- **Postman Collection**: [Download](./postman/SCG-Notification-API.json)
- **Thunder Client**: [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)
- **curl Examples**: ดูในแต่ละไฟล์ API docs

## 📚 หน้าที่เกี่ยวข้อง

### สำหรับ Frontend Developers
- [Timeline API Integration](./timeline-api.md#frontend-integration)
- [Authentication Flow](./auth-api.md#frontend-authentication)
- [Error Handling](./error-handling.md)

### สำหรับ Backend Developers
- [Database Schema](./database-schema.md)
- [Middleware Documentation](./middleware.md)
- [Testing Guidelines](./testing.md)

### สำหรับ DevOps/SysAdmin
- [Deployment Guide](./deployment.md)
- [Environment Configuration](./environment.md)
- [Monitoring & Logging](./monitoring.md)

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย
1. **Authentication Errors** - ดู [Auth API Guide](./auth-api.md#troubleshooting)
2. **Permission Denied** - ตรวจสอบ user roles และ permissions
3. **Database Connection** - ตรวจสอบ DATABASE_URL ใน .env
4. **CORS Issues** - ตรวจสอบ origin ใน development mode

### ติดต่อสนับสนุน
- 📧 Email: dev-team@scg.com
- 💬 Slack: #scg-notification-dev
- 🐛 Issues: [GitHub Issues](https://github.com/scg/notification-system/issues)

## 📝 Changelog

### v1.0.0 (Latest)
- ✅ Timeline API with cursor pagination
- ✅ Mobile API endpoints
- ✅ Enhanced security logging
- ✅ Improved error handling

### v0.9.0
- ✅ Notification system
- ✅ Approval workflows
- ✅ Basic authentication
- ✅ Dashboard metrics

---

*เอกสารนี้อัปเดตล่าสุด: 30 พฤษภาคม 2025*