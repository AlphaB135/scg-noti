# 🔒 Security Logs API Documentation

Security logging and audit trail system for monitoring user actions and system access.

## Base URL
```
/api/security-logs
```

## 🔐 Authentication & Authorization
- **Required**: Admin or security officer role
- **Headers**: `Authorization: Bearer <jwt_token>`

---

## 📋 Security Log Endpoints

### GET `/api/security-logs`
Retrieve security logs for audit and monitoring purposes.

**Authorization**: Admin or Security Officer

**Response**: Array of security log entries ordered by most recent

#### Response Schema
```typescript
interface SecurityLog {
  id: string                    // Unique log entry ID
  userId: string                // User ID who performed the action
  action: string                // Type of action performed
  ipAddress: string             // IP address of the request
  userAgent: string             // Browser/client user agent
  createdAt: string             // Timestamp when action occurred
}

type Response = SecurityLog[]
```

#### Common Action Types
```typescript
type SecurityAction = 
  | 'LOGIN_SUCCESS'           // Successful user login
  | 'LOGIN_FAILURE'           // Failed login attempt
  | 'LOGOUT'                  // User logout
  | 'PASSWORD_CHANGE'         // Password modification
  | 'PERMISSION_DENIED'       // Access denied to resource
  | 'ACCOUNT_LOCKED'          // Account locked due to failed attempts
  | 'ACCOUNT_UNLOCKED'        // Account unlocked by admin
  | 'DATA_ACCESS'             // Sensitive data accessed
  | 'DATA_EXPORT'             // Data exported/downloaded
  | 'ADMIN_ACTION'            // Administrative action performed
  | 'API_KEY_GENERATED'       // API key created
  | 'API_KEY_REVOKED'         // API key revoked
  | 'SETTINGS_CHANGED'        // System settings modified
```

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/security-logs" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Example Response
```json
[
  {
    "id": "log_123e4567-e89b-12d3-a456-426614174000",
    "userId": "f1c1fc83-ae57-4119-99b8-e1bd12a15bf3",
    "action": "LOGIN_SUCCESS",
    "ipAddress": "192.168.1.137",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "createdAt": "2025-05-30T15:10:48.300Z"
  },
  {
    "id": "log_456e7890-e89b-12d3-a456-426614174001",
    "userId": "f1c1fc83-ae57-4119-99b8-e1bd12a15bf3",
    "action": "LOGIN_FAILURE",
    "ipAddress": "192.168.1.200",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "createdAt": "2025-05-30T13:45:22.150Z"
  },
  {
    "id": "log_789e1234-e89b-12d3-a456-426614174002",
    "userId": "a2b3fc83-ae57-4119-99b8-e1bd12a15bf4",
    "action": "DATA_EXPORT",
    "ipAddress": "10.0.0.25",
    "userAgent": "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)",
    "createdAt": "2025-05-30T12:30:15.800Z"
  }
]
```

#### Error Responses
```json
// 401 Unauthorized
{
  "error": "Access denied. Authentication required."
}

// 403 Forbidden
{
  "error": "Insufficient privileges. Admin or security officer role required."
}

// 500 Internal Server Error
{
  "error": "Failed to fetch security logs"
}
```

---

## 🔍 Query Parameters (Future Enhancement)

While the current implementation doesn't support filtering, these parameters could be added:

```typescript
interface SecurityLogQuery {
  page?: number           // Page number for pagination
  limit?: number          // Number of records per page
  userId?: string         // Filter by specific user
  action?: string         // Filter by action type
  startDate?: string      // Filter logs after this date
  endDate?: string        // Filter logs before this date
  ipAddress?: string      // Filter by IP address
  orderBy?: 'createdAt' | 'action'  // Sort field
  order?: 'asc' | 'desc'  // Sort direction
}
```

---

## 🛡️ Security Considerations

### Data Privacy
- IP addresses are logged for security monitoring
- User agents help detect suspicious activity
- No sensitive data (passwords, tokens) is logged

### Access Control
```typescript
// Middleware example for security logs access
const requireSecurityAccess = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  if (!user || !['ADMIN', 'SECURITY_OFFICER', 'SUPER_ADMIN'].includes(user.role)) {
    return res.status(403).json({ error: 'Insufficient privileges' })
  }
  next()
}
```

### Retention Policy
- Security logs should be retained for compliance requirements
- Consider automated archival of logs older than 1 year
- Implement log rotation to manage storage

---

## 📊 Analytics Use Cases

### Failed Login Detection
```javascript
// Detect multiple failed login attempts
const failedLogins = logs
  .filter(log => log.action === 'LOGIN_FAILURE')
  .reduce((acc, log) => {
    acc[log.userId] = (acc[log.userId] || 0) + 1
    return acc
  }, {})

// Alert on users with >5 failed attempts
Object.entries(failedLogins)
  .filter(([_, count]) => count > 5)
  .forEach(([userId, count]) => {
    console.warn(`User ${userId} has ${count} failed login attempts`)
  })
```

