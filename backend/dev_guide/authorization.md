# 🔐 Authorization & Permissions Documentation

Role-based access control (RBAC) system for the SCG Notification platform.

## 🏗️ Authorization Architecture

### Role Hierarchy
```
SUPER_ADMIN (Highest privileges)
    ↓
ADMIN (Company-wide management)
    ↓
TEAM_LEADER (Team management)
    ↓
EMPLOYEE (Basic access)
    ↓
GUEST (Read-only limited access)
```

---

## 🎭 User Roles & Permissions

### SUPER_ADMIN
- **System-wide management**
- **Cross-company operations**
- **Security & audit access**

```typescript
interface SuperAdminPermissions {
  // System Management
  systemSettings: ['READ', 'WRITE', 'DELETE']
  userManagement: ['READ', 'WRITE', 'DELETE', 'IMPERSONATE']
  companyManagement: ['READ', 'WRITE', 'DELETE']
  
  // Security & Monitoring
  securityLogs: ['READ', 'EXPORT']
  auditLogs: ['READ', 'EXPORT', 'DELETE']
  systemMetrics: ['READ', 'EXPORT']
  
  // Data Management
  dataExport: ['ALL_COMPANIES']
  dataImport: ['ALL_COMPANIES']
  backupRestore: ['FULL_SYSTEM']
}
```

**Available Endpoints:**
- All admin endpoints
- Cross-company analytics
- System configuration
- User impersonation
- Security audit trails

### ADMIN
- **Company-specific management**
- **Employee & team oversight**
- **Notification system control**

```typescript
interface AdminPermissions {
  // Company Management
  employees: ['READ', 'WRITE', 'DELETE']
  teams: ['READ', 'WRITE', 'DELETE']
  notifications: ['READ', 'WRITE', 'DELETE', 'APPROVE']
  
  // Analytics & Reporting
  companyMetrics: ['READ', 'EXPORT']
  userActivity: ['READ']
  approvalMetrics: ['READ']
  
  // Administrative
  companySettings: ['READ', 'WRITE']
  integrations: ['READ', 'WRITE']
}
```

**Available Endpoints:**
- `/api/admin/*` - Administrative functions
- `/api/employees/*` - Employee management
- `/api/teams/*` - Team management
- `/api/notifications/*` - Full notification control
- `/api/dashboard/*` - Company analytics

### TEAM_LEADER
- **Team member management**
- **Team notifications**
- **Approval workflows**

```typescript
interface TeamLeaderPermissions {
  // Team Management
  teamMembers: ['READ', 'WRITE']
  teamNotifications: ['READ', 'WRITE', 'DELETE']
  teamMetrics: ['READ']
  
  // Approval System
  approvals: ['READ', 'WRITE', 'APPROVE', 'REJECT']
  approvalHistory: ['READ']
  
  // Limited Employee Access
  teamEmployeeProfiles: ['READ', 'WRITE']
}
```

**Available Endpoints:**
- `/api/teams/:teamId/*` - Own team management
- `/api/notifications/*` - Team notifications
- `/api/approvals/*` - Approval workflows
- `/api/employees/*` - Team member profiles

### EMPLOYEE
- **Personal notifications**
- **Basic team participation**
- **Own profile management**

```typescript
interface EmployeePermissions {
  // Personal Data
  ownProfile: ['READ', 'WRITE']
  ownNotifications: ['READ']
  ownApprovals: ['READ', 'WRITE']
  
  // Team Participation
  teamInfo: ['READ']
  teamNotifications: ['READ']
  
  // Basic System Access
  dashboard: ['READ']
  timeline: ['READ']
}
```

**Available Endpoints:**
- `/api/notifications/mine` - Personal notifications
- `/api/users/profile` - Own profile
- `/api/approvals/*` - Personal approvals
- `/api/dashboard/overview` - Basic dashboard
- `/api/timeline` - Personal timeline

### GUEST
- **Read-only access**
- **Limited system visibility**

```typescript
interface GuestPermissions {
  // Very Limited Access
  publicNotifications: ['READ']
  basicInfo: ['READ']
}
```

**Available Endpoints:**
- `/api/notifications/public` - Public notifications only
- `/api/dashboard/public` - Public dashboard info

