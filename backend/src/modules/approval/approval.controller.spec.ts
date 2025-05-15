import request from 'supertest'
import {prisma } from '../../prisma'
import app from '../../server'

describe('Approval Controller Integration Tests', () => {
  let token: string
  let notificationId: string

  beforeAll(async () => {
    // Seed a user and login to obtain JWT token
    const email = 'test-user@example.com'
    const password = 'password123'
    // 1. Create a test user and profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password, // assume pre-hashed or accept plain for test
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        employeeProfile: {
          create: {
            companyCode: 'TEST',
            employeeCode: 'TEST-001',
            firstName: 'Test',
            lastName: 'User',
          }
        }
      },
      include: { employeeProfile: true }
    })

    // 2. Login to get JWT
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
    token = loginRes.body.token

    // 3. Create a notification for testing
    const notiRes = await request(app)
      .post('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Notification',
        message: 'Integration test',
        scheduledAt: new Date().toISOString(),
        type: 'TODO',
        category: 'Test',
        link: 'https://example.com',
        recipients: [{ type: 'USER', userId: user.id }],
      })
    notificationId = notiRes.body.id
  })

  afterAll(async () => {
    // Cleanup test data
    await prisma.approval.deleteMany({ where: {} })
    await prisma.notification.deleteMany({ where: {} })
    await prisma.user.deleteMany({ where: {} })
    await prisma.$disconnect()
  })

  it('should return empty approvals array initially', async () => {
    const res = await request(app)
      .get(`/api/notifications/${notificationId}/approvals`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('should create a new approval', async () => {
    const res = await request(app)
      .post(`/api/notifications/${notificationId}/approvals`)
      .set('Authorization', `Bearer ${token}`)
      .send({ response: 'APPROVED', comment: 'Looks good' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.response).toBe('APPROVED')
    expect(res.body.comment).toBe('Looks good')
  })

  it('should list the newly created approval', async () => {
    const res = await request(app)
      .get(`/api/notifications/${notificationId}/approvals`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({ response: 'APPROVED', comment: 'Looks good' })
  })
})
