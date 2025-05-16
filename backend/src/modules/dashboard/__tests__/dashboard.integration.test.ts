import { describe, it, expect, beforeEach } from '@jest/globals'
import { loginAs, cleanDb, testClient } from '../../__tests__/setup.integration'
import { prisma } from '../../prisma'

describe('Dashboard Integration Tests', () => {
  let adminToken: string

  beforeEach(async () => {
    await cleanDb()
    adminToken = await loginAs('ADMIN')
  })

  describe('GET /api/dashboard/overview', () => {
    it('should return dashboard overview statistics', async () => {
      // Create test data
      await prisma.notification.createMany({
        data: [
          {
            id: 'notif-1',
            title: 'Test Notification 1',
            content: 'Test content',
            status: 'PENDING',
            createdById: 'test-admin',
            recipientType: 'ALL'
          },
          {
            id: 'notif-2',
            title: 'Test Notification 2',
            content: 'Test content',
            status: 'APPROVED',
            createdById: 'test-admin',
            recipientType: 'ALL'
          }
        ]
      })

      // Test request
      const response = await testClient
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${adminToken}`)

      // Assertions
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        notifications: {
          total: 2,
          pending: 1,
          approved: 1
        }
      })
    })

    it('should require authentication', async () => {
      const response = await testClient
        .get('/api/dashboard/overview')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/dashboard/metrics', () => {
    it('should return time-based metrics', async () => {
      // Create test notifications across different days
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      await prisma.notification.createMany({
        data: [
          {
            id: 'notif-today-1',
            title: 'Today Notification 1',
            content: 'Test content',
            status: 'PENDING',
            createdById: 'test-admin',
            recipientType: 'ALL',
            createdAt: today
          },
          {
            id: 'notif-yesterday-1',
            title: 'Yesterday Notification 1',
            content: 'Test content',
            status: 'APPROVED',
            createdById: 'test-admin',
            recipientType: 'ALL',
            createdAt: yesterday
          }
        ]
      })

      // Test request with days parameter
      const response = await testClient
        .get('/api/dashboard/metrics?days=7')
        .set('Authorization', `Bearer ${adminToken}`)

      // Assertions
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('notifications')
      expect(response.body).toHaveProperty('approvals')
      expect(response.body.notifications).toHaveLength(7)
      
      // Verify today's count
      const todayMetrics = response.body.notifications.find(
        (m: any) => new Date(m.date).toDateString() === today.toDateString()
      )
      expect(todayMetrics.count).toBe(1)
    })

    it('should handle invalid days parameter', async () => {
      const response = await testClient
        .get('/api/dashboard/metrics?days=invalid')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(400)
    })
  })
})
