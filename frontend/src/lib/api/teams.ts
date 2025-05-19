// teams.ts
import api from '../real-api'
import type { Team } from '@/components/types/team'
// Using the shared API client from real-api.ts

// API Types
interface TeamResponse {
  id: string
  name: string
  members: {
    id: string
    user: {
      id: string,
      employeeProfile: {
        firstName: string
        lastName: string
        department: string
        position: string
        email: string
      }
    }
    role: 'TEAM_LEAD' | 'MEMBER'
  }[]
}

// Transform backend response to frontend Team type
const transformTeamResponse = (team: TeamResponse): Team => ({
  id: team.id,
  name: team.name,
  members: team.members.map(member => ({
    id: member.user.id,
    membershipId: member.id,
    name: `${member.user.employeeProfile.firstName} ${member.user.employeeProfile.lastName}`,
    department: member.user.employeeProfile.department,
    position: member.user.employeeProfile.position,
    email: member.user.employeeProfile.email,
    isLeader: member.role === 'TEAM_LEAD',
    permissionLevel: member.role === 'TEAM_LEAD' ? 'leader' : 'member',
    role: member.role === 'TEAM_LEAD' ? 'หัวหน้างาน' : 'พนักงาน'
  }))
})

export const teamsApi = {
  // List all teams
  list: () => 
    api.get<{ data: TeamResponse[] }>('/teams').then(r => ({ 
      data: r.data.data.map(transformTeamResponse)
    })),

  // Get team by ID
  get: (id: string) =>
    api.get<TeamResponse>(`/teams/${id}`).then(r => transformTeamResponse(r.data)),

  // Create new team
  create: (data: { name: string }) =>
    api.post<TeamResponse>('/teams', data).then(r => transformTeamResponse(r.data)),

  // Update team
  update: (id: string, data: { name: string }) =>
    api.put<TeamResponse>(`/teams/${id}`, data).then(r => transformTeamResponse(r.data)),

  // Delete team
  delete: (id: string) =>
    api.delete<void>(`/teams/${id}`),

  // Add member to team
  addMember: (teamId: string, employeeId: string, isLeader: boolean) =>
    api.post<TeamResponse>(`/teams/${teamId}/members`, { employeeId, role: isLeader ? 'TEAM_LEAD' : 'MEMBER' }).then(r => transformTeamResponse(r.data)),

  // Remove member from team  
  removeMember: (teamId: string, memberId: string) =>
    api.delete(`/teams/${teamId}/members/${memberId}`),
}
