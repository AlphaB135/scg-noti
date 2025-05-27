// frontend/src/lib/team-api.ts
import axios from 'axios';
import { Team, TeamMember, Employee } from '@/components/types/team';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Cache the API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

const teamApi = {
  /**
   * Get all teams
   * @returns Promise<Team[]>
   */
  getTeams: async (): Promise<Team[]> => {
    const cacheKey = 'teams';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get('/api/teams');
      const teamsData = response.data.data ? response.data.data : response.data;
      
      // Ensure the response is formatted as an array
      const teams = Array.isArray(teamsData) ? teamsData : [];
      
      cache.set(cacheKey, { data: teams, timestamp: Date.now() });
      return teams;
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      throw error;
    }
  },

  /**
   * Get team by ID
   * @param teamId The ID of the team
   * @returns Promise<Team>
   */
  getTeamById: async (teamId: string): Promise<Team> => {
    const cacheKey = `team-${teamId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get(`/api/teams/${teamId}`);
      const team = response.data.data ? response.data.data : response.data;
      
      cache.set(cacheKey, { data: team, timestamp: Date.now() });
      return team;
    } catch (error) {
      console.error(`Failed to fetch team ${teamId}:`, error);
      throw error;
    }
  },

  /**
   * Get team members
   * @param teamId The ID of the team
   * @returns Promise<TeamMember[]>
   */
  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    const cacheKey = `team-${teamId}-members`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get(`/api/teams/${teamId}/members`);
      const membersData = response.data.data ? response.data.data : response.data;
      
      // Ensure the response is formatted as an array
      const members = Array.isArray(membersData) ? membersData : [];
      
      cache.set(cacheKey, { data: members, timestamp: Date.now() });
      return members;
    } catch (error) {
      console.error(`Failed to fetch members for team ${teamId}:`, error);
      throw error;
    }
  },

  /**
   * Add team member
   * @param teamId The ID of the team
   * @param memberId The ID of the employee to add
   * @param isLeader Whether the employee should be added as a leader
   * @returns Promise<TeamMember>
   */
  addTeamMember: async (teamId: string, memberId: string, role: string = 'พนักงาน'): Promise<TeamMember> => {
    try {
      const isLeader = role === 'หัวหน้างาน';
      
      const response = await axios.post(`/api/teams/${teamId}/members`, {
        employeeId: memberId,
        isLeader,
        role
      });
      
      // Invalidate team cache
      cache.delete(`team-${teamId}`);
      cache.delete(`team-${teamId}-members`);
      cache.delete('teams');
      
      return response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Failed to add member ${memberId} to team ${teamId}:`, error);
      throw error;
    }
  },

  /**
   * Remove team member
   * @param teamId The ID of the team
   * @param memberId The ID of the member to remove
   * @returns Promise<void>
   */
  removeTeamMember: async (teamId: string, memberId: string): Promise<void> => {
    try {
      await axios.delete(`/api/teams/${teamId}/members/${memberId}`);
      
      // Invalidate team cache
      cache.delete(`team-${teamId}`);
      cache.delete(`team-${teamId}-members`);
      cache.delete('teams');
    } catch (error) {
      console.error(`Failed to remove member ${memberId} from team ${teamId}:`, error);
      throw error;
    }
  },

  /**
   * Leave team (remove current user from team)
   * @param teamId The ID of the team
   * @param userId The ID of the current user
   * @returns Promise<void>
   */
  leaveTeam: async (teamId: string, userId: string): Promise<void> => {
    try {
      await axios.delete(`/api/teams/${teamId}/members/${userId}`);
      
      // Invalidate team cache
      cache.delete(`team-${teamId}`);
      cache.delete(`team-${teamId}-members`);
      cache.delete('teams');
    } catch (error) {
      console.error(`Failed to leave team ${teamId}:`, error);
      throw error;
    }
  },

  /**
   * Get available employees to add to team
   * @returns Promise<Employee[]>
   */
  getAvailableEmployees: async (teamId: string): Promise<Employee[]> => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/available-employees`);
      const employeesData = response.data.data ? response.data.data : response.data;
      
      // Ensure the response is formatted as an array
      return Array.isArray(employeesData) ? employeesData : [];
    } catch (error) {
      console.error('Failed to fetch available employees:', error);
      
      // If the endpoint doesn't exist (likely in development), return empty array
      return [];
    }
  }
};

export default teamApi;
