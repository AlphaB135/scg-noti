# 🔧 Admin API Documentation

Administration endpoints for system management and company-wide analytics.

## Base URL
```
/api/admin
```

## 🔐 Authentication & Authorization
- **Required**: Admin role or higher permissions
- **Headers**: `Authorization: Bearer <jwt_token>`

---

## 📊 Overview

### GET `/api/admin/overview`
Get aggregated statistics for all companies in the system.

**Authorization**: Admin only

**Response**: Company overview statistics grouped by company code

#### Response Schema
```typescript
interface CompanyOverview {
  companyCode: string      // Company identifier (e.g., "SCG001")
  employeeCount: number    // Total employees in company
  teamCount: number        // Teams led by company employees
  notificationCount: number // Notifications created by company employees
  pendingApprovalCount: number // Pending approvals for company employees
}

type Response = CompanyOverview[]
```

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/admin/overview" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json"
```

#### Example Response
```json
[
  {
    "companyCode": "SCG001",
    "employeeCount": 150,
    "teamCount": 12,
    "notificationCount": 450,
    "pendingApprovalCount": 23
  },
  {
    "companyCode": "SCG002", 
    "employeeCount": 89,
    "teamCount": 7,
    "notificationCount": 267,
    "pendingApprovalCount": 11
  },
  {
    "companyCode": "TPI001",
    "employeeCount": 203,
    "teamCount": 18,
    "notificationCount": 892,
    "pendingApprovalCount": 34
  }
]
```

#### Error Responses
```json
// 401 Unauthorized
{
  "error": "Access denied. Admin role required."
}

// 500 Internal Server Error
{
  "error": "Failed to fetch admin overview"
}
```

---

## 📈 Use Cases

### System Health Monitoring
```javascript
// Monitor system-wide activity levels
const overview = await fetch('/api/admin/overview')
const data = await overview.json()

const totalEmployees = data.reduce((sum, company) => sum + company.employeeCount, 0)
const totalPending = data.reduce((sum, company) => sum + company.pendingApprovalCount, 0)

if (totalPending > totalEmployees * 0.1) {
  console.warn('High approval backlog detected')
}
```

### Company Performance Comparison
```javascript
// Compare notification activity across companies
const companiesData = await fetch('/api/admin/overview').then(r => r.json())

const notificationRates = companiesData.map(company => ({
  company: company.companyCode,
  notificationsPerEmployee: company.notificationCount / company.employeeCount,
  approvalBacklogRatio: company.pendingApprovalCount / company.employeeCount
}))

console.table(notificationRates)
```

### Resource Planning
```javascript
// Identify companies needing additional team leaders
const overview = await fetch('/api/admin/overview').then(r => r.json())

const teamsPerLeaderRatio = overview.map(company => ({
  companyCode: company.companyCode,
  employeesPerTeam: company.employeeCount / company.teamCount,
  needsMoreLeaders: (company.employeeCount / company.teamCount) > 15
}))
```

---

## 🔧 Database Relationships

The admin overview aggregates data from multiple tables:

```sql
-- Employee count by company
SELECT companyCode, COUNT(*) as employeeCount 
FROM EmployeeProfile 
GROUP BY companyCode

-- Team count by company (teams led by company employees)
SELECT ep.companyCode, COUNT(t.id) as teamCount
FROM Team t
JOIN EmployeeProfile ep ON t.leaderId = ep.userId
GROUP BY ep.companyCode

-- Notification count by company
SELECT ep.companyCode, COUNT(n.id) as notificationCount  
FROM Notification n
JOIN EmployeeProfile ep ON n.createdBy = ep.userId
GROUP BY ep.companyCode

-- Pending approval count by company
SELECT ep.companyCode, COUNT(a.id) as pendingApprovalCount
FROM Approval a
JOIN EmployeeProfile ep ON a.userId = ep.userId  
WHERE a.response = 'PENDING'
GROUP BY ep.companyCode
```

---

## ⚡ Performance Notes

- **Query Complexity**: Makes multiple database queries per company
- **Caching**: Consider implementing Redis caching for frequently accessed data
- **Optimization**: For large datasets, consider:
  - Database views for pre-aggregated statistics
  - Background jobs to update cached metrics
  - Pagination for companies with large employee counts

### Performance Monitoring
```javascript
// Track response times for admin overview
const startTime = Date.now()
const overview = await fetch('/api/admin/overview')
const endTime = Date.now()

if (endTime - startTime > 5000) {
  console.warn(`Admin overview took ${endTime - startTime}ms - consider optimization`)
}
```

---

## 🔒 Security Considerations

### Role-Based Access Control
```typescript
// Middleware checks admin permissions
if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
  return res.status(403).json({ error: 'Insufficient privileges' })
}
```

### Data Privacy
- Company statistics only (no individual employee data)
- Aggregated counts without personal information
- Audit logging for all admin data access

### Rate Limiting
```typescript
// Apply stricter rate limits for admin endpoints
app.use('/api/admin', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
}))
```

---

## 📝 Error Handling

### Common Error Scenarios
1. **Permission Denied**: Non-admin users accessing endpoints
2. **Database Connection**: Failed database queries
3. **Data Inconsistency**: Missing employee profiles or orphaned records

### Error Response Format
```typescript
interface ErrorResponse {
  error: string
  code?: string
  details?: any
}
```

---

## 🧪 Testing

### Unit Test Example
```typescript
describe('Admin Service', () => {
  test('getOverview returns company statistics', async () => {
    const result = await AdminService.getOverview()
    
    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty('companyCode')
    expect(result[0]).toHaveProperty('employeeCount')
    expect(result[0]).toHaveProperty('teamCount')
    expect(result[0]).toHaveProperty('notificationCount')
    expect(result[0]).toHaveProperty('pendingApprovalCount')
  })
})
```

### Integration Test Example
```bash
# Test admin overview endpoint
curl -X GET "http://localhost:3001/api/admin/overview" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  | jq '.[0] | keys'

# Expected output: ["companyCode", "employeeCount", "notificationCount", "pendingApprovalCount", "teamCount"]
```

---

## 📚 Related Documentation
- [Authentication API](./auth-api.md) - Admin login and permissions
- [Security Logs API](./security-logs-api.md) - Audit trail for admin actions
- [Dashboard API](./dashboard-api.md) - User-facing analytics
- [Users API](./users-api.md) - User management functions
