import { describe, it, expect, beforeEach } from '@jest/globals'
import { loginAs, cleanDb, testClient } from '../../__tests__/setup.integration'
import { prisma } from '../../prisma'

describe('Notification and Approval Integration Tests', () => {
  let adminToken: string
  let employeeToken: string
  let testNotification: any

  beforeEach(async () => {
    await cleanDb()
    adminToken = await loginAs('ADMIN')
    employeeToken = await loginAs('EMPLOYEE')

    // Create test notification
    testNotification = await prisma.notification.create({
      data: {
        title: 'Test Notification',
        content: 'Test content',
        status: 'PENDING',
        createdById: 'test-admin',
        recipientType: 'ALL'
      }
    })
  })

  describe('POST /api/notifications', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        title: 'New Notification',
        content: 'Test notification content',
        recipientType: 'ALL',
        priority: 'HIGH'
      }

      const response = await testClient
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject(notificationData)
    })

    it('should validate notification data', async () => {
      const response = await testClient
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: '' }) // Missing required fields

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/notifications', () => {
    it('should list notifications with filters', async () => {
      const response = await testClient
        .get('/api/notifications')
        .query({
          status: 'PENDING',
          priority: 'HIGH'
        })
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.notifications)).toBe(true)
      expect(response.body).toHaveProperty('total')
    })

    it('should support pagination', async () => {
      // Create multiple notifications
      await prisma.notification.createMany({
        data: Array(15).fill(0).map((_, i) => ({
          title: `Test Notification ${i}`,
          content: 'Test content',
          status: 'PENDING',
          createdById: 'test-admin',
          recipientType: 'ALL'
        }))
      })

      const response = await testClient
        .get('/api/notifications')
        .query({
          page: 1,
          limit: 10
        })
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.notifications).toHaveLength(10)
      expect(response.body.total).toBeGreaterThan(10)
    })
  })

  describe('POST /api/notifications/:id/approvals', () => {
    it('should create an approval for notification', async () => {
      const approvalData = {
        decision: 'APPROVED',
        comment: 'Test approval'
      }

      const response = await testClient
        .post(`/api/notifications/${testNotification.id}/approvals`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(approvalData)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(approvalData)
    })

    it('should update notification status on approval', async () => {
      await testClient
        .post(`/api/notifications/${testNotification.id}/approvals`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          decision: 'APPROVED',
          comment: 'Approved'
        })

      // Verify notification status was updated
      const notification = await prisma.notification.findUnique({
        where: { id: testNotification.id }
      })
      expect(notification?.status).toBe('APPROVED')
    })
  })

  describe('GET /api/notifications/:id/approvals', () => {
    it('should list approval history', async () => {
      // Create multiple approvals
      await prisma.approval.createMany({
        data: [
          {
            notificationId: testNotification.id,
            userId: 'test-admin',
            decision: 'APPROVED',
            comment: 'First approval'
          },
          {
            notificationId: testNotification.id,
            userId: 'test-admin',
            decision: 'REJECTED',
            comment: 'Second approval'
          }
        ]
      })

      const response = await testClient
        .get(`/api/notifications/${testNotification.id}/approvals`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('decision')
      expect(response.body[0]).toHaveProperty('comment')
    })
  })
})
