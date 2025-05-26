import { describe, it, expect, beforeEach } from '@jest/globals'
import { loginAs, cleanDb, testClient } from '../../__tests__/setup.integration'
import { prisma } from '../../prisma'

describe('Employee Integration Tests', () => {
  let adminToken: string
  let employeeToken: string

  beforeEach(async () => {
    await cleanDb()
    adminToken = await loginAs('ADMIN')
    employeeToken = await loginAs('EMPLOYEE')
  })

  describe('GET /api/employees/search', () => {
    beforeEach(async () => {
      // Create test employees
      await prisma.employeeProfile.createMany({
        data: [
          {
            employeeCode: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            companyCode: 'SCG',
            userId: 'user-1'
          },
          {
            employeeCode: 'EMP002',
            firstName: 'Jane',
            lastName: 'Smith',
            companyCode: 'SCG',
            userId: 'user-2'
          },
          {
            employeeCode: 'EMP003',
            firstName: 'Bob',
            lastName: 'Johnson',
            companyCode: 'OTHER',
            userId: 'user-3'
          }
        ]
      })
    })

    it('should search employees by name', async () => {
      const response = await testClient
        .get('/api/employees/search?q=john')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        employeeCode: 'EMP001',
        firstName: 'John'
      })
    })

    it('should search employees by employee code', async () => {
      const response = await testClient
        .get('/api/employees/search?q=EMP002')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        employeeCode: 'EMP002',
        firstName: 'Jane'
      })
    })

    it('should filter by company code', async () => {
      const response = await testClient
        .get('/api/employees/search?companyCode=SCG')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body.every((emp: any) => emp.companyCode === 'SCG')).toBe(true)
    })

    it('should require authentication', async () => {
      const response = await testClient
        .get('/api/employees/search?q=john')

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/employees/:id', () => {
    let testEmployee: any

    beforeEach(async () => {
      testEmployee = await prisma.employeeProfile.create({
        data: {
          employeeCode: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          companyCode: 'SCG',
          userId: 'user-1'
        }
      })
    })

    it('should get employee details', async () => {
      const response = await testClient
        .get(`/api/employees/${testEmployee.id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        employeeCode: 'EMP001',
        firstName: 'John',
        lastName: 'Doe'
      })
    })

    it('should return 404 for non-existent employee', async () => {
      const response = await testClient
        .get('/api/employees/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(404)
    })
  })
})