### IP Address Monitoring
```javascript
// Track unusual IP addresses
const ipFrequency = logs.reduce((acc, log) => {
  acc[log.ipAddress] = (acc[log.ipAddress] || 0) + 1
  return acc
}, {})

// Detect IPs with high activity
const suspiciousIPs = Object.entries(ipFrequency)
  .filter(([_, count]) => count > 100)
  .map(([ip]) => ip)
```

### Time-based Analysis
```javascript
// Activity by hour of day
const hourlyActivity = logs.reduce((acc, log) => {
  const hour = new Date(log.createdAt).getHours()
  acc[hour] = (acc[hour] || 0) + 1
  return acc
}, {})

// Detect unusual activity patterns
const offHoursActivity = Object.entries(hourlyActivity)
  .filter(([hour, count]) => 
    (parseInt(hour) < 6 || parseInt(hour) > 22) && count > 10
  )
```

---

## 🔄 Automatic Log Generation

Security logs are automatically created by middleware:

```typescript
// Middleware for automatic security logging
export const securityLogger = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send
  
  res.send = function(data) {
    // Log security-relevant actions
    if (shouldLogAction(req.path, req.method, res.statusCode)) {
      createSecurityLog({
        userId: req.user?.id,
        action: determineAction(req.path, req.method, res.statusCode),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      })
    }
    
    return originalSend.call(this, data)
  }
  
  next()
}

// Determine if action should be logged
const shouldLogAction = (path: string, method: string, statusCode: number): boolean => {
  return (
    path.includes('/auth/') ||           // Authentication endpoints
    path.includes('/admin/') ||          // Admin actions
    statusCode === 401 ||                // Unauthorized attempts
    statusCode === 403 ||                // Forbidden access
    method === 'DELETE' ||               // Deletion operations
    path.includes('/export/')            // Data exports
  )
}
```

---

## 📈 Monitoring Dashboard Integration

### Real-time Security Alerts
```javascript
// WebSocket endpoint for real-time security monitoring
const securityEvents = new EventSource('/api/security-logs/stream')

securityEvents.onmessage = (event) => {
  const log = JSON.parse(event.data)
  
  // Alert on critical security events
  if (['LOGIN_FAILURE', 'PERMISSION_DENIED', 'ACCOUNT_LOCKED'].includes(log.action)) {
    showSecurityAlert(log)
  }
}
```

### Security Metrics
```javascript
// Calculate security metrics
const getSecurityMetrics = (logs) => {
  const last24Hours = logs.filter(log => 
    new Date(log.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )
  
  return {
    totalEvents: last24Hours.length,
    failedLogins: last24Hours.filter(l => l.action === 'LOGIN_FAILURE').length,
    uniqueUsers: new Set(last24Hours.map(l => l.userId)).size,
    uniqueIPs: new Set(last24Hours.map(l => l.ipAddress)).size,
    criticalEvents: last24Hours.filter(l => 
      ['ACCOUNT_LOCKED', 'PERMISSION_DENIED'].includes(l.action)
    ).length
  }
}
```

---

## 🧪 Testing

### Unit Test Example
```typescript
describe('Security Logs API', () => {
  test('GET /api/security-logs returns logs for admin', async () => {
    const response = await request(app)
      .get('/api/security-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body[0]).toHaveProperty('id')
    expect(response.body[0]).toHaveProperty('userId')
    expect(response.body[0]).toHaveProperty('action')
    expect(response.body[0]).toHaveProperty('ipAddress')
    expect(response.body[0]).toHaveProperty('createdAt')
  })
  
  test('denies access to non-admin users', async () => {
    await request(app)
      .get('/api/security-logs')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403)
  })
})
```

### Integration Test
```bash
# Test security logs endpoint
curl -X GET "http://localhost:3001/api/security-logs" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  | jq '. | length'

# Test unauthorized access
curl -X GET "http://localhost:3001/api/security-logs" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  | jq '.error'
```

---

## 🔧 Database Schema

```sql
-- Security Log table structure
CREATE TABLE SecurityLog (
    id          UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId      UNIQUEIDENTIFIER NOT NULL,
    action      VARCHAR(20) NOT NULL,
    ipAddress   VARCHAR(45) NOT NULL,
    userAgent   NVARCHAR(255) NOT NULL,
    createdAt   DATETIME2 DEFAULT SYSUTCDATETIME(),
    
    FOREIGN KEY (userId) REFERENCES [User](id),
    INDEX SecurityLog_userId_createdAt_idx (userId, createdAt),
    INDEX SecurityLog_action_idx (action),
    INDEX SecurityLog_ipAddress_idx (ipAddress)
)
```

---

## 📚 Related Documentation
- [Admin API](./admin-api.md) - Administrative functions
- [Authentication API](./auth-api.md) - Login/logout security
- [Authorization](./authorization.md) - Role-based permissions
- [Audit Logs API](./audit-logs-api.md) - General system audit trail
