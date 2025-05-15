import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { prisma } from '../../../prisma'
import type { Request, Response, NextFunction } from 'express'

// Mock Prisma client
jest.mock('../../../prisma', () => ({
  prisma: {
    notification: {
      count: jest.fn(),
      groupBy: jest.fn()
    },
    approval: {
      count: jest.fn(),
      groupBy: jest.fn()
    },
    user: {
      count: jest.fn()
    },
    securityLog: {
      findMany: jest.fn()
    }
  }
}))

describe('Dashboard Routes', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {}
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    }
    mockNext = jest.fn()
    jest.clearAllMocks()
  })

  describe('GET /dashboard/overview', () => {
    it('should return dashboard overview statistics', async () => {
      // Mock data
      const mockNotifCounts = [10, 5, 3] // total, pending, approved
      const mockApprovalCounts = [8, 4, 2] // total, pending, completed
      const mockUserCounts = [20, 15] // total, active
      const mockRecentActivity = [
        { id: '1', action: 'LOGIN', createdAt: new Date() }
      ]

      // Setup mocks
      const notifCountMock = prisma.notification.count as jest.Mock
      notifCountMock
        .mockResolvedValueOnce(mockNotifCounts[0])
        .mockResolvedValueOnce(mockNotifCounts[1])
        .mockResolvedValueOnce(mockNotifCounts[2])

      const approvalCountMock = prisma.approval.count as jest.Mock
      approvalCountMock
        .mockResolvedValueOnce(mockApprovalCounts[0])
        .mockResolvedValueOnce(mockApprovalCounts[1])
        .mockResolvedValueOnce(mockApprovalCounts[2])

      const userCountMock = prisma.user.count as jest.Mock
      userCountMock
        .mockResolvedValueOnce(mockUserCounts[0])
        .mockResolvedValueOnce(mockUserCounts[1])

      ;(prisma.securityLog.findMany as jest.Mock).mockResolvedValue(mockRecentActivity)

      // Import route handler
      const { default: router } = require('../routes/dashboard')
      const handler = router.stack.find((layer: any) => 
        layer.route?.path === '/overview'
      ).route.stack[2].handle

      // Execute
      await handler(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        notifications: {
          total: mockNotifCounts[0],
          pending: mockNotifCounts[1],
          approved: mockNotifCounts[2],
          approvedPercentage: 30 // 3/10 * 100
        },
        approvals: {
          total: mockApprovalCounts[0],
          pending: mockApprovalCounts[1],
          completed: mockApprovalCounts[2],
          completedPercentage: 25 // 2/8 * 100
        },
        users: {
          total: mockUserCounts[0],
          active: mockUserCounts[1],
          activePercentage: 75 // 15/20 * 100
        },
        recentActivity: mockRecentActivity
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle errors properly', async () => {
      // Setup mock to throw error
      const error = new Error('Database error')
      ;(prisma.notification.count as jest.Mock).mockRejectedValue(error)

      // Import route handler
      const { default: router } = require('../routes/dashboard')
      const handler = router.stack.find((layer: any) => 
        layer.route?.path === '/overview'
      ).route.stack[2].handle

      // Execute
      await handler(mockReq, mockRes, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe('GET /dashboard/metrics', () => {
    it('should return metrics for the last 7 days', async () => {
      // Mock data
      const today = new Date()
      const mockNotifications = Array.from({ length: 7 }, (_, i) => ({
        createdAt: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        _count: i + 1
      }))
      const mockApprovals = Array.from({ length: 7 }, (_, i) => ({
        createdAt: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
        _count: i + 2
      }))

      // Setup mocks
      ;(prisma.notification.groupBy as jest.Mock).mockResolvedValue(mockNotifications)
      ;(prisma.approval.groupBy as jest.Mock).mockResolvedValue(mockApprovals)

      // Import route handler
      const { default: router } = require('../routes/dashboard')
      const handler = router.stack.find((layer: any) => 
        layer.route?.path === '/metrics'
      ).route.stack[2].handle

      // Execute
      await handler(mockReq, mockRes, mockNext)

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        notifications: mockNotifications.map(n => ({
          date: n.createdAt,
          count: n._count
        })),
        approvals: mockApprovals.map(a => ({
          date: a.createdAt,
          count: a._count
        }))
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle errors properly', async () => {
      // Setup mock to throw error
      const error = new Error('Database error')
      ;(prisma.notification.groupBy as jest.Mock).mockRejectedValue(error)

      // Import route handler
      const { default: router } = require('../routes/dashboard')
      const handler = router.stack.find((layer: any) => 
        layer.route?.path === '/metrics'
      ).route.stack[2].handle

      // Execute
      await handler(mockReq, mockRes, mockNext)

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })
})