---

## 🛡️ Permission Middleware

### Role-Based Access Control
```typescript
/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient privileges',
        required: allowedRoles,
        current: user.role
      })
    }
    
    next()
  }
}

// Usage examples
router.get('/admin/overview', requireRole(['ADMIN', 'SUPER_ADMIN']), getOverview)
router.post('/teams', requireRole(['TEAM_LEADER', 'ADMIN', 'SUPER_ADMIN']), createTeam)
router.get('/notifications/mine', requireRole(['EMPLOYEE', 'TEAM_LEADER', 'ADMIN', 'SUPER_ADMIN']), getMyNotifications)
```

### Resource-Based Permissions
```typescript
/**
 * Check if user can access specific resource
 */
export const requireResourceAccess = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const resourceId = req.params.id
    
    try {
      const hasAccess = await checkResourcePermission(user.id, user.role, resourceType, resourceId)
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this resource' })
      }
      
      next()
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' })
    }
  }
}

/**
 * Check specific resource permissions
 */
const checkResourcePermission = async (userId: string, userRole: string, resourceType: string, resourceId: string): Promise<boolean> => {
  switch (resourceType) {
    case 'team':
      return await canAccessTeam(userId, userRole, resourceId)
    
    case 'notification':
      return await canAccessNotification(userId, userRole, resourceId)
    
    case 'employee':
      return await canAccessEmployee(userId, userRole, resourceId)
    
    default:
      return false
  }
}
```

### Company-Scoped Access
```typescript
/**
 * Ensure user can only access data from their company
 */
export const requireCompanyScope = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  
  // Super admins can access all companies
  if (user.role === 'SUPER_ADMIN') {
    return next()
  }
  
  try {
    const userProfile = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
      select: { companyCode: true }
    })
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' })
    }
    
    // Add company context to request
    req.userCompany = userProfile.companyCode
    next()
    
  } catch (error) {
    res.status(500).json({ error: 'Company scope check failed' })
  }
}
```

---

## 🔄 Dynamic Permission Checking

### Permission Helper Functions
```typescript
class PermissionChecker {
  /**
   * Check if user can perform action on resource
   */
  static async can(userId: string, action: string, resource: string, resourceId?: string): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) return false
    
    // Check role-based permissions
    if (!this.roleHasPermission(user.role, action, resource)) {
      return false
    }
    
    // Check resource-specific permissions
    if (resourceId) {
      return await this.hasResourceAccess(user, resource, resourceId)
    }
    
    return true
  }
  
  /**
   * Check role-based permissions
   */
  static roleHasPermission(role: string, action: string, resource: string): boolean {
    const permissions = this.getRolePermissions(role)
    return permissions[resource]?.includes(action) || false
  }
  
  /**
   * Get role permissions mapping
   */
  static getRolePermissions(role: string): Record<string, string[]> {
    const permissions = {
      SUPER_ADMIN: {
        all: ['READ', 'WRITE', 'DELETE', 'ADMIN'],
      },
      ADMIN: {
        employees: ['READ', 'WRITE', 'DELETE'],
        teams: ['READ', 'WRITE', 'DELETE'],
        notifications: ['READ', 'WRITE', 'DELETE', 'APPROVE'],
        analytics: ['READ', 'EXPORT'],
      },
      TEAM_LEADER: {
        teams: ['READ', 'WRITE'],
        notifications: ['READ', 'WRITE'],
        approvals: ['READ', 'WRITE', 'APPROVE'],
        employees: ['READ'],
      },
      EMPLOYEE: {
        notifications: ['READ'],
        profile: ['READ', 'WRITE'],
        approvals: ['READ', 'WRITE'],
      }
    }
    
    return permissions[role] || {}
  }
}
```

### Usage in Controllers
```typescript
// Example: Team controller with permission checking
export const updateTeam = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId = req.user.id
  
  // Check if user can update this team
  const canUpdate = await PermissionChecker.can(userId, 'WRITE', 'team', id)
  
  if (!canUpdate) {
    return res.status(403).json({ error: 'Cannot update this team' })
  }
  
  // Proceed with update...
}
```

---

## 🎯 Endpoint Permission Matrix

