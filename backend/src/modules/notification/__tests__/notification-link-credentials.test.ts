import * as notificationService from '../notification.service'
import { prisma } from '../../../prisma'

// Override the imported functions to avoid relying on external modules
const originalCreate = notificationService.create;
const originalUpdate = notificationService.update;

// Mock the notification model and LINE service
jest.mock('../../../prisma', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn()
    },
    recipient: {
      findMany: jest.fn().mockResolvedValue([])
    },
    teamMember: {
      findMany: jest.fn().mockResolvedValue([])
    },
    employeeProfile: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}))

jest.mock('../../../integrations/line.service', () => ({
  pushMessageWithRetry: jest.fn()
}))

describe('Notification Service with Link Credentials', () => {
  const mockData = {
    title: 'Test Notification',
    message: 'This is a test message',
    type: 'SYSTEM',
    category: 'TEST',
    link: 'https://example.com/login',
    linkUsername: 'testuser',
    linkPassword: 'password123',
    urgencyDays: 0,
    repeatIntervalDays: 0,
    scheduledAt: new Date(),
    recipients: [{ type: 'ALL' }],
    createdBy: 'admin-1'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create()', () => {
    it('should create notification with linkUsername and linkPassword fields', async () => {
      // Mock the create function to return the notification with link credentials
      const mockNotification = {
        ...mockData,
        id: 'notification-1',
        recipients: []
      }
      
      // @ts-ignore - we're using mocks
      prisma.notification.create.mockResolvedValue(mockNotification)

      // Execute the create function
      const notification = await create(mockData)

      // Assert correct data was passed to create
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: mockData.title,
          message: mockData.message,
          link: mockData.link,
          linkUsername: mockData.linkUsername,
          linkPassword: mockData.linkPassword
        })
      })

      // Assert the returned notification has the correct fields
      expect(notification).toMatchObject({
        id: 'notification-1',
        title: mockData.title,
        link: mockData.link,
        linkUsername: mockData.linkUsername,
        linkPassword: mockData.linkPassword
      })
    })
  })

  describe('update()', () => {
    it('should update notification with linkUsername and linkPassword fields', async () => {
      const mockId = 'notification-1'
      const updateData = {
        title: 'Updated Title',
        linkUsername: 'updateduser',
        linkPassword: 'newpassword123'
      }
      
      // Mock the update function to return updated notification
      const mockUpdatedNotification = {
        ...mockData,
        ...updateData,
        id: mockId,
        recipients: []
      }
      
      // @ts-ignore - we're using mocks
      prisma.notification.update.mockResolvedValue(mockUpdatedNotification)

      // Execute the update function
      const updatedNotification = await update(mockId, updateData)

      // Assert correct data was passed to update
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: mockId },
        data: expect.objectContaining({
          title: updateData.title,
          linkUsername: updateData.linkUsername,
          linkPassword: updateData.linkPassword
        })
      })

      // Assert the returned notification has the updated fields
      expect(updatedNotification).toMatchObject({
        id: mockId,
        title: updateData.title,
        linkUsername: updateData.linkUsername,
        linkPassword: updateData.linkPassword
      })
    })
  })
})
