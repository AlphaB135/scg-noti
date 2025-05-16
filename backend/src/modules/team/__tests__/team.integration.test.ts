import { describe, it, expect, beforeEach } from '@jest/globals'
import { loginAs, cleanDb, testClient } from '../../__tests__/setup.integration'
import { prisma } from '../../prisma'

describe('Team Integration Tests', () => {
  let adminToken: string
  let teamLeadToken: string
  let memberToken: string
  let testTeam: any

  beforeEach(async () => {
    await cleanDb()
    adminToken = await loginAs('ADMIN')
    teamLeadToken = await loginAs('TEAM_LEAD')
    memberToken = await loginAs('EMPLOYEE')

    // Create a test team
    testTeam = await prisma.team.create({
      data: {
        name: 'Test Team',
        description: 'A team for testing',
        companyCode: 'TEST'
      }
    })
  })

  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      const teamData = {
        name: 'New Team',
        description: 'A new test team',
        companyCode: 'TEST'
      }

      const response = await testClient
        .post('/api/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teamData)

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject(teamData)
    })

    it('should require admin role', async () => {
      const response = await testClient
        .post('/api/teams')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ name: 'New Team' })

      expect(response.status).toBe(403)
    })
  })

  describe('PUT /api/teams/:id', () => {
    it('should update team details', async () => {
      const updateData = {
        name: 'Updated Team Name',
        description: 'Updated description'
      }

      const response = await testClient
        .put(`/api/teams/${testTeam.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(updateData)
    })

    it('should allow team lead to update their team', async () => {
      // Add team lead to team
      await prisma.teamMember.create({
        data: {
          teamId: testTeam.id,
          userId: 'test-team-lead',
          role: 'TEAM_LEAD'
        }
      })

      const response = await testClient
        .put(`/api/teams/${testTeam.id}`)
        .set('Authorization', `Bearer ${teamLeadToken}`)
        .send({ name: 'Lead Updated Name' })

      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/teams/:id/members', () => {
    it('should add members to team', async () => {
      const members = [
        { userId: 'test-employee', role: 'MEMBER' },
        { userId: 'test-team-lead', role: 'TEAM_LEAD' }
      ]

      const response = await testClient
        .post(`/api/teams/${testTeam.id}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ members })

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
    })

    it('should validate member roles', async () => {
      const response = await testClient
        .post(`/api/teams/${testTeam.id}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          members: [{ userId: 'test-employee', role: 'INVALID_ROLE' }]
        })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/teams/:id/members/:userId', () => {
    it('should remove a member from team', async () => {
      // First add a member
      await prisma.teamMember.create({
        data: {
          teamId: testTeam.id,
          userId: 'test-employee',
          role: 'MEMBER'
        }
      })

      const response = await testClient
        .delete(`/api/teams/${testTeam.id}/members/test-employee`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(204)

      // Verify member was removed
      const member = await prisma.teamMember.findFirst({
        where: {
          teamId: testTeam.id,
          userId: 'test-employee'
        }
      })
      expect(member).toBeNull()
    })
  })
})
