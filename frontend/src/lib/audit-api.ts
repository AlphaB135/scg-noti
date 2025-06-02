import { simulateApiDelay } from "./mock-data"

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  action: "READ" | "WRITE" | "DELETE" | "LOGIN" | "LOGOUT" | "UPDATE"
  targetResource: string
  ipAddress: string
  userAgent: string
  sessionId: string
  statusCode: number
  details?: Record<string, any>
}

interface AuditLogResponse {
  logs: AuditLog[]
  totalPages: number
  totalLogs: number
}

interface AuditLogParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
  statusCode?: number
  ipAddress?: string
  resource?: string
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// Generate a random date within the last 30 days
const generateRecentDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  return date.toISOString()
}

// Mock user IDs
const userIds = ["user_admin1", "user_admin2", "user_superadmin", "user_support1", "user_manager1"]

// Mock IP addresses
const ipAddresses = ["192.168.1.1", "192.168.1.2", "10.0.0.1", "172.16.0.1", "127.0.0.1"]

// Mock user agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
]

// Mock target resources
const targetResources = [
  "/api/users/123",
  "/api/notifications",
  "/api/settings/security",
  "/api/reports/monthly",
  "/api/admin/users",
  "/api/admin/logs",
  "/api/integrations/slack",
  "salary:456",
  "document:789",
  "notification:abc123",
]

// Mock actions
const actions: AuditLog["action"][] = ["READ", "WRITE", "DELETE", "LOGIN", "LOGOUT", "UPDATE"]

// Mock status codes
const statusCodes = [200, 201, 204, 400, 401, 403, 404, 500]

// Generate mock audit logs
const generateMockAuditLogs = (count: number): AuditLog[] => {
  return Array.from({ length: count }).map(() => {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)]

    let details: Record<string, any> | undefined = undefined

    // Add details for some logs
    if (Math.random() > 0.7) {
      if (action === "LOGIN") {
        details = {
          success: statusCode < 400,
          method: Math.random() > 0.5 ? "password" : "sso",
          location: ["Bangkok, Thailand", "New York, USA", "London, UK"][Math.floor(Math.random() * 3)],
        }
      } else if (action === "WRITE" || action === "UPDATE") {
        details = {
          previousValues: {
            name: "Old Name",
            email: "old@example.com",
          },
          newValues: {
            name: "New Name",
            email: "new@example.com",
          },
          changedBy: userIds[Math.floor(Math.random() * userIds.length)],
        }
      }
    }

    return {
      id: generateId(),
      timestamp: generateRecentDate(),
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      action,
      targetResource: targetResources[Math.floor(Math.random() * targetResources.length)],
      ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      sessionId: `session_${generateId()}`,
      statusCode,
      details,
    }
  })
}

// Generate 100 mock audit logs
const mockAuditLogs = generateMockAuditLogs(100)

export const auditLogApi = {
  getLogs: async (params: AuditLogParams = {}): Promise<AuditLogResponse> => {
    await simulateApiDelay(800)

    const page = params.page || 1
    const limit = params.limit || 10

    // Apply filters if provided
    let filteredLogs = [...mockAuditLogs]

    if (params.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId.includes(params.userId!))
    }

    if (params.action) {
      filteredLogs = filteredLogs.filter((log) => log.action === params.action)
    }

    if (params.statusCode) {
      filteredLogs = filteredLogs.filter((log) => log.statusCode === params.statusCode)
    }

    if (params.ipAddress) {
      filteredLogs = filteredLogs.filter((log) => log.ipAddress.includes(params.ipAddress!))
    }

    if (params.resource) {
      filteredLogs = filteredLogs.filter((log) => log.targetResource.includes(params.resource!))
    }

    if (params.startDate) {
      const startDate = new Date(params.startDate)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= startDate)
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= endDate)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    return {
      logs: paginatedLogs,
      totalPages: Math.ceil(filteredLogs.length / limit),
      totalLogs: filteredLogs.length,
    }
  },

  exportLogs: async (params: AuditLogParams = {}): Promise<Blob> => {
    await simulateApiDelay(1500)

    // In a real implementation, this would generate a CSV or Excel file
    // For mock purposes, we'll just return a JSON blob
    const response = await auditLogApi.getLogs({
      ...params,
      page: 1,
      limit: 1000, // Export all logs
    })

    const blob = new Blob([JSON.stringify(response.logs, null, 2)], {
      type: "application/json",
    })

    return blob
  },
}
