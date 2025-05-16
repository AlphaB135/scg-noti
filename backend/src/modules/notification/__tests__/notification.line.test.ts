import { jest } from '@jest/globals'
import { pushMessage } from '../../../integrations/line.service'
import { create, createMany } from '../notification.service'
import { prisma } from '../../../prisma'

// Mock LINE service
jest.mock('../../../integrations/line.service', () => ({
  pushMessage: jest.fn(),
  pushMessageWithRetry: jest.fn()
}))

describe('Notification Service - LINE Integration', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'EMPLOYEE'
  }

  const mockEmployee = {
    userId: mockUser.id,
    lineToken: 'line-token-1',
    employeeCode: 'E001',
    firstName: 'John',
    lastName: 'Doe'
  }

  beforeEach(async () => {
    // Clear database
    await prisma.notification.deleteMany()
    await prisma.employeeProfile.deleteMany()
    await prisma.user.deleteMany()

    // Create test user and profile
    await prisma.user.create({
      data: {
        ...mockUser,
        passwordHash: 'hash',
        employeeProfile: {
          create: mockEmployee
        }
      }
    })

    // Clear mocks
    jest.clearAllMocks()
  })

  describe('create()', () => {
    it('should send LINE notification for SYSTEM type', async () => {
      const notification = await create({
        title: 'Test System Notification',
        message: 'This is a test',
        type: 'SYSTEM',
        category: 'TEST',
        link: 'https://example.com',
        urgencyDays: 0,
        repeatIntervalDays: 0,
        scheduledAt: new Date(),
        recipients: [{ type: 'USER', userId: mockUser.id }],
        createdBy: 'admin-1'
      })

      expect(pushMessage).toHaveBeenCalledWith(
        mockEmployee.lineToken,
        `[SYSTEM] Test System Notification\nThis is a test`
      )

      const savedNotification = await prisma.notification.findUnique({
        where: { id: notification.id },
        include: { recipients: true }
      })

      expect(savedNotification).toBeTruthy()
      expect(savedNotification?.recipients).toHaveLength(1)
      expect(savedNotification?.recipients[0].userId).toBe(mockUser.id)
    })

    it('should send LINE notification for TODO type', async () => {
      const notification = await create({
        title: 'Test Todo',
        message: 'Please complete this task',
        type: 'TODO',
        category: 'TEST',
        link: 'https://example.com',
        urgencyDays: 1,
        repeatIntervalDays: 0,
        scheduledAt: new Date(),
        recipients: [{ type: 'USER', userId: mockUser.id }],
        createdBy: 'admin-1'
      })

      expect(pushMessage).toHaveBeenCalledWith(
        mockEmployee.lineToken,
        `[TODO] Test Todo\nPlease complete this task`
      )
    })

    it('should not send LINE notification for REMINDER type', async () => {
      await create({
        title: 'Test Reminder',
        message: 'This is a reminder',
        type: 'REMINDER',
        category: 'TEST',
        link: 'https://example.com',
        urgencyDays: 0,
        repeatIntervalDays: 0,
        scheduledAt: new Date(),
        recipients: [{ type: 'USER', userId: mockUser.id }],
        createdBy: 'admin-1'
      })

      expect(pushMessage).not.toHaveBeenCalled()
    })
  })

  describe('createMany()', () => {
    it('should send LINE notifications only for SYSTEM and TODO types', async () => {
      const notifications = await createMany([
        {
          title: 'Test System',
          message: 'System message',
          type: 'SYSTEM',
          category: 'TEST',
          link: 'https://example.com',
          urgencyDays: 0,
          repeatIntervalDays: 0,
          scheduledAt: new Date(),
          recipients: [{ type: 'USER', userId: mockUser.id }],
          createdBy: 'admin-1'
        },
        {
          title: 'Test Todo',
          message: 'Todo message',
          type: 'TODO',
          category: 'TEST',
          link: 'https://example.com',
          urgencyDays: 0,
          repeatIntervalDays: 0,
          scheduledAt: new Date(),
          recipients: [{ type: 'USER', userId: mockUser.id }],
          createdBy: 'admin-1'
        },
        {
          title: 'Test Reminder',
          message: 'Reminder message',
          type: 'REMINDER',
          category: 'TEST',
          link: 'https://example.com',
          urgencyDays: 0,
          repeatIntervalDays: 0,
          scheduledAt: new Date(),
          recipients: [{ type: 'USER', userId: mockUser.id }],
          createdBy: 'admin-1'
        }
      ])

      expect(notifications).toHaveLength(3)
      expect(pushMessage).toHaveBeenCalledTimes(2)
      expect(pushMessage).toHaveBeenCalledWith(
        mockEmployee.lineToken,
        `[SYSTEM] Test System\nSystem message`
      )
      expect(pushMessage).toHaveBeenCalledWith(
        mockEmployee.lineToken,
        `[TODO] Test Todo\nTodo message`
      )

      const savedNotifications = await prisma.notification.findMany({
        include: { recipients: true }
      })
      expect(savedNotifications).toHaveLength(3)
    })
  })
})
