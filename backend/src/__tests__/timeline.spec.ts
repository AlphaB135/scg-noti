// backend/tests/timeline.spec.ts

import request from 'supertest';
import { app } from '@/server';
import { prisma } from '@/config/prismaClient';
import { loginHelper } from './helpers';

describe('Timeline API', () => {
  let authCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    // สร้าง test user และ login
    const testUser = await prisma.user.create({
      data: {
        email: 'timeline-test@example.com',
        passwordHash: 'hashedpassword123',
        role: 'USER',
        status: 'ACTIVE',
        employeeProfile: {
          create: {
            companyCode: 'TEST',
            employeeCode: 'TEST001',
            firstName: 'Timeline',
            lastName: 'Tester'
          }
        }
      }
    });
    testUserId = testUser.id;

    // Login และได้ JWT cookie
    authCookie = await loginHelper('timeline-test@example.com', 'password123');
  });

  afterAll(async () => {
    // ลบ test data
    await prisma.user.delete({
      where: { id: testUserId }
    });
  });

  describe('GET /api/timeline', () => {
    beforeEach(async () => {
      // สร้าง test notifications และ approvals
      await prisma.notification.create({
        data: {
          title: 'Test Notification',
          message: 'Test message',
          status: 'PENDING',
          type: 'REMINDER',
          createdBy: testUserId,
          recipients: {
            create: {
              type: 'USER',
              userId: testUserId
            }
          }
        }
      });
    });

    afterEach(async () => {
      // ลบ test data หลังแต่ละ test
      await prisma.recipient.deleteMany({
        where: { userId: testUserId }
      });
      await prisma.approval.deleteMany({
        where: { userId: testUserId }
      });
      await prisma.notification.deleteMany({
        where: { createdBy: testUserId }
      });
    });

    it('should return timeline events for authenticated user', async () => {
      const response = await request(app)
        .get('/api/timeline')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(response.body).toHaveProperty('nextCursor');
      expect(response.body).toHaveProperty('hasMore');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events.length).toBeGreaterThan(0);

      // ตรวจสอบ structure ของ event
      const event = response.body.events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('status');
      expect(event).toHaveProperty('createdAt');
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/timeline?limit=5')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.events.length).toBeLessThanOrEqual(5);
    });

    it('should filter by types parameter', async () => {
      const response = await request(app)
        .get('/api/timeline?types=notification')
        .set('Cookie', authCookie)
        .expect(200);

      // ทุก event ควรเป็น notification type
      response.body.events.forEach((event: any) => {
        expect(event.type).toBe('notification');
      });
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/timeline')
        .expect(401);
    });

    it('should handle invalid cursor gracefully', async () => {
      await request(app)
        .get('/api/timeline?cursor=invalid-cursor')
        .set('Cookie', authCookie)
        .expect(400);
    });
  });
});
