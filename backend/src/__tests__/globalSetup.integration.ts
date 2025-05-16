import { config } from 'dotenv'
import path from 'path'
import { prisma } from '../prisma'

// Global setup before running integration tests
export default async function globalSetup() {
  // Load test environment variables
  config({
    path: path.resolve(process.cwd(), '.env.test')
  })

  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('Integration tests must use a test database! Please check .env.test configuration.')
  }

  // Reset database to clean state
  await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`
  await prisma.$executeRaw`CREATE SCHEMA public`

  // Run migrations
  const { execSync } = require('child_process')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })

  // Create test admin user
  await prisma.user.create({
    data: {
      email: 'test-admin@example.com',
      passwordHash: 'password123', // Note: In production this would be hashed
      role: 'ADMIN',
      status: 'ACTIVE',
      employeeProfile: {
        create: {
          companyCode: 'TEST',
          employeeCode: 'TEST-ADMIN',
          firstName: 'Test',
          lastName: 'Admin'
        }
      }
    }
  })
}
