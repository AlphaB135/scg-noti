# 🔐 Authentication API

คู่มือการใช้งาน Authentication API สำหรับระบบ SCG Notification

## ภาพรวม

Authentication API ใช้สำหรับการจัดการการเข้าสู่ระบบ, การยืนยันตัวตน, และการจัดการ session ของผู้ใช้งาน ระบบใช้ JWT (JSON Web Tokens) สำหรับการยืนยันตัวตน

## Base URL
```
/api/auth
```

## Endpoints

### 1. เข้าสู่ระบบ (Login)

**POST** `/api/auth/login`

เข้าสู่ระบบด้วย username และ password

#### Request Body
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": false
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "username": "john.doe",
      "email": "john.doe@scg.com",
      "role": "USER",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "department": "IT",
        "position": "Developer"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "refreshToken": "refresh_token_here"
  }
}
```

#### Response (401 - Invalid Credentials)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Username หรือ Password ไม่ถูกต้อง"
  }
}
```

#### ตัวอย่างการใช้งาน
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "password123",
    "rememberMe": true
  }'
```

### 2. ออกจากระบบ (Logout)

**POST** `/api/auth/logout`

ออกจากระบบและยกเลิก JWT token

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 - Success)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### ตัวอย่างการใช้งาน
```bash
curl -X POST "http://localhost:3001/api/auth/logout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 3. ข้อมูลผู้ใช้ปัจจุบัน (Current User)

**GET** `/api/auth/me`

ดึงข้อมูลของผู้ใช้ที่ล็อกอินอยู่

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "username": "john.doe",
    "email": "john.doe@scg.com",
    "role": "USER",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "department": "IT",
      "position": "Developer",
      "avatar": "https://cdn.scg.com/avatars/john.jpg"
    },
    "permissions": [
      "notifications:read",
      "notifications:create",
      "approvals:respond"
    ],
    "lastLoginAt": "2025-05-30T10:00:00.000Z",
    "createdAt": "2025-01-15T08:30:00.000Z"
  }
}
```

#### ตัวอย่างการใช้งาน
```bash
curl -X GET "http://localhost:3001/api/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### 4. รีเฟรช Token (Refresh Token)

**POST** `/api/auth/refresh`

รีเฟรช JWT token ที่หมดอายุ

#### Request Body
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "expiresIn": 3600,
    "refreshToken": "new_refresh_token_here"
  }
}
```

### 5. เปลี่ยนรหัสผ่าน (Change Password)

**POST** `/api/auth/change-password`

เปลี่ยนรหัสผ่านของผู้ใช้ปัจจุบัน

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

#### Response (200 - Success)
```json
{
  "success": true,
  "message": "รหัสผ่านถูกเปลี่ยนแล้ว"
}
```

## JWT Token Structure

### Payload
```json
{
  "sub": "user_123",
  "username": "john.doe",
  "role": "USER",
  "iat": 1622547200,
  "exp": 1622550800
}
```

### Token Expiration
- **Access Token**: 1 ชั่วโมง (3600 วินาที)
- **Refresh Token**: 30 วัน
- **Remember Me**: 90 วัน

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Username หรือ Password ไม่ถูกต้อง |
| `TOKEN_EXPIRED` | 401 | JWT token หมดอายุ |
| `INVALID_TOKEN` | 401 | JWT token ไม่ถูกต้อง |
| `TOKEN_REQUIRED` | 401 | ไม่มี Authorization header |
| `USER_DISABLED` | 403 | บัญชีผู้ใช้ถูกระงับ |
| `WEAK_PASSWORD` | 400 | รหัสผ่านไม่ปลอดภัย |
| `PASSWORD_MISMATCH` | 400 | รหัสผ่านไม่ตรงกัน |

## Frontend Integration

### React Example

```typescript
// lib/auth.ts
import axios from 'axios';

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expiresIn: number;
    refreshToken: string;
  };
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.setupAxiosInterceptors();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post('/api/auth/login', credentials);
    
    if (response.data.success) {
      this.setTokens(
        response.data.data.token,
        response.data.data.refreshToken
      );
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await axios.post('/api/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    const response = await axios.get('/api/auth/me');
    return response.data;
  }

  private setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  private setupAxiosInterceptors() {
    // Request interceptor
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            const response = await axios.post('/api/auth/refresh', {
              refreshToken: this.refreshToken
            });
            
            this.setTokens(
              response.data.data.token,
              response.data.data.refreshToken
            );
            
            // Retry original request
            error.config.headers.Authorization = `Bearer ${this.token}`;
            return axios.request(error.config);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();
```

### Login Form Component

```typescript
// components/LoginForm.tsx
import React, { useState } from 'react';
import { authService } from '../lib/auth';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(credentials);
      if (response.success) {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={credentials.username}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            username: e.target.value
          }))}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            password: e.target.value
          }))}
          required
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={credentials.rememberMe}
            onChange={(e) => setCredentials(prev => ({
              ...prev,
              rememberMe: e.target.checked
            }))}
          />
          จดจำการเข้าสู่ระบบ
        </label>
      </div>

      {error && (
        <div className="text-red-500">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded"
      >
        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  );
};
```

## Security Best Practices

### 1. Token Storage
- ใช้ `httpOnly` cookies สำหรับ production
- หลีกเลี่ยงการเก็บ sensitive data ใน localStorage
- ใช้ secure flag สำหรับ HTTPS

### 2. Password Requirements
- ความยาวขั้นต่ำ 8 ตัวอักษร
- ต้องมีตัวพิมพ์เล็ก, ใหญ่, และตัวเลข
- ไม่ใช้รหัสผ่านที่ใช้แล้วใน 5 ครั้งล่าสุด

### 3. Rate Limiting
- Login attempts: 5 ครั้งต่อ 15 นาที
- Password change: 3 ครั้งต่อชั่วโมง
- Token refresh: 10 ครั้งต่อนาที

## Troubleshooting

### 1. Token Expired Error
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "JWT token has expired"
  }
}
```
**วิธีแก้ไข**: ใช้ refresh token หรือ login ใหม่

### 2. Invalid Token Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token format"
  }
}
```
**วิธีแก้ไข**: ตรวจสอบ Authorization header format: `Bearer <token>`

### 3. User Not Found
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```
**วิธีแก้ไข**: ตรวจสอบ username และติดต่อผู้ดูแลระบบ

## Testing

### Unit Tests
```bash
npm test -- auth.spec.ts
```

### Manual Testing
```bash
# Login
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'

# Get current user
curl -X GET "http://localhost:3001/api/auth/me" \
  -H "Authorization: Bearer <token>"

# Logout
curl -X POST "http://localhost:3001/api/auth/logout" \
  -H "Authorization: Bearer <token>"
```

---

*เอกสารนี้อัปเดตล่าสุด: 30 พฤษภาคม 2025*