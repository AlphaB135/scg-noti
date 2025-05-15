import { describe, it, expect, jest, beforeEach } from 'jest'
import { prisma } from '../../prisma'
import * as dashboardService from '../dashboard/dashboard.service'

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getOverview', () => {
    it('should return company statistics', async () => {
      // Mock data
      const mockCompanies = [
        { companyCode: 'SCG', _count: { userId: 10 } }
      ]
      const mockNotifications = [
        { companyCode: 'SCG', _count: { id: 5 } }
      ]
      const mockApprovals = [
        { companyCode: 'SCG', _count: { id: 3 } }
      ]

      // Setup mocks
      jest.spyOn(prisma.employeeProfile, 'groupBy').mockResolvedValue(mockCompanies)
      jest.spyOn(prisma.notification, 'groupBy').mockResolvedValue(mockNotifications)
      jest.spyOn(prisma.approval, 'groupBy').mockResolvedValue(mockApprovals)

      // Execute
      const result = await dashboardService.getOverview({})

      // Assert
      expect(result).toEqual([{
        companyCode: 'SCG',
        userCount: 10,
        notificationCount: 5,
        pendingApprovalCount: 3
      }])
    })
  })

  describe('getMetrics', () => {
    it('should return metrics for the last N days', async () => {
      const days = 7
      const today = new Date()
      const mockNotifications = Array.from({ length: days }, (_, i) => ({
        createdDate: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        _count: { id: i + 1 }
      }))
      const mockApprovals = Array.from({ length: days }, (_, i) => ({
        createdDate: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        _count: { id: i + 2 }
      }))

      // Setup mocks
      jest.spyOn(prisma.notification, 'groupBy').mockResolvedValue(mockNotifications)
      jest.spyOn(prisma.approval, 'groupBy').mockResolvedValue(mockApprovals)

      // Execute
      const result = await dashboardService.getMetrics({ days })

      // Assert
      expect(result).toHaveProperty('notifications')
      expect(result).toHaveProperty('approvals')
      expect(result.notifications).toHaveLength(days)
      expect(result.approvals).toHaveLength(days)
    })
  })
})
