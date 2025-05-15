import { describe, it, expect, jest, beforeEach } from 'jest'
import { prisma } from '../../prisma'
import * as mobileService from '../mobile/mobile.service'

describe('Mobile Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getBoxes', () => {
    it('should return dashboard box counts', async () => {
      // Setup mocks
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(5)
      jest.spyOn(prisma.approval, 'count').mockResolvedValue(3)
      jest.spyOn(prisma.teamNotification, 'count').mockResolvedValue(2)

      // Execute
      const result = await mobileService.getBoxes({ companyCode: 'SCG' })

      // Assert
      expect(result).toEqual({
        notifications: 5,
        approvals: 3,
        teamUpdates: 2
      })
    })
  })

  describe('getCalendar', () => {
    it('should return calendar events for the specified month', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Test Event',
          dueDate: new Date(),
          status: 'PENDING',
          priority: 'HIGH'
        }
      ]

      // Setup mock
      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue(mockEvents)

      // Execute
      const result = await mobileService.getCalendar({ 
        companyCode: 'SCG',
        month: 5,
        year: 2025
      })

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('type', 'notification')
    })
  })

  describe('getNotificationSettings', () => {
    it('should return user notification settings', async () => {
      const mockSettings = {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        digestFreq: 'DAILY',
        quietStart: '22:00',
        quietEnd: '07:00'
      }

      // Setup mock
      jest.spyOn(prisma.notificationSettings, 'findUnique').mockResolvedValue(mockSettings)

      // Execute
      const result = await mobileService.getNotificationSettings('user-1')

      // Assert
      expect(result).toEqual(mockSettings)
    })

    it('should return default settings if none exist', async () => {
      // Setup mock
      jest.spyOn(prisma.notificationSettings, 'findUnique').mockResolvedValue(null)

      // Execute
      const result = await mobileService.getNotificationSettings('user-1')

      // Assert
      expect(result).toHaveProperty('emailEnabled', true)
      expect(result).toHaveProperty('pushEnabled', true)
      expect(result).toHaveProperty('smsEnabled', false)
    })
  })

  describe('updateNotificationSettings', () => {
    it('should update user notification settings', async () => {
      const newSettings = {
        emailEnabled: false,
        pushEnabled: true,
        smsEnabled: true,
        digestFreq: 'WEEKLY',
        quietStart: '23:00',
        quietEnd: '06:00'
      }

      // Setup mock
      jest.spyOn(prisma.notificationSettings, 'upsert').mockResolvedValue({
        id: 'settings-1',
        userId: 'user-1',
        ...newSettings
      })

      // Execute
      const result = await mobileService.updateNotificationSettings('user-1', newSettings)

      // Assert
      expect(result).toHaveProperty('userId', 'user-1')
      expect(result).toMatchObject(newSettings)
    })
  })
})