### Authentication API (`/api/auth/*`)
| Endpoint | GUEST | EMPLOYEE | TEAM_LEADER | ADMIN | SUPER_ADMIN |
|----------|-------|----------|-------------|-------|-------------|
| POST `/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST `/logout` | ❌ | ✅ | ✅ | ✅ | ✅ |
| GET `/me` | ❌ | ✅ | ✅ | ✅ | ✅ |

### Notifications API (`/api/notifications/*`)
| Endpoint | GUEST | EMPLOYEE | TEAM_LEADER | ADMIN | SUPER_ADMIN |
|----------|-------|----------|-------------|-------|-------------|
| GET `/` | ❌ | ✅* | ✅* | ✅ | ✅ |
| GET `/mine` | ❌ | ✅ | ✅ | ✅ | ✅ |
| POST `/` | ❌ | ❌ | ✅* | ✅ | ✅ |
| PUT `/:id` | ❌ | ❌ | ✅* | ✅ | ✅ |
| DELETE `/:id` | ❌ | ❌ | ✅* | ✅ | ✅ |

*\* = Limited to own team/company*

### Teams API (`/api/teams/*`)
| Endpoint | GUEST | EMPLOYEE | TEAM_LEADER | ADMIN | SUPER_ADMIN |
|----------|-------|----------|-------------|-------|-------------|
| GET `/` | ❌ | ✅* | ✅* | ✅ | ✅ |
| POST `/` | ❌ | ❌ | ✅ | ✅ | ✅ |
| PUT `/:id` | ❌ | ❌ | ✅* | ✅ | ✅ |
| DELETE `/:id` | ❌ | ❌ | ❌ | ✅ | ✅ |

### Admin API (`/api/admin/*`)
| Endpoint | GUEST | EMPLOYEE | TEAM_LEADER | ADMIN | SUPER_ADMIN |
|----------|-------|----------|-------------|-------|-------------|
| GET `/overview` | ❌ | ❌ | ❌ | ✅* | ✅ |

*\* = Company-scoped data only*

---

## 🔒 Security Best Practices

### Token Validation
```typescript
export const validateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Check token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Token expired' })
    }
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, status: true }
    })
    
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Invalid user account' })
    }
    
    req.user = { id: user.id, role: user.role }
    next()
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Rate Limiting by Role
```typescript
export const createRoleBasedRateLimit = (role: string) => {
  const limits = {
    GUEST: { windowMs: 15 * 60 * 1000, max: 10 },      // 10 requests per 15 minutes
    EMPLOYEE: { windowMs: 15 * 60 * 1000, max: 100 },   // 100 requests per 15 minutes
    TEAM_LEADER: { windowMs: 15 * 60 * 1000, max: 200 }, // 200 requests per 15 minutes
    ADMIN: { windowMs: 15 * 60 * 1000, max: 500 },      // 500 requests per 15 minutes
    SUPER_ADMIN: { windowMs: 15 * 60 * 1000, max: 1000 } // 1000 requests per 15 minutes
  }
  
  return rateLimit(limits[role] || limits.GUEST)
}
```

---

## 🧪 Testing Authorization

### Unit Tests
```typescript
describe('Authorization Middleware', () => {
  test('requireRole allows admin access', async () => {
    const req = { user: { id: 'user1', role: 'ADMIN' } }
    const res = {}
    const next = jest.fn()
    
    requireRole(['ADMIN'])(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })
  
  test('requireRole denies employee access to admin endpoint', async () => {
    const req = { user: { id: 'user1', role: 'EMPLOYEE' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    
    requireRole(['ADMIN'])(req, res, next)
    
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })
})
```

### Integration Tests
```bash
# Test different role access levels
curl -X GET "http://localhost:3001/api/admin/overview" \
  -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
  | jq '.error'
# Expected: "Insufficient privileges"

curl -X GET "http://localhost:3001/api/admin/overview" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  | jq '.companyCode'
# Expected: Company data
```

---

## 📚 Related Documentation
- [Authentication API](./auth-api.md) - Login and JWT token management
- [Security Logs API](./security-logs-api.md) - Audit trail for access attempts
- [Admin API](./admin-api.md) - Administrative endpoints
- [Error Handling](./error-handling.md) - Permission error responses
