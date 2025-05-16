import { jest, afterEach } from '@jest/globals'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'
import { app } from '../server'
import supertest from 'supertest'

// Make supertest client available globally
export const testClient = supertest(app)

// Utility function for authentication
export async function loginAs(role: 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE') {
  const userId = `test-${role.toLowerCase()}`
  const email = `${role.toLowerCase()}@test.com`
  const password = 'password123'

  // Create test user if it doesn't exist
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: userId,
      email,
      passwordHash: password, // Note: In production this would be hashed
      role,
      status: 'ACTIVE',
      employeeProfile: {
        create: {
          companyCode: 'TEST',
          employeeCode: `TEST-${role}`,
          firstName: 'Test',
          lastName: role
        }
      }
    }
  })

  // Create or update test session
  await prisma.session.upsert({
    where: { id: `test-session-${userId}` },
    update: {
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    create: {
      id: `test-session-${userId}`,
      userId: user.id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  })

  // Login and get token
  const response = await testClient
    .post('/api/auth/login')
    .send({ email, password })

  return response.body.token
}

// Clean up database between tests
export async function cleanDb() {
  try {
    // Get all table names except _prisma_migrations
    const tablenames = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE table_schema = 'dbo'
      AND table_name != '_prisma_migrations'
    `

    // Disable referential integrity
    await prisma.$executeRaw`EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"`

    // Truncate all tables
    for (const { table_name } of tablenames) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE [${table_name}]`)
    }

    // Re-enable referential integrity
    await prisma.$executeRaw`EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"`
  } catch (error) {
    console.error('Error cleaning database:', error)
  }
}

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
